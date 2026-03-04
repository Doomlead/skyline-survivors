// ------------------------
// Pilot weapon progression helpers
// ------------------------

function getPilotWeaponStateRef() {
    if (typeof pilotState === 'undefined' || !pilotState) return null;
    return pilotState.weaponState || null;
}

function normalizePilotWeaponSelectionState(state, orderProvider) {
    const order = typeof orderProvider === 'function'
        ? orderProvider()
        : ['combatRifle', 'scattergun', 'plasmaLauncher', 'lightningGun', 'stingerDrone'];
    const canUse = (weapon) => Boolean(state?.unlocked?.[weapon] || state?.temporaryUnlocks?.[weapon]);
    if (!state) return 'combatRifle';
    if (!canUse(state.selected)) {
        state.selected = order.find(canUse) || 'combatRifle';
    }
    state.unlocked.combatRifle = true;
    state.tiers.combatRifle = Math.max(1, state.tiers?.combatRifle || 1);
    return state.selected;
}

function unlockWeaponState(state, weapon, options = {}) {
    if (!state || !weapon) return false;
    if (weapon === 'combatRifle') {
        state.unlocked.combatRifle = true;
        state.tiers.combatRifle = Math.max(1, state.tiers?.combatRifle || 1);
        return true;
    }
    if (options.temporary) {
        state.temporaryUnlocks[weapon] = true;
    } else {
        state.unlocked[weapon] = true;
    }
    state.tiers[weapon] = Math.max(1, Math.min(3, options.tier || state.tiers?.[weapon] || 1));
    return true;
}

function setTemporaryUnlockState(state, weapon, enabled) {
    if (!state || !weapon || weapon === 'combatRifle') return false;
    state.temporaryUnlocks[weapon] = Boolean(enabled);
    return true;
}

function upgradeTierState(state, weapon, amount = 1) {
    if (!state || !weapon) return 0;
    const current = Math.max(weapon === 'combatRifle' ? 1 : 0, state.tiers?.[weapon] || 0);
    const next = Math.max(weapon === 'combatRifle' ? 1 : 1, Math.min(3, current + (Number.isFinite(amount) ? amount : 0)));
    state.tiers[weapon] = next;
    if (weapon !== 'combatRifle') {
        state.unlocked[weapon] = true;
    }
    return next;
}

function consumeAmmoState(state, weapon, amount) {
    if (!state || !weapon || !Number.isFinite(state.ammo?.[weapon])) return Infinity;
    const delta = Math.max(0, Number.isFinite(amount) ? amount : 0);
    state.ammo[weapon] = Math.max(0, (state.ammo[weapon] || 0) - delta);
    return state.ammo[weapon];
}

window.pilotWeaponProgression = {
    getState: getPilotWeaponStateRef,
    unlockWeapon: unlockWeaponState,
    setTemporaryUnlock: setTemporaryUnlockState,
    upgradeTier: upgradeTierState,
    consumeAmmo: consumeAmmoState,
    normalizeSelection: normalizePilotWeaponSelectionState
};
