// ------------------------
// Enemy Graphics - New (Spawner, Shielder)
// ------------------------

function createSpawnerGraphics(scene) {
    // ========================
    // SPAWNER - Enemy that Creates Minions
    // ========================
    const spawnerGraphics = scene.add.graphics();
    const spw = 28, sph = 28;
    const spcx = spw / 2, spcy = sph / 2;

    // Birthing aura
    spawnerGraphics.fillStyle(0xccaa00, 0.1);
    spawnerGraphics.fillCircle(spcx, spcy, 14);

    // Organic outer membrane
    spawnerGraphics.fillStyle(0x886600, 1);
    spawnerGraphics.fillEllipse(spcx, spcy, 24, 22);

    // Main body
    spawnerGraphics.fillStyle(0xccaa00, 1);
    spawnerGraphics.fillEllipse(spcx, spcy, 22, 20);

    // Body highlight
    spawnerGraphics.fillStyle(0xddbb22, 1);
    spawnerGraphics.fillEllipse(spcx - 2, spcy - 2, 16, 14);

    // Body shine
    spawnerGraphics.fillStyle(0xeecc44, 0.6);
    spawnerGraphics.fillEllipse(spcx - 3, spcy - 4, 10, 8);

    // Pulsing inner membrane
    spawnerGraphics.fillStyle(0xffcc00, 0.5);
    spawnerGraphics.fillEllipse(spcx, spcy, 16, 14);

    // Spawn ports
    // Top port
    spawnerGraphics.fillStyle(0x664400, 1);
    spawnerGraphics.fillCircle(spcx, spcy - 8, 3);
    spawnerGraphics.fillStyle(0x443300, 1);
    spawnerGraphics.fillCircle(spcx, spcy - 8, 2);
    spawnerGraphics.fillStyle(0x00ff00, 0.5);
    spawnerGraphics.fillCircle(spcx, spcy - 8, 1.2);

    // Bottom port
    spawnerGraphics.fillStyle(0x664400, 1);
    spawnerGraphics.fillCircle(spcx, spcy + 8, 3);
    spawnerGraphics.fillStyle(0x443300, 1);
    spawnerGraphics.fillCircle(spcx, spcy + 8, 2);
    spawnerGraphics.fillStyle(0x00ff00, 0.5);
    spawnerGraphics.fillCircle(spcx, spcy + 8, 1.2);

    // Left port
    spawnerGraphics.fillStyle(0x664400, 1);
    spawnerGraphics.fillCircle(spcx - 9, spcy, 3);
    spawnerGraphics.fillStyle(0x443300, 1);
    spawnerGraphics.fillCircle(spcx - 9, spcy, 2);
    spawnerGraphics.fillStyle(0x00ff00, 0.5);
    spawnerGraphics.fillCircle(spcx - 9, spcy, 1.2);

    // Right port
    spawnerGraphics.fillStyle(0x664400, 1);
    spawnerGraphics.fillCircle(spcx + 9, spcy, 3);
    spawnerGraphics.fillStyle(0x443300, 1);
    spawnerGraphics.fillCircle(spcx + 9, spcy, 2);
    spawnerGraphics.fillStyle(0x00ff00, 0.5);
    spawnerGraphics.fillCircle(spcx + 9, spcy, 1.2);

    // Internal eggs/embryos
    spawnerGraphics.fillStyle(0x00aa00, 0.6);
    spawnerGraphics.fillCircle(spcx - 3, spcy - 2, 3);
    spawnerGraphics.fillCircle(spcx + 3, spcy + 1, 2.5);
    spawnerGraphics.fillCircle(spcx - 1, spcy + 3, 2);

    // Embryo highlights
    spawnerGraphics.fillStyle(0x66ff66, 0.7);
    spawnerGraphics.fillCircle(spcx - 3.5, spcy - 2.5, 1.2);
    spawnerGraphics.fillCircle(spcx + 2.5, spcy + 0.5, 1);
    spawnerGraphics.fillCircle(spcx - 1.5, spcy + 2.5, 0.8);

    // Embryo cores
    spawnerGraphics.fillStyle(0xaaffaa, 1);
    spawnerGraphics.fillCircle(spcx - 3, spcy - 2, 0.8);
    spawnerGraphics.fillCircle(spcx + 3, spcy + 1, 0.7);

    // Central control node
    spawnerGraphics.fillStyle(0xaa6600, 1);
    spawnerGraphics.fillCircle(spcx, spcy, 3.5);

    spawnerGraphics.fillStyle(0xff8800, 1);
    spawnerGraphics.fillCircle(spcx, spcy, 2.5);

    spawnerGraphics.fillStyle(0xffaa44, 1);
    spawnerGraphics.fillCircle(spcx, spcy, 1.5);

    spawnerGraphics.fillStyle(0xffffaa, 0.9);
    spawnerGraphics.fillCircle(spcx - 0.5, spcy - 0.5, 0.6);

    // Veins/connections
    spawnerGraphics.lineStyle(1, 0x886600, 0.6);
    spawnerGraphics.beginPath();
    spawnerGraphics.moveTo(spcx, spcy);
    spawnerGraphics.lineTo(spcx, spcy - 8);
    spawnerGraphics.strokePath();
    spawnerGraphics.beginPath();
    spawnerGraphics.moveTo(spcx, spcy);
    spawnerGraphics.lineTo(spcx, spcy + 8);
    spawnerGraphics.strokePath();
    spawnerGraphics.beginPath();
    spawnerGraphics.moveTo(spcx, spcy);
    spawnerGraphics.lineTo(spcx - 9, spcy);
    spawnerGraphics.strokePath();
    spawnerGraphics.beginPath();
    spawnerGraphics.moveTo(spcx, spcy);
    spawnerGraphics.lineTo(spcx + 9, spcy);
    spawnerGraphics.strokePath();

    // Membrane texture
    spawnerGraphics.lineStyle(1, 0x997700, 0.3);
    spawnerGraphics.strokeEllipse(spcx, spcy, 18, 16);
    spawnerGraphics.strokeEllipse(spcx, spcy, 12, 10);

    // Outer edge
    spawnerGraphics.lineStyle(1, 0x664400, 0.8);
    spawnerGraphics.strokeEllipse(spcx, spcy, 22, 20);

    spawnerGraphics.generateTexture('spawner', spw, sph);
    spawnerGraphics.destroy();

}

