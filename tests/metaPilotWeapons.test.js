const test = require('node:test');
const assert = require('node:assert');

const META_PATH = '../js/config/metaProgression';

function createStorage() {
    const store = new Map();
    return {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: (k) => store.delete(k),
        clear: () => store.clear()
    };
}

test('pilot weapon profile defaults and unlock/tier helpers persist state', () => {
    global.localStorage = createStorage();
    delete require.cache[require.resolve(META_PATH)];
    const meta = require(META_PATH);

    const baseline = meta.getPilotWeaponProfile();
    assert.equal(baseline.unlocked.combatRifle, true);
    assert.equal(baseline.unlocked.scattergun, false);
    assert.equal(baseline.tiers.combatRifle, 1);
    assert.equal(baseline.tiers.scattergun, 0);

    const invalid = meta.purchasePilotWeapon('nope');
    assert.equal(invalid.success, false);

    const unlock = meta.purchasePilotWeapon('scattergun');
    assert.equal(unlock.success, true);

    const tier = meta.upgradePilotWeaponTier('scattergun');
    assert.equal(tier.success, true);
    assert.equal(tier.newTier, 2);

    const after = meta.getPilotWeaponProfile();
    assert.equal(after.unlocked.scattergun, true);
    assert.equal(after.tiers.scattergun, 2);

    delete require.cache[require.resolve(META_PATH)];
    const reloaded = require(META_PATH);
    const persisted = reloaded.getPilotWeaponProfile();
    assert.equal(persisted.unlocked.scattergun, true);
    assert.equal(persisted.tiers.scattergun, 2);

    delete global.localStorage;
});

test('meta state sanitizes malformed pilot weapon profile from storage', () => {
    const storage = createStorage();
    storage.setItem('skyline_meta_progression_v2', JSON.stringify({
        pilotWeapons: {
            unlocked: { scattergun: 'yes', plasmaLauncher: 0 },
            tiers: { combatRifle: 0, scattergun: -4, plasmaLauncher: 3.6 },
            startAmmo: { scattergun: -1, plasmaLauncher: 321.3, lightningGun: 'bad' }
        }
    }));

    global.localStorage = storage;
    delete require.cache[require.resolve(META_PATH)];
    const meta = require(META_PATH);

    const profile = meta.getPilotWeaponProfile();
    assert.equal(profile.unlocked.combatRifle, true);
    assert.equal(profile.unlocked.scattergun, true);
    assert.equal(profile.unlocked.plasmaLauncher, false);
    assert.equal(profile.tiers.combatRifle, 1);
    assert.equal(profile.tiers.scattergun, 0);
    assert.equal(profile.tiers.plasmaLauncher, 4);
    assert.equal(profile.startAmmo.scattergun, 0);
    assert.equal(profile.startAmmo.plasmaLauncher, 321);
    assert.equal(profile.startAmmo.lightningGun, 25000);

    delete global.localStorage;
});

test('hydratePilotWeaponState merges persistent profile and refills limited ammo', () => {
    global.localStorage = createStorage();
    delete require.cache[require.resolve(META_PATH)];
    const meta = require(META_PATH);

    meta.purchasePilotWeapon('plasmaLauncher');
    meta.upgradePilotWeaponTier('plasmaLauncher'); // persistent tier 2

    const runtimeState = {
        selected: 'scattergun',
        unlocked: {
            combatRifle: true,
            scattergun: false,
            plasmaLauncher: false,
            lightningGun: false,
            stingerDrone: false
        },
        temporaryUnlocks: {
            scattergun: true
        },
        tiers: {
            combatRifle: 1,
            scattergun: 1,
            plasmaLauncher: 0,
            lightningGun: 0,
            stingerDrone: 0
        },
        ammo: {
            scattergun: 1,
            plasmaLauncher: 5,
            lightningGun: 7
        }
    };

    const hydrated = meta.hydratePilotWeaponState(runtimeState);
    assert.equal(hydrated.unlocked.combatRifle, true);
    assert.equal(hydrated.unlocked.plasmaLauncher, true);
    assert.equal(hydrated.tiers.plasmaLauncher, 2);
    assert.equal(hydrated.ammo.scattergun, 200);
    assert.equal(hydrated.ammo.plasmaLauncher, 150);
    assert.equal(hydrated.ammo.lightningGun, 25000);

    delete global.localStorage;
});

