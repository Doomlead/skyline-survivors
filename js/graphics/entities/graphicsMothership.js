// ------------------------
// Mothership Graphics
// ------------------------

function createMothershipGraphics(scene) {
    createMothershipCoreGraphics(scene);
}

function createMothershipCoreGraphics(scene) {
    // ========================
    // MOTHERSHIP CORE - Massive biomech reactor with energy vents
    // ========================
    const coreGraphics = scene.add.graphics();
    const width = 160;
    const height = 120;

    coreGraphics.fillStyle(0x111827, 1);
    coreGraphics.fillRoundedRect(10, 20, 140, 80, 24);

    coreGraphics.fillStyle(0x1f2937, 1);
    coreGraphics.fillRoundedRect(25, 32, 110, 56, 18);

    coreGraphics.fillStyle(0x0ea5e9, 0.8);
    coreGraphics.fillCircle(80, 60, 24);
    coreGraphics.fillStyle(0x38bdf8, 0.8);
    coreGraphics.fillCircle(80, 60, 14);

    coreGraphics.lineStyle(3, 0x7dd3fc, 0.9);
    coreGraphics.strokeCircle(80, 60, 30);

    coreGraphics.fillStyle(0x312e81, 0.7);
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = 80 + Math.cos(angle) * 46;
        const y = 60 + Math.sin(angle) * 30;
        coreGraphics.fillCircle(x, y, 8);
        coreGraphics.fillStyle(0x60a5fa, 0.8);
        coreGraphics.fillCircle(x, y, 4);
        coreGraphics.fillStyle(0x312e81, 0.7);
    }

    coreGraphics.lineStyle(2, 0x94a3b8, 0.6);
    coreGraphics.strokeRoundedRect(10, 20, 140, 80, 24);

    coreGraphics.fillStyle(0x22d3ee, 0.8);
    coreGraphics.fillRect(30, 14, 20, 10);
    coreGraphics.fillRect(110, 14, 20, 10);
    coreGraphics.fillRect(30, 96, 20, 10);
    coreGraphics.fillRect(110, 96, 20, 10);

    coreGraphics.generateTexture('mothershipCore', width, height);
    coreGraphics.destroy();
}
