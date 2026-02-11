// ------------------------
// Shared Shield/HP Phase System
// ------------------------

function initializeShieldPhaseState(entity, options = {}) {
    if (!entity) return;
    const shieldStages = Math.max(1, options.shieldStages || 2);
    const shieldBaseHp = Math.max(1, options.shieldBaseHp || Math.ceil((entity.maxHP || entity.maxHp || 10) * 0.25));
    const damageWindowMs = Math.max(500, options.damageWindowMs || 3500);
    const intermissionMs = Math.max(0, options.intermissionMs || 1600);

    entity.phaseState = {
        shieldStages,
        stagesCleared: 0,
        shieldHp: shieldBaseHp,
        shieldMax: shieldBaseHp,
        damageWindowMs,
        damageWindowUntil: 0,
        intermissionMs,
        intermissionUntil: 0,
        currentPhase: 0,
        label: options.label || 'Phase'
    };
}

function getShieldPhaseState(entity) {
    return entity?.phaseState || null;
}

function isShieldDamageWindowOpen(entity, now = 0) {
    const state = getShieldPhaseState(entity);
    if (!state) return true;
    return now <= (state.damageWindowUntil || 0);
}

function canDamagePhaseHp(entity, now = 0) {
    const state = getShieldPhaseState(entity);
    if (!state) return true;
    if ((state.stagesCleared || 0) >= state.shieldStages) {
        return now >= (state.intermissionUntil || 0);
    }
    return isShieldDamageWindowOpen(entity, now) && now >= (state.intermissionUntil || 0);
}

function getEncounterPhase(entity) {
    const state = getShieldPhaseState(entity);
    if (!state) return 0;
    return Math.min(state.shieldStages - 1, state.stagesCleared || 0);
}

function getPhasedInterval(entity, baseInterval, stepDown = 140, minInterval = 280) {
    const phase = getEncounterPhase(entity);
    return Math.max(minInterval, baseInterval - phase * stepDown);
}

function startShieldDamageWindow(entity, now = 0) {
    const state = getShieldPhaseState(entity);
    if (!state) return;
    state.damageWindowUntil = now + state.damageWindowMs;
    state.intermissionUntil = now;
}

function closeShieldDamageWindow(entity, now = 0) {
    const state = getShieldPhaseState(entity);
    if (!state) return;
    state.damageWindowUntil = 0;
    state.intermissionUntil = now + state.intermissionMs;
}

function advanceShieldPhase(entity, now = 0) {
    const state = getShieldPhaseState(entity);
    if (!state) return;

    state.stagesCleared = Math.min(state.shieldStages, state.stagesCleared + 1);
    state.currentPhase = Math.min(state.shieldStages - 1, state.stagesCleared);

    if (state.stagesCleared >= state.shieldStages) {
        state.shieldHp = 0;
        state.shieldMax = 0;
        startShieldDamageWindow(entity, now);
        return;
    }

    const nextShieldMax = Math.max(1, Math.round(state.shieldMax * 1.15));
    state.shieldMax = nextShieldMax;
    state.shieldHp = nextShieldMax;
    startShieldDamageWindow(entity, now);
}

function applyShieldStageDamage(entity, damage, now = 0) {
    const state = getShieldPhaseState(entity);
    if (!state) {
        return { appliedToShield: false, shieldBroken: false, phaseAdvanced: false };
    }

    if (canDamagePhaseHp(entity, now)) {
        return { appliedToShield: false, shieldBroken: false, phaseAdvanced: false };
    }

    state.shieldHp = Math.max(0, state.shieldHp - Math.max(0, damage || 1));
    if (state.shieldHp > 0) {
        return { appliedToShield: true, shieldBroken: false, phaseAdvanced: false };
    }

    advanceShieldPhase(entity, now);
    return { appliedToShield: true, shieldBroken: true, phaseAdvanced: true };
}

function tickShieldPhaseState(entity, now = 0) {
    const state = getShieldPhaseState(entity);
    if (!state) return;

    if (state.shieldStages <= state.stagesCleared) return;
    if (state.damageWindowUntil > 0 && now > state.damageWindowUntil) {
        closeShieldDamageWindow(entity, now);
    }
}

function getPhaseHudStatus(entity, now = 0) {
    const state = getShieldPhaseState(entity);
    if (!state) {
        return {
            phaseText: 'Phase 1',
            gateText: '',
            windowRemainingMs: 0
        };
    }

    const phaseNum = Math.min(state.shieldStages, (state.stagesCleared || 0) + 1);
    const windowRemainingMs = Math.max(0, (state.damageWindowUntil || 0) - now);
    const gateText = canDamagePhaseHp(entity, now)
        ? (state.stagesCleared >= state.shieldStages
            ? 'Core exposed'
            : `Damage window ${Math.ceil(windowRemainingMs / 1000)}s`)
        : `Shield ${Math.max(0, Math.ceil(state.shieldHp))}/${Math.max(0, Math.ceil(state.shieldMax))}`;

    return {
        phaseText: `${state.label} ${phaseNum}/${state.shieldStages}`,
        gateText,
        windowRemainingMs
    };
}
