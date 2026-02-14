// ------------------------
// Assault Base Graphics - 5 Base Variants
// Aligned with Battleship visual style
// ------------------------

function createAssaultBaseGraphics(scene) { // Create assault base graphics.
    createRaiderAssaultBase(scene);
    createCarrierAssaultBase(scene);
    createNovaAssaultBase(scene);
    createSiegeAssaultBase(scene);
    createDreadnoughtAssaultBase(scene);
}

function createRaiderAssaultBase(scene) { // Create raider assault base.
    const baseGraphics = scene.add.graphics();
    const bw = 180;
    const bh = 88;
    const cx = bw / 2;
    const cy = bh / 2;

    baseGraphics.fillStyle(0x7f1d1d, 1);
    baseGraphics.fillRoundedRect(6, 30, bw - 12, 44, 16);

    baseGraphics.fillStyle(0xef4444, 1);
    baseGraphics.fillRoundedRect(8, 26, bw - 16, 42, 16);

    baseGraphics.fillStyle(0xf87171, 1);
    baseGraphics.fillRoundedRect(24, 18, bw - 48, 18, 10);

    baseGraphics.fillStyle(0xdc2626, 1);
    baseGraphics.beginPath();
    baseGraphics.moveTo(cx + 46, 44);
    baseGraphics.lineTo(cx + 70, 36);
    baseGraphics.lineTo(cx + 70, 52);
    baseGraphics.closePath();
    baseGraphics.fillPath();

    baseGraphics.fillStyle(0xb91c1c, 1);
    baseGraphics.fillRoundedRect(18, 50, 26, 16, 6);
    baseGraphics.fillRoundedRect(bw - 44, 50, 26, 16, 6);

    baseGraphics.fillStyle(0x38bdf8, 0.9);
    baseGraphics.fillCircle(cx - 20, cy + 6, 6);
    baseGraphics.fillStyle(0xe0f2fe, 0.9);
    baseGraphics.fillCircle(cx - 22, cy + 4, 2);

    baseGraphics.fillStyle(0xfbbf24, 0.8);
    baseGraphics.fillCircle(cx - 60, cy + 6, 4);
    baseGraphics.fillStyle(0xfef3c7, 0.6);
    baseGraphics.fillCircle(cx - 60, cy + 6, 8);

    baseGraphics.lineStyle(2, 0x991b1b, 0.7);
    baseGraphics.strokeRoundedRect(8, 26, bw - 16, 42, 16);

    baseGraphics.generateTexture('assaultBaseRaider', bw, bh);
    baseGraphics.destroy();
}

function createCarrierAssaultBase(scene) { // Create carrier assault base.
    const baseGraphics = scene.add.graphics();
    const bw = 180;
    const bh = 88;
    const cx = bw / 2;

    baseGraphics.fillStyle(0x7c2d12, 1);
    baseGraphics.fillRoundedRect(4, 34, bw - 8, 40, 16);

    baseGraphics.fillStyle(0xf97316, 1);
    baseGraphics.fillRoundedRect(6, 30, bw - 12, 38, 14);

    baseGraphics.fillStyle(0xfb923c, 1);
    baseGraphics.fillRect(cx - 50, 24, 100, 14);

    baseGraphics.fillStyle(0x1f2937, 1);
    baseGraphics.fillRect(cx - 42, 27, 24, 8);
    baseGraphics.fillRect(cx + 18, 27, 24, 8);

    baseGraphics.fillStyle(0xea580c, 1);
    baseGraphics.fillRoundedRect(18, 52, 26, 16, 6);
    baseGraphics.fillRoundedRect(bw - 44, 52, 26, 16, 6);

    baseGraphics.fillStyle(0xfef08a, 0.8);
    baseGraphics.fillCircle(24, 60, 4);
    baseGraphics.fillCircle(bw - 24, 60, 4);

    baseGraphics.fillStyle(0xfdba74, 1);
    baseGraphics.fillRect(cx - 8, 18, 16, 10);
    baseGraphics.fillStyle(0x38bdf8, 0.9);
    baseGraphics.fillRect(cx - 6, 20, 12, 6);

    baseGraphics.lineStyle(2, 0x9a3412, 0.7);
    baseGraphics.strokeRoundedRect(6, 30, bw - 12, 38, 14);

    baseGraphics.generateTexture('assaultBaseCarrier', bw, bh);
    baseGraphics.destroy();
}

