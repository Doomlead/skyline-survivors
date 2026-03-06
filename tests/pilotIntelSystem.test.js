const test = require('node:test');
const assert = require('node:assert');

const pilotIntelSystem = require('../js/ui/pilotIntelSystem');

test('critical urgency applies +50% intel bonus', () => {
    const result = pilotIntelSystem.calculateIntelAward({
        success: true,
        urgency: 'critical',
        districtStatus: 'critical'
    });
    assert.strictEqual(result.baseAward, 20);
    assert.strictEqual(result.amount, 30);
    assert.strictEqual(result.criticalBonusApplied, true);
});

test('occupied districts suppress intel awards', () => {
    const result = pilotIntelSystem.calculateIntelAward({
        success: true,
        urgency: 'occupied',
        districtStatus: 'occupied'
    });
    assert.strictEqual(result.amount, 0);
    assert.strictEqual(result.suppressed, true);
});

test('legacy district state is defaulted with intel fields', () => {
    const normalized = pilotIntelSystem.ensureIntelState({ status: 'friendly', timer: 120 });
    assert.strictEqual(normalized.intelProgress, 0);
    assert.strictEqual(normalized.intelMilestoneIndex, 0);
    assert.strictEqual(normalized.intelSuppressed, false);
});

test('ribbon progression computes next milestone segment', () => {
    const ribbon = pilotIntelSystem.getRibbonProgress({ intelProgress: 250, intelMilestoneIndex: 2 });
    assert.strictEqual(ribbon.previousTarget, 220);
    assert.strictEqual(ribbon.nextTarget, 360);
    assert.ok(ribbon.percentToNext > 0);
});
