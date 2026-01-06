// ------------------------
// Player Graphics - Veritech
// ------------------------

function createPlayerGraphics(scene) {
    // Shared Color Palette (Ensures consistency between modes)
    const PALETTE = {
        hull: 0xcccccc,        // Main body (Light Grey/White)
        hullDark: 0x999999,    // Shaded hull
        accent: 0x3366cc,      // Stripe color (Blue - similar to previous file)
        glass: 0x44aaff,       // Cockpit glass
        glassHi: 0xccffff,     // Glass reflection
        metal: 0x4a4a5a,       // Engine/Gun/Joints
        metalDark: 0x2a2a35,   // Darker metal
        thruster: 0xffaa00,    // Engine glow
        black: 0x111111        // Panel lines/Deep shadow
    };

    // Helper to draw a "pixel" rectangle
    // This mocks pixel art by drawing sharp blocks
    const drawPixel = (g, x, y, w, h, color, alpha = 1) => {
        g.fillStyle(color, alpha);
        g.fillRect(x, y, w, h);
    };

    // ==========================================
    // 1. JET FIGHTER MODE (Fighter)
    // ==========================================
    const g = scene.add.graphics();
    const w = 80, h = 40; // Slightly larger canvas for detail
    
    // -- Drop Shadow --
    drawPixel(g, 20, 28, 50, 6, 0x000000, 0.4);

    // -- Engine Afterburners (Rear) --
    // Top Engine Flame
    drawPixel(g, 0, 12, 10, 4, 0xff5500, 0.8);
    drawPixel(g, 2, 13, 6, 2, 0xffff00, 1);
    // Bottom Engine Flame
    drawPixel(g, 0, 22, 10, 4, 0xff5500, 0.8);
    drawPixel(g, 2, 23, 6, 2, 0xffff00, 1);

    // -- Rear Legs/Thrusters (Folded back) --
    // Top Leg
    drawPixel(g, 10, 8, 30, 10, PALETTE.hull);
    drawPixel(g, 10, 11, 28, 4, PALETTE.accent); // Stripe
    drawPixel(g, 38, 8, 4, 10, PALETTE.metal);   // Nozzle ring
    
    // Bottom Leg
    drawPixel(g, 10, 20, 30, 10, PALETTE.hull);
    drawPixel(g, 10, 23, 28, 4, PALETTE.accent); // Stripe
    drawPixel(g, 38, 20, 4, 10, PALETTE.metal);   // Nozzle ring

    // -- Wings (Variable Sweep) --
    // Far Wing (Left/Top) - darker because it's behind
    drawPixel(g, 20, 2, 25, 8, PALETTE.hullDark); 
    drawPixel(g, 42, 2, 2, 8, PALETTE.accent);    // Wing tip
    
    // Near Wing (Right/Bottom)
    drawPixel(g, 15, 24, 30, 2, PALETTE.hull);    // Wing edge
    drawPixel(g, 18, 26, 25, 6, PALETTE.hull);    // Main wing
    drawPixel(g, 40, 26, 3, 6, PALETTE.accent);   // Wing tip
    drawPixel(g, 42, 24, 2, 2, 0x00ff00);         // Nav light

    // -- Vertical Stabilizers (Tail Fins) --
    // We only see the side of one clearly
    drawPixel(g, 12, 4, 14, 8, PALETTE.hull);
    drawPixel(g, 14, 5, 10, 4, PALETTE.accent);   // Stripe
    drawPixel(g, 16, 6, 4, 2, PALETTE.black);     // Insignia placeholder

    // -- Main Fuselage & Nose --
    drawPixel(g, 35, 14, 25, 10, PALETTE.hull);   // Body Center
    drawPixel(g, 55, 15, 15, 8, PALETTE.hull);    // Nose Cone base
    drawPixel(g, 70, 16, 6, 6, PALETTE.metal);    // Nose tip radar
    drawPixel(g, 76, 17, 2, 4, 0xffffff);         // Tip highlight

    // -- Intake Vents (Shoulders) --
    drawPixel(g, 40, 12, 10, 4, PALETTE.black);   // Top Intake
    drawPixel(g, 40, 22, 10, 4, PALETTE.black);   // Bottom Intake
    
    // -- Cockpit (Canopy) --
    drawPixel(g, 48, 12, 14, 6, PALETTE.glass);
    drawPixel(g, 52, 13, 8, 2, PALETTE.glassHi);  // Glare
    
    // -- Gun Pod (GU-11) --
    // Slung underneath the fuselage
    drawPixel(g, 35, 25, 20, 4, PALETTE.metalDark);
    drawPixel(g, 55, 26, 6, 2, PALETTE.metal);    // Barrel

    // -- Panel Lines / Details --
    drawPixel(g, 45, 14, 1, 10, PALETTE.black, 0.3); // Neck seam
    drawPixel(g, 60, 15, 1, 8, PALETTE.black, 0.3);  // Radome seam

    g.generateTexture('veritech_fighter', w, h);
    g.destroy();


    // ==========================================
    // 2. GUARDIAN MODE (Gerwalk)
    // ==========================================
    // Half-Jet, Half-Robot. Distinctive "Chicken Walker" legs.
    const gg = scene.add.graphics();
    const gw = 72, gh = 64; 
    
    // -- Drop Shadow --
    drawPixel(gg, 20, 50, 40, 8, 0x000000, 0.4);

    // -- The Legs (Distinctive feature) --
    // Far Leg (Background)
    drawPixel(gg, 20, 30, 8, 14, PALETTE.metalDark); // Thigh
    drawPixel(gg, 12, 40, 12, 6, PALETTE.hullDark);  // Shin
    drawPixel(gg, 8, 46, 14, 4, PALETTE.metalDark);  // Foot

    // -- The Arms/Gun Pod --
    // Gun Pod (Held in hand)
    drawPixel(gg, 45, 38, 24, 6, PALETTE.metalDark); // Main Gun Body
    drawPixel(gg, 69, 40, 3, 2, 0xffaa00);           // Muzzle heat
    
    // Right Arm (Holding gun)
    drawPixel(gg, 38, 28, 8, 12, PALETTE.hull);      // Shoulder
    drawPixel(gg, 40, 34, 6, 8, PALETTE.metal);      // Forearm

    // -- Main Body (Nose dipped down) --
    // Fuselage
    drawPixel(gg, 25, 15, 25, 12, PALETTE.hull);
    
    // Nose Cone (Angled slightly down)
    drawPixel(gg, 45, 18, 18, 10, PALETTE.hull);
    drawPixel(gg, 63, 20, 4, 6, PALETTE.metal);      // Tip
    
    // Cockpit
    drawPixel(gg, 40, 14, 12, 5, PALETTE.glass);
    drawPixel(gg, 42, 15, 6, 2, PALETTE.glassHi);
    
    // -- Backpack / Fins --
    drawPixel(gg, 15, 5, 10, 15, PALETTE.hull);      // Pack body
    drawPixel(gg, 12, 2, 4, 12, PALETTE.accent);     // Fin stripe
    drawPixel(gg, 10, 0, 2, 14, PALETTE.metal);      // Antenna

    // -- Near Leg (Foreground) --
    // Thigh (angled forward)
    drawPixel(gg, 28, 30, 12, 8, PALETTE.hull);      
    drawPixel(gg, 30, 32, 8, 4, PALETTE.accent);     // Stripe on leg
    
    // Knee Joint
    drawPixel(gg, 24, 34, 8, 8, PALETTE.metal);
    
    // Shin (angled back)
    drawPixel(gg, 16, 38, 14, 10, PALETTE.hull);
    drawPixel(gg, 18, 40, 10, 2, PALETTE.black, 0.5); // Vent
    
    // Foot (Thruster mode)
    drawPixel(gg, 10, 48, 18, 6, PALETTE.metal);     // Foot base
    drawPixel(gg, 8, 54, 22, 2, PALETTE.metalDark);  // Sole
    
    // Foot Thruster Flame (Hovering)
    drawPixel(gg, 14, 56, 10, 4, PALETTE.thruster, 0.6);

    // -- Wings (Swept back fully in Guardian mode) --
    drawPixel(gg, 20, 12, 15, 4, PALETTE.hullDark); // Wing root visible

    gg.generateTexture('veritech_guardian', gw, gh);
    gg.destroy();


    // ==========================================
    // 3. PILOT (Detailed)
    // ==========================================
    const gp = scene.add.graphics();
    const pw = 24, ph = 24;
    const cx = 12;

    // Flight Suit (White/Orange straps - Rick Hunter style)
    drawPixel(gp, cx-4, 10, 8, 10, 0xffffff); // Torso
    drawPixel(gp, cx-4, 12, 8, 2, 0xff6600);  // Chest strap
    drawPixel(gp, cx-1, 12, 2, 4, 0xaaaaaa);  // Buckle

    // Helmet
    drawPixel(gp, cx-5, 2, 10, 9, 0xffffff);  // Helmet White
    drawPixel(gp, cx-4, 4, 8, 4, 0x111111);   // Visor Black
    drawPixel(gp, cx-2, 4, 2, 2, 0x00ffff);   // HUD reflection
    drawPixel(gp, cx-6, 5, 2, 4, 0xcc0000);   // Ear piece red
    drawPixel(gp, cx+4, 5, 2, 4, 0xcc0000);   // Ear piece red
    
    // Arms/Legs
    drawPixel(gp, cx-6, 11, 2, 6, 0xffffff);  // L Arm
    drawPixel(gp, cx+4, 11, 2, 6, 0xffffff);  // R Arm
    drawPixel(gp, cx-4, 20, 3, 4, 0xcccccc);  // L Leg
    drawPixel(gp, cx+1, 20, 3, 4, 0xcccccc);  // R Leg

    gp.generateTexture('pilot', pw, ph);
    gp.destroy();
}