// ------------------------
// Hangar Graphics - Fortified Extraction Hub
// ------------------------

function createHangarGraphics(scene) { // Create hangar graphics.
    const hangar = scene.add.graphics();
    const width = 96;
    const height = 64;
    const centerX = width / 2;

    // Shadow base
    hangar.fillStyle(0x0f172a, 0.6);
    hangar.fillEllipse(centerX, height - 6, 70, 12);

    // Platform base
    hangar.fillStyle(0x1f2937, 1);
    hangar.fillRoundedRect(8, 34, width - 16, 22, 6);
    hangar.fillStyle(0x111827, 1);
    hangar.fillRect(14, 40, width - 28, 12);

    // Hangar bay door
    hangar.fillStyle(0x0ea5e9, 0.9);
    hangar.fillRoundedRect(34, 20, 28, 20, 4);
    hangar.fillStyle(0x1e293b, 1);
    hangar.fillRect(38, 24, 20, 12);

    // Door struts
    hangar.lineStyle(2, 0x38bdf8, 0.9);
    hangar.strokeLineShape(new Phaser.Geom.Line(34, 30, 12, 18));
    hangar.strokeLineShape(new Phaser.Geom.Line(62, 30, 84, 18));

    // Upper superstructure
    hangar.fillStyle(0x334155, 1);
    hangar.fillRoundedRect(18, 6, width - 36, 18, 6);
    hangar.fillStyle(0x64748b, 1);
    hangar.fillRect(24, 10, width - 48, 6);

    // Side pylons
    hangar.fillStyle(0x1e293b, 1);
    hangar.fillRect(8, 18, 12, 30);
    hangar.fillRect(width - 20, 18, 12, 30);

    // Beacon lights
    hangar.fillStyle(0xf97316, 1);
    hangar.fillCircle(24, 14, 3);
    hangar.fillCircle(width - 24, 14, 3);

    // Landing chevrons
    hangar.lineStyle(2, 0x22d3ee, 0.8);
    hangar.strokeLineShape(new Phaser.Geom.Line(centerX - 10, 48, centerX, 56));
    hangar.strokeLineShape(new Phaser.Geom.Line(centerX + 10, 48, centerX, 56));

    hangar.generateTexture('hangar', width, height);
    hangar.destroy();
}
