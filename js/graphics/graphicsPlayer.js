// ------------------------
// Player Graphics - Ship and Projectiles
// ------------------------

function createPlayerGraphics(scene) {
    // ========================
    // PLAYER (High-Detail Interceptor)
    // ========================
    const playerGraphics = scene.add.graphics();

    // 1. Rear Engine Block (Dark Grey)
    playerGraphics.fillStyle(0x222233, 1);
    playerGraphics.fillRect(0, 6, 10, 12);
    
    // 2. Engine Thrusters (Orange/Yellow Gradient Effect)
    playerGraphics.fillStyle(0xff4400, 1);
    playerGraphics.fillTriangle(0, 7, -4, 9, 0, 11);
    playerGraphics.fillTriangle(0, 13, -4, 15, 0, 17);
    playerGraphics.fillStyle(0xffff00, 1);
    playerGraphics.fillRect(0, 8, 2, 2);
    playerGraphics.fillRect(0, 14, 2, 2);

    // 3. Bottom Wing/Fuselage (Shadowed Teal)
    playerGraphics.fillStyle(0x005577, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(6, 12);
    playerGraphics.lineTo(34, 14);
    playerGraphics.lineTo(12, 22);
    playerGraphics.lineTo(6, 18);
    playerGraphics.closePath();
    playerGraphics.fillPath();

    // 4. Top Wing/Fuselage (Lit Teal)
    playerGraphics.fillStyle(0x0088aa, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(6, 12);
    playerGraphics.lineTo(34, 14);
    playerGraphics.lineTo(12, 2);
    playerGraphics.lineTo(6, 6);
    playerGraphics.closePath();
    playerGraphics.fillPath();

    // 5. Main Body Detail Stripe (White)
    playerGraphics.fillStyle(0xffffff, 0.8);
    playerGraphics.beginPath();
    playerGraphics.moveTo(10, 12);
    playerGraphics.lineTo(24, 13);
    playerGraphics.lineTo(10, 13);
    playerGraphics.closePath();
    playerGraphics.fillPath();

    // 6. Cockpit (Glowing Glass)
    playerGraphics.fillStyle(0x00ffff, 0.7);
    playerGraphics.beginPath();
    playerGraphics.moveTo(12, 5);
    playerGraphics.lineTo(20, 7);
    playerGraphics.lineTo(20, 10);
    playerGraphics.lineTo(12, 11);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    
    playerGraphics.lineStyle(1, 0x003333, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(12, 5);
    playerGraphics.lineTo(20, 7);
    playerGraphics.lineTo(20, 10);
    playerGraphics.lineTo(12, 11);
    playerGraphics.strokePath();

    playerGraphics.fillStyle(0xffffff, 0.9);
    playerGraphics.fillEllipse(15, 7, 3, 1.5);

    // 7. Weapon Hardpoint
    playerGraphics.fillStyle(0x333333, 1);
    playerGraphics.fillRect(14, 15, 8, 2);
    playerGraphics.fillStyle(0x111111, 1);
    playerGraphics.fillRect(22, 15.5, 2, 1);

    playerGraphics.generateTexture('player', 34, 24);
    playerGraphics.destroy();
}

function createPlayerProjectileGraphics(scene) {
    // ========================
    // PLAYER PROJECTILES
    // ========================

    const projectileGraphics = scene.add.graphics();
    projectileGraphics.fillStyle(0xffaa00, 0.4);
    projectileGraphics.fillEllipse(8, 4, 16, 8);
    projectileGraphics.fillStyle(0xffff00, 1);
    projectileGraphics.fillEllipse(8, 4, 12, 4);
    projectileGraphics.fillStyle(0xffffff, 1);
    projectileGraphics.fillEllipse(10, 4, 6, 2);
    projectileGraphics.fillStyle(0xffcc00, 0.7);
    projectileGraphics.fillCircle(2, 4, 2);
    projectileGraphics.fillStyle(0xff8800, 0.5);
    projectileGraphics.fillCircle(0, 4, 1);
    projectileGraphics.generateTexture('projectile', 16, 8);
    projectileGraphics.destroy();

    const spreadGraphics = scene.add.graphics();
    spreadGraphics.fillStyle(0x00ffff, 0.3);
    spreadGraphics.fillEllipse(7, 4, 14, 8);
    spreadGraphics.fillStyle(0x00ffff, 1);
    spreadGraphics.beginPath();
    spreadGraphics.moveTo(0, 4);
    spreadGraphics.lineTo(7, 1);
    spreadGraphics.lineTo(14, 4);
    spreadGraphics.lineTo(7, 7);
    spreadGraphics.closePath();
    spreadGraphics.fillPath();
    spreadGraphics.fillStyle(0xffffff, 1);
    spreadGraphics.fillEllipse(9, 4, 4, 2);
    spreadGraphics.generateTexture('projectile_spread', 14, 8);
    spreadGraphics.destroy();

    const waveGraphics = scene.add.graphics();
    waveGraphics.fillStyle(0xff00ff, 0.3);
    waveGraphics.fillEllipse(10, 5, 20, 10);
    waveGraphics.lineStyle(3, 0xff00ff, 1);
    waveGraphics.beginPath();
    waveGraphics.moveTo(0, 5);
    waveGraphics.lineTo(5, 2);
    waveGraphics.lineTo(10, 5);
    waveGraphics.lineTo(15, 8);
    waveGraphics.lineTo(20, 5);
    waveGraphics.strokePath();
    waveGraphics.fillStyle(0xff88ff, 1);
    waveGraphics.fillCircle(10, 5, 3);
    waveGraphics.fillStyle(0xffffff, 1);
    waveGraphics.fillCircle(10, 5, 1.5);
    waveGraphics.generateTexture('projectile_wave', 20, 10);
    waveGraphics.destroy();

    const piercingGraphics = scene.add.graphics();
    piercingGraphics.fillStyle(0x0088ff, 0.3);
    piercingGraphics.fillRect(0, 0, 24, 8);
    piercingGraphics.fillStyle(0x00aaff, 1);
    piercingGraphics.fillRect(0, 2, 24, 4);
    piercingGraphics.fillStyle(0x88ddff, 1);
    piercingGraphics.fillRect(2, 3, 20, 2);
    piercingGraphics.fillStyle(0xffffff, 1);
    piercingGraphics.fillRect(20, 3, 4, 2);
    piercingGraphics.lineStyle(1, 0xffffff, 0.5);
    piercingGraphics.strokeRect(4, 1, 2, 6);
    piercingGraphics.strokeRect(10, 1, 2, 6);
    piercingGraphics.strokeRect(16, 1, 2, 6);
    piercingGraphics.generateTexture('projectile_piercing', 24, 8);
    piercingGraphics.destroy();

    const overdriveGraphics = scene.add.graphics();
    overdriveGraphics.fillStyle(0xff4400, 0.4);
    overdriveGraphics.fillEllipse(6, 4, 12, 8);
    overdriveGraphics.fillStyle(0xff6600, 1);
    overdriveGraphics.beginPath();
    overdriveGraphics.moveTo(0, 4);
    overdriveGraphics.lineTo(4, 1);
    overdriveGraphics.lineTo(12, 4);
    overdriveGraphics.lineTo(4, 7);
    overdriveGraphics.closePath();
    overdriveGraphics.fillPath();
    overdriveGraphics.fillStyle(0xffaa00, 1);
    overdriveGraphics.fillEllipse(7, 4, 6, 3);
    overdriveGraphics.fillStyle(0xffff88, 1);
    overdriveGraphics.fillCircle(8, 4, 1.5);
    overdriveGraphics.generateTexture('projectile_overdrive', 12, 8);
    overdriveGraphics.destroy();

    const droneProjectileGraphics = scene.add.graphics();
    droneProjectileGraphics.fillStyle(0x00ff88, 0.3);
    droneProjectileGraphics.fillCircle(5, 5, 5);
    droneProjectileGraphics.fillStyle(0x00ff44, 1);
    droneProjectileGraphics.fillCircle(5, 5, 3);
    droneProjectileGraphics.fillStyle(0xaaffaa, 1);
    droneProjectileGraphics.fillCircle(5, 5, 1.5);
    droneProjectileGraphics.generateTexture('projectile_drone', 10, 10);
    droneProjectileGraphics.destroy();

    const sideGraphics = scene.add.graphics();
    sideGraphics.fillStyle(0x00ffaa, 0.3);
    sideGraphics.fillEllipse(4, 6, 8, 12);
    sideGraphics.fillStyle(0x00ffaa, 1);
    sideGraphics.fillEllipse(4, 6, 4, 10);
    sideGraphics.fillStyle(0xaaffff, 1);
    sideGraphics.fillEllipse(4, 6, 2, 6);
    sideGraphics.generateTexture('projectile_side', 8, 12);
    sideGraphics.destroy();

    const multiGraphics = scene.add.graphics();
    multiGraphics.fillStyle(0xffff00, 0.4);
    multiGraphics.fillCircle(4, 4, 4);
    multiGraphics.fillStyle(0xffff44, 1);
    multiGraphics.fillCircle(4, 4, 3);
    multiGraphics.fillStyle(0xffffff, 1);
    multiGraphics.fillCircle(4, 4, 1.5);
    multiGraphics.generateTexture('projectile_multi', 8, 8);
    multiGraphics.destroy();

    const missileGraphics = scene.add.graphics();
    missileGraphics.fillStyle(0xff4400, 0.6);
    missileGraphics.fillTriangle(0, 5, 4, 3, 4, 7);
    missileGraphics.fillStyle(0xffff00, 0.8);
    missileGraphics.fillTriangle(0, 5, 3, 4, 3, 6);
    missileGraphics.fillStyle(0x888888, 1);
    missileGraphics.fillRect(4, 2, 12, 6);
    missileGraphics.fillStyle(0xff0000, 1);
    missileGraphics.beginPath();
    missileGraphics.moveTo(16, 2);
    missileGraphics.lineTo(20, 5);
    missileGraphics.lineTo(16, 8);
    missileGraphics.closePath();
    missileGraphics.fillPath();
    missileGraphics.fillStyle(0x666666, 1);
    missileGraphics.fillTriangle(4, 2, 7, 2, 7, 0);
    missileGraphics.fillTriangle(4, 8, 7, 8, 7, 10);
    missileGraphics.fillStyle(0x00ffff, 1);
    missileGraphics.fillCircle(12, 5, 1.5);
    missileGraphics.fillStyle(0xffff00, 1);
    missileGraphics.fillRect(8, 3, 2, 4);
    missileGraphics.generateTexture('missile', 20, 10);
    missileGraphics.destroy();
}