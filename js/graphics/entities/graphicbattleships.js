// ------------------------
// Battleship Graphics - 5 Battleship Sprites
// Aligned with Enemy/Boss visual style
// ------------------------

function createBattleshipGraphics(scene) {
    createRaiderBattleship(scene);
    createCarrierBattleship(scene);
    createNovaBattleship(scene);
    createSiegeBattleship(scene);
    createDreadnoughtBattleship(scene);
}

/**
 * Handles the createRaiderBattleship routine and encapsulates its core gameplay logic.
 * Parameters: scene.
 * Returns: value defined by the surrounding game flow.
 */
function createRaiderBattleship(scene) {
    // ========================
    // RAIDER - Sleek attack craft
    // ========================
    const raiderGraphics = scene.add.graphics();
    const rw = 64, rh = 34;
    const rcx = rw / 2;

    // Hull shadow
    raiderGraphics.fillStyle(0x7f1d1d, 1);
    raiderGraphics.fillEllipse(rcx, 19, 54, 14);

    // Main hull
    raiderGraphics.fillStyle(0xef4444, 1);
    raiderGraphics.fillEllipse(rcx, 18, 52, 13);

    // Top plating
    raiderGraphics.fillStyle(0xf87171, 1);
    raiderGraphics.fillEllipse(rcx, 15, 38, 9);

    // Nose spike
    raiderGraphics.fillStyle(0xdc2626, 1);
    raiderGraphics.beginPath();
    raiderGraphics.moveTo(rcx + 24, 18);
    raiderGraphics.lineTo(rcx + 31, 15);
    raiderGraphics.lineTo(rcx + 31, 21);
    raiderGraphics.closePath();
    raiderGraphics.fillPath();

    // Wing fins
    raiderGraphics.fillStyle(0xb91c1c, 1);
    raiderGraphics.beginPath();
    raiderGraphics.moveTo(rcx - 18, 20);
    raiderGraphics.lineTo(rcx - 30, 28);
    raiderGraphics.lineTo(rcx - 10, 24);
    raiderGraphics.closePath();
    raiderGraphics.fillPath();

    raiderGraphics.beginPath();
    raiderGraphics.moveTo(rcx - 10, 20);
    raiderGraphics.lineTo(rcx + 6, 30);
    raiderGraphics.lineTo(rcx + 4, 22);
    raiderGraphics.closePath();
    raiderGraphics.fillPath();

    // Cockpit dome
    raiderGraphics.fillStyle(0x38bdf8, 0.9);
    raiderGraphics.fillEllipse(rcx - 6, 13, 10, 6);
    raiderGraphics.fillStyle(0xe0f2fe, 0.9);
    raiderGraphics.fillCircle(rcx - 7, 12, 1.5);

    // Engine glow
    raiderGraphics.fillStyle(0xfbbf24, 1);
    raiderGraphics.fillCircle(rcx - 24, 18, 3.5);
    raiderGraphics.fillStyle(0xfef3c7, 0.7);
    raiderGraphics.fillCircle(rcx - 24, 18, 6);

    // Panel lines
    raiderGraphics.lineStyle(1, 0x991b1b, 0.6);
    raiderGraphics.strokeEllipse(rcx, 18, 50, 12);

    raiderGraphics.generateTexture('battleshipRaider', rw, rh);
    raiderGraphics.destroy();
}

/**
 * Handles the createCarrierBattleship routine and encapsulates its core gameplay logic.
 * Parameters: scene.
 * Returns: value defined by the surrounding game flow.
 */
