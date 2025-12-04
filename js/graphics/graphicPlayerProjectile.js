// ------------------------
// Player Projectile Graphics - All Player Projectile Textures
// ------------------------

function createPlayerProjectileGraphics(scene) {
    
    // ========================
    // STANDARD PROJECTILE (Plasma Bolt)
    // ========================
    const projectileGraphics = scene.add.graphics();
    const pw = 24, ph = 12;
    const pcy = ph / 2;
    
    // Outer energy field
    projectileGraphics.fillStyle(0xff6600, 0.15);
    projectileGraphics.fillEllipse(12, pcy, 24, 12);
    
    // Secondary glow
    projectileGraphics.fillStyle(0xff8800, 0.3);
    projectileGraphics.fillEllipse(14, pcy, 20, 9);
    
    // Plasma trail
    projectileGraphics.fillStyle(0xffaa00, 0.5);
    projectileGraphics.beginPath();
    projectileGraphics.moveTo(0, pcy);
    projectileGraphics.lineTo(8, pcy - 4);
    projectileGraphics.lineTo(18, pcy - 2);
    projectileGraphics.lineTo(20, pcy);
    projectileGraphics.lineTo(18, pcy + 2);
    projectileGraphics.lineTo(8, pcy + 4);
    projectileGraphics.closePath();
    projectileGraphics.fillPath();
    
    // Main energy body
    projectileGraphics.fillStyle(0xffcc00, 1);
    projectileGraphics.fillEllipse(14, pcy, 14, 5);
    
    // Inner plasma core
    projectileGraphics.fillStyle(0xffee66, 1);
    projectileGraphics.fillEllipse(16, pcy, 10, 3);
    
    // Hot center
    projectileGraphics.fillStyle(0xffffff, 1);
    projectileGraphics.fillEllipse(18, pcy, 6, 2);
    
    // Leading edge highlight
    projectileGraphics.fillStyle(0xffffff, 0.9);
    projectileGraphics.fillCircle(22, pcy, 2);
    
    // Energy wisps (trailing)
    projectileGraphics.fillStyle(0xffaa00, 0.6);
    projectileGraphics.fillEllipse(4, pcy - 2, 6, 2);
    projectileGraphics.fillEllipse(2, pcy + 1, 4, 1.5);
    projectileGraphics.fillStyle(0xff8800, 0.4);
    projectileGraphics.fillCircle(1, pcy, 2);
    
    // Spark details
    projectileGraphics.fillStyle(0xffffff, 0.8);
    projectileGraphics.fillCircle(10, pcy - 2, 1);
    projectileGraphics.fillCircle(12, pcy + 1.5, 0.8);
    
    // Edge glow line
    projectileGraphics.lineStyle(1, 0xffff88, 0.5);
    projectileGraphics.beginPath();
    projectileGraphics.moveTo(8, pcy - 3);
    projectileGraphics.lineTo(20, pcy - 1);
    projectileGraphics.strokePath();
    
    projectileGraphics.generateTexture('projectile', pw, ph);
    projectileGraphics.destroy();

    // ========================
    // SPREAD PROJECTILE (Crystal Shard)
    // ========================
    const spreadGraphics = scene.add.graphics();
    const sw = 20, sh = 12;
    const scy = sh / 2;
    
    // Outer energy field
    spreadGraphics.fillStyle(0x00ffff, 0.15);
    spreadGraphics.fillEllipse(10, scy, 20, 12);
    
    // Secondary glow
    spreadGraphics.fillStyle(0x00ddff, 0.25);
    spreadGraphics.fillEllipse(11, scy, 16, 9);
    
    // Crystal body (main diamond)
    spreadGraphics.fillStyle(0x00aacc, 1);
    spreadGraphics.beginPath();
    spreadGraphics.moveTo(2, scy);
    spreadGraphics.lineTo(10, scy - 5);
    spreadGraphics.lineTo(18, scy);
    spreadGraphics.lineTo(10, scy + 5);
    spreadGraphics.closePath();
    spreadGraphics.fillPath();
    
    // Crystal top facet (lit)
    spreadGraphics.fillStyle(0x00ddff, 1);
    spreadGraphics.beginPath();
    spreadGraphics.moveTo(4, scy);
    spreadGraphics.lineTo(10, scy - 4);
    spreadGraphics.lineTo(14, scy - 1);
    spreadGraphics.lineTo(8, scy);
    spreadGraphics.closePath();
    spreadGraphics.fillPath();
    
    // Crystal bottom facet (shadow)
    spreadGraphics.fillStyle(0x008899, 1);
    spreadGraphics.beginPath();
    spreadGraphics.moveTo(4, scy);
    spreadGraphics.lineTo(10, scy + 4);
    spreadGraphics.lineTo(14, scy + 1);
    spreadGraphics.lineTo(8, scy);
    spreadGraphics.closePath();
    spreadGraphics.fillPath();
    
    // Inner glow
    spreadGraphics.fillStyle(0x66ffff, 0.9);
    spreadGraphics.fillEllipse(12, scy, 6, 3);
    
    // Core highlight
    spreadGraphics.fillStyle(0xffffff, 1);
    spreadGraphics.fillEllipse(14, scy, 3, 1.5);
    
    // Crystal edge highlights
    spreadGraphics.lineStyle(1, 0xaaffff, 0.8);
    spreadGraphics.beginPath();
    spreadGraphics.moveTo(10, scy - 5);
    spreadGraphics.lineTo(18, scy);
    spreadGraphics.strokePath();
    
    // Sparkle points
    spreadGraphics.fillStyle(0xffffff, 1);
    spreadGraphics.fillCircle(17, scy, 1.5);
    spreadGraphics.fillCircle(10, scy - 4, 1);
    spreadGraphics.fillStyle(0xffffff, 0.6);
    spreadGraphics.fillCircle(6, scy - 1, 0.8);
    
    // Trailing energy
    spreadGraphics.fillStyle(0x00ffff, 0.4);
    spreadGraphics.fillEllipse(3, scy, 4, 2);
    
    spreadGraphics.generateTexture('projectile_spread', sw, sh);
    spreadGraphics.destroy();

    // ========================
    // WAVE PROJECTILE (Plasma Wave)
    // ========================
    const waveGraphics = scene.add.graphics();
    const ww = 28, wh = 16;
    const wcy = wh / 2;
    
    // Outer energy field
    waveGraphics.fillStyle(0xff00ff, 0.12);
    waveGraphics.fillEllipse(14, wcy, 28, 16);
    
    // Secondary glow
    waveGraphics.fillStyle(0xff44ff, 0.2);
    waveGraphics.fillEllipse(14, wcy, 22, 12);
    
    // Wave shape using triangles/polygons (sine wave approximation)
    waveGraphics.fillStyle(0xcc00cc, 0.5);
    waveGraphics.beginPath();
    waveGraphics.moveTo(0, wcy);
    waveGraphics.lineTo(4, wcy - 4);
    waveGraphics.lineTo(8, wcy - 5);
    waveGraphics.lineTo(10, wcy - 3);
    waveGraphics.lineTo(14, wcy);
    waveGraphics.lineTo(18, wcy + 3);
    waveGraphics.lineTo(20, wcy + 5);
    waveGraphics.lineTo(24, wcy + 4);
    waveGraphics.lineTo(28, wcy);
    waveGraphics.lineTo(24, wcy + 2);
    waveGraphics.lineTo(20, wcy + 3);
    waveGraphics.lineTo(14, wcy);
    waveGraphics.lineTo(8, wcy - 3);
    waveGraphics.lineTo(4, wcy - 2);
    waveGraphics.closePath();
    waveGraphics.fillPath();
    
    // Main wave line (thick)
    waveGraphics.lineStyle(4, 0xff00ff, 0.8);
    waveGraphics.beginPath();
    waveGraphics.moveTo(2, wcy);
    waveGraphics.lineTo(6, wcy - 4);
    waveGraphics.lineTo(10, wcy - 5);
    waveGraphics.lineTo(14, wcy);
    waveGraphics.lineTo(18, wcy + 5);
    waveGraphics.lineTo(22, wcy + 4);
    waveGraphics.lineTo(26, wcy);
    waveGraphics.strokePath();
    
    // Inner wave line (medium)
    waveGraphics.lineStyle(2, 0xff66ff, 1);
    waveGraphics.beginPath();
    waveGraphics.moveTo(4, wcy);
    waveGraphics.lineTo(7, wcy - 3);
    waveGraphics.lineTo(10, wcy - 4);
    waveGraphics.lineTo(14, wcy);
    waveGraphics.lineTo(18, wcy + 4);
    waveGraphics.lineTo(21, wcy + 3);
    waveGraphics.lineTo(24, wcy);
    waveGraphics.strokePath();
    
    // Core wave line (thin bright)
    waveGraphics.lineStyle(1, 0xffaaff, 1);
    waveGraphics.beginPath();
    waveGraphics.moveTo(6, wcy);
    waveGraphics.lineTo(8, wcy - 2);
    waveGraphics.lineTo(11, wcy - 3);
    waveGraphics.lineTo(14, wcy);
    waveGraphics.lineTo(17, wcy + 3);
    waveGraphics.lineTo(20, wcy + 2);
    waveGraphics.lineTo(22, wcy);
    waveGraphics.strokePath();
    
    // Energy nodes at peaks
    waveGraphics.fillStyle(0xff88ff, 1);
    waveGraphics.fillCircle(9, wcy - 4, 3);
    waveGraphics.fillCircle(19, wcy + 4, 3);
    
    waveGraphics.fillStyle(0xffaaff, 1);
    waveGraphics.fillCircle(9, wcy - 4, 2);
    waveGraphics.fillCircle(19, wcy + 4, 2);
    
    waveGraphics.fillStyle(0xffffff, 1);
    waveGraphics.fillCircle(9, wcy - 4, 1);
    waveGraphics.fillCircle(19, wcy + 4, 1);
    
    // Center core
    waveGraphics.fillStyle(0xff66ff, 1);
    waveGraphics.fillCircle(14, wcy, 4);
    waveGraphics.fillStyle(0xffaaff, 1);
    waveGraphics.fillCircle(14, wcy, 2.5);
    waveGraphics.fillStyle(0xffffff, 1);
    waveGraphics.fillCircle(14, wcy, 1.2);
    
    // Particle sparks
    waveGraphics.fillStyle(0xffffff, 0.8);
    waveGraphics.fillCircle(5, wcy - 2, 0.8);
    waveGraphics.fillCircle(23, wcy + 2, 0.8);
    waveGraphics.fillCircle(11, wcy - 3, 0.6);
    waveGraphics.fillCircle(17, wcy + 3, 0.6);
    
    waveGraphics.generateTexture('projectile_wave', ww, wh);
    waveGraphics.destroy();

    // ========================
    // PIERCING PROJECTILE (Rail Beam)
    // ========================
    const piercingGraphics = scene.add.graphics();
    const prw = 32, prh = 12;
    const prcy = prh / 2;
    
    // Outer energy field
    piercingGraphics.fillStyle(0x0066ff, 0.15);
    piercingGraphics.fillRect(0, prcy - 6, 32, 12);
    
    // Electric field glow
    piercingGraphics.fillStyle(0x0088ff, 0.25);
    piercingGraphics.fillRect(0, prcy - 5, 32, 10);
    
    // Main beam body
    piercingGraphics.fillStyle(0x0055cc, 1);
    piercingGraphics.fillRect(0, prcy - 4, 28, 8);
    
    // Beam gradient - bottom (darker)
    piercingGraphics.fillStyle(0x003399, 1);
    piercingGraphics.fillRect(0, prcy + 1, 28, 3);
    
    // Beam gradient - top (lighter)
    piercingGraphics.fillStyle(0x0077ee, 1);
    piercingGraphics.fillRect(0, prcy - 3, 28, 2);
    
    // Core beam
    piercingGraphics.fillStyle(0x44aaff, 1);
    piercingGraphics.fillRect(0, prcy - 2, 28, 4);
    
    // Inner core (bright)
    piercingGraphics.fillStyle(0x88ccff, 1);
    piercingGraphics.fillRect(2, prcy - 1, 26, 2);
    
    // Hot center line
    piercingGraphics.fillStyle(0xffffff, 0.9);
    piercingGraphics.fillRect(4, prcy, 24, 1);
    
    // Leading edge (bright tip)
    piercingGraphics.fillStyle(0xaaddff, 1);
    piercingGraphics.beginPath();
    piercingGraphics.moveTo(26, prcy - 3);
    piercingGraphics.lineTo(32, prcy);
    piercingGraphics.lineTo(26, prcy + 3);
    piercingGraphics.closePath();
    piercingGraphics.fillPath();
    
    piercingGraphics.fillStyle(0xffffff, 1);
    piercingGraphics.beginPath();
    piercingGraphics.moveTo(28, prcy - 1.5);
    piercingGraphics.lineTo(32, prcy);
    piercingGraphics.lineTo(28, prcy + 1.5);
    piercingGraphics.closePath();
    piercingGraphics.fillPath();
    
    // Energy segments (rail sections)
    piercingGraphics.lineStyle(1, 0x0044aa, 0.8);
    for (let i = 0; i < 5; i++) {
        piercingGraphics.beginPath();
        piercingGraphics.moveTo(4 + i * 5, prcy - 4);
        piercingGraphics.lineTo(4 + i * 5, prcy + 4);
        piercingGraphics.strokePath();
    }
    
    // Top edge highlight
    piercingGraphics.lineStyle(1, 0x66ccff, 0.7);
    piercingGraphics.beginPath();
    piercingGraphics.moveTo(0, prcy - 4);
    piercingGraphics.lineTo(26, prcy - 4);
    piercingGraphics.strokePath();
    
    // Electric crackling
    piercingGraphics.lineStyle(1, 0xaaddff, 0.6);
    piercingGraphics.beginPath();
    piercingGraphics.moveTo(6, prcy - 4);
    piercingGraphics.lineTo(8, prcy - 6);
    piercingGraphics.lineTo(10, prcy - 4);
    piercingGraphics.strokePath();
    piercingGraphics.beginPath();
    piercingGraphics.moveTo(18, prcy + 4);
    piercingGraphics.lineTo(20, prcy + 6);
    piercingGraphics.lineTo(22, prcy + 4);
    piercingGraphics.strokePath();
    
    // Spark nodes
    piercingGraphics.fillStyle(0xffffff, 1);
    piercingGraphics.fillCircle(8, prcy - 6, 1);
    piercingGraphics.fillCircle(20, prcy + 6, 1);
    piercingGraphics.fillCircle(31, prcy, 1.5);
    
    piercingGraphics.generateTexture('projectile_piercing', prw, prh);
    piercingGraphics.destroy();

    // ========================
    // OVERDRIVE PROJECTILE (Super Plasma)
    // ========================
    const overdriveGraphics = scene.add.graphics();
    const ow = 20, oh = 14;
    const ocy = oh / 2;
    
    // Intense outer glow
    overdriveGraphics.fillStyle(0xff2200, 0.2);
    overdriveGraphics.fillEllipse(10, ocy, 20, 14);
    
    // Secondary glow
    overdriveGraphics.fillStyle(0xff4400, 0.3);
    overdriveGraphics.fillEllipse(11, ocy, 16, 11);
    
    // Tertiary glow
    overdriveGraphics.fillStyle(0xff6600, 0.4);
    overdriveGraphics.fillEllipse(12, ocy, 13, 9);
    
    // Plasma trail
    overdriveGraphics.fillStyle(0xff5500, 0.6);
    overdriveGraphics.beginPath();
    overdriveGraphics.moveTo(0, ocy);
    overdriveGraphics.lineTo(5, ocy - 5);
    overdriveGraphics.lineTo(14, ocy);
    overdriveGraphics.lineTo(5, ocy + 5);
    overdriveGraphics.closePath();
    overdriveGraphics.fillPath();
    
    // Main plasma body
    overdriveGraphics.fillStyle(0xff7700, 1);
    overdriveGraphics.beginPath();
    overdriveGraphics.moveTo(3, ocy);
    overdriveGraphics.lineTo(8, ocy - 4);
    overdriveGraphics.lineTo(18, ocy);
    overdriveGraphics.lineTo(8, ocy + 4);
    overdriveGraphics.closePath();
    overdriveGraphics.fillPath();
    
    // Inner plasma
    overdriveGraphics.fillStyle(0xffaa00, 1);
    overdriveGraphics.beginPath();
    overdriveGraphics.moveTo(6, ocy);
    overdriveGraphics.lineTo(9, ocy - 3);
    overdriveGraphics.lineTo(16, ocy);
    overdriveGraphics.lineTo(9, ocy + 3);
    overdriveGraphics.closePath();
    overdriveGraphics.fillPath();
    
    // Core glow
    overdriveGraphics.fillStyle(0xffcc44, 1);
    overdriveGraphics.fillEllipse(12, ocy, 6, 3);
    
    // Hot center
    overdriveGraphics.fillStyle(0xffee88, 1);
    overdriveGraphics.fillEllipse(14, ocy, 4, 2);
    
    // White hot tip
    overdriveGraphics.fillStyle(0xffffff, 1);
    overdriveGraphics.fillCircle(16, ocy, 1.5);
    
    // Energy wisps
    overdriveGraphics.fillStyle(0xff8800, 0.5);
    overdriveGraphics.fillEllipse(2, ocy - 2, 4, 2);
    overdriveGraphics.fillEllipse(1, ocy + 1, 3, 1.5);
    
    // Sparks
    overdriveGraphics.fillStyle(0xffffff, 0.9);
    overdriveGraphics.fillCircle(10, ocy - 2, 1);
    overdriveGraphics.fillCircle(8, ocy + 2, 0.8);
    overdriveGraphics.fillCircle(4, ocy, 0.6);
    
    // Edge highlight
    overdriveGraphics.lineStyle(1, 0xffcc66, 0.6);
    overdriveGraphics.beginPath();
    overdriveGraphics.moveTo(8, ocy - 4);
    overdriveGraphics.lineTo(18, ocy);
    overdriveGraphics.strokePath();
    
    overdriveGraphics.generateTexture('projectile_overdrive', ow, oh);
    overdriveGraphics.destroy();

    // ========================
    // DRONE PROJECTILE (Energy Orb)
    // ========================
    const droneProjectileGraphics = scene.add.graphics();
    const dw = 14, dh = 14;
    const dcx = dw / 2;
    const dcy = dh / 2;
    
    // Outer glow
    droneProjectileGraphics.fillStyle(0x00ff44, 0.15);
    droneProjectileGraphics.fillCircle(dcx, dcy, 7);
    
    // Secondary glow
    droneProjectileGraphics.fillStyle(0x00ff66, 0.25);
    droneProjectileGraphics.fillCircle(dcx, dcy, 5.5);
    
    // Main orb body
    droneProjectileGraphics.fillStyle(0x00aa44, 1);
    droneProjectileGraphics.fillCircle(dcx, dcy, 4.5);
    
    // Lit side highlight
    droneProjectileGraphics.fillStyle(0x00dd55, 1);
    droneProjectileGraphics.fillCircle(dcx - 1, dcy - 1, 3.5);
    
    // Inner glow
    droneProjectileGraphics.fillStyle(0x44ff88, 1);
    droneProjectileGraphics.fillCircle(dcx, dcy, 3);
    
    // Core
    droneProjectileGraphics.fillStyle(0x88ffaa, 1);
    droneProjectileGraphics.fillCircle(dcx, dcy, 2);
    
    // Hot center
    droneProjectileGraphics.fillStyle(0xccffcc, 1);
    droneProjectileGraphics.fillCircle(dcx, dcy, 1);
    
    // Specular highlight
    droneProjectileGraphics.fillStyle(0xffffff, 0.9);
    droneProjectileGraphics.fillCircle(dcx - 1.5, dcy - 1.5, 1.2);
    droneProjectileGraphics.fillStyle(0xffffff, 0.5);
    droneProjectileGraphics.fillCircle(dcx + 1, dcy + 1.5, 0.6);
    
    // Ring detail
    droneProjectileGraphics.lineStyle(1, 0x00ff88, 0.4);
    droneProjectileGraphics.strokeCircle(dcx, dcy, 5);
    
    droneProjectileGraphics.generateTexture('projectile_drone', dw, dh);
    droneProjectileGraphics.destroy();

    // ========================
    // SIDE PROJECTILE (Vertical Beam)
    // ========================
    const sideGraphics = scene.add.graphics();
    const siw = 12, sih = 18;
    const sicx = siw / 2;
    const sicy = sih / 2;
    
    // Outer glow
    sideGraphics.fillStyle(0x00ffaa, 0.15);
    sideGraphics.fillEllipse(sicx, sicy, 12, 18);
    
    // Secondary glow
    sideGraphics.fillStyle(0x00ffcc, 0.25);
    sideGraphics.fillEllipse(sicx, sicy, 9, 15);
    
    // Main beam body
    sideGraphics.fillStyle(0x00aa88, 1);
    sideGraphics.fillEllipse(sicx, sicy, 6, 13);
    
    // Lit side
    sideGraphics.fillStyle(0x00ddaa, 1);
    sideGraphics.fillEllipse(sicx - 1, sicy, 4, 11);
    
    // Inner core
    sideGraphics.fillStyle(0x44ffcc, 1);
    sideGraphics.fillEllipse(sicx, sicy, 4, 10);
    
    // Bright center
    sideGraphics.fillStyle(0x88ffdd, 1);
    sideGraphics.fillEllipse(sicx, sicy, 2.5, 7);
    
    // Hot line
    sideGraphics.fillStyle(0xccffee, 1);
    sideGraphics.fillEllipse(sicx, sicy, 1.2, 5);
    
    // Tips
    sideGraphics.fillStyle(0xffffff, 1);
    sideGraphics.fillCircle(sicx, 2, 1.5);
    sideGraphics.fillCircle(sicx, sih - 2, 1.5);
    
    // Edge highlights
    sideGraphics.lineStyle(1, 0x88ffee, 0.5);
    sideGraphics.beginPath();
    sideGraphics.moveTo(sicx - 3, 4);
    sideGraphics.lineTo(sicx - 3, sih - 4);
    sideGraphics.strokePath();
    
    // Sparkles
    sideGraphics.fillStyle(0xffffff, 0.8);
    sideGraphics.fillCircle(sicx - 1, 5, 0.8);
    sideGraphics.fillCircle(sicx + 1, sih - 6, 0.6);
    
    sideGraphics.generateTexture('projectile_side', siw, sih);
    sideGraphics.destroy();

    // ========================
    // MULTI PROJECTILE (Energy Pellet)
    // ========================
    const multiGraphics = scene.add.graphics();
    const mw = 12, mh = 12;
    const mcx = mw / 2;
    const mcy = mh / 2;
    
    // Outer glow
    multiGraphics.fillStyle(0xffff00, 0.2);
    multiGraphics.fillCircle(mcx, mcy, 6);
    
    // Secondary glow
    multiGraphics.fillStyle(0xffff44, 0.35);
    multiGraphics.fillCircle(mcx, mcy, 4.5);
    
    // Main pellet body
    multiGraphics.fillStyle(0xccaa00, 1);
    multiGraphics.fillCircle(mcx, mcy, 4);
    
    // Lit hemisphere
    multiGraphics.fillStyle(0xeecc00, 1);
    multiGraphics.fillCircle(mcx - 0.5, mcy - 0.5, 3.5);
    
    // Inner glow
    multiGraphics.fillStyle(0xffdd44, 1);
    multiGraphics.fillCircle(mcx, mcy, 2.5);
    
    // Core
    multiGraphics.fillStyle(0xffee88, 1);
    multiGraphics.fillCircle(mcx, mcy, 1.5);
    
    // Hot center
    multiGraphics.fillStyle(0xffffff, 1);
    multiGraphics.fillCircle(mcx, mcy, 0.8);
    
    // Specular
    multiGraphics.fillStyle(0xffffff, 0.9);
    multiGraphics.fillCircle(mcx - 1.2, mcy - 1.2, 1);
    
    // Ring detail
    multiGraphics.lineStyle(1, 0xffff88, 0.4);
    multiGraphics.strokeCircle(mcx, mcy, 4.5);
    
    // Sparkle
    multiGraphics.fillStyle(0xffffff, 0.6);
    multiGraphics.fillCircle(mcx + 2, mcy + 1, 0.5);
    
    multiGraphics.generateTexture('projectile_multi', mw, mh);
    multiGraphics.destroy();

    // ========================
    // MISSILE (Physical Projectile)
    // ========================
    const missileGraphics = scene.add.graphics();
    const msw = 28, msh = 14;
    const mscy = msh / 2;
    
    // Exhaust outer glow
    missileGraphics.fillStyle(0xff4400, 0.2);
    missileGraphics.fillEllipse(4, mscy, 10, 10);
    
    // Exhaust flame outer
    missileGraphics.fillStyle(0xff3300, 0.8);
    missileGraphics.beginPath();
    missileGraphics.moveTo(6, mscy - 3);
    missileGraphics.lineTo(-2, mscy);
    missileGraphics.lineTo(6, mscy + 3);
    missileGraphics.closePath();
    missileGraphics.fillPath();
    
    // Exhaust flame middle
    missileGraphics.fillStyle(0xff6600, 1);
    missileGraphics.beginPath();
    missileGraphics.moveTo(6, mscy - 2);
    missileGraphics.lineTo(1, mscy);
    missileGraphics.lineTo(6, mscy + 2);
    missileGraphics.closePath();
    missileGraphics.fillPath();
    
    // Exhaust flame inner
    missileGraphics.fillStyle(0xffaa00, 1);
    missileGraphics.beginPath();
    missileGraphics.moveTo(6, mscy - 1.5);
    missileGraphics.lineTo(3, mscy);
    missileGraphics.lineTo(6, mscy + 1.5);
    missileGraphics.closePath();
    missileGraphics.fillPath();
    
    // Exhaust core
    missileGraphics.fillStyle(0xffffaa, 1);
    missileGraphics.fillCircle(5, mscy, 1);
    
    // Engine nozzle
    missileGraphics.fillStyle(0x333344, 1);
    missileGraphics.fillRect(5, mscy - 3, 3, 6);
    
    // Missile body (main)
    missileGraphics.fillStyle(0x888899, 1);
    missileGraphics.fillRect(8, mscy - 3, 14, 6);
    
    // Body shadow (bottom)
    missileGraphics.fillStyle(0x666677, 1);
    missileGraphics.fillRect(8, mscy, 14, 3);
    
    // Body highlight (top)
    missileGraphics.fillStyle(0xaaaabb, 1);
    missileGraphics.fillRect(8, mscy - 3, 14, 2);
    
    // Body stripes
    missileGraphics.fillStyle(0xffcc00, 1);
    missileGraphics.fillRect(10, mscy - 3, 2, 6);
    missileGraphics.fillRect(14, mscy - 3, 2, 6);
    
    // Warhead
    missileGraphics.fillStyle(0xcc2222, 1);
    missileGraphics.beginPath();
    missileGraphics.moveTo(22, mscy - 3);
    missileGraphics.lineTo(28, mscy);
    missileGraphics.lineTo(22, mscy + 3);
    missileGraphics.closePath();
    missileGraphics.fillPath();
    
    // Warhead highlight
    missileGraphics.fillStyle(0xee4444, 1);
    missileGraphics.beginPath();
    missileGraphics.moveTo(22, mscy - 2);
    missileGraphics.lineTo(26, mscy - 0.5);
    missileGraphics.lineTo(22, mscy);
    missileGraphics.closePath();
    missileGraphics.fillPath();
    
    // Warhead tip
    missileGraphics.fillStyle(0xff6666, 0.8);
    missileGraphics.fillCircle(27, mscy, 1);
    
    // Top fin
    missileGraphics.fillStyle(0x555566, 1);
    missileGraphics.beginPath();
    missileGraphics.moveTo(10, mscy - 3);
    missileGraphics.lineTo(12, mscy - 7);
    missileGraphics.lineTo(16, mscy - 6);
    missileGraphics.lineTo(14, mscy - 3);
    missileGraphics.closePath();
    missileGraphics.fillPath();
    
    // Top fin highlight
    missileGraphics.fillStyle(0x777788, 1);
    missileGraphics.beginPath();
    missileGraphics.moveTo(11, mscy - 4);
    missileGraphics.lineTo(12, mscy - 6);
    missileGraphics.lineTo(14, mscy - 5.5);
    missileGraphics.lineTo(13, mscy - 4);
    missileGraphics.closePath();
    missileGraphics.fillPath();
    
    // Bottom fin
    missileGraphics.fillStyle(0x444455, 1);
    missileGraphics.beginPath();
    missileGraphics.moveTo(10, mscy + 3);
    missileGraphics.lineTo(12, mscy + 7);
    missileGraphics.lineTo(16, mscy + 6);
    missileGraphics.lineTo(14, mscy + 3);
    missileGraphics.closePath();
    missileGraphics.fillPath();
    
    // Guidance window
    missileGraphics.fillStyle(0x00ffff, 0.9);
    missileGraphics.fillCircle(18, mscy, 1.5);
    missileGraphics.fillStyle(0xffffff, 0.7);
    missileGraphics.fillCircle(17.5, mscy - 0.5, 0.6);
    
    // Panel lines
    missileGraphics.lineStyle(1, 0x555566, 0.8);
    missileGraphics.beginPath();
    missileGraphics.moveTo(12, mscy - 3);
    missileGraphics.lineTo(12, mscy + 3);
    missileGraphics.strokePath();
    missileGraphics.beginPath();
    missileGraphics.moveTo(20, mscy - 3);
    missileGraphics.lineTo(20, mscy + 3);
    missileGraphics.strokePath();
    
    // Rivets
    missileGraphics.fillStyle(0x999999, 0.8);
    missileGraphics.fillCircle(9, mscy - 2, 0.5);
    missileGraphics.fillCircle(9, mscy + 2, 0.5);
    missileGraphics.fillCircle(19, mscy - 2, 0.5);
    missileGraphics.fillCircle(19, mscy + 2, 0.5);
    
    // Edge highlight
    missileGraphics.lineStyle(1, 0xccccdd, 0.4);
    missileGraphics.beginPath();
    missileGraphics.moveTo(8, mscy - 3);
    missileGraphics.lineTo(22, mscy - 3);
    missileGraphics.strokePath();
    
    missileGraphics.generateTexture('missile', msw, msh);
    missileGraphics.destroy();
}
// ------------------------
// Player Projectile Graphics - All Player Projectile Textures
// ------------------------

