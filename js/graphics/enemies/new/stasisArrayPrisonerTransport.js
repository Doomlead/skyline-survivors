// ------------------------
// Enemy Graphics - Assault Liberation Sources
// ------------------------

function createStasisArrayGraphics(scene) {
    const g = scene.add.graphics();
    const width = 38;
    const height = 56;
    const cx = width / 2;

    g.fillStyle(0x0b1220, 0.9);
    g.fillRoundedRect(3, 4, width - 6, height - 8, 8);

    g.fillStyle(0x1f2937, 1);
    g.fillRoundedRect(6, 8, width - 12, height - 16, 6);

    g.fillStyle(0x0ea5e9, 0.22);
    g.fillRoundedRect(9, 10, width - 18, height - 22, 6);

    g.fillStyle(0xf59e0b, 0.9);
    g.fillCircle(cx, 18, 3);
    g.fillCircle(cx - 8, 23, 1.8);
    g.fillCircle(cx + 8, 23, 1.8);

    g.fillStyle(0x93c5fd, 0.45);
    g.fillEllipse(cx, 30, 9, 18);
    g.fillStyle(0xe2e8f0, 0.75);
    g.fillRect(cx - 1.5, 24, 3, 10);
    g.fillRect(cx - 4, 35, 8, 2);

    g.lineStyle(2, 0x38bdf8, 0.75);
    g.strokeRoundedRect(4, 5, width - 8, height - 10, 8);

    g.generateTexture('stasisArray', width, height);
    g.destroy();
}

function createPrisonerTransportGraphics(scene) {
    const g = scene.add.graphics();
    const width = 72;
    const height = 34;
    const cx = width / 2;
    const cy = height / 2;

    g.fillStyle(0x111827, 1);
    g.fillRoundedRect(6, 10, width - 12, 16, 6);

    g.fillStyle(0x334155, 1);
    g.fillRoundedRect(10, 7, width - 20, 20, 7);

    g.fillStyle(0xf59e0b, 0.9);
    g.fillRoundedRect(20, 12, width - 40, 8, 3);

    g.fillStyle(0x1e293b, 1);
    g.fillCircle(15, cy + 8, 5);
    g.fillCircle(width - 15, cy + 8, 5);
    g.fillStyle(0x64748b, 1);
    g.fillCircle(15, cy + 8, 3);
    g.fillCircle(width - 15, cy + 8, 3);

    g.fillStyle(0x7dd3fc, 0.8);
    g.fillEllipse(cx, cy - 3, 18, 9);
    g.fillStyle(0xffffff, 0.75);
    g.fillCircle(cx - 5, cy - 3, 1.8);
    g.fillCircle(cx, cy - 1.5, 1.8);
    g.fillCircle(cx + 5, cy - 3, 1.8);

    g.lineStyle(2, 0x38bdf8, 0.75);
    g.strokeRoundedRect(8, 8, width - 16, 18, 7);

    g.generateTexture('prisonerTransport', width, height);
    g.destroy();
}
