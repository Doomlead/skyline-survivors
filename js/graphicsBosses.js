// ------------------------
// Boss Graphics - All 9 Boss Sprites
// Detailed, Large, Multi-Component Designs
// ------------------------

function createBossGraphics(scene) {
    createMegaLanderGraphics(scene);
    createTitanMutantGraphics(scene);
    createHiveDroneGraphics(scene);
    createBehemothBomberGraphics(scene);
    createColossalPodGraphics(scene);
    createLeviathanBaiterGraphics(scene);
    createApexKamikazeGraphics(scene);
    createFortressTurretGraphics(scene);
    createOverlordShieldGraphics(scene);
}

function createMegaLanderGraphics(scene) {
    // ========================
    // MEGA LANDER - Giant UFO with 4 Tentacles
    // ========================
    const megaLanderGraphics = scene.add.graphics();
    
    // Main hull - large oval
    megaLanderGraphics.fillStyle(0xff4444, 1);
    megaLanderGraphics.fillEllipse(52, 32, 80, 50);
    
    // Upper dome - glowing
    megaLanderGraphics.fillStyle(0xff6666, 1);
    megaLanderGraphics.fillEllipse(52, 20, 60, 35);
    
    // Central eye - giant glowing orb
    megaLanderGraphics.fillStyle(0xffffff, 1);
    megaLanderGraphics.fillCircle(52, 28, 12);
    megaLanderGraphics.fillStyle(0xff0000, 1);
    megaLanderGraphics.fillCircle(52, 28, 8);
    megaLanderGraphics.fillStyle(0xffff00, 1);
    megaLanderGraphics.fillCircle(50, 26, 4);
    
    // 4 Tentacles - glowing appendages
    const tentacles = [
        { x: 32, y: 50, angle: -Math.PI / 4 },
        { x: 72, y: 50, angle: Math.PI / 4 },
        { x: 20, y: 35, angle: -Math.PI / 2 },
        { x: 84, y: 35, angle: Math.PI / 2 }
    ];
    
    tentacles.forEach(tentacle => {
        // Tentacle base
        megaLanderGraphics.lineStyle(6, 0xff3333, 1);
        megaLanderGraphics.beginPath();
        megaLanderGraphics.moveTo(tentacle.x, tentacle.y);
        megaLanderGraphics.lineTo(tentacle.x + Math.cos(tentacle.angle) * 25, tentacle.y + Math.sin(tentacle.angle) * 25);
        megaLanderGraphics.strokePath();
        
        // Glowing tip
        megaLanderGraphics.fillStyle(0xffaa00, 1);
        megaLanderGraphics.fillCircle(tentacle.x + Math.cos(tentacle.angle) * 25, tentacle.y + Math.sin(tentacle.angle) * 25, 5);
        
        // Glow aura
        megaLanderGraphics.fillStyle(0xffff00, 0.4);
        megaLanderGraphics.fillCircle(tentacle.x + Math.cos(tentacle.angle) * 25, tentacle.y + Math.sin(tentacle.angle) * 25, 8);
    });
    
    // Bottom ribbed texture
    megaLanderGraphics.fillStyle(0xdd2222, 1);
    for (let i = 0; i < 5; i++) {
        megaLanderGraphics.fillRect(30 + i * 12, 60, 4, 8);
    }
    
    // Plasma vents
    megaLanderGraphics.fillStyle(0xff8800, 0.7);
    megaLanderGraphics.fillCircle(42, 55, 4);
    megaLanderGraphics.fillCircle(62, 55, 4);
    
    megaLanderGraphics.generateTexture('megaLander', 104, 84);
    megaLanderGraphics.destroy();
}

