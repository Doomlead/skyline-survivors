// ------------------------
// Enemy Graphics - New (Bouncer, Sniper)
// ------------------------

function createBouncerGraphics(scene) { // Create bouncer graphics.
    // ========================
    // BOUNCER - Erratic Ricochet Movement
    // ========================
    const bouncerGraphics = scene.add.graphics();
    const bnw = 22, bnh = 18;
    const bncx = bnw / 2 + 2, bncy = bnh / 2;

    // Motion blur trail
    bouncerGraphics.fillStyle(0xff6600, 0.15);
    bouncerGraphics.fillCircle(bncx - 8, bncy, 5);
    bouncerGraphics.fillStyle(0xff6600, 0.25);
    bouncerGraphics.fillCircle(bncx - 5, bncy, 6);
    bouncerGraphics.fillStyle(0xff6600, 0.35);
    bouncerGraphics.fillCircle(bncx - 2, bncy, 7);

    // Main body shadow
    bouncerGraphics.fillStyle(0xcc4400, 1);
    bouncerGraphics.fillCircle(bncx, bncy + 1, 8);

    // Main body
    bouncerGraphics.fillStyle(0xff6600, 1);
    bouncerGraphics.fillCircle(bncx, bncy, 7.5);

    // Body highlight
    bouncerGraphics.fillStyle(0xff8833, 1);
    bouncerGraphics.fillCircle(bncx - 1, bncy - 1, 6);

    // Body shine
    bouncerGraphics.fillStyle(0xffaa55, 1);
    bouncerGraphics.fillCircle(bncx - 2, bncy - 2, 4);

    // Specular highlight
    bouncerGraphics.fillStyle(0xffcc88, 0.8);
    bouncerGraphics.fillCircle(bncx - 3, bncy - 3, 2.5);

    // Bright spot
    bouncerGraphics.fillStyle(0xffffff, 0.9);
    bouncerGraphics.fillCircle(bncx - 3.5, bncy - 3.5, 1.2);

    // Rubber texture rings
    bouncerGraphics.lineStyle(1, 0xcc5500, 0.3);
    bouncerGraphics.strokeCircle(bncx, bncy, 5);
    bouncerGraphics.strokeCircle(bncx, bncy, 3);

    // Speed lines
    bouncerGraphics.lineStyle(1, 0xffcc88, 0.5);
    bouncerGraphics.beginPath();
    bouncerGraphics.moveTo(0, bncy - 4);
    bouncerGraphics.lineTo(bncx - 8, bncy - 3);
    bouncerGraphics.strokePath();
    bouncerGraphics.beginPath();
    bouncerGraphics.moveTo(0, bncy);
    bouncerGraphics.lineTo(bncx - 9, bncy);
    bouncerGraphics.strokePath();
    bouncerGraphics.beginPath();
    bouncerGraphics.moveTo(0, bncy + 4);
    bouncerGraphics.lineTo(bncx - 8, bncy + 3);
    bouncerGraphics.strokePath();

    // Angry eyes
    bouncerGraphics.fillStyle(0xffffff, 1);
    bouncerGraphics.fillCircle(bncx - 2, bncy - 1, 2);
    bouncerGraphics.fillCircle(bncx + 2.5, bncy - 1, 2);

    bouncerGraphics.fillStyle(0x000000, 1);
    bouncerGraphics.fillCircle(bncx - 1.5, bncy - 0.5, 1);
    bouncerGraphics.fillCircle(bncx + 3, bncy - 0.5, 1);

    // Angry eyebrows
    bouncerGraphics.lineStyle(1.5, 0x000000, 1);
    bouncerGraphics.beginPath();
    bouncerGraphics.moveTo(bncx - 4, bncy - 3);
    bouncerGraphics.lineTo(bncx - 1, bncy - 2);
    bouncerGraphics.strokePath();
    bouncerGraphics.beginPath();
    bouncerGraphics.moveTo(bncx + 5, bncy - 3);
    bouncerGraphics.lineTo(bncx + 2, bncy - 2);
    bouncerGraphics.strokePath();

    // Angry mouth
    bouncerGraphics.lineStyle(1.5, 0x000000, 1);
    bouncerGraphics.beginPath();
    bouncerGraphics.moveTo(bncx - 2.5, bncy + 3);
    bouncerGraphics.lineTo(bncx, bncy + 2);
    bouncerGraphics.lineTo(bncx + 2.5, bncy + 3);
    bouncerGraphics.strokePath();

    // Outer edge
    bouncerGraphics.lineStyle(1, 0xdd5500, 0.7);
    bouncerGraphics.strokeCircle(bncx, bncy, 7.5);

    // Impact marks
    bouncerGraphics.fillStyle(0xcc4400, 0.5);
    bouncerGraphics.fillCircle(bncx + 5, bncy + 2, 1.5);
    bouncerGraphics.fillCircle(bncx + 3, bncy + 5, 1);

    bouncerGraphics.generateTexture('bouncer', bnw, bnh);
    bouncerGraphics.destroy();

}

