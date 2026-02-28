// ------------------------
// Interior Enemy Graphics: Power Generation
// ------------------------

function createInteriorPowerGenerationGraphics(scene) {
    const g = scene.add.graphics();

    function reset() {
        g.clear();
        g.fillStyle(0x000000, 0);
        g.fillRect(0, 0, 64, 64);
    }

    function drawHeavyMech() {
        reset();
        g.fillStyle(0x111827, 0.4);
        g.fillEllipse(32, 50, 42, 10);

        g.fillStyle(0x78350f, 1);
        g.fillRoundedRect(16, 18, 32, 26, 6);
        g.fillStyle(0x92400e, 1);
        g.fillRoundedRect(20, 22, 24, 10, 4);

        g.fillStyle(0xf59e0b, 0.95);
        g.fillRect(22, 34, 20, 4);
        g.fillStyle(0xfee2b2, 0.85);
        g.fillRect(25, 35, 14, 2);

        g.fillStyle(0x451a03, 1);
        g.fillRect(14, 28, 4, 12);
        g.fillRect(46, 28, 4, 12);
        g.fillRect(22, 44, 6, 8);
        g.fillRect(36, 44, 6, 8);

        g.lineStyle(2, 0xfbbf24, 0.5);
        g.strokeRoundedRect(16, 18, 32, 26, 6);
        g.generateTexture('heavy_mech', 64, 64);
    }

    function drawElectroShocker() {
        reset();
        g.fillStyle(0x1e1b4b, 0.4);
        g.fillCircle(32, 32, 20);

        g.fillStyle(0x312e81, 1);
        g.fillRoundedRect(20, 18, 24, 28, 8);
        g.fillStyle(0x22d3ee, 0.9);
        g.fillCircle(32, 30, 6);

        g.lineStyle(3, 0x67e8f9, 0.9);
        g.strokeLineShape(new Phaser.Geom.Line(16, 24, 8, 16));
        g.strokeLineShape(new Phaser.Geom.Line(48, 24, 56, 16));
        g.strokeLineShape(new Phaser.Geom.Line(16, 38, 8, 46));
        g.strokeLineShape(new Phaser.Geom.Line(48, 38, 56, 46));

        g.fillStyle(0x0f172a, 1);
        g.fillRect(24, 40, 16, 4);
        g.fillStyle(0x93c5fd, 0.7);
        g.fillRect(26, 41, 12, 2);

        g.generateTexture('electro_shocker', 64, 64);
    }

    function drawSwarmBot() {
        reset();
        g.fillStyle(0x052e16, 0.4);
        g.fillEllipse(32, 38, 36, 22);

        g.fillStyle(0x14532d, 1);
        g.fillCircle(32, 30, 10);
        g.fillStyle(0x86efac, 0.9);
        g.fillCircle(32, 30, 4);

        g.lineStyle(2, 0x22c55e, 0.8);
        g.strokeLineShape(new Phaser.Geom.Line(24, 36, 18, 46));
        g.strokeLineShape(new Phaser.Geom.Line(40, 36, 46, 46));
        g.strokeLineShape(new Phaser.Geom.Line(22, 28, 14, 24));
        g.strokeLineShape(new Phaser.Geom.Line(42, 28, 50, 24));

        g.fillStyle(0xbbf7d0, 0.8);
        g.fillCircle(14, 24, 1.5);
        g.fillCircle(50, 24, 1.5);
        g.fillCircle(18, 46, 1.5);
        g.fillCircle(46, 46, 1.5);

        g.generateTexture('swarm_bot', 64, 64);
    }

    drawHeavyMech();
    drawElectroShocker();
    drawSwarmBot();
    g.destroy();
}
