// ------------------------
// Interior Enemy Graphics: Shield Control
// ------------------------

function createInteriorShieldControlGraphics(scene) {
    const g = scene.add.graphics();

    function reset() {
        g.clear();
        g.fillStyle(0x000000, 0);
        g.fillRect(0, 0, 64, 64);
    }

    function drawShieldOperator() {
        reset();
        g.fillStyle(0x0f766e, 0.35);
        g.fillCircle(32, 32, 22);

        g.fillStyle(0x115e59, 1);
        g.fillRoundedRect(20, 18, 24, 28, 7);
        g.lineStyle(4, 0x2dd4bf, 0.9);
        g.strokeCircle(32, 32, 16);

        g.fillStyle(0x99f6e4, 0.9);
        g.fillCircle(32, 32, 5);
        g.fillStyle(0xf0fdfa, 0.9);
        g.fillCircle(33, 31, 2);

        g.generateTexture('shield_operator', 64, 64);
    }

    function drawAssaultDroneShieldVariant() {
        reset();
        g.fillStyle(0x111827, 0.4);
        g.fillEllipse(32, 38, 38, 20);

        g.fillStyle(0x374151, 1);
        g.beginPath();
        g.moveTo(14, 34);
        g.lineTo(32, 18);
        g.lineTo(50, 34);
        g.lineTo(32, 46);
        g.closePath();
        g.fillPath();

        g.fillStyle(0xf43f5e, 0.95);
        g.fillCircle(32, 31, 5);
        g.fillStyle(0xffe4e6, 0.9);
        g.fillCircle(33, 30, 2);

        g.fillStyle(0x9ca3af, 0.8);
        g.fillRect(20, 38, 24, 3);
        g.generateTexture('assault_drone', 64, 64);
    }

    function drawSniperNestUnit() {
        reset();
        g.fillStyle(0x0f172a, 0.45);
        g.fillEllipse(32, 50, 42, 10);

        g.fillStyle(0x111827, 1);
        g.fillRoundedRect(16, 38, 32, 10, 4);
        g.fillStyle(0x1f2937, 1);
        g.fillRoundedRect(20, 22, 24, 18, 5);

        g.fillStyle(0x93c5fd, 0.95);
        g.fillRect(43, 29, 15, 3);
        g.fillStyle(0xe0f2fe, 0.9);
        g.fillCircle(32, 31, 4);

        g.lineStyle(2, 0x64748b, 0.9);
        g.strokeRoundedRect(20, 22, 24, 18, 5);
        g.generateTexture('sniper_nest_unit', 64, 64);
    }

    drawShieldOperator();
    drawAssaultDroneShieldVariant();
    drawSniperNestUnit();
    g.destroy();
}
