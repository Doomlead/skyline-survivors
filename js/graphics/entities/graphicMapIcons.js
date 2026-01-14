// ------------------------
// Map Icon Graphics - Battleship & Mothership
// ------------------------

function createMapIconGraphics(scene) {
    createMapBattleshipIcon(scene);
    createMapMothershipIcon(scene);
}

function createMapBattleshipIcon(scene) {
    const icon = scene.add.graphics();
    const w = 36;
    const h = 30;
    const cx = w / 2;

    // Shadow hull
    icon.fillStyle(0x0f172a, 0.9);
    icon.fillEllipse(cx, 18, 28, 12);

    // Main hull
    icon.fillStyle(0x22d3ee, 0.95);
    icon.fillEllipse(cx, 17, 24, 10);

    // Upper ridge
    icon.fillStyle(0x38bdf8, 0.95);
    icon.fillEllipse(cx, 14, 16, 6);

    // Forward prongs
    icon.fillStyle(0x0ea5e9, 1);
    icon.beginPath();
    icon.moveTo(cx + 8, 17);
    icon.lineTo(cx + 16, 13);
    icon.lineTo(cx + 16, 21);
    icon.closePath();
    icon.fillPath();

    // Side fins
    icon.fillStyle(0x0ea5e9, 0.9);
    icon.beginPath();
    icon.moveTo(cx - 8, 18);
    icon.lineTo(cx - 16, 24);
    icon.lineTo(cx - 4, 22);
    icon.closePath();
    icon.fillPath();

    // Core glow
    icon.fillStyle(0xfef08a, 0.9);
    icon.fillCircle(cx - 8, 17, 2);
    icon.fillStyle(0xfde047, 0.5);
    icon.fillCircle(cx - 8, 17, 5);

    // Outline
    icon.lineStyle(1, 0xe0f2fe, 0.6);
    icon.strokeEllipse(cx, 17, 26, 10);

    icon.generateTexture('mapBattleshipIcon', w, h);
    icon.destroy();
}

function createMapMothershipIcon(scene) {
    const icon = scene.add.graphics();
    const w = 44;
    const h = 36;
    const cx = w / 2;

    // Outer ring
    icon.fillStyle(0x1e1b4b, 1);
    icon.fillEllipse(cx, 18, 34, 18);

    // Ring glow
    icon.fillStyle(0x6366f1, 0.5);
    icon.fillEllipse(cx, 18, 38, 22);

    // Core hull
    icon.fillStyle(0xa855f7, 1);
    icon.fillEllipse(cx, 18, 20, 10);

    // Spine
    icon.fillStyle(0xc4b5fd, 1);
    icon.fillRect(cx - 3, 10, 6, 14);

    // Reactor vents
    icon.fillStyle(0x22d3ee, 1);
    icon.fillCircle(cx - 9, 18, 3);
    icon.fillCircle(cx + 9, 18, 3);
    icon.fillStyle(0x67e8f9, 0.5);
    icon.fillCircle(cx - 9, 18, 6);
    icon.fillCircle(cx + 9, 18, 6);

    // Outline
    icon.lineStyle(1, 0xe0f2fe, 0.6);
    icon.strokeEllipse(cx, 18, 34, 18);

    icon.generateTexture('mapMothershipIcon', w, h);
    icon.destroy();
}
