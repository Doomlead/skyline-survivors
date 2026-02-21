// ------------------------
// file: js/entities/player/pilotWeapons/pilotWeaponConfig.js
// ------------------------

const PILOT_WEAPON_CONFIG = {
    combatRifle: {
        id: 'combatRifle',
        name: 'Combat Rifle',
        icon: 'C',
        maxTier: 3,
        infiniteAmmo: true,
        ammoCapacity: Infinity
    },
    scattergun: {
        id: 'scattergun',
        name: 'Scattergun',
        icon: 'S',
        maxTier: 3,
        infiniteAmmo: false,
        ammoCapacity: 200
    },
    plasmaLauncher: {
        id: 'plasmaLauncher',
        name: 'Plasma Launcher',
        icon: 'P',
        maxTier: 3,
        infiniteAmmo: false,
        ammoCapacity: 150
    },
    lightningGun: {
        id: 'lightningGun',
        name: 'Lightning Gun',
        icon: 'L',
        maxTier: 3,
        infiniteAmmo: false,
        ammoCapacity: 25,
        ammoUnit: 's'
    },
    stingerDrone: {
        id: 'stingerDrone',
        name: 'Stinger Drone',
        icon: 'D',
        maxTier: 3,
        infiniteAmmo: true,
        ammoCapacity: Infinity
    }
};

const PILOT_WEAPON_ORDER = ['combatRifle', 'scattergun', 'plasmaLauncher', 'lightningGun', 'stingerDrone'];
