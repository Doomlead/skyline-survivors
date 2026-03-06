const test = require('node:test');
const assert = require('node:assert');

const {
    settleAssaultReward,
    ASSAULT_REWARD_CONSTRAINTS
} = require('../js/config/assaultJackpotRewards');

test('assault reward settlement is idempotent by settlement key', () => {
    const state = {};
    const first = settleAssaultReward({ settlementKey: 'a-1', success: true, context: { districtName: 'Helios' }, metaState: state, runtime: {} });
    assert.strictEqual(first.settled, true);

    const second = settleAssaultReward({ settlementKey: 'a-1', success: true, context: { districtName: 'Helios' }, metaState: first.rewardState, runtime: {} });
    assert.strictEqual(second.settled, false);
    assert.strictEqual(second.duplicate, true);
});

test('assault reward distribution stays within tolerance and records average value', () => {
    let state = {};
    const counts = { jackpot: 0, mystery: 0, standard: 0 };
    const samples = 4000;
    for (let i = 0; i < samples; i++) {
        const result = settleAssaultReward({ settlementKey: `run-${i}`, success: true, context: {}, metaState: state, runtime: {} });
        state = result.rewardState;
        counts[result.reward.rewardType] = (counts[result.reward.rewardType] || 0) + 1;
    }

    const jackpotRate = counts.jackpot / samples;
    assert.ok(jackpotRate > 0.04 && jackpotRate < 0.22, `jackpotRate=${jackpotRate}`);
    assert.ok(state.averageCreditEquivalent > 0);
    assert.ok(state.sampleCount >= samples);
    assert.ok(state.cooldownRemaining <= ASSAULT_REWARD_CONSTRAINTS.jackpotCooldownSuccesses);
});

test('failed assault does not settle reward', () => {
    const out = settleAssaultReward({ settlementKey: 'failed-1', success: false, metaState: {}, runtime: {} });
    assert.strictEqual(out.settled, false);
    assert.strictEqual(out.reason, 'not_eligible');
});
