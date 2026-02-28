// ------------------------
// Interior Enemy Graphics: Hangar Bay
// ------------------------

function createInteriorHangarBayGraphics(scene) {
    const g = scene.add.graphics();

    function reset() {
        g.clear();
        g.fillStyle(0x000000, 0);
        g.fillRect(0, 0, 64, 64);
    }

    function drawMothershipGrunt() {
        reset();
        g.fillStyle(0x0f172a, 0.35);
        g.fillEllipse(32, 40, 46, 18);

        g.fillStyle(0x334155, 1);
        g.beginPath();
        g.moveTo(10, 36);
        g.lineTo(30, 18);
        g.lineTo(54, 32);
        g.lineTo(32, 46);
        g.closePath();
        g.fillPath();

        g.fillStyle(0x93c5fd, 0.85);
        g.fillCircle(33, 30, 5);
        g.fillStyle(0xe0f2fe, 0.9);
        g.fillCircle(35, 28, 2);

        g.fillStyle(0x64748b, 1);
        g.fillRect(16, 36, 20, 4);
        g.generateTexture('mothership_grunt', 64, 64);
    }

    function drawHoverMine() {
        reset();
        g.fillStyle(0x7f1d1d, 0.4);
        g.fillCircle(32, 34, 20);

        g.fillStyle(0x991b1b, 1);
        g.fillCircle(32, 32, 14);
        g.fillStyle(0xf87171, 0.95);
        g.fillCircle(32, 32, 5);

        g.lineStyle(3, 0xfca5a5, 0.8);
        g.strokeLineShape(new Phaser.Geom.Line(32, 12, 32, 6));
        g.strokeLineShape(new Phaser.Geom.Line(52, 32, 58, 32));
        g.strokeLineShape(new Phaser.Geom.Line(32, 52, 32, 58));
        g.strokeLineShape(new Phaser.Geom.Line(12, 32, 6, 32));

        g.generateTexture('hover_mine', 64, 64);
    }

    function drawLaserTurret() {
        reset();
        g.fillStyle(0x020617, 0.4);
        g.fillEllipse(32, 48, 42, 10);

        g.fillStyle(0x0f172a, 1);
        g.fillRoundedRect(18, 38, 28, 10, 4);
        g.fillStyle(0x1e293b, 1);
        g.fillRoundedRect(22, 20, 20, 20, 5);

        g.fillStyle(0x22d3ee, 1);
        g.fillRect(42, 28, 16, 4);
        g.fillStyle(0x67e8f9, 0.85);
        g.fillRect(52, 29, 8, 2);

        g.fillStyle(0x38bdf8, 0.9);
        g.fillCircle(31, 30, 4);
        g.fillStyle(0xe0f2fe, 0.9);
        g.fillCircle(32, 29, 1.8);

        g.generateTexture('laser_turret', 64, 64);
    }

    drawMothershipGrunt();
    drawHoverMine();
    drawLaserTurret();
    g.destroy();
}
