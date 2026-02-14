// ------------------------
// Enemy Projectile Graphics - All Enemy Projectile Textures
// ------------------------

function createEnemyProjectileGraphics(scene) { // Create enemy projectile graphics.
    // Helper constant for colors to ensure consistency
    const C_RED_GLOW = 0xff0000;
    const C_RED_DARK = 0x880000;
    const C_RED_BRIGHT = 0xff4444;
    const C_ORANGE_HEAT = 0xffaa00;
    const C_CORE_WHITE = 0xffffff;

    // ========================
    // 1. GENERIC ENEMY PROJECTILE (Plasma Bolt)
    // ========================
    const enemyProjGraphics = scene.add.graphics();
    const gw = 20, gh = 12;
    const gcy = gh / 2;

    // Outer bloom
    enemyProjGraphics.fillStyle(C_RED_GLOW, 0.15);
    enemyProjGraphics.fillEllipse(10, gcy, 20, 12);

    // Inner glow
    enemyProjGraphics.fillStyle(C_RED_GLOW, 0.4);
    enemyProjGraphics.fillEllipse(10, gcy, 14, 8);

    // Plasma Core (Teardrop shape)
    enemyProjGraphics.fillStyle(C_RED_BRIGHT, 1);
    enemyProjGraphics.beginPath();
    enemyProjGraphics.moveTo(16, gcy);    // Front tip
    enemyProjGraphics.lineTo(8, gcy - 3); // Top curve
    enemyProjGraphics.lineTo(4, gcy);     // Back
    enemyProjGraphics.lineTo(8, gcy + 3); // Bottom curve
    enemyProjGraphics.closePath();
    enemyProjGraphics.fillPath();

    // Hot Center
    enemyProjGraphics.fillStyle(C_ORANGE_HEAT, 1);
    enemyProjGraphics.fillEllipse(12, gcy, 6, 3);

    // White Intensity
    enemyProjGraphics.fillStyle(C_CORE_WHITE, 1);
    enemyProjGraphics.fillCircle(14, gcy, 1.5);

    enemyProjGraphics.generateTexture('enemyProjectile', gw, gh);
    enemyProjGraphics.destroy();


    // ========================
    // 2. LANDER PROJECTILE (Unstable Plasma Orb)
    // ========================
    const landerProjGraphics = scene.add.graphics();
    const lw = 16, lh = 16;
    const lcx = lw / 2, lcy = lh / 2;

    // Atmosphere
    landerProjGraphics.fillStyle(C_RED_GLOW, 0.2);
    landerProjGraphics.fillCircle(lcx, lcy, 8);

    // Dark Shell
    landerProjGraphics.fillStyle(0x550000, 1);
    landerProjGraphics.fillCircle(lcx, lcy, 6);

    // Magma cracks (random-looking geometric cutouts)
    landerProjGraphics.fillStyle(C_ORANGE_HEAT, 1);
    landerProjGraphics.beginPath();
    landerProjGraphics.moveTo(lcx, lcy - 6);
    landerProjGraphics.lineTo(lcx + 2, lcy);
    landerProjGraphics.lineTo(lcx, lcy + 6);
    landerProjGraphics.lineTo(lcx - 2, lcy);
    landerProjGraphics.closePath();
    landerProjGraphics.fillPath();

    landerProjGraphics.beginPath();
    landerProjGraphics.moveTo(lcx - 6, lcy);
    landerProjGraphics.lineTo(lcx, lcy - 2);
    landerProjGraphics.lineTo(lcx + 6, lcy);
    landerProjGraphics.lineTo(lcx, lcy + 2);
    landerProjGraphics.closePath();
    landerProjGraphics.fillPath();

    // Core Hotspot
    landerProjGraphics.fillStyle(C_CORE_WHITE, 0.9);
    landerProjGraphics.fillCircle(lcx, lcy, 2);

    // Instability sparks
    landerProjGraphics.fillStyle(C_RED_BRIGHT, 0.8);
    landerProjGraphics.fillCircle(lcx - 3, lcy - 3, 1);
    landerProjGraphics.fillCircle(lcx + 3, lcy + 3, 1);

    landerProjGraphics.generateTexture('enemyProjectile_lander', lw, lh);
    landerProjGraphics.destroy();


    // ========================
    // 3. MUTANT PROJECTILE (Bio-Spike)
    // ========================
    const mutantProjGraphics = scene.add.graphics();
    const mw = 16, mh = 16;
    const mcx = mw / 2, mcy = mh / 2;

    // Toxic Glow
    mutantProjGraphics.fillStyle(0xaa0000, 0.2);
    mutantProjGraphics.fillCircle(mcx, mcy, 8);

    // Central Mass (Blood red)
    mutantProjGraphics.fillStyle(0x880000, 1);
    mutantProjGraphics.fillCircle(mcx, mcy, 5);

    // Spikes (Star shape)
    mutantProjGraphics.fillStyle(0xcc0000, 1);
    mutantProjGraphics.beginPath();
    // 4 long spikes
    mutantProjGraphics.moveTo(mcx, mcy - 8);
    mutantProjGraphics.lineTo(mcx + 2, mcy - 2);
    mutantProjGraphics.lineTo(mcx + 8, mcy);
    mutantProjGraphics.lineTo(mcx + 2, mcy + 2);
    mutantProjGraphics.lineTo(mcx, mcy + 8);
    mutantProjGraphics.lineTo(mcx - 2, mcy + 2);
    mutantProjGraphics.lineTo(mcx - 8, mcy);
    mutantProjGraphics.lineTo(mcx - 2, mcy - 2);
    mutantProjGraphics.closePath();
    mutantProjGraphics.fillPath();

    // Veins/Highlight
    mutantProjGraphics.fillStyle(0xff4444, 1);
    mutantProjGraphics.fillCircle(mcx, mcy, 2.5);
    mutantProjGraphics.fillStyle(0xffaaaa, 1);
    mutantProjGraphics.fillCircle(mcx - 1, mcy - 1, 1);

    mutantProjGraphics.generateTexture('enemyProjectile_mutant', mw, mh);
    mutantProjGraphics.destroy();


    // ========================
    // 4. DRONE PROJECTILE (Tech Pulse)
    // ========================
    const droneProjGraphics = scene.add.graphics();
    const dw = 14, dh = 14;
    const dcx = dw / 2, dcy = dh / 2;

    // Energy Ring 1 (Faint)
    droneProjGraphics.lineStyle(2, C_RED_BRIGHT, 0.3);
    droneProjGraphics.strokeCircle(dcx, dcy, 6);

    // Energy Ring 2 (Sharp)
    droneProjGraphics.lineStyle(1, C_RED_BRIGHT, 0.8);
    droneProjGraphics.strokeCircle(dcx, dcy, 4.5);

    // Core Body
    droneProjGraphics.fillStyle(C_RED_GLOW, 1);
    droneProjGraphics.fillCircle(dcx, dcy, 3);

    // Crosshair/Tech pattern
    droneProjGraphics.lineStyle(1, C_CORE_WHITE, 1);
    droneProjGraphics.beginPath();
    droneProjGraphics.moveTo(dcx, dcy - 3);
    droneProjGraphics.lineTo(dcx, dcy + 3);
    droneProjGraphics.moveTo(dcx - 3, dcy);
    droneProjGraphics.lineTo(dcx + 3, dcy);
    droneProjGraphics.strokePath();

    // Center Point
    droneProjGraphics.fillStyle(C_CORE_WHITE, 1);
    droneProjGraphics.fillCircle(dcx, dcy, 1);

    droneProjGraphics.generateTexture('enemyProjectile_drone', dw, dh);
    droneProjGraphics.destroy();


    // ========================
    // 5. BOMBER PROJECTILE (Heavy Magma Bomb)
    // ========================
    const bomberProjGraphics = scene.add.graphics();
    const bw = 16, bh = 16;
    const bcx = bw / 2, bcy = bh / 2;

    // Heat Haze
    bomberProjGraphics.fillStyle(0xff4400, 0.2);
    bomberProjGraphics.fillCircle(bcx, bcy, 8);

    // Bomb Body (Dark Iron)
    bomberProjGraphics.fillStyle(0x330000, 1);
    bomberProjGraphics.fillCircle(bcx, bcy, 6);

    // Molten Cracks (Lava look)
    bomberProjGraphics.fillStyle(0xff2200, 1);
    bomberProjGraphics.beginPath();
    bomberProjGraphics.moveTo(bcx - 2, bcy - 5);
    bomberProjGraphics.lineTo(bcx + 2, bcy - 5);
    bomberProjGraphics.lineTo(bcx, bcy); // down to center
    bomberProjGraphics.lineTo(bcx - 4, bcy + 2);
    bomberProjGraphics.lineTo(bcx + 4, bcy + 2);
    bomberProjGraphics.closePath();
    bomberProjGraphics.fillPath();

    // Intense Heat Core
    bomberProjGraphics.fillStyle(0xffff00, 0.8);
    bomberProjGraphics.fillCircle(bcx, bcy - 1, 2.5);

    // Rim Light (Bottom right)
    bomberProjGraphics.lineStyle(1, 0xff8800, 0.5);
    bomberProjGraphics.beginPath();
    bomberProjGraphics.arc(bcx, bcy, 6, 0.5, 2.5);
    bomberProjGraphics.strokePath();

    bomberProjGraphics.generateTexture('enemyProjectile_bomber', bw, bh);
    bomberProjGraphics.destroy();


    // ========================
    // 6. POD PROJECTILE (Containment Sphere)
    // ========================
    const podProjGraphics = scene.add.graphics();
    const pw = 12, ph = 12;
    const pcx = pw / 2, pcy = ph / 2;

    // Outer Shell Glow
    podProjGraphics.fillStyle(0xaa0044, 0.2);
    podProjGraphics.fillCircle(pcx, pcy, 6);

    // Containment Brackets (Dark Red)
    podProjGraphics.lineStyle(2, 0x660022, 1);
    podProjGraphics.strokeCircle(pcx, pcy, 5);

    // Inner Energy
    podProjGraphics.fillStyle(0xff0055, 1);
    podProjGraphics.fillCircle(pcx, pcy, 3.5);

    // Highlight (Glossy)
    podProjGraphics.fillStyle(0xffaaaa, 0.8);
    podProjGraphics.fillEllipse(pcx - 1.5, pcy - 1.5, 2, 1.5);

    // Dark center (Eye pupil look)
    podProjGraphics.fillStyle(0x440011, 1);
    podProjGraphics.fillCircle(pcx, pcy, 1);

    podProjGraphics.generateTexture('enemyProjectile_pod', pw, ph);
    podProjGraphics.destroy();


    // ========================
    // 7. SWARMER PROJECTILE (Needle Dart)
    // ========================
    const swarmerProjGraphics = scene.add.graphics();
    const sw = 16, sh = 8; // Longer
    const scy = sh / 2;

    // Speed trail
    swarmerProjGraphics.fillStyle(C_RED_GLOW, 0.3);
    swarmerProjGraphics.fillEllipse(6, scy, 12, 6);

    // Needle Body
    swarmerProjGraphics.fillStyle(C_RED_BRIGHT, 1);
    swarmerProjGraphics.beginPath();
    swarmerProjGraphics.moveTo(16, scy);    // Tip
    swarmerProjGraphics.lineTo(4, scy - 2); // Back top
    swarmerProjGraphics.lineTo(0, scy);     // Tail
    swarmerProjGraphics.lineTo(4, scy + 2); // Back bottom
    swarmerProjGraphics.closePath();
    swarmerProjGraphics.fillPath();

    // Bright Spine
    swarmerProjGraphics.fillStyle(0xffcccc, 1);
    swarmerProjGraphics.fillRect(4, scy - 0.5, 10, 1);

    swarmerProjGraphics.generateTexture('enemyProjectile_swarmer', sw, sh);
    swarmerProjGraphics.destroy();


    // ========================
    // 8. PIERCING PROJECTILE (Armor Piercer Bolt)
    // ========================
    const piercingProjGraphics = scene.add.graphics();
    const pzw = 22, pzh = 8;
    const pzcy = pzh / 2;

    // Core streak
    piercingProjGraphics.fillStyle(C_RED_BRIGHT, 1);
    piercingProjGraphics.fillRect(2, pzcy - 2, 16, 4);

    // Hot centerline
    piercingProjGraphics.fillStyle(C_CORE_WHITE, 0.9);
    piercingProjGraphics.fillRect(4, pzcy - 0.5, 12, 1);

    // Tip flare
    piercingProjGraphics.fillStyle(C_ORANGE_HEAT, 1);
    piercingProjGraphics.beginPath();
    piercingProjGraphics.moveTo(18, pzcy - 3);
    piercingProjGraphics.lineTo(22, pzcy);
    piercingProjGraphics.lineTo(18, pzcy + 3);
    piercingProjGraphics.closePath();
    piercingProjGraphics.fillPath();

    // Trailing glow
    piercingProjGraphics.fillStyle(C_RED_GLOW, 0.25);
    piercingProjGraphics.fillEllipse(6, pzcy, 12, 6);

    piercingProjGraphics.generateTexture('enemyProjectile_piercing', pzw, pzh);
    piercingProjGraphics.destroy();


    // ========================
    // 9. BAITER PROJECTILE (Laser Segment)
    // ========================
    const baiterProjGraphics = scene.add.graphics();
    const baw = 20, bah = 8;
    const bacy = bah / 2;

    // Horizontal Blur
    baiterProjGraphics.fillStyle(C_RED_GLOW, 0.2);
    baiterProjGraphics.fillRect(0, bacy - 3, 20, 6);

    // Beam Core
    baiterProjGraphics.fillStyle(0xff0000, 0.8);
    baiterProjGraphics.fillRect(2, bacy - 2, 16, 4);

    // Bright Center
    baiterProjGraphics.fillStyle(0xffaaaa, 1);
    baiterProjGraphics.fillRect(4, bacy - 1, 12, 2);

    // White Hot Line
    baiterProjGraphics.fillStyle(0xffffff, 1);
    baiterProjGraphics.fillRect(6, bacy - 0.5, 8, 1);

    // Electric bits
    baiterProjGraphics.lineStyle(1, 0xff5555, 0.5);
    baiterProjGraphics.beginPath();
    baiterProjGraphics.moveTo(2, bacy - 3);
    baiterProjGraphics.lineTo(18, bacy + 3);
    baiterProjGraphics.strokePath();

    baiterProjGraphics.generateTexture('enemyProjectile_baiter', baw, bah);
    baiterProjGraphics.destroy();


    // ========================
    // 10. MINE (Naval Mine Style)
    // ========================
    const mineGraphics = scene.add.graphics();
    const mw_mine = 24, mh_mine = 24;
    const mcx_mine = mw_mine / 2, mcy_mine = mh_mine / 2;

    // Warning Glow
    mineGraphics.fillStyle(C_RED_GLOW, 0.15);
    mineGraphics.fillCircle(mcx_mine, mcy_mine, 11);

    // Metal Sphere Base
    mineGraphics.fillStyle(0x440000, 1); // Dark red metal
    mineGraphics.fillCircle(mcx_mine, mcy_mine, 7);

    // Shading (Sphere 3D effect)
    mineGraphics.fillStyle(0x770000, 1); // Lit side
    mineGraphics.fillCircle(mcx_mine - 2, mcy_mine - 2, 4);

    // Spikes (Triangles)
    mineGraphics.fillStyle(0xaa2222, 1);
    // Top
    mineGraphics.fillTriangle(mcx_mine, mcy_mine - 6, mcx_mine - 2, mcy_mine - 3, mcx_mine + 2, mcy_mine - 3);
    // Bottom
    mineGraphics.fillTriangle(mcx_mine, mcy_mine + 6, mcx_mine - 2, mcy_mine + 3, mcx_mine + 2, mcy_mine + 3);
    // Left
    mineGraphics.fillTriangle(mcx_mine - 6, mcy_mine, mcx_mine - 3, mcy_mine - 2, mcx_mine - 3, mcy_mine + 2);
    // Right
    mineGraphics.fillTriangle(mcx_mine + 6, mcy_mine, mcx_mine + 3, mcy_mine - 2, mcx_mine + 3, mcy_mine + 2);
    // Diagonal 1
    mineGraphics.fillTriangle(mcx_mine + 5, mcy_mine - 5, mcx_mine + 2, mcy_mine - 2, mcx_mine + 4, mcy_mine - 1);
    // Diagonal 2
    mineGraphics.fillTriangle(mcx_mine - 5, mcy_mine + 5, mcx_mine - 2, mcy_mine + 2, mcx_mine - 4, mcy_mine + 1);

    // Blinking Light (Center)
    mineGraphics.fillStyle(0xff0000, 1);
    mineGraphics.fillCircle(mcx_mine, mcy_mine, 2.5);
    mineGraphics.fillStyle(0xffff00, 0.8);
    mineGraphics.fillCircle(mcx_mine, mcy_mine, 1.5);

    // Specular highlight on the metal
    mineGraphics.fillStyle(0xffaaaa, 0.5);
    mineGraphics.fillCircle(mcx_mine - 3, mcy_mine - 3, 1.5);

    mineGraphics.generateTexture('mine', mw_mine, mh_mine);
    mineGraphics.destroy();
}
