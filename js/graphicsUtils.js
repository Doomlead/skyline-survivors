// ------------------------
// Utility Graphics - Power-ups, Humans, Particles, Effects
// ------------------------

function createHumanGraphics(scene) {
    const humanGraphics = scene.add.graphics();
    humanGraphics.fillStyle(0xffccaa, 1);
    humanGraphics.fillCircle(4, 2, 2);
    humanGraphics.fillStyle(0x00ff00, 1);
    humanGraphics.fillRect(2, 4, 4, 5);
    humanGraphics.fillStyle(0x0000ff, 1);
    humanGraphics.fillRect(2, 9, 1.5, 3);
    humanGraphics.fillRect(4.5, 9, 1.5, 3);
    humanGraphics.fillStyle(0xffccaa, 1);
    humanGraphics.fillRect(0, 4, 2, 4);
    humanGraphics.fillRect(6, 4, 2, 4);
    humanGraphics.generateTexture('human', 8, 12);
    humanGraphics.destroy();
}

function createPowerUpGraphics(scene) {
    const powerUpColors = {
        laser:      0x16537e,
        drone:      0xf5578e,
        shield:     0x4a7000,
        missile:    0x716246,
        overdrive:  0x101010,
        rear:       0xa5655f,
        side:       0xa311ff,
        rapid:      0x11ffa3,
        multi:      0xff116d,
        piercing:   0x116dff,
        speed:      0xffa311,
        magnet:     0x2f0d00,
        bomb:       0xFFD700,
        double:     0xA8FF00,
        invincibility: 0xD4D4D4,
        timeSlow:   0x007F6E
    };

    for (let type in powerUpColors) {
        const powerUpGraphics = scene.add.graphics();
        powerUpGraphics.fillStyle(powerUpColors[type], 0.3);
        powerUpGraphics.fillCircle(8, 8, 8);
        powerUpGraphics.fillStyle(powerUpColors[type], 1);
        powerUpGraphics.fillCircle(8, 8, 6);
        powerUpGraphics.fillStyle(0xffffff, 0.4);
        powerUpGraphics.fillCircle(6, 6, 2);
        powerUpGraphics.lineStyle(2, 0xffffff, 0.5);
        powerUpGraphics.strokeCircle(8, 8, 6);
        powerUpGraphics.generateTexture('powerup_' + type, 16, 16);
        powerUpGraphics.destroy();
    }
}

function createUtilityGraphics(scene) {
    const forceDroneGraphics = scene.add.graphics();
    forceDroneGraphics.fillStyle(0x0088ff, 0.5);
    forceDroneGraphics.fillCircle(6, 6, 6);
    forceDroneGraphics.fillStyle(0x0088ff, 1);
    forceDroneGraphics.fillCircle(6, 6, 4);
    forceDroneGraphics.fillStyle(0x88ccff, 1);
    forceDroneGraphics.fillCircle(4, 4, 2);
    forceDroneGraphics.generateTexture('forceDrone', 12, 12);
    forceDroneGraphics.destroy();

    const explosionGraphics = scene.add.graphics();
    explosionGraphics.fillStyle(0xffff00, 1);
    explosionGraphics.fillCircle(4, 4, 4);
    explosionGraphics.generateTexture('explosion', 8, 8);
    explosionGraphics.destroy();

    const shieldEffectGraphics = scene.add.graphics();
    shieldEffectGraphics.lineStyle(2, 0x00ffff, 0.5);
    shieldEffectGraphics.strokeCircle(20, 20, 20);
    shieldEffectGraphics.lineStyle(1, 0x00ffff, 0.3);
    shieldEffectGraphics.strokeCircle(20, 20, 18);
    shieldEffectGraphics.generateTexture('shieldEffect', 40, 40);
    shieldEffectGraphics.destroy();

    const particleGraphics = scene.add.graphics();
    particleGraphics.fillStyle(0xffffff, 1);
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();

    const starGraphics = scene.add.graphics();
    starGraphics.fillStyle(0xffffff, 1);
    starGraphics.fillCircle(2, 2, 2);
    starGraphics.generateTexture('star', 4, 4);
    starGraphics.destroy();
}

function createGraphics(scene) {
    createPlayerGraphics(scene);
    createPlayerProjectileGraphics(scene);

    createEnemyProjectileGraphics(scene);
    createOriginalEnemyGraphics(scene);
    createNewEnemyGraphics(scene);

    createHumanGraphics(scene);
    createPowerUpGraphics(scene);
    createUtilityGraphics(scene);
}