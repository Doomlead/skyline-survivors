// ------------------------
// file: js/entities/player/pilotWeapons/pilotWeaponState.js
// ------------------------

function createDefaultPilotWeaponState() {
    return {
        ownedWeapons: { combatRifle: true },
        missionTemporaryWeapons: {},
        weaponTiers: { combatRifle: 1 },
        ammoPools: {
            scattergun: PILOT_WEAPON_CONFIG.scattergun.ammoCapacity,
            plasmaLauncher: PILOT_WEAPON_CONFIG.plasmaLauncher.ammoCapacity,
            lightningGun: PILOT_WEAPON_CONFIG.lightningGun.ammoCapacity
        },
        activeWeapon: 'combatRifle',
        droneCount: 1,
        statusEffects: {
            electrocuted: 0,
            radiation: 0
        }
    };
}

function resetPilotWeaponStateToDefaults() {
    playerState.pilotWeapons = createDefaultPilotWeaponState();
}
