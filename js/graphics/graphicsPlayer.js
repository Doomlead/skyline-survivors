// ------------------------
// Player Graphics - Ship
// ------------------------

function createPlayerGraphics(scene) {
    const g = scene.add.graphics();
    const w = 64, h = 32;
    const cy = h / 2; // Center Y = 16

    // ========================
    // DROP SHADOW
    // ========================
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(32, cy + 3, 50, 12);

    // ========================
    // ENGINE EXHAUST FLAMES
    // ========================
    
    // Outer flame (red)
    g.fillStyle(0xff3300, 0.9);
    g.beginPath();
    g.moveTo(6, cy - 4);
    g.lineTo(-6, cy);
    g.lineTo(6, cy + 4);
    g.closePath();
    g.fillPath();
    
    // Middle flame (orange)
    g.fillStyle(0xff7700, 1);
    g.beginPath();
    g.moveTo(6, cy - 3);
    g.lineTo(-2, cy);
    g.lineTo(6, cy + 3);
    g.closePath();
    g.fillPath();
    
    // Inner flame (yellow)
    g.fillStyle(0xffcc00, 1);
    g.beginPath();
    g.moveTo(6, cy - 2);
    g.lineTo(2, cy);
    g.lineTo(6, cy + 2);
    g.closePath();
    g.fillPath();
    
    // Hot core
    g.fillStyle(0xffffff, 0.9);
    g.fillEllipse(5, cy, 2, 1.5);
    
    // Flame glow
    g.fillStyle(0xff5500, 0.2);
    g.fillEllipse(-2, cy, 12, 8);

    // ========================
    // ENGINE BLOCK
    // ========================
    
    // Main engine housing
    g.fillStyle(0x2a2a3d, 1);
    g.fillRect(4, cy - 6, 10, 12);
    
    // Engine face plate
    g.fillStyle(0x3d3d55, 1);
    g.fillRect(6, cy - 5, 6, 10);
    
    // Engine nozzle rim
    g.lineStyle(2, 0x4a4a66, 1);
    g.beginPath();
    g.moveTo(5, cy - 5);
    g.lineTo(5, cy + 5);
    g.strokePath();
    
    // Engine vents
    g.fillStyle(0x1a1a28, 1);
    g.fillRect(8, cy - 4, 3, 2);
    g.fillRect(8, cy + 2, 3, 2);
    
    // Engine glow lines
    g.fillStyle(0x00aaff, 0.4);
    g.fillRect(6, cy - 1, 4, 2);

    // ========================
    // MAIN FUSELAGE (BODY)
    // ========================
    
    // Bottom hull (darker)
    g.fillStyle(0x1a5070, 1);
    g.beginPath();
    g.moveTo(12, cy);
    g.lineTo(14, cy + 7);
    g.lineTo(50, cy + 5);
    g.lineTo(58, cy + 2);
    g.lineTo(58, cy);
    g.closePath();
    g.fillPath();
    
    // Top hull (lighter - lit side)
    g.fillStyle(0x2a8cb0, 1);
    g.beginPath();
    g.moveTo(12, cy);
    g.lineTo(14, cy - 7);
    g.lineTo(50, cy - 5);
    g.lineTo(58, cy - 2);
    g.lineTo(58, cy);
    g.closePath();
    g.fillPath();
    
    // Hull center stripe
    g.fillStyle(0x40b0d8, 1);
    g.fillRect(14, cy - 1, 44, 2);
    
    // Hull highlight
    g.fillStyle(0x60d0f0, 0.6);
    g.fillRect(20, cy - 3, 30, 1);

    // ========================
    // NOSE CONE
    // ========================
    
    // Nose top
    g.fillStyle(0x35a0c8, 1);
    g.beginPath();
    g.moveTo(56, cy - 3);
    g.lineTo(64, cy);
    g.lineTo(56, cy);
    g.closePath();
    g.fillPath();
    
    // Nose bottom
    g.fillStyle(0x1a6080, 1);
    g.beginPath();
    g.moveTo(56, cy);
    g.lineTo(64, cy);
    g.lineTo(56, cy + 3);
    g.closePath();
    g.fillPath();
    
    // Nose tip highlight
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(62, cy - 1, 1);

    // ========================
    // TOP FIN/WING
    // ========================
    
    // Fin base (darker)
    g.fillStyle(0x1a6080, 1);
    g.beginPath();
    g.moveTo(20, cy - 6);
    g.lineTo(28, cy - 14);
    g.lineTo(40, cy - 12);
    g.lineTo(44, cy - 5);
    g.closePath();
    g.fillPath();
    
    // Fin surface (lighter)
    g.fillStyle(0x2890b0, 1);
    g.beginPath();
    g.moveTo(22, cy - 6);
    g.lineTo(29, cy - 13);
    g.lineTo(38, cy - 11);
    g.lineTo(42, cy - 6);
    g.closePath();
    g.fillPath();
    
    // Fin edge highlight
    g.lineStyle(1, 0x50c0e0, 0.8);
    g.beginPath();
    g.moveTo(28, cy - 14);
    g.lineTo(40, cy - 12);
    g.strokePath();
    
    // Fin nav light (red - port)
    g.fillStyle(0xff0000, 1);
    g.fillCircle(30, cy - 13, 1.5);
    g.fillStyle(0xff0000, 0.3);
    g.fillCircle(30, cy - 13, 3);

    // ========================
    // BOTTOM FIN/WING
    // ========================
    
    // Fin base
    g.fillStyle(0x145060, 1);
    g.beginPath();
    g.moveTo(20, cy + 6);
    g.lineTo(28, cy + 14);
    g.lineTo(40, cy + 12);
    g.lineTo(44, cy + 5);
    g.closePath();
    g.fillPath();
    
    // Fin surface
    g.fillStyle(0x1a7090, 1);
    g.beginPath();
    g.moveTo(22, cy + 6);
    g.lineTo(29, cy + 13);
    g.lineTo(38, cy + 11);
    g.lineTo(42, cy + 6);
    g.closePath();
    g.fillPath();
    
    // Fin nav light (green - starboard)
    g.fillStyle(0x00ff00, 1);
    g.fillCircle(30, cy + 13, 1.5);
    g.fillStyle(0x00ff00, 0.3);
    g.fillCircle(30, cy + 13, 3);

    // ========================
    // COCKPIT
    // ========================
    
    // Cockpit frame
    g.fillStyle(0x1a3a4a, 1);
    g.beginPath();
    g.moveTo(36, cy - 6);
    g.lineTo(52, cy - 4);
    g.lineTo(52, cy - 1);
    g.lineTo(36, cy - 2);
    g.closePath();
    g.fillPath();
    
    // Cockpit glass
    g.fillStyle(0x00e0ff, 0.8);
    g.beginPath();
    g.moveTo(38, cy - 5);
    g.lineTo(50, cy - 4);
    g.lineTo(50, cy - 2);
    g.lineTo(38, cy - 3);
    g.closePath();
    g.fillPath();
    
    // Glass reflection
    g.fillStyle(0xffffff, 0.8);
    g.fillEllipse(42, cy - 4.5, 4, 1);
    g.fillStyle(0x80ffff, 0.4);
    g.fillEllipse(46, cy - 3, 3, 1);
    
    // Cockpit frame line
    g.lineStyle(1, 0x0a2a3a, 1);
    g.beginPath();
    g.moveTo(44, cy - 5);
    g.lineTo(44, cy - 2);
    g.strokePath();

    // ========================
    // MAIN CANNON
    // ========================
    
    // Cannon mount
    g.fillStyle(0x3a3a50, 1);
    g.fillRect(44, cy + 2, 12, 3);
    
    // Cannon barrel
    g.fillStyle(0x4a4a65, 1);
    g.fillRect(56, cy + 2.5, 8, 2);
    
    // Cannon tip
    g.fillStyle(0x2a2a40, 1);
    g.fillRect(62, cy + 2.5, 2, 2);
    
    // Cannon energy glow
    g.fillStyle(0x00ff88, 0.9);
    g.fillCircle(64, cy + 3.5, 1);
    g.fillStyle(0x00ff88, 0.3);
    g.fillCircle(64, cy + 3.5, 2.5);
    
    // Cannon detail lines
    g.lineStyle(1, 0x5a5a75, 0.7);
    g.beginPath();
    g.moveTo(48, cy + 2);
    g.lineTo(48, cy + 5);
    g.strokePath();
    g.beginPath();
    g.moveTo(52, cy + 2);
    g.lineTo(52, cy + 5);
    g.strokePath();

    // ========================
    // PANEL LINES & DETAILS
    // ========================
    
    // Hull panel lines
    g.lineStyle(1, 0x104050, 0.6);
    g.beginPath();
    g.moveTo(24, cy - 5);
    g.lineTo(24, cy + 5);
    g.strokePath();
    g.beginPath();
    g.moveTo(34, cy - 5);
    g.lineTo(34, cy + 5);
    g.strokePath();
    g.beginPath();
    g.moveTo(48, cy - 4);
    g.lineTo(48, cy + 2);
    g.strokePath();
    
    // Intake vent
    g.fillStyle(0x0a3040, 1);
    g.fillRect(16, cy - 4, 6, 2);
    g.fillRect(16, cy + 2, 6, 2);
    
    // Small detail dots (rivets/bolts)
    g.fillStyle(0x50a0c0, 0.7);
    g.fillCircle(18, cy - 1, 0.8);
    g.fillCircle(18, cy + 1, 0.8);
    g.fillCircle(28, cy, 0.8);
    g.fillCircle(40, cy, 0.8);

    // ========================
    // SHIELD GENERATOR (center detail)
    // ========================
    g.fillStyle(0x3050a0, 1);
    g.fillCircle(26, cy, 3);
    g.fillStyle(0x5080ff, 0.7);
    g.fillCircle(26, cy, 2);
    g.fillStyle(0xaaccff, 0.9);
    g.fillCircle(26, cy, 1);
    
    // Shield glow
    g.fillStyle(0x5080ff, 0.15);
    g.fillCircle(26, cy, 5);

    // ========================
    // ACCENT STRIPE
    // ========================
    g.fillStyle(0xff6600, 1);
    g.beginPath();
    g.moveTo(14, cy - 6);
    g.lineTo(16, cy - 6);
    g.lineTo(54, cy - 4);
    g.lineTo(54, cy - 3);
    g.lineTo(16, cy - 5);
    g.lineTo(14, cy - 5);
    g.closePath();
    g.fillPath();

    // ========================
    // FINAL EDGE HIGHLIGHTS
    // ========================
    
    // Top edge rim light
    g.lineStyle(1, 0x80e0ff, 0.4);
    g.beginPath();
    g.moveTo(14, cy - 7);
    g.lineTo(50, cy - 5);
    g.lineTo(58, cy - 2);
    g.strokePath();
    
    // Nose edge
    g.lineStyle(1, 0xffffff, 0.3);
    g.beginPath();
    g.moveTo(58, cy - 2);
    g.lineTo(64, cy);
    g.strokePath();

    // ========================
    // GENERATE TEXTURE
    // ========================
    g.generateTexture('player', w, h);
    g.destroy();
}

