const LIBERATION_SOURCE_CONFIG = Object.freeze({
    stasisArrayCount: 3,
    stasisArrayHp: 14,
    prisonerTransportCount: 2,
    prisonerTransportHp: 22,
    transportEscortCount: 2,
    transportPatrolSpeed: 34,
    transportPatrolRange: 280,
    captiveReleasePerStasisArray: [2, 3],
    captiveReleasePerTransport: [3, 5]
});

const LIBERATION_OPERATIVE_ECONOMY = Object.freeze({
    captivesPerBuffLevel: 4,
    maxBuffLevel: 6
});

const LIBERATION_REWARD_CONFIG = Object.freeze({
    scoreBySource: {
        stasis_array: 350,
        prisoner_transport: 600
    },
    deliveryBonusPerCaptive: 125
});

function rollInclusive(min, max) {
    const low = Math.ceil(min);
    const high = Math.floor(max);
    return Math.floor(Math.random() * (high - low + 1)) + low;
}

function getCaptiveReleaseCount(sourceRole) {
    const range = sourceRole === 'prisoner_transport'
        ? LIBERATION_SOURCE_CONFIG.captiveReleasePerTransport
        : LIBERATION_SOURCE_CONFIG.captiveReleasePerStasisArray;
    return rollInclusive(range[0], range[1]);
}

function getComradeBuffLevelFromLiberated(totalDelivered) {
    const safeDelivered = Math.max(0, Number(totalDelivered) || 0);
    const rawLevel = Math.floor(safeDelivered / LIBERATION_OPERATIVE_ECONOMY.captivesPerBuffLevel);
    return Math.min(LIBERATION_OPERATIVE_ECONOMY.maxBuffLevel, rawLevel);
}

function getLiberationBonusScoreBySource(sourceRole) {
    return LIBERATION_REWARD_CONFIG.scoreBySource?.[sourceRole] || 0;
}

function getLiberationDeliveryBonusScore(captiveCount) {
    const count = Math.max(0, Number(captiveCount) || 0);
    return count * LIBERATION_REWARD_CONFIG.deliveryBonusPerCaptive;
}

const exported = {
    LIBERATION_SOURCE_CONFIG,
    LIBERATION_OPERATIVE_ECONOMY,
    LIBERATION_REWARD_CONFIG,
    getCaptiveReleaseCount,
    getComradeBuffLevelFromLiberated,
    getLiberationBonusScoreBySource,
    getLiberationDeliveryBonusScore
};

if (typeof module !== 'undefined') {
    module.exports = exported;
}

if (typeof window !== 'undefined') {
    window.liberationEconomy = exported;
}
