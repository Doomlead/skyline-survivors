// ------------------------
// Interior Enemy Graphics: Central Intelligence Core
// ------------------------

function createInteriorCentralIntelligenceCoreGraphics(scene) {
    const g = scene.add.graphics();

    function reset() {
        g.clear();
        g.fillStyle(0x000000, 0);
        g.fillRect(0, 0, 64, 64);
    }

    function drawOverseer() {
        reset();
        g.fillStyle(0x312e81, 0.35);
        g.fillCircle(32, 32, 26);

        g.lineStyle(5, 0x22d3ee, 0.85);
        g.strokeCircle(32, 32, 20);
        g.lineStyle(2, 0x67e8f9, 0.75);
        g.strokeCircle(32, 32, 14);

        g.fillStyle(0x4c1d95, 1);
        g.fillCircle(32, 32, 10);
        g.fillStyle(0xe9d5ff, 0.9);
        g.fillEllipse(32, 32, 12, 7);
        g.fillStyle(0x22d3ee, 0.95);
        g.fillCircle(32, 32, 3);

        g.lineStyle(2, 0xa78bfa, 0.7);
        g.strokeLineShape(new Phaser.Geom.Line(32, 8, 32, 2));
        g.strokeLineShape(new Phaser.Geom.Line(56, 32, 62, 32));
        g.strokeLineShape(new Phaser.Geom.Line(32, 56, 32, 62));
        g.strokeLineShape(new Phaser.Geom.Line(8, 32, 2, 32));

        g.generateTexture('the_overseer', 64, 64);
    }

    function drawAssaultDroneCoreVariant() {
        reset();
        g.fillStyle(0x111827, 0.4);
        g.fillEllipse(32, 38, 38, 20);

        g.fillStyle(0x374151, 1);
        g.beginPath();
        g.moveTo(14, 34);
        g.lineTo(32, 16);
        g.lineTo(50, 34);
        g.lineTo(32, 46);
        g.closePath();
        g.fillPath();

        g.fillStyle(0xf43f5e, 0.95);
        g.fillCircle(32, 30, 5);
        g.fillStyle(0xffe4e6, 0.9);
        g.fillCircle(33, 29, 2);

        g.lineStyle(2, 0xfb7185, 0.8);
        g.strokeLineShape(new Phaser.Geom.Line(22, 39, 32, 34));
        g.strokeLineShape(new Phaser.Geom.Line(42, 39, 32, 34));

        g.generateTexture('assault_drone', 64, 64);
    }

    drawOverseer();
    drawAssaultDroneCoreVariant();
    g.destroy();
}
