// ------------------------
// Enemy Graphics - Original (Drone, Bomber)
// ------------------------

function createDroneGraphics(scene) { // Create drone graphics.
    // ========================
    // DRONE - Patrol Orb
    // ========================
    const droneGraphics = scene.add.graphics();
    const dw = 18, dh = 18;
    const dcx = dw / 2, dcy = dh / 2;

    // Outer energy field
    droneGraphics.fillStyle(0xff00ff, 0.1);
    droneGraphics.fillCircle(dcx, dcy, 9);

    // Secondary glow
    droneGraphics.fillStyle(0xff44ff, 0.15);
    droneGraphics.fillCircle(dcx, dcy, 7.5);

    // Outer ring
    droneGraphics.lineStyle(2, 0xcc00cc, 0.6);
    droneGraphics.strokeCircle(dcx, dcy, 7);

    // Main body shadow
    droneGraphics.fillStyle(0xaa00aa, 1);
    droneGraphics.fillCircle(dcx, dcy + 0.5, 6);

    // Main body
    droneGraphics.fillStyle(0xff44ff, 1);
    droneGraphics.fillCircle(dcx, dcy, 5.5);

    // Body highlight
    droneGraphics.fillStyle(0xff88ff, 1);
    droneGraphics.fillCircle(dcx - 1, dcy - 1, 4);

    // Surface shine
    droneGraphics.fillStyle(0xffaaff, 0.7);
    droneGraphics.fillCircle(dcx - 2, dcy - 2, 2.5);

    // Specular
    droneGraphics.fillStyle(0xffffff, 0.9);
    droneGraphics.fillCircle(dcx - 2.5, dcy - 2.5, 1.2);

    // Inner core glow
    droneGraphics.fillStyle(0xaa00aa, 1);
    droneGraphics.fillCircle(dcx, dcy, 2.5);

    // Inner core
    droneGraphics.fillStyle(0xff00ff, 1);
    droneGraphics.fillCircle(dcx, dcy, 1.8);

    // Core bright center
    droneGraphics.fillStyle(0xffaaff, 1);
    droneGraphics.fillCircle(dcx, dcy, 1);

    // Sensor nodes
    droneGraphics.fillStyle(0x00ffff, 0.9);
    droneGraphics.fillCircle(dcx, dcy - 4.5, 1);
    droneGraphics.fillCircle(dcx + 4, dcy + 2, 1);
    droneGraphics.fillCircle(dcx - 4, dcy + 2, 1);

    // Sensor glows
    droneGraphics.fillStyle(0x00ffff, 0.3);
    droneGraphics.fillCircle(dcx, dcy - 4.5, 2);
    droneGraphics.fillCircle(dcx + 4, dcy + 2, 2);
    droneGraphics.fillCircle(dcx - 4, dcy + 2, 2);

    // Energy ring segments
    droneGraphics.lineStyle(1, 0xff88ff, 0.5);
    droneGraphics.beginPath();
    droneGraphics.arc(dcx, dcy, 6, 0, Math.PI * 0.5);
    droneGraphics.strokePath();
    droneGraphics.beginPath();
    droneGraphics.arc(dcx, dcy, 6, Math.PI, Math.PI * 1.5);
    droneGraphics.strokePath();

    // Outer pulse ring
    droneGraphics.lineStyle(1, 0xff44ff, 0.3);
    droneGraphics.strokeCircle(dcx, dcy, 8);

    // Surface detail lines
    droneGraphics.lineStyle(1, 0xaa00aa, 0.4);
    droneGraphics.beginPath();
    droneGraphics.moveTo(dcx - 3, dcy);
    droneGraphics.lineTo(dcx + 3, dcy);
    droneGraphics.strokePath();
    droneGraphics.beginPath();
    droneGraphics.moveTo(dcx, dcy - 3);
    droneGraphics.lineTo(dcx, dcy + 3);
    droneGraphics.strokePath();

    droneGraphics.generateTexture('drone', dw, dh);
    droneGraphics.destroy();
}