function createTitanMutantGraphics(scene) {
    // ========================
    // TITAN MUTANT - Massive Humanoid Alien
    // ========================
    const titanGraphics = scene.add.graphics();
    
    // Elongated alien head
    titanGraphics.fillStyle(0xffaa66, 1);
    titanGraphics.fillEllipse(60, 25, 35, 40);
    
    // Cranium ridge
    titanGraphics.fillStyle(0xff9955, 1);
    titanGraphics.beginPath();
    titanGraphics.moveTo(45, 15);
    titanGraphics.lineTo(60, 5);
    titanGraphics.lineTo(75, 15);
    titanGraphics.lineTo(75, 20);
    titanGraphics.lineTo(60, 12);
    titanGraphics.lineTo(45, 20);
    titanGraphics.closePath();
    titanGraphics.fillPath();
    
    // Left eye - large glowing
    titanGraphics.fillStyle(0xffffff, 1);
    titanGraphics.fillEllipse(48, 22, 8, 11);
    titanGraphics.fillStyle(0xffff00, 1);
    titanGraphics.fillEllipse(48, 22, 5, 8);
    titanGraphics.fillStyle(0x000000, 1);
    titanGraphics.fillCircle(48, 23, 2.5);
    
    // Right eye - large glowing
    titanGraphics.fillStyle(0xffffff, 1);
    titanGraphics.fillEllipse(72, 22, 8, 11);
    titanGraphics.fillStyle(0xffff00, 1);
    titanGraphics.fillEllipse(72, 22, 5, 8);
    titanGraphics.fillStyle(0x000000, 1);
    titanGraphics.fillCircle(72, 23, 2.5);
    
    // Jagged mouth
    titanGraphics.fillStyle(0xcc5555, 1);
    titanGraphics.beginPath();
    titanGraphics.moveTo(50, 40);
    titanGraphics.lineTo(55, 45);
    titanGraphics.lineTo(60, 42);
    titanGraphics.lineTo(65, 46);
    titanGraphics.lineTo(70, 40);
    titanGraphics.closePath();
    titanGraphics.fillPath();
    
    // Massive muscular torso
    titanGraphics.fillStyle(0xff8844, 1);
    titanGraphics.fillEllipse(60, 70, 50, 60);
    
    // Chest muscle definition
    titanGraphics.fillStyle(0xff6622, 1);
    titanGraphics.fillEllipse(48, 65, 15, 25);
    titanGraphics.fillEllipse(72, 65, 15, 25);
    
    // 3 Arms - thick, menacing
    // Left arm
    titanGraphics.fillStyle(0xffaa66, 1);
    titanGraphics.beginPath();
    titanGraphics.moveTo(25, 55);
    titanGraphics.lineTo(15, 85);
    titanGraphics.lineTo(22, 88);
    titanGraphics.lineTo(32, 58);
    titanGraphics.closePath();
    titanGraphics.fillPath();
    
    // Left hand/weapon
    titanGraphics.fillStyle(0xff0000, 1);
    titanGraphics.fillCircle(15, 88, 7);
    titanGraphics.fillStyle(0xffff00, 0.8);
    titanGraphics.fillCircle(14, 86, 3);
    
    // Right arm
    titanGraphics.fillStyle(0xffaa66, 1);
    titanGraphics.beginPath();
    titanGraphics.moveTo(95, 55);
    titanGraphics.lineTo(105, 85);
    titanGraphics.lineTo(98, 88);
    titanGraphics.lineTo(88, 58);
    titanGraphics.closePath();
    titanGraphics.fillPath();
    
    // Right hand/weapon
    titanGraphics.fillStyle(0xff0000, 1);
    titanGraphics.fillCircle(105, 88, 7);
    titanGraphics.fillStyle(0xffff00, 0.8);
    titanGraphics.fillCircle(106, 86, 3);
    
    // Middle arm - upper
    titanGraphics.fillStyle(0xffaa66, 1);
    titanGraphics.beginPath();
    titanGraphics.moveTo(60, 50);
    titanGraphics.lineTo(70, 25);
    titanGraphics.lineTo(75, 28);
    titanGraphics.lineTo(65, 53);
    titanGraphics.closePath();
    titanGraphics.fillPath();
    
    // Middle hand/weapon
    titanGraphics.fillStyle(0xff0000, 1);
    titanGraphics.fillCircle(70, 25, 7);
    titanGraphics.fillStyle(0xffff00, 0.8);
    titanGraphics.fillCircle(72, 24, 3);
    
    // Legs
    titanGraphics.fillStyle(0xff7744, 1);
    titanGraphics.fillRect(45, 120, 12, 35);
    titanGraphics.fillRect(75, 120, 12, 35);
    
    // Tail spike - menacing
    titanGraphics.fillStyle(0xcc5522, 1);
    titanGraphics.beginPath();
    titanGraphics.moveTo(60, 130);
    titanGraphics.lineTo(75, 160);
    titanGraphics.lineTo(70, 135);
    titanGraphics.closePath();
    titanGraphics.fillPath();
    
    titanGraphics.generateTexture('titanMutant', 120, 160);
    titanGraphics.destroy();
}