test('pilot weapon crate pickup grants temporary unlocks and mission-end cleanup restores persistent profile', () => {
    global.localStorage = createStorage();
    delete require.cache[require.resolve(META_PATH)];
    const meta = require(META_PATH);

    const runtimeState = {
        selected: 'combatRifle',
        unlocked: {
            combatRifle: true,
            scattergun: false,
            plasmaLauncher: false,
            lightningGun: false,
            stingerDrone: false
        },
        temporaryUnlocks: {
            scattergun: false,
            plasmaLauncher: false,
            lightningGun: false,
            stingerDrone: false
        },
        tiers: {
            combatRifle: 1,
            scattergun: 0,
            plasmaLauncher: 0,
            lightningGun: 0,
            stingerDrone: 0
        },
        ammo: {
            scattergun: 0,
            plasmaLauncher: 0,
            lightningGun: 0
        }
    };

    const tempUnlock = meta.applyPilotWeaponCratePickup(runtimeState, 'lightningGun');
    assert.equal(tempUnlock.applied, true);
    assert.equal(tempUnlock.permanentlyOwned, false);
    assert.equal(runtimeState.temporaryUnlocks.lightningGun, true);
    assert.equal(runtimeState.tiers.lightningGun, 1);
    assert.equal(runtimeState.ammo.lightningGun, 12500);

    meta.purchasePilotWeapon('scattergun');
    const ownedBoost = meta.applyPilotWeaponCratePickup(runtimeState, 'scattergun');
    assert.equal(ownedBoost.applied, true);
    assert.equal(ownedBoost.permanentlyOwned, true);
    assert.equal(runtimeState.tiers.scattergun, 2);
    assert.equal(runtimeState.ammo.scattergun, 200);

    meta.clearTemporaryPilotWeaponState(runtimeState);
    assert.equal(runtimeState.temporaryUnlocks.lightningGun, false);
    assert.equal(runtimeState.unlocked.lightningGun, false);
    assert.equal(runtimeState.tiers.lightningGun, 0);
    assert.equal(runtimeState.unlocked.scattergun, true);
    assert.equal(runtimeState.tiers.scattergun, 1);

    delete global.localStorage;
});

test('grantPilotAmmo and refillCurrentPilotWeaponByRescueBonus top up selected limited ammo weapon', () => {
    global.localStorage = createStorage();
    delete require.cache[require.resolve(META_PATH)];
    const meta = require(META_PATH);

    const runtimeState = {
        selected: 'scattergun',
        ammo: { scattergun: 10, plasmaLauncher: 3, lightningGun: 100 },
        unlocked: { combatRifle: true, scattergun: true, plasmaLauncher: false, lightningGun: false, stingerDrone: false },
        temporaryUnlocks: { scattergun: false, plasmaLauncher: false, lightningGun: false, stingerDrone: false },
        tiers: { combatRifle: 1, scattergun: 1, plasmaLauncher: 0, lightningGun: 0, stingerDrone: 0 }
    };

    const direct = meta.grantPilotAmmo(runtimeState, 'scattergun', 50);
    assert.equal(direct.applied, true);
    assert.equal(direct.ammo, 60);

    const percent = meta.grantPilotAmmo(runtimeState, 'scattergun', 0.25);
    assert.equal(percent.applied, true);
    assert.equal(percent.ammo, 110);

    const rescueRefill = meta.refillCurrentPilotWeaponByRescueBonus(runtimeState);
    assert.equal(rescueRefill.applied, true);
    assert.equal(rescueRefill.weaponId, 'scattergun');
    assert.equal(runtimeState.ammo.scattergun, 134);

    runtimeState.selected = 'combatRifle';
    const noLimited = meta.refillCurrentPilotWeaponByRescueBonus(runtimeState);
    assert.equal(noLimited.applied, false);

    delete global.localStorage;
});

test('checklist: new run hydrate with no unlocks keeps combat rifle only', () => {
    global.localStorage = createStorage();
    delete require.cache[require.resolve(META_PATH)];
    const meta = require(META_PATH);

    const runtimeState = {
        selected: 'scattergun',
        unlocked: {
            combatRifle: true,
            scattergun: false,
            plasmaLauncher: false,
            lightningGun: false,
            stingerDrone: false
        },
        temporaryUnlocks: {
            scattergun: false,
            plasmaLauncher: false,
            lightningGun: false,
            stingerDrone: false
        },
        tiers: {
            combatRifle: 1,
            scattergun: 0,
            plasmaLauncher: 0,
            lightningGun: 0,
            stingerDrone: 0
        },
        ammo: {
            scattergun: 0,
            plasmaLauncher: 0,
            lightningGun: 0
        }
    };

    meta.hydratePilotWeaponState(runtimeState);
    assert.equal(runtimeState.selected, 'combatRifle');
    assert.equal(runtimeState.unlocked.combatRifle, true);
    assert.equal(runtimeState.unlocked.scattergun, false);
    assert.equal(runtimeState.unlocked.plasmaLauncher, false);
    assert.equal(runtimeState.unlocked.lightningGun, false);
    assert.equal(runtimeState.unlocked.stingerDrone, false);

    delete global.localStorage;
});

test('checklist: permanent unlock persists after reload and tier upgrades cap at 3', () => {
    global.localStorage = createStorage();
    delete require.cache[require.resolve(META_PATH)];
    const meta = require(META_PATH);

    meta.purchasePilotWeapon('scattergun');
    meta.upgradePilotWeaponTier('scattergun'); // 2
    meta.upgradePilotWeaponTier('scattergun'); // 3
    meta.upgradePilotWeaponTier('scattergun'); // should stay 3

    let profile = meta.getPilotWeaponProfile();
    assert.equal(profile.unlocked.scattergun, true);
    assert.equal(profile.tiers.scattergun, 3);

    delete require.cache[require.resolve(META_PATH)];
    const reloaded = require(META_PATH);
    profile = reloaded.getPilotWeaponProfile();
    assert.equal(profile.unlocked.scattergun, true);
    assert.equal(profile.tiers.scattergun, 3);

    delete global.localStorage;
});
