const test = require('node:test');
const assert = require('node:assert');

const {
    createLiberationTelemetryState,
    awardLiberationBonus,
    formatLiberationRewardTag
} = require('../js/config/liberationTelemetry');

test('awardLiberationBonus grants score/ammo parity for liberated captives', () => {
    const gameState = { score: 0, liberationTelemetry: createLiberationTelemetryState() };
    const pilotState = { active: true, weaponState: { selected: 'scattergun' } };
    const ammo = {};
    awardLiberationBonus({
        gameState,
        pilotState,
        released: 3,
        source: 'stasis_array',
        nowMs: 1000,
        scoreScaleFn: (value) => value * 2,
        grantPilotAmmoFn: (weapon, amount) => {
            ammo[weapon] = (ammo[weapon] || 0) + amount;
        }
    });

    assert.strictEqual(gameState.score, 720);
    assert.strictEqual(ammo.scattergun, 3);
    assert.strictEqual(gameState.liberationTelemetry.liberated, 3);
    assert.strictEqual(gameState.liberationTelemetry.bonusScore, 720);
    assert.strictEqual(gameState.liberationTelemetry.bonusAmmo, 3);
});

test('formatLiberationRewardTag renders only while event is active', () => {
    const gameState = { score: 0, liberationTelemetry: createLiberationTelemetryState() };
    awardLiberationBonus({
        gameState,
        rescued: 1,
        released: 2,
        nowMs: 2000
    });

    const activeTag = formatLiberationRewardTag(gameState.liberationTelemetry, 3000);
    const expiredTag = formatLiberationRewardTag(gameState.liberationTelemetry, 9000);
    assert.match(activeTag, /LIB \+2/);
    assert.match(activeTag, /RESC \+1/);
    assert.strictEqual(expiredTag, '');
});