function createShielderGraphics(scene) {
    // ========================
    // SHIELDER - Protects Other Enemies
    // ========================
    const shielderGraphics = scene.add.graphics();
    const sdrw = 28, sdrh = 28;
    const sdrcx = sdrw / 2, sdrcy = sdrh / 2;

    // Protection field outer
    shielderGraphics.lineStyle(2, 0x00ff00, 0.15);
    shielderGraphics.strokeCircle(sdrcx, sdrcy, 14);

    // Protection field middle
    shielderGraphics.lineStyle(1, 0x44ff44, 0.25);
    shielderGraphics.strokeCircle(sdrcx, sdrcy, 12);

    // Protection field inner
    shielderGraphics.lineStyle(1, 0x88ff88, 0.35);
    shielderGraphics.strokeCircle(sdrcx, sdrcy, 10);

    // Field fill
    shielderGraphics.fillStyle(0x00ff00, 0.08);
    shielderGraphics.fillCircle(sdrcx, sdrcy, 10);

    // Diamond body shadow
    shielderGraphics.fillStyle(0x006600, 1);
    shielderGraphics.beginPath();
    shielderGraphics.moveTo(sdrcx, sdrcy - 8);
    shielderGraphics.lineTo(sdrcx + 9, sdrcy);
    shielderGraphics.lineTo(sdrcx, sdrcy + 9);
    shielderGraphics.lineTo(sdrcx - 8, sdrcy);
    shielderGraphics.closePath();
    shielderGraphics.fillPath();

    // Diamond body main
    shielderGraphics.fillStyle(0x00aa00, 1);
    shielderGraphics.beginPath();
    shielderGraphics.moveTo(sdrcx, sdrcy - 7);
    shielderGraphics.lineTo(sdrcx + 8, sdrcy);
    shielderGraphics.lineTo(sdrcx, sdrcy + 8);
    shielderGraphics.lineTo(sdrcx - 7, sdrcy);
    shielderGraphics.closePath();
    shielderGraphics.fillPath();

    // Diamond upper facet
    shielderGraphics.fillStyle(0x22cc22, 1);
    shielderGraphics.beginPath();
    shielderGraphics.moveTo(sdrcx, sdrcy - 6);
    shielderGraphics.lineTo(sdrcx + 6, sdrcy);
    shielderGraphics.lineTo(sdrcx, sdrcy);
    shielderGraphics.lineTo(sdrcx - 5, sdrcy);
    shielderGraphics.closePath();
    shielderGraphics.fillPath();

    // Diamond highlight
    shielderGraphics.fillStyle(0x44ff44, 0.6);
    shielderGraphics.beginPath();
    shielderGraphics.moveTo(sdrcx - 2, sdrcy - 5);
    shielderGraphics.lineTo(sdrcx + 2, sdrcy - 3);
    shielderGraphics.lineTo(sdrcx, sdrcy);
    shielderGraphics.lineTo(sdrcx - 4, sdrcy - 2);
    shielderGraphics.closePath();
    shielderGraphics.fillPath();

    // Energy nodes at corners
    // Top
    shielderGraphics.fillStyle(0x00ff00, 0.4);
    shielderGraphics.fillCircle(sdrcx, sdrcy - 7, 3);
    shielderGraphics.fillStyle(0xffffff, 1);
    shielderGraphics.fillCircle(sdrcx, sdrcy - 7, 2);
    shielderGraphics.fillStyle(0x00ff00, 1);
    shielderGraphics.fillCircle(sdrcx, sdrcy - 7, 1.2);
    shielderGraphics.fillStyle(0xaaffaa, 0.8);
    shielderGraphics.fillCircle(sdrcx - 0.5, sdrcy - 7.5, 0.5);

    // Right
    shielderGraphics.fillStyle(0x00ff00, 0.4);
    shielderGraphics.fillCircle(sdrcx + 8, sdrcy, 3);
    shielderGraphics.fillStyle(0xffffff, 1);
    shielderGraphics.fillCircle(sdrcx + 8, sdrcy, 2);
    shielderGraphics.fillStyle(0x00ff00, 1);
    shielderGraphics.fillCircle(sdrcx + 8, sdrcy, 1.2);
    shielderGraphics.fillStyle(0xaaffaa, 0.8);
    shielderGraphics.fillCircle(sdrcx + 7.5, sdrcy - 0.5, 0.5);

    // Bottom
    shielderGraphics.fillStyle(0x00ff00, 0.4);
    shielderGraphics.fillCircle(sdrcx, sdrcy + 8, 3);
    shielderGraphics.fillStyle(0xffffff, 1);
    shielderGraphics.fillCircle(sdrcx, sdrcy + 8, 2);
    shielderGraphics.fillStyle(0x00ff00, 1);
    shielderGraphics.fillCircle(sdrcx, sdrcy + 8, 1.2);
    shielderGraphics.fillStyle(0xaaffaa, 0.8);
    shielderGraphics.fillCircle(sdrcx - 0.5, sdrcy + 7.5, 0.5);

    // Left
    shielderGraphics.fillStyle(0x00ff00, 0.4);
    shielderGraphics.fillCircle(sdrcx - 7, sdrcy, 3);
    shielderGraphics.fillStyle(0xffffff, 1);
    shielderGraphics.fillCircle(sdrcx - 7, sdrcy, 2);
    shielderGraphics.fillStyle(0x00ff00, 1);
    shielderGraphics.fillCircle(sdrcx - 7, sdrcy, 1.2);
    shielderGraphics.fillStyle(0xaaffaa, 0.8);
    shielderGraphics.fillCircle(sdrcx - 7.5, sdrcy - 0.5, 0.5);

    // Inner core ring
    shielderGraphics.lineStyle(1, 0x006600, 0.8);
    shielderGraphics.strokeCircle(sdrcx, sdrcy, 5);

    // Inner core body
    shielderGraphics.fillStyle(0x00aa00, 1);
    shielderGraphics.fillCircle(sdrcx, sdrcy, 4.5);

    shielderGraphics.fillStyle(0x44ff44, 1);
    shielderGraphics.fillCircle(sdrcx, sdrcy, 3.5);

    // Central eye
    shielderGraphics.fillStyle(0x004400, 1);
    shielderGraphics.fillCircle(sdrcx, sdrcy, 2.5);
    shielderGraphics.fillStyle(0x00ff00, 1);
    shielderGraphics.fillCircle(sdrcx, sdrcy, 1.8);
    shielderGraphics.fillStyle(0xaaffaa, 1);
    shielderGraphics.fillCircle(sdrcx, sdrcy, 1);
    shielderGraphics.fillStyle(0xffffff, 0.9);
    shielderGraphics.fillCircle(sdrcx - 0.5, sdrcy - 0.5, 0.4);

    // Diamond edge
    shielderGraphics.lineStyle(1, 0x005500, 0.8);
    shielderGraphics.beginPath();
    shielderGraphics.moveTo(sdrcx, sdrcy - 7);
    shielderGraphics.lineTo(sdrcx + 8, sdrcy);
    shielderGraphics.lineTo(sdrcx, sdrcy + 8);
    shielderGraphics.lineTo(sdrcx - 7, sdrcy);
    shielderGraphics.closePath();
    shielderGraphics.strokePath();

    shielderGraphics.generateTexture('shielder', sdrw, sdrh);
    shielderGraphics.destroy();

}
