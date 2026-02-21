// ------------------------
// file: js/entities/items/pilotWeaponPickups.js
// ------------------------

const PILOT_PICKUP_TYPES = {
    pilot_scattergun: { weaponId: 'scattergun', label: 'SCATTERGUN' },
    pilot_plasmaLauncher: { weaponId: 'plasmaLauncher', label: 'PLASMA LAUNCHER' },
    pilot_lightningGun: { weaponId: 'lightningGun', label: 'LIGHTNING GUN' },
    pilot_stingerDrone: { weaponId: 'stingerDrone', label: 'STINGER DRONE' },
    pilot_ammoPack: { ammoPack: true, label: 'AMMO PACK' }
};

function isPilotWeaponPickupType(type) {
    return Boolean(PILOT_PICKUP_TYPES[type]);
}

function spawnPilotWeaponPickup(scene, x, y, type) {
    if (!scene?.powerUps || !isPilotWeaponPickupType(type)) return null;
    const pickup = scene.powerUps.create(x, y, 'powerup_shield');
    pickup.setTint(0x7dd3fc);
    pickup.powerUpType = type;
    pickup.birthTime = scene.time.now;
    pickup.setScale(1.2);
    pickup.setDepth(FG_DEPTH_BASE + 3);
    return pickup;
}

function collectPilotWeaponPickup(scene, powerUp) {
    if (!scene || !powerUp) return false;
    const config = PILOT_PICKUP_TYPES[powerUp.powerUpType];
    if (!config) return false;

    if (config.ammoPack) {
        applyPilotAmmoPack();
    } else if (config.weaponId) {
        applyPilotWeaponPickup(config.weaponId);
    }

    const label = config.label || 'PILOT PICKUP';
    const nameText = scene.add.text(powerUp.x, powerUp.y - 20, label, {
        fontSize: '14px',
        fontFamily: 'Orbitron',
        color: '#7dd3fc',
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5);

    scene.tweens.add({
        targets: nameText,
        y: powerUp.y - 48,
        alpha: 0,
        duration: 1200,
        onComplete: () => nameText.destroy()
    });

    powerUp.destroy();
    return true;
}
