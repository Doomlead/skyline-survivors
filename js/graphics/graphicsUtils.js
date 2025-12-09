function createHumanGraphics(scene) {
    // ========================
    // HUMAN (8x12 Pixel Art Style)
    // ========================
    const humanGraphics = scene.add.graphics();

    // 1. Jumpsuit Body (Orange/Flight suit)
    humanGraphics.fillStyle(0xeebb55, 1);
    humanGraphics.fillRect(2, 4, 4, 5); 

    // 2. Legs (Darker fabric)
    humanGraphics.fillStyle(0xcc8800, 1);
    humanGraphics.fillRect(2, 9, 2, 3);
    humanGraphics.fillRect(5, 9, 2, 3);

    // 3. Oxygen Tank / Backpack (Grey)
    humanGraphics.fillStyle(0x888899, 1);
    humanGraphics.fillRect(0, 4, 2, 4); // Left visible pack
    humanGraphics.fillRect(6, 4, 2, 4); // Right visible pack

    // 4. Head (Helmet)
    humanGraphics.fillStyle(0xffffff, 1);
    humanGraphics.fillCircle(4, 2.5, 2.5); // Helmet bubble

    // 5. Visor (Gold/Reflective)
    humanGraphics.fillStyle(0xffcc00, 1);
    humanGraphics.fillRect(3, 2, 3, 1.5);

    // 6. Boots (Black)
    humanGraphics.fillStyle(0x222222, 1);
    humanGraphics.fillRect(2, 11, 2, 1);
    humanGraphics.fillRect(5, 11, 2, 1);

    humanGraphics.generateTexture('human', 8, 12);
    humanGraphics.destroy();
}

function createPowerUpGraphics(scene) {
    const powerUpColors = {
        laser:      0x16537e,
        drone:      0xf5578e,
        shield:     0x4a7000,
        missile:    0x716246,
        overdrive:  0x101010,
        rear:       0xa5655f,
        side:       0xa311ff,
        rapid:      0x11ffa3,
        multi:      0xff116d,
        piercing:   0x116dff,
        speed:      0xffa311,
        magnet:     0x2f0d00,
        bomb:       0xFFD700,
        double:     0xA8FF00,
        invincibility: 0xD4D4D4,
        timeSlow:   0x007F6E
    };

    // Size 24x24 for detail
    const boxSize = 24;
    const center = boxSize / 2;

    for (let type in powerUpColors) {
        const g = scene.add.graphics();
        const color = powerUpColors[type];

        // 1. Outer Casing (Dark Grey Tech Box)
        g.fillStyle(0x333333, 1);
        g.fillCircle(center, center, 11);
        
        // 2. Metal Rim (Lighter Grey)
        g.lineStyle(2, 0x888899, 1);
        g.strokeCircle(center, center, 10);

        // 3. Inner Energy Pool (The PowerUp Color)
        g.fillStyle(color, 1);
        g.fillCircle(center, center, 8);
        
        // 4. Inner Glow (Lighter version of color)
        g.fillStyle(0xffffff, 0.3);
        g.fillCircle(center, center, 5);

        // 5. Identification Symbol (Generic Core Shape)
        g.fillStyle(0xffffff, 1);
        g.fillRect(center - 2, center - 4, 4, 8); // Vertical bar
        g.fillRect(center - 4, center - 2, 8, 4); // Horizontal bar

        // 6. Glass Dome Reflection (Glossy look)
        g.fillStyle(0xffffff, 0.5);
        g.fillEllipse(center - 3, center - 3, 4, 2.5);

        g.generateTexture('powerup_' + type, boxSize, boxSize);
        g.destroy();
    }
}

