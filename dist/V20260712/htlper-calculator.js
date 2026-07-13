/**
 * 变量映射：
 * variables.人物.等级
 * variables.人物.当前总经验
 * variables.人物.升级阈值
 * variables.人物.属性.属性点
 * variables.人物.SP
 * variables.人物.RP
 */

(function () {
    'use strict';

    // ==========================================
    // 核心公式
    // ==========================================

    function calculateDiabloThreshold(targetLevel) {
        if (targetLevel <= 1) return 0;
        let total = 0;
        for (let L = 1; L < targetLevel; L++) {
            total += Math.floor(100 * Math.pow(L, 1.5));
        }
        return total;
    }

    // ==========================================
    // 工具函数
    // ==========================================

    function safeParseInt(value, def = 0) {
        const n = parseInt(value, 10);
        return isNaN(n) ? def : n;
    }

    function safeParseFloat(value, def = 0) {
        const n = parseFloat(value);
        return isNaN(n) ? def : n;
    }

    function normalizeQualityName(value) {
        return value === '神器' ? '卓越' : value;
    }

    // 兼容旧存档：只迁移名为“品质”的字段，避免误改世界观文本中的“神器”。
    function normalizeLegacyQualityNames(root) {
        if (!root || typeof root !== 'object') return 0;

        const seen = new WeakSet();
        let migratedCount = 0;
        const visit = (value) => {
            if (!value || typeof value !== 'object' || seen.has(value)) return;
            seen.add(value);

            if (Array.isArray(value)) {
                value.forEach(visit);
                return;
            }

            Object.entries(value).forEach(([key, child]) => {
                if (key === '品质' && child === '神器') {
                    value[key] = normalizeQualityName(child);
                    migratedCount++;
                    return;
                }
                visit(child);
            });
        };

        visit(root);
        if (migratedCount > 0) {
            console.log(`[品质迁移] 已将 ${migratedCount} 个旧“神器”品质自动更新为“卓越”`);
        }
        return migratedCount;
    }

    function migrateBagCurrency(statData) {
        const bag = statData?.人物?.背包;
        if (!bag || typeof bag !== 'object' || Array.isArray(bag)) return false;
        if (!Object.prototype.hasOwnProperty.call(bag, '金币')) return false;

        const legacyGold = Math.max(0, Math.floor(safeParseFloat(bag.金币, 0)));
        const currentUniversalCurrency = Math.max(0, Math.floor(safeParseFloat(bag.通用币, 0)));
        const hasUniversalCurrency = Object.prototype.hasOwnProperty.call(bag, '通用币');

        // 若新旧字段同时存在，按合并处理，避免改名过渡期丢失货币。
        const nextUniversalCurrency = hasUniversalCurrency
            ? currentUniversalCurrency + legacyGold
            : legacyGold;

        bag.通用币 = nextUniversalCurrency;
        delete bag.金币;

        console.log(
            `[背包货币迁移] 检测到旧字段"金币"，已迁移为"通用币": ${currentUniversalCurrency} + ${legacyGold} => ${nextUniversalCurrency}`
        );
        return true;
    }

    function getLevelBaseTotalExp(level) {
        const lv = Math.max(1, safeParseInt(level, 1));
        return calculateDiabloThreshold(lv);
    }

    function isBondShareExpEnabled(bond) {
        if (!bond || typeof bond !== 'object') return false;
        const shareExp = bond.分享经验;
        return shareExp !== false &&
            shareExp !== '否' &&
            shareExp !== 'false' &&
            shareExp !== 0 &&
            shareExp !== '0';
    }

    /**
     * 判断两个值是否有差异（用于变更检测）
     * 对对象做 JSON 序列化比较，对基本类型直接 ===
     */
    function hasChanged(oldVal, newVal) {
        if (oldVal === newVal) return false;
        if (typeof oldVal === 'object' && typeof newVal === 'object') {
            return JSON.stringify(oldVal) !== JSON.stringify(newVal);
        }
        return true;
    }

    // 仅对装备「六维属性」做规则校验（参照《装备与物品生成规则》）
    const CORE_ATTR_KEYS = ['力量', '敏捷', '体质', '智力', '感知', '魅力'];
    const CORE_ATTR_KEY_SET = new Set(CORE_ATTR_KEYS);
    const CORE_ATTR_ALIAS = {
        '体力': '体质',
    };
    const QUALITY_CORE_ATTR_RULES = {
        '普通': { total: 0, single: 0 },
        '精良': { total: 1, single: 1 },
        '稀有': { total: 1, single: 1 },
        '卓越': { total: 2, single: 1 },
        '传说': { total: 2, single: 2 },
        '史诗': { total: 3, single: 2 },
        '神话': { total: 4, single: 3 }
    };
    const QUALITY_CRIT_DAMAGE_LIMITS = {
        '普通': 0.10,
        '精良': 0.15,
        '稀有': 0.30,
        '卓越': 0.50,
        '传说': 0.80,
        '史诗': 1.00,
        '神话': 1.50
    };
    const QUALITY_ARMOR_CRIT_TO_SKILL_RULES = {
        '稀有': { pick: ['基础', '进阶', '必杀'], count: 1, value: 1 },
        '卓越': { pick: ['基础', '转职', '进阶', '必杀', '奥义'], count: 1, value: 1 },
        '传说': { pick: ['基础', '转职', '进阶', '必杀', '奥义'], count: 2, value: 1 },
        '史诗': { fixed: { '全技能': 2 } },
        '神话': { fixed: { '全技能': 2, '觉醒三': 1 } }
    };
    const CRIT_TO_SKILL_FALLBACK_TIERS = ['基础', '转职', '进阶', '必杀', '奥义'];
    const SPECIAL_EQUIP_SLOT = '特殊装备';
    const STANDARD_EQUIP_SLOTS = new Set(['主手', '副手', '护肩', '上衣', '腰带', '下装', '鞋子', '项链', '手镯', '戒指']);
    const TITAN_GRIP_TRAIT_NAME = '泰坦之握';
    const DUAL_ARMAMENT_TRAIT_NAME = '双极武装';

    function getEquipStoredSlot(equipData) {
        return String(equipData?.部位 || '').trim();
    }

    function getEquipOriginSlot(equipData) {
        return String(equipData?.原始部位 || equipData?.部位 || '').trim();
    }

    function getEquipType(equipData) {
        return String(equipData?.类型 || '').trim();
    }

    function isStandardEquipSlot(slotName) {
        return STANDARD_EQUIP_SLOTS.has(String(slotName || '').trim());
    }

    function shouldUseSpecialEquipSlot(equipData) {
        const storedSlot = getEquipStoredSlot(equipData);
        if (isStandardEquipSlot(storedSlot)) return false;
        const originSlot = getEquipOriginSlot(equipData);
        return !!originSlot && !isStandardEquipSlot(originSlot);
    }

    function resolveEquipTargetSlot(equipData) {
        return shouldUseSpecialEquipSlot(equipData) ? SPECIAL_EQUIP_SLOT : getEquipStoredSlot(equipData);
    }

    function isSpecialEquippedItem(equipData) {
        return !!equipData && !equipData.装备箱 && resolveEquipTargetSlot(equipData) === SPECIAL_EQUIP_SLOT;
    }

    function isShieldLikeEquip(equipData) {
        const equipType = getEquipType(equipData);
        const storedSlot = getEquipStoredSlot(equipData);
        const originSlot = getEquipOriginSlot(equipData);
        return equipType === '盾牌' || storedSlot === '盾牌' || originSlot === '盾牌';
    }

    function getTraitNameSet(player) {
        return new Set(Object.keys(player?.特质 || {}).map(name => String(name || '').trim()));
    }

    function getOffhandRuleState(player) {
        const traitSet = getTraitNameSet(player);
        const hasTitanGrip = String(player?.种族 || '').trim() === '巨人种' || traitSet.has(TITAN_GRIP_TRAIT_NAME);
        const hasDualArmament = traitSet.has(DUAL_ARMAMENT_TRAIT_NAME);
        return {
            hasTitanGrip,
            hasDualArmament,
            canUseOffhandWeapon: hasTitanGrip || hasDualArmament,
            canUseOffhandShield: hasDualArmament,
            hasSynergy: hasTitanGrip && hasDualArmament
        };
    }

    function normalizeCoreAttrKey(rawKey) {
        if (typeof rawKey !== 'string') return '';
        const key = rawKey.trim();
        return CORE_ATTR_ALIAS[key] || key;
    }

    function stableHash(text) {
        const seedText = String(text || '');
        let seed = 0;
        for (let i = 0; i < seedText.length; i++) {
            seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
        }
        return seed;
    }

    function stableRandomDecimal(seedText, max, decimals = 2) {
        const cap = Math.max(0, safeParseFloat(max, 0));
        if (cap <= 0) return 0;
        const fraction = (stableHash(seedText) % 1000000) / 999999;
        const factor = Math.pow(10, decimals);
        return Math.round(fraction * cap * factor) / factor;
    }

    function stablePickList(options, count, seedText) {
        if (!Array.isArray(options) || options.length === 0 || count <= 0) return [];
        const start = stableHash(seedText) % options.length;
        const out = [];
        for (let i = 0; i < options.length && out.length < count; i++) {
            out.push(options[(start + i) % options.length]);
        }
        return out;
    }

    function sanitizeNewEquipCoreAttrBonuses(equipKey, equipVal) {
        if (!equipVal || typeof equipVal !== 'object') return;
        const bonuses = equipVal.属性加成;
        if (!bonuses || typeof bonuses !== 'object' || Array.isArray(bonuses)) return;

        const quality = normalizeQualityName((typeof equipVal.品质 === 'string' && equipVal.品质.trim()) ? equipVal.品质.trim() : '普通');
        const hasKnownQuality = Object.prototype.hasOwnProperty.call(QUALITY_CORE_ATTR_RULES, quality);
        const qualityRule = hasKnownQuality ? QUALITY_CORE_ATTR_RULES[quality] : QUALITY_CORE_ATTR_RULES['普通'];
        const totalLimit = safeParseInt(qualityRule.total, 0);
        const singleLimit = safeParseInt(qualityRule.single, 0);

        const otherEntries = [];
        const coreOrder = [];
        const coreAccum = {};
        const aliasFixes = [];

        Object.entries(bonuses).forEach(([rawKey, rawVal]) => {
            const fixedKey = normalizeCoreAttrKey(rawKey);
            if (!CORE_ATTR_KEY_SET.has(fixedKey)) {
                otherEntries.push([rawKey, rawVal]);
                return;
            }

            if (fixedKey !== rawKey) {
                aliasFixes.push(`${rawKey}→${fixedKey}`);
            }

            // 六维加成按整数处理，负数和无效值清理为 0
            const parsed = safeParseFloat(rawVal, 0);
            const positiveInt = Math.max(0, Math.floor(parsed));
            if (positiveInt <= 0) return;

            if (!Object.prototype.hasOwnProperty.call(coreAccum, fixedKey)) {
                coreAccum[fixedKey] = 0;
                coreOrder.push(fixedKey);
            }
            coreAccum[fixedKey] += positiveInt;
        });

        // 先执行单一六维上限，再执行六维总点数上限
        const singleCapped = [];
        const cappedEntries = coreOrder.map(key => {
            const raw = safeParseInt(coreAccum[key], 0);
            const capped = clamp(raw, 0, singleLimit);
            if (capped < raw) {
                singleCapped.push(`${key}:${raw}→${capped}`);
            }
            return { key, value: capped };
        }).filter(entry => entry.value > 0);

        // 严格限制六维总和不超过品质点数，按出现顺序保留
        let remain = totalLimit;
        const limitedEntries = [];
        const totalTrimmed = [];
        for (const entry of cappedEntries) {
            if (remain <= 0) {
                totalTrimmed.push(`${entry.key}:${entry.value}→0`);
                continue;
            }
            const keep = Math.min(entry.value, remain);
            if (keep < entry.value) {
                totalTrimmed.push(`${entry.key}:${entry.value}→${keep}`);
            }
            if (keep > 0) {
                limitedEntries.push({ key: entry.key, value: keep });
                remain -= keep;
            }
        }

        // 合并同键（例如“体力+体质”归一后同键）
        const mergedByKey = [];
        for (const entry of limitedEntries) {
            const idx = mergedByKey.findIndex(x => x.key === entry.key);
            if (idx < 0) {
                mergedByKey.push({ key: entry.key, value: entry.value });
            } else {
                mergedByKey[idx].value = clamp(mergedByKey[idx].value + entry.value, 0, singleLimit);
            }
        }

        // 裁剪后若低于品质应有的六维总点数，回填到其它未达单项上限的六维。
        // 例如卓越要求总点数2、单项上限1，敏捷+2 会被修正为 敏捷+1，并补1点到另一六维。
        const refillAdded = [];
        const getMergedEntry = (key) => mergedByKey.find(x => x.key === key);
        const addRefillPoint = (key) => {
            const entry = getMergedEntry(key);
            if (entry) {
                if (entry.value >= singleLimit) return false;
                entry.value += 1;
            } else {
                mergedByKey.push({ key, value: 1 });
            }
            refillAdded.push(key);
            return true;
        };

        let coreTotal = mergedByKey.reduce((sum, x) => sum + x.value, 0);
        if (totalLimit > 0 && singleLimit > 0 && coreTotal < totalLimit) {
            const seedText = `${equipKey}|${equipVal.名称 || ''}|${quality}`;
            const seed = stableHash(seedText);
            const rotatedAttrs = CORE_ATTR_KEYS.map((_, idx) => CORE_ATTR_KEYS[(idx + seed) % CORE_ATTR_KEYS.length]);
            const fillOrder = [...new Set([...coreOrder, ...rotatedAttrs])];
            let guard = CORE_ATTR_KEYS.length * Math.max(1, singleLimit);
            while (coreTotal < totalLimit && guard-- > 0) {
                let filled = false;
                for (const key of fillOrder) {
                    if (coreTotal >= totalLimit) break;
                    if (addRefillPoint(key)) {
                        coreTotal += 1;
                        filled = true;
                    }
                }
                if (!filled) break;
            }
        }

        const equipType = getEquipType(equipVal);
        const canKeepCritDamage = equipType === '武器' || equipType === '首饰';
        const isArmorLike = equipType === '防具' || isShieldLikeEquip(equipVal);
        const critDamageFixes = [];
        const critDamageConversions = [];
        const illegalCritDamageRemoved = [];
        const addOtherEntry = (entries, key, value) => {
            const existing = entries.find(entry => entry[0] === key);
            if (existing) {
                const oldVal = safeParseFloat(existing[1], 0);
                const addVal = safeParseFloat(value, 0);
                existing[1] = Math.round((oldVal + addVal) * 100) / 100;
            } else {
                entries.push([key, value]);
            }
        };
        const getOtherValue = (entries, key) => {
            const existing = entries.find(entry => entry[0] === key);
            return existing ? safeParseFloat(existing[1], 0) : 0;
        };
        const isNonStackingSkillKey = (skillKey) => skillKey === '全技能' || String(skillKey || '').startsWith('觉醒');
        const addConvertedSkillEntry = (entries, skillKey, value, seedText) => {
            const addValue = safeParseFloat(value, 0);
            if (addValue <= 0) return false;

            let targetKey = skillKey;
            if (isNonStackingSkillKey(skillKey) && getOtherValue(entries, skillKey) > 0) {
                const fallbackOrder = stablePickList(CRIT_TO_SKILL_FALLBACK_TIERS, CRIT_TO_SKILL_FALLBACK_TIERS.length, seedText);
                targetKey = fallbackOrder.find(candidate => candidate !== skillKey) || CRIT_TO_SKILL_FALLBACK_TIERS[0];
            }

            addOtherEntry(entries, targetKey, addValue);
            critDamageConversions.push(`${targetKey}+${Math.round(addValue * 100) / 100}`);
            return true;
        };
        const sanitizedOtherEntries = [];
        otherEntries.forEach(([key, rawVal]) => {
            if (key !== '暴击伤害') {
                addOtherEntry(sanitizedOtherEntries, key, rawVal);
                return;
            }

            if (!canKeepCritDamage) {
                if (isArmorLike) {
                    const rule = QUALITY_ARMOR_CRIT_TO_SKILL_RULES[quality];
                    if (rule?.fixed) {
                        Object.entries(rule.fixed).forEach(([skillKey, value]) => {
                            addConvertedSkillEntry(sanitizedOtherEntries, skillKey, value, `${equipKey}|${equipVal.名称 || ''}|${quality}|${skillKey}|暴击伤害转技能`);
                        });
                    } else if (rule?.pick) {
                        const targetCount = rule.count || 1;
                        const targetValue = rule.value || 1;
                        stablePickList(rule.pick, targetCount, `${equipKey}|${equipVal.名称 || ''}|${quality}|暴击伤害转技能`).forEach(skillKey => {
                            addConvertedSkillEntry(sanitizedOtherEntries, skillKey, targetValue, `${equipKey}|${equipVal.名称 || ''}|${quality}|${skillKey}|暴击伤害转技能`);
                        });
                    } else {
                        illegalCritDamageRemoved.push(`${equipType || '未知类型'}:${quality}`);
                    }
                } else {
                    illegalCritDamageRemoved.push(`${equipType || '未知类型'}:${quality}`);
                }
                return;
            }

            const cap = QUALITY_CRIT_DAMAGE_LIMITS[quality] ?? QUALITY_CRIT_DAMAGE_LIMITS['普通'];
            const parsed = safeParseFloat(rawVal, 0);
            let normalized = parsed > 1 ? parsed / 100 : parsed;
            normalized = Math.max(0, normalized);
            let nextVal = normalized;
            if (normalized > cap) {
                nextVal = stableRandomDecimal(`${equipKey}|${equipVal.名称 || ''}|${quality}|暴击伤害`, cap, 2);
                critDamageFixes.push(`${parsed}→${nextVal}`);
            } else if (parsed !== normalized) {
                critDamageFixes.push(`${parsed}→${normalized}`);
            }
            if (nextVal > 0) {
                addOtherEntry(sanitizedOtherEntries, key, nextVal);
            }
        });

        const sanitizedBonuses = {};
        sanitizedOtherEntries.forEach(([k, v]) => { sanitizedBonuses[k] = v; });
        mergedByKey.forEach(({ key, value }) => {
            if (value > 0) sanitizedBonuses[key] = value;
        });

        if (!hasChanged(bonuses, sanitizedBonuses)) return;

        equipVal.属性加成 = sanitizedBonuses;

        if (!hasKnownQuality) {
            console.warn(`[变量守卫] ⚠️ 新增装备 "${equipKey}" 品质="${quality}" 未命中规则，按普通处理(六维点数=0, 单项上限=0)`);
        }
        if (aliasFixes.length > 0) {
            console.warn(`[变量守卫] ⚠️ 新增装备 "${equipKey}" 修正属性别名: ${aliasFixes.join(', ')}`);
        }
        if (singleCapped.length > 0) {
            console.warn(`[变量守卫] ⚠️ 新增装备 "${equipKey}" 单一六维上限(${singleLimit})截断: ${singleCapped.join(', ')}`);
        }
        if (totalTrimmed.length > 0) {
            console.warn(`[变量守卫] ⚠️ 新增装备 "${equipKey}" 六维点数上限(${totalLimit})截断: ${totalTrimmed.join(', ')}`);
        }
        if (refillAdded.length > 0) {
            console.warn(`[变量守卫] ⚠️ 新增装备 "${equipKey}" 六维点数不足，已补足: ${refillAdded.join(', ')}`);
        }
        if (critDamageFixes.length > 0) {
            console.warn(`[变量守卫] ⚠️ 新增装备 "${equipKey}" 暴击伤害超出品质上限，已修正: ${critDamageFixes.join(', ')}`);
        }
        if (critDamageConversions.length > 0) {
            console.warn(`[变量守卫] ⚠️ 新增装备 "${equipKey}" 防具不允许暴击伤害，已转为技能等级: ${critDamageConversions.join(', ')}`);
        }
        if (illegalCritDamageRemoved.length > 0) {
            console.warn(`[变量守卫] ⚠️ 新增装备 "${equipKey}" 当前类型/品质无可用技能等级替换，暴击伤害已移除: ${illegalCritDamageRemoved.join(', ')}`);
        }
        console.warn(`[变量守卫] ⚠️ 新增装备 "${equipKey}" 六维属性已修复: 品质=${quality}, 六维点数上限=${totalLimit}, 单一六维上限=${singleLimit}, 修复后总和=${coreTotal}`);
    }

    // ==========================================
    // AC 计算
    // ==========================================

    const qualityToAC = {
        '普通': 1, '精良': 2, '稀有': 3, '卓越': 4,
        '传说': 5, '史诗': 6, '神话': 7
    };

    const qualityToDamageDice = {
        '普通': '1d6', '精良': '1d8', '稀有': '2d8', '卓越': '3d10',
        '传说': '3d12', '史诗': '4d10', '神话': '4d12'
    };

    // ==========================================
    // 泰坦之握 - 伤害骰合并计算
    // ==========================================

    const diceExpectation = {
        '1d4': 2.5, '1d6': 3.5, '1d8': 4.5, '1d10': 5.5, '1d12': 6.5,
        '2d6': 7, '2d8': 9, '2d10': 11, '2d12': 13,
        '3d6': 10.5, '3d8': 13.5, '3d10': 16.5, '3d12': 19.5,
        '4d6': 14, '4d8': 18, '4d10': 22, '4d12': 26,
        '5d10': 27.5, '5d12': 32.5,
        '6d10': 33, '6d12': 39
    };

    const sortedDice = Object.entries(diceExpectation).sort((a, b) => a[1] - b[1]);

    const diceDowngradeMap = {
        '4d12': '4d10', '4d10': '3d12', '3d12': '3d10', '3d10': '2d8',
        '2d8': '1d8', '1d8': '1d6', '1d6': '1d4', '1d4': '1d4'
    };
    const diceUpgradeMap = {
        '1d4': '1d6', '1d6': '1d8', '1d8': '2d8', '2d8': '3d10',
        '3d10': '3d12', '3d12': '4d10', '4d10': '4d12', '4d12': '4d12'
    };

    function downgradeDice(dice, levels = 2) {
        let result = dice;
        for (let i = 0; i < levels; i++) {
            result = diceDowngradeMap[result] || result;
        }
        return result;
    }

    function upgradeDice(dice, levels = 1) {
        let result = dice;
        for (let i = 0; i < levels; i++) {
            result = diceUpgradeMap[result] || result;
        }
        return result;
    }

    function findClosestDice(expectation) {
        let closest = '1d4';
        let minDiff = Infinity;
        for (const [dice, exp] of sortedDice) {
            const diff = Math.abs(exp - expectation);
            if (diff < minDiff) {
                minDiff = diff;
                closest = dice;
            }
        }
        return closest;
    }

    function mergeMainOffhandDice(mainDice, offhandDice, offhandDowngradeLevels = 2) {
        const mainExp = diceExpectation[mainDice] || 3.5;
        const downgradedOffhand = downgradeDice(offhandDice, offhandDowngradeLevels);
        const offExp = diceExpectation[downgradedOffhand] || 2.5;
        const totalExp = mainExp + offExp;
        const mergedDice = findClosestDice(totalExp);
        console.log(`[副手合并] 主${mainDice}(${mainExp}) + 副${offhandDice}→${downgradedOffhand}(${offExp}) = ${totalExp} ≈ ${mergedDice}`);
        return mergedDice;
    }

    const qualityMultiplier = {
        '普通': 1.0, '精良': 1.5, '稀有': 2.0, '卓越': 2.5,
        '传说': 3.5, '史诗': 4.0, '神话': 5.0
    };

    const DEFAULT_COMBAT_VALUE_MODE = 'classic';

    function normalizeCombatValueMode(mode) {
        return (mode === 'new' || mode === '新版') ? 'new' : DEFAULT_COMBAT_VALUE_MODE;
    }

    function getCombatValueMode(rootData) {
        return normalizeCombatValueMode(rootData?.系统配置?.战斗数值模式);
    }

    function isNewCombatValueMode(rootData) {
        return getCombatValueMode(rootData) === 'new';
    }

    function calcDndModifier(value) {
        return Math.floor((safeParseInt(value, 10) - 10) / 2);
    }

    function calcAttackCountByLevel(level) {
        const lv = safeParseInt(level, 1);
        if (lv >= 50) return 3;
        if (lv >= 20) return 2;
        return 1;
    }

    function calcHpByMode(actor, rootData, equipHpBonus = 0) {
        const level = safeParseInt(actor?.等级, 1);
        const constitution = safeParseInt(actor?.属性?.体质, 10);
        if (isNewCombatValueMode(rootData)) {
            return Math.max(1, constitution + (5 + calcDndModifier(constitution)) * Math.max(0, level - 1) + equipHpBonus);
        }
        if ((actor?.种族 || '') === '巨人种') {
            return Math.max(1, level * constitution * 3 + equipHpBonus);
        }
        return Math.max(1, level * constitution * 2 + equipHpBonus);
    }

    function syncPlayerActionResources(player) {
        if (!player || typeof player !== 'object') return;
        ensureCombatAttrContainer(player);

        const next = {
            主动作: 1,
            附赠动作: 1,
            移动: 1,
            反应动作: 1,
            简短交互: 1,
            攻击次数: calcAttackCountByLevel(player.等级)
        };
        if (!_.isEqual(player.战斗属性.每回合动作资源, next)) {
            player.战斗属性.每回合动作资源 = next;
            console.log(`[动作资源] 玩家每回合动作资源已同步，攻击次数=${next.攻击次数}`);
        }
    }

    const armorSlotCoef = { '上衣': 1.5, '下装': 1.3, '护肩': 1.1, '鞋子': 1.1, '腰带': 1.0, '盾牌': 1.5 };
    const accessorySlotCoef = { '项链': 4.0, '手镯': 3.0, '戒指': 3.0 };
    const DAMAGE_REDUCTION_CAP = 50;
    const DAMAGE_REDUCTION_ALPHA = 16;
    const DAMAGE_REDUCTION_LOG_DEN = Math.log(1 + DAMAGE_REDUCTION_ALPHA); // ln(17)
    const PHYS_DEF_FULL_SCALE = 3300; // 100级神话+10满5件防具理论值
    const MAG_DEF_FULL_SCALE = 5500;  // 100级神话+10满3件首饰理论值

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function defenseToReductionPercent(totalDefense, fullScaleDefense) {
        const defense = Math.max(0, safeParseFloat(totalDefense, 0));
        const scale = fullScaleDefense > 0 ? (defense / fullScaleDefense) : 0;
        const raw = DAMAGE_REDUCTION_CAP * Math.log(1 + DAMAGE_REDUCTION_ALPHA * scale) / DAMAGE_REDUCTION_LOG_DEN;
        return clamp(Math.round(raw), 0, DAMAGE_REDUCTION_CAP);
    }

    function calculateAC(variables) {
        const player = variables.人物;
        if (!player) return;

        if (player.种族 === '龙精种') {
            const currentAC = safeParseInt(player.AC, 0);
            if (currentAC < 18) {
                player.AC = 18;
                console.log(`[AC计算] 龙精种AC保底: ${currentAC} → 18`);
            }
            return;
        }

        const 装备列表 = player.装备列表 || {};
        let 最高AC加值 = 0;
        Object.values(装备列表).forEach(item => {
            if (!item || !item.名称 || item.装备箱 || isSpecialEquippedItem(item)) return;
            if (item.类型 !== '防具' && !isShieldLikeEquip(item)) return;
            const bonus = qualityToAC[normalizeQualityName(item.品质)] || 0;
            if (bonus > 最高AC加值) 最高AC加值 = bonus;
        });

        const newAC = 10 + 最高AC加值;
        if (player.AC !== newAC) {
            console.log(`[AC计算] 更新AC: ${player.AC} → ${newAC}`);
            player.AC = newAC;
        }
    }

    // ==========================================
    // 战斗属性计算
    // ==========================================
    function calculateCombatStats(player) {
        if (!player.战斗属性) return;
        const combat = player.战斗属性;
        const rate = safeParseFloat(combat.暴击率, 0);
        let offset = Math.floor(rate / 10);
        if (offset < 0) offset = 0;
        if (offset > 10) offset = 10;
        const computedThreshold = 10 - offset;

        if (combat.暴击阈值 !== computedThreshold) {
            console.log(`[战斗计算] 暴击阈值: ${combat.暴击阈值} → ${computedThreshold} (暴击率${rate}%)`);
            combat.暴击阈值 = computedThreshold;
        }
    }

    // ==========================================
    // 生命值上限计算
    // ==========================================
    function calculateMaxHP(player, rootData) {
        if (!player.属性) return;

        let equipHpBonus = 0;
        const 装备列表 = player.装备列表 || {};
        Object.values(装备列表).forEach(item => {
            if (!item || !item.名称 || item.装备箱) return;
            const bonuses = item.属性加成 || {};
            equipHpBonus += safeParseInt(bonuses['生命值上限'], 0);
        });

        const newMaxHP = calcHpByMode(player, rootData, equipHpBonus);

        if (player.生命值上限 !== newMaxHP) {
            const oldMaxHP = player.生命值上限 || 0;
            const oldCurrentHP = safeParseInt(player.当前生命值, 0);
            player.生命值上限 = newMaxHP;
            console.log(`[HP计算] 生命值上限 ${oldMaxHP} → ${newMaxHP}`);

            if (oldMaxHP > 0 && oldCurrentHP > 0) {
                const hpRatio = oldCurrentHP / oldMaxHP;
                const newCurrentHP = Math.max(1, Math.round(hpRatio * newMaxHP));
                player.当前生命值 = Math.min(newCurrentHP, newMaxHP);
                console.log(`[HP计算] 按比例修正: ${oldCurrentHP} → ${player.当前生命值} (${Math.round(hpRatio * 100)}%)`);
            } else if (oldCurrentHP > newMaxHP) {
                player.当前生命值 = newMaxHP;
            }
        }
    }

    // ==========================================
    // 装备数值自动计算
    // ==========================================

    function generateRandomGrade() {
        return Math.floor(Math.random() * 21) - 10;
    }

    function ensureGrade(item) {
        console.log(`[品级调试] "${item.名称}" 进入ensureGrade, 当前品级=${item.品级}, 类型=${typeof item.品级}`);
        
        const currentGrade = safeParseInt(item.品级, null);
        
        // 情况1：品级缺失或为0，生成随机品级
        if (currentGrade === null || currentGrade === 0) {
            const newGrade = generateRandomGrade();
            console.log(`[品级调试] "${item.名称}" 品级缺失或为0, 生成随机品级 ${newGrade}`);
            item.品级 = newGrade;
            console.log(`[品级调试] "${item.名称}" 赋值后品级=${item.品级}`);
            return;
        }
        
        // 情况2：品级超出范围 [-10, 10]，修正到边界
        if (currentGrade < -10) {
            console.log(`[品级修正] "${item.名称}" 品级过低(${currentGrade})，已修正为 -10`);
            item.品级 = -10;
        } else if (currentGrade > 10) {
            console.log(`[品级修正] "${item.名称}" 品级过高(${currentGrade})，已修正为 10`);
            item.品级 = 10;
        }
    }

    function getCurrentWorldView(variables) {
        return String(variables?.系统配置?.世界观 || '').trim();
    }

    function isAmberSwordWorldView(variables) {
        return getCurrentWorldView(variables) === '琥珀之剑';
    }

    function getWeaponCalcLevel(weapon, player, variables) {
        if (isAmberSwordWorldView(variables)) {
            return safeParseInt(player?.等级, 1);
        }
        return safeParseInt(weapon?.等级, 1);
    }

    function calculateWeaponStats(weapon, player, variables) {
        if (!weapon || !weapon.名称) return false;
        ensureGrade(weapon);

        const 品质 = normalizeQualityName(weapon.品质 || '普通');
        const 等级 = getWeaponCalcLevel(weapon, player, variables);
        const 品级 = safeParseInt(weapon.品级, 0);
        const 强化等级 = safeParseInt(weapon.强化等级, 0);
        const newMode = isNewCombatValueMode(variables);

        const newDamageDice = qualityToDamageDice[品质] || '1d6';
        const newLevelCoef = newMode ? 1 : Math.floor(等级 / 10) + 1;
        const newFixedDmg = newMode
            ? Math.max(0, Math.floor(等级 / 4) + 强化等级)
            : Math.max(1, Math.floor(等级 * (1 + 强化等级 * 0.1) * (1 + 品级 / 100)));

        const changed = weapon.伤害骰 !== newDamageDice || weapon.等级系数 !== newLevelCoef || weapon.固定伤害 !== newFixedDmg;
        weapon.伤害骰 = newDamageDice;
        weapon.等级系数 = newLevelCoef;
        weapon.固定伤害 = newFixedDmg;

        if (changed) {
            console.log(`[装备计算] 武器 "${weapon.名称}": ${newLevelCoef}×${newDamageDice}+${newFixedDmg}`);
        }
        return changed;
    }

    function collectEquippedCoreAttrBonuses(装备列表) {
        const out = {};
        CORE_ATTR_KEYS.forEach(k => { out[k] = 0; });
        Object.values(装备列表 || {}).forEach(item => {
            if (!item || !item.名称 || item.装备箱) return;
            const bonuses = item.属性加成 || {};
            CORE_ATTR_KEYS.forEach(k => {
                out[k] += safeParseInt(bonuses[k], 0);
            });
        });
        return out;
    }

    function ensureCombatAttrContainer(actor) {
        if (!actor || typeof actor !== 'object') return;
        if (!actor.战斗属性 || typeof actor.战斗属性 !== 'object') actor.战斗属性 = {};
        const combat = actor.战斗属性;
        if (combat.暴击率 === undefined) combat.暴击率 = 0;
        if (combat.暴击伤害 === undefined) combat.暴击伤害 = 1.5;
        if (combat.暴击阈值 === undefined) combat.暴击阈值 = 10;
        if (combat.物理减伤 === undefined) combat.物理减伤 = 0;
        if (combat.魔法减伤 === undefined) combat.魔法减伤 = 0;
    }

    function hasActorCoreAttrChanged(actor, actorBefore) {
        if (!actor?.属性 && !actorBefore?.属性) return false;
        return CORE_ATTR_KEYS.some(attrName =>
            safeParseInt(actor?.属性?.[attrName], 10) !== safeParseInt(actorBefore?.属性?.[attrName], 10)
        );
    }

    // 装备变化后，将六维同步为最终面板值（含体质）
    function syncCoreAttrsOnEquipChange(actor, actorBefore, actorName = '角色') {
        if (!actor?.属性 || !actorBefore?.属性) return;
        const prevBonuses = collectEquippedCoreAttrBonuses(actorBefore.装备列表 || {});
        const newBonuses = collectEquippedCoreAttrBonuses(actor.装备列表 || {});
        const syncAttrs = ['力量', '敏捷', '体质', '智力', '感知', '魅力'];
        syncAttrs.forEach(attrName => {
            const beforeVal = safeParseInt(actorBefore.属性?.[attrName], 10);
            const prevBonus = safeParseInt(prevBonuses[attrName], 0);
            const newBonus = safeParseInt(newBonuses[attrName], 0);
            const baseVal = beforeVal - prevBonus;
            const nextVal = baseVal + newBonus;
            const currentVal = safeParseInt(actor.属性?.[attrName], 10);
            if (currentVal !== nextVal) {
                actor.属性[attrName] = nextVal;
                console.log(`[属性同步] ${actorName} ${attrName}: ${currentVal} → ${nextVal} (装备加成 ${prevBonus} → ${newBonus})`);
            }
        });
    }

    function buildWeaponAttrSnapshot(actor) {
        const raw = actor?.属性 || {};
        const snapshot = {};
        CORE_ATTR_KEYS.forEach(attrName => {
            snapshot[attrName] = safeParseInt(raw[attrName], 10);
        });
        return snapshot;
    }

    function calcAttrFixedDmg(属性, 人物等级, rootData) {
        let maxVal = 0;
        CORE_ATTR_KEYS.forEach(attrName => {
            const v = safeParseInt(属性?.[attrName], 10);
            if (v > maxVal) maxVal = v;
        });
        const capped = Math.min(maxVal, 40);
        const modifier = capped > 10 ? Math.floor((capped - 10) / 2) : 0;
        if (isNewCombatValueMode(rootData)) return modifier;
        const levelCoef = Math.floor(safeParseInt(人物等级, 1) / 10) + 1;
        return modifier * levelCoef;
    }

    function buildUnarmedWeaponPanel(actor, rootData) {
        const level = safeParseInt(actor?.等级, 1);
        const newMode = isNewCombatValueMode(rootData);
        const levelCoef = newMode ? 1 : Math.floor(level / 10) + 1;
        const baseFixed = newMode ? 0 : Math.max(1, level);
        const attrSnapshot = buildWeaponAttrSnapshot(actor);
        const attrFixedDmg = calcAttrFixedDmg(attrSnapshot, level, rootData);
        return {
            伤害骰: '1d4',
            等级系数: levelCoef,
            固定伤害: baseFixed + attrFixedDmg
        };
    }

    function getArmorDefenseValue(armor, slotName) {
        if (!armor || !armor.名称) return 0;
        const 品质 = normalizeQualityName(armor.品质 || '普通');
        const 等级 = safeParseInt(armor.等级, 1);
        const 品级 = safeParseInt(armor.品级, 0);
        const slotCoef = armorSlotCoef[slotName] || 1.0;
        const qualityMult = qualityMultiplier[品质] || 1.0;
        const gradeMultiplier = 1 + (品级 / 100);
        return Math.floor(等级 * slotCoef * qualityMult * gradeMultiplier);
    }

    function getAccessoryDefenseValue(accessory, slotName) {
        if (!accessory || !accessory.名称) return 0;
        const 品质 = normalizeQualityName(accessory.品质 || '普通');
        const 等级 = safeParseInt(accessory.等级, 1);
        const 品级 = safeParseInt(accessory.品级, 0);
        const slotCoef = accessorySlotCoef[slotName] || 3.0;
        const qualityMult = qualityMultiplier[品质] || 1.0;
        const gradeMultiplier = 1 + (品级 / 100);
        return Math.floor(等级 * slotCoef * qualityMult * gradeMultiplier);
    }

    function calculateArmorStats(armor, slotName) {
        if (!armor || !armor.名称) return false;
        ensureGrade(armor);
        const newDefense = getArmorDefenseValue(armor, slotName);

        if (armor.防御力 !== newDefense) {
            armor.防御力 = newDefense;
            console.log(`[装备计算] 防具 "${armor.名称}" (${slotName}): 防御力=${newDefense}`);
            return true;
        }
        return false;
    }

    function calculateAccessoryStats(accessory, slotName) {
        if (!accessory || !accessory.名称) return false;
        ensureGrade(accessory);
        const newDefense = getAccessoryDefenseValue(accessory, slotName);

        if (accessory.防御力 !== newDefense) {
            accessory.防御力 = newDefense;
            console.log(`[装备计算] 首饰 "${accessory.名称}" (${slotName}): 防御力=${newDefense}`);
            return true;
        }
        return false;
    }

    /**
     * 计算所有装备数值 (统一装备列表版)
     * @param {object} variables - stat_data
     * @param {object|null} variablesBefore - stat_data (before)，用于判断装备是否变化
     */
    function calculateEquipmentStatsForActor(actor, variables, actorName = '角色') {
        if (!actor) {
            console.log(`[装备计算调试] ${actorName}不存在，跳过`);
            return;
        }
        const 装备列表 = actor.装备列表;
        const offhandRule = getOffhandRuleState(actor);
        console.log(`[装备计算调试] 装备列表=${装备列表}, 类型=${typeof 装备列表}, keys=${装备列表 ? Object.keys(装备列表) : 'N/A'}`);
        if (!装备列表) { console.log('[装备计算调试] 装备列表不存在，跳过'); return; }

        let mainWeapon = null;
        let offWeapon = null;

        Object.entries(装备列表).forEach(([key, item]) => {
            if (!item || !item.名称) return;
            const isEquipped = !item.装备箱;
            const isSpecialEquipped = isSpecialEquippedItem(item);
            const slotName = getEquipStoredSlot(item);

            if (item.类型 === '武器') {
                if (!(isEquipped && isSpecialEquipped)) {
                    calculateWeaponStats(item, actor, variables);
                }
                if (isEquipped && !isSpecialEquipped) {
                    if (slotName === '主手') mainWeapon = item;
                    if (slotName === '副手' && offhandRule.canUseOffhandWeapon) offWeapon = item;
                }
            } else if (item.类型 === '防具' || isShieldLikeEquip(item)) {
                if (!(isEquipped && isSpecialEquipped)) {
                    const armorSlot = isShieldLikeEquip(item) ? '盾牌' : (slotName || item.部位);
                    calculateArmorStats(item, armorSlot);
                }
            } else if (item.类型 === '首饰') {
                if (!(isEquipped && isSpecialEquipped)) {
                    calculateAccessoryStats(item, slotName || item.部位);
                }
            }
        });

        // 副手合并：泰坦之握/双极武装生效时，主副武器进行合并
        if (mainWeapon && offWeapon && offhandRule.canUseOffhandWeapon) {
            const mainDice = qualityToDamageDice[normalizeQualityName(mainWeapon.品质)] || '1d6';
            const offDice = qualityToDamageDice[normalizeQualityName(offWeapon.品质)] || '1d6';
            const mainDiceForMerge = offhandRule.hasSynergy ? upgradeDice(mainDice, 1) : mainDice;
            const offhandDowngradeLevels = offhandRule.hasSynergy ? 0 : 2;
            const mergedDice = mergeMainOffhandDice(mainDiceForMerge, offDice, offhandDowngradeLevels);

            if (mainWeapon.伤害骰 !== mergedDice) {
                mainWeapon.伤害骰 = mergedDice;
                console.log(`[副手合并] 主武器伤害骰更新为: ${mergedDice}`);
            }

            const mainFixedDmg = safeParseInt(mainWeapon.固定伤害, 0);
            const offFixedDmg = safeParseInt(offWeapon.固定伤害, 0);
            const mergedFixedDmg = mainFixedDmg + Math.floor(offFixedDmg / 2);
            if (mainWeapon.固定伤害 !== mergedFixedDmg) {
                mainWeapon.固定伤害 = mergedFixedDmg;
                console.log(`[副手合并] 主武器固定伤害更新为: ${mergedFixedDmg}`);
            }
        }

        // 生成武器面板
        if (mainWeapon) {
            const attrSnapshot = buildWeaponAttrSnapshot(actor);
            const attrFixedDmg = calcAttrFixedDmg(attrSnapshot, actor.等级, variables);
            const panelFixedDmg = safeParseInt(mainWeapon.固定伤害, 0) + attrFixedDmg;
            const newPanel = {
                伤害骰: mainWeapon.伤害骰 || '',
                等级系数: mainWeapon.等级系数 || 1,
                固定伤害: panelFixedDmg
            };
            ensureCombatAttrContainer(actor);
            if (!_.isEqual(actor.战斗属性.武器面板, newPanel)) {
                actor.战斗属性.武器面板 = newPanel;
                console.log(`[武器面板] ${actorName} 已更新: ${newPanel.等级系数}×${newPanel.伤害骰}+${newPanel.固定伤害} (武器固伤${safeParseInt(mainWeapon.固定伤害, 0)} + 属性固伤${attrFixedDmg})`);
            }
        } else {
            ensureCombatAttrContainer(actor);
            const unarmedPanel = buildUnarmedWeaponPanel(actor, variables);
            if (!_.isEqual(actor.战斗属性.武器面板, unarmedPanel)) {
                actor.战斗属性.武器面板 = unarmedPanel;
                console.log(`[武器面板] ${actorName} 无主手武器，已写入空武器面板: ${unarmedPanel.等级系数}×${unarmedPanel.伤害骰}+${unarmedPanel.固定伤害}`);
            }
        }
    }

    function calculateAllEquipmentStats(variables) {
        const player = variables.人物;
        if (!player) { console.log('[装备计算调试] player不存在，跳过'); return; }
        calculateEquipmentStatsForActor(player, variables, '主角');
    }

    // ==========================================
    // 技能冷却管理系统（MVU 变量版）
    // ==========================================

    const DEFAULT_SKILL_SYSTEM_MODE = 'classic';
    const COMBO_STATE_DEFAULT = {
        当前高级组: 'alpha',
        当前显示槽: 'advanced'
    };
    const COMBO_ADVANCED_GROUP_ORDER = ['alpha', 'beta', 'gamma'];
    const COMBO_GROUP_ORDER = [...COMBO_ADVANCED_GROUP_ORDER, 'ultimate'];
    const COMBO_GROUP_SLOT_RULES = {
        alpha: [['进阶'], ['进阶'], ['必杀']],
        beta: [['进阶'], ['进阶'], ['必杀']],
        gamma: [['进阶'], ['进阶'], ['必杀']],
        ultimate: [['奥义'], ['奥义'], ['奥义']]
    };
    const COMBO_BASE_SLOT_RULES = [['基础'], ['基础'], ['基础']];
    const COMBO_CLASS_SLOT_RULES = [['转职'], ['转职'], ['转职']];
    const SKILL_TIER_KEYS = ['基础', '转职', '进阶', '必杀', '奥义', '觉醒一', '觉醒二', '觉醒三'];
    const ALL_SKILL_TIERS = ['基础', '转职', '进阶', '必杀', '奥义'];
    const SKILL_TIER_CONFIG_BY_MODE = {
        classic: {
            基础: { 冷却: 0, 伤害: { 基础: 150, 成长: 15 } },
            转职: { 冷却: 0, 伤害: { 基础: 210, 成长: 35 } },
            进阶: { 冷却: 1, 伤害: { 基础: 420, 成长: 70 } },
            必杀: { 冷却: 2, 伤害: { 基础: 980, 成长: 90 } },
            奥义: { 冷却: 3, 伤害: { 基础: 1680, 成长: 140 } },
            觉醒一: { 冷却: 3, 伤害: { 基础: 3150, 成长: 350 } },
            觉醒二: { 冷却: 4, 伤害: { 基础: 4200, 成长: 700 } },
            觉醒三: { 冷却: 5, 伤害: { 基础: 5600, 成长: 0 } }
        },
        new: {
            基础: { 冷却: 1, 伤害: { 基础: 130, 成长: 5 } },
            转职: { 冷却: 1, 伤害: { 基础: 150, 成长: 5 } },
            进阶: { 冷却: 1, 伤害: { 基础: 200, 成长: 10 } },
            必杀: { 冷却: 2, 伤害: { 基础: 300, 成长: 20 } },
            奥义: { 冷却: 3, 伤害: { 基础: 400, 成长: 25 } },
            觉醒一: { 冷却: 3, 伤害: { 基础: 500, 成长: 50 } },
            觉醒二: { 冷却: 4, 伤害: { 基础: 650, 成长: 50 } },
            觉醒三: { 冷却: 5, 伤害: { 基础: 800, 成长: 0 } }
        }
    };
    const TIER_CONFIG = SKILL_TIER_CONFIG_BY_MODE.classic;
    const DAMAGE_VERSION = 5;
    const LEGACY_SUMMON_CONFIG = {
        基础: { 基础: 110, 成长: 10 },
        转职: { 基础: 150, 成长: 25 },
        进阶: { 基础: 210, 成长: 35 },
        必杀: { 基础: 350, 成长: 30 },
        奥义: { 基础: 420, 成长: 45 }
    };
    const SUMMON_DAMAGE_RATIO_BY_TIER = {
        基础: 1.0,
        转职: 1.0,
        进阶: 0.8,
        必杀: 0.65,
        奥义: 0.5
    };

    function collectSkillTierEquipBonuses(装备列表) {
        const totals = {};
        Object.values(装备列表 || {}).forEach(eq => {
            if (!eq || !eq.名称 || eq.装备箱) return;
            const bonus = eq.属性加成 || {};
            Object.entries(bonus).forEach(([key, val]) => {
                const parsed = safeParseFloat(val, 0);
                if (parsed === 0) return;
                if (key === '全技能') {
                    ALL_SKILL_TIERS.forEach(tier => {
                        totals[tier] = safeParseFloat(totals[tier], 0) + parsed;
                    });
                    return;
                }
                if (!SKILL_TIER_KEYS.includes(key)) return;
                totals[key] = safeParseFloat(totals[key], 0) + parsed;
            });
        });
        return totals;
    }

    function getLegacySummonDamageRatioByCooldown(cooldown = 0) {
        if (cooldown <= 0) return 1;
        return Math.max(0.5, 0.8 - cooldown * 0.1);
    }

    function getSummonDamageRatioByTier(tierName = '', modeOrData = DEFAULT_COMBAT_VALUE_MODE) {
        if (normalizeCombatValueMode(typeof modeOrData === 'string' ? modeOrData : getCombatValueMode(modeOrData)) === 'new') {
            return 0.6;
        }
        return SUMMON_DAMAGE_RATIO_BY_TIER[tierName] ?? 0.5;
    }

    function getSkillTierConfig(modeOrData = DEFAULT_COMBAT_VALUE_MODE) {
        const mode = typeof modeOrData === 'string'
            ? normalizeCombatValueMode(modeOrData)
            : getCombatValueMode(modeOrData);
        return SKILL_TIER_CONFIG_BY_MODE[mode] || SKILL_TIER_CONFIG_BY_MODE.classic;
    }

    function getSkillBaseDamage(skill, modeOrData = DEFAULT_COMBAT_VALUE_MODE) {
        const tier = getSkillTierConfig(modeOrData)[skill?.阶位];
        if (!tier) return 0;
        if (skill?.类型 === '特殊' || skill?.类型 === '职业特殊') return 0;
        const level = safeParseInt(skill?.当前等级, 0);
        if (level <= 0) return 0;

        const activeBase = tier.伤害.基础 + tier.伤害.成长 * (level - 1);
        if (skill?.类型 !== '召唤') {
            return activeBase;
        }

        const ratio = getSummonDamageRatioByTier(skill?.阶位, modeOrData);
        return Math.round(activeBase * ratio);
    }

    function getLegacySummonBaseDamage(skill) {
        if (skill?.类型 !== '召唤') {
            return getSkillBaseDamage(skill, DEFAULT_COMBAT_VALUE_MODE);
        }
        const legacy = LEGACY_SUMMON_CONFIG[skill?.阶位];
        const level = safeParseInt(skill?.当前等级, 0);
        if (!legacy || level <= 0) return 0;
        return legacy.基础 + legacy.成长 * (level - 1);
    }

    function getSummonBaseDamageByVersion(skill, damageVersion = 0, modeOrData = DEFAULT_COMBAT_VALUE_MODE) {
        if (skill?.类型 !== '召唤') {
            return getSkillBaseDamage(skill, modeOrData);
        }

        const parsedVersion = Number(damageVersion || 0);
        if (parsedVersion >= 2) {
            const tier = getSkillTierConfig(modeOrData)[skill?.阶位];
            if (!tier) return 0;
            const level = safeParseInt(skill?.当前等级, 0);
            if (level <= 0) return 0;
            const activeBase = tier.伤害.基础 + tier.伤害.成长 * (level - 1);
            const ratio = normalizeCombatValueMode(typeof modeOrData === 'string' ? modeOrData : getCombatValueMode(modeOrData)) === 'new'
                ? 0.6
                : getLegacySummonDamageRatioByCooldown(tier.冷却 || 0);
            return Math.round(activeBase * ratio);
        }

        return getLegacySummonBaseDamage(skill);
    }

    function calcSkillDamage(skill, modeOrData = DEFAULT_COMBAT_VALUE_MODE) {
        const base = getSkillBaseDamage(skill, modeOrData);
        if (base <= 0) return 0;
        const floatRatio = 1 - Math.random() * 0.10;
        return Math.round(base * floatRatio / 10) * 10;
    }

    function getSkillBaseDamageByVersion(skill, level, damageVersion = DAMAGE_VERSION, modeOrData = DEFAULT_COMBAT_VALUE_MODE) {
        const normalizedLevel = Math.max(1, safeParseInt(level, 1));
        if (skill?.类型 === '召唤') {
            return getSummonBaseDamageByVersion({ ...skill, 当前等级: normalizedLevel }, damageVersion, modeOrData);
        }
        return getSkillBaseDamage({ ...skill, 当前等级: normalizedLevel }, modeOrData);
    }

    function calcFixedSkillDamageStep(skill, currentDmg, currentLevel, damageVersion = DAMAGE_VERSION, modeOrData = DEFAULT_COMBAT_VALUE_MODE) {
        if (!skill || skill.类型 === '特殊' || skill.类型 === '职业特殊') return 0;

        const normalizedLevel = Math.max(1, safeParseInt(currentLevel, 1));
        const currentBase = getSkillBaseDamageByVersion(skill, normalizedLevel, damageVersion, modeOrData);
        const nextBase = getSkillBaseDamageByVersion(skill, normalizedLevel + 1, damageVersion, modeOrData);
        const rawGrowth = Math.max(0, nextBase - currentBase);
        if (rawGrowth <= 0 || !Number.isFinite(currentDmg) || currentDmg <= 0 || currentBase <= 0) {
            return 0;
        }

        const floatRatio = currentDmg / currentBase;
        const fixedStep = Math.floor((rawGrowth * floatRatio) / 10) * 10;
        return Math.max(10, fixedStep);
    }

    function getSkillCurrentLevel(skill) {
        const lv = Number(skill?.当前等级 ?? skill?.技能等级 ?? 0);
        if (!Number.isFinite(lv)) return 0;
        return Math.max(0, Math.floor(lv));
    }

    function resolveSpecialEffectEntry(specialEffect, currentLevel) {
        if (!specialEffect) return null;
        const lv = Math.max(1, Math.floor(Number(currentLevel) || 1));

        if (typeof specialEffect === 'string') {
            const text = specialEffect.trim();
            if (!text) return null;
            return { key: String(lv), value: text };
        }

        if (typeof specialEffect !== 'object' || Array.isArray(specialEffect)) return null;

        const exactKey = String(lv);
        if (typeof specialEffect[exactKey] === 'string' && specialEffect[exactKey].trim()) {
            return { key: exactKey, value: specialEffect[exactKey] };
        }

        const numericKeys = Object.keys(specialEffect)
            .map(key => safeParseInt(key, NaN))
            .filter(key => Number.isFinite(key))
            .sort((a, b) => a - b);

        if (numericKeys.length > 0) {
            const lowerOrEqual = numericKeys.filter(key => key <= lv);
            if (lowerOrEqual.length > 0) {
                const nearest = String(lowerOrEqual[lowerOrEqual.length - 1]);
                const val = specialEffect[nearest];
                if (typeof val === 'string' && val.trim()) {
                    return { key: nearest, value: val };
                }
            }

            const smallest = String(numericKeys[0]);
            const smallestVal = specialEffect[smallest];
            if (typeof smallestVal === 'string' && smallestVal.trim()) {
                return { key: smallest, value: smallestVal };
            }
        }

        if (typeof specialEffect['无'] === 'string' && specialEffect['无'].trim()) {
            return { key: '无', value: specialEffect['无'] };
        }

        return null;
    }

    function getSpecialEffectObj(skill) {
        const currentLevel = getSkillCurrentLevel(skill);
        if (currentLevel === 0) return { '1': '无' };

        if (typeof skill?.特殊效果 === 'string') {
            const text = String(skill.特殊效果 || '').trim();
            return { '1': text || '无' };
        }

        const resolved = resolveSpecialEffectEntry(skill?.特殊效果, currentLevel);
        if (!resolved) return { '1': '无' };
        const resolvedKey = String(resolved.key || '').trim();
        const resolvedVal = String(resolved.value || '').trim() || '无';
        if (!/^\d+$/.test(resolvedKey)) return { '1': resolvedVal };
        return { [resolvedKey]: resolvedVal };
    }

    function getEffectiveSkillLevel(skill, equipBonuses = {}) {
        const baseLevel = safeParseInt(skill?.当前等级, 0);
        if (baseLevel <= 0) return 0;
        const tier = skill?.阶位 || '';
        const tierBonus = safeParseInt(equipBonuses[tier], 0);
        const effectiveLevel = baseLevel + tierBonus;
        if (tier.includes('觉醒')) {
            return Math.min(effectiveLevel, 3);
        }
        return effectiveLevel;
    }

    function resolveComboSlotDamageState(skill, existingSlot, level, statData, options = {}) {
        const currentMode = getCombatValueMode(statData);
        const legacySlotMode = existingSlot?.伤害倍率模式 ? normalizeCombatValueMode(existingSlot.伤害倍率模式) : null;
        const previousMode = options.previousCombatValueMode
            ? normalizeCombatValueMode(options.previousCombatValueMode)
            : (legacySlotMode || currentMode);
        const modeChanged = previousMode !== currentMode;
        if (!skill || skill.类型 === '特殊' || skill.类型 === '职业特殊') {
            return {
                伤害倍率: 0,
                伤害成长值: 0,
                伤害倍率版本: DAMAGE_VERSION
            };
        }

        const normalizedLevel = Math.max(1, safeParseInt(level, 1));
        const previousLevel = Math.max(1, safeParseInt(existingSlot?.技能等级, normalizedLevel));
        const previousDamage = safeParseFloat(existingSlot?.伤害倍率, 0);
        const rawPreviousVersion = Number(existingSlot?.伤害倍率版本);
        const previousVersion = Number.isFinite(rawPreviousVersion) ? rawPreviousVersion : 0;

        if (previousDamage > 0) {
            const modeOrVersionChanged = previousVersion !== DAMAGE_VERSION || modeChanged;
            if (modeOrVersionChanged) {
                const previousBase = getSkillBaseDamageByVersion(skill, previousLevel, previousVersion || DAMAGE_VERSION, previousMode);
                const floatRatio = previousBase > 0 ? previousDamage / previousBase : 0.95;
                const nextBase = getSkillBaseDamageByVersion(skill, normalizedLevel, DAMAGE_VERSION, currentMode);
                const nextDamage = Math.max(0, Math.round(nextBase * floatRatio / 10) * 10);
                return {
                    伤害倍率: nextDamage,
                    伤害成长值: calcFixedSkillDamageStep(skill, nextDamage, normalizedLevel, DAMAGE_VERSION, currentMode),
                    伤害倍率版本: DAMAGE_VERSION
                };
            }
            const needsMigration = !Number.isFinite(Number(existingSlot?.伤害成长值));
            let damageStep = Number(existingSlot?.伤害成长值);
            if (!Number.isFinite(damageStep) || damageStep < 0 || needsMigration) {
                damageStep = calcFixedSkillDamageStep(
                    skill,
                    previousDamage,
                    previousLevel,
                    previousVersion || DAMAGE_VERSION,
                    currentMode
                );
            }
            const levelDiff = normalizedLevel - previousLevel;
            return {
                伤害倍率: levelDiff === 0 ? previousDamage : Math.max(0, previousDamage + damageStep * levelDiff),
                伤害成长值: damageStep,
                伤害倍率版本: DAMAGE_VERSION
            };
        }

        const initialDamage = calcSkillDamage({ ...skill, 当前等级: normalizedLevel }, currentMode);
        return {
            伤害倍率: initialDamage,
            伤害成长值: calcFixedSkillDamageStep(skill, initialDamage, normalizedLevel, DAMAGE_VERSION, currentMode),
            伤害倍率版本: DAMAGE_VERSION
        };
    }

    function normalizeSkillSystemMode(mode) {
        return mode === 'combo' ? 'combo' : DEFAULT_SKILL_SYSTEM_MODE;
    }

    function getSkillSystemMode(statData) {
        return normalizeSkillSystemMode(statData?.系统配置?.技能系统模式);
    }

    function createFixedSlotArray(values, size = 3) {
        return Array.from({ length: size }, (_, index) => (values && values[index]) || '');
    }

    function getComboSkillState(statData) {
        const raw = statData?.系统配置?.组合技能状态 || {};
        return {
            当前高级组: COMBO_ADVANCED_GROUP_ORDER.includes(raw.当前高级组) ? raw.当前高级组 : COMBO_STATE_DEFAULT.当前高级组,
            当前显示槽: raw.当前显示槽 === 'ultimate' ? 'ultimate' : COMBO_STATE_DEFAULT.当前显示槽,
            custom: raw.custom === true
        };
    }

    function getLearnedSkillNamesByTier(statData, tierName) {
        const 技能列表 = statData?.人物?.技能树?.技能列表 || {};
        return Object.entries(技能列表)
            .filter(([_, skill]) => skill?.阶位 === tierName && safeParseInt(skill?.当前等级, 0) > 0)
            .map(([name]) => name);
    }

    function sanitizeComboSlotSkillName(skillList, skillName, allowedTiers) {
        if (!skillName) return '';
        const skill = skillList ? skillList[skillName] : null;
        if (!skill || safeParseInt(skill?.当前等级, 0) <= 0) return '';
        if (Array.isArray(allowedTiers) && allowedTiers.length > 0 && !allowedTiers.includes(skill.阶位)) return '';
        return skillName;
    }

    function normalizeComboSlotArray(skillList, rawSlots, slotRules) {
        return slotRules.map((allowedTiers, index) => sanitizeComboSlotSkillName(skillList, rawSlots ? rawSlots[index] : '', allowedTiers));
    }

    function getDefaultComboEquipState(statData) {
        const comboState = getComboSkillState(statData);
        const 基础 = getLearnedSkillNamesByTier(statData, '基础');
        const 转职 = getLearnedSkillNamesByTier(statData, '转职');
        const 进阶 = getLearnedSkillNamesByTier(statData, '进阶');
        const 必杀 = getLearnedSkillNamesByTier(statData, '必杀');
        const 奥义 = getLearnedSkillNamesByTier(statData, '奥义');
        return {
            当前高级组: comboState.当前高级组,
            当前显示槽: comboState.当前显示槽,
            custom: comboState.custom === true,
            基础技能槽: createFixedSlotArray(基础.slice(0, 3)),
            转职技能槽: createFixedSlotArray(转职.slice(0, 3)),
            高级技能组配置: {
                alpha: createFixedSlotArray([进阶[0], 进阶[1], 必杀[0]]),
                beta: createFixedSlotArray([进阶[1], 进阶[2], 必杀[1]]),
                gamma: createFixedSlotArray([进阶[2], 进阶[0], 必杀[2]]),
                ultimate: createFixedSlotArray(奥义.slice(0, 3))
            }
        };
    }

    function getComboEquipState(statData, stateOverride = null) {
        const skillList = statData?.人物?.技能树?.技能列表 || {};
        const rawState = statData?.系统配置?.组合技能状态 || {};
        const mergedState = stateOverride ? {
            ...rawState,
            ...stateOverride,
            高级技能组配置: {
                ...(rawState.高级技能组配置 || {}),
                ...((stateOverride && stateOverride.高级技能组配置) || {})
            }
        } : rawState;
        const defaults = getDefaultComboEquipState(statData);
        const currentGroup = COMBO_ADVANCED_GROUP_ORDER.includes(mergedState.当前高级组)
            ? mergedState.当前高级组
            : defaults.当前高级组;
        return {
            当前高级组: currentGroup,
            当前显示槽: mergedState.当前显示槽 === 'ultimate' ? 'ultimate' : defaults.当前显示槽,
            custom: mergedState.custom === true,
            基础技能槽: normalizeComboSlotArray(skillList, mergedState.基础技能槽 || defaults.基础技能槽, COMBO_BASE_SLOT_RULES),
            转职技能槽: normalizeComboSlotArray(skillList, mergedState.转职技能槽 || defaults.转职技能槽, COMBO_CLASS_SLOT_RULES),
            高级技能组配置: {
                alpha: normalizeComboSlotArray(skillList, (mergedState.高级技能组配置 && mergedState.高级技能组配置.alpha) || defaults.高级技能组配置.alpha, COMBO_GROUP_SLOT_RULES.alpha),
                beta: normalizeComboSlotArray(skillList, (mergedState.高级技能组配置 && mergedState.高级技能组配置.beta) || defaults.高级技能组配置.beta, COMBO_GROUP_SLOT_RULES.beta),
                gamma: normalizeComboSlotArray(skillList, (mergedState.高级技能组配置 && mergedState.高级技能组配置.gamma) || defaults.高级技能组配置.gamma, COMBO_GROUP_SLOT_RULES.gamma),
                ultimate: normalizeComboSlotArray(skillList, (mergedState.高级技能组配置 && mergedState.高级技能组配置.ultimate) || defaults.高级技能组配置.ultimate, COMBO_GROUP_SLOT_RULES.ultimate)
            }
        };
    }

    function ensureComboSkillState(statData) {
        if (!statData.系统配置) statData.系统配置 = {};
        const next = getComboEquipState(statData);
        statData.系统配置.组合技能状态 = next;
        return next;
    }

    function getComboSlotPlan(statData, stateOverride = null) {
        const 技能列表 = statData?.人物?.技能树?.技能列表 || {};
        const state = getComboEquipState(statData, stateOverride);
        const toEntry = (skillName) => skillName ? [skillName, 技能列表[skillName] || {}] : null;
        const advancedGroups = Object.fromEntries(COMBO_GROUP_ORDER.map((groupKey) => [
            groupKey,
            (state.高级技能组配置[groupKey] || []).map(toEntry).filter(Boolean)
        ]));
        const advancedSlots = advancedGroups[state.当前高级组] || [];
        const ultimateSlots = advancedGroups.ultimate || [];
        return {
            state,
            baseSlots: [...state.基础技能槽.map(toEntry), ...state.转职技能槽.map(toEntry)],
            advancedGroups,
            advancedSlots,
            ultimateSlots,
            displaySlots: state.当前显示槽 === 'ultimate' ? ultimateSlots : advancedSlots
        };
    }

    function buildComboSlotSkillData(skillName, skill, existingSlot, equipBonuses = {}, statData = null) {
        const nextSlot = existingSlot ? { ...existingSlot } : {};
        const effectiveLevel = Math.max(1, getEffectiveSkillLevel(skill, equipBonuses) || safeParseInt(nextSlot.技能等级, 1));
        const damageState = resolveComboSlotDamageState(skill, existingSlot, effectiveLevel, statData);
        nextSlot.名称 = skillName;
        nextSlot.类型 = skill?.类型 || nextSlot.类型 || '主动';
        nextSlot.技能等级 = effectiveLevel;
        nextSlot.冷却中 = nextSlot.冷却中 === true || safeParseInt(skill?.冷却计数, 0) > 0;
        nextSlot.伤害倍率 = damageState.伤害倍率;
        nextSlot.伤害成长值 = damageState.伤害成长值;
        nextSlot.伤害倍率版本 = damageState.伤害倍率版本;
        if (Object.prototype.hasOwnProperty.call(nextSlot, '伤害倍率模式')) delete nextSlot.伤害倍率模式;
        nextSlot.阶位 = skill?.阶位 || nextSlot.阶位 || '基础';
        nextSlot.描述 = skill?.描述 || nextSlot.描述 || '';
        nextSlot.特殊效果 = getSpecialEffectObj({ ...skill, 当前等级: effectiveLevel });
        if (skill?.召唤物名称) nextSlot.召唤物名称 = skill.召唤物名称;
        else if (nextSlot.召唤物名称) delete nextSlot.召唤物名称;
        return nextSlot;
    }

    function syncComboActiveSlots(statData) {
        if (getSkillSystemMode(statData) !== 'combo') return;
        const 人物 = statData?.人物;
        if (!人物) return;
        const 技能列表 = 人物?.技能树?.技能列表 || {};
        const currentSlots = 人物.主动技能槽 || {};
        const equipBonuses = collectSkillTierEquipBonuses(人物?.装备列表 || {});
        const plan = getComboSlotPlan(statData);
        const nextSlots = {};
        console.log(`[组合切换] sync前槽位 currentKeys=[${Object.keys(currentSlots).join(', ')}] currentCooling=[${Object.entries(currentSlots).filter(([_, slot]) => slot?.冷却中 === true).map(([name]) => name).join(', ')}]`);
        console.log(`[组合切换] sync槽位计划 base=[${plan.baseSlots.map(entry => entry?.[0] || '').join(', ')}] display=[${plan.displaySlots.map(entry => entry?.[0] || '').join(', ')}]`);
        [...plan.baseSlots, ...plan.displaySlots].forEach(entry => {
            if (!entry) return;
            const [skillName, skill] = entry;
            const treeSkill = 技能列表[skillName] || skill;
            nextSlots[skillName] = buildComboSlotSkillData(skillName, treeSkill, currentSlots[skillName], equipBonuses, statData);
        });
        console.log(`[组合切换] sync后候选 nextKeys=[${Object.keys(nextSlots).join(', ')}] nextCooling=[${Object.entries(nextSlots).filter(([_, slot]) => slot?.冷却中 === true).map(([name]) => name).join(', ')}]`);
        if (!_.isEqual(currentSlots, nextSlots)) {
            人物.主动技能槽 = nextSlots;
            console.log(`[组合切换] sync已写入主动技能槽`);
        } else {
            console.log(`[组合切换] sync无需改动主动技能槽`);
        }
    }

    function clearComboActiveSlots(statData) {
        const 人物 = statData?.人物;
        if (!人物) return;
        人物.主动技能槽 = {};
        人物.觉醒技能槽 = {};
    }

    function handleComboBattleEntry(statData, statDataBefore) {
        if (getSkillSystemMode(statData) !== 'combo') return false;
        const 战斗中 = statData?.战斗?.是否战斗中 === true;
        const 战斗前 = statDataBefore?.战斗?.是否战斗中 === true;
        if (!战斗中 || 战斗前) return false;
        const currentState = ensureComboSkillState(statData);
        if (currentState.custom === true) {
            console.log('[组合切换] custom=true，进入战斗时不重置高级组/显示槽');
            return false;
        }
        currentState.当前高级组 = 'alpha';
        currentState.当前显示槽 = 'advanced';
        return true;
    }

    function syncSkillSlotsByMode(statData, statDataBefore, opts = {}) {
        const { syncComboSlots = false } = opts;
        const 人物 = statData?.人物;
        if (!人物) return;
        if (!人物.主动技能槽) 人物.主动技能槽 = {};
        if (!人物.觉醒技能槽) 人物.觉醒技能槽 = {};

        const currentMode = getSkillSystemMode(statData);
        const prevMode = getSkillSystemMode(statDataBefore || {});
        const comboState = currentMode === 'combo' ? ensureComboSkillState(statData) : null;
        const shouldSyncCustomComboSlots = currentMode === 'combo' && comboState?.custom === true;

        if (currentMode === 'combo') {
            if (syncComboSlots || shouldSyncCustomComboSlots) syncComboActiveSlots(statData);
            else if (prevMode !== 'combo') clearComboActiveSlots(statData);
            return;
        }

        if (prevMode === 'combo') {
            clearComboActiveSlots(statData);
        }
    }

    function syncEquippedSkillSlotDamageState(statData, options = {}) {
        const 人物 = statData?.人物;
        const 技能列表 = 人物?.技能树?.技能列表 || {};
        if (!人物 || !技能列表) return;
        const equipBonuses = collectSkillTierEquipBonuses(人物?.装备列表 || {});
        ['主动技能槽', '觉醒技能槽'].forEach(slotKey => {
            const slots = 人物?.[slotKey];
            if (!slots || typeof slots !== 'object') return;
            Object.entries(slots).forEach(([skillName, slotData]) => {
                if (!slotData || typeof slotData !== 'object') return;
                const skill = 技能列表[skillName];
                if (!skill) return;
                const effectiveLevel = Math.max(1, getEffectiveSkillLevel(skill, equipBonuses) || safeParseInt(slotData.技能等级, 1));
                const damageState = resolveComboSlotDamageState(skill, slotData, effectiveLevel, statData, options);
                slotData.名称 = skillName;
                slotData.类型 = skill?.类型 || slotData.类型 || '主动';
                slotData.技能等级 = effectiveLevel;
                slotData.伤害倍率 = damageState.伤害倍率;
                slotData.伤害成长值 = damageState.伤害成长值;
                slotData.伤害倍率版本 = damageState.伤害倍率版本;
                if (Object.prototype.hasOwnProperty.call(slotData, '伤害倍率模式')) delete slotData.伤害倍率模式;
                slotData.阶位 = skill?.阶位 || slotData.阶位 || '基础';
                slotData.描述 = skill?.描述 || slotData.描述 || '';
                slotData.特殊效果 = getSpecialEffectObj({ ...skill, 当前等级: effectiveLevel });
                if (skill?.召唤物名称) slotData.召唤物名称 = skill.召唤物名称;
                else if (slotData.召唤物名称) delete slotData.召唤物名称;
            });
        });
    }

    function collectComboRoundUsage(statData, statDataBefore) {
        if (getSkillSystemMode(statData) !== 'combo') return;
        const currentSlots = statData?.人物?.主动技能槽 || {};
        const prevSlots = statDataBefore?.人物?.主动技能槽 || {};
        const usedSet = new Set();
        Object.entries(currentSlots).forEach(([skillName, slot]) => {
            if (slot?.冷却中 === true && prevSlots?.[skillName]?.冷却中 !== true) {
                usedSet.add(skillName);
            }
        });
        console.log(`[组合切换] 本回合技能使用检测 current=[${Object.entries(currentSlots).filter(([_, slot]) => slot?.冷却中 === true).map(([name]) => name).join(', ')}] prev=[${Object.entries(prevSlots).filter(([_, slot]) => slot?.冷却中 === true).map(([name]) => name).join(', ')}] used=[${Array.from(usedSet).join(', ')}]`);
        return Array.from(usedSet);
    }

    function advanceComboSkillState(statData, statDataBefore, roundUsedSkillNames = []) {
        if (getSkillSystemMode(statData) !== 'combo') return false;
        const currentState = ensureComboSkillState(statData);
        if (currentState.custom === true) {
            console.log('[组合切换] custom=true，跳过辅助脚本自动切换');
            return false;
        }
        const prevGroup = currentState.当前高级组;
        const prevDisplay = currentState.当前显示槽;
        const 战斗中 = statData?.战斗?.是否战斗中 === true;
        console.log(`[组合切换] 开始推进 战斗中=${战斗中} prevGroup=${prevGroup} prevDisplay=${prevDisplay} used=[${roundUsedSkillNames.join(', ')}]`);

        if (!战斗中) {
            currentState.当前显示槽 = 'advanced';
            console.log(`[组合切换] 非战斗，重置显示槽为 advanced`);
            return prevGroup !== currentState.当前高级组 || prevDisplay !== currentState.当前显示槽;
        }

        if (roundUsedSkillNames.length <= 0) {
            console.log(`[组合切换] 跳过推进：本次没有检测到新进入冷却的技能`);
            return false;
        }

        const finishedRoundState = {
            当前高级组: ['alpha', 'beta', 'gamma'].includes(currentState.当前高级组) ? currentState.当前高级组 : 'alpha',
            当前显示槽: currentState.当前显示槽 === 'ultimate' ? 'ultimate' : 'advanced'
        };
        const finishedRoundPlan = getComboSlotPlan(statData, finishedRoundState);
        const usedSet = new Set(roundUsedSkillNames);
        const baseNames = finishedRoundPlan.baseSlots.map(entry => entry?.[0] || '');
        const finishedRoundGroup = finishedRoundState.当前高级组;
        let targetGroup = finishedRoundGroup;
        console.log(`[组合切换] 基础/转职槽位 baseNames=${JSON.stringify(baseNames)} finishedRoundGroup=${finishedRoundGroup}`);
        console.log(`[组合切换] 触发判定 alpha=${!!(baseNames[0] && baseNames[1] && usedSet.has(baseNames[0]) && usedSet.has(baseNames[1]))} beta=${!!(baseNames[2] && baseNames[3] && usedSet.has(baseNames[2]) && usedSet.has(baseNames[3]))} gamma=${!!(baseNames[4] && baseNames[5] && usedSet.has(baseNames[4]) && usedSet.has(baseNames[5]))}`);

        if (baseNames[0] && baseNames[1] && usedSet.has(baseNames[0]) && usedSet.has(baseNames[1])) targetGroup = 'alpha';
        else if (baseNames[2] && baseNames[3] && usedSet.has(baseNames[2]) && usedSet.has(baseNames[3])) targetGroup = 'beta';
        else if (baseNames[4] && baseNames[5] && usedSet.has(baseNames[4]) && usedSet.has(baseNames[5])) targetGroup = 'gamma';

        const targetAdvancedEntries = finishedRoundPlan.advancedGroups[targetGroup] || [];
        const hasConfiguredAdvancedGroup = targetAdvancedEntries.length > 0;
        currentState.当前高级组 = hasConfiguredAdvancedGroup ? targetGroup : finishedRoundGroup;
        if (!hasConfiguredAdvancedGroup && targetGroup !== finishedRoundGroup) {
            console.log(`[组合切换] 目标高级组 ${targetGroup} 未配置任何技能，保持当前组 ${finishedRoundGroup}`);
        }
        console.log(`[组合切换] 高级组切换结果 nextGroup=${currentState.当前高级组}`);

        if (finishedRoundState.当前显示槽 === 'ultimate') {
            const ultimateEntries = finishedRoundPlan.ultimateSlots;
            const hasConfiguredUltimate = ultimateEntries.length > 0;
            const allUltimateCooling = hasConfiguredUltimate && ultimateEntries.every(([skillName]) => {
                const treeSkill = statData?.人物?.技能树?.技能列表?.[skillName];
                const slotSkill = statData?.人物?.主动技能槽?.[skillName];
                return slotSkill?.冷却中 === true || safeParseInt(treeSkill?.冷却计数, 0) > 0;
            });
            currentState.当前显示槽 = (!hasConfiguredUltimate || allUltimateCooling) ? 'advanced' : 'ultimate';
            console.log(`[组合切换] 当前显示槽原本为 ultimate，hasConfiguredUltimate=${hasConfiguredUltimate} allUltimateCooling=${allUltimateCooling} -> nextDisplay=${currentState.当前显示槽}`);
        } else {
            const finishedRoundAdvancedEntries = finishedRoundPlan.advancedGroups[currentState.当前高级组] || [];
            const justCoolingCount = finishedRoundAdvancedEntries.reduce((count, [skillName]) => {
                return count + (usedSet.has(skillName) ? 1 : 0);
            }, 0);
            const hasConfiguredUltimate = finishedRoundPlan.ultimateSlots.length > 0;
            const hasReadyUltimate = hasConfiguredUltimate && finishedRoundPlan.ultimateSlots.some(([skillName]) => {
                const treeSkill = statData?.人物?.技能树?.技能列表?.[skillName];
                return safeParseInt(treeSkill?.冷却计数, 0) <= 0;
            });
            currentState.当前显示槽 = (justCoolingCount >= 2 && hasReadyUltimate) ? 'ultimate' : 'advanced';
            console.log(`[组合切换] 终结组判定 justCoolingCount=${justCoolingCount} hasConfiguredUltimate=${hasConfiguredUltimate} hasReadyUltimate=${hasReadyUltimate} -> nextDisplay=${currentState.当前显示槽}`);
        }
        console.log(`[组合切换] 推进结束 changed=${prevGroup !== currentState.当前高级组 || prevDisplay !== currentState.当前显示槽} finalGroup=${currentState.当前高级组} finalDisplay=${currentState.当前显示槽}`);
        return prevGroup !== currentState.当前高级组 || prevDisplay !== currentState.当前显示槽;
    }

    function getSkillCooldownByTier(tierName = '', modeOrData = DEFAULT_COMBAT_VALUE_MODE) {
        const config = getSkillTierConfig(modeOrData);
        return Math.max(0, safeParseInt(config?.[tierName]?.冷却, 0));
    }

    function getAllSlotSkills(statData) {
        const 人物 = statData?.人物;
        if (!人物) return {};
        return {
            ...(人物.主动技能槽 || {}),
            ...(人物.觉醒技能槽 || {})
        };
    }

    function detectPhaseShift(statData, statDataBefore) {
        const newEffects = statData?.人物?.状态效果 || {};
        const oldEffects = statDataBefore?.人物?.状态效果 || {};

        for (const name of Object.keys(newEffects)) {
            if (name.includes('相位转移') && name.includes('冷却')) {
                if (!oldEffects[name] || JSON.stringify(oldEffects[name]) !== JSON.stringify(newEffects[name])) {
                    console.log(`[冷却系统] 检测到相位转移: "${name}"`);
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 处理技能冷却逻辑（MVU 变量版）
     *
     * 冷却规则：释放回合不算入冷却。
     *   冷却N 的含义：释放后需再等 N 个回合才可用。
     *   例：冷却1(进阶) → 释放回合后等1轮可用
     *       冷却2(必杀) → 释放回合后等2轮可用
     *       冷却3(奥义) → 释放回合后等3轮可用
     *
     * 冷却计数 存在技能树上，表示"还需等待的轮数"：
     *   进入冷却时按当前战斗数值模式写入阶位冷却
     *   每轮推进 -1，降到 0 时清除 冷却中
     *   释放回合轮次不变，所以不会被递减
     */
    let _lastRound = -1;

    function handleSkillCooldowns(statData, statDataBefore) {
        const allSlotSkills = getAllSlotSkills(statData);
        const 技能列表 = statData?.人物?.技能树?.技能列表 || {};
        const 当前轮次 = statData?.战斗?.当前轮次 || 0;
        const 上次轮次 = statDataBefore?.战斗?.当前轮次 ?? _lastRound;

        // 无条件诊断日志：确认函数被调用
        const slotNames = Object.keys(allSlotSkills);
        const coolingSkills = Object.entries(allSlotSkills)
            .filter(([_, s]) => s.冷却中 === true)
            .map(([n]) => {
                const treeSkill = 技能列表[n];
                return `${n}(${treeSkill?.冷却计数 || 0})`;
            });
        console.log(`[冷却系统] 轮次=${当前轮次}(上次=${上次轮次}), _lastRound=${_lastRound}, 技能槽=${slotNames.length}个, 冷却中: [${coolingSkills.join(', ')}]`);

        // 1. 轮次推进 → 已有冷却计数的技能递减
        const justExpired = new Set(); // 记录本帧刚递减到0的技能
        if (当前轮次 > 上次轮次 && 上次轮次 >= 0) {
            const delta = 当前轮次 - 上次轮次;
            for (const [name, treeSkill] of Object.entries(技能列表)) {
                if (treeSkill.冷却计数 > 0) {
                    const before = treeSkill.冷却计数;
                    treeSkill.冷却计数 = Math.max(0, treeSkill.冷却计数 - delta);
                    console.log(`[冷却系统] 轮次推进(+${delta})：「${name}」冷却计数 ${before}→${treeSkill.冷却计数}`);
                    if (treeSkill.冷却计数 <= 0) {
                        justExpired.add(name);
                    }
                }
            }
        }

        // 2. 相位转移 → 额外 -1
        const phaseShift = detectPhaseShift(statData, statDataBefore);
        if (phaseShift) {
            for (const [name, treeSkill] of Object.entries(技能列表)) {
                if (treeSkill.冷却计数 > 0) {
                    treeSkill.冷却计数 = Math.max(0, treeSkill.冷却计数 - 1);
                    console.log(`[冷却系统] 相位转移：「${name}」冷却计数→${treeSkill.冷却计数}`);
                    if (treeSkill.冷却计数 <= 0) {
                        justExpired.add(name);
                    }
                }
            }
        }

        // 3. 新进入冷却检测
        //    条件：冷却中=true 且 冷却计数<=0 且 不是本帧刚递减到0的（那些是冷却结束，不是新冷却）
        for (const [name, slotSkill] of Object.entries(allSlotSkills)) {
            if (slotSkill.冷却中 !== true) continue;
            if (justExpired.has(name)) continue; // 本帧刚递减到0，是冷却结束不是新冷却

            const treeSkill = 技能列表[name];
            if (!treeSkill) continue;
            if (treeSkill.冷却计数 > 0) continue; // 已在倒计时中

            const tier = slotSkill.阶位 || treeSkill.阶位 || '基础';
            const tierCD = getSkillCooldownByTier(tier, statData);
            if (tierCD <= 0) {
                // 基础/转职：无冷却，立即恢复
                slotSkill.冷却中 = false;
                treeSkill.冷却计数 = 0;
                console.log(`[冷却系统] 技能「${name}」阶位=${tier}，无冷却，立即恢复`);
            } else {
                treeSkill.冷却计数 = tierCD;
                console.log(`[冷却系统] 技能「${name}」进入冷却，阶位=${tier}，等待轮数=${tierCD}`);
            }
        }

        // 4. 冷却计数归零 → 恢复可用
        for (const [name, slotSkill] of Object.entries(allSlotSkills)) {
            const treeSkill = 技能列表[name];
            if (slotSkill.冷却中 === true && treeSkill && treeSkill.冷却计数 <= 0) {
                slotSkill.冷却中 = false;
                treeSkill.冷却计数 = 0;
                console.log(`[冷却系统] 「${name}」冷却结束，已恢复可用`);
            }
        }

        // 5. 战斗结束 → 清空所有冷却
        if (当前轮次 === 0 && !statData?.战斗?.是否战斗中) {
            for (const [name, slotSkill] of Object.entries(allSlotSkills)) {
                if (slotSkill.冷却中 === true) {
                    slotSkill.冷却中 = false;
                }
            }
            for (const [name, treeSkill] of Object.entries(技能列表)) {
                if (treeSkill.冷却计数 > 0) {
                    treeSkill.冷却计数 = 0;
                    console.log(`[冷却系统] 战斗结束：「${name}」冷却已清空`);
                }
            }
        }

        _lastRound = 当前轮次;
    }

    function hasEquippedComboSkill(player) {
        const comboSlot = player?.连携奥义槽;
        if (!comboSlot || typeof comboSlot !== 'object') return false;
        return String(comboSlot.技能名 || '').trim().length > 0;
    }

    function handleComboCpRecovery(statData, statDataBefore) {
        const player = statData?.人物;
        if (!player) return;
        if (statData?.战斗?.是否战斗中 !== true) return;
        if (statDataBefore?.战斗?.是否战斗中 !== true) return;
        if (!hasEquippedComboSkill(player)) return;

        const 当前轮次 = safeParseInt(statData?.战斗?.当前轮次, 0);
        const 上次轮次 = safeParseInt(statDataBefore?.战斗?.当前轮次, 当前轮次);
        const 轮次差 = 当前轮次 - 上次轮次;
        if (轮次差 <= 0) return;

        const beforeCP = clamp(safeParseFloat(player.CP, 0), 0, 100);
        const nextCP = clamp(beforeCP + 20 * 轮次差, 0, 100);
        if (player.CP !== nextCP) {
            player.CP = nextCP;
        }
        if (nextCP > beforeCP) {
            const comboName = String(player.连携奥义槽?.技能名 || '').trim();
            console.log(`[连携CP] 战斗轮次推进(+${轮次差})，已装备连携「${comboName}」，CP ${beforeCP}→${nextCP}`);
        }
    }

    // ==========================================
    // 变量守卫：拦截 AI 对受保护字段的非法修改
    // ==========================================

    const PROTECTED_PATHS = [
        '人物.等级',
        '人物.升级阈值',
    ];

    function getByPath(obj, path) {
        return path.split('.').reduce((o, k) => o?.[k], obj);
    }

    function setByPath(obj, path, value) {
        const keys = path.split('.');
        let cur = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            if (cur[keys[i]] === undefined) return;
            cur = cur[keys[i]];
        }
        cur[keys[keys.length - 1]] = value;
    }

    const BOND_BRIEF_PATH_PREFIX = '/羁绊列表/';

    function clonePlainValue(value) {
        if (value === undefined) return undefined;
        if (typeof _ !== 'undefined' && _?.cloneDeep) return _.cloneDeep(value);
        return JSON.parse(JSON.stringify(value));
    }

    function selectStarterModeEffect(source, mode) {
        if (!source || typeof source !== 'object') return undefined;
        const effectKey = normalizeCombatValueMode(mode) === 'new' ? '新版效果' : '经典效果';
        if (source[effectKey] !== undefined) return clonePlainValue(source[effectKey]);
        if (source.效果 !== undefined) return clonePlainValue(source.效果);
        return undefined;
    }

    function applyStarterTemplateEffectsByMode(value, mode) {
        if (!value || typeof value !== 'object') return value;
        if (Array.isArray(value)) {
            value.forEach(item => applyStarterTemplateEffectsByMode(item, mode));
            return value;
        }

        const selectedEffect = selectStarterModeEffect(value, mode);
        if (selectedEffect !== undefined) {
            value.效果 = selectedEffect;
        }
        delete value.经典效果;
        delete value.新版效果;

        Object.entries(value).forEach(([key, child]) => {
            if (key === '效果') return;
            if (child && typeof child === 'object') {
                applyStarterTemplateEffectsByMode(child, mode);
            }
        });

        return value;
    }

    const STARTER_TEAMMATE_TEMPLATE_MAP = {
        '法露特': {
            性别: '女',
            附近: true,
            种族: '幻想种',
            等级: 95,
            属性: { 力量: 28, 敏捷: 24, 体质: 26, 智力: 14, 感知: 18, 魅力: 26 },
            装备列表: {
                '黑暗龙枪': {
                    类型: '武器', 部位: '主手', 名称: '黑暗龙枪', 品质: '史诗', 等级: 95, 强化等级: 0,
                    属性加成: { 力量: 2, 体质: 2 },
                    效果: '[天恩] 在户外或空中时，全属性检定+2;[龙威] 对[龙族]或[非传奇怪物]造成伤害时，目标需进行意志检定，失败则[战栗](AC-2);[绝技·坠星枪] 仅在飞行或高处时可用。发起毁灭性俯冲，本次攻击伤害骰翻倍。若击杀目标，立即刷新当轮动作，可再次行动。',
                    描述: '法露特的爱枪，黑白双色的巨大骑枪。据说枪尖不仅沾染过无数巨龙的鲜血，更曾刺穿过天穹的流星。握持此枪者，视大地为猎场。',
                    装备箱: false
                },
                '黑金重铠': {
                    类型: '防具', 部位: '上衣', 名称: '黑金重铠', 品质: '卓越', 等级: 95, 强化等级: 0,
                    属性加成: { 体质: 8, 物理减伤: 15, 生命值上限: 500 },
                    效果: '[不动] 作为重甲却视为轻甲，不影响灵巧判定。免疫[击退]、[倒地]效果;[逆鳞] 任何对穿戴者造成伤害的近战攻击者，都将受到等同于穿戴者(体质调整值)d6的反弹伤害;[主动·龙语护盾] 每日1次，当HP归零时由0转1，并获得持续1轮的[无敌]状态。',
                    描述: '肩甲与胸甲造型华丽的黑金色重型铠甲。与其说是护具，不如说是黑龙之皮的延伸，会随着主人的战意像呼吸般律动。',
                    装备箱: false
                }
            },
            技能: {
                '黑暗龙骑': { 品质: '史诗', 类型: '伤害', 经典效果: '驾驭魔龙自高空俯冲轰击地面区域，攻击造成[1000% + 25% × (等级 - 1)]物理伤害；命中的敌人需进行一次意志检定，失败则陷入[战栗](AC-2)1轮。', 新版效果: '驾驭魔龙自高空俯冲轰击地面区域，攻击造成[280% + 4% × (等级 - 1)]物理伤害；命中的敌人需进行一次意志检定，失败则陷入[战栗](AC-2)1轮。', 描述: '召唤黑龙坐骑从天而降，双枪贯穿大地，龙威所及之处万物战栗。' },
                '龙威释放': { 品质: '传说', 类型: '特殊', 经典效果: '释放天空霸主的斗气，等级低于自身20级以上的敌人自动陷入[恐惧]，无法行动1轮；其余敌人本轮第一次攻击检定-2。', 新版效果: '释放天空霸主的斗气，等级低于自身20级以上的敌人自动陷入[恐惧]，无法行动1轮；其余敌人本轮第一次攻击检定-2。', 描述: '仅凭气势便让弱者双膝跪地，这是统御天空的霸主与生俱来的王者之威。' }
            },
            外貌: '漆黑长发、血红双瞳的龙角少女，头顶一对向后弯曲的漆黑龙角，角根处有金色环饰，眉头常微皱保持威严。',
            着装: '黑金色重型铠甲配百褶短裙，肩甲华丽如龙翼，领口系红色飘带，黑色过膝重甲靴缀龙纹护甲。',
            好感度: 20,
            同行誓约: false,
            连携奥义: {}
        },
        '红莲': {
            性别: '女',
            附近: true,
            种族: '人类种',
            等级: 1,
            属性: { 力量: 16, 敏捷: 20, 体质: 15, 智力: 10, 感知: 16, 魅力: 14 },
            装备列表: {
                '花无十日红': {
                    类型: '武器', 部位: '主手', 名称: '花无十日红', 品质: '史诗', 等级: 1, 强化等级: 0,
                    属性加成: { 敏捷: 2, 感知: 1, 全技能: 2 },
                    经典效果: '[藏花] 当你以居合、拔刀或追击姿态发动近战攻击时触发，该次攻击检定+4，且暴击阈值视为降低2;[血振] 当你的近战攻击命中时触发，获得1层[血振]，持续到战斗结束，最多5层；每层使你的近战攻击最终伤害+6%，每次获得[血振]后失去1%当前生命值;[红花尽] 当你在本轮第2或第3个独立动作发动近战攻击时，可消耗1层[血振]抵消3点连击命中减值；若该攻击命中倍率大于0，目标附加[流血]2轮;[十日红] 每战1次，当HP不高于25%或[血振]达到5层时可发动。进行一次15码直线斩击，造成[1000% + 25% × (等级 - 1)]物理伤害，必定命中；结算后清空[血振]，并失去25%当前生命值，最低保留1点。',
                    新版效果: '[藏花] 当你以居合、拔刀或追击姿态发动近战攻击时触发，该次攻击检定+4，且暴击阈值视为降低2;[血振] 当你的近战攻击命中时触发，获得1层[血振]，持续到战斗结束，最多5层；每层使你的近战攻击最终伤害+6%，每次获得[血振]后失去1%当前生命值;[红花尽] 当你在本轮第2或第3个独立动作发动近战攻击时，可消耗1层[血振]抵消3点连击命中减值；若该攻击命中倍率大于0，目标附加[流血]2轮;[十日红] 每战1次，当HP不高于25%或[血振]达到5层时可发动。进行一次15码直线斩击，造成[280% + 4% × (等级 - 1)]物理伤害，必定命中；结算后清空[血振]，并失去25%当前生命值，最低保留1点。',
                    描述: '继承自姐姐薔花的黑鞘太刀，刀身极细。花开极研之时，便是凋零之始。',
                    装备箱: false
                },
                '红白和风战衣': {
                    类型: '防具', 部位: '上衣', 名称: '红白和风战衣', 品质: '精良', 等级: 1, 强化等级: 0,
                    属性加成: { 敏捷: 2 },
                    效果: '轻便灵动，略微提升闪避率。',
                    描述: '白色为主的和风宽袖战衣，领口与袖口饰有红色镶边，便于挥刀。',
                    装备箱: false
                }
            },
            技能: {
                '花无十日红': { 品质: '传说', 类型: '伤害', 经典效果: '居合拔刀斩出超高速剑气，攻击造成[800% + 20% × (等级 - 1)]物理伤害；若本轮已连续发动过攻击，则该次最终伤害额外+20%，自身失去5%当前生命值。', 新版效果: '居合拔刀斩出超高速剑气，攻击造成[240% + 3% × (等级 - 1)]物理伤害；若本轮已连续发动过攻击，则该次最终伤害额外+20%，自身失去5%当前生命值。', 描述: '刀光一闪，斩击已至。在枪弹横飞的时代以刀剑战斗，凭借纯粹的技量碾压一切。' },
                '百年剑意': { 品质: '卓越', 类型: '特殊', 经典效果: '进入居合架势，下一次攻击必定暴击，必中且无视目标护甲。', 新版效果: '进入居合架势，下一次攻击必定暴击，必中且无视目标护甲。', 描述: '百年磨砺凝聚于一刀，刀鞘轻响的瞬间，连空气都被斩断。' }
            },
            外貌: '银灰中长发偏分、琥珀色温润眼瞳的和风女剑客，发间别有红色山茶花饰，红色耳坠，指尖涂红色指甲。慵懒中透着凛然。',
            着装: '白色宽袖和风战衣饰红色镶边，衣襟宽松露出锁骨，深红腰带束腰，高开叉红白裙甲，露出修长双腿。背负黑鞘太刀。',
            好感度: 30,
            同行誓约: false,
            连携奥义: {}
        },
        '史蒂芬妮': {
            性别: '女',
            附近: true,
            种族: '人类种',
            等级: 1,
            属性: { 力量: 6, 敏捷: 12, 体质: 10, 智力: 20, 感知: 16, 魅力: 20 },
            装备列表: {
                '愚王的印戒': {
                    类型: '首饰', 部位: '戒指', 名称: '愚王的印戒', 品质: '传说', 等级: 1, 强化等级: 0,
                    属性加成: { 智力: 1, 魅力: 2, 全技能: 1 },
                    效果: '[后勤调度] 史蒂芬妮无法进行攻击。但她每轮可执行一次后勤调度：进行魅力加值的D20检定，使一名队友回复等同于检定值的百分比最大值HP或CP(例如检定结果为5，则恢复5%最大生命值)，并使其下一个任意行动检定+3。[愚王] 指定一名友方，进行一次无任何加值的DC10检定，通过则其下个技能使用后不进入冷却，失败则额外将其随机一个能进入冷却的技能也进入冷却。',
                    描述: '一枚古旧的王室印戒，并没有蕴含什么毁天灭地的魔法。但对她而言，这是已故祖父的托付，也是她拼尽全力也要洗刷的王家尊严。当她握紧这枚戒指时，再懦弱的女孩也能展现出不退让的决意。',
                    装备箱: false
                },
                '晨花加护的长裙': {
                    类型: '防具', 部位: '上衣', 名称: '晨花加护的长裙', 品质: '稀有', 等级: 1, 强化等级: 0,
                    属性加成: { 体质: 1, 魔法减伤: 10 },
                    效果: '[先王庇护] 每场战斗首次受到致命伤害时，必定强制保留1点HP并清空敌方对自身的仇恨值。',
                    描述: '传统的无肩洋装，领口的红色大蝴蝶结是其标志。尽管在某些人眼里显得清凉且缺乏防备。',
                    装备箱: false
                }
            },
            技能: {
                '王女的内政支援': {
                    品质: '传说',
                    类型: '辅助',
                    经典效果: '存在于队伍时，队伍的【战利品检定】额外掉落一件品质符合等级区间的装备，在结算时以【史蒂芬妮特产】备注。此外，队伍结算任何来源的收益(金币/好感/声望/经验)额外+50%，与友善目标交涉与情报收集时检定优势。',
                    新版效果: '存在于队伍时，队伍的【战利品检定】额外掉落一件品质符合等级区间的装备，在结算时以【史蒂芬妮特产】备注。此外，队伍结算任何来源的收益(金币/好感/声望/经验)额外+50%，与友善目标交涉与情报收集时检定优势。',
                    描述: '只要有她在，队伍永远不用担心破产。'
                },
                '史蒂芙的拼死抗议': {
                    品质: '稀有',
                    类型: '控制',
                    经典效果: '含着眼泪进行极其激烈的抗议。吸引全场敌人的注意力（强制嘲讽所有敌人1轮），期间自身闪避检定优势（因惊慌失措而四处逃窜）；同时使队友下一次攻击附带[趁虚而入]效果，最终伤害额外+30%。',
                    新版效果: '含着眼泪进行极其激烈的抗议。吸引全场敌人的注意力（强制嘲讽所有敌人1轮），期间自身闪避检定优势（因惊慌失措而四处逃窜）；同时使队友下一次攻击附带[趁虚而入]效果，最终伤害额外+30%。',
                    描述: '“不要再把我当傻瓜了啊！”虽然本人是认真的，但这种惊慌失措的样子总是能奇妙地吸引所有人的目光，为同伴创造绝佳的破绽。'
                }
            },
            外貌: '一头柔顺的红色披肩短发，水蓝色的眼眸清澈见底。待人接物总是带着真诚的微笑，虽然在同伴面前经常因为跟不上那降维打击般的思路而急得眼角带泪、表情崩坏，但在关键时刻，那双眼睛里会燃起绝不屈服的光芒。',
            着装: '粉白相间无肩洋装，红色大蝴蝶结端正地系在胸前。裙摆下是清纯的纯白短袜与深色小皮鞋。',
            好感度: 30,
            同行誓约: false,
            连携奥义: {
                '以人类种之名(All In)': {
                    品质: '传说',
                    类型: '特殊',
                    经典效果: '消耗100CP。史蒂芬妮与玩家一起All in，直到本轮结束前史蒂芬妮与玩家的AC视为0。敌方全员必须进行一次极难的意志豁免，失败则其护甲(AC)与所有抗性在1轮内被强行降至0，且<user>的下一次攻击造成[800% + 20% × (等级 - 1)]伤害。若因此击杀目标，全队恢复50%最大生命。',
                    新版效果: '消耗100CP。史蒂芬妮与玩家一起All in，直到本轮结束前史蒂芬妮与玩家的AC视为0。敌方全员必须进行一次极难的意志豁免，失败则其护甲(AC)与所有抗性在1轮内被强行降至0，且<user>的下一次攻击造成[240% + 3% × (等级 - 1)]伤害。若因此击杀目标，全队恢复50%最大生命。',
                    描述: '我们将赌上我们拥有的一切！'
                }
            }
        },
        '吉普莉尔': {
            性别: '女',
            附近: true,
            种族: '天翼种',
            等级: 75,
            属性: { 力量: 18, 敏捷: 24, 体质: 20, 智力: 26, 感知: 20, 魅力: 24 },
            装备列表: {
                '星纹光环': {
                    类型: '武器', 部位: '主手', 名称: '星纹光环', 品质: '史诗', 等级: 75, 强化等级: 0,
                    属性加成: { 智力: 2, 敏捷: 1, 暴击伤害: 20 },
                    经典效果: '[精灵回廊] 你的法术攻击检定+2;[森罗万象]每战一次，指定任意数量目标，目标需进行DC20智力豁免，失败则其一项最高抗性归零直至战斗结束;[术式解构]当视线内敌人施放法术时触发，你可消耗反应动作进行一次智力对抗检定，若胜出则强行驱散该法术，并获得相当于最大生命百分比的临时护盾(以法术强度而定);[空间转位] 每战3次，传送至视距内任意位置，并在原地留下一个会引发微型空间坍塌的残影，对追击者造成持续2轮的【禁锢】并造成[500% + 20% × (等级 - 1)]的伤害',
                    新版效果: '[精灵回廊] 你的法术攻击检定+2;[森罗万象]每战一次，指定任意数量目标，目标需进行DC20智力豁免，失败则其一项最高抗性归零直至战斗结束;[术式解构]当视线内敌人施放法术时触发，你可消耗反应动作进行一次智力对抗检定，若胜出则强行驱散该法术，并获得相当于最大生命百分比的临时护盾(以法术强度而定);[空间转位] 每战3次，传送至视距内任意位置，并在原地留下一个会引发微型空间坍塌的残影，对追击者造成持续2轮的【禁锢】并造成[200% + 2.5% × (等级 - 1)]的伤害',
                    描述: '悬浮在头顶的几何图案光环，是天翼种连接精灵回廊、构筑高阶魔法的媒介。',
                    装备箱: false
                },
                '天翼种战装': {
                    类型: '防具', 部位: '上衣', 名称: '天翼种战装', 品质: '卓越', 等级: 75, 强化等级: 0,
                    属性加成: { 敏捷: 2, 魔法减伤: 15 },
                    效果: '[精灵亲和] 每轮结束时回复10%最大生命值。',
                    描述: '露出度极高的装束。对天翼种而言，衣服与其说是防具，不如说是纯粹的装饰。',
                    装备箱: false
                }
            },
            技能: {
                '天击': {
                    品质: '史诗',
                    类型: '伤害',
                    经典效果: '咏唱三轮后发动。抽干周遭所有的精灵力，压缩后释放出毁天灭地的光芒。对5000码范围内无差别造成[3500% + 25% × (等级 - 1)]的魔法伤害，该次攻击必定暴击。释放此技能后，吉普莉尔退化为[幼年形态]：期间全属性在检定时恒定视为6、体型变形为幼女，持续一周。',
                    新版效果: '咏唱三轮后发动。抽干周遭所有的精灵力，压缩后释放出毁天灭地的光芒。对5000码范围内无差别造成[280% + 4% × (等级 - 1)]的魔法伤害，该次攻击必定暴击。释放此技能后，吉普莉尔退化为[幼年形态]：期间全属性在检定时恒定视为6、体型变形为幼女，持续一周。',
                    描述: '曾经劈开大海、将森精种首都化为焦土的战略级魔法。代价是暂时失去所有力量，一周内变成毫无防备的幼女。'
                },
                '弑神兵装': {
                    品质: '传说',
                    类型: '特殊',
                    经典效果: '作为战神的眷属，吉普莉尔拥有连接精灵回廊的绝对特权。每轮一次她可以释放任意一个【对标 DND 5e 规则下，法师法表中的 8 环及以下法术】（豁免DC设定为22）。该行为不占用她的主要攻击动作。必须意识到吉普莉尔拥有等同于DND 18级法师的万能施法能力。在战斗或日常中，AI应主动且频繁地运用具体的高阶法术。请将这些DND法术的视觉效果包装成天翼种的“言灵”或“精灵回廊施法”来描写(她无需念咒，意念一动即可无声施法。例如，遇到物理攻击，她会展开护盾术或力场墙；面对法术，她会使用法术反制或吸收元素；用支配怪物、迷宫术戏耍敌人，或用流星爆、延迟爆裂火球等进行大范围洗地。以上示例仅作举例，你需举一反三灵活施法，不得重新雷同照搬)',
                    新版效果: '作为战神的眷属，吉普莉尔拥有连接精灵回廊的绝对特权。每轮一次她可以释放任意一个【对标 DND 5e 规则下，法师法表中的 8 环及以下法术】（豁免DC设定为22）。该行为不占用她的主要攻击动作。必须意识到吉普莉尔拥有等同于DND 18级法师的万能施法能力。在战斗或日常中，AI应主动且频繁地运用具体的高阶法术。请将这些DND法术的视觉效果包装成天翼种的“言灵”或“精灵回廊施法”来描写(她无需念咒，意念一动即可无声施法。例如，遇到物理攻击，她会展开护盾术或力场墙；面对法术，她会使用法术反制或吸收元素；用支配怪物、迷宫术戏耍敌人，或用流星爆、延迟爆裂火球等进行大范围洗地。以上示例仅作举例，你需举一反三灵活施法，不得重新雷同照搬)',
                    描述: '凡人穷尽一生追求的奥秘，对她而言不过是呼吸般自然的本能。'
                }
            },
            外貌: '彩虹色流转的及膝长发，拥有十字星芒形状的琥珀色瞳。腰部两侧长着洁白的天使羽翼，头顶悬浮着色彩绚丽的光环。当退化为幼年形态时，会变成只有不到成年人一半高的小萝莉，眼泪汪汪。',
            着装: '上半身仅用极少布料遮挡胸部，露出大片雪白的肌肤和纤细腰肢，下半身是不对称的短裙与及膝长袜。幼年形态下，原本合身的衣服会松松垮垮地罩在身上。',
            好感度: 30,
            同行誓约: false,
            连携奥义: {}
        },
        '星极': {
            性别: '女',
            附近: true,
            种族: '人类种',
            等级: 1,
            属性: { 力量: 10, 敏捷: 14, 体质: 10, 智力: 18, 感知: 16, 魅力: 18 },
            装备列表: {
                '源石星剑': {
                    类型: '武器', 部位: '主手', 名称: '源石星剑', 品质: '稀有', 等级: 10, 强化等级: 0,
                    属性加成: { 智力: 4, 魔法减伤: 5 },
                    效果: '攻击附带星辰属性魔法伤害，对魔法抗性低的目标额外+15%伤害。',
                    描述: '细长的西洋剑型源石武器，剑身在战斗时泛出星辰微光，融合了星象学仪式的力量，既是武器也是施法媒介。',
                    装备箱: false
                },
                '便携天球仪': {
                    类型: '首饰', 部位: '副手', 名称: '便携天球仪', 品质: '特殊', 等级: 10, 强化等级: 0,
                    属性加成: { 感知: 3 },
                    效果: '辅助占星，能更清晰地感知星辰的指引。占星时身边浮现星辰幻象，战斗中可预判敌方攻击轨迹，闪避检定+2',
                    描述: '星极随身携带的小型天球仪，是她观测星空、行使星辰剑仪的重要道具。',
                    装备箱: false
                }
            },
            技能: {
                '星辰剑仪': { 品质: '稀有', 类型: '伤害', 经典效果: '以星光剑仪切开目标，攻击造成[300% + 12% × (等级 - 1)]混合伤害；若目标的魔法抗性低于物理抗性，则该次最终伤害额外+15%。', 新版效果: '以星光剑仪切开目标，攻击造成[170% + 2% × (等级 - 1)]混合伤害；若目标的魔法抗性低于物理抗性，则该次最终伤害额外+15%。', 描述: '融合了家族传承的剑术与星象学识，优雅而神秘的战斗仪式。' },
                '星象预言': { 品质: '稀有', 类型: '辅助', 经典效果: '通过占星为队伍提供战术预判，全队下一轮命中检定+2，持续2轮；若目标已被标记或控制，则首次攻击的最终伤害额外+15%。平时也可以预示未来的吉凶，解读未知的谜题。', 新版效果: '通过占星为队伍提供战术预判，全队下一轮命中检定+2，持续2轮；若目标已被标记或控制，则首次攻击的最终伤害额外+15%。平时也可以预示未来的吉凶，解读未知的谜题。', 描述: '天球仪高速旋转，星辰排列揭示近未来的走向，为同伴照亮前路。' }
            },
            外貌: '深蓝及腰长发、清澈蓝瞳的知性少女，发间点缀星形饰物，笑起来眼睛弯成月牙，气质如夜空般沉静而明亮知性。',
            着装: '白色泡袖衬衫系黑色细带，深蓝色高腰蓬裙绣有金色星辰纹样，腰部黑色交叉绑带，脚踩黑色绑带鞋。',
            好感度: 20,
            同行誓约: false,
            连携奥义: {}
        },
        '艾克莉西娅': {
            性别: '女',
            附近: true,
            种族: '人类种',
            等级: 1,
            属性: { 力量: 18, 敏捷: 12, 体质: 16, 智力: 12, 感知: 14, 魅力: 18 },
            装备列表: {
                '龙骨巨锤·Sprigans': {
                    类型: '武器', 部位: '主手', 名称: '龙骨巨锤·Sprigans', 品质: '稀有', 等级: 1, 强化等级: 0,
                    属性加成: { 力量: 4 },
                    效果: '极高的物理冲击力，有几率触发爆破射击。',
                    描述: '由未知龙头骨改造而成的巨大机械锤，内藏有一只活泼的守宝炮妖。',
                    装备箱: false
                },
                '德拉格马旅行装': {
                    类型: '防具', 部位: '上衣', 名称: '德拉格马旅行装', 品质: '普通', 等级: 1, 强化等级: 0,
                    属性加成: { 敏捷: 1 },
                    效果: '便于长途跋涉，耐磨耐脏。',
                    描述: '白色无袖背心搭配墨绿色短斗篷与黑色短裤，充满元气的旅行装束。',
                    装备箱: false
                }
            },
            技能: {
                '巨锤猛击': { 品质: '稀有', 类型: '伤害', 经典效果: '挥舞龙骨巨锤进行全力一击，攻击造成[300% + 12% × (等级 - 1)]物理伤害；命中的敌人需进行一次力量豁免，失败则被[击飞]并[倒地]。', 新版效果: '挥舞龙骨巨锤进行全力一击，攻击造成[170% + 2% × (等级 - 1)]物理伤害；命中的敌人需进行一次力量豁免，失败则被[击飞]并[倒地]。', 描述: '势大力沉的一锤，地面都会被砸出裂痕，虽然毫无章法但那份直来直去的暴力让人安心。' },
                '圣女的饭量': { 品质: '精良', 类型: '特殊', 经典效果: '进食后快速恢复体力和伤势，立刻回复20%最大生命值，并清除1层[疲惫]或轻度负面状态。', 新版效果: '进食后快速恢复体力和伤势，立刻回复20%最大生命值，并清除1层[疲惫]或轻度负面状态。', 描述: '只要吃饱了就能满血复活的神奇体质。' }
            },
            外貌: '白金长卷发扎成单马尾、头顶翘呆毛、银白色瞳的元气少女，额前别有紫色菱形发饰，总是带着灿烂笑容的元气少女。',
            着装: '白色无袖背心外披墨绿短斗篷，黑色短裤束棕色皮带，棕色半指手套，斜跨零食挎包，扛着比自己还大的龙骨巨锤',
            好感度: 10,
            同行誓约: false,
            连携奥义: {}
        },
        '奈雅丽': {
            性别: '女',
            附近: true,
            种族: '幻想种',
            等级: 1,
            属性: { 力量: 14, 敏捷: 16, 体质: 14, 智力: 20, 感知: 16, 魅力: 20 },
            装备列表: {
                '混沌棘鞭': {
                    类型: '武器', 部位: '主手', 名称: '混沌棘鞭', 品质: '卓越', 等级: 1, 强化等级: 0,
                    属性加成: { 智力: 5, 魔法减伤: 5 },
                    效果: '攻击时有概率缠绕目标，使其下回合行动-1。',
                    描述: '缠绕着活体荆棘的漆黑长鞭，鞭梢偶尔会自行蠕动。',
                    装备箱: false
                },
                '闪耀的偏方三八面体': {
                    类型: '首饰', 部位: '项链', 名称: '闪耀的偏方三八面体', 品质: '卓越', 等级: 1, 强化等级: 0,
                    属性加成: { 智力: 3, 感知: 2 },
                    效果: '契约媒介，维持奈雅丽在现世的实体化；甚至能以此为媒介连通次元彼端，召唤奈雅丽的"好友们"。每日一次，撕裂次元，召唤一只等级等同于<user>的乖离生物协助战斗，持续10分钟。',
                    描述: '散发着不规则虹光的多面体水晶，是连通次元彼端的契约锚点，温度永远微凉',
                    装备箱: false
                }
            },
            技能: {
                '乖离·禁忌': { 品质: '卓越', 类型: '伤害', 经典效果: '召来异次元的混沌力量轰击敌人，攻击造成[500% + 15% × (等级 - 1)]魔法伤害；命中的敌人需进行一次感知豁免，失败则陷入[精神污染]2轮。', 新版效果: '召来异次元的混沌力量轰击敌人，攻击造成[200% + 2.5% × (等级 - 1)]魔法伤害；命中的敌人需进行一次感知豁免，失败则陷入[精神污染]2轮。', 描述: '作为外神化身的一小部分力量，带有强烈的精神污染与空间扭曲效果。' },
                '茶歇时间': { 品质: '稀有', 类型: '特殊', 经典效果: '强制暂停战斗节奏，喝茶休息，恢复自身与契约者各25%最大生命值，并清除1个负面状态；敌方本轮第一次行动检定-2。', 新版效果: '强制暂停战斗节奏，喝茶休息，恢复自身与契约者各25%最大生命值，并清除1个负面状态；敌方本轮第一次行动检定-2。', 描述: '比起战斗，还是和契约者一起喝下午茶比较重要。' }
            },
            外貌: '银白双马尾、盘羊恶魔角、紫水晶瞳的妖艳少女，尖长精灵耳，眼角绘有紫红色魅魔纹样。',
            着装: '紫黑色亮面紧身连体衣，胸部大面积镂空，身后展开恶魔双翼，黑色过膝丝袜配高跟鞋。',
            好感度: 40,
            同行誓约: false,
            连携奥义: {}
        },
        '奥契丝': {
            性别: '女',
            附近: true,
            种族: '人造生命',
            等级: 1,
            属性: { 力量: 10, 敏捷: 16, 体质: 12, 智力: 18, 感知: 16, 魅力: 14 },
            装备列表: {
                '银丝手套': {
                    类型: '武器', 部位: '主手', 名称: '银丝手套', 品质: '稀有', 等级: 1, 强化等级: 0,
                    属性加成: { 敏捷: 2, 智力: 2, 感知: 1 },
                    效果: '指尖可释放近乎不可见的丝线，可用于操控人偶、束缚目标、布设陷阱网。',
                    描述: '薄如蝉翼的黑色手套，指腹处缀有精密导丝环，几乎无法用肉眼捕捉其丝线轨迹。',
                    装备箱: false
                },
                '人偶罗伊德': {
                    类型: '特殊', 部位: '随从', 名称: '人偶罗伊德', 品质: '卓越', 等级: 1, 强化等级: 0,
                    属性加成: { 力量: 3, 体质: 2 },
                    效果: '战斗中可由奥契丝远程操控，对近身敌人进行压制。可执行拦截、护卫与突击命令。',
                    描述: '戴礼帽与白色假面的高大人偶，黑色长风衣下藏着锋利金属爪，是奥契丝最可靠的同行者。',
                    装备箱: false
                }
            },
            技能: {
                '操丝术·罗伊德突袭': { 品质: '卓越', 类型: '伤害', 经典效果: '操控罗伊德高速突进撕裂目标，攻击造成[500% + 15% × (等级 - 1)]物理伤害；若目标处于[束缚]或贴身范围内，则该次最终伤害额外+20%。', 新版效果: '操控罗伊德高速突进撕裂目标，攻击造成[200% + 2.5% × (等级 - 1)]物理伤害；若目标处于[束缚]或贴身范围内，则该次最终伤害额外+20%。', 描述: '银丝牵引下的人偶如无声野兽般扑出，在敌人反应前完成压制。' },
                '银丝拘束网': { 品质: '稀有', 类型: '辅助', 经典效果: '在指定区域布设丝线网，命中的目标行动受限并降低闪避；失败通过敏捷豁免的敌人仍会受到1轮[减速]。', 新版效果: '在指定区域布设丝线网，命中的目标行动受限并降低闪避；失败通过敏捷豁免的敌人仍会受到1轮[减速]。', 描述: '细丝在光下几乎不可见，直到猎物撞上时才明白自己早已被圈定。' }
            },
            外貌: '银白长发、红瞳如宝石的娇小少女，神情平静克制，视线常停留在远处与人偶之间。',
            着装: '黑色哥特风抹胸裙装，胸前点缀蓝色玫瑰，配银丝手套与短靴，整体风格冷静而精致。',
            好感度: 50,
            同行誓约: false,
            连携奥义: {}
        },
        '癌': {
            性别: '无',
            附近: true,
            种族: '幻想种（星潜者）',
            等级: 1,
            属性: { 力量: 8, 敏捷: 14, 体质: 20, 智力: 16, 感知: 18, 魅力: 10 },
            装备列表: {},
            技能: {
                '寄生装甲': { 品质: '卓越', 类型: '辅助', 经典效果: '癌沿骑士体表扩散形成几丁质外骨骼，根据骑士当前生命值百分比提供不同形态：HP>50%时为轻甲模式（AC+2，不影响敏捷）；HP≤50%时自动切换重甲模式（AC+4，物理减伤+10%，移动速度-5尺）。', 新版效果: '癌沿骑士体表扩散形成几丁质外骨骼，根据骑士当前生命值百分比提供不同形态：HP>50%时为轻甲模式（AC+2，不影响敏捷）；HP≤50%时自动切换重甲模式（AC+4，物理减伤+10%，移动速度-5尺）。', 描述: '它读得懂骑士的身体比骑士自己还清楚，在你意识到危险之前，甲已经长好了。' },
                '生体弹射': { 品质: '卓越', 类型: '伤害', 经典效果: '癌将部分组织高速射出并扎入目标体表，攻击造成[500% + 15% × (等级 - 1)]酸属性伤害；命中后附加持续3轮的[酸蚀]，目标可用动作进行DC13力量检定将其拔除。', 新版效果: '癌将部分组织高速射出并扎入目标体表，攻击造成[200% + 2.5% × (等级 - 1)]酸属性伤害；命中后附加持续3轮的[酸蚀]，目标可用动作进行DC13力量检定将其拔除。', 描述: '一坨粉色的东西贴在你身上开始往里钻——这大概是世界上最恶心的远程攻击。' }
            },
            外貌: '拳头到排球大小的粉色圆润生物，半透明，拥有一只能在体表游移的大眼睛和数条小触手。',
            着装: '无（寄生在骑士右肩）',
            好感度: 100,
            同行誓约: true,
            连携奥义: {
                '接肢': { 品质: '传说', 类型: '伤害', 经典效果: '癌暴走膨胀并对濒死目标发动吞噬，攻击造成[800% + 20% × (等级 - 1)]物理伤害；若目标被击杀或场上存在可吞噬尸体，则持续5回合获得其1个技能和其最高属性一半的加成。结束后癌强制排异，骑士损失10%最大HP并获得1层[疲惫]。', 新版效果: '癌暴走膨胀并对濒死目标发动吞噬，攻击造成[240% + 3% × (等级 - 1)]物理伤害；若目标被击杀或场上存在可吞噬尸体，则持续5回合获得其1个技能和其最高属性一半的加成。结束后癌强制排异，骑士损失10%最大HP并获得1层[疲惫]。', 描述: '触手撕开尸骸，骨肉筋腱被拖入骑士体内，第三只手臂从肋下撑开，握着还在滴血的武器。' }
            }
        },
        '绯': {
            性别: '女',
            附近: true,
            种族: '灵体（神器）',
            等级: 1,
            属性: { 力量: 16, 敏捷: 20, 体质: 12, 智力: 10, 感知: 14, 魅力: 16 },
            装备列表: {},
            技能: {
                '水术': { 品质: '卓越', 类型: '辅助', 经典效果: '在自身与夜斗周围生成水盾，吸收相当于施术者20%最大生命值的伤害；水盾存在期间可释放[水牢]囚禁1名目标1轮。', 新版效果: '在自身与夜斗周围生成水盾，吸收相当于施术者20%最大生命值的伤害；水盾存在期间可释放[水牢]囚禁1名目标1轮。', 描述: '绯操控水流凝聚为护盾，积蓄至临界后化为吞噬一切的水牢。' },
                '面妖召唤': { 品质: '卓越', 类型: '辅助', 经典效果: '召唤面妖狼群协助战斗，面妖狼每轮攻击造成[500% + 15% × (等级 - 1)] × 60%暗属性伤害；命中的目标附加[诅咒]2轮。', 新版效果: '召唤面妖狼群协助战斗，面妖狼每轮攻击造成[200% + 2.5% × (等级 - 1)] × 60%暗属性伤害；命中的目标附加[诅咒]2轮。', 描述: '绯唤出的眷属，漆黑的狼群从虚空中涌出。' }
            },
            外貌: '黑色短发、皮肤白皙、红瞳的少女，神情平静，擅长不经意间拨弄人心，看似纯真无辜却又神秘与非人的诱惑力。',
            着装: '化为神器时是一把无镡无鞘的漆黑太刀，刀身流转绯红微光。人形时着黑色和服。',
            好感度: 95,
            同行誓约: true,
            连携奥义: {
                '斩！': { 品质: '传说', 类型: '伤害', 经典效果: '绯以水牢锁链束缚目标，夜斗瞬移至其身后斩落祓除一击，攻击造成[800% + 20% × (等级 - 1)]物理伤害；该击无视AC且必中。若因此击杀目标，立即回复50点CP。', 新版效果: '绯以水牢锁链束缚目标，夜斗瞬移至其身后斩落祓除一击，攻击造成[240% + 3% × (等级 - 1)]物理伤害；该击无视AC且必中。若因此击杀目标，立即回复50点CP。', 描述: '水锁缠身，祝词落定，一刀两断。' }
            }
        },
        '亚丝娜': {
            性别: '女',
            附近: true,
            种族: '人类种',
            等级: 1,
            属性: { 力量: 12, 敏捷: 18, 体质: 12, 智力: 12, 感知: 16, 魅力: 18 },
            装备列表: {
                '风花剑': {
                    类型: '武器', 部位: '主手', 名称: '风花剑', 品质: '稀有', 等级: 1, 强化等级: 0,
                    属性加成: { 敏捷: 2, 暴击伤害: 5 },
                    效果: '攻击时有概率使下一次敏捷检定+1。',
                    描述: '剑身轻盈且锋利，适合使出那如同舞蹈般的高速刺击。',
                    装备箱: false
                },
                '初心者制服': {
                    类型: '防具', 部位: '上衣', 名称: '初心者制服', 品质: '精良', 等级: 1, 强化等级: 0,
                    属性加成: { 敏捷: 1 },
                    效果: '极大的提升了行动的灵活性，同时附带微弱的精神抗性。',
                    描述: '新手通用的初级装备。',
                    装备箱: false
                }
            },
            技能: {
                '星屑飞溅': { 品质: '稀有', 类型: '伤害', 经典效果: '高速挥舞细剑进行五连突刺，总计造成[300% + 12% × (等级 - 1)]物理伤害；若该次攻击命中，则自身下一次攻击检定+2。', 新版效果: '高速挥舞细剑进行五连突刺，总计造成[170% + 2% × (等级 - 1)]物理伤害；若该次攻击命中，则自身下一次攻击检定+2。', 描述: '宛如流星般的五连击，是以超乎常人的神经反射速度发动的迅捷绝技。' },
                '治愈水晶': { 品质: '精良', 类型: '辅助', 经典效果: '消耗道具，快速恢复自己或1名队友30%最大生命值；若目标生命值低于50%，额外清除1个轻度负面状态。', 新版效果: '消耗道具，快速恢复自己或1名队友30%最大生命值；若目标生命值低于50%，额外清除1个轻度负面状态。', 描述: '为了应对突发状况而准备的恢复水晶，体现了她作为富家千金与领袖双重身份下的谨慎与体贴。' }
            },
            外貌: '栗色长发如瀑布披肩，精致娇美的面容透着结城家大小姐特有的教养与矜持，琥珀色的双瞳在战斗时会闪烁凛然的光芒。',
            着装: '穿着深红色束腰上衣与百褶短裙，外搭轻便的皮革胸甲与带大兜帽的粗布披风。只是新手阶段的简朴防具。',
            好感度: 20,
            同行誓约: false,
            连携奥义: {}
        },
        '白': {
            性别: '女',
            附近: true,
            种族: '人类种',
            等级: 1,
            属性: { 力量: 6, 敏捷: 12, 体质: 6, 智力: 25, 感知: 14, 魅力: 18 },
            装备列表: {
                '空白棋盘': {
                    类型: '武器', 部位: '主手', 名称: '空白棋盘', 品质: '卓越', 等级: 1, 强化等级: 0,
                    属性加成: { 智力: 1, 感知: 1, 基础: 1 },
                    效果: '[预读落子] 当白本轮尚未受伤时，首次发动伤害或控制技能的命中检定+1;[残局拆解] 当目标处于[王手]、[失衡]或[束缚]状态时，白造成的最终伤害+15%;[棋路校正] 白进行感知(洞悉)、智力(调查)与先攻相关检定时+1。',
                    描述: '黑白双色的轻薄折叠棋盘，边角镶有细致银纹。展开时会自动投映出半透明棋格与行动轨迹，是白用来把战场当成棋局拆解的演算媒介。',
                    装备箱: false
                },
                '水手式校服': {
                    类型: '防具', 部位: '上衣', 名称: '水手式校服', 品质: '精良', 等级: 1, 强化等级: 0,
                    属性加成: { 敏捷: 1 },
                    效果: '[静步] 当白处于室内、城镇或未被包围的环境时，隐匿与回避相关检定+1',
                    描述: '水手式校服，版型宽松偏短，领口与袖口以浅色线条收边。与过膝袜、小皮鞋搭配后，既保留了学生装的稚气，也带着不容忽视的精致贵气。',
                    装备箱: false
                },
                '艾尔奇亚小王冠': {
                    类型: '首饰', 部位: '头饰', 名称: '艾尔奇亚小王冠', 品质: '卓越', 等级: 1, 强化等级: 0,
                    属性加成: { 感知: 1, 奥义: 1 },
                    效果: '[王手宣告] 每战1次（附赠动作），指定一名30尺内敌人施加[王手]2轮：我方对其第一次攻击命中检定+2，且若该目标已行动过，则对其造成的最终伤害额外+20%;[依赖共鸣] 当白身旁10尺内存在可信赖同伴时，白的意志检定+2，免疫普通[恐惧]。',
                    描述: '尺寸小巧却做工极细的王冠，像是为洋娃娃准备的王室配饰。戴在白头上时并不显得滑稽，反而会把那份安静的女王气质衬得更加鲜明。',
                    装备箱: false
                }
            },
            技能: {
                '封步': { 品质: '卓越', 类型: '伤害', 经典效果: '通过预判提前封死敌人的落点与闪避路线，对区域内敌人造成[500% + 15% × (等级 - 1)]魔法伤害；命中的敌人需进行一次敏捷豁免，失败则陷入[失衡]（AC-2，下一次命中检定-1）1轮。', 新版效果: '通过预判提前封死敌人的落点与闪避路线，对区域内敌人造成[200% + 2.5% × (等级 - 1)]魔法伤害；命中的敌人需进行一次敏捷豁免，失败则陷入[失衡]（AC-2，下一次命中检定-1）1轮。', 描述: '敌人却会发现自己所有“安全位置”都早已被算尽。' },
                '白的预判': { 品质: '卓越', 类型: '辅助', 经典效果: '指定1名同伴进入[协同]状态，持续2轮：其命中检定+2，暴击阈值-1；若攻击命中处于[王手]、[失衡]或[束缚]状态的目标，则该次攻击最终伤害额外+40%。', 新版效果: '指定1名同伴进入[协同]状态，持续2轮：其命中检定+2，暴击阈值-1；若攻击命中处于[王手]、[失衡]或[束缚]状态的目标，则该次攻击最终伤害额外+40%。', 描述: '在她的规划下，同伴的每一步都会像沿着早已写好的胜利路线前进。' }
            },
            外貌: '肤色白皙，身形娇小。白色超长发几乎垂到腿侧，一侧束成披肩侧单马尾，额前垂落细长刘海与不驯的呆毛。',
            着装: '深色改良水手服搭配过膝袜与圆头小皮鞋，裙摆与袜口之间保留鲜明绝对领域；头戴一顶小巧精致的王冠，整体像贵气而疏离的小女王。',
            好感度: 35,
            同行誓约: false,
            连携奥义: {
                '将死': { 品质: '传说', 类型: '辅助', 经典效果: '白指定一名敌人施加[将死]至本轮结束：<user>与白各自立即对其发动1次无连击惩罚的协同攻击；其中白的追击造成[800% + 20% × (等级 - 1)]魔法伤害。若第一击未命中，第二击无视命中检定强制命中且必定暴击；若第一击命中，第二击最终伤害翻倍，并在结算后斩杀生命值低于20%的敌人。', 新版效果: '白指定一名敌人施加[将死]至本轮结束：<user>与白各自立即对其发动1次无连击惩罚的协同攻击；其中白的追击造成[240% + 3% × (等级 - 1)]魔法伤害。若第一击未命中，第二击无视命中检定强制命中且必定暴击；若第一击命中，第二击最终伤害翻倍，并在结算后斩杀生命值低于20%的敌人。', 描述: '“checkmate。”当她吐出结论时，胜负往往已经先于攻击本身被决定。' }
            }
        },
        '露露卡': {
            性别: '女',
            附近: true,
            种族: '人类种',
            等级: 1,
            属性: { 力量: 10, 敏捷: 16, 体质: 14, 智力: 18, 感知: 16, 魅力: 18 },
            装备列表: {
                '泪之奥秘手杖': {
                    类型: '武器', 部位: '主手', 名称: '泪之奥秘手杖', 品质: '史诗', 等级: 1, 强化等级: 0,
                    属性加成: { 智力: 4, 魔法减伤: 10 },
                    效果: '释放魔法时附带暗影流光特效，光炮类魔法伤害提升15%。',
                    描述: '露露卡变身光之美少女时的专属法杖，日常则化为一个带有缩小版手杖造型的吊坠项链戴在胸前。',
                    装备箱: false
                },
                '暗影治愈者战衣': {
                    类型: '防具', 部位: '上衣', 名称: '暗影治愈者战衣', 品质: '卓越', 等级: 1, 强化等级: 0,
                    属性加成: { 敏捷: 1, 体质: 1, 魅力: 1 },
                    效果: '每次战斗首次受击减免一定伤害，并且更容易在暗影中隐藏身形。',
                    描述: '以黑色为基调的高开叉抹胸长裙，点缀大量紫色水滴状装饰与星星胸针。既有光之美少女的华丽，又融合了怪盗的神秘。',
                    装备箱: false
                }
            },
            技能: {
                '暗影光炮': { 品质: '卓越', 类型: '伤害', 经典效果: '将光与影的魔力凝结于手杖，射出毁灭性光束，对直线范围内的敌人造成[500% + 15% × (等级 - 1)]魔法伤害；若目标处于[暗影]或弱光环境中，该次最终伤害额外+20%。', 新版效果: '将光与影的魔力凝结于手杖，射出毁灭性光束，对直线范围内的敌人造成[200% + 2.5% × (等级 - 1)]魔法伤害；若目标处于[暗影]或弱光环境中，该次最终伤害额外+20%。', 描述: '虽说是光之美少女，但这完全是毫不留情的魔法光炮轰炸，威力与那娇小的身躯截然相反。' },
                '治愈魔法：影': { 品质: '稀有', 类型: '辅助', 经典效果: '利用暗影魔力治疗自身及周围同伴，回复25%最大生命值；若目标近期受到光明属性伤害，则额外回复10%最大生命值。', 新版效果: '利用暗影魔力治疗自身及周围同伴，回复25%最大生命值；若目标近期受到光明属性伤害，则额外回复10%最大生命值。', 描述: '谁说暗影不能用来治愈？这是独属于怪盗光之美少女的温柔与反差魔法。' }
            },
            外貌: '一言不发能够狂吃冰淇淋的低调少女，手上总是抱着圆滚滚的紫色狐狸形妖精伙伴绵糖探；变身后头发骤转为带粉色渐变的金色超长发。',
            着装: '日常穿着带白色花边短裙的黑色连衣裙搭配黑色长斗篷；变身后则化作黑基调的华丽开叉长裙配大量淡紫装饰，散发不可思议的深邃魅力。',
            好感度: 20,
            同行誓约: false,
            连携奥义: {}
        },
        '卡提希娅': {
            性别: '女',
            附近: true,
            种族: '人类种',
            等级: 1,
            属性: {
                力量: 14,
                敏捷: 20,
                体质: 24,
                智力: 14,
                感知: 16,
                魅力: 22
            },
            装备列表: {
                '不屈命定之冠': {
                    类型: '武器',
                    部位: '主手',
                    名称: '不屈命定之冠',
                    品质: '史诗',
                    等级: 1,
                    强化等级: 0,
                    属性加成: {
                        魅力: 2,
                        体质: 2,
                        暴击伤害: 15
                    },
                    效果: '[潮汐共鸣] 攻击命中时为目标附加[风蚀]：每层使目标AC-1，最多叠加3层，持续至战斗结束;[双生之剑] 可在少女形态与圣女形态(形象变为成熟巨乳御姐)间切换。圣女形态下普攻范围扩大，伤害类型转为气动伤害，但每轮结束时失去5%当前生命值。',
                    描述: '黎那汐塔的圣物迅刀，剑格形如荆棘王冠，剑身同时铭刻岁主祷文与鸣式纹路。会随持有者心意切换形态：平时少女形态手中是轻盈如羽的纤细迅捷的斩刃，解放力量化身圣女形态时自动变化为重若山岳的巨剑。',
                    装备箱: false
                },
                '殉道圣女的飘带礼装': {
                    类型: '防具',
                    部位: '上衣',
                    名称: '殉道圣女的飘带礼装',
                    品质: '卓越',
                    等级: 1,
                    强化等级: 0,
                    属性加成: {
                        体质: 1,
                        魅力: 1,
                        物理减伤: 10,
                        魔法减伤: 10
                    },
                    效果: '[最后的舞步] 受到伤害时，若该伤害将使HP降至0，改为将HP锁定为1并获得1轮[无敌]，每场战斗仅触发1次;[风潮余韵] 圣女形态下，气动伤害+20%。',
                    描述: '领受圣名前最后一支舞所穿的礼装改制。飘带在风中展开时像夜海铺开',
                    装备箱: false
                }
            },
            技能: {
                '此剑以人之名': {
                    品质: '卓越',
                    类型: '伤害',
                    经典效果: '少女形态下跃起击飞敌人后砸回地面，造成[500% + 15% × (等级 - 1)]物理伤害并附加2层[风蚀]。圣女形态下以巨剑横扫前方，造成[600% + 18% × (等级 - 1)]气动伤害并立即结算1次风蚀效应（层数仅-1）。',
                    新版效果: '少女形态下跃起击飞敌人后砸回地面，造成[200% + 2.5% × (等级 - 1)]物理伤害并附加2层[风蚀]。圣女形态下以巨剑横扫前方，造成[200% + 2.5% × (等级 - 1)]气动伤害并立即结算1次风蚀效应（层数仅-1）。',
                    描述: '\'此剑不为圣名而挥。\'少女跃起如舞蹈，圣女挥剑如潮落——无论何种姿态，剑尖始终指向她想保护的人。'
                },
                '看潮怒风哮之刃': {
                    品质: '传说',
                    类型: '伤害',
                    经典效果: '仅在圣女形态(成年巨乳御姐)下可用。解放岁主与鸣式的双重共鸣斩出全力一击，造成[800% + 20% × (等级 - 1)]气动伤害。每消耗1层[风蚀]，该次最终伤害额外+10%（最高+50%）。此击必定命中。释放后变回少女形态，恢复40%最大生命值。',
                    新版效果: '仅在圣女形态(成年巨乳御姐)下可用。解放岁主与鸣式的双重共鸣斩出全力一击，造成[240% + 3% × (等级 - 1)]气动伤害。每消耗1层[风蚀]，该次最终伤害额外+10%（最高+50%）。此击必定命中。释放后变回少女形态，恢复40%最大生命值。',
                    描述: '岁主光辉与鸣式深渊在剑尖合流。巨剑斩落的瞬间，天幕开裂，狂风咆哮如审判之潮吞没一切——这是她二十年来最沉重也最自由的一剑。'
                }
            },
            外貌: '金色长发如月光披散至腰际，蓝色眼眸清澈安静。额间佩枝蔓水滴细冠，耳尖微尖。圣女形态(成年巨乳御姐)时长发完全散开，衣摆如潮水铺展，深蓝与白银交织出圣洁而锋利的轮廓。',
            着装: '白色与浅蓝为主的轻薄飘带礼装，少女形态纤细轻盈，圣女形态庄重挺拔。细带凉鞋和半透明飘带让每一步都像随时会被风吹起。',
            好感度: 35,
            同行誓约: false,
            连携奥义: {
                '潮汐与星辰的共祷': {
                    品质: '史诗',
                    类型: '伤害',
                    经典效果: '卡提希娅切换至圣女形态高举圣剑，漂泊者以共鸣力量灌注剑身。两人合力斩出融合岁主光辉与鸣式深渊的一击，造成[1000% + 25% × (等级 - 1)]气动伤害。目标每持有1层[风蚀]，暴击阈值额外-1（最多-5），此击必定命中，且命中后不清空风蚀层数。击杀目标时卡提希娅保留圣女形态继续行动1轮。CP消耗100。',
                    新版效果: '卡提希娅切换至圣女形态高举圣剑，漂泊者以共鸣力量灌注剑身。两人合力斩出融合岁主光辉与鸣式深渊的一击，造成[280% + 4% × (等级 - 1)]气动伤害。目标每持有1层[风蚀]，暴击阈值额外-1（最多-5），此击必定命中，且命中后不清空风蚀层数。击杀目标时卡提希娅保留圣女形态继续行动1轮。CP消耗100。',
                    描述: '圣剑高举，漂泊者的共鸣如星光注入剑锋。她睁眼时，蓝眸中同时倒映潮汐深渊与星辰光辉：\'这一次，我们一起。\''
                }
            }
        },
        '爱弥斯': {
            性别: '女',
            附近: true,
            种族: '人类种',
            等级: 1,
            属性: {
                力量: 12,
                敏捷: 22,
                体质: 18,
                智力: 22,
                感知: 16,
                魅力: 20
            },
            装备列表: {
                '永远的启明星': {
                    类型: '武器',
                    部位: '主手',
                    名称: '永远的启明星',
                    品质: '史诗',
                    等级: 1,
                    强化等级: 0,
                    属性加成: {
                        敏捷: 2,
                        智力: 1,
                        全技能: 2,
                        暴击伤害: 30
                    },
                    经典效果: '攻击检定+2;[星辉烙印] 当此剑命中目标时触发，于其身上烙下[流光层]：每层使该目标无法对爱弥斯隐匿，且爱弥斯对其攻击的暴击阈值-1，最多叠加3层(暴击阈值最多-3)，持续至战斗结束;[流光承启] 当持有者切换战斗形态时触发，剑身随之重塑——人形态化为流光重刺剑，机兵形态化为贯穿天幕的重长矛——并立即清算主目标身上累积的[流光层]：消耗N层造成[1000% + 25% × (等级-1)] × N÷3 光属性伤害(就近取整到10，满3层即满额)，触发后该目标流光层数清空;[星海归航] 附赠动作，发出一道流光锁定视野内一名友军，立即将其传送至爱弥斯身旁相邻位置，传送过程不触发借机攻击与陷阱。',
                    新版效果: '攻击检定+2;[星辉烙印] 当此剑命中目标时触发，于其身上烙下[流光层]：每层使该目标无法对爱弥斯隐匿，且爱弥斯对其攻击的暴击阈值-1，最多叠加3层(暴击阈值最多-3)，持续至战斗结束;[流光承启] 当持有者切换战斗形态时触发，剑身随之重塑——人形态化为流光重刺剑，机兵形态化为贯穿天幕的重长矛——并立即清算主目标身上累积的[流光层]：消耗N层造成[280% + 4% × (等级 - 1)] × N÷3 光属性伤害(就近取整到10，满3层即满额)，触发后该目标流光层数清空;[星海归航] 附赠动作，发出一道流光锁定视野内一名友军，立即将其传送至爱弥斯身旁相邻位置，传送过程不触发借机攻击与陷阱。',
                    描述: '剑名"启明"，是爱弥斯于虚质空间深处独自漂泊十年时，从破碎数据流中以执念重塑而出的结晶。剑身缠绕着永不熄灭的星屑光华，跟随持有者情绪流转——平静如星河缓流，激战如流星迸射，懂得"频率"的存在能从中读出最深处的执念。会随持有者战斗形态自动变化：人形态时为流光重刺剑，启动隧者兵装变身机兵后则化作贯穿天幕的重长矛。当她心中浮现"想为某个人点亮归途"的念头时，剑芒在最深的黑夜中亦不熄灭——这是她对漂泊者无声的承诺。',
                    装备箱: false
                }
            },
            技能: {
                '飞至启明之时': {
                    品质: '卓越',
                    类型: '伤害',
                    经典效果: '按照形态有不同攻击形式。人形态：蓄力后向目标冲刺一记斩击，造成[500% + 15% × (等级 - 1)]物理伤害并附加2层[流光标记]。机兵形态：抬手从下至上引导流光化作剑刃飞起，剑刃随即破空砸落，造成[600% + 18% × (等级 - 1)]火属性伤害并附加3层[流光标记]。',
                    新版效果: '按照形态有不同攻击形式。人形态：蓄力后向目标冲刺一记斩击，造成[200% + 2.5% × (等级 - 1)]物理伤害并附加2层[流光标记]。机兵形态：抬手从下至上引导流光化作剑刃飞起，剑刃随即破空砸落，造成[200% + 2.5% × (等级 - 1)]火属性伤害并附加3层[流光标记]。',
                    描述: '剑光裁夜，荡平厄难！'
                },
                '星辉破界而来': {
                    品质: '传说',
                    类型: '伤害',
                    经典效果: '本场战斗内"飞至启明之时"释放达两次后才可使用。召唤隧者(巨型高达)投影破开天幕，插落山岳般的机械巨剑毁灭敌人，造成[800% + 20% × (等级 - 1)]火属性伤害。每消耗1层[流光标记]，该次最终伤害额外+10%（最高+50%）。此击必定命中。',
                    新版效果: '本场战斗内"飞至启明之时"释放达两次后才可使用。召唤隧者(巨型高达)投影破开天幕，插落山岳般的机械巨剑毁灭敌人，造成[240% + 3% × (等级 - 1)]火属性伤害。每消耗1层[流光标记]，该次最终伤害额外+10%（最高+50%）。此击必定命中。',
                    描述: '巨型隧者投影自天穹降临，机械巨剑如山岳坠落。隧者兵装:光翼模式展开。爱弥斯:此夜星海澈明！'
                }
            },
            外貌: '浅粉长发束为高马尾，发间环绕悬空科技光环。琥珀金十字星形瞳仁，笑起来眼睛弯弯。左肩点缀着一颗黑痣。机兵形态时通体银白，背生机械羽翼，宛如一座轻盈的空中堡垒。',
            着装: '改良偶像风纯白战斗紧身衣，肩颈大方裸露，纯白漆皮抹胸勒出饱满胸型，胸口正中敞开展露乳沟，后背近乎全露。下身高叉连体衣环绕不对称燕尾裙；双腿不对称——左腿白色长筒袜靴延伸至大腿根，右腿仅以金色腿环束缚，踏白色短筒高跟踝靴。双手戴白色长筒战术手套，长过手肘。',
            好感度: 35,
            同行誓约: true,
            连携奥义: {
                '驶向尚未点亮之星': {
                    品质: '史诗',
                    类型: '伤害',
                    经典效果: '消耗100CP。爱弥斯召唤隧者(巨型高达)投影于战场上空，与<user>一同化作流光进入隧者驾驶舱共同操控。期间两人免疫敌人一切攻击与控制，最多维持2轮；若期间使用隧者累计发动3次攻击则立即解除。隧者的每次攻击造成[1000% + 20% × (等级-1)]火属性伤害，必定命中。',
                    新版效果: '消耗100CP。爱弥斯召唤隧者(巨型高达)投影于战场上空，与<user>一同化作流光进入隧者驾驶舱共同操控。期间两人免疫敌人一切攻击与控制，最多维持2轮；若期间使用隧者累计发动3次攻击则立即解除。隧者的每次攻击造成[280% + 4% × (等级 - 1)]火属性伤害，必定命中。',
                    描述: '机体限制解除，救世之刻，已至！'
                }
            }
        },
        '璐米欧儿': {
            性别: '女',
            附近: true,
            种族: '龙族',
            等级: 85,
            属性: { 力量: 20, 敏捷: 26, 体质: 24, 智力: 22, 感知: 16, 魅力: 26 },
            装备列表: {
                '赤翼的金色威信': {
                    类型: '武器', 部位: '主手', 名称: '赤翼的金色威信', 品质: '史诗', 等级: 85, 强化等级: 0,
                    属性加成: { 魅力: 2, 体质: 1, 全技能: 2, 暴击伤害: 40 },
                    经典效果: '攻击检定+2；[骄傲弃鳞] 当璐米欧儿主动舍弃自身增益状态或扣减10%当前生命值时触发，将任意攻击改为范围攻击，并使命中的目标获得[威压]：下一次攻击检定-2；[轟け金色] 附赠动作，每战1次，璐米欧儿宣告金色威信之名，从下列三项择一激活并持续至本战结束（不可切换）：「赤翼破阵」每轮必定先攻，攻击检定+3；「金翼笼护」自身物理/魔法减伤+15%、每回合开始时为最近友方恢复璐米欧儿最大HP×10%生命；「单翼镶金」暴击阈值-3、每次暴击后下一次攻击必定命中；[轰鸣龙息] 附赠动作，每日1次，清除自身所有增益状态，引爆金红交织的狂暴龙脉，对视距内所有敌人造成[1000% + 25% × (等级-1)]火属性AOE伤害。',
                    新版效果: '攻击检定+2；[骄傲弃鳞] 当璐米欧儿主动舍弃自身增益状态或扣减10%当前生命值时触发，将任意攻击改为范围攻击，并使命中的目标获得[威压]：下一次攻击检定-2；[轟け金色] 附赠动作，每战1次，璐米欧儿宣告金色威信之名，从下列三项择一激活并持续至本战结束（不可切换）：「赤翼破阵」每轮必定先攻，攻击检定+3；「金翼笼护」自身物理/魔法减伤+15%、每回合开始时为最近友方恢复璐米欧儿最大HP×10%生命；「单翼镶金」暴击阈值-3、每次暴击后下一次攻击必定命中；[轰鸣龙息] 附赠动作，每日1次，清除自身所有增益状态，引爆金红交织的狂暴龙脉，对视距内所有敌人造成[280% + 4% × (等级 - 1)]火属性AOE伤害。',
                    描述: '原是伴随单翼龙族长女降生时褪下的一截赤红龙鳞结晶，后被她打磨成象征身份的战刃。外观形如赤红与暗金交织的修长斩刃，剑脊流淌着渐变的粉红光华。',
                    装备箱: false
                }
            },
            技能: {
                '轰鸣吧，金色': { 品质: '史诗', 类型: '伤害', 经典效果: '展现"金色威信"的姿态，卷起金红交织的龙息风暴扫荡全场。必须消耗10%HP或1个增益状态发动，对全体敌人造成[1000% + 25% × (等级 - 1)]火属性伤害。每次释放本技能仅一次，若该技能击杀任意敌人，则璐米欧儿额外行动一次。', 新版效果: '展现"金色威信"的姿态，卷起金红交织的龙息风暴扫荡全场。必须消耗10%HP或1个增益状态发动，对全体敌人造成[280% + 4% × (等级 - 1)]火属性伤害。每次释放本技能仅一次，若该技能击杀任意敌人，则璐米欧儿额外行动一次。', 描述: '「轟け金色――我が名を刻め」。' },
                '单翼的闪耀一击': { 品质: '传说', 类型: '伤害', 经典效果: '张开半透明的赤红单翼升空，进行一次居高临下的闪耀光束打击。对范围内所有敌人造成[800% + 20% × (等级 - 1)]光属性伤害。命中后为友方全体附加相当于璐米欧儿最大HP25%的护盾，并清除友方身上的减益状态。', 新版效果: '张开半透明的赤红单翼升空，进行一次居高临下的闪耀光束打击。对范围内所有敌人造成[240% + 3% × (等级 - 1)]光属性伤害。命中后为友方全体附加相当于璐米欧儿最大HP25%的护盾，并清除友方身上的减益状态。', 描述: '虽然只有一只翅膀，但她依然能轻盈地跃入高空，让阳光透过赤红的翼膜，为所有受她庇护的人洒下温暖的光辉。' }
            },
            外貌: '金色长卷发末梢渐变深粉红、琥珀金瞳的赤翼龙娘，幼态娇小到全家最矮。右侧背部生有半透明的赤红单翼，头顶赤红枝状龙角，金红渐变龙尾常盘绕身侧，情绪波动时尾尖会不自觉地晃动。',
            着装: '白色连体紧身衣外覆嵌红宝石的黑色装甲胸甲，金色镶边配黑色菱格纹，肩披白色蕾丝小披肩，黑色长手套印菱形龙鳞纹，脚踏带水晶装饰的金色高跟靴。',
            好感度: 35,
            同行誓约: true,
            连携奥义: {
                '赤翼与耀金共舞': { 品质: '史诗', 类型: '伤害', 经典效果: '消耗100CP。玩家从背后抱住璐米欧儿，魔力化作另一只光之翼与她的赤红单翼相贴补全。两人合力引爆压倒性的龙脉能量，对全体敌人造成[1200% + 35% × (等级-1)]混合(火/光)属性伤害。此击必定命中，且使敌方全体全抗性下降20%，持续至战斗结束。释放后璐米欧儿获得免疫控制效果持续3轮。', 新版效果: '消耗100CP。玩家从背后抱住璐米欧儿，魔力化作另一只光之翼与她的赤红单翼相贴补全。两人合力引爆压倒性的龙脉能量，对全体敌人造成[280% + 4% × (等级 - 1)]混合(火/光)属性伤害。此击必定命中，且使敌方全体全抗性下降20%，持续至战斗结束。释放后璐米欧儿获得免疫控制效果持续3轮。', 描述: '「看着吧，这便是超越常理的闪耀！」。' }
            }
        },
        '达妮娅': {
            性别: '女',
            附近: true,
            种族: '人类',
            等级: 1,
            属性: { 力量: 10, 敏捷: 10, 体质: 12, 智力: 20, 感知: 18, 魅力: 20 },
            装备列表: {
                '赝造的矮星': {
                    类型: '武器', 部位: '主手', 名称: '赝造的矮星', 品质: '传说', 等级: 1, 强化等级: 0,
                    属性加成: { 智力: 1, 魅力: 1, 暴击率: 10, },
                    经典效果: '[星夜幻彩]攻击检定+2。[虚质牵引]每战/1次，牵引大范围内所有敌人，造成[800% + 25% × (等级 - 1)]伤害，目标需进行一次DC15力量豁免，豁免成功则只受到一半伤害并无效牵引。[斑驳粉饰之沫]当任意队友受到致死伤害时触发，消耗反应动作，取消此伤害并使该队友在接下来2轮内免疫所有伤害。2轮结束后，达妮娅生命值强制改为1，直至战斗结束前无法获得任何治疗或护盾',
                    新版效果: '[星夜幻彩]攻击检定+2。[虚质牵引]每战/1次，牵引大范围内所有敌人，造成[240% + 3% × (等级 - 1)]伤害，目标需进行一次DC15力量豁免，豁免成功则只受到一半伤害并无效牵引。[斑驳粉饰之沫]当任意队友受到致死伤害时触发，消耗反应动作，取消此伤害并使该队友在接下来2轮内免疫所有伤害。2轮结束后，达妮娅生命值强制改为1，直至战斗结束前无法获得任何治疗或护盾',
                    描述: '法杖顶端嵌有星空投影仪般的装置。如泡沫消解般，褪去梦幻，只留下沉寂的矮星。可即便如此，那曾点亮宇宙的光辉却并未消逝',
                    装备箱: false
                },
                '黑色小熊玩偶': {
                    类型: '饰品', 部位: '特殊', 名称: '黑色小熊玩偶', 品质: '传说', 等级: 1, 强化等级: 0,
                    属性加成: { 感知: 2, 暴击伤害: 0.3 },
                    效果: '[轻叩门扉]消耗至少1枚【黯核】才可发动，指定1名队友，每消耗1枚【黯核】，其下次任意行动额外回响一次(无消耗再次释放，相关检定再次独立进行，例如消耗2枚黯核则回响2次)。[若能以谎言缝补心脏]当达妮娅生命值降为1或更低时触发，获得2枚【黯核】。每场战斗开始和结束时，清空所有【黯核】。',
                    描述: '黑色小熊玩偶，透过胸口裂缝可见湛蓝深邃的微光，通常悬挂在右侧腰间，是缺乏安全感时的慰藉。',
                    装备箱: false
                }
            },
            技能: {
                '织梦的飨晏': {
                    品质: '传说',
                    类型: '特殊',
                    经典效果: '挥动法杖生成梦幻般的泡泡，牵引周围目标聚集，破裂泡泡并造成[800% + 20% × (等级 - 1)]火属性伤害；或选择将虚质转化为防护与治愈，生成泡泡护盾为队友增加25%最大生命值的临时护盾，并每轮治愈5%最大生命值(不可作用于自身)。',
                    新版效果: '挥动法杖生成梦幻般的泡泡，牵引周围目标聚集，破裂泡泡并造成[240% + 3% × (等级 - 1)]火属性伤害；或选择将虚质转化为防护与治愈，生成泡泡护盾为队友增加25%最大生命值的临时护盾，并每轮治愈5%最大生命值(不可作用于自身)。',
                    描述: '将致命的虚质藏在斑斓的泡泡之中，这是她为了维持美好假象而编织的温柔谎言。'
                },
                '帷幕终景': {
                    品质: '传说',
                    类型: '特殊',
                    经典效果: '达妮娅平时抗拒主动使用，只会在危险时候释放。每战仅限1次，解放体内“阿列夫一”的鸣式力量，进入【黑化/解放态】。此状态下无法再使用【织梦的飨晏】，泡泡全部改为为漆黑的虚质巨手与小型黑洞进行碾压攻击。在此状态下，普攻最终伤害额外增加50%，且解锁技能【终景·布景之形】。',
                    新版效果: '达妮娅平时抗拒主动使用，只会在危险时候释放。每战仅限1次，解放体内“阿列夫一”的鸣式力量，进入【黑化/解放态】。此状态下无法再使用【织梦的飨晏】，泡泡全部改为为漆黑的虚质巨手与小型黑洞进行碾压攻击。在此状态下，普攻最终伤害额外增加50%，且解锁技能【终景·布景之形】。',
                    描述: '衣裙蔓延成深不见底的暗夜色泽，蓝色的冰冷光环凝聚于头顶。紫眸中不再有慵懒的笑意，只剩下冰冷的厌弃与暴躁。这是她卸下所有伪装，走向毁灭的终极姿态。'
                },
                '终景·布景之形': {
                    品质: '传说',
                    类型: '特殊',
                    经典效果: '仅在【帷幕终景】解放状态下可释放，每战1次。虚质力量笼罩全场，遮蔽天幕，形成冰冷宇宙夜空般的场地效果，持续3轮。场地存在期间，我方全员攻击检定优势，所有攻击最终伤害再提升30%(与帷幕终景合并计算，达妮娅普攻共额外总增80%)，并解锁技能【终景·幻灭之形】。',
                    新版效果: '仅在【帷幕终景】解放状态下可释放，每战1次。虚质力量笼罩全场，遮蔽天幕，形成冰冷宇宙夜空般的场地效果，持续3轮。场地存在期间，我方全员攻击检定优势，所有攻击最终伤害再提升30%(与帷幕终景合并计算，达妮娅普攻共额外总增80%)，并解锁技能【终景·幻灭之形】。',
                    描述: '当她认为一切皆为虚无，连带她自己也不过是毫无意义的存在时，这片深邃的星空便是她为悲剧搭设的最终舞台。'
                },
                '终景·幻灭之形': {
                    品质: '史诗',
                    类型: '伤害',
                    经典效果: '仅在【终景·布景之形】持续期间可释放。主动破碎星空布景（全队立即失去加成），并退出【黑化/解放态】状态。降下毁灭性的打击，对广域全体敌人造成[1000% + 25% × (等级 - 1)]火属性伤害，并使以自身为中心的场地化为【蚀域】直至战斗结束。处于蚀域的任何人(不分敌我，包括自己和队友)，每轮行动前需进行【DC10+达妮娅智力调整值】的体质豁免，失败则受到等同于自己最大生命值5%的真实伤害。',
                    新版效果: '仅在【终景·布景之形】持续期间可释放。主动破碎星空布景（全队立即失去加成），并退出【黑化/解放态】状态。降下毁灭性的打击，对广域全体敌人造成[280% + 4% × (等级 - 1)]火属性伤害，并使以自身为中心的场地化为【蚀域】直至战斗结束。处于蚀域的任何人(不分敌我，包括自己和队友)，每轮行动前需进行【DC10+达妮娅智力调整值】的体质豁免，失败则受到等同于自己最大生命值5%的真实伤害。',
                    描述: '布景崩塌，她将自己连同敌人一并拖入虚质的深渊。“就算坠入虚无也不必害怕，因为一片虚无中，会有我在。”'
                }
            },
            外貌: '娇小丰盈，白皙柔和。长发从浅粉渐变为浅蓝，左侧编有麻花辫，头顶翘着呆毛。解放态时眼神化为冰冷的厌弃，手足被深紫色星云状附着物覆盖。',
            着装: '浅蓝色露肩抹胸连衣裙，外白内黑双层裙摆。颈戴锁链项圈，锁骨下固定着一枚硕大蓝宝石以遮掩声痕。双腿裸露，脚踩交叉绑带黑色玛丽珍鞋。右侧腰间悬挂着的黑色小熊玩偶。',
            好感度: 30,
            同行誓约: false,
            连携奥义: {
                '祝愿你于静默中，得到太阳': {
                    品质: '史诗',
                    类型: '特殊',
                    经典效果: '消耗100CP。解除达妮娅【生命值锁定为1】与【无法受疗和获得护盾】的负面状态，回复至满血。全体队友获得增益状态，攻击检定额外+达妮娅智力调整值，并使我方任何低于10的骰子在结算时改为10，持续3轮',
                    新版效果: '消耗100CP。解除达妮娅【生命值锁定为1】与【无法受疗和获得护盾】的负面状态，回复至满血。全体队友获得增益状态，攻击检定额外+达妮娅智力调整值，并使我方任何低于10的骰子在结算时改为10，持续3轮',
                    描述: '她静静的等待着，将那借来的光明还给主序星的时刻。'
                }
            }
        },
        '洛茜': {
            性别: '女',
            附近: true,
            种族: '鲁珀',
            等级: 1,
            属性: { 力量: 14, 敏捷: 20, 体质: 12, 智力: 10, 感知: 18, 魅力: 16 },
            装备列表: {
                '狼之绯': {
                    类型: '武器', 部位: '主手', 名称: '狼之绯', 品质: '卓越', 等级: 1, 强化等级: 0,
                    标签: ['单手剑', '合金', '工业改装', '裂地者'],
                    属性加成: { 敏捷: 1, 感知: 1, 暴击率: 5, 必杀: 1 },
                    效果: '[先猎] 攻击检定+1;[群狼嗜噬] 暴击命中时触发，本次最终伤害额外+20%，对处于[爪印斫痕]的目标攻击时，攻击检定额外+3。',
                    描述: '雷神工业热销款长剑，刃身暗红，剑脊嵌散热模块与改装接口。',
                    装备箱: false
                },
                '赤红斗篷': {
                    类型: '防具', 部位: '上衣', 名称: '赤红斗篷', 品质: '卓越', 等级: 1, 强化等级: 0,
                    标签: ['斗篷', '兽皮织物', '染血', '遗物'],
                    属性加成: { 敏捷: 1, 进阶: 1 },
                    效果: '[血脉不灭] 当HP低于25%时触发，免疫[恐惧]，下一次攻击最终伤害+30%;[游刃] 闪避与先攻相关检定+2。',
                    描述: '沾染族人鲜血的深红兜帽斗篷，触之如被家人环抱。',
                    装备箱: false
                }
            },
            技能: {
                '血红之影': {
                    品质: '卓越',
                    类型: '伤害',
                    经典效果: '高速突进斩击目标，造成[500% + 15% × (等级 - 1)]物理伤害并施加[爪印斫痕]2轮；目标需进行DC15力量豁免，失败则[击飞]并击退一个距离档。若目标已处于[爪印斫痕]，额外释放狼之珀追击，追加[300% + 10% × (等级 - 1)]灼热伤害。',
                    新版效果: '高速突进斩击目标，造成[200% + 2.5% × (等级 - 1)]物理伤害并施加[爪印斫痕]2轮；目标需进行DC15力量豁免，失败则[击飞]并击退一个距离档。若目标已处于[爪印斫痕]，额外释放狼之珀追击，追加[170% + 2% × (等级 - 1)]灼热伤害。',
                    描述: '赤影掠地一闪即至，第二道利爪已从死角袭来。'
                },
                '利爪奇袭': {
                    品质: '传说',
                    类型: '伤害',
                    经典效果: '斗篷遮蔽视线后双刃交替刺击，造成[800% + 20% × (等级 - 1)]灼热伤害；此次攻击暴击时最终伤害额外+50%。命中后对目标施加[爪印斫痕]2轮。友方可消耗反应动作对具有[爪印斫痕]追加一次必定命中和暴击的普通攻击，然后移除爪印斫痕。',
                    新版效果: '斗篷遮蔽视线后双刃交替刺击，造成[240% + 3% × (等级 - 1)]灼热伤害；此次攻击暴击时最终伤害额外+50%。命中后对目标施加[爪印斫痕]2轮。友方可消耗反应动作对具有[爪印斫痕]追加一次必定命中和暴击的普通攻击，然后移除爪印斫痕。',
                    描述: '群狼撕咬般的连绵刺击，最后两刀落时猎物已无路可逃。'
                }
            },
            外貌: '金色长发束成侧鬓，金色菱形瞳孔，狼耳蓬松狼尾，面容稚嫩但眼神锐利，极为娇小。',
            着装: '深红色兜帽斗篷搭配无袖连衣裙与中靴，轻装便于行动，腰间佩单手剑与匕首。',
            好感度: 25,
            同行誓约: false,
            连携奥义: {
                '群狼的围猎': {
                    品质: '传说',
                    类型: '伤害',
                    经典效果: '消耗100CP。洛茜呼唤狼群，召唤3头血量等同于洛茜的灼血之狼加入战斗，它们独立行动，不占用洛茜的行动机会，有以下特点：1、每轮主动做合计造成[800% + 20% × (等级 - 1)] x 60%的灼热伤害。2、当敌人命中检定通过，user或洛茜即将受击时，每头狼可各自消耗反应动作代为承担伤害。3、召唤持续至战斗结束。当敌人血量处于25%以下，并至少还有2头狼存活时，可主动触发：消耗User的主动作与洛茜的主动作，联合所有狼群一同[处决]敌人，使25%血量以下的敌人即死，然后被召唤的狼群消失。',
                    新版效果: '消耗100CP。洛茜呼唤狼群，召唤3头血量等同于洛茜的灼血之狼加入战斗，它们独立行动，不占用洛茜的行动机会，有以下特点：1、每轮主动做合计造成[240% + 3% × (等级 - 1)] x 60%的灼热伤害。2、当敌人命中检定通过，user或洛茜即将受击时，每头狼可各自消耗反应动作代为承担伤害。3、召唤持续至战斗结束。当敌人血量处于25%以下，并至少还有2头狼存活时，可主动触发：消耗User的主动作与洛茜的主动作，联合所有狼群一同[处决]敌人，使25%血量以下的敌人即死，然后被召唤的狼群消失。',
                    描述: '正面逼退猎物退路的瞬间，狼牙已从死角咬穿咽喉。'
                }
            },
            当前想法: ''
        }
    };

    function getStarterTeammateTemplate(bondName) {
        return STARTER_TEAMMATE_TEMPLATE_MAP[String(bondName || '').trim()] || null;
    }

    function syncStarterTeammateEquipLevels(equipList, level) {
        Object.values(equipList || {}).forEach(item => {
            if (!item || typeof item !== 'object') return;
            item.等级 = level;
            if (item.强化等级 === undefined || item.强化等级 === null) item.强化等级 = 0;
            if (item.装备箱 === undefined) item.装备箱 = false;
        });
    }

    function applyStarterTeammateTemplateToBond(bondName, bond, statData = null) {
        const template = getStarterTeammateTemplate(bondName);
        if (!template || !bond || typeof bond !== 'object') return false;

        const currentLevel = Math.max(1, safeParseInt(bond.等级, safeParseInt(template.等级, 1)));
        const combatMode = getCombatValueMode(statData);
        const equippedList = clonePlainValue(template.装备列表 || {});
        const skills = clonePlainValue(template.技能 || {});
        const comboSkills = clonePlainValue(template.连携奥义 || {});
        syncStarterTeammateEquipLevels(equippedList, currentLevel);
        applyStarterTemplateEffectsByMode(equippedList, combatMode);
        applyStarterTemplateEffectsByMode(skills, combatMode);
        applyStarterTemplateEffectsByMode(comboSkills, combatMode);

        bond.性别 = template.性别 ?? bond.性别;
        bond.附近 = template.附近 !== false;
        bond.种族 = template.种族 ?? bond.种族;
        bond.等级 = currentLevel;
        bond.属性 = clonePlainValue(template.属性 || {});
        bond.装备列表 = equippedList;
        bond.技能 = skills;
        bond.外貌 = template.外貌 || '';
        bond.着装 = template.着装 || '';
        if (template.好感度 !== undefined) bond.好感度 = safeParseInt(template.好感度, safeParseInt(bond.好感度, 0));
        if (template.同行誓约 !== undefined) bond.同行誓约 = template.同行誓约 === true;
        if (template.连携奥义 && typeof template.连携奥义 === 'object') {
            bond.连携奥义 = comboSkills;
        }
        return true;
    }

    function applyStarterTeammateTemplatesOnNewBonds(statData, statDataBefore) {
        const bonds = statData?.羁绊列表;
        if (!bonds || typeof bonds !== 'object') return;

        const beforeMap = (statDataBefore?.羁绊列表 && typeof statDataBefore.羁绊列表 === 'object')
            ? statDataBefore.羁绊列表
            : {};

        Object.entries(bonds).forEach(([bondName, bond]) => {
            if (!bond || typeof bond !== 'object') return;
            if (beforeMap[bondName] !== undefined) return;
            if (!getStarterTeammateTemplate(bondName)) return;
            if (applyStarterTeammateTemplateToBond(bondName, bond, statData)) {
                console.log(`[开局队友拦截] ${bondName} 新注册，已按开局模板覆盖并同步等级 ${bond.等级}`);
            }
        });
    }

    function getBriefDisplayPathList(statData) {
        const paths = statData?.系统配置?.简详显示?.简要显示路径;
        return Array.isArray(paths) ? paths.filter(path => typeof path === 'string' && path.trim()) : [];
    }

    function getBriefBondNameSet(statData) {
        const names = new Set();
        getBriefDisplayPathList(statData).forEach(path => {
            const normalized = path.trim();
            if (!normalized.startsWith(BOND_BRIEF_PATH_PREFIX)) return;
            const name = normalized.slice(BOND_BRIEF_PATH_PREFIX.length).trim();
            if (name) names.add(name);
        });
        return names;
    }

    function isBondBriefDisplay(statData, bondName) {
        return getBriefBondNameSet(statData).has(String(bondName || '').trim());
    }

    function guardBriefDisplayBonds(statData, statDataBefore) {
        if (!statDataBefore) return;
        const frozenBondNames = getBriefBondNameSet(statData);
        if (frozenBondNames.size <= 0) return;

        const bonds = statData?.羁绊列表;
        const oldBonds = statDataBefore?.羁绊列表;
        if (!bonds || typeof bonds !== 'object') return;
        if (!oldBonds || typeof oldBonds !== 'object') return;

        frozenBondNames.forEach(name => {
            const oldBond = oldBonds[name];
            const newBond = bonds[name];
            if (oldBond === undefined) {
                if (newBond !== undefined) {
                    delete bonds[name];
                    console.warn(`[变量守卫] ⚠️ 简略显示羁绊 "${name}" 不存在于上一帧，已移除新增数据`);
                }
                return;
            }
            if (hasChanged(oldBond, newBond)) {
                bonds[name] = clonePlainValue(oldBond);
                console.warn(`[变量守卫] ⚠️ 简略显示羁绊 "${name}" 被修改，已整体回滚并冻结`);
            }
        });
    }

    // 位于「当前事件」下、只允许合并不允许整体丢失的对象键。
    // 典型隐患：AI 结算/进入新副本时用 { "op":"add", "path":"/当前事件/惊悚乐园副本", "value": { 单个副本 } }
    // 会把之前已完成副本的记录整体冲掉；或直接 remove 整个对象/整个「当前事件」导致进度丢失。
    // 如需保护更多进度对象（例如龙族副本），在此追加键名即可。
    const MERGE_PROTECTED_EVENT_KEYS = ['惊悚乐园副本', '惊悚乐园副本评价'];

    function isPlainObject(value) {
        return !!value && typeof value === 'object' && !Array.isArray(value);
    }

    // 以新对象为基础，补回旧对象中缺失的子键；同名子键保留新值
    // （允许「进行中→已完成」、评价刷新等合法更新），只防止旧子键被整体抹掉。
    function mergePreserveOldChildKeys(oldObj, newObj) {
        const merged = isPlainObject(newObj) ? clonePlainValue(newObj) : {};
        if (isPlainObject(oldObj)) {
            for (const [key, oldChild] of Object.entries(oldObj)) {
                if (!Object.prototype.hasOwnProperty.call(merged, key)) {
                    merged[key] = clonePlainValue(oldChild);
                }
            }
        }
        return merged;
    }

    function guardMergeProtectedEvents(statData, statDataBefore) {
        const oldEvents = statDataBefore?.当前事件;
        if (!isPlainObject(oldEvents)) return;

        // 收集旧数据中真实存在、且非空的受保护对象
        const protectedOldObjs = {};
        for (const key of MERGE_PROTECTED_EVENT_KEYS) {
            const oldObj = oldEvents[key];
            if (isPlainObject(oldObj) && Object.keys(oldObj).length > 0) {
                protectedOldObjs[key] = oldObj;
            }
        }
        if (Object.keys(protectedOldObjs).length === 0) return;

        // 情况A：整个「当前事件」被删除或置空 → 重建容器，仅放回受保护对象，其余照常删除
        if (!isPlainObject(statData.当前事件)) {
            statData.当前事件 = {};
            for (const [key, oldObj] of Object.entries(protectedOldObjs)) {
                statData.当前事件[key] = clonePlainValue(oldObj);
                console.warn(`[变量守卫] ⚠️「当前事件」被整体删除，已保留「${key}」防止副本进度丢失`);
            }
            return;
        }

        // 情况B：容器仍在，但受保护对象被整体删除或被 add 覆盖导致旧子键丢失 → 合并补回
        const newEvents = statData.当前事件;
        for (const [key, oldObj] of Object.entries(protectedOldObjs)) {
            const newObj = newEvents[key];
            const merged = mergePreserveOldChildKeys(oldObj, newObj);
            if (!hasChanged(newObj, merged)) continue;

            const lostKeys = Object.keys(oldObj).filter(k => !isPlainObject(newObj) || !Object.prototype.hasOwnProperty.call(newObj, k));
            newEvents[key] = merged;
            if (!isPlainObject(newObj)) {
                console.warn(`[变量守卫] ⚠️「当前事件/${key}」被整体删除，已恢复子项：${lostKeys.join('、') || '（无）'}`);
            } else {
                console.warn(`[变量守卫] ⚠️「当前事件/${key}」被整体覆盖，已补回丢失的子项：${lostKeys.join('、') || '（无）'}`);
            }
        }
    }

    function guardProtectedFields(statData, statDataBefore) {
        if (!statDataBefore) return;
        console.log(`[变量守卫调试] 开始检查, PROTECTED_PATHS=${JSON.stringify(PROTECTED_PATHS)}`);
        for (const path of PROTECTED_PATHS) {
            const oldVal = getByPath(statDataBefore, path);
            const newVal = getByPath(statData, path);
            console.log(`[变量守卫调试] ${path}: old=${JSON.stringify(oldVal)}, new=${JSON.stringify(newVal)}, changed=${hasChanged(oldVal, newVal)}`);
            if (oldVal !== undefined && hasChanged(oldVal, newVal)) {
                console.warn(`[变量守卫] ⚠️ 受保护字段被外部修改: ${path} (${JSON.stringify(oldVal)} → ${JSON.stringify(newVal)})，已回滚`);
                setByPath(statData, path, oldVal);
            }
        }

        guardMergeProtectedEvents(statData, statDataBefore);
        guardBriefDisplayBonds(statData, statDataBefore);
        applyStarterTeammateTemplatesOnNewBonds(statData, statDataBefore);

        // 装备新增守卫：仅拦截“新加装备”默认落位错误的情况
        // 规则：新增装备若装备箱=false，自动修正为 true；
        // 不处理已有装备，避免影响老装备在后续更新时的合法改动。
        const oldEquipList = statDataBefore?.人物?.装备列表 || {};
        const newEquipList = statData?.人物?.装备列表 || {};
        for (const [equipKey, equipVal] of Object.entries(newEquipList)) {
            if (!equipVal || typeof equipVal !== 'object') continue;
            const isNewEquip = oldEquipList[equipKey] === undefined;
            if (isNewEquip) {
                const equipName = (typeof equipVal.名称 === 'string') ? equipVal.名称.trim() : '';
                if (!equipName) {
                    equipVal.名称 = equipKey;
                    console.warn(`[变量守卫] ⚠️ 新增装备 "${equipKey}" 名称为空，已自动回填为键名`);
                }
                sanitizeNewEquipCoreAttrBonuses(equipKey, equipVal);
            }
            if (isNewEquip && equipVal.装备箱 === false) {
                equipVal.装备箱 = true;
                console.warn(`[变量守卫] ⚠️ 新增装备 "${equipKey}" 的装备箱为 false，已自动修正为 true`);
            }
        }
    }

    function collectEquippedReductionContrib(player) {
        const 装备列表 = player?.装备列表 || {};
        let physDefense = 0;
        let magDefense = 0;
        let physBonus = 0;
        let magBonus = 0;

        Object.values(装备列表).forEach(item => {
            if (!item || !item.名称 || item.装备箱) return;

            const bonuses = item.属性加成 || {};
            physBonus += safeParseFloat(bonuses['物理减伤'], 0);
            magBonus += safeParseFloat(bonuses['魔法减伤'], 0);

            if ((item.类型 === '防具' || isShieldLikeEquip(item)) && !isSpecialEquippedItem(item)) {
                const armorSlot = isShieldLikeEquip(item) ? '盾牌' : getEquipStoredSlot(item);
                physDefense += getArmorDefenseValue(item, armorSlot || item.部位);
            } else if (item.类型 === '首饰') {
                if (!isSpecialEquippedItem(item)) {
                    magDefense += getAccessoryDefenseValue(item, getEquipStoredSlot(item) || item.部位);
                }
            }
        });

        const physFromDefense = defenseToReductionPercent(physDefense, PHYS_DEF_FULL_SCALE);
        const magFromDefense = defenseToReductionPercent(magDefense, MAG_DEF_FULL_SCALE);

        return {
            physDefense,
            magDefense,
            physBonus,
            magBonus,
            physFromDefense,
            magFromDefense
        };
    }

    // 仅在装备变化时写回减伤，避免覆盖非装备来源的临时Buff改动
    function calculateDamageReductions(player, playerBefore) {
        if (!player) return;
        if (!player.战斗属性) player.战斗属性 = {};
        const combat = player.战斗属性;

        const curr = collectEquippedReductionContrib(player);
        const currEquipPhys = curr.physBonus + curr.physFromDefense;
        const currEquipMag = curr.magBonus + curr.magFromDefense;

        let basePhys = 0;
        let baseMag = 0;

        if (playerBefore) {
            const prevCombat = playerBefore.战斗属性 || {};
            const prev = collectEquippedReductionContrib(playerBefore);
            const prevEquipPhys = prev.physBonus + prev.physFromDefense;
            const prevEquipMag = prev.magBonus + prev.magFromDefense;
            basePhys = safeParseFloat(prevCombat.物理减伤, 0) - prevEquipPhys;
            baseMag = safeParseFloat(prevCombat.魔法减伤, 0) - prevEquipMag;
        } else {
            // 首次兜底：尽量从当前值反推“非装备基础减伤”
            basePhys = safeParseFloat(combat.物理减伤, 0) - currEquipPhys;
            baseMag = safeParseFloat(combat.魔法减伤, 0) - currEquipMag;
        }

        basePhys = clamp(basePhys, 0, DAMAGE_REDUCTION_CAP);
        baseMag = clamp(baseMag, 0, DAMAGE_REDUCTION_CAP);

        const newPhys = clamp(Math.round(basePhys + currEquipPhys), 0, DAMAGE_REDUCTION_CAP);
        const newMag = clamp(Math.round(baseMag + currEquipMag), 0, DAMAGE_REDUCTION_CAP);

        if (safeParseFloat(combat.物理减伤, 0) !== newPhys) {
            console.log(`[减伤计算] 物理减伤: ${combat.物理减伤} → ${newPhys} (基础${basePhys.toFixed(2)} + 词条${curr.physBonus.toFixed(2)} + 防御映射${curr.physFromDefense})`);
            combat.物理减伤 = newPhys;
        }
        if (safeParseFloat(combat.魔法减伤, 0) !== newMag) {
            console.log(`[减伤计算] 魔法减伤: ${combat.魔法减伤} → ${newMag} (基础${baseMag.toFixed(2)} + 词条${curr.magBonus.toFixed(2)} + 防御映射${curr.magFromDefense})`);
            combat.魔法减伤 = newMag;
        }
    }

    function calculateBondMaxHP(bond, bondName, options = {}) {
        if (!bond) return;
        const initMissingCurrentHp = options.initMissingCurrentHp === true;
        const rootData = options.rootData || null;

        let equipHpBonus = 0;
        const 装备列表 = bond.装备列表 || {};
        Object.values(装备列表).forEach(item => {
            if (!item || !item.名称 || item.装备箱) return;
            const bonuses = item.属性加成 || {};
            equipHpBonus += safeParseInt(bonuses['生命值上限'], 0);
        });

        const newMaxHP = calcHpByMode(bond, rootData, equipHpBonus);

        const oldMaxHP = safeParseInt(bond.生命值上限, 0);
        const oldCurrentHP = safeParseInt(bond.当前生命值, 0);

        if (oldMaxHP !== newMaxHP) {
            bond.生命值上限 = newMaxHP;
            console.log(`[羁绊HP] ${bondName} 生命值上限 ${oldMaxHP} → ${newMaxHP}`);

            if (oldMaxHP > 0 && oldCurrentHP > 0) {
                const hpRatio = oldCurrentHP / oldMaxHP;
                const newCurrentHP = Math.max(1, Math.round(hpRatio * newMaxHP));
                bond.当前生命值 = Math.min(newCurrentHP, newMaxHP);
                console.log(`[羁绊HP] ${bondName} 按比例修正: ${oldCurrentHP} → ${bond.当前生命值} (${Math.round(hpRatio * 100)}%)`);
            } else if (initMissingCurrentHp && (bond.当前生命值 === undefined || bond.当前生命值 === null)) {
                bond.当前生命值 = newMaxHP;
                console.log(`[羁绊HP] ${bondName} 缺失当前生命值，已初始化为 ${newMaxHP}`);
            } else if (oldCurrentHP > newMaxHP) {
                bond.当前生命值 = newMaxHP;
            }
            return;
        }

        // 生命上限未变化时，仅兜底缺失字段
        if (initMissingCurrentHp && (bond.当前生命值 === undefined || bond.当前生命值 === null)) {
            bond.当前生命值 = newMaxHP;
            console.log(`[羁绊HP] ${bondName} 缺失当前生命值，已初始化为 ${newMaxHP}`);
        }
    }

    function ensureAllBondsThresholdCorrect(statData, playerName) {
        const bonds = statData?.羁绊列表;
        if (!bonds || typeof bonds !== 'object') return;

        Object.entries(bonds).forEach(([name, bond]) => {
            if (!bond || typeof bond !== 'object') return;
            if (name === playerName) return;
            if (!isBondShareExpEnabled(bond)) return;

            const bondLevel = safeParseInt(bond.等级, 1);
            const levelBaseExp = getLevelBaseTotalExp(bondLevel);
            const parsedExp = parseFloat(bond.当前总经验);
            
            // 修正当前总经验
            if (bond.当前总经验 === undefined || bond.当前总经验 === null || isNaN(parsedExp)) {
                bond.当前总经验 = levelBaseExp;
                console.log(`[羁绊修正] ${name} 缺失当前总经验，已按 Lv.${bondLevel} 初始化为 ${levelBaseExp}`);
            } else if (parsedExp < levelBaseExp) {
                bond.当前总经验 = levelBaseExp;
                console.log(`[羁绊修正] ${name} 当前总经验过低(${parsedExp})，已按 Lv.${bondLevel} 修正为 ${levelBaseExp}`);
            }

            // 修正升级阈值（关键：检查阈值是否与等级匹配）
            const correctThreshold = calculateDiabloThreshold(bondLevel + 1);
            const parsedThreshold = safeParseFloat(bond.升级阈值, 0);
            if (bond.升级阈值 === undefined || bond.升级阈值 === null || parsedThreshold !== correctThreshold) {
                const oldThreshold = parsedThreshold || '缺失';
                bond.升级阈值 = correctThreshold;
                console.log(`[羁绊修正] ${name} Lv.${bondLevel} 升级阈值错误(${oldThreshold})，已修正为 ${correctThreshold}`);
            }
        });
    }

    function ensureNearbyBondCompatFields(statData, playerName) {
        const bonds = statData?.羁绊列表;
        if (!bonds || typeof bonds !== 'object') return;

        Object.entries(bonds).forEach(([name, bond]) => {
            if (!bond || typeof bond !== 'object') return;
            if (bond.附近 !== true) return;
            if (name === playerName) return;

            const missingHp = bond.生命值上限 === undefined || bond.生命值上限 === null ||
                safeParseInt(bond.生命值上限, 0) <= 0 ||
                bond.当前生命值 === undefined || bond.当前生命值 === null;
            if (missingHp) {
                calculateBondMaxHP(bond, name, { initMissingCurrentHp: true, rootData: statData });
            }
        });
    }

    function ensureNewBondHpInitialized(statData, statDataBefore, playerName) {
        const bonds = statData?.羁绊列表;
        if (!bonds || typeof bonds !== 'object') return;

        const bondsBefore = statDataBefore?.羁绊列表;
        const beforeMap = (bondsBefore && typeof bondsBefore === 'object') ? bondsBefore : {};

        Object.entries(bonds).forEach(([name, bond]) => {
            if (!bond || typeof bond !== 'object') return;
            if (name === playerName) return;

            const existedBefore = beforeMap[name] && typeof beforeMap[name] === 'object';
            if (existedBefore) return;

            const hpLooksLikeSchemaDefault =
                safeParseInt(bond.生命值上限, 0) <= 1 &&
                safeParseInt(bond.当前生命值, 0) <= 0;

            calculateBondMaxHP(bond, name, { initMissingCurrentHp: true, rootData: statData });
            if (hpLooksLikeSchemaDefault && safeParseInt(bond.当前生命值, 0) <= 0) {
                bond.当前生命值 = Math.max(safeParseInt(bond.生命值上限, 1), 1);
                console.log(`[羁绊注册] ${name} 检测到默认HP，已初始化为满血 ${bond.当前生命值}/${bond.生命值上限}`);
            }

            const bondLevel = safeParseInt(bond.等级, 1);
            const levelBaseExp = getLevelBaseTotalExp(bondLevel);
            const parsedExp = parseFloat(bond.当前总经验);
            if (bond.当前总经验 === undefined || bond.当前总经验 === null || isNaN(parsedExp) || parsedExp < levelBaseExp) {
                const oldExpText = (bond.当前总经验 === undefined || bond.当前总经验 === null || isNaN(parsedExp))
                    ? '缺失'
                    : parsedExp;
                bond.当前总经验 = levelBaseExp;
                console.log(`[羁绊注册] ${name} 当前总经验(${oldExpText})已按 Lv.${bondLevel} 初始化为 ${levelBaseExp}`);
            }

            const parsedThreshold = safeParseFloat(bond.升级阈值, 0);
            if (bond.升级阈值 === undefined || bond.升级阈值 === null || parsedThreshold <= 0) {
                bond.升级阈值 = calculateDiabloThreshold(bondLevel + 1);
                console.log(`[羁绊注册] ${name} 缺失升级阈值，已初始化为 ${bond.升级阈值}`);
            }
            console.log(`[羁绊注册] ${name} 新注册，已完成基础初始化`);
        });
    }

    // ==========================================
    // 经营产出日期检查与待办推送
    // ==========================================

    const CALENDAR_DATE_REGEX = /^(.*?)(\d+)年(\d+)月(\d+)日$/;
    const DAY_MS = 24 * 60 * 60 * 1000;

    function parseCalendarDate(text) {
        if (typeof text !== 'string') return null;
        const raw = text.trim();
        if (!raw) return null;
        const m = raw.match(CALENDAR_DATE_REGEX);
        if (!m) return null;

        const prefix = (m[1] || '').trim() || '阿拉德历';
        const year = safeParseInt(m[2], NaN);
        const month = safeParseInt(m[3], NaN);
        const day = safeParseInt(m[4], NaN);
        if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
        if (month < 1 || month > 12 || day < 1 || day > 31) return null;

        const date = new Date(Date.UTC(year, month - 1, day));
        if (date.getUTCFullYear() !== year || date.getUTCMonth() !== (month - 1) || date.getUTCDate() !== day) {
            return null;
        }
        return { prefix, date, year, month, day };
    }

    function formatCalendarDate(prefix, date) {
        const y = date.getUTCFullYear();
        const m = date.getUTCMonth() + 1;
        const d = date.getUTCDate();
        return `${prefix || '阿拉德历'}${y}年${m}月${d}日`;
    }

    function addDaysToCalendarDate(date, days) {
        const next = new Date(date.getTime());
        next.setUTCDate(next.getUTCDate() + days);
        return next;
    }

    function getCalendarDayDiff(laterDate, earlierDate) {
        const left = Date.UTC(laterDate.getUTCFullYear(), laterDate.getUTCMonth(), laterDate.getUTCDate());
        const right = Date.UTC(earlierDate.getUTCFullYear(), earlierDate.getUTCMonth(), earlierDate.getUTCDate());
        return Math.floor((left - right) / DAY_MS);
    }

    function hasEffectiveProduction(outputText) {
        if (typeof outputText !== 'string') return false;
        const text = outputText.trim();
        if (!text) return false;
        const normalized = text.replace(/\s+/g, '');
        const emptyWords = new Set(['无', '暂无', '无产出', '空', 'none', 'null', '无收益', '暂无收益']);
        return !emptyWords.has(normalized.toLowerCase());
    }

    function detectProductionCycleDays(outputText) {
        const text = (outputText || '').toString();
        if (/每日|每天|日产|日结|每1天/i.test(text)) return 1;
        if (/每月|月产|月结|每30天|每个月/i.test(text)) return 30;
        if (/每周|周产|周结|每7天|每星期|每礼拜/i.test(text)) return 7;
        return 7;
    }

    function syncAssetProductionSchedules(statData) {
        const assets = statData?.核心资产;
        if (!assets || typeof assets !== 'object') return;

        const worldCalendar = statData?.世界信息?.年历;
        const nowParsed = parseCalendarDate(worldCalendar);
        if (!nowParsed) {
            console.warn(`[经营结算] 当前年历格式无法解析: ${worldCalendar}`);
            return;
        }
        const nowDate = nowParsed.date;
        const datePrefix = nowParsed.prefix || '阿拉德历';

        Object.entries(assets).forEach(([assetName, asset]) => {
            if (!asset || typeof asset !== 'object') return;

            if (!Array.isArray(asset.待办事件)) {
                asset.待办事件 = [];
            }

            const seqMap = asset.建设序列;
            if (!seqMap || typeof seqMap !== 'object') return;

            const overdueLines = [];
            Object.entries(seqMap).forEach(([seqName, seq]) => {
                if (!seq || typeof seq !== 'object') return;

                const outputText = (typeof seq.产出 === 'string') ? seq.产出.trim() : '';
                const hasOutput = hasEffectiveProduction(outputText);
                const cycleDays = detectProductionCycleDays(outputText);
                const nextDateRaw = (typeof seq.下次产出日期 === 'string') ? seq.下次产出日期.trim() : '';
                const nextDateParsed = parseCalendarDate(nextDateRaw);

                if (!nextDateParsed) {
                    if (hasOutput) {
                        seq.下次产出日期 = formatCalendarDate(datePrefix, addDaysToCalendarDate(nowDate, cycleDays));
                    }
                    return;
                }

                const overdueDays = getCalendarDayDiff(nowDate, nextDateParsed.date);
                // 仅处理“过期至少2天”且仍未被AI刷新日期的条目，避免冲突
                if (overdueDays < 2) return;
                if (!hasOutput) return;

                overdueLines.push(`${seqName}→${outputText}`);
                seq.下次产出日期 = formatCalendarDate(datePrefix, addDaysToCalendarDate(nowDate, cycleDays));
            });

            if (overdueLines.length > 0) {
                const location = (typeof asset.所在地 === 'string' && asset.所在地.trim()) ? asset.所在地.trim() : '未知地点';
                const todoText = `【经营到期结算】${assetName}（${location}）：${overdueLines.join('；')}`;
                const exists = asset.待办事件.some(v => typeof v === 'string' && v === todoText);
                if (!exists) {
                    asset.待办事件.push(todoText);
                    console.log(`[经营结算] ${assetName} 发现${overdueLines.length}条过期产出，已推送待办并刷新下次产出日期`);
                }
            }
        });
    }

    // ==========================================
    // 主逻辑
    // ==========================================

    let is_initialized_log = false;

    /**
     * 防重入标志：防止脚本修改 stat_data 后触发 schema reconciliation
     * 再次进入 VARIABLE_UPDATE_ENDED 导致无限循环
     */
    let isProcessing = false;

    function handleExperienceProcessing(rawVariables, rawVariablesBefore) {
        // 防重入：如果正在处理中，直接跳过
        if (isProcessing) {
            console.log('[辅助脚本] ⚠️ 防重入拦截，跳过本次处理');
            return;
        }
        isProcessing = true;

        try {
            const statData = rawVariables?.stat_data;
            const statDataBefore = rawVariablesBefore?.stat_data;

            if (!statData) return;

            const player = statData.人物;
            if (!player) return;

            // ★ 先迁移旧品质名，避免新增装备守卫把“神器”误判为未知品质
            normalizeLegacyQualityNames(statData);
            guardProtectedFields(statData, statDataBefore);
            migrateBagCurrency(statData);

            // 初始化日志（只打印一次）
            if (!is_initialized_log) {
                console.log('[辅助脚本] MVU 变量连接成功');
                is_initialized_log = true;
            }

            // ---- 变更检测：只处理实际变化的模块 ----

            const playerBefore = statDataBefore?.人物;
            const combatValueModeChanged = getCombatValueMode(statData) !== getCombatValueMode(statDataBefore || {});
            
            // 先修正所有羁绊的升级阈值（无论是否附近、是否新注册）
            ensureAllBondsThresholdCorrect(statData, player?.名称 || '');
            ensureNewBondHpInitialized(statData, statDataBefore, player?.名称 || '');
            ensureNearbyBondCompatFields(statData, player?.名称 || '');
            // 经营产出到期检查（仅处理过期>=2天条目，避免与AI实时更新冲突）
            syncAssetProductionSchedules(statData);
            const playerExpBefore = safeParseFloat(playerBefore?.当前总经验, 0);
            const playerExpNow = safeParseFloat(player.当前总经验, 0);
            const playerExpDelta = playerExpNow - playerExpBefore;

            if (playerBefore && playerExpDelta !== 0) {
                console.log(`[经验分发] 主角经验变化: ${playerExpBefore} → ${playerExpNow} (Δ${playerExpDelta})`);
            }

            // 经验值/等级变化 → 升级逻辑
            if (!playerBefore ||
                player.当前总经验 !== playerBefore.当前总经验 ||
                player.等级 !== playerBefore.等级) {
                processLevelUp(player);
            }
            syncPlayerActionResources(player);

            // 每次变量更新都校正一次绯等级，修复历史脏数据并保证与玩家等级一致
            upgradeHiWeaponQuality(player);

            // 主角获得经验后，给符合条件的羁绊队友同步经验：
            // 60级及以下全羁绊共享，60级以上仍只限附近队友
            if (playerBefore && playerExpDelta > 0) {
                shareExpToEligibleBonds(statData, playerExpDelta, player);
            }

            const equipChanged = !playerBefore || hasChanged(player.装备列表, playerBefore.装备列表);
            if (equipChanged && playerBefore) {
                syncCoreAttrsOnEquipChange(player, playerBefore, '主角');
            }

            // 等级/体质/装备变化 → HP上限重算
            if (!playerBefore ||
                player.等级 !== playerBefore.等级 ||
                player.属性?.体质 !== playerBefore.属性?.体质 ||
                equipChanged ||
                combatValueModeChanged) {
                calculateMaxHP(player, statData);
            }

            // 装备列表变化 → 装备数值重算
            calculateAllEquipmentStats(statData);

            const bonds = statData.羁绊列表;
            const bondsBefore = statDataBefore?.羁绊列表;
            if (bonds && typeof bonds === 'object') {
                Object.entries(bonds).forEach(([name, bond]) => {
                    if (!bond || typeof bond !== 'object') return;
                    const bondBefore = bondsBefore && typeof bondsBefore === 'object' ? bondsBefore[name] : null;
                    const bondEquipChanged = !bondBefore || hasChanged(bond.装备列表, bondBefore.装备列表);
                    const bondAttrChanged = !bondBefore || hasActorCoreAttrChanged(bond, bondBefore);

                    if (bondEquipChanged && bondBefore) {
                        syncCoreAttrsOnEquipChange(bond, bondBefore, `羁绊 ${name}`);
                    }

                    if (!bondBefore ||
                        bond.等级 !== bondBefore.等级 ||
                        safeParseInt(bond.属性?.体质, 10) !== safeParseInt(bondBefore.属性?.体质, 10) ||
                        bondEquipChanged ||
                        combatValueModeChanged) {
                        calculateBondMaxHP(bond, name, { initMissingCurrentHp: true, rootData: statData });
                    }

                    if (!bondBefore ||
                        bond.等级 !== bondBefore.等级 ||
                        bondEquipChanged ||
                        bondAttrChanged ||
                        combatValueModeChanged) {
                        calculateEquipmentStatsForActor(bond, statData, `羁绊 ${name}`);
                    }
                });
            }
            // 装备/种族变化 → AC重算
            if (!playerBefore ||
                equipChanged ||
                player.种族 !== playerBefore.种族) {
                calculateAC(statData);
            }

            // 装备变化/历史数据 → 按防御曲线写回百分比减伤（上限50%）
            calculateDamageReductions(player, playerBefore);

            // 暴击率变化/阈值异常 → 战斗属性重算
            calculateCombatStats(player);

            // 熟练度自动进阶 & AI阶位回滚
            handleProficiency(statData, statDataBefore);

            // 末日时钟（仅"大明志异"世界观，内部自带世界观判断）
            handleDoomClock(statData, statDataBefore);

            const comboEnteredBattle = handleComboBattleEntry(statData, statDataBefore);
            console.log(`[组合切换] 主循环 comboEnteredBattle=${comboEnteredBattle}`);
            const previousCombatValueMode = getCombatValueMode(statDataBefore);
            const currentCombatValueMode = getCombatValueMode(statData);
            const damageSyncOptions = previousCombatValueMode !== currentCombatValueMode
                ? { previousCombatValueMode }
                : {};

            // 按技能系统模式同步槽位（classic恢复手配槽位，combo仅在自动切换时重建6+3主动槽）
            syncSkillSlotsByMode(statData, statDataBefore, { syncComboSlots: comboEnteredBattle });
            syncEquippedSkillSlotDamageState(statData, damageSyncOptions);

            // combo模式直接从本次更新的槽位diff提取“本回合用了哪些技能”
            const comboRoundUsedSkills = collectComboRoundUsage(statData, statDataBefore) || [];

            // 技能冷却管理
            handleSkillCooldowns(statData, statDataBefore);

            // 战斗中且已装备连携奥义时，每轮结束后恢复CP
            handleComboCpRecovery(statData, statDataBefore);

            // combo模式在冷却结算后推进显示状态，并仅在自动切换后重建当前6+3槽位
            const comboAutoSwitched = advanceComboSkillState(statData, statDataBefore, comboRoundUsedSkills);
            console.log(`[组合切换] 主循环 comboAutoSwitched=${comboAutoSwitched}`);
            syncSkillSlotsByMode(statData, statDataBefore, { syncComboSlots: comboAutoSwitched });

            // 战斗结束时清零临时生命值
            const 战斗 = statData.战斗 || {};
            const 战斗Before = statDataBefore?.战斗 || {};
            if (战斗Before.是否战斗中 === true && 战斗.是否战斗中 === false) {
                if (player.临时生命值 > 0) {
                    player.临时生命值 = 0;
                    console.log('[临时HP] 战斗结束，临时生命值已清零');
                }
            }
        } finally {
            isProcessing = false;
        }
    }

    function processLevelUp(player) {
        let currentLevel = safeParseInt(player.等级, 1);
        let currentExp = safeParseFloat(player.当前总经验, 0);
        let requiredExp = safeParseFloat(player.升级阈值, 0);

        if (requiredExp <= 0) {
            requiredExp = calculateDiabloThreshold(currentLevel + 1);
            player.升级阈值 = requiredExp;
        }

        while (currentExp >= requiredExp && requiredExp > 0) {
            currentLevel++;
            player.等级 = currentLevel;

            if (!player.属性) player.属性 = {};
            if (currentLevel % 10 === 0) {
                player.属性.属性点 = safeParseInt(player.属性.属性点) + 1;
            }
            const spPerLevel = (player.种族 === '森精种') ? 30 : 25;
            const oldSP = safeParseInt(player.SP);
            const oldRP = safeParseInt(player.RP);
            player.SP = safeParseInt(player.SP) + spPerLevel;
            if (player.技能树) {
                player.技能树.总SP = safeParseInt(player.技能树.总SP) + spPerLevel;
            }
            player.RP = safeParseInt(player.RP) + 1;

            console.log(`[经验辅助] 升级! Lv.${currentLevel} | SP: ${oldSP}→${player.SP}(+${spPerLevel}) | RP: ${oldRP}→${player.RP}(+1)`);

            requiredExp = calculateDiabloThreshold(currentLevel + 1);
            player.升级阈值 = requiredExp;
        }

        upgradeHiWeaponQuality(player);
    }

    function processBondLevelUp(bond, bondName, statData = null) {
        if (!bond) return;

        let currentLevel = safeParseInt(bond.等级, 1);
        const levelBaseExp = getLevelBaseTotalExp(currentLevel);
        const parsedExp = parseFloat(bond.当前总经验);
        if (bond.当前总经验 === undefined || bond.当前总经验 === null || isNaN(parsedExp)) {
            bond.当前总经验 = levelBaseExp;
        } else if (parsedExp < levelBaseExp) {
            bond.当前总经验 = levelBaseExp;
        }

        let currentExp = safeParseFloat(bond.当前总经验, levelBaseExp);
        let requiredExp = safeParseFloat(bond.升级阈值, 0);

        if (requiredExp <= 0) {
            requiredExp = calculateDiabloThreshold(currentLevel + 1);
            bond.升级阈值 = requiredExp;
        }

        let levelUps = 0;
        while (currentExp >= requiredExp && requiredExp > 0) {
            currentLevel++;
            levelUps++;
            bond.等级 = currentLevel;
            requiredExp = calculateDiabloThreshold(currentLevel + 1);
            bond.升级阈值 = requiredExp;
        }

        if (levelUps > 0) {
            console.log(`[羁绊升级] ${bondName} 升级 ${levelUps} 次，当前 Lv.${currentLevel}，下次阈值=${requiredExp}`);
        }

        const needRecalcBondHp = levelUps > 0 ||
            bond.生命值上限 === undefined || bond.生命值上限 === null ||
            safeParseInt(bond.生命值上限, 0) <= 0 ||
            bond.当前生命值 === undefined || bond.当前生命值 === null;
        if (needRecalcBondHp) {
            calculateBondMaxHP(bond, bondName, { initMissingCurrentHp: true, rootData: statData });
        }
    }

    function shareExpToEligibleBonds(statData, gainedExp, player) {
        if (!statData || gainedExp <= 0) return;

        const bonds = statData.羁绊列表;
        if (!bonds || typeof bonds !== 'object') return;

        const playerLevel = safeParseInt(player?.等级, 1);
        const playerName = player?.名称 || '';
        const nonNearbyShareLevelCap = 60;
        const nonNearbyShareExpCap = calculateDiabloThreshold(nonNearbyShareLevelCap + 1) - 1;

        Object.entries(bonds).forEach(([name, bond]) => {
            if (!bond || typeof bond !== 'object') return;
            if (name === playerName) return;
            if (!isBondShareExpEnabled(bond)) return;

            const bondLevel = safeParseInt(bond.等级, 1);
            if (bondLevel >= playerLevel) return;
            if (bond.附近 !== true && bondLevel > nonNearbyShareLevelCap) return;

            const oldExp = safeParseFloat(bond.当前总经验, 0);
            const uncappedExp = oldExp + gainedExp;
            const newExp = bond.附近 === true
                ? uncappedExp
                : Math.min(uncappedExp, nonNearbyShareExpCap);
            if (newExp <= oldExp) return;
            const actualGainedExp = newExp - oldExp;
            bond.当前总经验 = newExp;

            console.log(`[经验分发] ${name} 获得经验 +${actualGainedExp} (${oldExp} → ${newExp})`);
            processBondLevelUp(bond, name, statData);
        });
    }

    function upgradeHiWeaponQuality(player) {
        if (!player.装备列表) return;
        const weapon = Object.values(player.装备列表).find(w => w && ((w.名称 || '').trim() === '绯'));
        if (!weapon) return;

        const lv = safeParseInt(player.等级, 1);
        const oldWeaponLevel = safeParseInt(weapon.等级, 1);
        if (oldWeaponLevel !== lv) {
            weapon.等级 = lv;
            console.log(`[绯·等级同步] ${oldWeaponLevel} → ${lv}`);
        }

        // 绯品质成长梯度：
        // Lv1-4 普通，Lv5+ 精良，Lv10+ 稀有，Lv20+ 卓越，Lv30+ 传说，Lv45+ 史诗，Lv70+ 神话
        let qualityIndex = 0;
        if (lv >= 70) qualityIndex = 6;
        else if (lv >= 45) qualityIndex = 5;
        else if (lv >= 30) qualityIndex = 4;
        else if (lv >= 20) qualityIndex = 3;
        else if (lv >= 10) qualityIndex = 2;
        else if (lv >= 5) qualityIndex = 1;

        const qualityTiers = ['普通','精良','稀有','卓越','传说','史诗','神话'];
        const newQuality = qualityTiers[qualityIndex];

        const hiEffects = [
            '[神器共鸣] 绯拥有自我意识，无法被他人拾取、窃取或强制解除装备。绯被击落时自动回到夜斗手中（附赠动作）。',
            '[流体变形] 刀身化为高压流体自由伸缩，普通攻击无视掩体与盾牌提供的AC加成。攻击距离+5尺。',
            '[不愈之伤] 绯造成的伤口无法被常规治疗手段（药水、低阶治疗术）愈合，必须通过DC15医疗检定或高阶治疗才能止血。命中时附加[裂伤]状态（每回合流血伤害=夜斗等级）。',
            '[面妖召唤] 1次/日（附赠动作）：召唤2只面妖狼协助战斗，持续5回合。面妖狼攻击附带[诅咒]效果（目标全属性-1，可叠加）。面妖狼死亡时爆炸，造成小范围暗属性伤害。',
            '[水神之刃] 绯的所有攻击附带水属性伤害（额外伤害=等级×0.5）。处于[积水]或[潮湿]地形时，额外伤害翻倍。绯可主动制造5尺范围[积水]地形（附赠动作，1次/短休）。',
            '[绯·真名解放] 1次/日（动作）：绯化为完全流体形态，持续3回合。期间攻击变为15尺锥形范围，伤害骰翻倍，且每次命中使目标[潮湿]。解放结束后夜斗获得1层[疲惫]。',
            '[绯色终焉] 绯的攻击附带[侵蚀]效果：每次命中永久降低目标1点AC（单目标上限5层）。被绯击杀的目标无法以任何手段复活。'
        ];

        const hiAttrByQuality = [
            { 敏捷: 0 },
            { 敏捷: 1 },
            { 敏捷: 1, 力量: 1 },
            { 敏捷: 2, 力量: 1 },
            { 敏捷: 3, 力量: 1 },
            { 敏捷: 4, 力量: 2 },
            { 敏捷: 5, 力量: 3 }
        ];

        if (weapon.品质 !== newQuality) {
            const oldQuality = weapon.品质;
            weapon.品质 = newQuality;
            weapon.品级 = 10;
            weapon.效果 = hiEffects.slice(0, qualityIndex + 1).join(';');
            weapon.属性加成 = hiAttrByQuality[qualityIndex];
            console.log(`[绯·成长] ${oldQuality} → ${newQuality} (Lv.${lv})`);
        }
    }

    // ==========================================
    // 熟练度自动进阶 & AI回滚
    // ==========================================

    const PROF_TIERS = ['学徒', '熟手', '专家', '大师', '传奇'];
    const PROF_THRESHOLDS = { '学徒': 25, '熟手': 50, '专家': 100, '大师': 200, '传奇': Infinity };
    const PROF_TIER_BONUS = { '学徒': 0, '熟手': 1, '专家': 2, '大师': 4, '传奇': 6 };
    const PROF_TIER_START_TOTALS = PROF_TIERS.reduce((acc, tier, index) => {
        if (index === 0) {
            acc[tier] = 0;
            return acc;
        }
        const prevTier = PROF_TIERS[index - 1];
        const prevStart = acc[prevTier] || 0;
        const prevThreshold = PROF_THRESHOLDS[prevTier];
        acc[tier] = prevStart + (prevThreshold === Infinity ? 0 : safeParseInt(prevThreshold, 0));
        return acc;
    }, {});

    function getProfEffect(key, tier) {
        const bonus = PROF_TIER_BONUS[tier] ?? 0;
        return `${key}相关检定+${bonus}`;
    }

    function getProfTierThreshold(tier) {
        const threshold = PROF_THRESHOLDS[tier];
        return threshold === Infinity ? 0 : safeParseInt(threshold, 0);
    }

    function getProfTierStartTotal(tier) {
        return PROF_TIER_START_TOTALS[tier] || 0;
    }

    function getProfTotalProgress(entry) {
        const tier = PROF_TIERS.includes(entry?.阶位) ? entry.阶位 : '学徒';
        const progress = Math.max(0, safeParseInt(entry?.进度, 0));
        return getProfTierStartTotal(tier) + progress;
    }

    function normalizeProfState(key, totalProgress) {
        let remain = Math.max(0, safeParseInt(totalProgress, 0));

        for (let i = 0; i < PROF_TIERS.length - 1; i++) {
            const tier = PROF_TIERS[i];
            const threshold = getProfTierThreshold(tier);
            if (remain < threshold) {
                return {
                    tier,
                    progress: remain,
                    threshold,
                    effect: getProfEffect(key, tier),
                    totalProgress
                };
            }
            remain -= threshold;
        }

        const finalTier = PROF_TIERS[PROF_TIERS.length - 1];
        return {
            tier: finalTier,
            progress: 0,
            threshold: 0,
            effect: getProfEffect(key, finalTier),
            totalProgress: getProfTierStartTotal(finalTier)
        };
    }

    function processProficiencyBlock(block, blockBefore, label) {
        if (!block || typeof block !== 'object') return;
        Object.entries(block).forEach(([key, entry]) => {
            if (!entry || typeof entry !== 'object') return;
            const oldEntry = blockBefore?.[key];
            const oldState = oldEntry ? normalizeProfState(key, getProfTotalProgress(oldEntry)) : null;
            const originalTier = entry.阶位 || '学徒';
            const originalProgress = Math.max(0, safeParseInt(entry.进度, 0));
            const originalThreshold = safeParseInt(entry.升阶阈值, 0);
            const originalEffect = String(entry.效果 || '');

            let resolvedTotal = getProfTotalProgress(entry);
            if (oldState && resolvedTotal < oldState.totalProgress) {
                console.warn(`[熟练度守卫] ⚠️ ${label}/${key} 总进度倒退 ${resolvedTotal}→${oldState.totalProgress}，已按旧进度修正`);
                resolvedTotal = oldState.totalProgress;
            }

            const normalized = normalizeProfState(key, resolvedTotal);
            const changes = [];

            if (originalTier !== normalized.tier) {
                changes.push(`阶位 ${originalTier}→${normalized.tier}`);
            }
            if (originalProgress !== normalized.progress) {
                changes.push(`进度 ${originalProgress}→${normalized.progress}`);
            }
            if (originalThreshold !== normalized.threshold) {
                changes.push(`升阶阈值 ${originalThreshold}→${normalized.threshold}`);
            }
            if (originalEffect !== normalized.effect) {
                changes.push(`效果 "${originalEffect}"→"${normalized.effect}"`);
            }

            entry.阶位 = normalized.tier;
            entry.进度 = normalized.progress;
            entry.升阶阈值 = normalized.threshold;
            entry.效果 = normalized.effect;

            if (!oldEntry) {
                console.log(`[熟练度注册] ${label}/${key}: 阶位=${normalized.tier}, 阈值=${normalized.threshold}, 进度=${normalized.progress}, 效果="${normalized.effect}"`);
                return;
            }

            if (oldState && normalized.tier !== oldState.tier) {
                console.log(`[熟练度进阶] ${label}/${key}: ${oldState.tier} → ${normalized.tier}, 当前进度=${normalized.progress}, 效果="${normalized.effect}"`);
            }

            if (changes.length > 0) {
                console.warn(`[熟练度守卫] ⚠️ ${label}/${key} 数据已校正：${changes.join('，')}`);
            }
        });
    }

    function handleProficiency(statData, statDataBefore) {
        const prof = statData?.人物?.熟练度;
        const profBefore = statDataBefore?.人物?.熟练度;
        if (!prof) return;
        processProficiencyBlock(prof.战斗, profBefore?.战斗, '战斗');
        processProficiencyBlock(prof.生活, profBefore?.生活, '生活');
    }

    // ==========================================
    // 末日时钟（仅"大明志异"世界观）
    // 模型：每日涨幅 第1/2/3年 = 1/2/4，再 ×(存活六生五世/5)；
    //       AI每push一条已镇功业 → 伪随机扣 1~3 点；满1000=完整体提前降临，
    //       熬过三年(1095天)未满1000=不完整体降临。
    // 所有数值由本脚本计算，AI只负责 push已镇功业 与 翻缴清布尔。
    // ==========================================
    const DOOM_RAMP = [1, 2, 4];        // 第1/2/3年 每日基础涨幅
    const DOOM_YEAR_DAYS = 365;
    const DOOM_DEADLINE_DAYS = 1095;    // 三年期限
    const DOOM_MAX = 1000;
    const DOOM_HISTORY_CAP = 10;        // 已镇功业最多保留条数
    const DOOM_KILL_FLAT = 150;         // 每缴清一世，额外直接扣减点数（并降低后续涨速）
    const LIUSHENG_NAMES = ['岁远', '荒', '卓照', '潘南君', '百里渊'];

    function doomDayRate(dayIndex) {
        if (dayIndex <= DOOM_YEAR_DAYS) return DOOM_RAMP[0];
        if (dayIndex <= DOOM_YEAR_DAYS * 2) return DOOM_RAMP[1];
        return DOOM_RAMP[2];
    }

    function handleDoomClock(statData, statDataBefore) {
        if (getCurrentWorldView(statData) !== '大明志异') return;
        let clock = statData.末日时钟;
        if (!clock || typeof clock !== 'object') {
            clock = {};
            statData.末日时钟 = clock; // 脚本自建结构，不依赖初始化文件
        }

        clock.功业次数 = safeParseInt(clock.功业次数, 0);

        // 起始年历缺失/不可解析时，以当前年历初始化
        const worldCalendar = statData?.世界信息?.年历;
        if (!clock.起始年历 || !parseCalendarDate(clock.起始年历)) {
            if (parseCalendarDate(worldCalendar)) clock.起始年历 = worldCalendar;
        }
        const startParsed = parseCalendarDate(clock.起始年历);
        const nowParsed = parseCalendarDate(worldCalendar);
        if (!startParsed || !nowParsed) {
            console.warn(`[末日时钟] 年历无法解析(起始=${clock.起始年历}, 当前=${worldCalendar})，跳过`);
            return;
        }
        let elapsedDays = getCalendarDayDiff(nowParsed.date, startParsed.date);
        if (elapsedDays < 0) elapsedDays = 0;

        // 1) 缴清：补齐五世布尔；首次发现某世=true时锚定击杀天数（用于按时间降低后续涨速）
        if (!clock.缴清 || typeof clock.缴清 !== 'object') clock.缴清 = {};
        if (!clock.缴清日 || typeof clock.缴清日 !== 'object') clock.缴清日 = {};
        LIUSHENG_NAMES.forEach(name => {
            if (typeof clock.缴清[name] !== 'boolean') clock.缴清[name] = false;
            if (clock.缴清[name] === true && typeof clock.缴清日[name] !== 'number') {
                clock.缴清日[name] = elapsedDays;
                console.log(`[末日时钟] 缴清「${name}」@第${elapsedDays}天，后续涨速下降一档`);
            } else if (clock.缴清[name] !== true && typeof clock.缴清日[name] === 'number') {
                delete clock.缴清日[name]; // 理论不可回退，被改回则清锚
            }
        });

        // 2) 已镇功业：检测AI新push条数，累加功业次数，再裁剪到最近10条
        if (!Array.isArray(clock.已镇功业)) clock.已镇功业 = [];
        const prevArr = Array.isArray(statDataBefore?.末日时钟?.已镇功业)
            ? statDataBefore.末日时钟.已镇功业 : [];
        let newCount = clock.已镇功业.length - prevArr.length;
        if (newCount < 0) newCount = 0;
        if (newCount > 5) newCount = 5; // 防一回合异常狂刷
        if (newCount > 0) {
            clock.功业次数 += newCount;
        }
        if (clock.已镇功业.length > DOOM_HISTORY_CAP) {
            clock.已镇功业 = clock.已镇功业.slice(clock.已镇功业.length - DOOM_HISTORY_CAP);
        }

        // 3) 功业伪随机扣减：以功业次数为序号种子，每件 1~3 点，可重算且只增
        let gongyeReduce = 0;
        const seedBase = String(clock.起始年历 || '末日时钟');
        const gongyeCount = safeParseInt(clock.功业次数, 0);
        for (let i = 1; i <= gongyeCount; i++) {
            gongyeReduce += 1 + (stableHash(seedBase + ':功业:' + i) % 3);
        }

        // 4) 累计涨幅：逐日积分；某世被缴清后，其后每天涨速 ×(存活/5)
        const killDays = LIUSHENG_NAMES
            .map(n => clock.缴清日?.[n])
            .filter(v => typeof v === 'number');
        let rise = 0;
        for (let d = 1; d <= elapsedDays; d++) {
            const killedByDay = killDays.filter(kd => kd < d).length;
            const factor = (5 - killedByDay) / 5;
            rise += doomDayRate(d) * factor;
        }

        // 5) 当前点数 = 涨幅 - 功业扣减 - 缴清直接扣减，clamp[0,1000]（不能为负）
        const killFlatReduce = killDays.length * DOOM_KILL_FLAT;
        const points = clamp(Math.round(rise - gongyeReduce - killFlatReduce), 0, DOOM_MAX);
        clock.当前点数 = points;
        clock.存活世数 = 5 - killDays.length;

        // 6) 状态判定
        if (points >= DOOM_MAX) {
            clock.状态 = '完整体降临';
        } else if (elapsedDays >= DOOM_DEADLINE_DAYS) {
            clock.状态 = '不完整体降临';
        } else {
            clock.状态 = '酝酿中';
        }
    }

    // ==========================================
    // 事件注册
    // ==========================================

    const init = async () => {
        await waitGlobalInitialized('Mvu');
        eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, handleExperienceProcessing);
        try { (window.parent || window).__辅助计算脚本_loaded__ = true; } catch(e) { window.__辅助计算脚本_loaded__ = true; }
        console.log('[辅助计算脚本] 脚本已加载 ');
        toastr.success('[辅助计算脚本] 脚本已加载 ');
    };

    $(init);

})();
