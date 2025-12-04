// ------------------------
// Enemy Graphics - All Enemy Sprites
// ------------------------

function createOriginalEnemyGraphics(scene) {
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

    // ========================
    // SWARMER - Small Fast Attacker
    // ========================
    const swarmerGraphics = scene.add.graphics();
    const sw = 14, sh = 14;
    const scx = sw / 2, scy = sh / 2;
    
    // Speed trail glow
    swarmerGraphics.fillStyle(0x00ff00, 0.1);
    swarmerGraphics.fillEllipse(scx - 2, scy, 10, 8);
    
    // Outer energy shell
    swarmerGraphics.fillStyle(0x00aa00, 0.3);
    swarmerGraphics.fillCircle(scx, scy, 6);
    
    // Main body shadow
    swarmerGraphics.fillStyle(0x007700, 1);
    swarmerGraphics.fillCircle(scx, scy + 0.5, 5);
    
    // Main body
    swarmerGraphics.fillStyle(0x00cc00, 1);
    swarmerGraphics.fillCircle(scx, scy, 4.5);
    
    // Body highlight
    swarmerGraphics.fillStyle(0x44ff44, 1);
    swarmerGraphics.fillCircle(scx - 1, scy - 1, 3.5);
    
    // Surface shine
    swarmerGraphics.fillStyle(0x88ff88, 0.8);
    swarmerGraphics.fillCircle(scx - 1.5, scy - 1.5, 2);
    
    // Specular highlight
    swarmerGraphics.fillStyle(0xffffff, 0.9);
    swarmerGraphics.fillCircle(scx - 2, scy - 2, 1);
    
    // Sensor array (compound eyes)
    swarmerGraphics.fillStyle(0x004400, 1);
    swarmerGraphics.fillCircle(scx + 1, scy - 1, 1.5);
    swarmerGraphics.fillStyle(0x00ff00, 0.8);
    swarmerGraphics.fillCircle(scx + 1, scy - 1, 1);
    swarmerGraphics.fillStyle(0xaaffaa, 1);
    swarmerGraphics.fillCircle(scx + 0.7, scy - 1.3, 0.4);
    
    // Side sensors
    swarmerGraphics.fillStyle(0x88ff88, 0.8);
    swarmerGraphics.fillCircle(scx - 3, scy, 0.8);
    swarmerGraphics.fillCircle(scx + 3, scy + 1, 0.8);
    
    // Energy core
    swarmerGraphics.fillStyle(0x00aa00, 1);
    swarmerGraphics.fillCircle(scx, scy + 1, 1.5);
    swarmerGraphics.fillStyle(0x00ff00, 1);
    swarmerGraphics.fillCircle(scx, scy + 1, 1);
    swarmerGraphics.fillStyle(0xaaffaa, 1);
    swarmerGraphics.fillCircle(scx, scy + 1, 0.5);
    
    // Antennae/feelers
    swarmerGraphics.lineStyle(1, 0x00aa00, 0.8);
    swarmerGraphics.beginPath();
    swarmerGraphics.moveTo(scx + 2, scy - 3);
    swarmerGraphics.lineTo(scx + 4, scy - 5);
    swarmerGraphics.strokePath();
    swarmerGraphics.beginPath();
    swarmerGraphics.moveTo(scx - 1, scy - 3);
    swarmerGraphics.lineTo(scx - 2, scy - 5);
    swarmerGraphics.strokePath();
    
    // Feeler tips
    swarmerGraphics.fillStyle(0x88ff88, 1);
    swarmerGraphics.fillCircle(scx + 4, scy - 5, 0.6);
    swarmerGraphics.fillCircle(scx - 2, scy - 5, 0.6);
    
    // Shell segments
    swarmerGraphics.lineStyle(1, 0x008800, 0.4);
    swarmerGraphics.beginPath();
    swarmerGraphics.arc(scx, scy, 3.5, Math.PI * 0.3, Math.PI * 0.7);
    swarmerGraphics.strokePath();
    swarmerGraphics.beginPath();
    swarmerGraphics.arc(scx, scy, 3.5, Math.PI * 1.3, Math.PI * 1.7);
    swarmerGraphics.strokePath();
    
    // Outer ring
    swarmerGraphics.lineStyle(1, 0x00aa00, 0.5);
    swarmerGraphics.strokeCircle(scx, scy, 5);
    
    swarmerGraphics.generateTexture('swarmer', sw, sh);
    swarmerGraphics.destroy();

    // ========================
    // POD - Swarmer Container
    // ========================
    const podGraphics = scene.add.graphics();
    const pw = 28, ph = 28;
    const pcx = pw / 2, pcy = ph / 2;
    
    // Outer energy membrane glow
    podGraphics.fillStyle(0x8800cc, 0.1);
    podGraphics.fillCircle(pcx, pcy, 14);
    
    // Secondary glow
    podGraphics.fillStyle(0xaa00ff, 0.15);
    podGraphics.fillCircle(pcx, pcy, 12);
    
    // Outer shell
    podGraphics.fillStyle(0x7700aa, 1);
    podGraphics.fillCircle(pcx, pcy, 11);
    
    // Main shell
    podGraphics.fillStyle(0xaa00ff, 1);
    podGraphics.fillCircle(pcx, pcy, 10);
    
    // Shell highlight
    podGraphics.fillStyle(0xcc44ff, 0.8);
    podGraphics.fillCircle(pcx - 2, pcy - 2, 7);
    
    // Inner membrane
    podGraphics.fillStyle(0x7700aa, 1);
    podGraphics.fillCircle(pcx, pcy, 7);
    
    // Inner chamber
    podGraphics.fillStyle(0x550088, 1);
    podGraphics.fillCircle(pcx, pcy, 6);
    
    // Swarmer embryos visible inside
    podGraphics.fillStyle(0x00ff00, 0.7);
    podGraphics.fillCircle(pcx - 2.5, pcy - 2, 2);
    podGraphics.fillCircle(pcx + 2.5, pcy - 1, 2);
    podGraphics.fillCircle(pcx, pcy + 2.5, 2);
    
    // Embryo highlights
    podGraphics.fillStyle(0x88ff88, 0.8);
    podGraphics.fillCircle(pcx - 3, pcy - 2.5, 0.8);
    podGraphics.fillCircle(pcx + 2, pcy - 1.5, 0.8);
    podGraphics.fillCircle(pcx - 0.5, pcy + 2, 0.8);
    
    // Energy veins
    podGraphics.lineStyle(2, 0x6600aa, 0.8);
    podGraphics.beginPath();
    podGraphics.moveTo(pcx, pcy - 10);
    podGraphics.lineTo(pcx, pcy + 10);
    podGraphics.strokePath();
    podGraphics.beginPath();
    podGraphics.moveTo(pcx - 10, pcy);
    podGraphics.lineTo(pcx + 10, pcy);
    podGraphics.strokePath();
    
    // Diagonal veins
    podGraphics.lineStyle(1, 0x6600aa, 0.5);
    podGraphics.beginPath();
    podGraphics.moveTo(pcx - 7, pcy - 7);
    podGraphics.lineTo(pcx + 7, pcy + 7);
    podGraphics.strokePath();
    podGraphics.beginPath();
    podGraphics.moveTo(pcx + 7, pcy - 7);
    podGraphics.lineTo(pcx - 7, pcy + 7);
    podGraphics.strokePath();
    
    // Node points on veins
    podGraphics.fillStyle(0xcc66ff, 1);
    podGraphics.fillCircle(pcx, pcy - 8, 1.5);
    podGraphics.fillCircle(pcx, pcy + 8, 1.5);
    podGraphics.fillCircle(pcx - 8, pcy, 1.5);
    podGraphics.fillCircle(pcx + 8, pcy, 1.5);
    
    // Node glows
    podGraphics.fillStyle(0xcc66ff, 0.4);
    podGraphics.fillCircle(pcx, pcy - 8, 3);
    podGraphics.fillCircle(pcx, pcy + 8, 3);
    podGraphics.fillCircle(pcx - 8, pcy, 3);
    podGraphics.fillCircle(pcx + 8, pcy, 3);
    
    // Central core
    podGraphics.fillStyle(0xffee00, 0.8);
    podGraphics.fillCircle(pcx, pcy, 2);
    podGraphics.fillStyle(0xffffaa, 1);
    podGraphics.fillCircle(pcx, pcy, 1.2);
    podGraphics.fillStyle(0xffffff, 0.9);
    podGraphics.fillCircle(pcx - 0.3, pcy - 0.3, 0.5);
    
    // Shell texture rings
    podGraphics.lineStyle(1, 0x8800cc, 0.4);
    podGraphics.strokeCircle(pcx, pcy, 8);
    podGraphics.strokeCircle(pcx, pcy, 5);
    
    // Outer membrane edge
    podGraphics.lineStyle(1, 0x550088, 0.7);
    podGraphics.strokeCircle(pcx, pcy, 11);
    
    // Pulse ring
    podGraphics.lineStyle(1, 0xcc88ff, 0.3);
    podGraphics.strokeCircle(pcx, pcy, 13);
    
    // Surface detail
    podGraphics.fillStyle(0xdd88ff, 0.5);
    podGraphics.fillCircle(pcx - 6, pcy - 6, 1);
    podGraphics.fillCircle(pcx + 6, pcy - 5, 0.8);
    podGraphics.fillCircle(pcx + 5, pcy + 6, 1);
    podGraphics.fillCircle(pcx - 5, pcy + 5, 0.8);
    
    podGraphics.generateTexture('pod', pw, ph);
    podGraphics.destroy();

    // ========================
    // BAITER - Fast Aggressive Chaser
    // ========================
    const baiterGraphics = scene.add.graphics();
    const btw = 26, bth = 18;
    const btcx = btw / 2, btcy = bth / 2;
    
    // Speed trail glow
    baiterGraphics.fillStyle(0xff00ff, 0.1);
    baiterGraphics.fillEllipse(btcx - 4, btcy, 20, 14);
    
    // Engine exhaust glow
    baiterGraphics.fillStyle(0xff44ff, 0.2);
    baiterGraphics.fillEllipse(4, btcy, 8, 10);
    
    // Exhaust flames
    baiterGraphics.fillStyle(0xff00ff, 0.6);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(6, btcy - 4);
    baiterGraphics.lineTo(-2, btcy);
    baiterGraphics.lineTo(6, btcy + 4);
    baiterGraphics.closePath();
    baiterGraphics.fillPath();
    
    baiterGraphics.fillStyle(0xff88ff, 0.8);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(6, btcy - 3);
    baiterGraphics.lineTo(1, btcy);
    baiterGraphics.lineTo(6, btcy + 3);
    baiterGraphics.closePath();
    baiterGraphics.fillPath();
    
    baiterGraphics.fillStyle(0xffaaff, 1);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(6, btcy - 2);
    baiterGraphics.lineTo(3, btcy);
    baiterGraphics.lineTo(6, btcy + 2);
    baiterGraphics.closePath();
    baiterGraphics.fillPath();
    
    // Main body shadow
    baiterGraphics.fillStyle(0xaa00aa, 1);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(4, btcy);
    baiterGraphics.lineTo(btw, btcy - 7);
    baiterGraphics.lineTo(btw, btcy + 7);
    baiterGraphics.closePath();
    baiterGraphics.fillPath();
    
    // Main body
    baiterGraphics.fillStyle(0xff00ff, 1);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(5, btcy);
    baiterGraphics.lineTo(btw - 1, btcy - 6);
    baiterGraphics.lineTo(btw - 1, btcy + 6);
    baiterGraphics.closePath();
    baiterGraphics.fillPath();
    
    // Upper hull (lit)
    baiterGraphics.fillStyle(0xff44ff, 1);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(6, btcy);
    baiterGraphics.lineTo(btw - 2, btcy - 5);
    baiterGraphics.lineTo(btw - 2, btcy);
    baiterGraphics.closePath();
    baiterGraphics.fillPath();
    
    // Hull highlight
    baiterGraphics.fillStyle(0xff88ff, 0.7);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(10, btcy - 1);
    baiterGraphics.lineTo(btw - 4, btcy - 4);
    baiterGraphics.lineTo(btw - 4, btcy - 1);
    baiterGraphics.closePath();
    baiterGraphics.fillPath();
    
    // Edge shine
    baiterGraphics.fillStyle(0xffaaff, 0.5);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(12, btcy - 2);
    baiterGraphics.lineTo(btw - 3, btcy - 4.5);
    baiterGraphics.lineTo(btw - 6, btcy - 3);
    baiterGraphics.closePath();
    baiterGraphics.fillPath();
    
    // Cockpit
    baiterGraphics.fillStyle(0x660066, 1);
    baiterGraphics.fillCircle(btw - 5, btcy, 2.5);
    baiterGraphics.fillStyle(0xaa00aa, 1);
    baiterGraphics.fillCircle(btw - 5, btcy - 0.5, 2);
    baiterGraphics.fillStyle(0xff44ff, 0.7);
    baiterGraphics.fillCircle(btw - 5.5, btcy - 1, 1);
    
    // Targeting sensor
    baiterGraphics.fillStyle(0x00ffff, 1);
    baiterGraphics.fillCircle(btw - 2, btcy, 1.2);
    baiterGraphics.fillStyle(0xffffff, 0.8);
    baiterGraphics.fillCircle(btw - 2.3, btcy - 0.3, 0.5);
    
    // Targeting glow
    baiterGraphics.fillStyle(0x00ffff, 0.3);
    baiterGraphics.fillCircle(btw - 2, btcy, 2.5);
    
    // Wing fins
    baiterGraphics.fillStyle(0xcc00cc, 1);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(12, btcy - 4);
    baiterGraphics.lineTo(10, btcy - 8);
    baiterGraphics.lineTo(16, btcy - 5);
    baiterGraphics.closePath();
    baiterGraphics.fillPath();
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(12, btcy + 4);
    baiterGraphics.lineTo(10, btcy + 8);
    baiterGraphics.lineTo(16, btcy + 5);
    baiterGraphics.closePath();
    baiterGraphics.fillPath();
    
    // Fin highlights
    baiterGraphics.fillStyle(0xff44ff, 0.8);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(12, btcy - 4.5);
    baiterGraphics.lineTo(11, btcy - 7);
    baiterGraphics.lineTo(14, btcy - 5);
    baiterGraphics.closePath();
    baiterGraphics.fillPath();
    
    // Panel lines
    baiterGraphics.lineStyle(1, 0xaa00aa, 0.5);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(10, btcy - 3);
    baiterGraphics.lineTo(18, btcy - 4.5);
    baiterGraphics.strokePath();
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(10, btcy + 3);
    baiterGraphics.lineTo(18, btcy + 4.5);
    baiterGraphics.strokePath();
    
    // Edge outline
    baiterGraphics.lineStyle(1, 0x880088, 0.7);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(5, btcy);
    baiterGraphics.lineTo(btw - 1, btcy - 6);
    baiterGraphics.lineTo(btw - 1, btcy + 6);
    baiterGraphics.closePath();
    baiterGraphics.strokePath();
    
    // Speed lines
    baiterGraphics.lineStyle(1, 0xff88ff, 0.3);
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(0, btcy - 3);
    baiterGraphics.lineTo(8, btcy - 3);
    baiterGraphics.strokePath();
    baiterGraphics.beginPath();
    baiterGraphics.moveTo(0, btcy + 3);
    baiterGraphics.lineTo(8, btcy + 3);
    baiterGraphics.strokePath();
    
    baiterGraphics.generateTexture('baiter', btw, bth);
    baiterGraphics.destroy();
}