function createHiveDroneGraphics(scene) {
    // ========================
    // HIVE DRONE - Hexagonal Weapon Platform
    // ========================
    const hiveGraphics = scene.add.graphics();
    
    // Main hexagonal body
    hiveGraphics.fillStyle(0xff44ff, 1);
    const hexSize = 35;
    const centerX = 60;
    const centerY = 45;
    hiveGraphics.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * hexSize;
        const y = centerY + Math.sin(angle) * hexSize;
        if (i === 0) hiveGraphics.moveTo(x, y);
        else hiveGraphics.lineTo(x, y);
    }
    hiveGraphics.closePath();
    hiveGraphics.fillPath();
    
    // Inner hex - darker
    hiveGraphics.fillStyle(0xdd22dd, 1);
    hiveGraphics.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * (hexSize - 10);
        const y = centerY + Math.sin(angle) * (hexSize - 10);
        if (i === 0) hiveGraphics.moveTo(x, y);
        else hiveGraphics.lineTo(x, y);
    }
    hiveGraphics.closePath();
    hiveGraphics.fillPath();
    
    // 6 Gun ports - positioned at hex vertices
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const portX = centerX + Math.cos(angle) * hexSize;
        const portY = centerY + Math.sin(angle) * hexSize;
        
        // Port barrel
        hiveGraphics.fillStyle(0x333333, 1);
        hiveGraphics.fillCircle(portX, portY, 6);
        
        // Glowing muzzle
        hiveGraphics.fillStyle(0xff00ff, 1);
        hiveGraphics.fillCircle(portX, portY, 3);
        
        // Energy aura
        hiveGraphics.fillStyle(0xff88ff, 0.5);
        hiveGraphics.fillCircle(portX, portY, 5);
    }
    
    // Central core
    hiveGraphics.fillStyle(0xff00ff, 1);
    hiveGraphics.fillCircle(centerX, centerY, 15);
    
    // Core glow
    hiveGraphics.fillStyle(0xffffff, 0.8);
    hiveGraphics.fillCircle(centerX - 4, centerY - 4, 5);
    
    // Core pulse ring
    hiveGraphics.lineStyle(2, 0xff00ff, 0.6);
    hiveGraphics.strokeCircle(centerX, centerY, 22);
    
    hiveGraphics.generateTexture('hiveDrone', 120, 90);
    hiveGraphics.destroy();
}

