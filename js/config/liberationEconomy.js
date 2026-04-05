(function(root) {
    var LIBERATION_SOURCE_CONFIG = Object.freeze({
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

    var LIBERATION_OPERATIVE_ECONOMY = Object.freeze({
        captivesPerBuffLevel: 4,
        maxBuffLevel: 6
    });

    var LIBERATION_REWARD_CONFIG = Object.freeze({
        scoreBySource: {
            stasis_array: 350,
            prisoner_transport: 600
        },
        deliveryBonusPerCaptive: 125
    });

    function rollInclusive(min, max) {
        var low = Math.ceil(min);
        var high = Math.floor(max);
        return Math.floor(Math.random() * (high - low + 1)) + low;
    }

    function getCaptiveReleaseCount(sourceRole) {
        var range = sourceRole === 'prisoner_transport'
            ? LIBERATION_SOURCE_CONFIG.captiveReleasePerTransport
            : LIBERATION_SOURCE_CONFIG.captiveReleasePerStasisArray;
        return rollInclusive(range[0], range[1]);
    }

    function getComradeBuffLevelFromLiberated(totalDelivered) {
        var safeDelivered = Math.max(0, Number(totalDelivered) || 0);
        var rawLevel = Math.floor(safeDelivered / LIBERATION_OPERATIVE_ECONOMY.captivesPerBuffLevel);
        return Math.min(LIBERATION_OPERATIVE_ECONOMY.maxBuffLevel, rawLevel);
    }

    function getLiberationBonusScoreBySource(sourceRole) {
        return LIBERATION_REWARD_CONFIG.scoreBySource?.[sourceRole] || 0;
    }

    function getLiberationDeliveryBonusScore(captiveCount) {
        var count = Math.max(0, Number(captiveCount) || 0);
        return count * LIBERATION_REWARD_CONFIG.deliveryBonusPerCaptive;
    }

    var liberationEconomyExports = {
        LIBERATION_SOURCE_CONFIG: LIBERATION_SOURCE_CONFIG,
        LIBERATION_OPERATIVE_ECONOMY: LIBERATION_OPERATIVE_ECONOMY,
        LIBERATION_REWARD_CONFIG: LIBERATION_REWARD_CONFIG,
        getCaptiveReleaseCount: getCaptiveReleaseCount,
        getComradeBuffLevelFromLiberated: getComradeBuffLevelFromLiberated,
        getLiberationBonusScoreBySource: getLiberationBonusScoreBySource,
        getLiberationDeliveryBonusScore: getLiberationDeliveryBonusScore
    };

    if (typeof module !== 'undefined') {
        module.exports = liberationEconomyExports;
    }

    if (root) {
        root.liberationEconomy = liberationEconomyExports;
    }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null));
