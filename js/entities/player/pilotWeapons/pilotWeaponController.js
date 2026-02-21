// ------------------------
// file: js/entities/player/pilotWeapons/pilotWeaponController.js
// ------------------------

function getPilotWeaponState() {
    if (!playerState.pilotWeapons && typeof createDefaultPilotWeaponState === 'function') {
        playerState.pilotWeapons = createDefaultPilotWeaponState();
    }
    return playerState.pilotWeapons;
}

function initializePilotWeaponLoadout() {
    const state = getPilotWeaponState();
    const meta = window.metaProgression?.getMetaState?.() || {};
    const unlocks = meta.pilotWeaponUnlocks || {};

    PILOT_WEAPON_ORDER.forEach((weaponId) => {
        if (weaponId === 'combatRifle') {
            state.ownedWeapons.combatRifle = true;
            state.weaponTiers.combatRifle = Math.max(1, state.weaponTiers.combatRifle || 1);
            return;
        }
        if (unlocks[weaponId]) {
            state.ownedWeapons[weaponId] = true;
            state.weaponTiers[weaponId] = Math.max(1, state.weaponTiers[weaponId] || 1);
            const cfg = PILOT_WEAPON_CONFIG[weaponId];
            if (cfg && !cfg.infiniteAmmo) state.ammoPools[weaponId] = cfg.ammoCapacity;
        }
    });

    if (!state.ownedWeapons[state.activeWeapon]) {
        state.activeWeapon = getUnlockedPilotWeapons()[0] || 'combatRifle';
    }
}

function initializePilotLoadoutForInterior(scene) {
    initializePilotWeaponLoadout();
    if (typeof setPilotHudMode === 'function') setPilotHudMode(scene, true);
}

function getUnlockedPilotWeapons() {
    const state = getPilotWeaponState();
    return PILOT_WEAPON_ORDER.filter((weaponId) => state.ownedWeapons[weaponId] || state.missionTemporaryWeapons[weaponId]);
}

function cyclePilotWeapon(direction = 1) {
    const state = getPilotWeaponState();
    const unlocked = getUnlockedPilotWeapons();
    if (!unlocked.length) return state.activeWeapon;
    const currentIndex = Math.max(0, unlocked.indexOf(state.activeWeapon));
    const next = (currentIndex + direction + unlocked.length) % unlocked.length;
    state.activeWeapon = unlocked[next];
    return state.activeWeapon;
}

function applyPilotWeaponPickup(weaponId) {
    const state = getPilotWeaponState();
    const cfg = PILOT_WEAPON_CONFIG[weaponId];
    if (!cfg) return;
    if (!state.ownedWeapons[weaponId]) state.missionTemporaryWeapons[weaponId] = true;
    state.weaponTiers[weaponId] = Math.min(cfg.maxTier, (state.weaponTiers[weaponId] || 0) + 1);
    if (!cfg.infiniteAmmo) {
        state.ammoPools[weaponId] = Math.max(state.ammoPools[weaponId] || 0, cfg.ammoCapacity);
    }
    state.activeWeapon = weaponId;
}

function applyPilotAmmoPack(weaponId = null) {
    const state = getPilotWeaponState();
    const targetWeapon = weaponId || state.activeWeapon;
    const cfg = PILOT_WEAPON_CONFIG[targetWeapon];
    if (!cfg || cfg.infiniteAmmo) return;
    const delta = Math.ceil(cfg.ammoCapacity * 0.3);
    state.ammoPools[targetWeapon] = Math.min(cfg.ammoCapacity, (state.ammoPools[targetWeapon] || 0) + delta);
}

function grantPilotAmmoFromRescue() {
    const state = getPilotWeaponState();
    const cfg = PILOT_WEAPON_CONFIG[state.activeWeapon];
    if (!cfg || cfg.infiniteAmmo) return;
    state.ammoPools[state.activeWeapon] = Math.min(cfg.ammoCapacity, (state.ammoPools[state.activeWeapon] || 0) + 2);
}
