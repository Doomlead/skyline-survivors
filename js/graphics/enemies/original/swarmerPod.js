// ------------------------
// Enemy Graphics - Original (Swarmer, Pod)
// ------------------------

function createSwarmerGraphics(scene) {
    // ========================
    // SWARMER - Small Fast Attacker
    // ========================
    const swarmerGraphics = scene.add.graphics();
    const sw = 14, sh = 14;
    const scx = sw / 2, scy = sh / 2;

    // Speed trail glow
    swarmerGraphics.fillStyle(0x00ff00, 0.1);
    swarmerGraphics.fillEllipse(scx - 2, scy, 10, 8);

    // Outer energy shell
    swarmerGraphics.fillStyle(0x00aa00, 0.3);
    swarmerGraphics.fillCircle(scx, scy, 6);

    // Main body shadow
    swarmerGraphics.fillStyle(0x007700, 1);
    swarmerGraphics.fillCircle(scx, scy + 0.5, 5);

    // Main body
    swarmerGraphics.fillStyle(0x00cc00, 1);
    swarmerGraphics.fillCircle(scx, scy, 4.5);

    // Body highlight
    swarmerGraphics.fillStyle(0x44ff44, 1);
    swarmerGraphics.fillCircle(scx - 1, scy - 1, 3.5);

    // Surface shine
    swarmerGraphics.fillStyle(0x88ff88, 0.8);
    swarmerGraphics.fillCircle(scx - 1.5, scy - 1.5, 2);

    // Specular highlight
    swarmerGraphics.fillStyle(0xffffff, 0.9);
    swarmerGraphics.fillCircle(scx - 2, scy - 2, 1);

    // Sensor array (compound eyes)
    swarmerGraphics.fillStyle(0x004400, 1);
    swarmerGraphics.fillCircle(scx + 1, scy - 1, 1.5);
    swarmerGraphics.fillStyle(0x00ff00, 0.8);
    swarmerGraphics.fillCircle(scx + 1, scy - 1, 1);
    swarmerGraphics.fillStyle(0xaaffaa, 1);
    swarmerGraphics.fillCircle(scx + 0.7, scy - 1.3, 0.4);

    // Side sensors
    swarmerGraphics.fillStyle(0x88ff88, 0.8);
    swarmerGraphics.fillCircle(scx - 3, scy, 0.8);
    swarmerGraphics.fillCircle(scx + 3, scy + 1, 0.8);

    // Energy core
    swarmerGraphics.fillStyle(0x00aa00, 1);
    swarmerGraphics.fillCircle(scx, scy + 1, 1.5);
    swarmerGraphics.fillStyle(0x00ff00, 1);
    swarmerGraphics.fillCircle(scx, scy + 1, 1);
    swarmerGraphics.fillStyle(0xaaffaa, 1);
    swarmerGraphics.fillCircle(scx, scy + 1, 0.5);

    // Antennae/feelers
    swarmerGraphics.lineStyle(1, 0x00aa00, 0.8);
    swarmerGraphics.beginPath();
    swarmerGraphics.moveTo(scx + 2, scy - 3);
    swarmerGraphics.lineTo(scx + 4, scy - 5);
    swarmerGraphics.strokePath();
    swarmerGraphics.beginPath();
    swarmerGraphics.moveTo(scx - 1, scy - 3);
    swarmerGraphics.lineTo(scx - 2, scy - 5);
    swarmerGraphics.strokePath();

    // Feeler tips
    swarmerGraphics.fillStyle(0x88ff88, 1);
    swarmerGraphics.fillCircle(scx + 4, scy - 5, 0.6);
    swarmerGraphics.fillCircle(scx - 2, scy - 5, 0.6);

    // Shell segments
    swarmerGraphics.lineStyle(1, 0x008800, 0.4);
    swarmerGraphics.beginPath();
    swarmerGraphics.arc(scx, scy, 3.5, Math.PI * 0.3, Math.PI * 0.7);
    swarmerGraphics.strokePath();
    swarmerGraphics.beginPath();
    swarmerGraphics.arc(scx, scy, 3.5, Math.PI * 1.3, Math.PI * 1.7);
    swarmerGraphics.strokePath();

    // Outer ring
    swarmerGraphics.lineStyle(1, 0x00aa00, 0.5);
    swarmerGraphics.strokeCircle(scx, scy, 5);

    swarmerGraphics.generateTexture('swarmer', sw, sh);
    swarmerGraphics.destroy();
}