function createBomberGraphics(scene) { // Create bomber graphics.
    // ========================
    // BOMBER - Heavy Ordnance Dropper
    // ========================
    const bomberGraphics = scene.add.graphics();
    const bw = 28, bh = 20;
    const bcx = bw / 2, bcy = bh / 2;

    // Engine glow (rear)
    bomberGraphics.fillStyle(0xff6600, 0.3);
    bomberGraphics.fillEllipse(4, bcy, 6, 8);

    // Left wing
    bomberGraphics.fillStyle(0x990000, 1);
    bomberGraphics.beginPath();
    bomberGraphics.moveTo(6, bcy);
    bomberGraphics.lineTo(2, bcy - 6);
    bomberGraphics.lineTo(0, bcy - 7);
    bomberGraphics.lineTo(0, bcy - 4);
    bomberGraphics.lineTo(4, bcy);
    bomberGraphics.closePath();
    bomberGraphics.fillPath();

    // Left wing highlight
    bomberGraphics.fillStyle(0xcc0000, 1);
    bomberGraphics.beginPath();
    bomberGraphics.moveTo(6, bcy);
    bomberGraphics.lineTo(3, bcy - 4);
    bomberGraphics.lineTo(1, bcy - 5);
    bomberGraphics.lineTo(4, bcy);
    bomberGraphics.closePath();
    bomberGraphics.fillPath();

    // Right wing
    bomberGraphics.fillStyle(0x770000, 1);
    bomberGraphics.beginPath();
    bomberGraphics.moveTo(6, bcy);
    bomberGraphics.lineTo(2, bcy + 6);
    bomberGraphics.lineTo(0, bcy + 7);
    bomberGraphics.lineTo(0, bcy + 4);
    bomberGraphics.lineTo(4, bcy);
    bomberGraphics.closePath();
    bomberGraphics.fillPath();

    // Main hull shadow
    bomberGraphics.fillStyle(0x880000, 1);
    bomberGraphics.fillEllipse(bcx, bcy + 1, 20, 10);

    // Main hull body
    bomberGraphics.fillStyle(0xcc0000, 1);
    bomberGraphics.fillEllipse(bcx, bcy, 20, 9);

    // Hull top highlight
    bomberGraphics.fillStyle(0xff2222, 1);
    bomberGraphics.fillEllipse(bcx, bcy - 1, 16, 6);

    // Hull upper shine
    bomberGraphics.fillStyle(0xff4444, 0.7);
    bomberGraphics.fillEllipse(bcx - 2, bcy - 2, 10, 4);

    // Nose cone
    bomberGraphics.fillStyle(0xaa0000, 1);
    bomberGraphics.beginPath();
    bomberGraphics.moveTo(bw - 6, bcy - 3);
    bomberGraphics.lineTo(bw, bcy);
    bomberGraphics.lineTo(bw - 6, bcy + 3);
    bomberGraphics.closePath();
    bomberGraphics.fillPath();

    // Nose highlight
    bomberGraphics.fillStyle(0xdd2222, 1);
    bomberGraphics.beginPath();
    bomberGraphics.moveTo(bw - 5, bcy - 2);
    bomberGraphics.lineTo(bw - 1, bcy);
    bomberGraphics.lineTo(bw - 5, bcy);
    bomberGraphics.closePath();
    bomberGraphics.fillPath();

    // Cockpit window
    bomberGraphics.fillStyle(0x220000, 1);
    bomberGraphics.fillEllipse(bcx + 4, bcy - 2, 5, 3);
    bomberGraphics.fillStyle(0x440000, 1);
    bomberGraphics.fillEllipse(bcx + 4, bcy - 2.5, 4, 2);
    bomberGraphics.fillStyle(0x661111, 0.7);
    bomberGraphics.fillEllipse(bcx + 3, bcy - 3, 2, 1);

    // Bomb bay
    bomberGraphics.fillStyle(0x550000, 1);
    bomberGraphics.fillRect(bcx - 4, bcy + 2, 8, 3);

    // Bomb visible
    bomberGraphics.fillStyle(0xffcc00, 1);
    bomberGraphics.fillEllipse(bcx, bcy + 4, 4, 2);
    bomberGraphics.fillStyle(0xffff66, 0.7);
    bomberGraphics.fillEllipse(bcx - 1, bcy + 3.5, 2, 1);

    // Warning stripes on top
    bomberGraphics.fillStyle(0xffcc00, 0.8);
    bomberGraphics.fillRect(bcx - 6, bcy - 5, 12, 2);
    bomberGraphics.fillStyle(0x880000, 1);
    bomberGraphics.fillRect(bcx - 4, bcy - 5, 2, 2);
    bomberGraphics.fillRect(bcx, bcy - 5, 2, 2);
    bomberGraphics.fillRect(bcx + 4, bcy - 5, 2, 2);

    // Engine pods
    bomberGraphics.fillStyle(0x660000, 1);
    bomberGraphics.fillCircle(6, bcy - 3, 2);
    bomberGraphics.fillCircle(6, bcy + 3, 2);

    // Engine flames
    bomberGraphics.fillStyle(0xff6600, 0.8);
    bomberGraphics.fillTriangle(4, bcy - 3, 0, bcy - 3, 2, bcy - 2);
    bomberGraphics.fillTriangle(4, bcy + 3, 0, bcy + 3, 2, bcy + 2);
    bomberGraphics.fillStyle(0xffaa00, 1);
    bomberGraphics.fillTriangle(4, bcy - 3, 1, bcy - 3, 2, bcy - 2.5);
    bomberGraphics.fillTriangle(4, bcy + 3, 1, bcy + 3, 2, bcy + 2.5);

    // Hull panel lines
    bomberGraphics.lineStyle(1, 0x770000, 0.6);
    bomberGraphics.beginPath();
    bomberGraphics.moveTo(bcx - 6, bcy - 3);
    bomberGraphics.lineTo(bcx - 6, bcy + 3);
    bomberGraphics.strokePath();
    bomberGraphics.beginPath();
    bomberGraphics.moveTo(bcx + 2, bcy - 3);
    bomberGraphics.lineTo(bcx + 2, bcy + 3);
    bomberGraphics.strokePath();

    // Rim edge
    bomberGraphics.lineStyle(1, 0x550000, 0.7);
    bomberGraphics.strokeEllipse(bcx, bcy, 19, 9);

    // Rivets
    bomberGraphics.fillStyle(0x993333, 0.8);
    bomberGraphics.fillCircle(bcx - 8, bcy, 0.6);
    bomberGraphics.fillCircle(bcx + 6, bcy, 0.6);
    bomberGraphics.fillCircle(bcx, bcy - 3, 0.6);

    bomberGraphics.generateTexture('bomber', bw, bh);
    bomberGraphics.destroy();
}
