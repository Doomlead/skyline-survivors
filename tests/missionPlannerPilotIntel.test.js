const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function makeLocalStorage(initial = {}) {
    const store = new Map(Object.entries(initial));
    return {
        getItem(key) { return store.has(key) ? store.get(key) : null; },
        setItem(key, value) { store.set(key, String(value)); },
        removeItem(key) { store.delete(key); },
        _dump() { return Object.fromEntries(store.entries()); }
    };
}

function loadPlannerContext(storageSeed = {}) {
    const localStorage = makeLocalStorage(storageSeed);
    const context = {
        window: {},
        localStorage,
        Math,
        Date,
        gameState: {},
        Phaser: {
            Utils: { Array: { GetRandom: (arr) => arr[0] } },
            Math: {
                Wrap: (value) => value,
                Clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
                RND: { uuid: () => 'test-seed' }
            }
        }
    };
    context.window = context;
    context.window.metaProgression = {
        applyPilotIntelReward: () => ({ applied: true }),
        addPilotIntelEarned: () => 0,
        getMetaState: () => ({})
    };

    const files = [
        '../js/config/pilotIntelRibbon.js',
        '../js/ui/missionPlannerData.js',
        '../js/ui/missionPlannerDirectives.js',
        '../js/ui/missionPlanner.js'
    ];
    files.forEach((rel) => {
        const code = fs.readFileSync(path.join(__dirname, rel), 'utf8');
        vm.runInNewContext(code, context, { filename: rel });
    });
    return context;
}

test('old district state migrates pilot intel defaults safely', () => {
    const seed = {
        last_bastion_district_state: JSON.stringify({
            lastUpdated: Date.now(),
            districts: {
                'pacific-rim-bastion': {
                    id: 'pacific-rim-bastion',
                    status: 'friendly',
                    timer: 120,
                    criticalTimer: 0,
                    prosperity: 0,
                    lastOutcome: null,
                    clearedRuns: 1
                }
            }
        })
    };
    const ctx = loadPlannerContext(seed);
    const state = ctx.missionPlanner.getDistrictState('pacific-rim-bastion');
    assert.strictEqual(state.pilotIntel, 0);
    assert.strictEqual(state.pilotRibbonLevel, 0);
    assert.strictEqual(Array.isArray(state.pilotRibbonHistory), true);
    assert.strictEqual(state.pilotRibbonHistory.length, 0);
    assert.strictEqual(state.lastIntelAward, null);
});

test('mission success awards district pilot intel', () => {
    const ctx = loadPlannerContext();
    ctx.missionPlanner.selectDistrict('pacific-rim-bastion');
    ctx.missionPlanner.recordMissionOutcome(true);
    const updated = ctx.missionPlanner.getDistrictState('pacific-rim-bastion');
    assert.ok(updated.pilotIntel > 0);
    assert.strictEqual(updated.status, 'friendly');
    assert.ok(ctx.gameState.lastPilotIntelAward);
});

test('mission replay does not duplicate already-claimed milestone rewards', () => {
    const calls = [];
    const ctx = loadPlannerContext();
    ctx.window.metaProgression.applyPilotIntelReward = (payload) => {
        calls.push(payload.threshold);
        return { applied: true };
    };

    const patch = {
        status: 'friendly',
        pilotIntel: 44,
        pilotRibbonLevel: 2,
        pilotRibbonHistory: []
    };
    ctx.missionPlanner.updateDistrictState('pacific-rim-bastion', patch);
    ctx.missionPlanner.selectDistrict('pacific-rim-bastion');
    ctx.missionPlanner.recordMissionOutcome(true);

    const afterFirst = calls.length;
    ctx.missionPlanner.selectDistrict('pacific-rim-bastion');
    ctx.missionPlanner.recordMissionOutcome(true);
    assert.strictEqual(calls.length, afterFirst);
});
