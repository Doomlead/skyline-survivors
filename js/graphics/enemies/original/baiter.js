// ------------------------
// Enemy Graphics - Original (Baiter)
// ------------------------

function createBaiterGraphics(scene) {
    // ========================
    // BAITER - Fast Aggressive Chaser
    // ========================
    const baiterGraphics = scene.add.graphics();
    const btw = 26, bth = 18;
    const btcx = btw / 2, btcy = bth / 2;

    // Speed trail glow
    baiterGraphics.fillStyle(0xff00ff, 0.1);
    baiterGraphics.fillEllipse(btcx - 4, btcy, 20, 14);

    // Engine exhaust glow
    baiterGraphics.fillStyle(0xff44ff, 0.2);
    baiterGraphics.fillEllipse(4, btcy, 8, 10);

    // Exhaust flames
    baiterGraphics.fillStyle(0xff00ff, 0.6);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(6, btcy - 4);
    baiterGraphics.lineTo(-2, btcy);
    baiterGraphics.lineTo(6, btcy + 4);
    baiterGraphics.closePath();
    baiterGraphics.fillPath();

    baiterGraphics.fillStyle(0xff88ff, 0.8);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(6, btcy - 3);
    baiterGraphics.lineTo(1, btcy);
    baiterGraphics.lineTo(6, btcy + 3);
    baiterGraphics.closePath();
    baiterGraphics.fillPath();

    baiterGraphics.fillStyle(0xffaaff, 1);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(6, btcy - 2);
    baiterGraphics.lineTo(3, btcy);
    baiterGraphics.lineTo(6, btcy + 2);
    baiterGraphics.closePath();
    baiterGraphics.fillPath();

    // Main body shadow
    baiterGraphics.fillStyle(0xaa00aa, 1);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(4, btcy);
    baiterGraphics.lineTo(btw, btcy - 7);
    baiterGraphics.lineTo(btw, btcy + 7);
    baiterGraphics.closePath();
    baiterGraphics.fillPath();

    // Main body
    baiterGraphics.fillStyle(0xff00ff, 1);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(5, btcy);
    baiterGraphics.lineTo(btw - 1, btcy - 6);
    baiterGraphics.lineTo(btw - 1, btcy + 6);
    baiterGraphics.closePath();
    baiterGraphics.fillPath();

    // Upper hull (lit)
    baiterGraphics.fillStyle(0xff44ff, 1);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(6, btcy);
    baiterGraphics.lineTo(btw - 2, btcy - 5);
    baiterGraphics.lineTo(btw - 2, btcy);
    baiterGraphics.closePath();
    baiterGraphics.fillPath();

    // Hull highlight
    baiterGraphics.fillStyle(0xff88ff, 0.7);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(10, btcy - 1);
    baiterGraphics.lineTo(btw - 4, btcy - 4);
    baiterGraphics.lineTo(btw - 4, btcy - 1);
    baiterGraphics.closePath();
    baiterGraphics.fillPath();

    // Edge shine
    baiterGraphics.fillStyle(0xffaaff, 0.5);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(12, btcy - 2);
    baiterGraphics.lineTo(btw - 3, btcy - 4.5);
    baiterGraphics.lineTo(btw - 6, btcy - 3);
    baiterGraphics.closePath();
    baiterGraphics.fillPath();

    // Cockpit
    baiterGraphics.fillStyle(0x660066, 1);
    baiterGraphics.fillCircle(btw - 5, btcy, 2.5);
    baiterGraphics.fillStyle(0xaa00aa, 1);
    baiterGraphics.fillCircle(btw - 5, btcy - 0.5, 2);
    baiterGraphics.fillStyle(0xff44ff, 0.7);
    baiterGraphics.fillCircle(btw - 5.5, btcy - 1, 1);

    // Targeting sensor
    baiterGraphics.fillStyle(0x00ffff, 1);
    baiterGraphics.fillCircle(btw - 2, btcy, 1.2);
    baiterGraphics.fillStyle(0xffffff, 0.8);
    baiterGraphics.fillCircle(btw - 2.3, btcy - 0.3, 0.5);

    // Targeting glow
    baiterGraphics.fillStyle(0x00ffff, 0.3);
    baiterGraphics.fillCircle(btw - 2, btcy, 2.5);

    // Wing fins
    baiterGraphics.fillStyle(0xcc00cc, 1);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(12, btcy - 4);
    baiterGraphics.lineTo(10, btcy - 8);
    baiterGraphics.lineTo(16, btcy - 5);
    baiterGraphics.closePath();
    baiterGraphics.fillPath();
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(12, btcy + 4);
    baiterGraphics.lineTo(10, btcy + 8);
    baiterGraphics.lineTo(16, btcy + 5);
    baiterGraphics.closePath();
    baiterGraphics.fillPath();

    // Fin highlights
    baiterGraphics.fillStyle(0xff44ff, 0.8);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(12, btcy - 4.5);
    baiterGraphics.lineTo(11, btcy - 7);
    baiterGraphics.lineTo(14, btcy - 5);
    baiterGraphics.closePath();
    baiterGraphics.fillPath();

    // Panel lines
    baiterGraphics.lineStyle(1, 0xaa00aa, 0.5);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(10, btcy - 3);
    baiterGraphics.lineTo(18, btcy - 4.5);
    baiterGraphics.strokePath();
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(10, btcy + 3);
    baiterGraphics.lineTo(18, btcy + 4.5);
    baiterGraphics.strokePath();

    // Edge outline
    baiterGraphics.lineStyle(1, 0x880088, 0.7);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(5, btcy);
    baiterGraphics.lineTo(btw - 1, btcy - 6);
    baiterGraphics.lineTo(btw - 1, btcy + 6);
    baiterGraphics.closePath();
    baiterGraphics.strokePath();

    // Speed lines
    baiterGraphics.lineStyle(1, 0xff88ff, 0.3);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(0, btcy - 3);
    baiterGraphics.lineTo(8, btcy - 3);
    baiterGraphics.strokePath();
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(0, btcy + 3);
    baiterGraphics.lineTo(8, btcy + 3);
    baiterGraphics.strokePath();

    baiterGraphics.generateTexture('baiter', btw, bth);
    baiterGraphics.destroy();
    

}
