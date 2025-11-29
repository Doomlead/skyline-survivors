// ------------------------
// Enemy Graphics - All Enemy Sprites and Projectiles
// ------------------------

function createEnemyProjectileGraphics(scene) {
    // ========================
    // ENEMY PROJECTILES - ALL RED VARIANTS
    // ========================

    // Generic enemy projectile - Red energy bolt
    const enemyProjGraphics = scene.add.graphics();
    enemyProjGraphics.fillStyle(0xff0000, 0.4);
    enemyProjGraphics.fillEllipse(6, 4, 12, 8);
    enemyProjGraphics.fillStyle(0xff0000, 1);
    enemyProjGraphics.fillEllipse(6, 4, 8, 4);
    enemyProjGraphics.fillStyle(0xff8888, 1);
    enemyProjGraphics.fillEllipse(7, 4, 4, 2);
    enemyProjGraphics.fillStyle(0xffaaaa, 1);
    enemyProjGraphics.fillCircle(9, 4, 1);
    enemyProjGraphics.generateTexture('enemyProjectile', 12, 8);
    enemyProjGraphics.destroy();

    // Lander projectile - Red plasma ball
    const landerProjGraphics = scene.add.graphics();
    landerProjGraphics.fillStyle(0xff0000, 0.3);
    landerProjGraphics.fillCircle(5, 5, 5);
    landerProjGraphics.fillStyle(0xff0000, 1);
    landerProjGraphics.fillCircle(5, 5, 3);
    landerProjGraphics.fillStyle(0xff8888, 1);
    landerProjGraphics.fillCircle(5, 5, 1.5);
    landerProjGraphics.generateTexture('enemyProjectile_lander', 10, 10);
    landerProjGraphics.destroy();

    // Mutant projectile - Dark red spiky energy
    const mutantProjGraphics = scene.add.graphics();
    mutantProjGraphics.fillStyle(0xaa0000, 0.4);
    mutantProjGraphics.fillCircle(6, 6, 6);
    mutantProjGraphics.fillStyle(0xcc0000, 1);
    mutantProjGraphics.beginPath();
    mutantProjGraphics.moveTo(6, 0);
    mutantProjGraphics.lineTo(8, 4);
    mutantProjGraphics.lineTo(12, 6);
    mutantProjGraphics.lineTo(8, 8);
    mutantProjGraphics.lineTo(6, 12);
    mutantProjGraphics.lineTo(4, 8);
    mutantProjGraphics.lineTo(0, 6);
    mutantProjGraphics.lineTo(4, 4);
    mutantProjGraphics.closePath();
    mutantProjGraphics.fillPath();
    mutantProjGraphics.fillStyle(0xff4444, 1);
    mutantProjGraphics.fillCircle(6, 6, 2);
    mutantProjGraphics.generateTexture('enemyProjectile_mutant', 12, 12);
    mutantProjGraphics.destroy();

    // Drone projectile - Bright red pulse
    const droneProjGraphics = scene.add.graphics();
    droneProjGraphics.lineStyle(2, 0xff0000, 0.3);
    droneProjGraphics.strokeCircle(5, 5, 5);
    droneProjGraphics.lineStyle(1, 0xff4444, 0.5);
    droneProjGraphics.strokeCircle(5, 5, 3);
    droneProjGraphics.fillStyle(0xff0000, 1);
    droneProjGraphics.fillCircle(5, 5, 2);
    droneProjGraphics.fillStyle(0xffaaaa, 1);
    droneProjGraphics.fillCircle(5, 5, 1);
    droneProjGraphics.generateTexture('enemyProjectile_drone', 10, 10);
    droneProjGraphics.destroy();

    // Bomber projectile - Red/orange bomb
    const bomberProjGraphics = scene.add.graphics();
    bomberProjGraphics.fillStyle(0xff0000, 0.4);
    bomberProjGraphics.fillCircle(6, 6, 6);
    bomberProjGraphics.fillStyle(0x880000, 1);
    bomberProjGraphics.fillCircle(6, 6, 5);
    bomberProjGraphics.fillStyle(0xaa0000, 1);
    bomberProjGraphics.fillCircle(4, 4, 2);
    bomberProjGraphics.fillStyle(0xff0000, 1);
    bomberProjGraphics.fillCircle(6, 1, 2);
    bomberProjGraphics.fillStyle(0xffff00, 1);
    bomberProjGraphics.fillCircle(6, 1, 1);
    bomberProjGraphics.generateTexture('enemyProjectile_bomber', 12, 12);
    bomberProjGraphics.destroy();

    // Pod projectile - Dark red energy orb
    const podProjGraphics = scene.add.graphics();
    podProjGraphics.fillStyle(0xff0000, 0.3);
    podProjGraphics.fillCircle(5, 5, 5);
    podProjGraphics.lineStyle(1, 0xff4444, 0.7);
    podProjGraphics.beginPath();
    podProjGraphics.arc(5, 5, 3, 0, Math.PI * 1.5);
    podProjGraphics.strokePath();
    podProjGraphics.fillStyle(0xdd0000, 1);
    podProjGraphics.fillCircle(5, 5, 2.5);
    podProjGraphics.fillStyle(0xff8888, 1);
    podProjGraphics.fillCircle(5, 5, 1);
    podProjGraphics.generateTexture('enemyProjectile_pod', 10, 10);
    podProjGraphics.destroy();

    // Swarmer projectile - Small red dart
    const swarmerProjGraphics = scene.add.graphics();
    swarmerProjGraphics.fillStyle(0xff0000, 0.4);
    swarmerProjGraphics.fillEllipse(4, 3, 8, 6);
    swarmerProjGraphics.fillStyle(0xff0000, 1);
    swarmerProjGraphics.beginPath();
    swarmerProjGraphics.moveTo(0, 3);
    swarmerProjGraphics.lineTo(8, 0);
    swarmerProjGraphics.lineTo(8, 6);
    swarmerProjGraphics.closePath();
    swarmerProjGraphics.fillPath();
    swarmerProjGraphics.fillStyle(0xffaaaa, 1);
    swarmerProjGraphics.fillCircle(7, 3, 1);
    swarmerProjGraphics.generateTexture('enemyProjectile_swarmer', 8, 6);
    swarmerProjGraphics.destroy();

    // Baiter projectile - Fast red streak
    const baiterProjGraphics = scene.add.graphics();
    baiterProjGraphics.fillStyle(0xff0000, 0.2);
    baiterProjGraphics.fillRect(0, 2, 12, 4);
    baiterProjGraphics.fillStyle(0xff0000, 0.4);
    baiterProjGraphics.fillRect(4, 2, 10, 4);
    baiterProjGraphics.fillStyle(0xff0000, 1);
    baiterProjGraphics.fillRect(8, 2, 6, 4);
    baiterProjGraphics.fillStyle(0xff8888, 1);
    baiterProjGraphics.fillRect(12, 3, 2, 2);
    baiterProjGraphics.generateTexture('enemyProjectile_baiter', 14, 8);
    baiterProjGraphics.destroy();

    // Mine projectile - Spinning danger orb
    const mineGraphics = scene.add.graphics();
    mineGraphics.fillStyle(0xff0000, 0.3);
    mineGraphics.fillCircle(8, 8, 8);
    mineGraphics.lineStyle(2, 0xff4444, 1);
    mineGraphics.strokeCircle(8, 8, 6);
    mineGraphics.fillStyle(0x333333, 1);
    mineGraphics.fillCircle(8, 8, 5);
    mineGraphics.fillStyle(0xff0000, 1);
    mineGraphics.fillTriangle(8, 0, 6, 4, 10, 4);
    mineGraphics.fillTriangle(16, 8, 12, 6, 12, 10);
    mineGraphics.fillTriangle(8, 16, 6, 12, 10, 12);
    mineGraphics.fillTriangle(0, 8, 4, 6, 4, 10);
    mineGraphics.fillStyle(0xffff00, 1);
    mineGraphics.fillCircle(8, 8, 2);
    mineGraphics.generateTexture('mine', 16, 16);
    mineGraphics.destroy();
}

