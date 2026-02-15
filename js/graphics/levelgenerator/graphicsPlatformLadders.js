// ═══════════════════════════════════════════════════════════════════════════
// graphicsPlatformLadders.js - Interior platform/ladder texture generation
// ═══════════════════════════════════════════════════════════════════════════

function ensurePlatformLadderGraphics(scene) {
    if (!scene || !scene.add || !scene.textures) return;

    if (!scene.textures.exists('interior_platform_tile')) {
        var g = scene.add.graphics();
        g.fillStyle(0x2f2440, 1);
        g.fillRect(0, 0, 64, 16);
        g.fillStyle(0x47325d, 1);
        g.fillRect(0, 2, 64, 5);
        g.fillStyle(0x6f5f8d, 0.75);
        for (var x = 4; x < 60; x += 10) {
            g.fillCircle(x, 8, 1.5);
        }
        g.lineStyle(1, 0x8f82aa, 0.55);
        g.strokeRect(0.5, 0.5, 63, 15);
        g.generateTexture('interior_platform_tile', 64, 16);
        g.destroy();
    }

    if (!scene.textures.exists('interior_ladder_tile')) {
        var l = scene.add.graphics();
        l.fillStyle(0x2f5e67, 1);
        l.fillRect(0, 0, 16, 32);
        l.fillStyle(0x8fdde2, 0.9);
        l.fillRect(1, 0, 2, 32);
        l.fillRect(13, 0, 2, 32);
        l.fillStyle(0xb7f0f3, 0.75);
        for (var y = 4; y < 31; y += 6) {
            l.fillRect(3, y, 10, 2);
        }
        l.lineStyle(1, 0xb8f7ff, 0.35);
        l.strokeRect(0.5, 0.5, 15, 31);
        l.generateTexture('interior_ladder_tile', 16, 32);
        l.destroy();
    }
}
