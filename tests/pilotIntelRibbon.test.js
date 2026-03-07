const test = require('node:test');
const assert = require('node:assert');

const {
    computeIntelAward,
    getCrossedMilestones,
    buildMilestoneReward,
    getRibbonSummary,
    PILOT_INTEL_CONFIG
} = require('../js/config/pilotIntelRibbon');

test('critical missions apply +50% Pilot Intel bonus', () => {
    const result = computeIntelAward({ success: true, missionMode: 'classic', statusBefore: 'critical', criticalAtLaunch: true });
    assert.strictEqual(result.baseIntel, PILOT_INTEL_CONFIG.baseIntelByMode.classic.success);
    assert.strictEqual(result.finalIntel, Math.round(result.baseIntel * 1.5));
    assert.strictEqual(result.criticalApplied, true);
});

test('occupied missions suppress intel unless liberated by successful assault', () => {
    const suppressed = computeIntelAward({ success: false, missionMode: 'assault', statusBefore: 'occupied', criticalAtLaunch: false });
    assert.strictEqual(suppressed.suppressed, true);
    assert.strictEqual(suppressed.finalIntel, 0);

    const liberated = computeIntelAward({ success: true, missionMode: 'assault', statusBefore: 'occupied', criticalAtLaunch: false });
    assert.strictEqual(liberated.suppressed, false);
    assert.ok(liberated.finalIntel > 0);
});

test('crossed milestone detection ignores already claimed thresholds', () => {
    const crossed = getCrossedMilestones(220, 480, [250]);
    assert.deepStrictEqual(crossed, [450]);
});

test('milestone reward routing follows unlock -> tier token -> ammo cap bonus order', () => {
    const lockedProfile = {
        unlocked: { scattergun: false },
        tiers: { scattergun: 0 }
    };
    const unlockReward = buildMilestoneReward({ threshold: 100, pilotProfile: lockedProfile });
    assert.strictEqual(unlockReward.type, 'unlock');

    const tierProfile = {
        unlocked: { scattergun: true },
        tiers: { scattergun: 2 }
    };
    const tierReward = buildMilestoneReward({ threshold: 100, pilotProfile: tierProfile });
    assert.strictEqual(tierReward.type, 'tier_token');

    const maxProfile = {
        unlocked: { scattergun: true },
        tiers: { scattergun: 3 }
    };
    const ammoReward = buildMilestoneReward({ threshold: 100, pilotProfile: maxProfile });
    assert.strictEqual(ammoReward.type, 'ammo_cap_bonus');
    assert.ok(ammoReward.amount > 0);
});

test('ribbon summary reports next milestone and reward preview', () => {
    const profile = {
        unlocked: { scattergun: false },
        tiers: { scattergun: 0 }
    };
    const summary = getRibbonSummary({ intel: 80, claimedMilestones: [], pilotProfile: profile });
    assert.strictEqual(summary.nextMilestone.threshold, 100);
    assert.strictEqual(summary.nextReward.type, 'unlock');
});
