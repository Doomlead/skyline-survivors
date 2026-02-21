// ------------------------
// Enemy Graphics - Original (Lander, Mutant)
// ------------------------

function createLanderGraphics(scene) {
    // ========================
    // LANDER - Classic UFO Abductor
    // ========================
    const landerGraphics = scene.add.graphics();
    const lw = 24, lh = 20;
    const lcx = lw / 2;

    // Tractor beam glow (underneath)
    landerGraphics.fillStyle(0x00ff00, 0.1);
    landerGraphics.fillTriangle(lcx - 4, 14, lcx + 4, 14, lcx, 20);
    landerGraphics.fillStyle(0x00ff00, 0.2);
    landerGraphics.fillTriangle(lcx - 3, 14, lcx + 3, 14, lcx, 18);

    // Bottom hull shadow
    landerGraphics.fillStyle(0x881111, 1);
    landerGraphics.fillEllipse(lcx, 11, 20, 6);

    // Main saucer body
    landerGraphics.fillStyle(0xcc3333, 1);
    landerGraphics.fillEllipse(lcx, 10, 22, 7);

    // Saucer top surface
    landerGraphics.fillStyle(0xff4444, 1);
    landerGraphics.fillEllipse(lcx, 9, 20, 6);

    // Hull highlight ring
    landerGraphics.fillStyle(0xff6666, 1);
    landerGraphics.fillEllipse(lcx, 8, 16, 4);

    // Dome base
    landerGraphics.fillStyle(0xcc2222, 1);
    landerGraphics.fillEllipse(lcx, 7, 12, 4);

    // Dome main
    landerGraphics.fillStyle(0xff5555, 1);
    landerGraphics.fillEllipse(lcx, 5, 10, 6);

    // Dome highlight
    landerGraphics.fillStyle(0xff7777, 1);
    landerGraphics.fillEllipse(lcx - 1, 4, 6, 4);

    // Dome glass effect
    landerGraphics.fillStyle(0xffaaaa, 0.6);
    landerGraphics.fillEllipse(lcx - 2, 3, 3, 2);

    // Dome specular
    landerGraphics.fillStyle(0xffffff, 0.8);
    landerGraphics.fillCircle(lcx - 2, 3, 1);

    // Running lights around rim
    landerGraphics.fillStyle(0xffff00, 1);
    landerGraphics.fillCircle(lcx - 8, 10, 1.2);
    landerGraphics.fillCircle(lcx - 4, 11, 1.2);
    landerGraphics.fillCircle(lcx, 11.5, 1.2);
    landerGraphics.fillCircle(lcx + 4, 11, 1.2);
    landerGraphics.fillCircle(lcx + 8, 10, 1.2);

    // Light glows
    landerGraphics.fillStyle(0xffff00, 0.3);
    landerGraphics.fillCircle(lcx - 8, 10, 2.5);
    landerGraphics.fillCircle(lcx, 11.5, 2.5);
    landerGraphics.fillCircle(lcx + 8, 10, 2.5);

    // Landing legs
    landerGraphics.fillStyle(0x993333, 1);
    landerGraphics.fillRect(lcx - 7, 13, 2, 4);
    landerGraphics.fillRect(lcx + 5, 13, 2, 4);
    landerGraphics.fillRect(lcx - 1, 13, 2, 3);

    // Leg feet
    landerGraphics.fillStyle(0x772222, 1);
    landerGraphics.fillRect(lcx - 8, 16, 4, 1);
    landerGraphics.fillRect(lcx + 4, 16, 4, 1);

    // Hull panel lines
    landerGraphics.lineStyle(1, 0xaa2222, 0.6);
    landerGraphics.beginPath();
    landerGraphics.moveTo(lcx - 6, 8);
    landerGraphics.lineTo(lcx - 6, 12);
    landerGraphics.strokePath();
    landerGraphics.beginPath();
    landerGraphics.moveTo(lcx + 6, 8);
    landerGraphics.lineTo(lcx + 6, 12);
    landerGraphics.strokePath();

    // Rim edge
    landerGraphics.lineStyle(1, 0x881111, 0.8);
    landerGraphics.strokeEllipse(lcx, 10, 21, 7);

    // Dome edge
    landerGraphics.lineStyle(1, 0xcc4444, 0.5);
    landerGraphics.strokeEllipse(lcx, 5, 10, 6);

    // Center viewport
    landerGraphics.fillStyle(0x00ffff, 0.8);
    landerGraphics.fillCircle(lcx, 6, 1.5);
    landerGraphics.fillStyle(0xffffff, 0.6);
    landerGraphics.fillCircle(lcx - 0.5, 5.5, 0.5);

    landerGraphics.generateTexture('lander', lw, lh);
    landerGraphics.destroy();
}

/**
 * Handles the createMutantGraphics routine and encapsulates its core gameplay logic.
 * Parameters: scene.
 * Returns: value defined by the surrounding game flow.
 */