function createOriginalEnemyGraphics(scene) {
    // ========================
    // ORIGINAL ENEMY SPRITES
    // ========================

    // Lander - Classic UFO abductor
    const landerGraphics = scene.add.graphics();
    landerGraphics.fillStyle(0xff4444, 1);
    landerGraphics.fillEllipse(6, 8, 12, 6);
    landerGraphics.fillStyle(0xff6666, 1);
    landerGraphics.fillEllipse(6, 4, 8, 6);
    landerGraphics.fillStyle(0xff4444, 1);
    landerGraphics.fillRect(2, 10, 1, 2);
    landerGraphics.fillRect(9, 10, 1, 2);
    landerGraphics.generateTexture('lander', 12, 12);
    landerGraphics.destroy();

    // Mutant - Transformed human alien
    const mutantGraphics = scene.add.graphics();
    // Alien humanoid head - elongated skull
    mutantGraphics.fillStyle(0xffaa66, 1);
    mutantGraphics.fillEllipse(6, 2.5, 4.5, 3.5);
    // Eyes - glowing yellow with black pupils
    mutantGraphics.fillStyle(0xffffff, 1);
    mutantGraphics.fillCircle(4.2, 2, 0.8);
    mutantGraphics.fillCircle(7.8, 2, 0.8);
    mutantGraphics.fillStyle(0xffff00, 0.8);
    mutantGraphics.fillCircle(4.2, 2, 0.6);
    mutantGraphics.fillCircle(7.8, 2, 0.6);
    mutantGraphics.fillStyle(0x000000, 1);
    mutantGraphics.fillCircle(4.2, 2, 0.3);
    mutantGraphics.fillCircle(7.8, 2, 0.3);
    // Small alien mouth
    mutantGraphics.fillStyle(0xcc5555, 1);
    mutantGraphics.fillTriangle(5.5, 3.5, 6.5, 3.5, 6, 4);
    // Antennae
    mutantGraphics.lineStyle(1, 0xcc6622, 1);
    mutantGraphics.beginPath();
    mutantGraphics.moveTo(3.5, 0.5);
    mutantGraphics.lineTo(2.5, 0);
    mutantGraphics.lineTo(3, -0.5);
    mutantGraphics.strokePath();
    mutantGraphics.beginPath();
    mutantGraphics.moveTo(8.5, 0.5);
    mutantGraphics.lineTo(9.5, 0);
    mutantGraphics.lineTo(9, -0.5);
    mutantGraphics.strokePath();
    // Torso - muscular alien build
    mutantGraphics.fillStyle(0xff8844, 1);
    mutantGraphics.fillEllipse(6, 6, 4, 3);
    // Arms
    mutantGraphics.fillStyle(0xffaa66, 0.9);
    mutantGraphics.fillTriangle(3, 5.5, 4.5, 4.5, 4.5, 7);
    mutantGraphics.fillTriangle(9, 5.5, 7.5, 4.5, 7.5, 7);
    // Legs
    mutantGraphics.fillStyle(0xff7744, 1);
    mutantGraphics.fillRect(4.8, 8.5, 1.2, 2.5);
    mutantGraphics.fillRect(6.2, 8.5, 1.2, 2.5);
    // Feet claws
    mutantGraphics.fillTriangle(4.5, 11, 5.2, 10.5, 5.5, 11);
    mutantGraphics.fillTriangle(6.8, 11, 6.5, 10.5, 7.2, 11);
    // Tail spike
    mutantGraphics.fillStyle(0xcc5522, 1);
    mutantGraphics.beginPath();
    mutantGraphics.moveTo(6, 9);
    mutantGraphics.lineTo(8, 11.5);
    mutantGraphics.lineTo(7, 10);
    mutantGraphics.closePath();
    mutantGraphics.fillPath();
    mutantGraphics.generateTexture('mutant', 12, 12);
    mutantGraphics.destroy();

    // Drone - Simple patrol orb
    const droneGraphics = scene.add.graphics();
    droneGraphics.fillStyle(0xff44ff, 1);
    droneGraphics.fillCircle(5, 5, 5);
    droneGraphics.fillStyle(0xff88ff, 0.6);
    droneGraphics.fillCircle(3, 3, 2);
    droneGraphics.generateTexture('drone', 10, 10);
    droneGraphics.destroy();

    // Bomber - Heavy ordnance dropper
    const bomberGraphics = scene.add.graphics();
    bomberGraphics.fillStyle(0xff0000, 1);
    bomberGraphics.fillEllipse(8, 6, 12, 8);
    bomberGraphics.fillStyle(0xcc0000, 1);
    bomberGraphics.fillTriangle(0, 6, 4, 2, 4, 10);
    bomberGraphics.fillTriangle(16, 6, 12, 2, 12, 10);
    bomberGraphics.fillStyle(0x660000, 1);
    bomberGraphics.fillCircle(8, 5, 2);
    bomberGraphics.fillStyle(0xffff00, 1);
    bomberGraphics.fillRect(7, 9, 2, 2);
    bomberGraphics.generateTexture('bomber', 16, 12);
    bomberGraphics.destroy();

    // Swarmer - Small fast attacker
    const swarmerGraphics = scene.add.graphics();
    swarmerGraphics.fillStyle(0x00ff00, 1);
    swarmerGraphics.fillCircle(4, 4, 4);
    swarmerGraphics.fillStyle(0x88ff88, 0.6);
    swarmerGraphics.fillCircle(3, 3, 1.5);
    swarmerGraphics.generateTexture('swarmer', 8, 8);
    swarmerGraphics.destroy();

    // Pod - Swarmer container
    const podGraphics = scene.add.graphics();
    podGraphics.fillStyle(0xaa00ff, 1);
    podGraphics.fillEllipse(10, 10, 18, 18);
    podGraphics.fillStyle(0x8800cc, 1);
    podGraphics.fillEllipse(10, 10, 12, 12);
    podGraphics.lineStyle(2, 0x6600aa, 1);
    podGraphics.beginPath();
    podGraphics.moveTo(10, 1);
    podGraphics.lineTo(10, 19);
    podGraphics.strokePath();
    podGraphics.beginPath();
    podGraphics.moveTo(1, 10);
    podGraphics.lineTo(19, 10);
    podGraphics.strokePath();
    podGraphics.fillStyle(0x00ff00, 0.6);
    podGraphics.fillCircle(7, 7, 2);
    podGraphics.fillCircle(13, 7, 2);
    podGraphics.fillCircle(10, 13, 2);
    podGraphics.generateTexture('pod', 20, 20);
    podGraphics.destroy();

    // Baiter - Fast aggressive chaser
    const baiterGraphics = scene.add.graphics();
    baiterGraphics.fillStyle(0xff00ff, 1);
    baiterGraphics.fillTriangle(0, 6, 15, 0, 15, 12);
    baiterGraphics.fillStyle(0xff88ff, 0.5);
    baiterGraphics.fillTriangle(3, 6, 12, 2, 12, 10);
    baiterGraphics.generateTexture('baiter', 15, 12);
    baiterGraphics.destroy();
}

