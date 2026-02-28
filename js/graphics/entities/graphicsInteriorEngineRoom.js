// ------------------------
// Interior Enemy Graphics: Engine Room
// ------------------------

function createInteriorEngineRoomGraphics(scene) {
    const g = scene.add.graphics();

    function reset() {
        g.clear();
        g.fillStyle(0x000000, 0);
        g.fillRect(0, 0, 64, 64);
    }

    function drawRepairBot() {
        reset();
        g.fillStyle(0x064e3b, 0.35);
        g.fillEllipse(32, 40, 42, 20);

        g.fillStyle(0x065f46, 1);
        g.fillCircle(32, 30, 13);
        g.fillStyle(0x34d399, 0.9);
        g.fillCircle(32, 30, 5);

        g.fillStyle(0x10b981, 0.85);
        g.fillRect(20, 41, 6, 8);
        g.fillRect(38, 41, 6, 8);
        g.fillStyle(0x6ee7b7, 0.8);
        g.fillCircle(23, 46, 2);
        g.fillCircle(41, 46, 2);

        g.generateTexture('repair_bot', 64, 64);
    }

    function drawPlasmaFodder() {
        reset();
        g.fillStyle(0x1e3a8a, 0.3);
        g.fillCircle(32, 32, 20);

        g.fillStyle(0x1d4ed8, 1);
        g.fillRoundedRect(18, 18, 28, 28, 8);
        g.fillStyle(0x60a5fa, 0.95);
        g.fillCircle(32, 32, 7);
        g.fillStyle(0xbfdbfe, 0.9);
        g.fillCircle(33, 31, 3);

        g.lineStyle(2, 0x93c5fd, 0.8);
        g.strokeLineShape(new Phaser.Geom.Line(16, 24, 8, 18));
        g.strokeLineShape(new Phaser.Geom.Line(48, 24, 56, 18));
        g.strokeLineShape(new Phaser.Geom.Line(16, 40, 8, 46));
        g.strokeLineShape(new Phaser.Geom.Line(48, 40, 56, 46));

        g.generateTexture('plasma_fodder', 64, 64);
    }

    function drawEliteEngineer() {
        reset();
        g.fillStyle(0x7c2d12, 0.35);
        g.fillEllipse(32, 42, 44, 18);

        g.fillStyle(0x9a3412, 1);
        g.fillRoundedRect(16, 18, 32, 28, 8);
        g.fillStyle(0xfb923c, 0.9);
        g.fillRect(20, 22, 24, 5);

        g.fillStyle(0xffedd5, 0.9);
        g.fillCircle(32, 33, 5);
        g.fillStyle(0x7c2d12, 0.9);
        g.fillRect(24, 38, 16, 4);

        g.fillStyle(0xea580c, 0.9);
        g.fillRect(14, 28, 4, 10);
        g.fillRect(46, 28, 4, 10);

        g.generateTexture('elite_engineer', 64, 64);
    }

    drawRepairBot();
    drawPlasmaFodder();
    drawEliteEngineer();
    g.destroy();
}