function createNewEnemyGraphics(scene) {
    // ========================
    // KAMIKAZE - Fast Suicide Bomber
    // ========================
    const kamikazeGraphics = scene.add.graphics();
    const kw = 28, kh = 16;
    const kcy = kh / 2;
    
    // Outer explosion warning glow
    kamikazeGraphics.fillStyle(0xff2200, 0.1);
    kamikazeGraphics.fillEllipse(14, kcy, 28, 16);
    
    // Engine exhaust glow
    kamikazeGraphics.fillStyle(0xff4400, 0.2);
    kamikazeGraphics.fillEllipse(4, kcy, 10, 12);
    
    // Outer flame
    kamikazeGraphics.fillStyle(0xff2200, 0.7);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(8, kcy - 5);
    kamikazeGraphics.lineTo(-4, kcy);
    kamikazeGraphics.lineTo(8, kcy + 5);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();
    
    // Middle flame
    kamikazeGraphics.fillStyle(0xff6600, 0.85);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(8, kcy - 4);
    kamikazeGraphics.lineTo(0, kcy);
    kamikazeGraphics.lineTo(8, kcy + 4);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();
    
    // Inner flame
    kamikazeGraphics.fillStyle(0xffaa00, 1);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(8, kcy - 3);
    kamikazeGraphics.lineTo(3, kcy);
    kamikazeGraphics.lineTo(8, kcy + 3);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();
    
    // Core flame
    kamikazeGraphics.fillStyle(0xffff66, 1);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(8, kcy - 2);
    kamikazeGraphics.lineTo(5, kcy);
    kamikazeGraphics.lineTo(8, kcy + 2);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();
    
    // Flame sparks
    kamikazeGraphics.fillStyle(0xffff00, 0.8);
    kamikazeGraphics.fillCircle(1, kcy - 3, 1);
    kamikazeGraphics.fillCircle(-1, kcy + 2, 0.8);
    kamikazeGraphics.fillCircle(3, kcy + 4, 0.6);
    
    // Missile body shadow
    kamikazeGraphics.fillStyle(0x990000, 1);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(7, kcy - 5);
    kamikazeGraphics.lineTo(26, kcy);
    kamikazeGraphics.lineTo(7, kcy + 5);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();
    
    // Missile body main
    kamikazeGraphics.fillStyle(0xcc0000, 1);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(8, kcy - 4.5);
    kamikazeGraphics.lineTo(25, kcy);
    kamikazeGraphics.lineTo(8, kcy + 4.5);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();
    
    // Body upper highlight
    kamikazeGraphics.fillStyle(0xff2222, 1);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(9, kcy - 4);
    kamikazeGraphics.lineTo(22, kcy - 1);
    kamikazeGraphics.lineTo(9, kcy);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();
    
    // Body shine
    kamikazeGraphics.fillStyle(0xff4444, 0.7);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(10, kcy - 3);
    kamikazeGraphics.lineTo(18, kcy - 1.5);
    kamikazeGraphics.lineTo(10, kcy - 1);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();
    
    // Warning stripes
    kamikazeGraphics.fillStyle(0xffcc00, 1);
    kamikazeGraphics.fillRect(11, kcy - 3.5, 3, 7);
    kamikazeGraphics.fillRect(16, kcy - 2.5, 3, 5);
    
    // Stripe shadows
    kamikazeGraphics.fillStyle(0xcc9900, 1);
    kamikazeGraphics.fillRect(11, kcy, 3, 3.5);
    kamikazeGraphics.fillRect(16, kcy, 3, 2.5);
    
    // Nose cone
    kamikazeGraphics.fillStyle(0xaa0000, 1);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(22, kcy - 2);
    kamikazeGraphics.lineTo(28, kcy);
    kamikazeGraphics.lineTo(22, kcy + 2);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();
    
    // Nose highlight
    kamikazeGraphics.fillStyle(0xdd2222, 1);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(22, kcy - 1.5);
    kamikazeGraphics.lineTo(26, kcy);
    kamikazeGraphics.lineTo(22, kcy);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();
    
    // Angry eye socket
    kamikazeGraphics.fillStyle(0x220000, 1);
    kamikazeGraphics.fillCircle(21, kcy, 2.5);
    
    // Eye white
    kamikazeGraphics.fillStyle(0xffffff, 1);
    kamikazeGraphics.fillCircle(21, kcy, 2);
    
    // Angry eyebrow effect (red tint on top)
    kamikazeGraphics.fillStyle(0xff0000, 0.5);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(19, kcy - 2);
    kamikazeGraphics.lineTo(23, kcy - 1);
    kamikazeGraphics.lineTo(19, kcy);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();
    
    // Iris
    kamikazeGraphics.fillStyle(0xff0000, 1);
    kamikazeGraphics.fillCircle(21.5, kcy, 1.2);
    
    // Pupil
    kamikazeGraphics.fillStyle(0x000000, 1);
    kamikazeGraphics.fillCircle(22, kcy, 0.6);
    
    // Eye highlight
    kamikazeGraphics.fillStyle(0xffffff, 0.9);
    kamikazeGraphics.fillCircle(20.5, kcy - 0.8, 0.5);
    
    // Tail fins
    kamikazeGraphics.fillStyle(0x880000, 1);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(8, kcy - 4);
    kamikazeGraphics.lineTo(6, kcy - 7);
    kamikazeGraphics.lineTo(12, kcy - 4);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(8, kcy + 4);
    kamikazeGraphics.lineTo(6, kcy + 7);
    kamikazeGraphics.lineTo(12, kcy + 4);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();
    
    // Fin highlights
    kamikazeGraphics.fillStyle(0xaa2222, 0.8);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(8, kcy - 4.5);
    kamikazeGraphics.lineTo(7, kcy - 6);
    kamikazeGraphics.lineTo(10, kcy - 4.5);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();
    
    // Body edge
    kamikazeGraphics.lineStyle(1, 0x770000, 0.8);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(8, kcy - 4.5);
    kamikazeGraphics.lineTo(25, kcy);
    kamikazeGraphics.lineTo(8, kcy + 4.5);
    kamikazeGraphics.closePath();
    kamikazeGraphics.strokePath();
    
    // Engine glow core
    kamikazeGraphics.fillStyle(0xffffff, 0.9);
    kamikazeGraphics.fillCircle(7, kcy, 1.5);
    
    kamikazeGraphics.generateTexture('kamikaze', kw, kh);
    kamikazeGraphics.destroy();

    // ========================
    // TURRET - Stationary Multi-directional Shooter
    // ========================
    const turretGraphics = scene.add.graphics();
    const tw = 24, th = 24;
    const tcx = tw / 2, tcy = th / 2;
    
    // Danger zone indicator
    turretGraphics.fillStyle(0xff0000, 0.05);
    turretGraphics.fillCircle(tcx, tcy, 12);
    
    // Base platform shadow
    turretGraphics.fillStyle(0x222222, 1);
    turretGraphics.fillRect(tcx - 8, tcy + 5, 16, 5);
    
    // Base platform main
    turretGraphics.fillStyle(0x444444, 1);
    turretGraphics.fillRect(tcx - 7, tcy + 4, 14, 4);
    
    // Base platform highlight
    turretGraphics.fillStyle(0x555555, 1);
    turretGraphics.fillRect(tcx - 6, tcy + 4, 12, 2);
    
    // Base platform detail
    turretGraphics.fillStyle(0x333333, 1);
    turretGraphics.fillRect(tcx - 5, tcy + 6, 10, 1);
    
    // Base rivets
    turretGraphics.fillStyle(0x666666, 1);
    turretGraphics.fillCircle(tcx - 5, tcy + 5, 0.8);
    turretGraphics.fillCircle(tcx + 5, tcy + 5, 0.8);
    
    // Main turret body shadow
    turretGraphics.fillStyle(0x444444, 1);
    turretGraphics.fillCircle(tcx, tcy + 1, 8);
    
    // Main turret body
    turretGraphics.fillStyle(0x666666, 1);
    turretGraphics.fillCircle(tcx, tcy, 7.5);
    
    // Turret body highlight
    turretGraphics.fillStyle(0x888888, 1);
    turretGraphics.fillCircle(tcx - 1, tcy - 1, 6);
    
    // Turret body shine
    turretGraphics.fillStyle(0x999999, 0.6);
    turretGraphics.fillCircle(tcx - 2, tcy - 2, 4);
    
    // Gun barrel - Top
    turretGraphics.fillStyle(0x555555, 1);
    turretGraphics.fillRect(tcx - 2.5, tcy - 12, 5, 6);
    turretGraphics.fillStyle(0x777777, 1);
    turretGraphics.fillRect(tcx - 2, tcy - 12, 4, 5);
    turretGraphics.fillStyle(0x333333, 1);
    turretGraphics.fillRect(tcx - 1.5, tcy - 12, 3, 2);
    turretGraphics.fillStyle(0xff4400, 0.6);
    turretGraphics.fillCircle(tcx, tcy - 11, 1);
    
    // Gun barrel - Bottom
    turretGraphics.fillStyle(0x555555, 1);
    turretGraphics.fillRect(tcx - 2.5, tcy + 6, 5, 6);
    turretGraphics.fillStyle(0x777777, 1);
    turretGraphics.fillRect(tcx - 2, tcy + 7, 4, 5);
    turretGraphics.fillStyle(0x333333, 1);
    turretGraphics.fillRect(tcx - 1.5, tcy + 10, 3, 2);
    turretGraphics.fillStyle(0xff4400, 0.6);
    turretGraphics.fillCircle(tcx, tcy + 11, 1);
    
    // Gun barrel - Left
    turretGraphics.fillStyle(0x555555, 1);
    turretGraphics.fillRect(tcx - 12, tcy - 2.5, 6, 5);
    turretGraphics.fillStyle(0x777777, 1);
    turretGraphics.fillRect(tcx - 12, tcy - 2, 5, 4);
    turretGraphics.fillStyle(0x333333, 1);
    turretGraphics.fillRect(tcx - 12, tcy - 1.5, 2, 3);
    turretGraphics.fillStyle(0xff4400, 0.6);
    turretGraphics.fillCircle(tcx - 11, tcy, 1);
    
    // Gun barrel - Right
    turretGraphics.fillStyle(0x555555, 1);
    turretGraphics.fillRect(tcx + 6, tcy - 2.5, 6, 5);
    turretGraphics.fillStyle(0x777777, 1);
    turretGraphics.fillRect(tcx + 7, tcy - 2, 5, 4);
    turretGraphics.fillStyle(0x333333, 1);
    turretGraphics.fillRect(tcx + 10, tcy - 1.5, 2, 3);
    turretGraphics.fillStyle(0xff4400, 0.6);
    turretGraphics.fillCircle(tcx + 11, tcy, 1);
    
    // Center sensor housing
    turretGraphics.fillStyle(0x333333, 1);
    turretGraphics.fillCircle(tcx, tcy, 4);
    
    // Sensor ring
    turretGraphics.lineStyle(1, 0x444444, 1);
    turretGraphics.strokeCircle(tcx, tcy, 3.5);
    
    // Sensor eye glow
    turretGraphics.fillStyle(0xff0000, 0.3);
    turretGraphics.fillCircle(tcx, tcy, 3);
    
    // Sensor eye
    turretGraphics.fillStyle(0xff0000, 1);
    turretGraphics.fillCircle(tcx, tcy, 2.5);
    
    // Sensor eye inner
    turretGraphics.fillStyle(0xff4444, 1);
    turretGraphics.fillCircle(tcx, tcy, 1.8);
    
    // Sensor eye core
    turretGraphics.fillStyle(0xff8888, 1);
    turretGraphics.fillCircle(tcx, tcy, 1);
    
    // Sensor highlight
    turretGraphics.fillStyle(0xffffff, 0.9);
    turretGraphics.fillCircle(tcx - 0.8, tcy - 0.8, 0.6);
    
    // Scanning line effect
    turretGraphics.fillStyle(0xffffff, 0.4);
    turretGraphics.fillRect(tcx - 2, tcy - 0.5, 4, 1);
    
    // Armor panel lines
    turretGraphics.lineStyle(1, 0x444444, 0.6);
    turretGraphics.beginPath();
    turretGraphics.arc(tcx, tcy, 6, 0, Math.PI * 0.5);
    turretGraphics.strokePath();
    turretGraphics.beginPath();
    turretGraphics.arc(tcx, tcy, 6, Math.PI, Math.PI * 1.5);
    turretGraphics.strokePath();
    
    // Outer rim
    turretGraphics.lineStyle(1, 0x333333, 0.8);
    turretGraphics.strokeCircle(tcx, tcy, 7.5);
    
    turretGraphics.generateTexture('turret', tw, th);
    turretGraphics.destroy();

    // ========================
    // SHIELD - Tanky Enemy with Protective Barrier
    // ========================
    const shieldGraphics = scene.add.graphics();
    const shw = 28, shh = 28;
    const shcx = shw / 2, shcy = shh / 2;
    
    // Outer shield field
    shieldGraphics.fillStyle(0x00ffff, 0.05);
    shieldGraphics.fillCircle(shcx, shcy, 14);
    
    // Shield pulse ring outer
    shieldGraphics.lineStyle(2, 0x00ffff, 0.2);
    shieldGraphics.strokeCircle(shcx, shcy, 13);
    
    // Shield pulse ring middle
    shieldGraphics.lineStyle(3, 0x00ffff, 0.4);
    shieldGraphics.strokeCircle(shcx, shcy, 11);
    
    // Shield pulse ring inner
    shieldGraphics.lineStyle(2, 0x00ffff, 0.6);
    shieldGraphics.strokeCircle(shcx, shcy, 9);
    
    // Shield glow fill
    shieldGraphics.fillStyle(0x00ffff, 0.15);
    shieldGraphics.fillCircle(shcx, shcy, 9);
    
    // Hexagonal shield generators
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const x = shcx + Math.cos(angle) * 9;
        const y = shcy + Math.sin(angle) * 9;
        
        // Generator glow
        shieldGraphics.fillStyle(0x00ffff, 0.4);
        shieldGraphics.fillCircle(x, y, 3);
        
        // Generator body
        shieldGraphics.fillStyle(0x008899, 1);
        shieldGraphics.fillCircle(x, y, 2);
        
        // Generator core
        shieldGraphics.fillStyle(0x00ffff, 1);
        shieldGraphics.fillCircle(x, y, 1.2);
        
        // Generator highlight
        shieldGraphics.fillStyle(0xffffff, 0.8);
        shieldGraphics.fillCircle(x - 0.3, y - 0.3, 0.5);
        
        // Connection lines to center
        shieldGraphics.lineStyle(1, 0x00aaaa, 0.4);
        shieldGraphics.beginPath();
        shieldGraphics.moveTo(x, y);
        shieldGraphics.lineTo(shcx, shcy);
        shieldGraphics.strokePath();
    }
    
    // Core body shadow
    shieldGraphics.fillStyle(0x005566, 1);
    shieldGraphics.fillCircle(shcx, shcy + 1, 6);
    
    // Core body main
    shieldGraphics.fillStyle(0x0088aa, 1);
    shieldGraphics.fillCircle(shcx, shcy, 5.5);
    
    // Core body highlight
    shieldGraphics.fillStyle(0x00aacc, 1);
    shieldGraphics.fillCircle(shcx - 1, shcy - 1, 4);
    
    // Core body shine
    shieldGraphics.fillStyle(0x00ccee, 0.6);
    shieldGraphics.fillCircle(shcx - 1.5, shcy - 1.5, 2.5);
    
    // Inner ring
    shieldGraphics.lineStyle(1, 0x006677, 0.8);
    shieldGraphics.strokeCircle(shcx, shcy, 4);
    
    // Central eye socket
    shieldGraphics.fillStyle(0x003344, 1);
    shieldGraphics.fillCircle(shcx, shcy, 3);
    
    // Eye white
    shieldGraphics.fillStyle(0xffffff, 1);
    shieldGraphics.fillCircle(shcx, shcy, 2.5);
    
    // Eye iris
    shieldGraphics.fillStyle(0x00ffff, 1);
    shieldGraphics.fillCircle(shcx, shcy, 1.8);
    
    // Eye pupil
    shieldGraphics.fillStyle(0x004455, 1);
    shieldGraphics.fillCircle(shcx, shcy, 1);
    
    // Eye highlight
    shieldGraphics.fillStyle(0xffffff, 0.9);
    shieldGraphics.fillCircle(shcx - 0.8, shcy - 0.8, 0.6);
    
    // Shield energy arcs
    shieldGraphics.lineStyle(1, 0x66ffff, 0.5);
    shieldGraphics.beginPath();
    shieldGraphics.arc(shcx, shcy, 7, 0, Math.PI * 0.4);
    shieldGraphics.strokePath();
    shieldGraphics.beginPath();
    shieldGraphics.arc(shcx, shcy, 7, Math.PI * 0.7, Math.PI * 1.1);
    shieldGraphics.strokePath();
    shieldGraphics.beginPath();
    shieldGraphics.arc(shcx, shcy, 7, Math.PI * 1.4, Math.PI * 1.8);
    shieldGraphics.strokePath();
    
    shieldGraphics.generateTexture('shield', shw, shh);
    shieldGraphics.destroy();

    // ========================
    // SEEKER - Predictive Targeting Enemy
    // ========================
    const seekerGraphics = scene.add.graphics();
    const skw = 24, skh = 18;
    const skcx = skw / 2, skcy = skh / 2;
    
    // Scanning field
    seekerGraphics.fillStyle(0x8844ff, 0.1);
    seekerGraphics.fillEllipse(skcx, skcy, 24, 18);
    
    // Scanning dish glow
    seekerGraphics.fillStyle(0x6622cc, 0.3);
    seekerGraphics.beginPath();
    seekerGraphics.moveTo(0, skcy);
    seekerGraphics.lineTo(10, skcy - 7);
    seekerGraphics.lineTo(10, skcy + 7);
    seekerGraphics.closePath();
    seekerGraphics.fillPath();
    
    // Scanning dish outer
    seekerGraphics.fillStyle(0x5511aa, 0.7);
    seekerGraphics.beginPath();
    seekerGraphics.moveTo(2, skcy);
    seekerGraphics.lineTo(10, skcy - 6);
    seekerGraphics.lineTo(10, skcy + 6);
    seekerGraphics.closePath();
    seekerGraphics.fillPath();
    
    // Scanning dish inner
    seekerGraphics.fillStyle(0x7733cc, 0.8);
    seekerGraphics.beginPath();
    seekerGraphics.moveTo(4, skcy);
    seekerGraphics.lineTo(10, skcy - 4);
    seekerGraphics.lineTo(10, skcy + 4);
    seekerGraphics.closePath();
    seekerGraphics.fillPath();
    
    // Dish center
    seekerGraphics.fillStyle(0xaa66ff, 1);
    seekerGraphics.fillCircle(8, skcy, 2);
    
    // Main body shadow
    seekerGraphics.fillStyle(0x4411aa, 1);
    seekerGraphics.fillEllipse(skcx + 2, skcy + 1, 14, 11);
    
    // Main body
    seekerGraphics.fillStyle(0x6622cc, 1);
    seekerGraphics.fillEllipse(skcx + 2, skcy, 13, 10);
    
    // Body highlight
    seekerGraphics.fillStyle(0x8844dd, 1);
    seekerGraphics.fillEllipse(skcx + 1, skcy - 1, 10, 7);
    
    // Body shine
    seekerGraphics.fillStyle(0xaa66ee, 0.5);
    seekerGraphics.fillEllipse(skcx, skcy - 2, 6, 4);
    
    // Sensor array housing
    seekerGraphics.fillStyle(0x5522bb, 1);
    seekerGraphics.fillRect(18, skcy - 3.5, 5, 7);
    
    // Sensor array detail
    seekerGraphics.fillStyle(0x7744dd, 1);
    seekerGraphics.fillRect(19, skcy - 3, 4, 6);
    
    // Sensor array grid
    seekerGraphics.lineStyle(1, 0x4422aa, 0.8);
    seekerGraphics.beginPath();
    seekerGraphics.moveTo(19, skcy);
    seekerGraphics.lineTo(23, skcy);
    seekerGraphics.strokePath();
    seekerGraphics.beginPath();
    seekerGraphics.moveTo(21, skcy - 3);
    seekerGraphics.lineTo(21, skcy + 3);
    seekerGraphics.strokePath();
    
    // Primary tracking eyes
    // Eye 1 (top left)
    seekerGraphics.fillStyle(0x220044, 1);
    seekerGraphics.fillCircle(11, skcy - 3, 2.5);
    seekerGraphics.fillStyle(0xff0000, 0.4);
    seekerGraphics.fillCircle(11, skcy - 3, 2.2);
    seekerGraphics.fillStyle(0xff0000, 1);
    seekerGraphics.fillCircle(11, skcy - 3, 1.8);
    seekerGraphics.fillStyle(0xff4444, 1);
    seekerGraphics.fillCircle(11, skcy - 3, 1.2);
    seekerGraphics.fillStyle(0xffffff, 0.9);
    seekerGraphics.fillCircle(10.5, skcy - 3.5, 0.5);
    
    // Eye 2 (bottom left)
    seekerGraphics.fillStyle(0x220044, 1);
    seekerGraphics.fillCircle(11, skcy + 3, 2.5);
    seekerGraphics.fillStyle(0xff0000, 0.4);
    seekerGraphics.fillCircle(11, skcy + 3, 2.2);
    seekerGraphics.fillStyle(0xff0000, 1);
    seekerGraphics.fillCircle(11, skcy + 3, 1.8);
    seekerGraphics.fillStyle(0xff4444, 1);
    seekerGraphics.fillCircle(11, skcy + 3, 1.2);
    seekerGraphics.fillStyle(0xffffff, 0.9);
    seekerGraphics.fillCircle(10.5, skcy + 2.5, 0.5);
    
    // Eye 3 (center)
    seekerGraphics.fillStyle(0x220044, 1);
    seekerGraphics.fillCircle(16, skcy, 2.8);
    seekerGraphics.fillStyle(0xff0000, 0.4);
    seekerGraphics.fillCircle(16, skcy, 2.5);
    seekerGraphics.fillStyle(0xff0000, 1);
    seekerGraphics.fillCircle(16, skcy, 2);
    seekerGraphics.fillStyle(0xff6666, 1);
    seekerGraphics.fillCircle(16, skcy, 1.3);
    seekerGraphics.fillStyle(0xffffff, 0.9);
    seekerGraphics.fillCircle(15.5, skcy - 0.5, 0.6);
    
    // Targeting lines from eyes
    seekerGraphics.lineStyle(1, 0xff0000, 0.3);
    seekerGraphics.beginPath();
    seekerGraphics.moveTo(13, skcy - 3);
    seekerGraphics.lineTo(24, skcy - 3);
    seekerGraphics.strokePath();
    seekerGraphics.beginPath();
    seekerGraphics.moveTo(13, skcy + 3);
    seekerGraphics.lineTo(24, skcy + 3);
    seekerGraphics.strokePath();
    seekerGraphics.beginPath();
    seekerGraphics.moveTo(18, skcy);
    seekerGraphics.lineTo(24, skcy);
    seekerGraphics.strokePath();
    
    // Body edge
    seekerGraphics.lineStyle(1, 0x3311aa, 0.7);
    seekerGraphics.strokeEllipse(skcx + 2, skcy, 13, 10);
    
    seekerGraphics.generateTexture('seeker', skw, skh);
    seekerGraphics.destroy();

    // ========================
    // SPAWNER - Enemy that Creates Minions
    // ========================
    const spawnerGraphics = scene.add.graphics();
    const spw = 28, sph = 28;
    const spcx = spw / 2, spcy = sph / 2;
    
    // Birthing aura
    spawnerGraphics.fillStyle(0xccaa00, 0.1);
    spawnerGraphics.fillCircle(spcx, spcy, 14);
    
    // Organic outer membrane
    spawnerGraphics.fillStyle(0x886600, 1);
    spawnerGraphics.fillEllipse(spcx, spcy, 24, 22);
    
    // Main body
    spawnerGraphics.fillStyle(0xccaa00, 1);
    spawnerGraphics.fillEllipse(spcx, spcy, 22, 20);
    
    // Body highlight
    spawnerGraphics.fillStyle(0xddbb22, 1);
    spawnerGraphics.fillEllipse(spcx - 2, spcy - 2, 16, 14);
    
    // Body shine
    spawnerGraphics.fillStyle(0xeecc44, 0.6);
    spawnerGraphics.fillEllipse(spcx - 3, spcy - 4, 10, 8);
    
    // Pulsing inner membrane
    spawnerGraphics.fillStyle(0xffcc00, 0.5);
    spawnerGraphics.fillEllipse(spcx, spcy, 16, 14);
    
    // Spawn ports
    // Top port
    spawnerGraphics.fillStyle(0x664400, 1);
    spawnerGraphics.fillCircle(spcx, spcy - 8, 3);
    spawnerGraphics.fillStyle(0x443300, 1);
    spawnerGraphics.fillCircle(spcx, spcy - 8, 2);
    spawnerGraphics.fillStyle(0x00ff00, 0.5);
    spawnerGraphics.fillCircle(spcx, spcy - 8, 1.2);
    
    // Bottom port
    spawnerGraphics.fillStyle(0x664400, 1);
    spawnerGraphics.fillCircle(spcx, spcy + 8, 3);
    spawnerGraphics.fillStyle(0x443300, 1);
    spawnerGraphics.fillCircle(spcx, spcy + 8, 2);
    spawnerGraphics.fillStyle(0x00ff00, 0.5);
    spawnerGraphics.fillCircle(spcx, spcy + 8, 1.2);
    
    // Left port
    spawnerGraphics.fillStyle(0x664400, 1);
    spawnerGraphics.fillCircle(spcx - 9, spcy, 3);
    spawnerGraphics.fillStyle(0x443300, 1);
    spawnerGraphics.fillCircle(spcx - 9, spcy, 2);
    spawnerGraphics.fillStyle(0x00ff00, 0.5);
    spawnerGraphics.fillCircle(spcx - 9, spcy, 1.2);
    
    // Right port
    spawnerGraphics.fillStyle(0x664400, 1);
    spawnerGraphics.fillCircle(spcx + 9, spcy, 3);
    spawnerGraphics.fillStyle(0x443300, 1);
    spawnerGraphics.fillCircle(spcx + 9, spcy, 2);
    spawnerGraphics.fillStyle(0x00ff00, 0.5);
    spawnerGraphics.fillCircle(spcx + 9, spcy, 1.2);
    
    // Internal eggs/embryos
    spawnerGraphics.fillStyle(0x00aa00, 0.6);
    spawnerGraphics.fillCircle(spcx - 3, spcy - 2, 3);
    spawnerGraphics.fillCircle(spcx + 3, spcy + 1, 2.5);
    spawnerGraphics.fillCircle(spcx - 1, spcy + 3, 2);
    
    // Embryo highlights
    spawnerGraphics.fillStyle(0x66ff66, 0.7);
    spawnerGraphics.fillCircle(spcx - 3.5, spcy - 2.5, 1.2);
    spawnerGraphics.fillCircle(spcx + 2.5, spcy + 0.5, 1);
    spawnerGraphics.fillCircle(spcx - 1.5, spcy + 2.5, 0.8);
    
    // Embryo cores
    spawnerGraphics.fillStyle(0xaaffaa, 1);
    spawnerGraphics.fillCircle(spcx - 3, spcy - 2, 0.8);
    spawnerGraphics.fillCircle(spcx + 3, spcy + 1, 0.7);
    
    // Central control node
    spawnerGraphics.fillStyle(0xaa6600, 1);
    spawnerGraphics.fillCircle(spcx, spcy, 3.5);
    
    spawnerGraphics.fillStyle(0xff8800, 1);
    spawnerGraphics.fillCircle(spcx, spcy, 2.5);
    
    spawnerGraphics.fillStyle(0xffaa44, 1);
    spawnerGraphics.fillCircle(spcx, spcy, 1.5);
    
    spawnerGraphics.fillStyle(0xffffaa, 0.9);
    spawnerGraphics.fillCircle(spcx - 0.5, spcy - 0.5, 0.6);
    
    // Veins/connections
    spawnerGraphics.lineStyle(1, 0x886600, 0.6);
    spawnerGraphics.beginPath();
    spawnerGraphics.moveTo(spcx, spcy);
    spawnerGraphics.lineTo(spcx, spcy - 8);
    spawnerGraphics.strokePath();
    spawnerGraphics.beginPath();
    spawnerGraphics.moveTo(spcx, spcy);
    spawnerGraphics.lineTo(spcx, spcy + 8);
    spawnerGraphics.strokePath();
    spawnerGraphics.beginPath();
    spawnerGraphics.moveTo(spcx, spcy);
    spawnerGraphics.lineTo(spcx - 9, spcy);
    spawnerGraphics.strokePath();
    spawnerGraphics.beginPath();
    spawnerGraphics.moveTo(spcx, spcy);
    spawnerGraphics.lineTo(spcx + 9, spcy);
    spawnerGraphics.strokePath();
    
    // Membrane texture
    spawnerGraphics.lineStyle(1, 0x997700, 0.3);
    spawnerGraphics.strokeEllipse(spcx, spcy, 18, 16);
    spawnerGraphics.strokeEllipse(spcx, spcy, 12, 10);
    
    // Outer edge
    spawnerGraphics.lineStyle(1, 0x664400, 0.8);
    spawnerGraphics.strokeEllipse(spcx, spcy, 22, 20);
    
    spawnerGraphics.generateTexture('spawner', spw, sph);
    spawnerGraphics.destroy();

    // ========================
    // SHIELDER - Protects Other Enemies
    // ========================
    const shielderGraphics = scene.add.graphics();
    const sdrw = 28, sdrh = 28;
    const sdrcx = sdrw / 2, sdrcy = sdrh / 2;
    
    // Protection field outer
    shielderGraphics.lineStyle(2, 0x00ff00, 0.15);
    shielderGraphics.strokeCircle(sdrcx, sdrcy, 14);
    
    // Protection field middle
    shielderGraphics.lineStyle(1, 0x44ff44, 0.25);
    shielderGraphics.strokeCircle(sdrcx, sdrcy, 12);
    
    // Protection field inner
    shielderGraphics.lineStyle(1, 0x88ff88, 0.35);
    shielderGraphics.strokeCircle(sdrcx, sdrcy, 10);
    
    // Field fill
    shielderGraphics.fillStyle(0x00ff00, 0.08);
    shielderGraphics.fillCircle(sdrcx, sdrcy, 10);
    
    // Diamond body shadow
    shielderGraphics.fillStyle(0x006600, 1);
    shielderGraphics.beginPath();
    shielderGraphics.moveTo(sdrcx, sdrcy - 8);
    shielderGraphics.lineTo(sdrcx + 9, sdrcy);
    shielderGraphics.lineTo(sdrcx, sdrcy + 9);
    shielderGraphics.lineTo(sdrcx - 8, sdrcy);
    shielderGraphics.closePath();
    shielderGraphics.fillPath();
    
    // Diamond body main
    shielderGraphics.fillStyle(0x00aa00, 1);
    shielderGraphics.beginPath();
    shielderGraphics.moveTo(sdrcx, sdrcy - 7);
    shielderGraphics.lineTo(sdrcx + 8, sdrcy);
    shielderGraphics.lineTo(sdrcx, sdrcy + 8);
    shielderGraphics.lineTo(sdrcx - 7, sdrcy);
    shielderGraphics.closePath();
    shielderGraphics.fillPath();
    
    // Diamond upper facet
    shielderGraphics.fillStyle(0x22cc22, 1);
    shielderGraphics.beginPath();
    shielderGraphics.moveTo(sdrcx, sdrcy - 6);
    shielderGraphics.lineTo(sdrcx + 6, sdrcy);
    shielderGraphics.lineTo(sdrcx, sdrcy);
    shielderGraphics.lineTo(sdrcx - 5, sdrcy);
    shielderGraphics.closePath();
    shielderGraphics.fillPath();
    
    // Diamond highlight
    shielderGraphics.fillStyle(0x44ff44, 0.6);
    shielderGraphics.beginPath();
    shielderGraphics.moveTo(sdrcx - 2, sdrcy - 5);
    shielderGraphics.lineTo(sdrcx + 2, sdrcy - 3);
    shielderGraphics.lineTo(sdrcx, sdrcy);
    shielderGraphics.lineTo(sdrcx - 4, sdrcy - 2);
    shielderGraphics.closePath();
    shielderGraphics.fillPath();
    
    // Energy nodes at corners
    // Top
    shielderGraphics.fillStyle(0x00ff00, 0.4);
    shielderGraphics.fillCircle(sdrcx, sdrcy - 7, 3);
    shielderGraphics.fillStyle(0xffffff, 1);
    shielderGraphics.fillCircle(sdrcx, sdrcy - 7, 2);
    shielderGraphics.fillStyle(0x00ff00, 1);
    shielderGraphics.fillCircle(sdrcx, sdrcy - 7, 1.2);
    shielderGraphics.fillStyle(0xaaffaa, 0.8);
    shielderGraphics.fillCircle(sdrcx - 0.5, sdrcy - 7.5, 0.5);
    
    // Right
    shielderGraphics.fillStyle(0x00ff00, 0.4);
    shielderGraphics.fillCircle(sdrcx + 8, sdrcy, 3);
    shielderGraphics.fillStyle(0xffffff, 1);
    shielderGraphics.fillCircle(sdrcx + 8, sdrcy, 2);
    shielderGraphics.fillStyle(0x00ff00, 1);
    shielderGraphics.fillCircle(sdrcx + 8, sdrcy, 1.2);
    shielderGraphics.fillStyle(0xaaffaa, 0.8);
    shielderGraphics.fillCircle(sdrcx + 7.5, sdrcy - 0.5, 0.5);
    
    // Bottom
    shielderGraphics.fillStyle(0x00ff00, 0.4);
    shielderGraphics.fillCircle(sdrcx, sdrcy + 8, 3);
    shielderGraphics.fillStyle(0xffffff, 1);
    shielderGraphics.fillCircle(sdrcx, sdrcy + 8, 2);
    shielderGraphics.fillStyle(0x00ff00, 1);
    shielderGraphics.fillCircle(sdrcx, sdrcy + 8, 1.2);
    shielderGraphics.fillStyle(0xaaffaa, 0.8);
    shielderGraphics.fillCircle(sdrcx - 0.5, sdrcy + 7.5, 0.5);
    
    // Left
    shielderGraphics.fillStyle(0x00ff00, 0.4);
    shielderGraphics.fillCircle(sdrcx - 7, sdrcy, 3);
    shielderGraphics.fillStyle(0xffffff, 1);
    shielderGraphics.fillCircle(sdrcx - 7, sdrcy, 2);
    shielderGraphics.fillStyle(0x00ff00, 1);
    shielderGraphics.fillCircle(sdrcx - 7, sdrcy, 1.2);
    shielderGraphics.fillStyle(0xaaffaa, 0.8);
    shielderGraphics.fillCircle(sdrcx - 7.5, sdrcy - 0.5, 0.5);
    
    // Inner core ring
    shielderGraphics.lineStyle(1, 0x006600, 0.8);
    shielderGraphics.strokeCircle(sdrcx, sdrcy, 5);
    
    // Inner core body
    shielderGraphics.fillStyle(0x00aa00, 1);
    shielderGraphics.fillCircle(sdrcx, sdrcy, 4.5);
    
    shielderGraphics.fillStyle(0x44ff44, 1);
    shielderGraphics.fillCircle(sdrcx, sdrcy, 3.5);
    
    // Central eye
    shielderGraphics.fillStyle(0x004400, 1);
    shielderGraphics.fillCircle(sdrcx, sdrcy, 2.5);
    shielderGraphics.fillStyle(0x00ff00, 1);
    shielderGraphics.fillCircle(sdrcx, sdrcy, 1.8);
    shielderGraphics.fillStyle(0xaaffaa, 1);
    shielderGraphics.fillCircle(sdrcx, sdrcy, 1);
    shielderGraphics.fillStyle(0xffffff, 0.9);
    shielderGraphics.fillCircle(sdrcx - 0.5, sdrcy - 0.5, 0.4);
    
    // Diamond edge
    shielderGraphics.lineStyle(1, 0x005500, 0.8);
    shielderGraphics.beginPath();
    shielderGraphics.moveTo(sdrcx, sdrcy - 7);
    shielderGraphics.lineTo(sdrcx + 8, sdrcy);
    shielderGraphics.lineTo(sdrcx, sdrcy + 8);
    shielderGraphics.lineTo(sdrcx - 7, sdrcy);
    shielderGraphics.closePath();
    shielderGraphics.strokePath();
    
    shielderGraphics.generateTexture('shielder', sdrw, sdrh);
    shielderGraphics.destroy();

    // ========================
    // BOUNCER - Erratic Ricochet Movement
    // ========================
    const bouncerGraphics = scene.add.graphics();
    const bnw = 22, bnh = 18;
    const bncx = bnw / 2 + 2, bncy = bnh / 2;
    
    // Motion blur trail
    bouncerGraphics.fillStyle(0xff6600, 0.15);
    bouncerGraphics.fillCircle(bncx - 8, bncy, 5);
    bouncerGraphics.fillStyle(0xff6600, 0.25);
    bouncerGraphics.fillCircle(bncx - 5, bncy, 6);
    bouncerGraphics.fillStyle(0xff6600, 0.35);
    bouncerGraphics.fillCircle(bncx - 2, bncy, 7);
    
    // Main body shadow
    bouncerGraphics.fillStyle(0xcc4400, 1);
    bouncerGraphics.fillCircle(bncx, bncy + 1, 8);
    
    // Main body
    bouncerGraphics.fillStyle(0xff6600, 1);
    bouncerGraphics.fillCircle(bncx, bncy, 7.5);
    
    // Body highlight
    bouncerGraphics.fillStyle(0xff8833, 1);
    bouncerGraphics.fillCircle(bncx - 1, bncy - 1, 6);
    
    // Body shine
    bouncerGraphics.fillStyle(0xffaa55, 1);
    bouncerGraphics.fillCircle(bncx - 2, bncy - 2, 4);
    
    // Specular highlight
    bouncerGraphics.fillStyle(0xffcc88, 0.8);
    bouncerGraphics.fillCircle(bncx - 3, bncy - 3, 2.5);
    
    // Bright spot
    bouncerGraphics.fillStyle(0xffffff, 0.9);
    bouncerGraphics.fillCircle(bncx - 3.5, bncy - 3.5, 1.2);
    
    // Rubber texture rings
    bouncerGraphics.lineStyle(1, 0xcc5500, 0.3);
    bouncerGraphics.strokeCircle(bncx, bncy, 5);
    bouncerGraphics.strokeCircle(bncx, bncy, 3);
    
    // Speed lines
    bouncerGraphics.lineStyle(1, 0xffcc88, 0.5);
    bouncerGraphics.beginPath();
    bouncerGraphics.moveTo(0, bncy - 4);
    bouncerGraphics.lineTo(bncx - 8, bncy - 3);
    bouncerGraphics.strokePath();
    bouncerGraphics.beginPath();
    bouncerGraphics.moveTo(0, bncy);
    bouncerGraphics.lineTo(bncx - 9, bncy);
    bouncerGraphics.strokePath();
    bouncerGraphics.beginPath();
    bouncerGraphics.moveTo(0, bncy + 4);
    bouncerGraphics.lineTo(bncx - 8, bncy + 3);
    bouncerGraphics.strokePath();
    
    // Angry eyes
    bouncerGraphics.fillStyle(0xffffff, 1);
    bouncerGraphics.fillCircle(bncx - 2, bncy - 1, 2);
    bouncerGraphics.fillCircle(bncx + 2.5, bncy - 1, 2);
    
    bouncerGraphics.fillStyle(0x000000, 1);
    bouncerGraphics.fillCircle(bncx - 1.5, bncy - 0.5, 1);
    bouncerGraphics.fillCircle(bncx + 3, bncy - 0.5, 1);
    
    // Angry eyebrows
    bouncerGraphics.lineStyle(1.5, 0x000000, 1);
    bouncerGraphics.beginPath();
    bouncerGraphics.moveTo(bncx - 4, bncy - 3);
    bouncerGraphics.lineTo(bncx - 1, bncy - 2);
    bouncerGraphics.strokePath();
    bouncerGraphics.beginPath();
    bouncerGraphics.moveTo(bncx + 5, bncy - 3);
    bouncerGraphics.lineTo(bncx + 2, bncy - 2);
    bouncerGraphics.strokePath();
    
    // Angry mouth
    bouncerGraphics.lineStyle(1.5, 0x000000, 1);
    bouncerGraphics.beginPath();
    bouncerGraphics.moveTo(bncx - 2.5, bncy + 3);
    bouncerGraphics.lineTo(bncx, bncy + 2);
    bouncerGraphics.lineTo(bncx + 2.5, bncy + 3);
    bouncerGraphics.strokePath();
    
    // Outer edge
    bouncerGraphics.lineStyle(1, 0xdd5500, 0.7);
    bouncerGraphics.strokeCircle(bncx, bncy, 7.5);
    
    // Impact marks
    bouncerGraphics.fillStyle(0xcc4400, 0.5);
    bouncerGraphics.fillCircle(bncx + 5, bncy + 2, 1.5);
    bouncerGraphics.fillCircle(bncx + 3, bncy + 5, 1);
    
    bouncerGraphics.generateTexture('bouncer', bnw, bnh);
    bouncerGraphics.destroy();

    // ========================
    // SNIPER - Long-range Precision Shooter
    // ========================
    const sniperGraphics = scene.add.graphics();
    const snw = 36, snh = 18;
    const sncy = snh / 2;
    
    // Targeting laser beam
    sniperGraphics.fillStyle(0xff0000, 0.15);
    sniperGraphics.fillRect(28, sncy - 1, 8, 2);
    sniperGraphics.lineStyle(1, 0xff0000, 0.4);
    sniperGraphics.beginPath();
    sniperGraphics.moveTo(28, sncy);
    sniperGraphics.lineTo(36, sncy);
    sniperGraphics.strokePath();
    
    // Laser tip glow
    sniperGraphics.fillStyle(0xff0000, 0.6);
    sniperGraphics.fillCircle(35, sncy, 2);
    sniperGraphics.fillStyle(0xff4444, 1);
    sniperGraphics.fillCircle(35, sncy, 1);
    
    // Barrel shadow
    sniperGraphics.fillStyle(0x222222, 1);
    sniperGraphics.fillRect(0, sncy - 2, 24, 5);
    
    // Main barrel
    sniperGraphics.fillStyle(0x333333, 1);
    sniperGraphics.fillRect(0, sncy - 1.5, 24, 4);
    
    // Barrel highlight
    sniperGraphics.fillStyle(0x444444, 1);
    sniperGraphics.fillRect(0, sncy - 1.5, 24, 2);
    
    // Barrel tip housing
    sniperGraphics.fillStyle(0x444444, 1);
    sniperGraphics.fillRect(24, sncy - 3, 5, 6);
    
    // Barrel tip detail
    sniperGraphics.fillStyle(0x555555, 1);
    sniperGraphics.fillRect(25, sncy - 2.5, 4, 5);
    
    // Barrel muzzle
    sniperGraphics.fillStyle(0x222222, 1);
    sniperGraphics.fillRect(28, sncy - 2, 2, 4);
    
    // Muzzle glow
    sniperGraphics.fillStyle(0xff4400, 0.5);
    sniperGraphics.fillCircle(29, sncy, 1.5);
    
    // Main body shadow
    sniperGraphics.fillStyle(0x222222, 1);
    sniperGraphics.fillEllipse(10, sncy + 1, 14, 10);
    
    // Main body
    sniperGraphics.fillStyle(0x444444, 1);
    sniperGraphics.fillEllipse(10, sncy, 13, 9);
    
    // Body highlight
    sniperGraphics.fillStyle(0x555555, 1);
    sniperGraphics.fillEllipse(9, sncy - 1, 10, 6);
    
    // Body shine
    sniperGraphics.fillStyle(0x666666, 0.6);
    sniperGraphics.fillEllipse(8, sncy - 2, 6, 4);
    
    // Scope mount
    sniperGraphics.fillStyle(0x333333, 1);
    sniperGraphics.fillRect(5, sncy - 8, 10, 4);
    
    // Scope body
    sniperGraphics.fillStyle(0x222222, 1);
    sniperGraphics.fillRect(6, sncy - 9, 8, 5);
    
    // Scope lens housing
    sniperGraphics.fillStyle(0x333333, 1);
    sniperGraphics.fillCircle(10, sncy - 7, 3);
    
    // Scope lens glow
    sniperGraphics.fillStyle(0xff0000, 0.3);
    sniperGraphics.fillCircle(10, sncy - 7, 2.5);
    
    // Scope lens
    sniperGraphics.fillStyle(0xff0000, 0.8);
    sniperGraphics.fillCircle(10, sncy - 7, 2);
    
    // Scope lens inner
    sniperGraphics.fillStyle(0xff4444, 1);
    sniperGraphics.fillCircle(10, sncy - 7, 1.2);
    
    // Scope highlight
    sniperGraphics.fillStyle(0xffffff, 0.7);
    sniperGraphics.fillCircle(9.5, sncy - 7.5, 0.5);
    
    // Stabilizer fin top
    sniperGraphics.fillStyle(0x444444, 1);
    sniperGraphics.beginPath();
    sniperGraphics.moveTo(2, sncy - 2);
    sniperGraphics.lineTo(0, sncy - 6);
    sniperGraphics.lineTo(6, sncy - 2);
    sniperGraphics.closePath();
    sniperGraphics.fillPath();
    
    // Fin top highlight
    sniperGraphics.fillStyle(0x555555, 0.8);
    sniperGraphics.beginPath();
    sniperGraphics.moveTo(2, sncy - 3);
    sniperGraphics.lineTo(1, sncy - 5);
    sniperGraphics.lineTo(4, sncy - 3);
    sniperGraphics.closePath();
    sniperGraphics.fillPath();
    
    // Stabilizer fin bottom
    sniperGraphics.fillStyle(0x333333, 1);
    sniperGraphics.beginPath();
    sniperGraphics.moveTo(2, sncy + 2);
    sniperGraphics.lineTo(0, sncy + 6);
    sniperGraphics.lineTo(6, sncy + 2);
    sniperGraphics.closePath();
    sniperGraphics.fillPath();
    
    // Panel lines
    sniperGraphics.lineStyle(1, 0x222222, 0.6);
    sniperGraphics.beginPath();
    sniperGraphics.moveTo(6, sncy - 3);
    sniperGraphics.lineTo(6, sncy + 3);
    sniperGraphics.strokePath();
    sniperGraphics.beginPath();
    sniperGraphics.moveTo(14, sncy - 3);
    sniperGraphics.lineTo(14, sncy + 3);
    sniperGraphics.strokePath();
    
    // Barrel segments
    sniperGraphics.lineStyle(1, 0x222222, 0.5);
    sniperGraphics.beginPath();
    sniperGraphics.moveTo(8, sncy - 1.5);
    sniperGraphics.lineTo(8, sncy + 2.5);
    sniperGraphics.strokePath();
    sniperGraphics.beginPath();
    sniperGraphics.moveTo(16, sncy - 1.5);
    sniperGraphics.lineTo(16, sncy + 2.5);
    sniperGraphics.strokePath();
    
    // Body edge
    sniperGraphics.lineStyle(1, 0x222222, 0.8);
    sniperGraphics.strokeEllipse(10, sncy, 13, 9);
    
    sniperGraphics.generateTexture('sniper', snw, snh);
    sniperGraphics.destroy();

    // ========================
    // SWARM LEADER - Buffs Nearby Enemies
    // ========================
    const swarmLeaderGraphics = scene.add.graphics();
    const slw = 28, slh = 28;
    const slcx = slw / 2, slcy = slh / 2;
    
    // Command aura outer
    swarmLeaderGraphics.fillStyle(0x6600ff, 0.08);
    swarmLeaderGraphics.fillCircle(slcx, slcy, 14);
    
    // Command aura middle
    swarmLeaderGraphics.lineStyle(2, 0x6600ff, 0.2);
    swarmLeaderGraphics.strokeCircle(slcx, slcy, 13);
    
    // Command aura inner
    swarmLeaderGraphics.lineStyle(1, 0xaa44ff, 0.3);
    swarmLeaderGraphics.strokeCircle(slcx, slcy, 11);
    
    // Crown spikes
    // Left spike
    swarmLeaderGraphics.fillStyle(0xcc9900, 1);
    swarmLeaderGraphics.beginPath();
    swarmLeaderGraphics.moveTo(slcx - 6, slcy - 6);
    swarmLeaderGraphics.lineTo(slcx - 4, slcy - 12);
    swarmLeaderGraphics.lineTo(slcx - 2, slcy - 6);
    swarmLeaderGraphics.closePath();
    swarmLeaderGraphics.fillPath();
    swarmLeaderGraphics.fillStyle(0xffcc00, 1);
    swarmLeaderGraphics.beginPath();
    swarmLeaderGraphics.moveTo(slcx - 5.5, slcy - 7);
    swarmLeaderGraphics.lineTo(slcx - 4, slcy - 11);
    swarmLeaderGraphics.lineTo(slcx - 3, slcy - 7);
    swarmLeaderGraphics.closePath();
    swarmLeaderGraphics.fillPath();
    
    // Center spike
    swarmLeaderGraphics.fillStyle(0xcc9900, 1);
    swarmLeaderGraphics.beginPath();
    swarmLeaderGraphics.moveTo(slcx - 2, slcy - 6);
    swarmLeaderGraphics.lineTo(slcx, slcy - 14);
    swarmLeaderGraphics.lineTo(slcx + 2, slcy - 6);
    swarmLeaderGraphics.closePath();
    swarmLeaderGraphics.fillPath();
    swarmLeaderGraphics.fillStyle(0xffcc00, 1);
    swarmLeaderGraphics.beginPath();
    swarmLeaderGraphics.moveTo(slcx - 1.5, slcy - 7);
    swarmLeaderGraphics.lineTo(slcx, slcy - 13);
    swarmLeaderGraphics.lineTo(slcx + 1.5, slcy - 7);
    swarmLeaderGraphics.closePath();
    swarmLeaderGraphics.fillPath();
    
    // Right spike
    swarmLeaderGraphics.fillStyle(0xcc9900, 1);
    swarmLeaderGraphics.beginPath();
    swarmLeaderGraphics.moveTo(slcx + 2, slcy - 6);
    swarmLeaderGraphics.lineTo(slcx + 4, slcy - 12);
    swarmLeaderGraphics.lineTo(slcx + 6, slcy - 6);
    swarmLeaderGraphics.closePath();
    swarmLeaderGraphics.fillPath();
    swarmLeaderGraphics.fillStyle(0xffcc00, 1);
    swarmLeaderGraphics.beginPath();
    swarmLeaderGraphics.moveTo(slcx + 2.5, slcy - 7);
    swarmLeaderGraphics.lineTo(slcx + 4, slcy - 11);
    swarmLeaderGraphics.lineTo(slcx + 5.5, slcy - 7);
    swarmLeaderGraphics.closePath();
    swarmLeaderGraphics.fillPath();
    
    // Crown gems
    swarmLeaderGraphics.fillStyle(0xff0000, 1);
    swarmLeaderGraphics.fillCircle(slcx - 4, slcy - 10, 1);
    swarmLeaderGraphics.fillCircle(slcx, slcy - 12, 1.2);
    swarmLeaderGraphics.fillCircle(slcx + 4, slcy - 10, 1);
    
    // Main body shadow
    swarmLeaderGraphics.fillStyle(0x4400aa, 1);
    swarmLeaderGraphics.fillEllipse(slcx, slcy + 2, 18, 15);
    
    // Main body
    swarmLeaderGraphics.fillStyle(0x6600ff, 1);
    swarmLeaderGraphics.fillEllipse(slcx, slcy + 1, 17, 14);
    
    // Body highlight
    swarmLeaderGraphics.fillStyle(0x7722ff, 1);
    swarmLeaderGraphics.fillEllipse(slcx - 1, slcy, 13, 10);
    
    // Body shine
    swarmLeaderGraphics.fillStyle(0x9944ff, 0.6);
    swarmLeaderGraphics.fillEllipse(slcx - 2, slcy - 2, 8, 6);
    
    // Inner body
    swarmLeaderGraphics.fillStyle(0x8833ff, 1);
    swarmLeaderGraphics.fillEllipse(slcx, slcy + 1, 12, 10);
    
    // Command eye socket
    swarmLeaderGraphics.fillStyle(0x330066, 1);
    swarmLeaderGraphics.fillCircle(slcx, slcy, 4);
    
    // Eye white
    swarmLeaderGraphics.fillStyle(0xffffff, 1);
    swarmLeaderGraphics.fillCircle(slcx, slcy, 3.5);
    
    // Eye iris
    swarmLeaderGraphics.fillStyle(0xffcc00, 1);
    swarmLeaderGraphics.fillCircle(slcx, slcy, 2.5);
    
    // Eye inner
    swarmLeaderGraphics.fillStyle(0xffaa00, 1);
    swarmLeaderGraphics.fillCircle(slcx, slcy, 1.8);
    
    // Pupil
    swarmLeaderGraphics.fillStyle(0x000000, 1);
    swarmLeaderGraphics.fillCircle(slcx, slcy, 1);
    
    // Eye highlight
    swarmLeaderGraphics.fillStyle(0xffffff, 0.9);
    swarmLeaderGraphics.fillCircle(slcx - 1, slcy - 1, 0.7);
    
    // Buff emanation points
    // Left
    swarmLeaderGraphics.fillStyle(0xffff00, 0.4);
    swarmLeaderGraphics.fillCircle(slcx - 8, slcy + 1, 3);
    swarmLeaderGraphics.fillStyle(0xffff00, 1);
    swarmLeaderGraphics.fillCircle(slcx - 8, slcy + 1, 2);
    swarmLeaderGraphics.fillStyle(0xffffaa, 1);
    swarmLeaderGraphics.fillCircle(slcx - 8, slcy + 1, 1);
    
    // Right
    swarmLeaderGraphics.fillStyle(0xffff00, 0.4);
    swarmLeaderGraphics.fillCircle(slcx + 8, slcy + 1, 3);
    swarmLeaderGraphics.fillStyle(0xffff00, 1);
    swarmLeaderGraphics.fillCircle(slcx + 8, slcy + 1, 2);
    swarmLeaderGraphics.fillStyle(0xffffaa, 1);
    swarmLeaderGraphics.fillCircle(slcx + 8, slcy + 1, 1);
    
    // Bottom
    swarmLeaderGraphics.fillStyle(0xffff00, 0.4);
    swarmLeaderGraphics.fillCircle(slcx, slcy + 9, 3);
    swarmLeaderGraphics.fillStyle(0xffff00, 1);
    swarmLeaderGraphics.fillCircle(slcx, slcy + 9, 2);
    swarmLeaderGraphics.fillStyle(0xffffaa, 1);
    swarmLeaderGraphics.fillCircle(slcx, slcy + 9, 1);
    
    // Royal markings
    swarmLeaderGraphics.lineStyle(1, 0x4400aa, 0.6);
    swarmLeaderGraphics.beginPath();
    swarmLeaderGraphics.moveTo(slcx - 5, slcy + 3);
    swarmLeaderGraphics.lineTo(slcx - 8, slcy + 1);
    swarmLeaderGraphics.strokePath();
    swarmLeaderGraphics.beginPath();
    swarmLeaderGraphics.moveTo(slcx + 5, slcy + 3);
    swarmLeaderGraphics.lineTo(slcx + 8, slcy + 1);
    swarmLeaderGraphics.strokePath();
    swarmLeaderGraphics.beginPath();
    swarmLeaderGraphics.moveTo(slcx, slcy + 5);
    swarmLeaderGraphics.lineTo(slcx, slcy + 9);
    swarmLeaderGraphics.strokePath();
    
    // Body edge
    swarmLeaderGraphics.lineStyle(1, 0x330088, 0.7);
    swarmLeaderGraphics.strokeEllipse(slcx, slcy + 1, 16, 13);
    
    swarmLeaderGraphics.generateTexture('swarmLeader', slw, slh);
    swarmLeaderGraphics.destroy();

    // ========================
    // REGENERATOR - Self-healing Enemy
    // ========================
    const regeneratorGraphics = scene.add.graphics();
    const rgw = 28, rgh = 28;
    const rgcx = rgw / 2, rgcy = rgh / 2;
    
    // Healing aura outer
    regeneratorGraphics.fillStyle(0x00ff44, 0.08);
    regeneratorGraphics.fillCircle(rgcx, rgcy, 14);
    
    // Healing aura middle
    regeneratorGraphics.fillStyle(0x00ff66, 0.12);
    regeneratorGraphics.fillCircle(rgcx, rgcy, 12);
    
    // Healing particles floating
    regeneratorGraphics.fillStyle(0xaaffaa, 0.8);
    regeneratorGraphics.fillCircle(rgcx - 8, rgcy - 8, 1.2);
    regeneratorGraphics.fillCircle(rgcx + 9, rgcy - 6, 1);
    regeneratorGraphics.fillCircle(rgcx - 10, rgcy + 4, 1.3);
    regeneratorGraphics.fillCircle(rgcx + 8, rgcy + 7, 1.1);
    regeneratorGraphics.fillCircle(rgcx + 2, rgcy - 10, 0.9);
    regeneratorGraphics.fillCircle(rgcx - 4, rgcy + 10, 1);
    
    // Outer membrane
    regeneratorGraphics.fillStyle(0x006622, 1);
    regeneratorGraphics.fillEllipse(rgcx, rgcy, 22, 20);
    
    // Main body
    regeneratorGraphics.fillStyle(0x00aa44, 1);
    regeneratorGraphics.fillEllipse(rgcx, rgcy, 20, 18);
    
    // Body highlight
    regeneratorGraphics.fillStyle(0x00cc55, 1);
    regeneratorGraphics.fillEllipse(rgcx - 2, rgcy - 2, 14, 12);
    
    // Body shine
    regeneratorGraphics.fillStyle(0x00ee66, 0.5);
    regeneratorGraphics.fillEllipse(rgcx - 3, rgcy - 4, 8, 6);
    
    // Regenerating tissue patches
    regeneratorGraphics.fillStyle(0x00cc55, 0.8);
    regeneratorGraphics.fillEllipse(rgcx - 5, rgcy - 2, 5, 7);
    regeneratorGraphics.fillEllipse(rgcx + 5, rgcy - 1, 5, 6);
    regeneratorGraphics.fillEllipse(rgcx, rgcy + 5, 7, 4);
    
    // Tissue patch highlights
    regeneratorGraphics.fillStyle(0x44ff88, 0.6);
    regeneratorGraphics.fillEllipse(rgcx - 5.5, rgcy - 3, 3, 4);
    regeneratorGraphics.fillEllipse(rgcx + 4.5, rgcy - 2, 3, 4);
    regeneratorGraphics.fillEllipse(rgcx - 1, rgcy + 4.5, 4, 2.5);
    
    // Core nucleus ring
    regeneratorGraphics.lineStyle(1, 0x006633, 0.8);
    regeneratorGraphics.strokeCircle(rgcx, rgcy, 5);
    
    // Core nucleus body
    regeneratorGraphics.fillStyle(0x00aa44, 1);
    regeneratorGraphics.fillCircle(rgcx, rgcy, 4.5);
    
    regeneratorGraphics.fillStyle(0x00ff66, 1);
    regeneratorGraphics.fillCircle(rgcx, rgcy, 3.5);
    
    // Nucleus highlight
    regeneratorGraphics.fillStyle(0x44ff88, 1);
    regeneratorGraphics.fillCircle(rgcx - 0.5, rgcy - 0.5, 2.5);
    
    // Central core
    regeneratorGraphics.fillStyle(0x006633, 1);
    regeneratorGraphics.fillCircle(rgcx, rgcy, 2);
    
    regeneratorGraphics.fillStyle(0xffffff, 1);
    regeneratorGraphics.fillCircle(rgcx, rgcy, 1.5);
    
    regeneratorGraphics.fillStyle(0x00ff00, 1);
    regeneratorGraphics.fillCircle(rgcx, rgcy, 1);
    
    // Core highlight
    regeneratorGraphics.fillStyle(0xaaffaa, 0.9);
    regeneratorGraphics.fillCircle(rgcx - 0.4, rgcy - 0.4, 0.4);
    
    // Cell division lines (healing pattern)
    regeneratorGraphics.lineStyle(1, 0x008833, 0.4);
    regeneratorGraphics.beginPath();
    regeneratorGraphics.moveTo(rgcx, rgcy - 8);
    regeneratorGraphics.lineTo(rgcx, rgcy + 8);
    regeneratorGraphics.strokePath();
    regeneratorGraphics.beginPath();
    regeneratorGraphics.moveTo(rgcx - 8, rgcy);
    regeneratorGraphics.lineTo(rgcx + 8, rgcy);
    regeneratorGraphics.strokePath();
    
    // Healing energy pulses
    regeneratorGraphics.lineStyle(1, 0x66ff88, 0.3);
    regeneratorGraphics.strokeCircle(rgcx, rgcy, 7);
    regeneratorGraphics.strokeCircle(rgcx, rgcy, 9);
    
    // Outer membrane edge
    regeneratorGraphics.lineStyle(1, 0x005522, 0.8);
    regeneratorGraphics.strokeEllipse(rgcx, rgcy, 20, 18);
    
    // Healing sparkles
    regeneratorGraphics.fillStyle(0xffffff, 0.9);
    regeneratorGraphics.fillCircle(rgcx - 6, rgcy - 5, 0.8);
    regeneratorGraphics.fillCircle(rgcx + 7, rgcy - 3, 0.7);
    regeneratorGraphics.fillCircle(rgcx + 4, rgcy + 6, 0.6);
    regeneratorGraphics.fillCircle(rgcx - 5, rgcy + 5, 0.7);
    
    regeneratorGraphics.generateTexture('regenerator', rgw, rgh);
    regeneratorGraphics.destroy();
}