function createNewEnemyGraphics(scene) {
    // ========================
    // NEW ENEMY SPRITES (10 new types)
    // ========================

    // KAMIKAZE - Fast suicide bomber with flame trail
    const kamikazeGraphics = scene.add.graphics();
    // Flame trail
    kamikazeGraphics.fillStyle(0xff4400, 0.6);
    kamikazeGraphics.fillTriangle(0, 6, 5, 4, 5, 8);
    kamikazeGraphics.fillStyle(0xffff00, 0.8);
    kamikazeGraphics.fillTriangle(2, 6, 5, 5, 5, 7);
    // Body - angry red missile shape
    kamikazeGraphics.fillStyle(0xff0000, 1);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(5, 3);
    kamikazeGraphics.lineTo(16, 6);
    kamikazeGraphics.lineTo(5, 9);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();
    // Warning stripes
    kamikazeGraphics.fillStyle(0xffff00, 1);
    kamikazeGraphics.fillRect(7, 4, 2, 4);
    kamikazeGraphics.fillRect(11, 4, 2, 4);
    // Angry eye
    kamikazeGraphics.fillStyle(0xffffff, 1);
    kamikazeGraphics.fillCircle(14, 6, 1.5);
    kamikazeGraphics.fillStyle(0x000000, 1);
    kamikazeGraphics.fillCircle(14.5, 6, 0.8);
    kamikazeGraphics.generateTexture('kamikaze', 18, 12);
    kamikazeGraphics.destroy();

    // TURRET - Stationary multi-directional shooter
    const turretGraphics = scene.add.graphics();
    // Base platform
    turretGraphics.fillStyle(0x444444, 1);
    turretGraphics.fillRect(2, 10, 12, 4);
    // Main turret body
    turretGraphics.fillStyle(0x666666, 1);
    turretGraphics.fillCircle(8, 8, 6);
    // Gun barrels (4 directions)
    turretGraphics.fillStyle(0x888888, 1);
    turretGraphics.fillRect(6, 0, 4, 4); // Top
    turretGraphics.fillRect(6, 12, 4, 4); // Bottom
    turretGraphics.fillRect(0, 6, 4, 4); // Left
    turretGraphics.fillRect(12, 6, 4, 4); // Right
    // Center sensor
    turretGraphics.fillStyle(0xff0000, 1);
    turretGraphics.fillCircle(8, 8, 2);
    turretGraphics.fillStyle(0xff8888, 0.6);
    turretGraphics.fillCircle(7, 7, 1);
    turretGraphics.generateTexture('turret', 16, 16);
    turretGraphics.destroy();

    // SHIELD - Tanky enemy with protective barrier
    const shieldGraphics = scene.add.graphics();
    // Outer shield ring
    shieldGraphics.lineStyle(3, 0x00ffff, 0.7);
    shieldGraphics.strokeCircle(10, 10, 9);
    // Inner shield glow
    shieldGraphics.fillStyle(0x00ffff, 0.2);
    shieldGraphics.fillCircle(10, 10, 8);
    // Core body
    shieldGraphics.fillStyle(0x0088aa, 1);
    shieldGraphics.fillCircle(10, 10, 5);
    // Central eye
    shieldGraphics.fillStyle(0xffffff, 1);
    shieldGraphics.fillCircle(10, 10, 2);
    shieldGraphics.fillStyle(0x00ffff, 1);
    shieldGraphics.fillCircle(10, 10, 1);
    // Shield generators (hexagonal points)
    shieldGraphics.fillStyle(0x00ffff, 1);
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = 10 + Math.cos(angle) * 7;
        const y = 10 + Math.sin(angle) * 7;
        shieldGraphics.fillCircle(x, y, 1.5);
    }
    shieldGraphics.generateTexture('shield', 20, 20);
    shieldGraphics.destroy();

    // SEEKER - Predictive targeting enemy
    const seekerGraphics = scene.add.graphics();
    // Scanning dish
    seekerGraphics.fillStyle(0x8844ff, 0.5);
    seekerGraphics.fillTriangle(0, 6, 8, 0, 8, 12);
    // Main body
    seekerGraphics.fillStyle(0x6622cc, 1);
    seekerGraphics.fillEllipse(10, 6, 10, 8);
    // Targeting sensor array
    seekerGraphics.fillStyle(0xaa66ff, 1);
    seekerGraphics.fillRect(12, 4, 4, 4);
    // Multiple eyes (tracking)
    seekerGraphics.fillStyle(0xff0000, 1);
    seekerGraphics.fillCircle(7, 4, 1.5);
    seekerGraphics.fillCircle(7, 8, 1.5);
    seekerGraphics.fillCircle(11, 6, 1.5);
    // Glow effect
    seekerGraphics.fillStyle(0xffffff, 0.5);
    seekerGraphics.fillCircle(7, 4, 0.8);
    seekerGraphics.fillCircle(7, 8, 0.8);
    seekerGraphics.fillCircle(11, 6, 0.8);
    seekerGraphics.generateTexture('seeker', 16, 12);
    seekerGraphics.destroy();

    // SPAWNER - Enemy that creates minions
    const spawnerGraphics = scene.add.graphics();
    // Main body - organic looking pod
    spawnerGraphics.fillStyle(0xccaa00, 1);
    spawnerGraphics.fillEllipse(10, 10, 16, 14);
    // Pulsing membrane
    spawnerGraphics.fillStyle(0xffcc00, 0.6);
    spawnerGraphics.fillEllipse(10, 10, 12, 10);
    // Spawn ports (where minions emerge)
    spawnerGraphics.fillStyle(0x886600, 1);
    spawnerGraphics.fillCircle(4, 8, 2);
    spawnerGraphics.fillCircle(16, 8, 2);
    spawnerGraphics.fillCircle(10, 4, 2);
    spawnerGraphics.fillCircle(10, 16, 2);
    // Internal eggs/minions visible
    spawnerGraphics.fillStyle(0x00ff00, 0.5);
    spawnerGraphics.fillCircle(8, 9, 2);
    spawnerGraphics.fillCircle(12, 11, 2);
    spawnerGraphics.fillCircle(10, 8, 1.5);
    // Central control node
    spawnerGraphics.fillStyle(0xff8800, 1);
    spawnerGraphics.fillCircle(10, 10, 2);
    spawnerGraphics.generateTexture('spawner', 20, 20);
    spawnerGraphics.destroy();

    // SHIELDER - Protects other enemies
    const shielderGraphics = scene.add.graphics();
    // Shield projection field
    shielderGraphics.lineStyle(2, 0x00ff00, 0.4);
    shielderGraphics.strokeCircle(10, 10, 10);
    shielderGraphics.lineStyle(1, 0x88ff88, 0.3);
    shielderGraphics.strokeCircle(10, 10, 12);
    // Body - angular protector shape
    shielderGraphics.fillStyle(0x00aa00, 1);
    shielderGraphics.beginPath();
    shielderGraphics.moveTo(10, 2);
    shielderGraphics.lineTo(18, 10);
    shielderGraphics.lineTo(10, 18);
    shielderGraphics.lineTo(2, 10);
    shielderGraphics.closePath();
    shielderGraphics.fillPath();
    // Inner core
    shielderGraphics.fillStyle(0x44ff44, 1);
    shielderGraphics.fillCircle(10, 10, 4);
    // Energy nodes
    shielderGraphics.fillStyle(0xffffff, 1);
    shielderGraphics.fillCircle(10, 4, 1.5);
    shielderGraphics.fillCircle(16, 10, 1.5);
    shielderGraphics.fillCircle(10, 16, 1.5);
    shielderGraphics.fillCircle(4, 10, 1.5);
    // Central eye
    shielderGraphics.fillStyle(0x00ff00, 1);
    shielderGraphics.fillCircle(10, 10, 2);
    shielderGraphics.generateTexture('shielder', 20, 20);
    shielderGraphics.destroy();

    // BOUNCER - Erratic ricochet movement
    const bouncerGraphics = scene.add.graphics();
    // Motion blur trail effect
    bouncerGraphics.fillStyle(0xff6600, 0.3);
    bouncerGraphics.fillCircle(4, 7, 4);
    bouncerGraphics.fillStyle(0xff6600, 0.5);
    bouncerGraphics.fillCircle(6, 7, 5);
    // Main body - rubber ball appearance
    bouncerGraphics.fillStyle(0xff6600, 1);
    bouncerGraphics.fillCircle(10, 7, 6);
    // Highlight (shiny)
    bouncerGraphics.fillStyle(0xffaa44, 1);
    bouncerGraphics.fillCircle(8, 5, 2);
    bouncerGraphics.fillStyle(0xffffff, 0.8);
    bouncerGraphics.fillCircle(7, 4, 1);
    // Speed lines
    bouncerGraphics.lineStyle(1, 0xffcc88, 0.6);
    bouncerGraphics.beginPath();
    bouncerGraphics.moveTo(0, 5);
    bouncerGraphics.lineTo(4, 6);
    bouncerGraphics.strokePath();
    bouncerGraphics.beginPath();
    bouncerGraphics.moveTo(0, 9);
    bouncerGraphics.lineTo(4, 8);
    bouncerGraphics.strokePath();
    // Angry expression
    bouncerGraphics.fillStyle(0x000000, 1);
    bouncerGraphics.fillCircle(9, 6, 1);
    bouncerGraphics.fillCircle(12, 6, 1);
    bouncerGraphics.lineStyle(1, 0x000000, 1);
    bouncerGraphics.beginPath();
    bouncerGraphics.moveTo(8, 9);
    bouncerGraphics.lineTo(12, 9);
    bouncerGraphics.strokePath();
    bouncerGraphics.generateTexture('bouncer', 16, 14);
    bouncerGraphics.destroy();

    // SNIPER - Long-range precision shooter
    const sniperGraphics = scene.add.graphics();
    // Long barrel
    sniperGraphics.fillStyle(0x333333, 1);
    sniperGraphics.fillRect(0, 5, 18, 4);
    // Barrel tip
    sniperGraphics.fillStyle(0x555555, 1);
    sniperGraphics.fillRect(18, 4, 4, 6);
    // Main body
    sniperGraphics.fillStyle(0x444444, 1);
    sniperGraphics.fillEllipse(8, 7, 10, 8);
    // Scope
    sniperGraphics.fillStyle(0x222222, 1);
    sniperGraphics.fillRect(4, 0, 8, 3);
    sniperGraphics.fillStyle(0xff0000, 0.8);
    sniperGraphics.fillCircle(8, 1.5, 1.5);
    // Targeting laser
    sniperGraphics.lineStyle(1, 0xff0000, 0.5);
    sniperGraphics.beginPath();
    sniperGraphics.moveTo(22, 7);
    sniperGraphics.lineTo(28, 7);
    sniperGraphics.strokePath();
    // Stabilizer fins
    sniperGraphics.fillStyle(0x555555, 1);
    sniperGraphics.fillTriangle(2, 0, 2, 5, 6, 5);
    sniperGraphics.fillTriangle(2, 14, 2, 9, 6, 9);
    sniperGraphics.generateTexture('sniper', 28, 14);
    sniperGraphics.destroy();

    // SWARM LEADER - Buffs nearby enemies
    const swarmLeaderGraphics = scene.add.graphics();
    // Command aura
    swarmLeaderGraphics.lineStyle(2, 0x6600ff, 0.3);
    swarmLeaderGraphics.strokeCircle(10, 10, 10);
    swarmLeaderGraphics.lineStyle(1, 0xaa44ff, 0.2);
    swarmLeaderGraphics.strokeCircle(10, 10, 12);
    // Crown/antenna array
    swarmLeaderGraphics.fillStyle(0xffcc00, 1);
    swarmLeaderGraphics.fillTriangle(6, 0, 8, 4, 4, 4);
    swarmLeaderGraphics.fillTriangle(10, 0, 12, 4, 8, 4);
    swarmLeaderGraphics.fillTriangle(14, 0, 16, 4, 12, 4);
    // Main body
    swarmLeaderGraphics.fillStyle(0x6600ff, 1);
    swarmLeaderGraphics.fillEllipse(10, 10, 14, 12);
    // Inner body
    swarmLeaderGraphics.fillStyle(0x8833ff, 1);
    swarmLeaderGraphics.fillEllipse(10, 10, 10, 8);
    // Command center eye
    swarmLeaderGraphics.fillStyle(0xffffff, 1);
    swarmLeaderGraphics.fillCircle(10, 9, 3);
    swarmLeaderGraphics.fillStyle(0xffcc00, 1);
    swarmLeaderGraphics.fillCircle(10, 9, 2);
    swarmLeaderGraphics.fillStyle(0x000000, 1);
    swarmLeaderGraphics.fillCircle(10, 9, 1);
    // Buff emanation points
    swarmLeaderGraphics.fillStyle(0xffff00, 0.8);
    swarmLeaderGraphics.fillCircle(4, 10, 1.5);
    swarmLeaderGraphics.fillCircle(16, 10, 1.5);
    swarmLeaderGraphics.fillCircle(10, 16, 1.5);
    swarmLeaderGraphics.generateTexture('swarmLeader', 20, 20);
    swarmLeaderGraphics.destroy();

    // REGENERATOR - Self-healing enemy
    const regeneratorGraphics = scene.add.graphics();
    // Healing aura
    regeneratorGraphics.fillStyle(0x00ff44, 0.2);
    regeneratorGraphics.fillCircle(10, 10, 10);
    // Organic membrane
    regeneratorGraphics.fillStyle(0x00aa44, 1);
    regeneratorGraphics.fillEllipse(10, 10, 16, 14);
    // Regenerating tissue pattern
    regeneratorGraphics.fillStyle(0x00cc55, 0.7);
    regeneratorGraphics.fillEllipse(6, 8, 4, 6);
    regeneratorGraphics.fillEllipse(14, 8, 4, 6);
    regeneratorGraphics.fillEllipse(10, 14, 6, 4);
    // Core nucleus
    regeneratorGraphics.fillStyle(0x00ff66, 1);
    regeneratorGraphics.fillCircle(10, 10, 4);
    // Healing particles
    regeneratorGraphics.fillStyle(0xaaffaa, 1);
    regeneratorGraphics.fillCircle(5, 5, 1);
    regeneratorGraphics.fillCircle(15, 5, 1);
    regeneratorGraphics.fillCircle(3, 12, 1);
    regeneratorGraphics.fillCircle(17, 12, 1);
    // Central core
    regeneratorGraphics.fillStyle(0xffffff, 1);
    regeneratorGraphics.fillCircle(10, 10, 2);
    regeneratorGraphics.fillStyle(0x00ff00, 1);
    regeneratorGraphics.fillCircle(10, 10, 1);
    regeneratorGraphics.generateTexture('regenerator', 20, 20);
    regeneratorGraphics.destroy();
}