function createBehemothBomberGraphics(scene) {
    // ========================
    // BEHEMOTH BOMBER - Aerial Fortress
    // ========================
    const bomberGraphics = scene.add.graphics();
    
    // Main fuselage - massive
    bomberGraphics.fillStyle(0xff0000, 1);
    bomberGraphics.fillEllipse(60, 50, 100, 70);
    
    // Upper hull panel
    bomberGraphics.fillStyle(0xcc0000, 1);
    bomberGraphics.beginPath();
    bomberGraphics.moveTo(20, 40);
    bomberGraphics.lineTo(100, 30);
    bomberGraphics.lineTo(100, 45);
    bomberGraphics.lineTo(20, 50);
    bomberGraphics.closePath();
    bomberGraphics.fillPath();
    
    // Cockpit - command center
    bomberGraphics.fillStyle(0x00ffff, 0.7);
    bomberGraphics.fillEllipse(45, 35, 15, 12);
    bomberGraphics.fillStyle(0x003333, 1);
    bomberGraphics.lineStyle(2, 0x003333, 1);
    bomberGraphics.strokeEllipse(45, 35, 15, 12);
    
    // 3 Bomb bays - dark hatches
    bomberGraphics.fillStyle(0x220000, 1);
    for (let i = 0; i < 3; i++) {
        const bayX = 35 + i * 25;
        bomberGraphics.fillRect(bayX - 8, 50, 16, 20);
        
        // Bomb door lines
        bomberGraphics.lineStyle(1, 0x660000, 1);
        bomberGraphics.beginPath();
        bomberGraphics.moveTo(bayX - 8, 55);
        bomberGraphics.lineTo(bayX + 8, 55);
        bomberGraphics.strokePath();
        bomberGraphics.beginPath();
        bomberGraphics.moveTo(bayX - 8, 60);
        bomberGraphics.lineTo(bayX + 8, 60);
        bomberGraphics.strokePath();
        bomberGraphics.beginPath();
        bomberGraphics.moveTo(bayX - 8, 65);
        bomberGraphics.lineTo(bayX + 8, 65);
        bomberGraphics.strokePath();
    }
    
    // Twin engines - rear
    bomberGraphics.fillStyle(0x660000, 1);
    bomberGraphics.fillCircle(35, 85, 12);
    bomberGraphics.fillCircle(85, 85, 12);
    
    // Engine exhaust - glowing
    bomberGraphics.fillStyle(0xffff00, 1);
    bomberGraphics.fillCircle(35, 92, 5);
    bomberGraphics.fillCircle(85, 92, 5);
    
    // Wing guns - left and right
    bomberGraphics.fillStyle(0x333333, 1);
    bomberGraphics.fillRect(15, 45, 6, 15);
    bomberGraphics.fillRect(109, 45, 6, 15);
    
    // Gun muzzles
    bomberGraphics.fillStyle(0xff0000, 1);
    bomberGraphics.fillCircle(12, 52, 3);
    bomberGraphics.fillCircle(120, 52, 3);
    
    bomberGraphics.generateTexture('behemothBomber', 120, 100);
    bomberGraphics.destroy();
}

function createColossalPodGraphics(scene) {
    // ========================
    // COLOSSAL POD - Giant Organic Spawn Container
    // ========================
    const podGraphics = scene.add.graphics();
    
    // Main pod body - organic bulbous shape
    podGraphics.fillStyle(0xaa00ff, 1);
    podGraphics.fillEllipse(60, 55, 85, 95);
    
    // Pulsing membrane texture
    podGraphics.fillStyle(0x8800cc, 1);
    podGraphics.fillEllipse(60, 55, 70, 80);
    
    // 4 Spawn ports - glowing openings
    const ports = [
        { x: 30, y: 40 },
        { x: 90, y: 40 },
        { x: 35, y: 75 },
        { x: 85, y: 75 }
    ];
    
    ports.forEach(port => {
        // Port opening
        podGraphics.fillStyle(0xff00ff, 1);
        podGraphics.fillEllipse(port.x, port.y, 12, 15);
        
        // Inner glow
        podGraphics.fillStyle(0xff88ff, 0.8);
        podGraphics.fillEllipse(port.x, port.y, 8, 10);
        
        // Energy discharge
        podGraphics.fillStyle(0xffff00, 0.6);
        podGraphics.fillCircle(port.x, port.y + 8, 3);
    });
    
    // Central nucleus - visible through membrane
    podGraphics.fillStyle(0x00ff00, 0.6);
    podGraphics.fillCircle(50, 50, 8);
    podGraphics.fillCircle(70, 55, 8);
    podGraphics.fillCircle(60, 65, 8);
    
    // Outer pod ridges - biological detail
    podGraphics.lineStyle(2, 0x6600aa, 0.7);
    for (let i = 0; i < 4; i++) {
        podGraphics.beginPath();
        podGraphics.moveTo(30, 30 + i * 20);
        podGraphics.lineTo(90, 30 + i * 20);
        podGraphics.strokePath();
    }
    
    podGraphics.generateTexture('colossalPod', 120, 110);
    podGraphics.destroy();
}

