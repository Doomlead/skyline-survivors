// ------------------------
// Interior Enemy Graphics: Reactor Core
// ------------------------

function createInteriorReactorCoreGraphics(scene) {
    const g = scene.add.graphics();

    function reset() {
        g.clear();
        g.fillStyle(0x000000, 0);
        g.fillRect(0, 0, 64, 64);
    }

    function drawReactorGuardian() {
        reset();
        g.fillStyle(0x7f1d1d, 0.35);
        g.fillCircle(32, 32, 26);

        g.lineStyle(6, 0xfacc15, 0.9);
        g.strokeCircle(32, 32, 20);
        g.lineStyle(3, 0xfef08a, 0.75);
        g.strokeCircle(32, 32, 14);

        g.fillStyle(0xdc2626, 1);
        g.fillCircle(32, 32, 9);
        g.fillStyle(0xfca5a5, 0.9);
        g.fillCircle(33, 31, 3.5);

        g.lineStyle(3, 0xfb7185, 0.75);
        g.strokeLineShape(new Phaser.Geom.Line(32, 8, 32, 2));
        g.strokeLineShape(new Phaser.Geom.Line(56, 32, 62, 32));
        g.strokeLineShape(new Phaser.Geom.Line(32, 56, 32, 62));
        g.strokeLineShape(new Phaser.Geom.Line(8, 32, 2, 32));

        g.generateTexture('reactor_guardian', 64, 64);
    }

    function drawSwarmBotReactorVariant() {
        reset();
        g.fillStyle(0x022c22, 0.35);
        g.fillEllipse(32, 38, 38, 20);

        g.fillStyle(0x0f766e, 1);
        g.fillCircle(32, 30, 10);
        g.fillStyle(0x22d3ee, 0.9);
        g.fillCircle(32, 30, 4);

        g.lineStyle(2, 0x5eead4, 0.8);
        g.strokeLineShape(new Phaser.Geom.Line(24, 36, 18, 46));
        g.strokeLineShape(new Phaser.Geom.Line(40, 36, 46, 46));
        g.strokeLineShape(new Phaser.Geom.Line(24, 24, 16, 20));
        g.strokeLineShape(new Phaser.Geom.Line(40, 24, 48, 20));

        g.fillStyle(0x99f6e4, 0.8);
        g.fillCircle(16, 20, 1.5);
        g.fillCircle(48, 20, 1.5);

        g.generateTexture('swarm_bot', 64, 64);
    }

    drawReactorGuardian();
    drawSwarmBotReactorVariant();
    g.destroy();
}