function createPodGraphics(scene) {
    // ========================
    // POD - Swarmer Container
    // ========================
    const podGraphics = scene.add.graphics();
    const pw = 28, ph = 28;
    const pcx = pw / 2, pcy = ph / 2;

    // Outer energy membrane glow
    podGraphics.fillStyle(0x8800cc, 0.1);
    podGraphics.fillCircle(pcx, pcy, 14);

    // Secondary glow
    podGraphics.fillStyle(0xaa00ff, 0.15);
    podGraphics.fillCircle(pcx, pcy, 12);

    // Outer shell
    podGraphics.fillStyle(0x7700aa, 1);
    podGraphics.fillCircle(pcx, pcy, 11);

    // Main shell
    podGraphics.fillStyle(0xaa00ff, 1);
    podGraphics.fillCircle(pcx, pcy, 10);

    // Shell highlight
    podGraphics.fillStyle(0xcc44ff, 0.8);
    podGraphics.fillCircle(pcx - 2, pcy - 2, 7);

    // Inner membrane
    podGraphics.fillStyle(0x7700aa, 1);
    podGraphics.fillCircle(pcx, pcy, 7);

    // Inner chamber
    podGraphics.fillStyle(0x550088, 1);
    podGraphics.fillCircle(pcx, pcy, 6);

    // Swarmer embryos visible inside
    podGraphics.fillStyle(0x00ff00, 0.7);
    podGraphics.fillCircle(pcx - 2.5, pcy - 2, 2);
    podGraphics.fillCircle(pcx + 2.5, pcy - 1, 2);
    podGraphics.fillCircle(pcx, pcy + 2.5, 2);

    // Embryo highlights
    podGraphics.fillStyle(0x88ff88, 0.8);
    podGraphics.fillCircle(pcx - 3, pcy - 2.5, 0.8);
    podGraphics.fillCircle(pcx + 2, pcy - 1.5, 0.8);
    podGraphics.fillCircle(pcx - 0.5, pcy + 2, 0.8);

    // Energy veins
    podGraphics.lineStyle(2, 0x6600aa, 0.8);
    podGraphics.beginPath();
    podGraphics.moveTo(pcx, pcy - 10);
    podGraphics.lineTo(pcx, pcy + 10);
    podGraphics.strokePath();
    podGraphics.beginPath();
    podGraphics.moveTo(pcx - 10, pcy);
    podGraphics.lineTo(pcx + 10, pcy);
    podGraphics.strokePath();

    // Diagonal veins
    podGraphics.lineStyle(1, 0x6600aa, 0.5);
    podGraphics.beginPath();
    podGraphics.moveTo(pcx - 7, pcy - 7);
    podGraphics.lineTo(pcx + 7, pcy + 7);
    podGraphics.strokePath();
    podGraphics.beginPath();
    podGraphics.moveTo(pcx + 7, pcy - 7);
    podGraphics.lineTo(pcx - 7, pcy + 7);
    podGraphics.strokePath();

    // Node points on veins
    podGraphics.fillStyle(0xcc66ff, 1);
    podGraphics.fillCircle(pcx, pcy - 8, 1.5);
    podGraphics.fillCircle(pcx, pcy + 8, 1.5);
    podGraphics.fillCircle(pcx - 8, pcy, 1.5);
    podGraphics.fillCircle(pcx + 8, pcy, 1.5);

    // Node glows
    podGraphics.fillStyle(0xcc66ff, 0.4);
    podGraphics.fillCircle(pcx, pcy - 8, 3);
    podGraphics.fillCircle(pcx, pcy + 8, 3);
    podGraphics.fillCircle(pcx - 8, pcy, 3);
    podGraphics.fillCircle(pcx + 8, pcy, 3);

    // Central core
    podGraphics.fillStyle(0xffee00, 0.8);
    podGraphics.fillCircle(pcx, pcy, 2);
    podGraphics.fillStyle(0xffffaa, 1);
    podGraphics.fillCircle(pcx, pcy, 1.2);
    podGraphics.fillStyle(0xffffff, 0.9);
    podGraphics.fillCircle(pcx - 0.3, pcy - 0.3, 0.5);

    // Shell texture rings
    podGraphics.lineStyle(1, 0x8800cc, 0.4);
    podGraphics.strokeCircle(pcx, pcy, 8);
    podGraphics.strokeCircle(pcx, pcy, 5);

    // Outer membrane edge
    podGraphics.lineStyle(1, 0x550088, 0.7);
    podGraphics.strokeCircle(pcx, pcy, 11);

    // Pulse ring
    podGraphics.lineStyle(1, 0xcc88ff, 0.3);
    podGraphics.strokeCircle(pcx, pcy, 13);

    // Surface detail
    podGraphics.fillStyle(0xdd88ff, 0.5);
    podGraphics.fillCircle(pcx - 6, pcy - 6, 1);
    podGraphics.fillCircle(pcx + 6, pcy - 5, 0.8);
    podGraphics.fillCircle(pcx + 5, pcy + 6, 1);
    podGraphics.fillCircle(pcx - 5, pcy + 5, 0.8);

    podGraphics.generateTexture('pod', pw, ph);
    podGraphics.destroy();
}
