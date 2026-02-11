// ------------------------
// Shared Shield/HP Phase System
// ------------------------

function initializeShieldPhaseState(entity, options = {}) {
    if (!entity) return;

    const shieldStages = Math.max(1, options.shieldStages || 2);
    const shieldBaseHp = Math.max(1, options.shieldBaseHp || Math.ceil((entity.maxHP || entity.maxHp || 10) * 0.25));
    const shieldScaling = options.shieldScaling || 1.15;
    const damageWindowMs = Math.max(500, options.damageWindowMs || 3500);
    const intermissionMs = Math.max(0, options.intermissionMs || 1600);
    const restoreShields = options.restoreShields !== false;

    const stageHpTable = [];
    for (let i = 0; i < shieldStages; i++) {
        stageHpTable.push(Math.max(1, Math.round(shieldBaseHp * Math.pow(shieldScaling, i))));
    }

    entity.phaseState = {
        shieldStages,
        stageHpTable,
        shieldScaling,
        restoreShields,
        stagesCleared: 0,
        shieldHp: stageHpTable[0],
        shieldMax: stageHpTable[0],
        shieldActive: true,
        damageWindowMs,
        damageWindowUntil: 0,
        intermissionMs,
        intermissionUntil: 0,
        currentPhase: 0,
        totalPhases: shieldStages,
        label: options.label || 'Phase',
        allShieldsCleared: false,
        windowJustOpened: false,
        windowJustClosed: false
    };
}

function getShieldPhaseState(entity) {
    return entity?.phaseState || null;
}

function getEncounterPhase(entity) {
    const state = getShieldPhaseState(entity);
    if (!state) return 0;
    return state.currentPhase;
}

function isShieldBlocking(entity, now = 0) {
    const state = getShieldPhaseState(entity);
    if (!state) return false;
    if (state.allShieldsCleared) return false;
    if (state.damageWindowUntil > 0 && now <= state.damageWindowUntil) return false;
    if (state.intermissionUntil > 0 && now < state.intermissionUntil) return true;
    return state.shieldActive && state.shieldHp > 0;
}

function canDamagePhaseHp(entity, now = 0) {
    const state = getShieldPhaseState(entity);
    if (!state) return true;
    if (state.allShieldsCleared) return true;
    if (state.intermissionUntil > 0 && now < state.intermissionUntil) return false;
    if (state.damageWindowUntil > 0 && now <= state.damageWindowUntil) return true;
    return false;
}

function isShieldDamageWindowOpen(entity, now = 0) {
    const state = getShieldPhaseState(entity);
    if (!state) return true;
    if (state.allShieldsCleared) return true;
    return state.damageWindowUntil > 0 && now <= state.damageWindowUntil;
}

function startShieldDamageWindow(entity, now = 0) {
    const state = getShieldPhaseState(entity);
    if (!state) return;
    state.damageWindowUntil = now + state.damageWindowMs;
    state.intermissionUntil = 0;
    state.shieldActive = false;
    state.windowJustOpened = true;
}

function closeShieldDamageWindow(entity, now = 0) {
    const state = getShieldPhaseState(entity);
    if (!state) return;
    state.damageWindowUntil = 0;
    state.intermissionUntil = now + state.intermissionMs;
    state.windowJustClosed = true;
}

function restoreShieldAfterIntermission(entity) {
    const state = getShieldPhaseState(entity);
    if (!state || state.allShieldsCleared) return;

    const currentStageIndex = state.stagesCleared;
    if (currentStageIndex >= state.shieldStages) {
        state.allShieldsCleared = true;
        state.shieldActive = false;
        state.shieldHp = 0;
        state.shieldMax = 0;
        return;
    }

    if (state.restoreShields) {
        const stageHp = state.stageHpTable[currentStageIndex] || state.stageHpTable[state.stageHpTable.length - 1];
        state.shieldMax = stageHp;
        state.shieldHp = stageHp;
        state.shieldActive = true;
    }
}

