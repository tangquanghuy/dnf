(function () {
    'use strict';

    const SCRIPT_NAME = '楼层正文标签清理脚本';
    const LOADED_FLAG = '__楼层正文标签清理脚本_loaded__';
    const GLOBAL_API_NAME = '__fixMessageTagBlocks__';

    // 仅修改此处：兼容最新的 <think> 标签，确保能准确剥离思考域，定位到 <now_plot> 之前的部分
    const THINKING_CLOSE_RE = /<\/\s*(?:thinking|think)\s*>/i;
    
    const NOW_PLOT_TAG_RE = /<\s*\/?\s*now_plot\s*>/gi;
    const NOW_PLOT_TAG_TEST_RE = /<\s*\/?\s*now_plot\s*>/i;
    const INTERLEAVING_TAG_RE = /<\s*\/?\s*Interleaving\s*>/gi;
    const INTERLEAVING_TAG_TEST_RE = /<\s*\/?\s*Interleaving\s*>/i;
    const INTERLEAVING_CLOSE_RE = /<\s*\/\s*Interleaving\s*>/gi;
    const INTERLEAVING_CLOSE_TEST_RE = /<\s*\/\s*Interleaving\s*>/i;
    const SUMMARY_OPEN_RE = /<\s*summary\s*>/i;
    const UPDATE_OPEN_RE = /<\s*update\s*>/i;
    const BEAUTIFY_CARD_TAG_NAMES = [
        'pic',
        'DiceCombat',
        'DiceCheck',
        'EnemyOverview',
        'SummonOverview',
        'LootLog',
        'ExperienceLog',
        'QuestContract',
        'MerchantStore',
        'CombatSnapshot',
    ];

    const processingMessageIds = new Set();
    const listenerStops = [];

    function getRootWindow() {
        return window.parent || window;
    }

    function getStContext() {
        try {
            const topWindow = window.top;
            if (topWindow?.SillyTavern && typeof topWindow.SillyTavern.getContext === 'function') {
                return topWindow.SillyTavern.getContext();
            }
            if (topWindow?.context && Array.isArray(topWindow.context.chat)) {
                return topWindow.context;
            }
        } catch (_) {}
        return null;
    }

    function resolveContextChatTarget(messageId, wrapperRecord = null) {
        const context = getStContext();
        const chat = Array.isArray(context?.chat) ? context.chat : null;
        if (!chat || !chat.length) {
            return { context, chat, index: -1, record: null };
        }

        let index = -1;

        if (Number.isInteger(messageId) && messageId >= 0 && messageId < chat.length && chat[messageId]) {
            index = messageId;
        }

        if (index < 0) {
            index = chat.findIndex(item =>
                item?.message_id === messageId
                || item?.id === messageId
                || item?.extra?.message_id === messageId,
            );
        }

        if (index < 0) {
            try {
                const topDoc = window.top?.document;
                const messageElement = topDoc?.querySelector?.(`#chat .mes[mesid="${messageId}"]`);
                if (messageElement) {
                    const allMessageElements = Array.from(topDoc.querySelectorAll('#chat .mes'));
                    const domIndex = allMessageElements.indexOf(messageElement);
                    if (domIndex >= 0 && domIndex < chat.length) {
                        index = domIndex;
                    }
                }
            } catch (_) {}
        }

        if (index < 0 && wrapperRecord) {
            const wrapperText = getMessageText(wrapperRecord);
            index = chat.findIndex(item =>
                getMessageText(item) === wrapperText
                && (!wrapperRecord?.name || item?.name === wrapperRecord.name),
            );
        }

        return {
            context,
            chat,
            index,
            record: index >= 0 ? chat[index] : null,
        };
    }

    function findFirstMatch(text, regex) {
        const match = regex.exec(text);
        if (!match) return null;
        return {
            index: match.index,
            value: match[0],
        };
    }

    function findEarliestAnchorIndex(text) {
        const summaryMatch = findFirstMatch(text, new RegExp(SUMMARY_OPEN_RE.source, SUMMARY_OPEN_RE.flags));
        const updateMatch = findFirstMatch(text, new RegExp(UPDATE_OPEN_RE.source, UPDATE_OPEN_RE.flags));
        const indexes = [summaryMatch?.index, updateMatch?.index].filter(index => Number.isInteger(index));
        return indexes.length > 0 ? Math.min(...indexes) : -1;
    }

    function trimOuterWhitespace(text) {
        return String(text || '').replace(/^\s+|\s+$/g, '');
    }

    function trimLeadingBlankLines(text) {
        return String(text || '').replace(/^(?:[ \t]*\n)+/, '');
    }

    function trimTrailingBlankLines(text) {
        return String(text || '').replace(/(?:\n[ \t]*)+$/, '');
    }

    function normalizeNewlines(text) {
        return String(text || '').replace(/\r\n?/g, '\n');
    }

    function previewText(text, limit = 160) {
        const value = normalizeNewlines(text);
        return value.length > limit ? `${value.slice(0, limit)}...` : value;
    }

    function hasCompleteNowPlotPair(text) {
        return /<\s*now_plot\s*>[\s\S]*<\s*\/\s*now_plot\s*>/i.test(String(text || ''));
    }

    function getCompleteNowPlotRanges(text) {
        const source = String(text || '');
        const tagRegex = /<\s*\/?\s*now_plot\s*>/gi;
        const stack = [];
        const ranges = [];
        let match;

        while ((match = tagRegex.exec(source)) !== null) {
            const isCloseTag = /^<\s*\//i.test(match[0]);
            if (!isCloseTag) {
                stack.push(match.index);
                continue;
            }

            const openIndex = stack.pop();
            if (!Number.isInteger(openIndex)) {
                continue;
            }

            ranges.push({
                start: openIndex,
                end: match.index + match[0].length,
            });
        }

        return ranges.sort((left, right) => left.start - right.start || left.end - right.end);
    }

    function getBeautifyCardRanges(text) {
        const source = String(text || '');
        const ranges = [];

        for (const tagName of BEAUTIFY_CARD_TAG_NAMES) {
            const tagRegex = new RegExp(`<\\s*${tagName}\\s*>([\\s\\S]*?)<\\s*\\/\\s*${tagName}\\s*>`, 'gi');
            let match;

            while ((match = tagRegex.exec(source)) !== null) {
                ranges.push({
                    tagName,
                    start: match.index,
                    end: match.index + match[0].length,
                });
            }
        }

        return ranges.sort((left, right) => left.start - right.start || right.end - left.end);
    }

    function isRangeWrappedByNowPlot(targetRange, nowPlotRanges) {
        return nowPlotRanges.some(range => targetRange.start >= range.start && targetRange.end <= range.end);
    }

    function hasBeautifyCardOutsideNowPlot(text) {
        const nowPlotRanges = getCompleteNowPlotRanges(text);
        if (nowPlotRanges.length === 0) {
            return false;
        }

        const cardRanges = getBeautifyCardRanges(text);
        if (cardRanges.length === 0) {
            return false;
        }

        return cardRanges.some(range => !isRangeWrappedByNowPlot(range, nowPlotRanges));
    }

    function hasRelevantTag(text) {
        return THINKING_CLOSE_RE.test(text)
            || NOW_PLOT_TAG_TEST_RE.test(text)
            || INTERLEAVING_TAG_TEST_RE.test(text)
            || SUMMARY_OPEN_RE.test(text)
            || UPDATE_OPEN_RE.test(text);
    }

    function normalizeTagBlocks(message) {
        const original = normalizeNewlines(message);
        if (!hasRelevantTag(original)) {
            return {
                changed: false,
                skipped: true,
                reason: 'no_relevant_tags',
                message: original,
            };
        }

        const thinkingMatch = findFirstMatch(original, new RegExp(THINKING_CLOSE_RE.source, THINKING_CLOSE_RE.flags));
        if (!thinkingMatch) {
            return {
                changed: false,
                skipped: true,
                reason: 'missing_thinking_close',
                message: original,
            };
        }

        const thinkingEnd = thinkingMatch.index + thinkingMatch.value.length;
        const prefix = trimTrailingBlankLines(original.slice(0, thinkingEnd));
        const tail = original.slice(thinkingEnd);
        const keepInterleaving = INTERLEAVING_CLOSE_TEST_RE.test(tail);
        const tailWithoutInterleaving = tail.replace(INTERLEAVING_TAG_RE, '');
        const anchorIndex = findEarliestAnchorIndex(tailWithoutInterleaving);

        const middleRaw = anchorIndex >= 0
            ? tailWithoutInterleaving.slice(0, anchorIndex)
            : tailWithoutInterleaving;
        const suffixRaw = anchorIndex >= 0
            ? tailWithoutInterleaving.slice(anchorIndex)
            : '';

        const hasNowPlotPair = hasCompleteNowPlotPair(middleRaw);
        
        // 此处的逻辑完美保留：利用 hasBeautifyCardOutsideNowPlot 检测 <now_plot> 之前的卡片
        const shouldRewrapNowPlot = hasNowPlotPair && hasBeautifyCardOutsideNowPlot(middleRaw);
        
        // 核心保留：当检测到外部卡片时，剔除首尾旧标签，并在下面由 `normalized += <now_plot>` 和 `</now_plot>` 统一重新包裹
        const cleanedMiddle = hasNowPlotPair && !shouldRewrapNowPlot
            ? trimOuterWhitespace(middleRaw)
            : trimOuterWhitespace(middleRaw.replace(NOW_PLOT_TAG_RE, ''));
        const cleanedSuffix = trimLeadingBlankLines(suffixRaw.replace(NOW_PLOT_TAG_RE, ''));

        let normalized = `${prefix}\n\n`;
        if (hasNowPlotPair && !shouldRewrapNowPlot) {
            normalized += cleanedMiddle;
        } else {
            normalized += `<now_plot>\n`;
            if (cleanedMiddle) {
                normalized += `${cleanedMiddle}\n`;
            }
            // 绝不动尾部标签处理，原汁原味！
            normalized += `</now_plot>`;
        }

        if (keepInterleaving) {
            normalized += `\n</Interleaving>`;
        }

        if (cleanedSuffix) {
            normalized += `\n\n${cleanedSuffix}`;
        }

        normalized = trimTrailingBlankLines(normalized);

        return {
            changed: normalized !== original,
            skipped: false,
            reason: normalized !== original
                ? (shouldRewrapNowPlot ? 'rewrapped_for_beautify_cards' : 'normalized')
                : 'already_normalized',
            message: normalized,
        };
    }

    function getMessageRecord(messageId) {
        const context = getStContext();
        const chat = Array.isArray(context?.chat) ? context.chat : null;
        return (Array.isArray(chat) ? chat[messageId] : null)
            ?? getChatMessages(messageId, { include_swipes: true })[0]
            ?? getChatMessages(messageId)[0]
            ?? null;
    }

    function getMessageText(chatMessage) {
        if (!chatMessage) return '';
        if (typeof chatMessage.mes === 'string' && chatMessage.mes) return chatMessage.mes;
        if (Array.isArray(chatMessage.swipes)) {
            const swipeId = Math.max(0, Number(chatMessage.swipe_id ?? 0) || 0);
            const swipeText = chatMessage.swipes[swipeId];
            if (typeof swipeText === 'string') return swipeText;
        }
        if (typeof chatMessage.message === 'string') return chatMessage.message;
        return '';
    }

    function applyMessageText(chatMessage, normalizedMessage) {
        if (!chatMessage || typeof chatMessage !== 'object') return false;

        chatMessage.mes = normalizedMessage;
        if (Object.prototype.hasOwnProperty.call(chatMessage, 'message') || typeof chatMessage.message === 'string' || !Object.prototype.hasOwnProperty.call(chatMessage, 'mes')) {
            chatMessage.message = normalizedMessage;
        }

        if (Array.isArray(chatMessage.swipes)) {
            const swipeId = Math.max(0, Number(chatMessage.swipe_id ?? 0) || 0);
            if (swipeId < chatMessage.swipes.length) {
                chatMessage.swipes[swipeId] = normalizedMessage;
            }
        }

        return true;
    }

    async function rewriteMessage(messageId, chatMessage, normalizedMessage, options = {}) {
        const { notify = false } = options;
        const wrapperRecord = chatMessage ?? getMessageRecord(messageId);
        const target = resolveContextChatTarget(messageId, wrapperRecord);
        const targetMessage = target.record;
        if (!targetMessage) {
            throw new Error(`[${SCRIPT_NAME}] 找不到 context.chat 中可写回的第 ${messageId} 楼`);
        }

        applyMessageText(targetMessage, normalizedMessage);

        const topWindow = window.top;
        const saveChat = typeof topWindow?.saveChat === 'function'
            ? topWindow.saveChat.bind(topWindow)
            : (typeof target.context?.saveChat === 'function' ? target.context.saveChat.bind(target.context) : null);

        if (typeof saveChat === 'function') {
            try {
                await saveChat();
            } catch (error) {
                console.error(`[${SCRIPT_NAME}] rewriteMessage:saveChat:failed`, {
                    messageId,
                    error: error?.message || String(error),
                    stack: error?.stack,
                });
                throw error;
            }
        }

        if (typeof topWindow?.reloadCurrentChat === 'function') {
            try {
                await topWindow.reloadCurrentChat();
            } catch (error) {
                console.error(`[${SCRIPT_NAME}] rewriteMessage:reloadCurrentChat:failed`, {
                    messageId,
                    error: error?.message || String(error),
                    stack: error?.stack,
                });
                throw error;
            }
        }

        const logMessage = `[${SCRIPT_NAME}] 已回写并刷新第 ${messageId} 楼`;
        console.log(logMessage);
        if (notify) {
            toastr.success(logMessage);
        }
    }

    async function fixMessageTagsById(messageId, options = {}) {
        const { notify = false, force = false } = options;
        if (!Number.isInteger(messageId) || messageId < 0) {
            const error = new Error(`[${SCRIPT_NAME}] 非法楼层号: ${messageId}`);
            if (notify) {
                toastr.error(error.message);
            }
            throw error;
        }

        if (processingMessageIds.has(messageId)) {
            return {
                changed: false,
                skipped: true,
                reason: 'processing',
                message_id: messageId,
            };
        }

        processingMessageIds.add(messageId);
        try {
            const chatMessage = getMessageRecord(messageId);
            if (!chatMessage) {
                const result = {
                    changed: false,
                    skipped: true,
                    reason: 'message_not_found',
                    message_id: messageId,
                };
                if (notify) {
                    toastr.warning(`[${SCRIPT_NAME}] 找不到第 ${messageId} 楼`);
                }
                return result;
            }

            const originalMessage = getMessageText(chatMessage);
            const normalized = normalizeTagBlocks(originalMessage);
            const shouldWrite = force ? normalized.message !== normalizeNewlines(originalMessage) : normalized.changed;

            if (!shouldWrite) {
                if (notify) {
                    const tip = normalized.skipped
                        ? `[${SCRIPT_NAME}] 第 ${messageId} 楼未处理: ${normalized.reason}`
                        : `[${SCRIPT_NAME}] 第 ${messageId} 楼无需修正`;
                    toastr.info(tip);
                }
                return {
                    ...normalized,
                    message_id: messageId,
                };
            }

            await rewriteMessage(messageId, chatMessage, normalized.message, { notify });
            return {
                ...normalized,
                message_id: messageId,
            };
        } catch (error) {
            console.error(`[${SCRIPT_NAME}] fixMessageTagsById:failed`, {
                messageId,
                error: error?.message || String(error),
                stack: error?.stack,
            });
            if (notify) {
                toastr.error(`[${SCRIPT_NAME}] 处理第 ${messageId} 楼失败: ${error?.message || String(error)}`);
            }
            throw error;
        } finally {
            processingMessageIds.delete(messageId);
        }
    }

    async function fixLatestMessageTags(options = {}) {
        return fixMessageTagsById(getLastMessageId(), options);
    }

    function mountApi() {
        const root = getRootWindow();
        root[GLOBAL_API_NAME] = {
            normalizeTagBlocks,
            fixMessageTagsById,
            fixLatestMessageTags,
            unload: unload,
            resetMount: resetMount,
        };
        // 兼容检测
        if (typeof initializeGlobal === 'function') {
            initializeGlobal(GLOBAL_API_NAME, root[GLOBAL_API_NAME]);
        }
    }

    function registerEvents() {
        if (typeof eventMakeLast === 'function' && typeof tavern_events !== 'undefined') {
            listenerStops.push(eventMakeLast(tavern_events.GENERATION_ENDED, async (messageId) => {
                await fixMessageTagsById(messageId);
            }));

            listenerStops.push(eventMakeLast(tavern_events.MESSAGE_EDITED, async (messageId) => {
                await fixMessageTagsById(messageId);
            }));
        }
    }

    function unload() {
        while (listenerStops.length > 0) {
            const stop = listenerStops.pop();
            try {
                if (stop && typeof stop.stop === 'function') {
                    stop.stop();
                } else if (typeof stop === 'function') {
                    stop();
                }
            } catch (error) {
                console.warn(`[${SCRIPT_NAME}] 卸载监听失败`, error);
            }
        }

        const root = getRootWindow();
        if (root[GLOBAL_API_NAME]) {
            try {
                delete root[GLOBAL_API_NAME];
            } catch (_) {
                root[GLOBAL_API_NAME] = undefined;
            }
        }

        root[LOADED_FLAG] = false;
        console.log(`[${SCRIPT_NAME}] 已卸载`);
    }

    function resetMount() {
        unload();
        mountApi();
        registerEvents();
        const root = getRootWindow();
        root[LOADED_FLAG] = true;
        console.log(`[${SCRIPT_NAME}] 已重置挂载`);
    }

    const init = async () => {
        const root = getRootWindow();
        if (root[LOADED_FLAG]) {
            console.log(`[${SCRIPT_NAME}] 检测到旧实例，先卸载再重载`);
            try {
                if (typeof root[GLOBAL_API_NAME]?.unload === 'function') {
                    root[GLOBAL_API_NAME].unload();
                } else {
                    root[LOADED_FLAG] = false;
                }
            } catch (error) {
                console.warn(`[${SCRIPT_NAME}] 卸载旧实例失败，继续尝试重载`, error);
                root[LOADED_FLAG] = false;
            }
        }

        root[LOADED_FLAG] = true;
        mountApi();
        registerEvents();

        console.log(`[${SCRIPT_NAME}] 脚本已加载`);
        console.log(`[${SCRIPT_NAME}] 手动触发: ${GLOBAL_API_NAME}.fixLatestMessageTags({ notify: true })`);
        if (typeof toastr !== 'undefined') {
            toastr.success(`[${SCRIPT_NAME}] 脚本已加载`);
        }
    };

    if (typeof $ !== 'undefined') {
        $(init);
    } else {
        setTimeout(init, 1000); // 兜底
    }

})();
