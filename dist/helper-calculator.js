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

    function getLevelBaseTotalExp(level) {
        const lv = Math.max(1, safeParseInt(level, 1));
        return calculateDiabloThreshold(lv);
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
        '神器': { total: 2, single: 1 },
        '传说': { total: 2, single: 2 },
        '史诗': { total: 3, single: 2 },
        '神话': { total: 4, single: 3 }
    };

    function normalizeCoreAttrKey(rawKey) {
        if (typeof rawKey !== 'string') return '';
        const key = rawKey.trim();
        return CORE_ATTR_ALIAS[key] || key;
    }

    function sanitizeNewEquipCoreAttrBonuses(equipKey, equipVal) {
        if (!equipVal || typeof equipVal !== 'object') return;
        const bonuses = equipVal.属性加成;
        if (!bonuses || typeof bonuses !== 'object' || Array.isArray(bonuses)) return;

        const quality = (typeof equipVal.品质 === 'string' && equipVal.品质.trim()) ? equipVal.品质.trim() : '普通';
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

        const sanitizedBonuses = {};
        otherEntries.forEach(([k, v]) => { sanitizedBonuses[k] = v; });
        mergedByKey.forEach(({ key, value }) => {
            if (value > 0) sanitizedBonuses[key] = value;
        });

        if (!hasChanged(bonuses, sanitizedBonuses)) return;

        equipVal.属性加成 = sanitizedBonuses;

        const coreTotal = mergedByKey.reduce((sum, x) => sum + x.value, 0);
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
        console.warn(`[变量守卫] ⚠️ 新增装备 "${equipKey}" 六维属性已修复: 品质=${quality}, 六维点数上限=${totalLimit}, 单一六维上限=${singleLimit}, 修复后总和=${coreTotal}`);
    }

    // ==========================================
    // AC 计算
    // ==========================================

    const qualityToAC = {
        '普通': 1, '精良': 2, '稀有': 3, '神器': 4,
        '传说': 5, '史诗': 6, '神话': 7
    };

    const qualityToDamageDice = {
        '普通': '1d6', '精良': '1d8', '稀有': '2d8', '神器': '3d10',
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

    function downgradeDice(dice, levels = 2) {
        let result = dice;
        for (let i = 0; i < levels; i++) {
            result = diceDowngradeMap[result] || result;
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

    function titanGripMergeDice(mainDice, offhandDice) {
        const mainExp = diceExpectation[mainDice] || 3.5;
        const downgradedOffhand = downgradeDice(offhandDice, 2);
        const offExp = diceExpectation[downgradedOffhand] || 2.5;
        const totalExp = mainExp + offExp;
        const mergedDice = findClosestDice(totalExp);
        console.log(`[泰坦之握] 主${mainDice}(${mainExp}) + 副${offhandDice}→${downgradedOffhand}(${offExp}) = ${totalExp} ≈ ${mergedDice}`);
        return mergedDice;
    }

    const qualityMultiplier = {
        '普通': 1.0, '精良': 1.5, '稀有': 2.0, '神器': 2.5,
        '传说': 3.5, '史诗': 4.0, '神话': 5.0
    };

    const armorSlotCoef = { '上衣': 1.5, '下装': 1.3, '护肩': 1.1, '鞋子': 1.1, '腰带': 1.0 };
    const accessorySlotCoef = { '项链': 4.0, '手镯': 3.0, '戒指': 3.0 };
    const DAMAGE_REDUCTION_CAP = 75;
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
            if (!item || !item.名称 || item.装备箱) return;
            if (item.类型 !== '防具') return;
            const bonus = qualityToAC[item.品质] || 0;
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
    function calculateMaxHP(player) {
        if (!player.属性) return;

        const 等级 = safeParseInt(player.等级, 1);
        const 体质 = safeParseInt(player.属性.体质, 10);
        const 种族 = player.种族 || '';

        let equipConBonus = 0;
        let equipHpBonus = 0;
        const 装备列表 = player.装备列表 || {};
        Object.values(装备列表).forEach(item => {
            if (!item || !item.名称 || item.装备箱) return;
            const bonuses = item.属性加成 || {};
            equipConBonus += safeParseInt(bonuses['体质'], 0);
            equipHpBonus += safeParseInt(bonuses['生命值上限'], 0);
        });

        const total体质 = 体质 + equipConBonus;
        let newMaxHP;
        if (种族 === '巨人种') {
            newMaxHP = 等级 * total体质 * 3 + equipHpBonus;
        } else {
            newMaxHP = 等级 * total体质 * 2 + equipHpBonus;
        }
        newMaxHP = Math.max(newMaxHP, 1);

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

    function calculateWeaponStats(weapon) {
        if (!weapon || !weapon.名称) return false;
        ensureGrade(weapon);

        const 品质 = weapon.品质 || '普通';
        const 等级 = safeParseInt(weapon.等级, 1);
        const 品级 = safeParseInt(weapon.品级, 0);
        const 强化等级 = safeParseInt(weapon.强化等级, 0);

        const newDamageDice = qualityToDamageDice[品质] || '1d6';
        const newLevelCoef = Math.floor(等级 / 10) + 1;
        const gradeMultiplier = 1 + (品级 / 100);
        const enhanceMultiplier = 1 + (强化等级 * 0.1);
        const newFixedDmg = Math.max(1, Math.floor(等级 * enhanceMultiplier * gradeMultiplier));

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

    // 与状态栏侧一致：力量/敏捷/智力/感知/魅力随装备变化写回；体质不写回（避免HP公式重复叠加）
    function syncCoreAttrsOnEquipChange(player, playerBefore) {
        if (!player?.属性 || !playerBefore?.属性) return;
        const prevBonuses = collectEquippedCoreAttrBonuses(playerBefore.装备列表 || {});
        const newBonuses = collectEquippedCoreAttrBonuses(player.装备列表 || {});
        const syncAttrs = ['力量', '敏捷', '智力', '感知', '魅力'];
        syncAttrs.forEach(attrName => {
            const beforeVal = safeParseInt(playerBefore.属性?.[attrName], 10);
            const prevBonus = safeParseInt(prevBonuses[attrName], 0);
            const newBonus = safeParseInt(newBonuses[attrName], 0);
            const baseVal = beforeVal - prevBonus;
            const nextVal = baseVal + newBonus;
            const currentVal = safeParseInt(player.属性?.[attrName], 10);
            if (currentVal !== nextVal) {
                player.属性[attrName] = nextVal;
                console.log(`[属性同步] ${attrName}: ${currentVal} → ${nextVal} (装备加成 ${prevBonus} → ${newBonus})`);
            }
        });
    }

    function buildWeaponAttrSnapshot(player) {
        const raw = player?.属性 || {};
        const equippedBonuses = collectEquippedCoreAttrBonuses(player?.装备列表 || {});
        const snapshot = {};
        CORE_ATTR_KEYS.forEach(attrName => {
            snapshot[attrName] = safeParseInt(raw[attrName], 10);
        });
        // 体质在人物.属性中保持基值，这里叠加穿戴装备体质用于武器属性调整值计算
        snapshot.体质 += safeParseInt(equippedBonuses['体质'], 0);
        return snapshot;
    }

    function calcAttrFixedDmg(属性, 人物等级) {
        let maxVal = 0;
        CORE_ATTR_KEYS.forEach(attrName => {
            const v = safeParseInt(属性?.[attrName], 10);
            if (v > maxVal) maxVal = v;
        });
        const capped = Math.min(maxVal, 40);
        const modifier = capped > 10 ? Math.floor((capped - 10) / 2) : 0;
        const levelCoef = Math.floor(safeParseInt(人物等级, 1) / 10) + 1;
        return modifier * levelCoef;
    }

    function buildUnarmedWeaponPanel(player) {
        const level = safeParseInt(player?.等级, 1);
        const levelCoef = Math.floor(level / 10) + 1;
        const baseFixed = Math.max(1, level);
        const attrSnapshot = buildWeaponAttrSnapshot(player);
        const attrFixedDmg = calcAttrFixedDmg(attrSnapshot, level);
        return {
            伤害骰: '1d4',
            等级系数: levelCoef,
            固定伤害: baseFixed + attrFixedDmg
        };
    }

    function getArmorDefenseValue(armor, slotName) {
        if (!armor || !armor.名称) return 0;
        const 品质 = armor.品质 || '普通';
        const 等级 = safeParseInt(armor.等级, 1);
        const 品级 = safeParseInt(armor.品级, 0);
        const slotCoef = armorSlotCoef[slotName] || 1.0;
        const qualityMult = qualityMultiplier[品质] || 1.0;
        const gradeMultiplier = 1 + (品级 / 100);
        return Math.floor(等级 * slotCoef * qualityMult * gradeMultiplier);
    }

    function getAccessoryDefenseValue(accessory, slotName) {
        if (!accessory || !accessory.名称) return 0;
        const 品质 = accessory.品质 || '普通';
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
    function calculateAllEquipmentStats(variables) {
        const player = variables.人物;
        if (!player) { console.log('[装备计算调试] player不存在，跳过'); return; }
        const 装备列表 = player.装备列表;
        console.log(`[装备计算调试] 装备列表=${装备列表}, 类型=${typeof 装备列表}, keys=${装备列表 ? Object.keys(装备列表) : 'N/A'}`);
        if (!装备列表) { console.log('[装备计算调试] 装备列表不存在，跳过'); return; }

        let mainWeapon = null;
        let offWeapon = null;

        Object.entries(装备列表).forEach(([key, item]) => {
            if (!item || !item.名称) return;

            if (item.类型 === '武器') {
                calculateWeaponStats(item);
                if (!item.装备箱 && item.部位 === '主手') mainWeapon = item;
                if (!item.装备箱 && item.部位 === '副手') offWeapon = item;
            } else if (item.类型 === '防具') {
                calculateArmorStats(item, item.部位);
            } else if (item.类型 === '首饰') {
                calculateAccessoryStats(item, item.部位);
            }
        });

        // 泰坦之握：巨人种双持时合并伤害骰
        if (mainWeapon && offWeapon && player.种族 === '巨人种') {
            const mainDice = qualityToDamageDice[mainWeapon.品质] || '1d6';
            const offDice = qualityToDamageDice[offWeapon.品质] || '1d6';
            const mergedDice = titanGripMergeDice(mainDice, offDice);

            if (mainWeapon.伤害骰 !== mergedDice) {
                mainWeapon.伤害骰 = mergedDice;
                console.log(`[泰坦之握] 主武器伤害骰更新为: ${mergedDice}`);
            }

            const mainFixedDmg = safeParseInt(mainWeapon.固定伤害, 0);
            const offFixedDmg = safeParseInt(offWeapon.固定伤害, 0);
            const mergedFixedDmg = mainFixedDmg + Math.floor(offFixedDmg / 2);
            if (mainWeapon.固定伤害 !== mergedFixedDmg) {
                mainWeapon.固定伤害 = mergedFixedDmg;
                console.log(`[泰坦之握] 主武器固定伤害更新为: ${mergedFixedDmg}`);
            }
        }

        // 生成武器面板
        if (mainWeapon) {
            const attrSnapshot = buildWeaponAttrSnapshot(player);
            const attrFixedDmg = calcAttrFixedDmg(attrSnapshot, player.等级);
            const panelFixedDmg = safeParseInt(mainWeapon.固定伤害, 0) + attrFixedDmg;
            const newPanel = {
                伤害骰: mainWeapon.伤害骰 || '',
                等级系数: mainWeapon.等级系数 || 1,
                固定伤害: panelFixedDmg
            };
            if (!player.战斗属性) player.战斗属性 = {};
            if (!_.isEqual(player.战斗属性.武器面板, newPanel)) {
                player.战斗属性.武器面板 = newPanel;
                console.log(`[武器面板] 已更新: ${newPanel.等级系数}×${newPanel.伤害骰}+${newPanel.固定伤害} (武器固伤${safeParseInt(mainWeapon.固定伤害, 0)} + 属性固伤${attrFixedDmg})`);
            }
        } else {
            if (!player.战斗属性) player.战斗属性 = {};
            const unarmedPanel = buildUnarmedWeaponPanel(player);
            if (!_.isEqual(player.战斗属性.武器面板, unarmedPanel)) {
                player.战斗属性.武器面板 = unarmedPanel;
                console.log(`[武器面板] 无主手武器，已写入空武器面板: ${unarmedPanel.等级系数}×${unarmedPanel.伤害骰}+${unarmedPanel.固定伤害}`);
            }
        }
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
    const TIER_CONFIG = {
        基础: { 冷却: 0, 伤害: { 基础: 150, 成长: 15 } },
        转职: { 冷却: 0, 伤害: { 基础: 210, 成长: 35 } },
        进阶: { 冷却: 1, 伤害: { 基础: 420, 成长: 70 } },
        必杀: { 冷却: 2, 伤害: { 基础: 980, 成长: 90 } },
        奥义: { 冷却: 3, 伤害: { 基础: 1680, 成长: 140 } },
        觉醒一: { 冷却: 3, 伤害: { 基础: 3150, 成长: 350 } },
        觉醒二: { 冷却: 4, 伤害: { 基础: 4200, 成长: 700 } },
        觉醒三: { 冷却: 5, 伤害: { 基础: 5600, 成长: 0 } }
    };
    const DAMAGE_VERSION = 4;
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

    function getSummonDamageRatioByTier(tierName = '') {
        return SUMMON_DAMAGE_RATIO_BY_TIER[tierName] ?? 0.5;
    }

    function getSkillBaseDamage(skill) {
        const tier = TIER_CONFIG[skill?.阶位];
        if (!tier) return 0;
        if (skill?.类型 === '特殊' || skill?.类型 === '职业特殊') return 0;
        const level = safeParseInt(skill?.当前等级, 0);
        if (level <= 0) return 0;

        const activeBase = tier.伤害.基础 + tier.伤害.成长 * (level - 1);
        if (skill?.类型 !== '召唤') {
            return activeBase;
        }

        const ratio = getSummonDamageRatioByTier(skill?.阶位);
        return Math.round(activeBase * ratio);
    }

    function getLegacySummonBaseDamage(skill) {
        if (skill?.类型 !== '召唤') {
            return getSkillBaseDamage(skill);
        }
        const legacy = LEGACY_SUMMON_CONFIG[skill?.阶位];
        const level = safeParseInt(skill?.当前等级, 0);
        if (!legacy || level <= 0) return 0;
        return legacy.基础 + legacy.成长 * (level - 1);
    }

    function getSummonBaseDamageByVersion(skill, damageVersion = 0) {
        if (skill?.类型 !== '召唤') {
            return getSkillBaseDamage(skill);
        }

        const parsedVersion = Number(damageVersion || 0);
        if (parsedVersion >= 2) {
            const tier = TIER_CONFIG[skill?.阶位];
            if (!tier) return 0;
            const level = safeParseInt(skill?.当前等级, 0);
            if (level <= 0) return 0;
            const activeBase = tier.伤害.基础 + tier.伤害.成长 * (level - 1);
            const ratio = getLegacySummonDamageRatioByCooldown(tier.冷却 || 0);
            return Math.round(activeBase * ratio);
        }

        return getLegacySummonBaseDamage(skill);
    }

    function calcSkillDamage(skill) {
        const base = getSkillBaseDamage(skill);
        if (base <= 0) return 0;
        const floatRatio = 1 - Math.random() * 0.10;
        return Math.round(base * floatRatio / 10) * 10;
    }

    function getSkillBaseDamageByVersion(skill, level, damageVersion = DAMAGE_VERSION) {
        const normalizedLevel = Math.max(1, safeParseInt(level, 1));
        if (skill?.类型 === '召唤') {
            return getSummonBaseDamageByVersion({ ...skill, 当前等级: normalizedLevel }, damageVersion);
        }
        return getSkillBaseDamage({ ...skill, 当前等级: normalizedLevel });
    }

    function calcFixedSkillDamageStep(skill, currentDmg, currentLevel, damageVersion = DAMAGE_VERSION) {
        if (!skill || skill.类型 === '特殊' || skill.类型 === '职业特殊') return 0;

        const normalizedLevel = Math.max(1, safeParseInt(currentLevel, 1));
        const currentBase = getSkillBaseDamageByVersion(skill, normalizedLevel, damageVersion);
        const nextBase = getSkillBaseDamageByVersion(skill, normalizedLevel + 1, damageVersion);
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

    function resolveComboSlotDamageState(skill, existingSlot, level) {
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
        const previousVersion = safeParseInt(existingSlot?.伤害倍率版本, DAMAGE_VERSION);

        if (previousDamage > 0) {
            const needsMigration = previousVersion !== DAMAGE_VERSION
                || !Number.isFinite(Number(existingSlot?.伤害成长值));
            let damageStep = Number(existingSlot?.伤害成长值);
            if (!Number.isFinite(damageStep) || damageStep < 0 || needsMigration) {
                damageStep = calcFixedSkillDamageStep(
                    skill,
                    previousDamage,
                    previousLevel,
                    previousVersion || DAMAGE_VERSION
                );
            }
            const levelDiff = normalizedLevel - previousLevel;
            return {
                伤害倍率: levelDiff === 0 ? previousDamage : Math.max(0, previousDamage + damageStep * levelDiff),
                伤害成长值: damageStep,
                伤害倍率版本: DAMAGE_VERSION
            };
        }

        const initialDamage = calcSkillDamage({ ...skill, 当前等级: normalizedLevel });
        return {
            伤害倍率: initialDamage,
            伤害成长值: calcFixedSkillDamageStep(skill, initialDamage, normalizedLevel, DAMAGE_VERSION),
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

    function buildComboSlotSkillData(skillName, skill, existingSlot, equipBonuses = {}) {
        const nextSlot = existingSlot ? { ...existingSlot } : {};
        const effectiveLevel = Math.max(1, getEffectiveSkillLevel(skill, equipBonuses) || safeParseInt(nextSlot.技能等级, 1));
        const damageState = resolveComboSlotDamageState(skill, existingSlot, effectiveLevel);
        nextSlot.名称 = skillName;
        nextSlot.类型 = skill?.类型 || nextSlot.类型 || '主动';
        nextSlot.技能等级 = effectiveLevel;
        nextSlot.冷却中 = nextSlot.冷却中 === true || safeParseInt(skill?.冷却计数, 0) > 0;
        nextSlot.伤害倍率 = damageState.伤害倍率;
        nextSlot.阶位 = skill?.阶位 || nextSlot.阶位 || '基础';
        nextSlot.描述 = skill?.描述 || nextSlot.描述 || '';
        nextSlot.特殊效果 = getSpecialEffectObj({ ...skill, 当前等级: effectiveLevel });
        if (skill?.召唤物名称) nextSlot.召唤物名称 = skill.召唤物名称;
        else if (nextSlot.召唤物名称) delete nextSlot.召唤物名称;
        delete nextSlot.伤害成长值;
        delete nextSlot.伤害倍率版本;
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
            nextSlots[skillName] = buildComboSlotSkillData(skillName, treeSkill, currentSlots[skillName], equipBonuses);
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

    // 阶位 → 冷却轮数映射（基础/转职无冷却）
    const tierCooldownMap = {
        '觉醒三': 5, '觉醒二': 4, '觉醒一': 3,
        '奥义': 3, '必杀': 2, '进阶': 1
    };

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
     *   进入冷却时写入 tierCooldownMap[tier]
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
            const tierCD = tierCooldownMap[tier] || 0;
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

            if (item.类型 === '防具') {
                physDefense += getArmorDefenseValue(item, item.部位);
            } else if (item.类型 === '首饰') {
                magDefense += getAccessoryDefenseValue(item, item.部位);
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

        const 等级 = safeParseInt(bond.等级, 1);
        const 体质 = safeParseInt(bond.属性?.体质, 10);
        const 种族 = bond.种族 || '';

        let equipConBonus = 0;
        let equipHpBonus = 0;
        const 装备列表 = bond.装备列表 || {};
        Object.values(装备列表).forEach(item => {
            if (!item || !item.名称 || item.装备箱) return;
            const bonuses = item.属性加成 || {};
            equipConBonus += safeParseInt(bonuses['体质'], 0);
            equipHpBonus += safeParseInt(bonuses['生命值上限'], 0);
        });

        const total体质 = 体质 + equipConBonus;
        let newMaxHP;
        if (种族 === '巨人种') {
            newMaxHP = 等级 * total体质 * 3 + equipHpBonus;
        } else {
            newMaxHP = 等级 * total体质 * 2 + equipHpBonus;
        }
        newMaxHP = Math.max(newMaxHP, 1);

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
                calculateBondMaxHP(bond, name, { initMissingCurrentHp: true });
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

            calculateBondMaxHP(bond, name, { initMissingCurrentHp: true });
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

            // ★ 先回滚受保护字段，再执行后续计算
            guardProtectedFields(statData, statDataBefore);

            // 初始化日志（只打印一次）
            if (!is_initialized_log) {
                console.log('[辅助脚本] MVU 变量连接成功');
                is_initialized_log = true;
            }

            // ---- 变更检测：只处理实际变化的模块 ----

            const playerBefore = statDataBefore?.人物;
            
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

            // 每次变量更新都校正一次绯等级，修复历史脏数据并保证与玩家等级一致
            upgradeHiWeaponQuality(player);

            // 主角获得经验后，给符合条件的羁绊队友同步经验：
            // 60级及以下全羁绊共享，60级以上仍只限附近队友
            if (playerBefore && playerExpDelta > 0) {
                shareExpToEligibleBonds(statData, playerExpDelta, player);
            }

            const equipChanged = !playerBefore || hasChanged(player.装备列表, playerBefore.装备列表);
            if (equipChanged && playerBefore) {
                syncCoreAttrsOnEquipChange(player, playerBefore);
            }

            // 等级/体质/装备变化 → HP上限重算
            if (!playerBefore ||
                player.等级 !== playerBefore.等级 ||
                player.属性?.体质 !== playerBefore.属性?.体质 ||
                equipChanged) {
                calculateMaxHP(player);
            }

            // 装备列表变化 → 装备数值重算
            calculateAllEquipmentStats(statData);

            // 装备/种族变化 → AC重算
            if (!playerBefore ||
                equipChanged ||
                player.种族 !== playerBefore.种族) {
                calculateAC(statData);
            }

            // 装备变化 → 按防御曲线写回百分比减伤（上限75%）
            if (equipChanged) {
                calculateDamageReductions(player, playerBefore);
            }

            // 暴击率变化 → 战斗属性重算
            if (!playerBefore ||
                player.战斗属性?.暴击率 !== playerBefore.战斗属性?.暴击率) {
                calculateCombatStats(player);
            }

            const comboEnteredBattle = handleComboBattleEntry(statData, statDataBefore);
            console.log(`[组合切换] 主循环 comboEnteredBattle=${comboEnteredBattle}`);

            // 按技能系统模式同步槽位（classic恢复手配槽位，combo仅在自动切换时重建6+3主动槽）
            syncSkillSlotsByMode(statData, statDataBefore, { syncComboSlots: comboEnteredBattle });

            // combo模式直接从本次更新的槽位diff提取“本回合用了哪些技能”
            const comboRoundUsedSkills = collectComboRoundUsage(statData, statDataBefore) || [];

            // 技能冷却管理
            handleSkillCooldowns(statData, statDataBefore);

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

    function processBondLevelUp(bond, bondName) {
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
            calculateBondMaxHP(bond, bondName, { initMissingCurrentHp: true });
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
            processBondLevelUp(bond, name);
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
        // Lv1-4 普通，Lv5+ 精良，Lv10+ 稀有，Lv20+ 神器，Lv30+ 传说，Lv45+ 史诗，Lv70+ 神话
        let qualityIndex = 0;
        if (lv >= 70) qualityIndex = 6;
        else if (lv >= 45) qualityIndex = 5;
        else if (lv >= 30) qualityIndex = 4;
        else if (lv >= 20) qualityIndex = 3;
        else if (lv >= 10) qualityIndex = 2;
        else if (lv >= 5) qualityIndex = 1;

        const qualityTiers = ['普通','精良','稀有','神器','传说','史诗','神话'];
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