function createUtilityGraphics(scene) {
    // ========================
    // FORCE DRONE (Helper Bot)
    // ========================
    const forceDroneGraphics = scene.add.graphics();
    const dw = 16, dh = 16;
    
    // Engine exhaust (Pulse)
    forceDroneGraphics.fillStyle(0x00ffff, 0.4);
    forceDroneGraphics.fillCircle(8, 8, 8);
    
    // Metal Shell
    forceDroneGraphics.fillStyle(0x444455, 1);
    forceDroneGraphics.fillCircle(8, 8, 6);
    
    // Center Eye/Core
    forceDroneGraphics.fillStyle(0x0088ff, 1);
    forceDroneGraphics.fillCircle(8, 8, 3);
    
    // Eye Highlight
    forceDroneGraphics.fillStyle(0xffffff, 1);
    forceDroneGraphics.fillCircle(7, 7, 1.5);
    
    // Tech Lines
    forceDroneGraphics.lineStyle(1, 0x88ccff, 0.8);
    forceDroneGraphics.strokeCircle(8, 8, 6);
    
    forceDroneGraphics.generateTexture('forceDrone', dw, dh);
    forceDroneGraphics.destroy();

    // ========================
    // EXPLOSION (Particle Texture)
    // ========================
    const explosionGraphics = scene.add.graphics();
    
    // Hot Core
    explosionGraphics.fillStyle(0xffffff, 1);
    explosionGraphics.fillCircle(6, 6, 3);
    
    // Outer Fire
    explosionGraphics.fillStyle(0xffaa00, 0.8);
    explosionGraphics.fillCircle(6, 6, 6);
    
    // Soft Glow
    explosionGraphics.fillStyle(0xff4400, 0.3);
    explosionGraphics.fillCircle(6, 6, 8);
    
    explosionGraphics.generateTexture('explosion', 12, 12);
    explosionGraphics.destroy();

    // ========================
    // SHIELD EFFECT (Protective Bubble)
    // ========================
    // Ship is 64x32. We need a large ellipse to cover it.
    // Width: 140, Height: 80 ensures coverage including exhaust and guns.
    const sW = 140;
    const sH = 80;
    const cx = sW / 2;
    const cy = sH / 2;
    
    const shieldEffectGraphics = scene.add.graphics();
    
    // 1. Faint fill (The bubble volume)
    shieldEffectGraphics.fillStyle(0x00ffff, 0.05);
    shieldEffectGraphics.fillEllipse(cx, cy, 68, 38); // Radius X, Radius Y
    
    // 2. Hexagonal Honeycomb Lattice (Tech Detail)
    shieldEffectGraphics.lineStyle(1, 0x00ffff, 0.15);
    const hexSize = 10;
    // Draw grid
    for(let y = 0; y < sH; y += hexSize) {
        for(let x = 0; x < sW; x += hexSize * 1.5) {
            // Check if point is roughly inside the ellipse to avoid drawing square corners
            let dx = x - cx;
            let dy = y - cy;
            // Ellipse equation check
            if ((dx*dx)/(65*65) + (dy*dy)/(35*35) <= 1) {
                 // Draw a small hex symbol or cross
                 shieldEffectGraphics.beginPath();
                 shieldEffectGraphics.moveTo(x - 2, y);
                 shieldEffectGraphics.lineTo(x + 2, y);
                 shieldEffectGraphics.moveTo(x, y - 2);
                 shieldEffectGraphics.lineTo(x, y + 2);
                 shieldEffectGraphics.strokePath();
            }
        }
    }

    // 3. Energy Scanlines (Horizontal)
    shieldEffectGraphics.lineStyle(1, 0x00ffff, 0.1);
    for(let i = 10; i < sH - 10; i += 4) {
         shieldEffectGraphics.lineBetween(10, i, sW - 10, i);
    }
    
    // 4. Outer Rim (Bright Energy)
    shieldEffectGraphics.lineStyle(2, 0x00ffff, 0.8);
    shieldEffectGraphics.strokeEllipse(cx, cy, 68, 38);
    
    // 5. Inner Rim (Softer Glow)
    shieldEffectGraphics.lineStyle(2, 0x0088ff, 0.4);
    shieldEffectGraphics.strokeEllipse(cx, cy, 64, 34);

    // 6. Impact Nodes (Tech bits on the rim)
    shieldEffectGraphics.fillStyle(0xffffff, 0.8);
    shieldEffectGraphics.fillCircle(cx - 68, cy, 2); // Left
    shieldEffectGraphics.fillCircle(cx + 68, cy, 2); // Right
    shieldEffectGraphics.fillCircle(cx, cy - 38, 2); // Top
    shieldEffectGraphics.fillCircle(cx, cy + 38, 2); // Bottom

    shieldEffectGraphics.generateTexture('shieldEffect', sW, sH);
    shieldEffectGraphics.destroy();

    // ========================
    // PARTICLES & STARS
    // ========================
    const particleGraphics = scene.add.graphics();
    // Soft particle (better for smoke/trails)
    particleGraphics.fillStyle(0xffffff, 0.2);
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.fillStyle(0xffffff, 1);
    particleGraphics.fillCircle(4, 4, 2);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();

    const starGraphics = scene.add.graphics();
    // Star with cross glare
    starGraphics.fillStyle(0xffffff, 1);
    starGraphics.fillCircle(3, 3, 1.5);
    starGraphics.fillStyle(0xffffff, 0.5);
    starGraphics.fillRect(0, 2.5, 6, 1); // Horizontal glare
    starGraphics.fillRect(2.5, 0, 1, 6); // Vertical glare
    starGraphics.generateTexture('star', 6, 6);
    starGraphics.destroy();
}

// Wrapper function to call everything
function createGraphics(scene) {
    createPlayerGraphics(scene);
    createPlayerProjectileGraphics(scene);

    createEnemyProjectileGraphics(scene);
    createOriginalEnemyGraphics(scene);
    createNewEnemyGraphics(scene);

    // Boss sprites for boss waves
    createBossGraphics(scene);
    
    createHumanGraphics(scene);
    createPowerUpGraphics(scene);
    createUtilityGraphics(scene);
}