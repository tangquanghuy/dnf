(function () {
    'use strict';

    const SCRIPT_NAME = '楼层正文标签清理脚本';
    const LOADED_FLAG = '__楼层正文标签清理脚本_loaded__';
    const GLOBAL_API_NAME = '__fixMessageTagBlocks__';
    // 仅修改此处：兼容最新的 <think> 标签，确保能准确剥离思考域，定位到 <now_plot> 之前的部分
    const THINKING_CLOSE_RE = /<\/\s*(?:thinking|think)\s*>/i;
    
    const NOW_PLOT_TAG_RE = /<\s*\/?\s*now_plot\s*>/gi;
    const NOW_PLOT_TAG_TEST_RE = /<\s*\/?\s*now_plot\s*>/i;
    const ACTION_BLOCK_RE = /<\s*action\s*>[\s\S]*?<\s*\/\s*action\s*>/gi;
    const ACTION_BLOCK_TEST_RE = /<\s*action\s*>[\s\S]*?<\s*\/\s*action\s*>/i;
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
        'Initiative',
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

    function collapseBlankLines(text) {
        return String(text || '').replace(/\n[ \t]*\n[ \t]*\n+/g, '\n\n');
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

    function tidyNowPlotInner(text) {
        return String(text || '').replace(
            /(<\s*now_plot\s*>)([\s\S]*?)(<\s*\/\s*now_plot\s*>)/gi,
            (match, openTag, inner, closeTag) => {
                const tidied = trimOuterWhitespace(collapseBlankLines(inner));
                return tidied
                    ? `${openTag}\n${tidied}\n${closeTag}`
                    : `${openTag}\n${closeTag}`;
            },
        );
    }

    // 匹配成对的 markdown 代码块：```[语言] ... ```（含中间被围住的全部内容）
    const CODE_BLOCK_RE = /`{3,}[^\n]*\n?[\s\S]*?`{3,}/g;
    // 匹配未成对（残留单个）的代码围栏符号，用于兜底清理
    const LONE_FENCE_RE = /`{3,}[ \t]*[A-Za-z0-9_+#.\-]*/g;

    // 将 now_plot 范围内的整个代码块（```...``` 连同其围住的内容）剔除，
    // 并作为整体追加到最后一个 </now_plot> 之后。
    // 目的：AI 误用 ``` 把正文包成代码块会破坏正文美化；把整块移出 now_plot 提取范围，
    // 既不破坏正文渲染，也保留了代码块内容本身。
    function evictNowPlotCodeFences(text) {
        const source = String(text || '');
        const ranges = getCompleteNowPlotRanges(source);
        if (ranges.length === 0) {
            return source;
        }

        const evicted = [];
        const removalSpans = [];
        for (const range of ranges) {
            const inner = source.slice(range.start, range.end);
            let match;
            // 先摘除成对代码块
            CODE_BLOCK_RE.lastIndex = 0;
            while ((match = CODE_BLOCK_RE.exec(inner)) !== null) {
                const absStart = range.start + match.index;
                evicted.push(trimOuterWhitespace(match[0]));
                removalSpans.push({ start: absStart, end: absStart + match[0].length });
            }
        }

        // 再扫描残留的单个围栏符号（成对块已在上一步移除，这里只会命中落单的）
        // 需在已知的成对块之外扫描，避免重复；用占位思路：先删成对块再扫单个
        let result = source;
        if (removalSpans.length > 0) {
            removalSpans.sort((left, right) => right.start - left.start);
            for (const span of removalSpans) {
                result = result.slice(0, span.start) + result.slice(span.end);
            }
        }

        // 对删除成对块后的文本，再次在 now_plot 范围内清理落单围栏
        const loneEvicted = [];
        const loneSpans = [];
        const rangesAfter = getCompleteNowPlotRanges(result);
        for (const range of rangesAfter) {
            const inner = result.slice(range.start, range.end);
            let match;
            LONE_FENCE_RE.lastIndex = 0;
            while ((match = LONE_FENCE_RE.exec(inner)) !== null) {
                const absStart = range.start + match.index;
                loneEvicted.push(match[0]);
                loneSpans.push({ start: absStart, end: absStart + match[0].length });
            }
        }
        if (loneSpans.length > 0) {
            loneSpans.sort((left, right) => right.start - left.start);
            for (const span of loneSpans) {
                result = result.slice(0, span.start) + result.slice(span.end);
            }
        }

        const allEvicted = [...evicted, ...loneEvicted];
        if (allEvicted.length === 0) {
            return source;
        }

        // 定位最后一个 </now_plot>，把剔除的内容追加到其后
        const closeRe = /<\s*\/\s*now_plot\s*>/gi;
        let lastCloseEnd = -1;
        let closeMatch;
        while ((closeMatch = closeRe.exec(result)) !== null) {
            lastCloseEnd = closeMatch.index + closeMatch[0].length;
        }
        if (lastCloseEnd < 0) {
            return result;
        }

        const evictedText = '\n\n' + allEvicted.join('\n\n');
        return result.slice(0, lastCloseEnd) + evictedText + result.slice(lastCloseEnd);
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

    function extractActionBlocks(text) {
        const blocks = [];
        const cleaned = String(text || '').replace(ACTION_BLOCK_RE, (block) => {
            const trimmedBlock = trimOuterWhitespace(block);
            if (trimmedBlock) {
                blocks.push(trimmedBlock);
            }
            return '\n';
        });

        return {
            text: cleaned,
            blocks,
        };
    }

    function hasRelevantTag(text) {
        return THINKING_CLOSE_RE.test(text)
            || NOW_PLOT_TAG_TEST_RE.test(text)
            || ACTION_BLOCK_TEST_RE.test(text)
            || INTERLEAVING_TAG_TEST_RE.test(text)
            || SUMMARY_OPEN_RE.test(text)
            || UPDATE_OPEN_RE.test(text);
    }

    function normalizeTagBlocks(message) {
        const original = normalizeNewlines(message);
        // 先把 now_plot 内误用的代码围栏 ``` 移出提取范围，作为规整的一部分
        const deFenced = evictNowPlotCodeFences(original);
        if (!hasRelevantTag(deFenced)) {
            return {
                changed: deFenced !== original,
                skipped: deFenced === original,
                reason: deFenced !== original ? 'evicted_code_fences' : 'no_relevant_tags',
                message: deFenced,
            };
        }

        const thinkingMatch = findFirstMatch(deFenced, new RegExp(THINKING_CLOSE_RE.source, THINKING_CLOSE_RE.flags));
        const startsWithNowPlot = /^\s*<\s*now_plot\s*>/i.test(deFenced);
        if (!thinkingMatch && !startsWithNowPlot) {
            return {
                changed: deFenced !== original,
                skipped: deFenced === original,
                reason: deFenced !== original ? 'evicted_code_fences' : 'missing_thinking_close',
                message: deFenced,
            };
        }

        const thinkingEnd = thinkingMatch ? (thinkingMatch.index + thinkingMatch.value.length) : 0;
        const prefix = thinkingMatch
            ? trimTrailingBlankLines(deFenced.slice(0, thinkingEnd))
            : '';
        const tail = thinkingMatch ? deFenced.slice(thinkingEnd) : deFenced;
        const keepInterleaving = INTERLEAVING_CLOSE_TEST_RE.test(tail);
        const tailWithoutInterleaving = tail.replace(INTERLEAVING_TAG_RE, '');
        const anchorIndex = findEarliestAnchorIndex(tailWithoutInterleaving);

        const middleRaw = anchorIndex >= 0
            ? tailWithoutInterleaving.slice(0, anchorIndex)
            : tailWithoutInterleaving;
        const suffixRaw = anchorIndex >= 0
            ? tailWithoutInterleaving.slice(anchorIndex)
            : '';
        const middleActionExtract = extractActionBlocks(middleRaw);
        const suffixActionExtract = extractActionBlocks(suffixRaw);
        const middleWithoutAction = middleActionExtract.text;
        const suffixWithoutAction = suffixActionExtract.text;
        const actionBlocks = [
            ...middleActionExtract.blocks,
            ...suffixActionExtract.blocks,
        ];

        const hasNowPlotPair = hasCompleteNowPlotPair(middleWithoutAction);
        
        // 此处的逻辑完美保留：利用 hasBeautifyCardOutsideNowPlot 检测 <now_plot> 之前的卡片
        const shouldRewrapNowPlot = hasNowPlotPair && hasBeautifyCardOutsideNowPlot(middleWithoutAction);
        
        // 核心保留：当检测到外部卡片时，剔除首尾旧标签，并在下面由 `normalized += <now_plot>` 和 `</now_plot>` 统一重新包裹
        const cleanedMiddle = hasNowPlotPair && !shouldRewrapNowPlot
            ? tidyNowPlotInner(trimOuterWhitespace(collapseBlankLines(middleWithoutAction)))
            : trimOuterWhitespace(collapseBlankLines(middleWithoutAction.replace(NOW_PLOT_TAG_RE, '')));
        const cleanedSuffix = trimLeadingBlankLines(collapseBlankLines(suffixWithoutAction.replace(NOW_PLOT_TAG_RE, '')));

        let normalized = prefix ? `${prefix}\n\n` : '';
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

        if (actionBlocks.length > 0) {
            normalized += `\n${actionBlocks.join('\n')}`;
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
        const {
            notify = false,
            persist = true,
            reload = true,
            logWrite = true,
        } = options;
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

        if (persist && typeof saveChat === 'function') {
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

        if (reload && typeof topWindow?.reloadCurrentChat === 'function') {
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

        const logMessage = `[${SCRIPT_NAME}] 已回写第 ${messageId} 楼`;
        if (logWrite) {
            console.log(logMessage);
        }
        if (notify && typeof toastr !== 'undefined') {
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
            const normalizedMessage = normalized.message;
            const normalizedResult = normalized;
            const shouldWrite = force
                ? normalizedMessage !== normalizeNewlines(originalMessage)
                : normalizedResult.changed;

            if (!shouldWrite) {
                if (notify) {
                    const tip = normalizedResult.skipped
                        ? `[${SCRIPT_NAME}] 第 ${messageId} 楼未处理: ${normalizedResult.reason}`
                        : `[${SCRIPT_NAME}] 第 ${messageId} 楼无需修正`;
                    toastr.info(tip);
                }
                return {
                    ...normalizedResult,
                    message_id: messageId,
                };
            }

            await rewriteMessage(messageId, chatMessage, normalizedMessage, { notify });
            return {
                ...normalizedResult,
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