function createCarrierBattleship(scene) {
    // ========================
    // CARRIER - Heavy hangar ship
    // ========================
    const carrierGraphics = scene.add.graphics();
    const cw = 84, ch = 40;
    const ccx = cw / 2;

    // Hull shadow
    carrierGraphics.fillStyle(0x7c2d12, 1);
    carrierGraphics.fillEllipse(ccx, 22, 70, 18);

    // Main hull
    carrierGraphics.fillStyle(0xf97316, 1);
    carrierGraphics.fillEllipse(ccx, 21, 68, 16);

    // Hangar deck
    carrierGraphics.fillStyle(0xfb923c, 1);
    carrierGraphics.fillRect(ccx - 24, 14, 48, 8);

    // Hangar openings
    carrierGraphics.fillStyle(0x1f2937, 1);
    carrierGraphics.fillRect(ccx - 20, 16, 10, 5);
    carrierGraphics.fillRect(ccx + 10, 16, 10, 5);

    // Side engines
    carrierGraphics.fillStyle(0xea580c, 1);
    carrierGraphics.fillEllipse(ccx - 28, 24, 12, 8);
    carrierGraphics.fillEllipse(ccx + 28, 24, 12, 8);

    // Engine glow
    carrierGraphics.fillStyle(0xfef08a, 0.8);
    carrierGraphics.fillCircle(ccx - 32, 24, 4);
    carrierGraphics.fillCircle(ccx + 32, 24, 4);

    // Command tower
    carrierGraphics.fillStyle(0xfdba74, 1);
    carrierGraphics.fillRect(ccx - 6, 8, 12, 8);
    carrierGraphics.fillStyle(0x38bdf8, 0.9);
    carrierGraphics.fillRect(ccx - 4, 10, 8, 4);

    // Panel lines
    carrierGraphics.lineStyle(1, 0x9a3412, 0.6);
    carrierGraphics.strokeEllipse(ccx, 21, 66, 16);

    carrierGraphics.generateTexture('battleshipCarrier', cw, ch);
    carrierGraphics.destroy();
}

/**
 * Handles the createNovaBattleship routine and encapsulates its core gameplay logic.
 * Parameters: scene.
 * Returns: value defined by the surrounding game flow.
 */
function createNovaBattleship(scene) {
    // ========================
    // NOVA - Twin-ring assault ship
    // ========================
    const novaGraphics = scene.add.graphics();
    const nw = 70, nh = 44;
    const ncx = nw / 2;

    // Outer ring
    novaGraphics.fillStyle(0x0f172a, 1);
    novaGraphics.fillEllipse(ncx, 22, 64, 28);

    // Ring glow
    novaGraphics.fillStyle(0x6366f1, 0.35);
    novaGraphics.fillEllipse(ncx, 22, 68, 32);

    // Core hull
    novaGraphics.fillStyle(0x4f46e5, 1);
    novaGraphics.fillEllipse(ncx, 22, 44, 20);

    // Inner core highlight
    novaGraphics.fillStyle(0x818cf8, 1);
    novaGraphics.fillEllipse(ncx, 20, 28, 12);

    // Wing pods
    novaGraphics.fillStyle(0x312e81, 1);
    novaGraphics.fillEllipse(ncx - 22, 22, 14, 10);
    novaGraphics.fillEllipse(ncx + 22, 22, 14, 10);

    // Energy vents
    novaGraphics.fillStyle(0x22d3ee, 1);
    novaGraphics.fillCircle(ncx - 10, 22, 3);
    novaGraphics.fillCircle(ncx + 10, 22, 3);

    // Dome
    novaGraphics.fillStyle(0xe2e8f0, 0.9);
    novaGraphics.fillEllipse(ncx, 16, 10, 6);

    // Panel ring
    novaGraphics.lineStyle(1, 0x312e81, 0.8);
    novaGraphics.strokeEllipse(ncx, 22, 62, 26);

    novaGraphics.generateTexture('battleshipNova', nw, nh);
    novaGraphics.destroy();
}

/**
 * Handles the createSiegeBattleship routine and encapsulates its core gameplay logic.
 * Parameters: scene.
 * Returns: value defined by the surrounding game flow.
 */
