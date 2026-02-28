// ------------------------
// Interior Enemy Graphics: Security Hub
// ------------------------

function createInteriorSecurityHubGraphics(scene) {
    const g = scene.add.graphics();
    const w = 64;
    const h = 64;

    function reset() {
        g.clear();
        g.fillStyle(0x000000, 0);
        g.fillRect(0, 0, w, h);
    }

    function drawBaseTrooper() {
        reset();
        g.fillStyle(0x1f2937, 0.25);
        g.fillEllipse(32, 36, 46, 32);

        g.fillStyle(0x334155, 1);
        g.fillRoundedRect(16, 18, 32, 30, 8);
        g.fillStyle(0x475569, 1);
        g.fillRoundedRect(18, 20, 28, 12, 6);

        g.fillStyle(0x0f172a, 1);
        g.fillRect(21, 33, 22, 9);
        g.fillStyle(0xf8fafc, 0.85);
        g.fillRect(23, 35, 18, 3);

        g.fillStyle(0x94a3b8, 0.9);
        g.fillRect(14, 28, 4, 10);
        g.fillRect(46, 28, 4, 10);
        g.fillStyle(0x64748b, 1);
        g.fillCircle(16, 33, 2.5);
        g.fillCircle(48, 33, 2.5);

        g.lineStyle(2, 0xe2e8f0, 0.45);
        g.strokeRoundedRect(16, 18, 32, 30, 8);
        g.generateTexture('base_trooper', w, h);
    }

    function drawTurretSentry() {
        reset();
        g.fillStyle(0x0f172a, 0.45);
        g.fillEllipse(32, 49, 40, 10);

        g.fillStyle(0x1e293b, 1);
        g.fillRoundedRect(18, 38, 28, 10, 4);
        g.fillStyle(0x334155, 1);
        g.fillRoundedRect(20, 22, 24, 20, 6);

        g.fillStyle(0x38bdf8, 0.9);
        g.fillCircle(32, 32, 5);
        g.fillStyle(0xe0f2fe, 0.9);
        g.fillCircle(33, 31, 2);

        g.fillStyle(0x64748b, 1);
        g.fillRect(44, 28, 14, 5);
        g.fillStyle(0x0ea5e9, 0.95);
        g.fillRect(52, 29, 8, 3);

        g.fillStyle(0x475569, 1);
        g.fillRect(24, 16, 16, 6);
        g.lineStyle(2, 0x93c5fd, 0.7);
        g.strokeLineShape(new Phaser.Geom.Line(28, 16, 28, 10));
        g.strokeLineShape(new Phaser.Geom.Line(36, 16, 36, 10));

        g.generateTexture('turret_sentry', w, h);
    }

    function drawShockDrone() {
        reset();
        g.fillStyle(0x111827, 0.45);
        g.fillEllipse(32, 38, 36, 24);

        g.fillStyle(0x1f2937, 1);
        g.fillCircle(32, 30, 12);
        g.fillStyle(0x22d3ee, 0.9);
        g.fillCircle(32, 30, 5);
        g.fillStyle(0xe0f2fe, 0.9);
        g.fillCircle(33, 29, 2);

        g.lineStyle(3, 0xa78bfa, 0.9);
        g.strokeLineShape(new Phaser.Geom.Line(20, 24, 10, 18));
        g.strokeLineShape(new Phaser.Geom.Line(44, 24, 54, 18));
        g.strokeLineShape(new Phaser.Geom.Line(20, 36, 10, 44));
        g.strokeLineShape(new Phaser.Geom.Line(44, 36, 54, 44));

        g.fillStyle(0xc4b5fd, 0.8);
        g.fillCircle(10, 18, 2);
        g.fillCircle(54, 18, 2);
        g.fillCircle(10, 44, 2);
        g.fillCircle(54, 44, 2);

        g.generateTexture('shock_drone', w, h);
    }

    drawBaseTrooper();
    drawTurretSentry();
    drawShockDrone();
    g.destroy();
}