function createLeviathanBaiterGraphics(scene) {
    // ========================
    // LEVIATHAN BAITER - Serpentine Sea Monster
    // ========================
    const leviathanGraphics = scene.add.graphics();
    
    // Main body - long and sinuous
    leviathanGraphics.fillStyle(0x00ffff, 1);
    leviathanGraphics.fillEllipse(60, 55, 160, 90);
    
    // Underbelly - lighter
    leviathanGraphics.fillStyle(0x00ffaa, 1);
    leviathanGraphics.fillEllipse(60, 60, 140, 70);
    
    // Head - triangular predator shape
    leviathanGraphics.fillStyle(0x00ffff, 1);
    leviathanGraphics.beginPath();
    leviathanGraphics.moveTo(120, 45);
    leviathanGraphics.lineTo(140, 50);
    leviathanGraphics.lineTo(120, 65);
    leviathanGraphics.closePath();
    leviathanGraphics.fillPath();
    
    // Eye - menacing glow
    leviathanGraphics.fillStyle(0xffffff, 1);
    leviathanGraphics.fillCircle(128, 52, 5);
    leviathanGraphics.fillStyle(0xff0000, 1);
    leviathanGraphics.fillCircle(130, 52, 3);
    
    // Dorsal spines - ridge along back
    for (let i = 0; i < 5; i++) {
        const spineX = 30 + i * 18;
        leviathanGraphics.fillStyle(0x00aaff, 1);
        leviathanGraphics.beginPath();
        leviathanGraphics.moveTo(spineX, 25);
        leviathanGraphics.lineTo(spineX - 5, 40);
        leviathanGraphics.lineTo(spineX + 5, 40);
        leviathanGraphics.closePath();
        leviathanGraphics.fillPath();
    }
    
    // 5 Thruster vents - propulsion
    const thrusters = [
        { x: 20, y: 45 },
        { x: 20, y: 65 },
        { x: 40, y: 30 },
        { x: 40, y: 80 },
        { x: 10, y: 55 }
    ];
    
    thrusters.forEach(thruster => {
        // Vent opening
        leviathanGraphics.fillStyle(0xff0000, 1);
        leviathanGraphics.fillEllipse(thruster.x, thruster.y, 6, 8);
        
        // Exhaust glow
        leviathanGraphics.fillStyle(0xffff00, 0.7);
        leviathanGraphics.fillEllipse(thruster.x - 3, thruster.y, 4, 5);
    });
    
    // Tail - curves away
    leviathanGraphics.lineStyle(4, 0x00ffff, 1);
    leviathanGraphics.beginPath();
    leviathanGraphics.moveTo(10, 55);
    leviathanGraphics.lineTo(-10, 40);
    leviathanGraphics.lineTo(-5, 20);
    leviathanGraphics.strokePath();
    
    leviathanGraphics.generateTexture('leviathanBaiter', 140, 100);
    leviathanGraphics.destroy();
}

function createApexKamikazeGraphics(scene) {
    // ========================
    // APEX KAMIKAZE - Angry Suicide Missile
    // ========================
    const kamikazeGraphics = scene.add.graphics();
    
    // Main missile body - aggressive pointed
    kamikazeGraphics.fillStyle(0xff0000, 1);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(80, 35);  // Pointed nose
    kamikazeGraphics.lineTo(30, 20);
    kamikazeGraphics.lineTo(28, 50);
    kamikazeGraphics.lineTo(80, 65);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();
    
    // Upper hull - darker
    kamikazeGraphics.fillStyle(0xcc0000, 1);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(80, 35);
    kamikazeGraphics.lineTo(30, 20);
    kamikazeGraphics.lineTo(35, 37);
    kamikazeGraphics.lineTo(75, 45);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();
    
    // Angry eye
    kamikazeGraphics.fillStyle(0xffffff, 1);
    kamikazeGraphics.fillCircle(50, 38, 5);
    kamikazeGraphics.fillStyle(0x000000, 1);
    kamikazeGraphics.fillCircle(52, 37, 3);
    kamikazeGraphics.fillStyle(0xff0000, 1);
    kamikazeGraphics.fillCircle(51, 38, 1.5);
    
    // 4 Explosive appendages - spiky
    const appendages = [
        { x: 25, y: 15, angle: -Math.PI / 6 },
        { x: 25, y: 55, angle: Math.PI / 6 },
        { x: 35, y: 25, angle: -Math.PI / 3 },
        { x: 35, y: 45, angle: Math.PI / 3 }
    ];
    
    appendages.forEach(app => {
        // Appendage stem
        kamikazeGraphics.lineStyle(4, 0xff3333, 1);
        kamikazeGraphics.beginPath();
        kamikazeGraphics.moveTo(app.x, app.y);
        kamikazeGraphics.lineTo(app.x + Math.cos(app.angle) * 18, app.y + Math.sin(app.angle) * 18);
        kamikazeGraphics.strokePath();
        
        // Explosive head
        kamikazeGraphics.fillStyle(0xffff00, 1);
        kamikazeGraphics.fillCircle(app.x + Math.cos(app.angle) * 18, app.y + Math.sin(app.angle) * 18, 5);
        
        // Spark effect
        kamikazeGraphics.fillStyle(0xffff00, 0.6);
        kamikazeGraphics.fillCircle(app.x + Math.cos(app.angle) * 18, app.y + Math.sin(app.angle) * 18, 8);
    });
    
    // Rear engines - flame vents
    kamikazeGraphics.fillStyle(0xff4400, 1);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(28, 48);
    kamikazeGraphics.lineTo(10, 45);
    kamikazeGraphics.lineTo(15, 55);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();
    
    // Flame
    kamikazeGraphics.fillStyle(0xffff00, 1);
    kamikazeGraphics.beginPath();
    kamikazeGraphics.moveTo(10, 45);
    kamikazeGraphics.lineTo(0, 40);
    kamikazeGraphics.lineTo(5, 50);
    kamikazeGraphics.closePath();
    kamikazeGraphics.fillPath();
    
    kamikazeGraphics.generateTexture('apexKamikaze', 80, 70);
    kamikazeGraphics.destroy();
}

