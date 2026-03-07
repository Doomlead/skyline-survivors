const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadMeta() {
    const storage = new Map();
    const localStorage = {
        getItem(key) { return storage.has(key) ? storage.get(key) : null; },
        setItem(key, value) { storage.set(key, String(value)); },
        removeItem(key) { storage.delete(key); }
    };
    const context = { window: {}, localStorage, Math, Date };
    context.window = context;
    const code = fs.readFileSync(path.join(__dirname, '../js/config/metaProgression.js'), 'utf8');
    vm.runInNewContext(code, context, { filename: 'metaProgression.js' });
    return context.metaProgression;
}

test('unlock reward grants ownership once', () => {
    const meta = loadMeta();
    const first = meta.applyPilotIntelReward({ type: 'unlock', weaponId: 'scattergun', threshold: 20 });
    const second = meta.applyPilotIntelReward({ type: 'unlock', weaponId: 'scattergun', threshold: 20 });
    const profile = meta.getPilotWeaponProfile();
    assert.strictEqual(first.applied, true);
    assert.strictEqual(second.alreadyOwned, true);
    assert.strictEqual(profile.unlocked.scattergun, true);
});

test('tier reward clamps at max tier', () => {
    const meta = loadMeta();
    meta.applyPilotIntelReward({ type: 'unlock', weaponId: 'plasmaLauncher', threshold: 110 });
    meta.applyPilotIntelReward({ type: 'tier', weaponId: 'plasmaLauncher', amount: 4, threshold: 150 });
    const profile = meta.getPilotWeaponProfile();
    assert.strictEqual(profile.tiers.plasmaLauncher, 3);
});

test('ammo cap bonus is consumed once at mission start', () => {
    const meta = loadMeta();
    meta.applyPilotIntelReward({ type: 'unlock', weaponId: 'scattergun', threshold: 20 });
    meta.applyPilotIntelReward({ type: 'ammo_cap_bonus', weaponId: 'scattergun', amount: 90, threshold: 75 });

    const firstConsume = meta.consumePilotIntelBonusOnMissionStart();
    const secondConsume = meta.consumePilotIntelBonusOnMissionStart();
    assert.strictEqual(firstConsume.consumed, true);
    assert.strictEqual(firstConsume.bonus.amount, 90);
    assert.strictEqual(secondConsume.consumed, false);
});
