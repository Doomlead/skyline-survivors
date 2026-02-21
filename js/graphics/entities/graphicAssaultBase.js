// ------------------------
// Assault Base Graphics - 5 Base Variants
// Assault bases keep the same silhouette/size and inherit battleship palettes
// ------------------------

function createAssaultBaseGraphics(scene) {
    const baseWidth = 180;
    const baseHeight = 88;

    drawAssaultBaseVariant(scene, 'assaultBaseRaider', baseWidth, baseHeight, {
        shadow: 0x7f1d1d,
        primary: 0xef4444,
        secondary: 0xf87171,
        accent: 0xdc2626,
        trim: 0xb91c1c,
        cockpit: 0x38bdf8,
        cockpitHighlight: 0xe0f2fe,
        glowCore: 0xfbbf24,
        glowHalo: 0xfef3c7,
        outline: 0x991b1b
    });

    drawAssaultBaseVariant(scene, 'assaultBaseCarrier', baseWidth, baseHeight, {
        shadow: 0x7c2d12,
        primary: 0xf97316,
        secondary: 0xfb923c,
        accent: 0xea580c,
        trim: 0x9a3412,
        cockpit: 0x38bdf8,
        cockpitHighlight: 0xfdba74,
        glowCore: 0xfef08a,
        glowHalo: 0xffedd5,
        outline: 0x7c2d12
    });

    drawAssaultBaseVariant(scene, 'assaultBaseNova', baseWidth, baseHeight, {
        shadow: 0x0f172a,
        primary: 0x4f46e5,
        secondary: 0x6366f1,
        accent: 0x818cf8,
        trim: 0x312e81,
        cockpit: 0x22d3ee,
        cockpitHighlight: 0xe2e8f0,
        glowCore: 0x60a5fa,
        glowHalo: 0x1e3a8a,
        outline: 0x312e81
    });

    drawAssaultBaseVariant(scene, 'assaultBaseSiege', baseWidth, baseHeight, {
        shadow: 0x1f2937,
        primary: 0x6b7280,
        secondary: 0x9ca3af,
        accent: 0xe5e7eb,
        trim: 0x4b5563,
        cockpit: 0x38bdf8,
        cockpitHighlight: 0xe0f2fe,
        glowCore: 0xf97316,
        glowHalo: 0xfdba74,
        outline: 0x111827
    });

    drawAssaultBaseVariant(scene, 'assaultBaseDreadnought', baseWidth, baseHeight, {
        shadow: 0x312e81,
        primary: 0x9333ea,
        secondary: 0xa855f7,
        accent: 0xc4b5fd,
        trim: 0x7e22ce,
        cockpit: 0x22d3ee,
        cockpitHighlight: 0x67e8f9,
        glowCore: 0xf472b6,
        glowHalo: 0xbe185d,
        outline: 0x6d28d9
    });
}

/**
 * Handles the drawAssaultBaseVariant routine and encapsulates its core gameplay logic.
 * Parameters: scene, textureKey, bw, bh, palette.
 * Returns: value defined by the surrounding game flow.
 */
function drawAssaultBaseVariant(scene, textureKey, bw, bh, palette) {
    const baseGraphics = scene.add.graphics();
    const cx = bw / 2;
    const cy = bh / 2;

    // Keep the assault mission base profile and footprint consistent for all variants.
    baseGraphics.fillStyle(palette.shadow, 1);
    baseGraphics.fillRoundedRect(6, 30, bw - 12, 44, 16);

    baseGraphics.fillStyle(palette.primary, 1);
    baseGraphics.fillRoundedRect(8, 26, bw - 16, 42, 16);

    baseGraphics.fillStyle(palette.secondary, 1);
    baseGraphics.fillRoundedRect(24, 18, bw - 48, 18, 10);

    // Forward command module.
    baseGraphics.fillStyle(palette.accent, 1);
    baseGraphics.beginPath();
    baseGraphics.moveTo(cx + 46, 44);
    baseGraphics.lineTo(cx + 70, 36);
    baseGraphics.lineTo(cx + 70, 52);
    baseGraphics.closePath();
    baseGraphics.fillPath();

    // Side armor blocks.
    baseGraphics.fillStyle(palette.trim, 1);
    baseGraphics.fillRoundedRect(18, 50, 26, 16, 6);
    baseGraphics.fillRoundedRect(bw - 44, 50, 26, 16, 6);

    // Sensor cockpit.
    baseGraphics.fillStyle(palette.cockpit, 0.9);
    baseGraphics.fillCircle(cx - 20, cy + 6, 6);
    baseGraphics.fillStyle(palette.cockpitHighlight, 0.9);
    baseGraphics.fillCircle(cx - 22, cy + 4, 2);

    // Rear power core.
    baseGraphics.fillStyle(palette.glowCore, 0.85);
    baseGraphics.fillCircle(cx - 60, cy + 6, 4);
    baseGraphics.fillStyle(palette.glowHalo, 0.45);
    baseGraphics.fillCircle(cx - 60, cy + 6, 8);

    // Panel outline.
    baseGraphics.lineStyle(2, palette.outline, 0.7);
    baseGraphics.strokeRoundedRect(8, 26, bw - 16, 42, 16);

    baseGraphics.generateTexture(textureKey, bw, bh);
    baseGraphics.destroy();
}