function advanceShieldPhase(entity, now = 0) {
    const state = getShieldPhaseState(entity);
    if (!state) return;

    state.stagesCleared = Math.min(state.shieldStages, (state.stagesCleared || 0) + 1);
    state.currentPhase = Math.min(state.shieldStages - 1, state.stagesCleared);

    if (state.stagesCleared >= state.shieldStages) {
        state.allShieldsCleared = true;
        state.shieldHp = 0;
        state.shieldMax = 0;
        state.shieldActive = false;
        startShieldDamageWindow(entity, now);
        state.damageWindowUntil = now + 999999999;
        return;
    }

    startShieldDamageWindow(entity, now);
}

function applyShieldStageDamage(entity, damage, now = 0) {
    const state = getShieldPhaseState(entity);
    const dmg = Math.max(0, damage || 1);

    if (!state) {
        return {
            blocked: false,
            appliedToShield: false,
            appliedToHp: true,
            shieldBroken: false,
            phaseAdvanced: false,
            damageApplied: dmg
        };
    }

    if (state.allShieldsCleared) {
        return {
            blocked: false,
            appliedToShield: false,
            appliedToHp: true,
            shieldBroken: false,
            phaseAdvanced: false,
            damageApplied: dmg
        };
    }

    if (state.intermissionUntil > 0 && now < state.intermissionUntil) {
        return {
            blocked: true,
            appliedToShield: false,
            appliedToHp: false,
            shieldBroken: false,
            phaseAdvanced: false,
            damageApplied: 0
        };
    }

    if (state.damageWindowUntil > 0 && now <= state.damageWindowUntil) {
        return {
            blocked: false,
            appliedToShield: false,
            appliedToHp: true,
            shieldBroken: false,
            phaseAdvanced: false,
            damageApplied: dmg
        };
    }

    if (state.shieldActive && state.shieldHp > 0) {
        state.shieldHp = Math.max(0, state.shieldHp - dmg);
        if (state.shieldHp <= 0) {
            advanceShieldPhase(entity, now);
            return {
                blocked: false,
                appliedToShield: true,
                appliedToHp: false,
                shieldBroken: true,
                phaseAdvanced: true,
                damageApplied: dmg
            };
        }

        return {
            blocked: false,
            appliedToShield: true,
            appliedToHp: false,
            shieldBroken: false,
            phaseAdvanced: false,
            damageApplied: dmg
        };
    }

    return {
        blocked: false,
        appliedToShield: false,
        appliedToHp: true,
        shieldBroken: false,
        phaseAdvanced: false,
        damageApplied: dmg
    };
}

function tickShieldPhaseState(entity, now = 0) {
    const state = getShieldPhaseState(entity);
    if (!state) return;

    state.windowJustOpened = false;
    state.windowJustClosed = false;

    if (state.allShieldsCleared) return;

    if (state.damageWindowUntil > 0 && now > state.damageWindowUntil) {
        closeShieldDamageWindow(entity, now);
    }

    if (state.intermissionUntil > 0 && now >= state.intermissionUntil) {
        state.intermissionUntil = 0;
        restoreShieldAfterIntermission(entity);
    }
}

function getPhasedInterval(entity, baseInterval, stepDown = 140, minInterval = 280) {
    const phase = getEncounterPhase(entity);
    return Math.max(minInterval, baseInterval - phase * stepDown);
}

