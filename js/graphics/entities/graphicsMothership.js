// ------------------------
// Mothership Graphics
// ------------------------

function createMothershipGraphics(scene) {
    createMothershipCoreGraphics(scene);
}

function createMothershipCoreGraphics(scene) {
    // ========================
    // MOTHERSHIP CORE - Stationary breach cannon node
    // ========================
    const coreGraphics = scene.add.graphics();
    const width = 160;
    const height = 120;

    coreGraphics.fillStyle(0x0f172a, 1);
    coreGraphics.fillRoundedRect(6, 26, 148, 68, 26);

    coreGraphics.fillStyle(0x1e293b, 1);
    coreGraphics.fillRoundedRect(20, 36, 120, 48, 20);

    coreGraphics.fillStyle(0x111827, 1);
    coreGraphics.fillRoundedRect(46, 10, 68, 22, 8);
    coreGraphics.fillStyle(0x334155, 1);
    coreGraphics.fillRoundedRect(52, 2, 56, 16, 6);

    coreGraphics.fillStyle(0x0ea5e9, 0.85);
    coreGraphics.fillCircle(80, 60, 28);
    coreGraphics.fillStyle(0x38bdf8, 0.9);
    coreGraphics.fillCircle(80, 60, 16);
    coreGraphics.lineStyle(4, 0x7dd3fc, 0.9);
    coreGraphics.strokeCircle(80, 60, 34);

    coreGraphics.fillStyle(0x1d4ed8, 0.85);
    coreGraphics.fillRect(30, 50, 18, 20);
    coreGraphics.fillRect(112, 50, 18, 20);
    coreGraphics.fillStyle(0x60a5fa, 0.9);
    coreGraphics.fillRect(34, 54, 10, 12);
    coreGraphics.fillRect(116, 54, 10, 12);

    coreGraphics.fillStyle(0x312e81, 0.8);
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = 80 + Math.cos(angle) * 46;
        const y = 60 + Math.sin(angle) * 28;
        coreGraphics.fillCircle(x, y, 7);
        coreGraphics.fillStyle(0x60a5fa, 0.85);
        coreGraphics.fillCircle(x, y, 3.5);
        coreGraphics.fillStyle(0x312e81, 0.8);
    }

    coreGraphics.lineStyle(2, 0x94a3b8, 0.7);
    coreGraphics.strokeRoundedRect(6, 26, 148, 68, 26);

    coreGraphics.fillStyle(0x22d3ee, 0.7);
    coreGraphics.fillRect(20, 92, 28, 10);
    coreGraphics.fillRect(112, 92, 28, 10);

    coreGraphics.generateTexture('mothershipCore', width, height);
    coreGraphics.destroy();
}