function createNovaAssaultBase(scene) { // Create nova assault base.
    const baseGraphics = scene.add.graphics();
    const bw = 180;
    const bh = 88;
    const cx = bw / 2;
    const cy = bh / 2 + 2;

    baseGraphics.fillStyle(0x0f172a, 1);
    baseGraphics.fillEllipse(cx, cy + 6, 150, 40);

    baseGraphics.fillStyle(0x6366f1, 0.35);
    baseGraphics.fillEllipse(cx, cy + 6, 160, 46);

    baseGraphics.fillStyle(0x4f46e5, 1);
    baseGraphics.fillEllipse(cx, cy + 6, 110, 32);

    baseGraphics.fillStyle(0x818cf8, 1);
    baseGraphics.fillEllipse(cx, cy + 2, 70, 20);

    baseGraphics.fillStyle(0x312e81, 1);
    baseGraphics.fillEllipse(cx - 54, cy + 6, 30, 20);
    baseGraphics.fillEllipse(cx + 54, cy + 6, 30, 20);

    baseGraphics.fillStyle(0x22d3ee, 0.95);
    baseGraphics.fillCircle(cx, cy + 8, 10);
    baseGraphics.fillStyle(0xe2e8f0, 0.9);
    baseGraphics.fillEllipse(cx, cy - 4, 18, 10);

    baseGraphics.lineStyle(2, 0x312e81, 0.8);
    baseGraphics.strokeEllipse(cx, cy + 6, 146, 38);

    baseGraphics.generateTexture('assaultBaseNova', bw, bh);
    baseGraphics.destroy();
}

function createSiegeAssaultBase(scene) { // Create siege assault base.
    const baseGraphics = scene.add.graphics();
    const bw = 180;
    const bh = 88;
    const cx = bw / 2;

    baseGraphics.fillStyle(0x1f2937, 1);
    baseGraphics.fillRect(10, 40, bw - 20, 28);

    baseGraphics.fillStyle(0x6b7280, 1);
    baseGraphics.fillRect(12, 38, bw - 24, 24);

    baseGraphics.fillStyle(0x9ca3af, 1);
    baseGraphics.fillRect(30, 30, bw - 60, 10);

    baseGraphics.fillStyle(0xe5e7eb, 1);
    baseGraphics.fillRect(cx + 10, 26, 50, 8);
    baseGraphics.fillStyle(0xfacc15, 1);
    baseGraphics.fillRect(cx + 56, 26, 10, 8);

    baseGraphics.fillStyle(0x4b5563, 1);
    baseGraphics.fillRect(24, 52, 30, 12);
    baseGraphics.fillRect(cx + 10, 52, 30, 12);

    baseGraphics.fillStyle(0x38bdf8, 0.9);
    baseGraphics.fillEllipse(cx - 44, 34, 16, 8);

    baseGraphics.fillStyle(0xf97316, 1);
    baseGraphics.fillCircle(24, 52, 4);
    baseGraphics.fillStyle(0xfdba74, 0.7);
    baseGraphics.fillCircle(24, 52, 8);

    baseGraphics.lineStyle(2, 0x111827, 0.6);
    baseGraphics.strokeRect(12, 38, bw - 24, 24);

    baseGraphics.generateTexture('assaultBaseSiege', bw, bh);
    baseGraphics.destroy();
}

function createDreadnoughtAssaultBase(scene) { // Create dreadnought assault base.
    const baseGraphics = scene.add.graphics();
    const bw = 180;
    const bh = 88;
    const cx = bw / 2;
    const cy = bh / 2 + 2;

    baseGraphics.fillStyle(0x312e81, 1);
    baseGraphics.fillEllipse(cx, cy + 6, 160, 46);

    baseGraphics.fillStyle(0x9333ea, 1);
    baseGraphics.fillEllipse(cx, cy + 4, 150, 40);

    baseGraphics.fillStyle(0xa855f7, 1);
    baseGraphics.fillEllipse(cx, cy, 110, 28);

    baseGraphics.fillStyle(0x4c1d95, 1);
    baseGraphics.fillRoundedRect(24, 50, 28, 18, 6);
    baseGraphics.fillRoundedRect(bw - 52, 50, 28, 18, 6);

    baseGraphics.fillStyle(0x38bdf8, 0.9);
    baseGraphics.fillCircle(cx, cy + 6, 12);
    baseGraphics.fillStyle(0xe0f2fe, 0.8);
    baseGraphics.fillCircle(cx, cy + 6, 5);

    baseGraphics.fillStyle(0xf472b6, 0.7);
    baseGraphics.fillEllipse(cx - 46, cy + 2, 14, 8);
    baseGraphics.fillEllipse(cx + 46, cy + 2, 14, 8);

    baseGraphics.lineStyle(2, 0x4c1d95, 0.7);
    baseGraphics.strokeEllipse(cx, cy + 4, 148, 38);

    baseGraphics.generateTexture('assaultBaseDreadnought', bw, bh);
    baseGraphics.destroy();
}
