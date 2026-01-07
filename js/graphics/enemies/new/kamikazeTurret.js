// ------------------------
// Enemy Graphics - New (Kamikaze, Turret)
// ------------------------

function createKamikazeGraphics(scene) {
    // ========================
    // KAMIKAZE - Fast Suicide Bomber
    // ========================
    const kamikazeGraphics = scene.add.graphics();
    const kw = 28, kh = 16;
    const kcy = kh / 2;

    // Outer explosion warning glow
    kamikazeGraphics.fillStyle(0xff2200, 0.1);
    kamikazeGraphics.fillEllipse(14, kcy, 28, 16);

    // Engine exhaust glow
    kamikazeGraphics.fillStyle(0xff4400, 0.2);
    kamikazeGraphics.fillEllipse(4, kcy, 10, 12);

    // Outer flame
    kamikazeGraphics.fillStyle(0xff2200, 0.7);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(8, kcy - 5);
    kamikazeGraphics.lineTo(-4, kcy);
    kamikazeGraphics.lineTo(8, kcy + 5);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();

    // Middle flame
    kamikazeGraphics.fillStyle(0xff6600, 0.85);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(8, kcy - 4);
    kamikazeGraphics.lineTo(0, kcy);
    kamikazeGraphics.lineTo(8, kcy + 4);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();

    // Inner flame
    kamikazeGraphics.fillStyle(0xffaa00, 1);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(8, kcy - 3);
    kamikazeGraphics.lineTo(3, kcy);
    kamikazeGraphics.lineTo(8, kcy + 3);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();

    // Core flame
    kamikazeGraphics.fillStyle(0xffff66, 1);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(8, kcy - 2);
    kamikazeGraphics.lineTo(5, kcy);
    kamikazeGraphics.lineTo(8, kcy + 2);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();

    // Flame sparks
    kamikazeGraphics.fillStyle(0xffff00, 0.8);
    kamikazeGraphics.fillCircle(1, kcy - 3, 1);
    kamikazeGraphics.fillCircle(-1, kcy + 2, 0.8);
    kamikazeGraphics.fillCircle(3, kcy + 4, 0.6);

    // Missile body shadow
    kamikazeGraphics.fillStyle(0x990000, 1);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(7, kcy - 5);
    kamikazeGraphics.lineTo(26, kcy);
    kamikazeGraphics.lineTo(7, kcy + 5);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();

    // Missile body main
    kamikazeGraphics.fillStyle(0xcc0000, 1);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(8, kcy - 4.5);
    kamikazeGraphics.lineTo(25, kcy);
    kamikazeGraphics.lineTo(8, kcy + 4.5);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();

    // Body upper highlight
    kamikazeGraphics.fillStyle(0xff2222, 1);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(9, kcy - 4);
    kamikazeGraphics.lineTo(22, kcy - 1);
    kamikazeGraphics.lineTo(9, kcy);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();

    // Body shine
    kamikazeGraphics.fillStyle(0xff4444, 0.7);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(10, kcy - 3);
    kamikazeGraphics.lineTo(18, kcy - 1.5);
    kamikazeGraphics.lineTo(10, kcy - 1);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();

    // Warning stripes
    kamikazeGraphics.fillStyle(0xffcc00, 1);
    kamikazeGraphics.fillRect(11, kcy - 3.5, 3, 7);
    kamikazeGraphics.fillRect(16, kcy - 2.5, 3, 5);

    // Stripe shadows
    kamikazeGraphics.fillStyle(0xcc9900, 1);
    kamikazeGraphics.fillRect(11, kcy, 3, 3.5);
    kamikazeGraphics.fillRect(16, kcy, 3, 2.5);

    // Nose cone
    kamikazeGraphics.fillStyle(0xaa0000, 1);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(22, kcy - 2);
    kamikazeGraphics.lineTo(28, kcy);
    kamikazeGraphics.lineTo(22, kcy + 2);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();

    // Nose highlight
    kamikazeGraphics.fillStyle(0xdd2222, 1);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(22, kcy - 1.5);
    kamikazeGraphics.lineTo(26, kcy);
    kamikazeGraphics.lineTo(22, kcy);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();

    // Angry eye socket
    kamikazeGraphics.fillStyle(0x220000, 1);
    kamikazeGraphics.fillCircle(21, kcy, 2.5);

    // Eye white
    kamikazeGraphics.fillStyle(0xffffff, 1);
    kamikazeGraphics.fillCircle(21, kcy, 2);

    // Angry eyebrow effect (red tint on top)
    kamikazeGraphics.fillStyle(0xff0000, 0.5);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(19, kcy - 2);
    kamikazeGraphics.lineTo(23, kcy - 1);
    kamikazeGraphics.lineTo(19, kcy);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();

    // Iris
    kamikazeGraphics.fillStyle(0xff0000, 1);
    kamikazeGraphics.fillCircle(21.5, kcy, 1.2);

    // Pupil
    kamikazeGraphics.fillStyle(0x000000, 1);
    kamikazeGraphics.fillCircle(22, kcy, 0.6);

    // Eye highlight
    kamikazeGraphics.fillStyle(0xffffff, 0.9);
    kamikazeGraphics.fillCircle(20.5, kcy - 0.8, 0.5);

    // Tail fins
    kamikazeGraphics.fillStyle(0x880000, 1);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(8, kcy - 4);
    kamikazeGraphics.lineTo(6, kcy - 7);
    kamikazeGraphics.lineTo(12, kcy - 4);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(8, kcy + 4);
    kamikazeGraphics.lineTo(6, kcy + 7);
    kamikazeGraphics.lineTo(12, kcy + 4);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();

    // Fin highlights
    kamikazeGraphics.fillStyle(0xaa2222, 0.8);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(8, kcy - 4.5);
    kamikazeGraphics.lineTo(7, kcy - 6);
    kamikazeGraphics.lineTo(10, kcy - 4.5);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();

    // Body edge
    kamikazeGraphics.lineStyle(1, 0x770000, 0.8);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(8, kcy - 4.5);
    kamikazeGraphics.lineTo(25, kcy);
    kamikazeGraphics.lineTo(8, kcy + 4.5);
    kamikazeGraphics.closePath();
    kamikazeGraphics.strokePath();

    // Engine glow core
    kamikazeGraphics.fillStyle(0xffffff, 0.9);
    kamikazeGraphics.fillCircle(7, kcy, 1.5);

    kamikazeGraphics.generateTexture('kamikaze', kw, kh);
    kamikazeGraphics.destroy();
}

