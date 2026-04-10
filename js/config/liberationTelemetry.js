const LIBERATION_BONUS_CONFIG = {
    scorePerCaptive: 120,
    ammoPerCaptive: 1,
    hudEventDurationMs: 5000
};

function createLiberationTelemetryState() {
    return {
        liberated: 0,
        rescued: 0,
        bonusScore: 0,
        bonusAmmo: 0,
        lastEvent: null
    };
}

function ensureLiberationTelemetryState(state) {
    if (!state || typeof state !== 'object') {
        return createLiberationTelemetryState();
    }
    return {
        liberated: Number.isFinite(state.liberated) ? state.liberated : 0,
        rescued: Number.isFinite(state.rescued) ? state.rescued : 0,
        bonusScore: Number.isFinite(state.bonusScore) ? state.bonusScore : 0,
        bonusAmmo: Number.isFinite(state.bonusAmmo) ? state.bonusAmmo : 0,
        lastEvent: state.lastEvent && typeof state.lastEvent === 'object' ? state.lastEvent : null
    };
}

function awardLiberationBonus(context = {}) {
    const gameStateRef = context.gameState;
    if (!gameStateRef) return { scoreBonus: 0, ammoBonus: 0 };
    gameStateRef.liberationTelemetry = ensureLiberationTelemetryState(gameStateRef.liberationTelemetry);
    const telemetry = gameStateRef.liberationTelemetry;

    const released = Math.max(0, Math.floor(context.released || 0));
    const rescued = Math.max(0, Math.floor(context.rescued || 0));
    const now = Number.isFinite(context.nowMs) ? context.nowMs : Date.now();
    const scoreScaleFn = typeof context.scoreScaleFn === 'function' ? context.scoreScaleFn : ((value) => value);
    const pilotStateRef = context.pilotState;
    const grantPilotAmmoFn = typeof context.grantPilotAmmoFn === 'function' ? context.grantPilotAmmoFn : null;
    const pilotWeapon = context.pilotWeapon || pilotStateRef?.weaponState?.selected || 'combatRifle';

    const scoreBonus = released > 0 ? Math.max(0, Math.round(scoreScaleFn(LIBERATION_BONUS_CONFIG.scorePerCaptive * released))) : 0;
    if (scoreBonus > 0) {
        gameStateRef.score = (gameStateRef.score || 0) + scoreBonus;
        telemetry.bonusScore += scoreBonus;
    }

    let ammoBonus = 0;
    if (released > 0 && pilotStateRef?.active && grantPilotAmmoFn) {
        ammoBonus = Math.max(0, released * LIBERATION_BONUS_CONFIG.ammoPerCaptive);
        if (ammoBonus > 0) {
            grantPilotAmmoFn(pilotWeapon, ammoBonus);
            telemetry.bonusAmmo += ammoBonus;
        }
    }

    telemetry.liberated += released;
    telemetry.rescued += rescued;
    telemetry.lastEvent = {
        released,
        rescued,
        scoreBonus,
        ammoBonus,
        source: context.source || 'unknown',
        expiresAt: now + LIBERATION_BONUS_CONFIG.hudEventDurationMs
    };

    return { scoreBonus, ammoBonus };
}

function formatLiberationRewardTag(telemetryState, nowMs) {
    const telemetry = ensureLiberationTelemetryState(telemetryState);
    const event = telemetry.lastEvent;
    if (!event || !Number.isFinite(event.expiresAt) || nowMs > event.expiresAt) return '';
    const parts = [];
    if (event.released > 0) parts.push(`LIB +${event.released}`);
    if (event.rescued > 0) parts.push(`RESC +${event.rescued}`);
    if (event.scoreBonus > 0) parts.push(`+${event.scoreBonus} SCORE`);
    if (event.ammoBonus > 0) parts.push(`AMMO +${event.ammoBonus}`);
    return parts.length ? ` · ${parts.join(' · ')}` : '';
}

const LIBERATION_TELEMETRY_EXPORTS = {
    LIBERATION_BONUS_CONFIG,
    createLiberationTelemetryState,
    ensureLiberationTelemetryState,
    awardLiberationBonus,
    formatLiberationRewardTag
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LIBERATION_TELEMETRY_EXPORTS;
}

if (typeof window !== 'undefined') {
    window.liberationTelemetry = LIBERATION_TELEMETRY_EXPORTS;
}