function createMutantGraphics(scene) {
    // ========================
    // MUTANT - Transformed Human Alien
    // ========================
    const mutantGraphics = scene.add.graphics();
    const mw = 20, mh = 24;
    const mcx = mw / 2;

    // Energy aura
    mutantGraphics.fillStyle(0xff4400, 0.1);
    mutantGraphics.fillCircle(mcx, 12, 11);
    mutantGraphics.fillStyle(0xff6600, 0.15);
    mutantGraphics.fillCircle(mcx, 12, 8);

    // Tail
    mutantGraphics.fillStyle(0xcc5522, 1);
    mutantGraphics.beginPath();
    mutantGraphics.moveTo(mcx + 2, 16);
    mutantGraphics.lineTo(mcx + 8, 22);
    mutantGraphics.lineTo(mcx + 6, 20);
    mutantGraphics.lineTo(mcx + 4, 18);
    mutantGraphics.closePath();
    mutantGraphics.fillPath();

    // Tail spike
    mutantGraphics.fillStyle(0xaa3311, 1);
    mutantGraphics.beginPath();
    mutantGraphics.moveTo(mcx + 7, 21);
    mutantGraphics.lineTo(mcx + 10, 23);
    mutantGraphics.lineTo(mcx + 8, 22);
    mutantGraphics.closePath();
    mutantGraphics.fillPath();

    // Legs shadow
    mutantGraphics.fillStyle(0xcc5522, 1);
    mutantGraphics.fillRect(mcx - 3.5, 16, 2.5, 5);
    mutantGraphics.fillRect(mcx + 1, 16, 2.5, 5);

    // Legs main
    mutantGraphics.fillStyle(0xff7744, 1);
    mutantGraphics.fillRect(mcx - 3, 15, 2, 5);
    mutantGraphics.fillRect(mcx + 1, 15, 2, 5);

    // Leg muscle detail
    mutantGraphics.fillStyle(0xff9966, 0.7);
    mutantGraphics.fillRect(mcx - 2.5, 16, 1, 3);
    mutantGraphics.fillRect(mcx + 1.5, 16, 1, 3);

    // Feet claws
    mutantGraphics.fillStyle(0xaa4422, 1);
    mutantGraphics.beginPath();
    mutantGraphics.moveTo(mcx - 4, 20);
    mutantGraphics.lineTo(mcx - 5, 22);
    mutantGraphics.lineTo(mcx - 3, 20);
    mutantGraphics.closePath();
    mutantGraphics.fillPath();
    mutantGraphics.beginPath();
    mutantGraphics.moveTo(mcx - 2, 20);
    mutantGraphics.lineTo(mcx - 1.5, 22);
    mutantGraphics.lineTo(mcx - 1, 20);
    mutantGraphics.closePath();
    mutantGraphics.fillPath();
    mutantGraphics.beginPath();
    mutantGraphics.moveTo(mcx + 1, 20);
    mutantGraphics.lineTo(mcx + 1.5, 22);
    mutantGraphics.lineTo(mcx + 2, 20);
    mutantGraphics.closePath();
    mutantGraphics.fillPath();
    mutantGraphics.beginPath();
    mutantGraphics.moveTo(mcx + 3, 20);
    mutantGraphics.lineTo(mcx + 4.5, 22);
    mutantGraphics.lineTo(mcx + 4, 20);
    mutantGraphics.closePath();
    mutantGraphics.fillPath();

    // Torso shadow
    mutantGraphics.fillStyle(0xcc6633, 1);
    mutantGraphics.fillEllipse(mcx, 12, 8, 7);

    // Torso main
    mutantGraphics.fillStyle(0xff8844, 1);
    mutantGraphics.fillEllipse(mcx, 11, 7, 6);

    // Torso highlight
    mutantGraphics.fillStyle(0xffaa66, 0.7);
    mutantGraphics.fillEllipse(mcx - 1, 10, 4, 4);

    // Chest detail
    mutantGraphics.lineStyle(1, 0xcc6633, 0.5);
    mutantGraphics.beginPath();
    mutantGraphics.moveTo(mcx, 8);
    mutantGraphics.lineTo(mcx, 14);
    mutantGraphics.strokePath();

    // Arms
    mutantGraphics.fillStyle(0xff9955, 1);
    mutantGraphics.beginPath();
    mutantGraphics.moveTo(mcx - 4, 9);
    mutantGraphics.lineTo(mcx - 7, 12);
    mutantGraphics.lineTo(mcx - 8, 16);
    mutantGraphics.lineTo(mcx - 6, 15);
    mutantGraphics.lineTo(mcx - 5, 12);
    mutantGraphics.lineTo(mcx - 3, 10);
    mutantGraphics.closePath();
    mutantGraphics.fillPath();
    mutantGraphics.beginPath();
    mutantGraphics.moveTo(mcx + 4, 9);
    mutantGraphics.lineTo(mcx + 7, 12);
    mutantGraphics.lineTo(mcx + 8, 16);
    mutantGraphics.lineTo(mcx + 6, 15);
    mutantGraphics.lineTo(mcx + 5, 12);
    mutantGraphics.lineTo(mcx + 3, 10);
    mutantGraphics.closePath();
    mutantGraphics.fillPath();

    // Arm claws
    mutantGraphics.fillStyle(0xaa4422, 1);
    mutantGraphics.beginPath();
    mutantGraphics.moveTo(mcx - 8, 16);
    mutantGraphics.lineTo(mcx - 10, 18);
    mutantGraphics.lineTo(mcx - 7, 16);
    mutantGraphics.closePath();
    mutantGraphics.fillPath();
    mutantGraphics.beginPath();
    mutantGraphics.moveTo(mcx + 8, 16);
    mutantGraphics.lineTo(mcx + 10, 18);
    mutantGraphics.lineTo(mcx + 7, 16);
    mutantGraphics.closePath();
    mutantGraphics.fillPath();

    // Head shadow
    mutantGraphics.fillStyle(0xcc7744, 1);
    mutantGraphics.fillEllipse(mcx, 5, 7, 6);

    // Head main
    mutantGraphics.fillStyle(0xffaa66, 1);
    mutantGraphics.fillEllipse(mcx, 4.5, 6.5, 5.5);

    // Head highlight
    mutantGraphics.fillStyle(0xffcc88, 0.6);
    mutantGraphics.fillEllipse(mcx - 1, 3, 3, 3);

    // Antennae
    mutantGraphics.lineStyle(1.5, 0xcc7744, 1);
    mutantGraphics.beginPath();
    mutantGraphics.moveTo(mcx - 2, 1);
    mutantGraphics.lineTo(mcx - 4, -1);
    mutantGraphics.lineTo(mcx - 3, 0);
    mutantGraphics.strokePath();
    mutantGraphics.beginPath();
    mutantGraphics.moveTo(mcx + 2, 1);
    mutantGraphics.lineTo(mcx + 4, -1);
    mutantGraphics.lineTo(mcx + 3, 0);
    mutantGraphics.strokePath();

    // Antenna tips
    mutantGraphics.fillStyle(0xff6600, 1);
    mutantGraphics.fillCircle(mcx - 4, -1, 1);
    mutantGraphics.fillCircle(mcx + 4, -1, 1);
    mutantGraphics.fillStyle(0xffaa00, 0.5);
    mutantGraphics.fillCircle(mcx - 4, -1, 2);
    mutantGraphics.fillCircle(mcx + 4, -1, 2);

    // Eye sockets
    mutantGraphics.fillStyle(0x220000, 1);
    mutantGraphics.fillEllipse(mcx - 2, 4, 2.5, 2);
    mutantGraphics.fillEllipse(mcx + 2, 4, 2.5, 2);

    // Eyes glow
    mutantGraphics.fillStyle(0xffff00, 0.4);
    mutantGraphics.fillCircle(mcx - 2, 4, 2);
    mutantGraphics.fillCircle(mcx + 2, 4, 2);

    // Eyes main
    mutantGraphics.fillStyle(0xffff00, 1);
    mutantGraphics.fillCircle(mcx - 2, 4, 1.2);
    mutantGraphics.fillCircle(mcx + 2, 4, 1.2);

    // Eye highlights
    mutantGraphics.fillStyle(0xffffaa, 1);
    mutantGraphics.fillCircle(mcx - 2.3, 3.7, 0.5);
    mutantGraphics.fillCircle(mcx + 1.7, 3.7, 0.5);

    // Pupils
    mutantGraphics.fillStyle(0x000000, 1);
    mutantGraphics.fillCircle(mcx - 1.8, 4.2, 0.4);
    mutantGraphics.fillCircle(mcx + 2.2, 4.2, 0.4);

    // Mouth
    mutantGraphics.fillStyle(0x881111, 1);
    mutantGraphics.beginPath();
    mutantGraphics.moveTo(mcx - 1.5, 6.5);
    mutantGraphics.lineTo(mcx, 8);
    mutantGraphics.lineTo(mcx + 1.5, 6.5);
    mutantGraphics.closePath();
    mutantGraphics.fillPath();

    // Teeth
    mutantGraphics.fillStyle(0xffffcc, 1);
    mutantGraphics.fillTriangle(mcx - 0.8, 6.5, mcx - 0.3, 7.2, mcx, 6.5);
    mutantGraphics.fillTriangle(mcx, 6.5, mcx + 0.3, 7.2, mcx + 0.8, 6.5);

    mutantGraphics.generateTexture('mutant', mw, mh);
    mutantGraphics.destroy();
}
