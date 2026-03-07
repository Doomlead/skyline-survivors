const test = require('node:test');
const assert = require('node:assert');

const {
    computePilotIntelAward,
    getMilestonesCrossed,
    PILOT_RIBBON_MILESTONES
} = require('../js/config/pilotIntelRibbon');

test('critical mission applies +50% pilot intel bonus', () => {
    const normal = computePilotIntelAward({ success: true, missionMode: 'classic', wasCritical: false, preMissionStatus: 'friendly', districtStatusAfter: 'friendly' });
    const critical = computePilotIntelAward({ success: true, missionMode: 'classic', wasCritical: true, preMissionStatus: 'critical', districtStatusAfter: 'friendly' });
    assert.strictEqual(normal.amount, 10);
    assert.strictEqual(critical.amount, 15);
    assert.ok(critical.tags.includes('critical_bonus'));
});

test('failed mission suppresses pilot intel', () => {
    const failed = computePilotIntelAward({ success: false, missionMode: 'assault', wasCritical: true, preMissionStatus: 'occupied', districtStatusAfter: 'occupied' });
    assert.strictEqual(failed.eligible, false);
    assert.strictEqual(failed.amount, 0);
    assert.strictEqual(failed.reason, 'mission_failed');
});

test('milestone crossing resolves all thresholds in range', () => {
    const crossed = getMilestonesCrossed(19, 80).map((m) => m.threshold);
    assert.deepStrictEqual(crossed, PILOT_RIBBON_MILESTONES.slice(0, 3).map((m) => m.threshold));
});