function createSniperGraphics(scene) { // Create sniper graphics.
    // ========================
    // SNIPER - Long-range Precision Shooter
    // ========================
    const sniperGraphics = scene.add.graphics();
    const snw = 36, snh = 18;
    const sncy = snh / 2;

    // Targeting laser beam
    sniperGraphics.fillStyle(0xff0000, 0.15);
    sniperGraphics.fillRect(28, sncy - 1, 8, 2);
    sniperGraphics.lineStyle(1, 0xff0000, 0.4);
    sniperGraphics.beginPath();
    sniperGraphics.moveTo(28, sncy);
    sniperGraphics.lineTo(36, sncy);
    sniperGraphics.strokePath();

    // Laser tip glow
    sniperGraphics.fillStyle(0xff0000, 0.6);
    sniperGraphics.fillCircle(35, sncy, 2);
    sniperGraphics.fillStyle(0xff4444, 1);
    sniperGraphics.fillCircle(35, sncy, 1);

    // Barrel shadow
    sniperGraphics.fillStyle(0x222222, 1);
    sniperGraphics.fillRect(0, sncy - 2, 24, 5);

    // Main barrel
    sniperGraphics.fillStyle(0x333333, 1);
    sniperGraphics.fillRect(0, sncy - 1.5, 24, 4);

    // Barrel highlight
    sniperGraphics.fillStyle(0x444444, 1);
    sniperGraphics.fillRect(0, sncy - 1.5, 24, 2);

    // Barrel tip housing
    sniperGraphics.fillStyle(0x444444, 1);
    sniperGraphics.fillRect(24, sncy - 3, 5, 6);

    // Barrel tip detail
    sniperGraphics.fillStyle(0x555555, 1);
    sniperGraphics.fillRect(25, sncy - 2.5, 4, 5);

    // Barrel muzzle
    sniperGraphics.fillStyle(0x222222, 1);
    sniperGraphics.fillRect(28, sncy - 2, 2, 4);

    // Muzzle glow
    sniperGraphics.fillStyle(0xff4400, 0.5);
    sniperGraphics.fillCircle(29, sncy, 1.5);

    // Main body shadow
    sniperGraphics.fillStyle(0x222222, 1);
    sniperGraphics.fillEllipse(10, sncy + 1, 14, 10);

    // Main body
    sniperGraphics.fillStyle(0x444444, 1);
    sniperGraphics.fillEllipse(10, sncy, 13, 9);

    // Body highlight
    sniperGraphics.fillStyle(0x555555, 1);
    sniperGraphics.fillEllipse(9, sncy - 1, 10, 6);

    // Body shine
    sniperGraphics.fillStyle(0x666666, 0.6);
    sniperGraphics.fillEllipse(8, sncy - 2, 6, 4);

    // Scope mount
    sniperGraphics.fillStyle(0x333333, 1);
    sniperGraphics.fillRect(5, sncy - 8, 10, 4);

    // Scope body
    sniperGraphics.fillStyle(0x222222, 1);
    sniperGraphics.fillRect(6, sncy - 9, 8, 5);

    // Scope lens housing
    sniperGraphics.fillStyle(0x333333, 1);
    sniperGraphics.fillCircle(10, sncy - 7, 3);

    // Scope lens glow
    sniperGraphics.fillStyle(0xff0000, 0.3);
    sniperGraphics.fillCircle(10, sncy - 7, 2.5);

    // Scope lens
    sniperGraphics.fillStyle(0xff0000, 0.8);
    sniperGraphics.fillCircle(10, sncy - 7, 2);

    // Scope lens inner
    sniperGraphics.fillStyle(0xff4444, 1);
    sniperGraphics.fillCircle(10, sncy - 7, 1.2);

    // Scope highlight
    sniperGraphics.fillStyle(0xffffff, 0.7);
    sniperGraphics.fillCircle(9.5, sncy - 7.5, 0.5);

    // Stabilizer fin top
    sniperGraphics.fillStyle(0x444444, 1);
    sniperGraphics.beginPath();
    sniperGraphics.moveTo(2, sncy - 2);
    sniperGraphics.lineTo(0, sncy - 6);
    sniperGraphics.lineTo(6, sncy - 2);
    sniperGraphics.closePath();
    sniperGraphics.fillPath();

    // Fin top highlight
    sniperGraphics.fillStyle(0x555555, 0.8);
    sniperGraphics.beginPath();
    sniperGraphics.moveTo(2, sncy - 3);
    sniperGraphics.lineTo(1, sncy - 5);
    sniperGraphics.lineTo(4, sncy - 3);
    sniperGraphics.closePath();
    sniperGraphics.fillPath();

    // Stabilizer fin bottom
    sniperGraphics.fillStyle(0x333333, 1);
    sniperGraphics.beginPath();
    sniperGraphics.moveTo(2, sncy + 2);
    sniperGraphics.lineTo(0, sncy + 6);
    sniperGraphics.lineTo(6, sncy + 2);
    sniperGraphics.closePath();
    sniperGraphics.fillPath();

    // Panel lines
    sniperGraphics.lineStyle(1, 0x222222, 0.6);
    sniperGraphics.beginPath();
    sniperGraphics.moveTo(6, sncy - 3);
    sniperGraphics.lineTo(6, sncy + 3);
    sniperGraphics.strokePath();
    sniperGraphics.beginPath();
    sniperGraphics.moveTo(14, sncy - 3);
    sniperGraphics.lineTo(14, sncy + 3);
    sniperGraphics.strokePath();

    // Barrel segments
    sniperGraphics.lineStyle(1, 0x222222, 0.5);
    sniperGraphics.beginPath();
    sniperGraphics.moveTo(8, sncy - 1.5);
    sniperGraphics.lineTo(8, sncy + 2.5);
    sniperGraphics.strokePath();
    sniperGraphics.beginPath();
    sniperGraphics.moveTo(16, sncy - 1.5);
    sniperGraphics.lineTo(16, sncy + 2.5);
    sniperGraphics.strokePath();

    // Body edge
    sniperGraphics.lineStyle(1, 0x222222, 0.8);
    sniperGraphics.strokeEllipse(10, sncy, 13, 9);

    sniperGraphics.generateTexture('sniper', snw, snh);
    sniperGraphics.destroy();

}