function getPhaseHudStatus(entity, now = 0) {
    const state = getShieldPhaseState(entity);
    if (!state) {
        return {
            phaseText: '',
            gateText: '',
            shieldBarPercent: 0,
            windowRemainingMs: 0,
            intermissionRemainingMs: 0,
            isVulnerable: true,
            isBlocked: false,
            gateColor: '#ffffff',
            percent: 0
        };
    }

    const phaseNum = Math.min(state.shieldStages, (state.stagesCleared || 0) + 1);
    const windowRemainingMs = Math.max(0, (state.damageWindowUntil || 0) - now);
    const intermissionRemainingMs = Math.max(0, (state.intermissionUntil || 0) - now);
    const shieldBarPercent = state.shieldMax > 0 ? Math.max(0, state.shieldHp / state.shieldMax) : 0;

    let gateText = '';
    let isVulnerable = false;
    let isBlocked = false;
    let gateColor = '#38bdf8';

    if (state.allShieldsCleared) {
        gateText = 'CORE EXPOSED';
        isVulnerable = true;
        gateColor = '#ff4444';
    } else if (state.intermissionUntil > 0 && now < state.intermissionUntil) {
        gateText = `Shields restoring... ${Math.ceil(intermissionRemainingMs / 1000)}s`;
        isBlocked = true;
        gateColor = '#888888';
    } else if (state.damageWindowUntil > 0 && now <= state.damageWindowUntil) {
        gateText = `DAMAGE WINDOW ${Math.ceil(windowRemainingMs / 1000)}s`;
        isVulnerable = true;
        gateColor = '#ff6b6b';
    } else if (state.shieldActive && state.shieldHp > 0) {
        gateText = `Shield ${Math.ceil(state.shieldHp)}/${Math.ceil(state.shieldMax)}`;
        gateColor = '#38bdf8';
    } else {
        gateText = 'Shield depleted';
        isVulnerable = true;
        gateColor = '#ff6b6b';
    }

    return {
        phaseText: `${state.label} ${phaseNum}/${state.shieldStages}`,
        gateText,
        shieldBarPercent,
        windowRemainingMs,
        intermissionRemainingMs,
        isVulnerable,
        isBlocked,
        gateColor,
        percent: shieldBarPercent
    };
}

const MINI_BOSS_CONFIGS = {
    shield: { hpMultiplier: 3.0, shieldStages: 1, shieldBaseHpRatio: 0.3, damageWindowMs: 2500, intermissionMs: 1000, scaleMultiplier: 1.5, label: 'Mini-Boss', scoreMultiplier: 3 },
    spawner: { hpMultiplier: 3.5, shieldStages: 2, shieldBaseHpRatio: 0.25, damageWindowMs: 2800, intermissionMs: 1200, scaleMultiplier: 1.6, label: 'Mini-Boss', scoreMultiplier: 4 },
    seeker: { hpMultiplier: 2.5, shieldStages: 1, shieldBaseHpRatio: 0.35, damageWindowMs: 2200, intermissionMs: 900, scaleMultiplier: 1.4, label: 'Mini-Boss', scoreMultiplier: 3 },
    bomber: { hpMultiplier: 3.0, shieldStages: 2, shieldBaseHpRatio: 0.28, damageWindowMs: 2600, intermissionMs: 1100, scaleMultiplier: 1.5, label: 'Mini-Boss', scoreMultiplier: 3.5 },
    kamikaze: { hpMultiplier: 2.0, shieldStages: 1, shieldBaseHpRatio: 0.4, damageWindowMs: 2000, intermissionMs: 800, scaleMultiplier: 1.3, label: 'Mini-Boss', scoreMultiplier: 2.5 }
};

function shouldPromoteToMiniBoss(wave, enemyType) {
    if (!MINI_BOSS_CONFIGS[enemyType]) return false;
    if (wave < 3) return false;
    const baseChance = 0.03;
    const waveBonus = Math.min(0.12, (wave - 3) * 0.015);
    return Math.random() < (baseChance + waveBonus);
}

function promoteToMiniBoss(enemy, enemyType) {
    if (!enemy || !enemyType) return false;
    const config = MINI_BOSS_CONFIGS[enemyType];
    if (!config) return false;

    const baseHp = enemy.hp || enemy.maxHP || enemy.maxHp || 5;
    const newHp = Math.round(baseHp * config.hpMultiplier);
    enemy.hp = newHp;
    enemy.maxHP = newHp;
    enemy.maxHp = newHp;

    const currentScale = enemy.scaleX || 1;
    enemy.setScale(currentScale * config.scaleMultiplier);

    initializeShieldPhaseState(enemy, {
        shieldStages: config.shieldStages,
        shieldBaseHp: Math.max(1, Math.ceil(newHp * config.shieldBaseHpRatio)),
        damageWindowMs: config.damageWindowMs,
        intermissionMs: config.intermissionMs,
        label: config.label
    });

    enemy.isMiniBoss = true;
    enemy.miniBossConfig = config;
    enemy.setTint(0xff8800);
    return true;
}

function updateMiniBossShieldPhase(scene, enemy) {
    if (!enemy || !enemy.active || !enemy.isMiniBoss) return;
    tickShieldPhaseState(enemy, scene.time?.now || 0);
}
