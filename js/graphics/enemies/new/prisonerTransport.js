// ------------------------
// Prisoner Transport (Assault Liberation Source)
// ------------------------

function createPrisonerTransportGraphics(scene) {
    const g = scene.add.graphics();
    const w = 92;
    const h = 48;

    g.fillStyle(0x111827, 1);
    g.fillRoundedRect(6, 10, w - 12, h - 12, 12);

    g.fillStyle(0x1f2937, 1);
    g.fillRoundedRect(10, 8, w - 20, h - 20, 10);

    g.fillStyle(0x334155, 1);
    g.fillRoundedRect(18, 4, w - 36, 12, 6);

    g.fillStyle(0xf59e0b, 0.7);
    g.fillRoundedRect(22, 18, w - 44, 10, 4);
    g.lineStyle(1.5, 0xfcd34d, 0.9);
    g.strokeRoundedRect(22, 18, w - 44, 10, 4);

    g.fillStyle(0x475569, 1);
    g.fillRoundedRect(8, 20, 14, 8, 3);
    g.fillRoundedRect(w - 22, 20, 14, 8, 3);

    g.fillStyle(0x22d3ee, 0.95);
    g.fillCircle(20, 32, 3.5);
    g.fillCircle(w - 20, 32, 3.5);

    g.fillStyle(0x93c5fd, 0.5);
    g.fillEllipse(w * 0.5, h - 3, 42, 10);

    g.generateTexture('prisonerTransport', w, h);
    g.destroy();
}
