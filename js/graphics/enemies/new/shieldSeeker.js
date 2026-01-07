// ------------------------
// Enemy Graphics - New (Shield, Seeker)
// ------------------------

function createShieldGraphics(scene) {
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
}

function createSeekerGraphics(scene) {
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

}
