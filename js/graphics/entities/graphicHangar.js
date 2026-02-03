// ------------------------
// Hangar Graphics - Rescue Loop Drop-off Hub
// ------------------------

function createHangarGraphics(scene) {
    const hangar = scene.add.graphics();
    const hw = 140;
    const hh = 70;
    const cx = hw / 2;
    const cy = hh / 2;

    // Ground pad shadow
    hangar.fillStyle(0x0f172a, 0.85);
    hangar.fillEllipse(cx, hh - 6, 120, 16);

    // Base platform
    hangar.fillStyle(0x1f2937, 1);
    hangar.fillRoundedRect(10, 34, hw - 20, 28, 10);
    hangar.fillStyle(0x334155, 1);
    hangar.fillRoundedRect(14, 30, hw - 28, 26, 10);

    // Hangar body
    hangar.fillStyle(0x475569, 1);
    hangar.fillRoundedRect(20, 10, hw - 40, 30, 12);
    hangar.fillStyle(0x64748b, 1);
    hangar.fillRoundedRect(24, 14, hw - 48, 22, 10);

    // Door bay
    hangar.fillStyle(0x0f172a, 1);
    hangar.fillRoundedRect(cx - 22, 18, 44, 28, 6);
    hangar.fillStyle(0x1e293b, 1);
    hangar.fillRoundedRect(cx - 18, 22, 36, 20, 6);

    // Door stripes
    hangar.fillStyle(0xf97316, 0.9);
    hangar.fillRect(cx - 16, 24, 4, 16);
    hangar.fillRect(cx + 12, 24, 4, 16);

    // Beacon lights
    hangar.fillStyle(0x38bdf8, 0.95);
    hangar.fillCircle(34, 16, 4);
    hangar.fillStyle(0x22d3ee, 0.75);
    hangar.fillCircle(hw - 34, 16, 4);

    // Edge highlights
    hangar.lineStyle(2, 0x94a3b8, 0.8);
    hangar.strokeRoundedRect(20, 10, hw - 40, 30, 12);
    hangar.lineStyle(2, 0x1f2937, 0.7);
    hangar.strokeRoundedRect(10, 34, hw - 20, 28, 10);

    hangar.generateTexture('hangar', hw, hh);
    hangar.destroy();
}