function createFortressTurretGraphics(scene) {
    // ========================
    // FORTRESS TURRET - Immovable Gun Platform
    // ========================
    const turretGraphics = scene.add.graphics();
    
    // Base platform - wide and sturdy
    turretGraphics.fillStyle(0x444444, 1);
    turretGraphics.fillRect(20, 75, 80, 20);
    
    // Platform edge definition
    turretGraphics.fillStyle(0x555555, 1);
    turretGraphics.fillRect(20, 75, 80, 5);
    
    // Main turret body - cylindrical
    turretGraphics.fillStyle(0x666666, 1);
    turretGraphics.fillEllipse(60, 55, 50, 45);
    
    // Center armored hub
    turretGraphics.fillStyle(0x555555, 1);
    turretGraphics.fillCircle(60, 55, 20);
    
    // 8 Gun barrels - arranged in circle + diagonals
    const barrels = [
        { x: 60, y: 20 },      // Top
        { x: 85, y: 30 },      // Top-Right
        { x: 95, y: 55 },      // Right
        { x: 85, y: 80 },      // Bottom-Right
        { x: 60, y: 90 },      // Bottom
        { x: 35, y: 80 },      // Bottom-Left
        { x: 25, y: 55 },      // Left
        { x: 35, y: 30 }       // Top-Left
    ];
    
    barrels.forEach(barrel => {
        // Barrel shaft
        turretGraphics.fillStyle(0x333333, 1);
        turretGraphics.fillRect(barrel.x - 3, barrel.y - 12, 6, 24);
        
        // Barrel tip - glowing
        turretGraphics.fillStyle(0xff0000, 1);
        turretGraphics.fillCircle(barrel.x, barrel.y - 13, 4);
        
        // Muzzle flare
        turretGraphics.fillStyle(0xffff00, 0.6);
        turretGraphics.fillCircle(barrel.x, barrel.y - 13, 6);
    });
    
    // Central targeting system
    turretGraphics.fillStyle(0xff0000, 1);
    turretGraphics.fillCircle(60, 55, 10);
    turretGraphics.fillStyle(0xff8888, 0.8);
    turretGraphics.fillCircle(58, 53, 4);
    
    // Armor plating lines - horizontal
    turretGraphics.lineStyle(1, 0x444444, 0.8);
    turretGraphics.beginPath();
    turretGraphics.moveTo(40, 55);
    turretGraphics.lineTo(80, 55);
    turretGraphics.strokePath();
    
    // Armor plating lines - vertical
    turretGraphics.beginPath();
    turretGraphics.moveTo(60, 35);
    turretGraphics.lineTo(60, 75);
    turretGraphics.strokePath();
    
    // Extra ring detail around hub
    turretGraphics.lineStyle(2, 0x222222, 0.9);
    turretGraphics.strokeCircle(60, 55, 24);
    
    // Small bolts around the edge of the platform
    turretGraphics.fillStyle(0x222222, 1);
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const boltX = 60 + Math.cos(angle) * 38;
        const boltY = 85 + Math.sin(angle) * 4; // slight vertical offset
        turretGraphics.fillCircle(boltX, boltY, 2);
    }
    
    turretGraphics.generateTexture('fortressTurret', 120, 100);
    turretGraphics.destroy();
}