function createTurretGraphics(scene) {
    // ========================
    // TURRET - Stationary Multi-directional Shooter
    // ========================
    const turretGraphics = scene.add.graphics();
    const tw = 24, th = 24;
    const tcx = tw / 2, tcy = th / 2;

    // Danger zone indicator
    turretGraphics.fillStyle(0xff0000, 0.05);
    turretGraphics.fillCircle(tcx, tcy, 12);

    // Base platform shadow
    turretGraphics.fillStyle(0x222222, 1);
    turretGraphics.fillRect(tcx - 8, tcy + 5, 16, 5);

    // Base platform main
    turretGraphics.fillStyle(0x444444, 1);
    turretGraphics.fillRect(tcx - 7, tcy + 4, 14, 4);

    // Base platform highlight
    turretGraphics.fillStyle(0x555555, 1);
    turretGraphics.fillRect(tcx - 6, tcy + 4, 12, 2);

    // Base platform detail
    turretGraphics.fillStyle(0x333333, 1);
    turretGraphics.fillRect(tcx - 5, tcy + 6, 10, 1);

    // Base rivets
    turretGraphics.fillStyle(0x666666, 1);
    turretGraphics.fillCircle(tcx - 5, tcy + 5, 0.8);
    turretGraphics.fillCircle(tcx + 5, tcy + 5, 0.8);

    // Main turret body shadow
    turretGraphics.fillStyle(0x444444, 1);
    turretGraphics.fillCircle(tcx, tcy + 1, 8);

    // Main turret body
    turretGraphics.fillStyle(0x666666, 1);
    turretGraphics.fillCircle(tcx, tcy, 7.5);

    // Turret body highlight
    turretGraphics.fillStyle(0x888888, 1);
    turretGraphics.fillCircle(tcx - 1, tcy - 1, 6);

    // Turret body shine
    turretGraphics.fillStyle(0x999999, 0.6);
    turretGraphics.fillCircle(tcx - 2, tcy - 2, 4);

    // Gun barrel - Top
    turretGraphics.fillStyle(0x555555, 1);
    turretGraphics.fillRect(tcx - 2.5, tcy - 12, 5, 6);
    turretGraphics.fillStyle(0x777777, 1);
    turretGraphics.fillRect(tcx - 2, tcy - 12, 4, 5);
    turretGraphics.fillStyle(0x333333, 1);
    turretGraphics.fillRect(tcx - 1.5, tcy - 12, 3, 2);
    turretGraphics.fillStyle(0xff4400, 0.6);
    turretGraphics.fillCircle(tcx, tcy - 11, 1);

    // Gun barrel - Bottom
    turretGraphics.fillStyle(0x555555, 1);
    turretGraphics.fillRect(tcx - 2.5, tcy + 6, 5, 6);
    turretGraphics.fillStyle(0x777777, 1);
    turretGraphics.fillRect(tcx - 2, tcy + 7, 4, 5);
    turretGraphics.fillStyle(0x333333, 1);
    turretGraphics.fillRect(tcx - 1.5, tcy + 10, 3, 2);
    turretGraphics.fillStyle(0xff4400, 0.6);
    turretGraphics.fillCircle(tcx, tcy + 11, 1);

    // Gun barrel - Left
    turretGraphics.fillStyle(0x555555, 1);
    turretGraphics.fillRect(tcx - 12, tcy - 2.5, 6, 5);
    turretGraphics.fillStyle(0x777777, 1);
    turretGraphics.fillRect(tcx - 12, tcy - 2, 5, 4);
    turretGraphics.fillStyle(0x333333, 1);
    turretGraphics.fillRect(tcx - 12, tcy - 1.5, 2, 3);
    turretGraphics.fillStyle(0xff4400, 0.6);
    turretGraphics.fillCircle(tcx - 11, tcy, 1);

    // Gun barrel - Right
    turretGraphics.fillStyle(0x555555, 1);
    turretGraphics.fillRect(tcx + 6, tcy - 2.5, 6, 5);
    turretGraphics.fillStyle(0x777777, 1);
    turretGraphics.fillRect(tcx + 7, tcy - 2, 5, 4);
    turretGraphics.fillStyle(0x333333, 1);
    turretGraphics.fillRect(tcx + 10, tcy - 1.5, 2, 3);
    turretGraphics.fillStyle(0xff4400, 0.6);
    turretGraphics.fillCircle(tcx + 11, tcy, 1);

    // Center sensor housing
    turretGraphics.fillStyle(0x333333, 1);
    turretGraphics.fillCircle(tcx, tcy, 4);

    // Sensor ring
    turretGraphics.lineStyle(1, 0x444444, 1);
    turretGraphics.strokeCircle(tcx, tcy, 3.5);

    // Sensor eye glow
    turretGraphics.fillStyle(0xff0000, 0.3);
    turretGraphics.fillCircle(tcx, tcy, 3);

    // Sensor eye
    turretGraphics.fillStyle(0xff0000, 1);
    turretGraphics.fillCircle(tcx, tcy, 2.5);

    // Sensor eye inner
    turretGraphics.fillStyle(0xff4444, 1);
    turretGraphics.fillCircle(tcx, tcy, 1.8);

    // Sensor eye core
    turretGraphics.fillStyle(0xff8888, 1);
    turretGraphics.fillCircle(tcx, tcy, 1);

    // Sensor highlight
    turretGraphics.fillStyle(0xffffff, 0.9);
    turretGraphics.fillCircle(tcx - 0.8, tcy - 0.8, 0.6);

    // Scanning line effect
    turretGraphics.fillStyle(0xffffff, 0.4);
    turretGraphics.fillRect(tcx - 2, tcy - 0.5, 4, 1);

    // Armor panel lines
    turretGraphics.lineStyle(1, 0x444444, 0.6);
    turretGraphics.beginPath();
    turretGraphics.arc(tcx, tcy, 6, 0, Math.PI * 0.5);
    turretGraphics.strokePath();
    turretGraphics.beginPath();
    turretGraphics.arc(tcx, tcy, 6, Math.PI, Math.PI * 1.5);
    turretGraphics.strokePath();

    // Outer rim
    turretGraphics.lineStyle(1, 0x333333, 0.8);
    turretGraphics.strokeCircle(tcx, tcy, 7.5);

    turretGraphics.generateTexture('turret', tw, th);
    turretGraphics.destroy();
}
