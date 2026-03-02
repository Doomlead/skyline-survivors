// ------------------------
// file: js/entities/player/pilotWeaponProgression.js
// Centralized pilot weapon progression/state mutation rules.
// ------------------------

const PILOT_WEAPON_ORDER = ['combatRifle', 'scattergun', 'plasmaLauncher', 'lightningGun', 'stingerDrone'];
const PILOT_LIMITED_AMMO_WEAPONS = ['scattergun', 'plasmaLauncher', 'lightningGun'];

function ensurePilotWeaponState(weaponState) {
    if (!weaponState || typeof weaponState !== 'object') return null;
    if (!weaponState.unlocked || typeof weaponState.unlocked !== 'object') weaponState.unlocked = {};
    if (!weaponState.temporaryUnlocks || typeof weaponState.temporaryUnlocks !== 'object') weaponState.temporaryUnlocks = {};
    if (!weaponState.tiers || typeof weaponState.tiers !== 'object') weaponState.tiers = {};
    if (!weaponState.ammo || typeof weaponState.ammo !== 'object') weaponState.ammo = {};
    weaponState.unlocked.combatRifle = true;
    weaponState.tiers.combatRifle = Math.max(1, Math.round(weaponState.tiers.combatRifle || 1));
    return weaponState;
}

function isWeaponUsable(weaponState, weaponId) {
    if (!weaponState || !weaponId) return false;
    if (weaponId === 'combatRifle') return true;
    return Boolean(weaponState.unlocked?.[weaponId] || weaponState.temporaryUnlocks?.[weaponId]);
}

function unlockWeapon(weaponState, weaponId) {
    const state = ensurePilotWeaponState(weaponState);
    if (!state || !PILOT_WEAPON_ORDER.includes(weaponId)) return false;
    if (weaponId === 'combatRifle') return true;
    state.unlocked[weaponId] = true;
    state.tiers[weaponId] = Math.max(1, Math.round(state.tiers[weaponId] || 0));
    return true;
}

function setTemporaryUnlock(weaponState, weaponId, enabled = true) {
    const state = ensurePilotWeaponState(weaponState);
    if (!state || !PILOT_WEAPON_ORDER.includes(weaponId) || weaponId === 'combatRifle') return false;
    state.temporaryUnlocks[weaponId] = Boolean(enabled);
    if (enabled) {
        state.tiers[weaponId] = Math.max(1, Math.round(state.tiers[weaponId] || 0));
    }
    return true;
}

function upgradeTier(weaponState, weaponId, maxTier = 3) {
    const state = ensurePilotWeaponState(weaponState);
    if (!state || !PILOT_WEAPON_ORDER.includes(weaponId)) return 0;
    const base = weaponId === 'combatRifle' ? 1 : 0;
    const next = Math.min(maxTier, Math.max(base, Math.round(state.tiers[weaponId] || base)) + 1);
    state.tiers[weaponId] = next;
    if (weaponId !== 'combatRifle') state.unlocked[weaponId] = true;
    return next;
}

function consumeAmmo(weaponState, weaponId, amount = 1) {
    const state = ensurePilotWeaponState(weaponState);
    if (!state || !PILOT_LIMITED_AMMO_WEAPONS.includes(weaponId)) return null;
    const spend = Math.max(0, Math.round(amount || 0));
    state.ammo[weaponId] = Math.max(0, Math.round(state.ammo[weaponId] || 0) - spend);
    return state.ammo[weaponId];
}

function normalizeSelection(weaponState, order = PILOT_WEAPON_ORDER) {
    const state = ensurePilotWeaponState(weaponState);
    if (!state) return 'combatRifle';
    if (!isWeaponUsable(state, state.selected)) {
        state.selected = order.find((weaponId) => isWeaponUsable(state, weaponId)) || 'combatRifle';
    }
    return state.selected;
}

function getAvailableWeapons(weaponState, order = PILOT_WEAPON_ORDER) {
    const state = ensurePilotWeaponState(weaponState);
    if (!state) return ['combatRifle'];
    return order.filter((weaponId) => isWeaponUsable(state, weaponId));
}

const api = {
    PILOT_WEAPON_ORDER,
    PILOT_LIMITED_AMMO_WEAPONS,
    ensurePilotWeaponState,
    isWeaponUsable,
    unlockWeapon,
    setTemporaryUnlock,
    upgradeTier,
    consumeAmmo,
    normalizeSelection,
    getAvailableWeapons
};

if (typeof window !== 'undefined') {
    window.pilotWeaponProgression = api;
}

if (typeof module !== 'undefined') {
    module.exports = api;
}