function createSiegeBattleship(scene) {
    // ========================
    // SIEGE - Long-range artillery ship
    // ========================
    const siegeGraphics = scene.add.graphics();
    const sw = 90, sh = 30;
    const scx = sw / 2;

    // Hull shadow
    siegeGraphics.fillStyle(0x1f2937, 1);
    siegeGraphics.fillRect(8, 14, 74, 10);

    // Main hull
    siegeGraphics.fillStyle(0x6b7280, 1);
    siegeGraphics.fillRect(10, 13, 70, 9);

    // Barrel spine
    siegeGraphics.fillStyle(0x9ca3af, 1);
    siegeGraphics.fillRect(18, 10, 46, 4);

    // Cannon barrel
    siegeGraphics.fillStyle(0xe5e7eb, 1);
    siegeGraphics.fillRect(56, 8, 28, 4);
    siegeGraphics.fillStyle(0xfacc15, 1);
    siegeGraphics.fillRect(82, 8, 6, 4);

    // Mid plating
    siegeGraphics.fillStyle(0x4b5563, 1);
    siegeGraphics.fillRect(28, 20, 22, 6);
    siegeGraphics.fillRect(52, 20, 16, 6);

    // Cockpit
    siegeGraphics.fillStyle(0x38bdf8, 0.9);
    siegeGraphics.fillEllipse(24, 12, 10, 6);

    // Rear thrusters
    siegeGraphics.fillStyle(0xf97316, 1);
    siegeGraphics.fillCircle(12, 18, 3);
    siegeGraphics.fillStyle(0xfdba74, 0.7);
    siegeGraphics.fillCircle(12, 18, 6);

    // Outline
    siegeGraphics.lineStyle(1, 0x111827, 0.6);
    siegeGraphics.strokeRect(10, 13, 70, 9);

    siegeGraphics.generateTexture('battleshipSiege', sw, sh);
    siegeGraphics.destroy();
}

/**
 * Handles the createDreadnoughtBattleship routine and encapsulates its core gameplay logic.
 * Parameters: scene.
 * Returns: value defined by the surrounding game flow.
 */
function createDreadnoughtBattleship(scene) {
    // ========================
    // DREADNOUGHT - Massive command ship
    // ========================
    const dreadGraphics = scene.add.graphics();
    const dw = 96, dh = 48;
    const dcx = dw / 2;

    // Hull shadow
    dreadGraphics.fillStyle(0x312e81, 1);
    dreadGraphics.fillEllipse(dcx, 26, 82, 24);

    // Main hull
    dreadGraphics.fillStyle(0x9333ea, 1);
    dreadGraphics.fillEllipse(dcx, 24, 80, 22);

    // Upper deck
    dreadGraphics.fillStyle(0xa855f7, 1);
    dreadGraphics.fillEllipse(dcx, 19, 58, 14);

    // Command bridge
    dreadGraphics.fillStyle(0xc4b5fd, 1);
    dreadGraphics.fillRect(dcx - 8, 10, 16, 8);
    dreadGraphics.fillStyle(0x38bdf8, 0.9);
    dreadGraphics.fillRect(dcx - 6, 12, 12, 4);

    // Shoulder cannons
    dreadGraphics.fillStyle(0x7e22ce, 1);
    dreadGraphics.fillRect(dcx - 30, 18, 12, 6);
    dreadGraphics.fillRect(dcx + 18, 18, 12, 6);
    dreadGraphics.fillStyle(0xf472b6, 1);
    dreadGraphics.fillRect(dcx - 34, 18, 4, 6);
    dreadGraphics.fillRect(dcx + 30, 18, 4, 6);

    // Engine vents
    dreadGraphics.fillStyle(0x22d3ee, 1);
    dreadGraphics.fillCircle(dcx - 24, 26, 4);
    dreadGraphics.fillCircle(dcx, 27, 4);
    dreadGraphics.fillCircle(dcx + 24, 26, 4);
    dreadGraphics.fillStyle(0x67e8f9, 0.6);
    dreadGraphics.fillCircle(dcx - 24, 26, 7);
    dreadGraphics.fillCircle(dcx + 24, 26, 7);

    // Armor ribs
    dreadGraphics.lineStyle(1, 0x6d28d9, 0.6);
    for (let i = -2; i <= 2; i++) {
        dreadGraphics.strokeEllipse(dcx, 24 + i * 2, 78 - i * 4, 22 - i * 2);
    }

    dreadGraphics.generateTexture('battleshipDreadnought', dw, dh);
    dreadGraphics.destroy();
}