function createOverlordShieldGraphics(scene) {
    // ========================
    // OVERLORD SHIELD - Energy Barrier Master
    // ========================
    const shieldGraphics = scene.add.graphics();
    
    // Outer shield ring - massive energy barrier
    const centerX = 64;
    const centerY = 64;
    
    shieldGraphics.lineStyle(6, 0x00ffff, 0.9);
    shieldGraphics.strokeCircle(centerX, centerY, 52);
    
    // Inner shield ring - secondary barrier
    shieldGraphics.lineStyle(4, 0x0066ff, 0.8);
    shieldGraphics.strokeCircle(centerX, centerY, 40);
    
    // Shield fill - faint energy glow
    shieldGraphics.fillStyle(0x001133, 0.6);
    shieldGraphics.fillCircle(centerX, centerY, 38);
    
    // Core generator - central power source
    shieldGraphics.fillStyle(0x222244, 1);
    shieldGraphics.fillCircle(centerX, centerY, 20);
    
    // Core highlight
    shieldGraphics.fillStyle(0x00ffff, 1);
    shieldGraphics.fillCircle(centerX - 4, centerY - 4, 6);
    
    // Core pulse ring
    shieldGraphics.lineStyle(2, 0x00ffcc, 0.8);
    shieldGraphics.strokeCircle(centerX, centerY, 26);
    
    // 6 Energy nodes - emitters around the shield
    const nodeCount = 6;
    const nodeRadius = 44;
    for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2 - Math.PI / 2; // start at top
        const nodeX = centerX + Math.cos(angle) * nodeRadius;
        const nodeY = centerY + Math.sin(angle) * nodeRadius;
        
        // Node base
        shieldGraphics.fillStyle(0x222222, 1);
        shieldGraphics.fillCircle(nodeX, nodeY, 6);
        
        // Node core
        shieldGraphics.fillStyle(0x00ffcc, 1);
        shieldGraphics.fillCircle(nodeX, nodeY, 4);
        
        // Beam indicator - short radial line toward outside
        const beamX = centerX + Math.cos(angle) * (nodeRadius + 10);
        const beamY = centerY + Math.sin(angle) * (nodeRadius + 10);
        
        shieldGraphics.lineStyle(3, 0x88ffff, 0.9);
        shieldGraphics.beginPath();
        shieldGraphics.moveTo(nodeX, nodeY);
        shieldGraphics.lineTo(beamX, beamY);
        shieldGraphics.strokePath();
        
        // Beam tip glow
        shieldGraphics.fillStyle(0xffffff, 0.9);
        shieldGraphics.fillCircle(beamX, beamY, 3);
    }
    
    // Rotating arc segments - give sense of motion
    shieldGraphics.lineStyle(3, 0x00ccff, 0.7);
    for (let i = 0; i < 3; i++) {
        const startAngle = (i * Math.PI * 2) / 3 + Math.PI / 8;
        const endAngle = startAngle + Math.PI / 6;
        
        shieldGraphics.beginPath();
        shieldGraphics.arc(centerX, centerY, 48, startAngle, endAngle);
        shieldGraphics.strokePath();
    }
    
    // Subtle radial spokes inside
    shieldGraphics.lineStyle(1, 0x004466, 0.6);
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        shieldGraphics.beginPath();
        shieldGraphics.moveTo(centerX, centerY);
        shieldGraphics.lineTo(
            centerX + Math.cos(angle) * 32,
            centerY + Math.sin(angle) * 32
        );
        shieldGraphics.strokePath();
    }
    
    shieldGraphics.generateTexture('overlordShield', 128, 128);
    shieldGraphics.destroy();
}
