const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');

function loadMetaProgressionHarness() {
    const code = fs.readFileSync(require.resolve('../js/config/metaProgression.js'), 'utf8');
    const storage = new Map();
    const context = {
        console,
        Math,
        Date,
        window: {},
        localStorage: {
            getItem: (k) => (storage.has(k) ? storage.get(k) : null),
            setItem: (k, v) => storage.set(k, String(v)),
            removeItem: (k) => storage.delete(k)
        }
    };
    vm.createContext(context);
    vm.runInContext(code, context, { filename: 'metaProgression.js' });
    return context.window.metaProgression;
}

test('assault jackpot settlement is idempotent by settlement key', () => {
    const meta = loadMetaProgressionHarness();
    const outcome = {
        success: true,
        mode: 'assault',
        districtId: 'alpha',
        districtName: 'Alpha District',
        settlementKey: 'alpha:seed1:assault:success',
        score: 8000
    };

    const first = meta.recordRunOutcome(outcome);
    const second = meta.recordRunOutcome(outcome);

    assert.ok(first.assaultJackpot);
    assert.ok(second.assaultJackpot);
    assert.strictEqual(first.assaultJackpot.settlementKey, second.assaultJackpot.settlementKey);

    const creditsAfter = meta.getMetaState().credits;
    // Third duplicate should not stack jackpot credits endlessly.
    meta.recordRunOutcome(outcome);
    const creditsAfterThird = meta.getMetaState().credits;
    assert.ok((creditsAfterThird - creditsAfter) <= first.earnedCredits + 5);
});

test('failed or non-assault outcomes do not receive jackpot payload', () => {
    const meta = loadMetaProgressionHarness();
    const failed = meta.recordRunOutcome({ success: false, mode: 'assault', settlementKey: 'k1' });
    const defense = meta.recordRunOutcome({ success: true, mode: 'classic', settlementKey: 'k2' });

    assert.strictEqual(failed.assaultJackpot, null);
    assert.strictEqual(defense.assaultJackpot, null);
});

test('distribution report stays within expected tolerance bands', () => {
    const meta = loadMetaProgressionHarness();
    const report = meta.getAssaultRewardBalanceReport(12000);
    assert.ok(report.avgValue > 40 && report.avgValue < 170);
    assert.ok(report.tierRates.jackpot > 0.05 && report.tierRates.jackpot < 0.2);
    assert.ok(report.tierRates.rare > 0.15 && report.tierRates.rare < 0.4);
    assert.ok(report.tierRates.common > 0.45 && report.tierRates.common < 0.8);
});
