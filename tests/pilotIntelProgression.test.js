const test = require('node:test');
const assert = require('node:assert');

const intel = require('../js/ui/pilotIntelProgression');

test('normalizes legacy district intel fields to safe defaults', () => {
    const state = {};
    intel.normalizeDistrictIntelState(state);
    assert.strictEqual(state.pilotIntel, 0);
    assert.strictEqual(state.pilotIntelMilestoneIndex, 0);
    assert.strictEqual(state.pilotIntelLastReward, null);
    assert.strictEqual(state.pilotIntelLastAwardMissionId, null);
    assert.strictEqual(state.pilotIntelLastProcessedMissionId, null);
});

test('critical success applies +50% intel bonus', () => {
    const result = intel.computeIntelAward({
        success: true,
        directives: { urgency: 'critical' },
        preMissionState: { status: 'critical' }
    });
    assert.strictEqual(result.baseIntel, 30);
    assert.strictEqual(result.criticalBonusMultiplier, 1.5);
    assert.strictEqual(result.awardIntel, 45);
    assert.strictEqual(result.occupiedSuppressed, false);
});

test('occupied districts suppress intel gain', () => {
    const result = intel.computeIntelAward({
        success: true,
        directives: { urgency: 'occupied' },
        preMissionState: { status: 'occupied' }
    });
    assert.strictEqual(result.awardIntel, 0);
    assert.strictEqual(result.occupiedSuppressed, true);
});

test('milestone reward precedence is unlock then tier then ammo', () => {
    const unlockReward = intel.resolveMilestoneReward({
        profile: {
            unlocked: { scattergun: false, plasmaLauncher: false, lightningGun: false, stingerDrone: false },
            tiers: { scattergun: 0, plasmaLauncher: 0, lightningGun: 0, stingerDrone: 0 }
        }
    });
    assert.deepStrictEqual(unlockReward, { type: 'unlock', weapon: 'scattergun' });

    const tierReward = intel.resolveMilestoneReward({
        profile: {
            unlocked: { scattergun: true, plasmaLauncher: true, lightningGun: true, stingerDrone: true },
            tiers: { scattergun: 3, plasmaLauncher: 2, lightningGun: 3, stingerDrone: 3 }
        }
    });
    assert.deepStrictEqual(tierReward, { type: 'tier_token', weapon: 'plasmaLauncher' });

    const ammoReward = intel.resolveMilestoneReward({
        profile: {
            unlocked: { scattergun: true, plasmaLauncher: true, lightningGun: true, stingerDrone: true },
            tiers: { scattergun: 3, plasmaLauncher: 3, lightningGun: 3, stingerDrone: 3 }
        }
    });
    assert.deepStrictEqual(ammoReward, { type: 'ammo_cap_bonus', amount: 1 });
});

test('milestone rollover emits exactly one reward per threshold crossed', () => {
    const state = { pilotIntel: 210, pilotIntelMilestoneIndex: 0 };
    intel.normalizeDistrictIntelState(state);
    const rewards = intel.processMilestones(state, () => ({ type: 'tier_token', weapon: 'scattergun' }));
    assert.strictEqual(state.pilotIntelMilestoneIndex, 2);
    assert.strictEqual(rewards.length, 2);
    assert.deepStrictEqual(state.pilotIntelLastReward, { type: 'tier_token', weapon: 'scattergun' });
});
