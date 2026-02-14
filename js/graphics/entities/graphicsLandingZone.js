// ------------------------
// Landing Zone Graphics - Rebuild Pad
// ------------------------

function createLandingZoneGraphics(scene) { // Create landing zone graphics.
    const zone = scene.add.graphics();
    const width = 120;
    const height = 56;
    const centerX = width / 2;
    const centerY = height / 2 + 4;

    // Ground shadow
    zone.fillStyle(0x0f172a, 0.5);
    zone.fillEllipse(centerX, centerY + 10, 100, 20);

    // Outer pad ring
    zone.fillStyle(0x1f2937, 1);
    zone.fillEllipse(centerX, centerY + 6, 110, 26);
    zone.fillStyle(0x0f172a, 1);
    zone.fillEllipse(centerX, centerY + 6, 90, 20);

    // Inner pad
    zone.fillStyle(0x334155, 1);
    zone.fillEllipse(centerX, centerY + 4, 70, 16);

    // Rebuild glow
    zone.fillStyle(0x22d3ee, 0.4);
    zone.fillEllipse(centerX, centerY + 4, 76, 20);

    // Directional chevrons
    zone.lineStyle(3, 0x38bdf8, 0.9);
    zone.strokeLineShape(new Phaser.Geom.Line(centerX - 26, centerY + 2, centerX - 6, centerY + 10));
    zone.strokeLineShape(new Phaser.Geom.Line(centerX + 26, centerY + 2, centerX + 6, centerY + 10));

    // Center emblem
    zone.fillStyle(0x67e8f9, 0.9);
    zone.fillCircle(centerX, centerY + 2, 6);
    zone.fillStyle(0xe0f2fe, 0.9);
    zone.fillCircle(centerX, centerY + 2, 2);

    // Edge lights
    zone.fillStyle(0xf97316, 0.9);
    zone.fillCircle(centerX - 40, centerY + 6, 2);
    zone.fillCircle(centerX + 40, centerY + 6, 2);

    zone.generateTexture('landingZone', width, height);
    zone.destroy();
}
