const test = require('node:test');
const assert = require('node:assert');

const {
    getCaptiveReleaseCount,
    getComradeBuffLevelFromLiberated,
    LIBERATION_OPERATIVE_ECONOMY,
    getLiberationBonusScoreBySource,
    getLiberationDeliveryBonusScore
} = require('../js/config/liberationEconomy');

test('captives released by stasis arrays and transports stay in configured ranges', () => {
    for (let i = 0; i < 100; i++) {
        const stasis = getCaptiveReleaseCount('stasis_array');
        const transport = getCaptiveReleaseCount('prisoner_transport');
        assert.ok(stasis >= 2 && stasis <= 3, `stasis=${stasis}`);
        assert.ok(transport >= 3 && transport <= 5, `transport=${transport}`);
    }
});

test('liberated captive totals map to capped comrade buff levels', () => {
    assert.strictEqual(getComradeBuffLevelFromLiberated(0), 0);
    assert.strictEqual(getComradeBuffLevelFromLiberated(3), 0);
    assert.strictEqual(getComradeBuffLevelFromLiberated(4), 1);
    assert.strictEqual(getComradeBuffLevelFromLiberated(20), 5);
    const capped = getComradeBuffLevelFromLiberated(999);
    assert.strictEqual(capped, LIBERATION_OPERATIVE_ECONOMY.maxBuffLevel);
});

test('liberation bonus helpers return expected source and delivery scores', () => {
    assert.strictEqual(getLiberationBonusScoreBySource('stasis_array'), 350);
    assert.strictEqual(getLiberationBonusScoreBySource('prisoner_transport'), 600);
    assert.strictEqual(getLiberationBonusScoreBySource('unknown'), 0);
    assert.strictEqual(getLiberationDeliveryBonusScore(0), 0);
    assert.strictEqual(getLiberationDeliveryBonusScore(4), 500);
});
