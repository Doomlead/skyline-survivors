// ------------------------
// Reclaimer Graphics (Assault salvage vessel)
// ------------------------

function createReclaimerGraphics(scene) {
    const w = 48;
    const h = 32;
    const cx = w / 2;
    const g = scene.add.graphics();

    // Hull base silhouette (wide/squat industrial body)
    g.fillStyle(0x2f343c, 1);
    g.fillRoundedRect(6, 8, w - 12, 16, 4);
    g.fillStyle(0x1f242a, 1);
    g.fillRoundedRect(10, 10, w - 20, 12, 3);

    // Riveted armor paneling + seam lines
    g.fillStyle(0x3a404a, 1);
    g.fillRect(12, 11, 10, 10);
    g.fillRect(26, 11, 10, 10);
    g.lineStyle(1, 0x4b5563, 0.9);
    g.lineBetween(24, 10, 24, 22);
    g.lineBetween(12, 16, 36, 16);
    g.fillStyle(0x6b7280, 0.85);
    [14, 18, 30, 34].forEach((x) => {
        g.fillCircle(x, 12, 0.8);
        g.fillCircle(x, 20, 0.8);
    });

    // Hazard chevrons on both flanks
    g.fillStyle(0xfacc15, 1);
    g.fillTriangle(6, 9, 14, 9, 10, 15);
    g.fillTriangle(6, 16, 14, 16, 10, 22);
    g.fillTriangle(w - 6, 9, w - 14, 9, w - 10, 15);
    g.fillTriangle(w - 6, 16, w - 14, 16, w - 10, 22);

    // Cockpit viewport (amber)
    g.fillStyle(0x78350f, 1);
    g.fillTriangle(cx - 4, 10, cx + 4, 10, cx, 6);
    g.fillStyle(0xf59e0b, 1);
    g.fillTriangle(cx - 3, 10, cx + 3, 10, cx, 7);
    g.fillStyle(0xfef3c7, 0.55);
    g.fillCircle(cx - 1, 8, 1);

    // Oversized rear thruster pods
    g.fillStyle(0x111827, 1);
    g.fillRoundedRect(0, 11, 8, 11, 3);
    g.fillRoundedRect(w - 8, 11, 8, 11, 3);
    g.fillStyle(0x374151, 1);
    g.fillRoundedRect(2, 12, 6, 9, 2);
    g.fillRoundedRect(w - 8, 12, 6, 9, 2);
    g.fillStyle(0xfb923c, 0.95);
    g.fillEllipse(2, 16.5, 4, 6);
    g.fillEllipse(w - 2, 16.5, 4, 6);
    g.fillStyle(0xfdba74, 0.7);
    g.fillEllipse(3, 16.5, 2, 3);
    g.fillEllipse(w - 3, 16.5, 2, 3);

    // Cargo bay doors (closed state)
    g.fillStyle(0x111827, 1);
    g.fillRoundedRect(cx - 8, 23, 16, 6, 2);
    g.lineStyle(1, 0x6b7280, 0.8);
    g.lineBetween(cx, 24, cx, 28);
    g.lineBetween(cx - 7, 24, cx + 7, 24);

    // Folded grapple arm hints (transit pose)
    g.fillStyle(0x4b5563, 1);
    g.fillRect(cx - 9, 21, 3, 6);
    g.fillRect(cx + 6, 21, 3, 6);
    g.fillStyle(0x9ca3af, 1);
    g.fillTriangle(cx - 8, 27, cx - 6, 27, cx - 7, 29);
    g.fillTriangle(cx + 8, 27, cx + 6, 27, cx + 7, 29);

    g.generateTexture('reclaimer', w, h);
    g.destroy();
}
