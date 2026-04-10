// ------------------------
// Stasis Array (Assault Liberation Source)
// ------------------------

function createStasisArrayGraphics(scene) {
    const g = scene.add.graphics();
    const w = 52;
    const h = 78;
    const cx = w / 2;

    g.fillStyle(0x0f172a, 1);
    g.fillRoundedRect(6, 14, w - 12, h - 16, 10);

    g.lineStyle(2, 0x334155, 0.9);
    g.strokeRoundedRect(6, 14, w - 12, h - 16, 10);

    g.fillStyle(0xf59e0b, 0.3);
    g.fillRoundedRect(12, 20, w - 24, h - 28, 7);

    g.lineStyle(2, 0xfbbf24, 0.95);
    g.strokeRoundedRect(12, 20, w - 24, h - 28, 7);

    g.fillStyle(0x1e293b, 0.95);
    g.fillCircle(cx, 42, 5);
    g.fillRoundedRect(cx - 3, 46, 6, 12, 3);

    g.fillStyle(0xfef3c7, 0.6);
    g.fillCircle(cx - 6, 30, 3);

    g.fillStyle(0x22d3ee, 0.9);
    g.fillCircle(cx, 68, 4);
    g.fillStyle(0x67e8f9, 0.35);
    g.fillCircle(cx, 68, 8);

    g.generateTexture('stasisArray', w, h);
    g.destroy();
}
