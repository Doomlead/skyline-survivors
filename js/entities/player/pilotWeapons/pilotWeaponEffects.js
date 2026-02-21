// ------------------------
// file: js/entities/player/pilotWeapons/pilotWeaponEffects.js
// ------------------------

function getPilotWeaponHudSnapshot() {
    const state = getPilotWeaponState();
    const weaponId = state.activeWeapon || 'combatRifle';
    const cfg = PILOT_WEAPON_CONFIG[weaponId] || PILOT_WEAPON_CONFIG.combatRifle;
    const ammoValue = cfg.infiniteAmmo
        ? '∞'
        : Math.max(0, Math.floor(state.ammoPools[weaponId] || 0));
    const tier = Math.max(1, state.weaponTiers[weaponId] || 1);
    const status = [];
    if ((state.statusEffects.electrocuted || 0) > 0) status.push('ELECTROCUTED');
    if ((state.statusEffects.radiation || 0) > 0) status.push('RADIATION');

    return {
        icon: cfg.icon,
        name: cfg.name,
        ammo: ammoValue,
        tier,
        droneCount: state.droneCount || 0,
        status: status.join(' · ') || 'NOMINAL'
    };
}

function setPilotHudMode(scene, enabled) {
    if (!scene) return;
    scene.showPilotWeaponHud = Boolean(enabled);
}
