// ------------------------
// Interior Enemy Graphics: Bio-Labs
// ------------------------

function createInteriorBioLabsGraphics(scene) {
    const g = scene.add.graphics();

    function reset() {
        g.clear();
        g.fillStyle(0x000000, 0);
        g.fillRect(0, 0, 64, 64);
    }

    function drawMutantTestSubject() {
        reset();
        g.fillStyle(0x365314, 0.35);
        g.fillEllipse(32, 40, 40, 22);

        g.fillStyle(0x3f6212, 1);
        g.fillEllipse(32, 31, 30, 36);
        g.fillStyle(0x84cc16, 0.9);
        g.fillEllipse(30, 26, 12, 10);
        g.fillStyle(0xd9f99d, 0.8);
        g.fillCircle(32, 27, 3);

        g.fillStyle(0x65a30d, 0.9);
        g.fillRect(19, 37, 6, 10);
        g.fillRect(39, 37, 6, 10);

        g.generateTexture('mutant_test_subject', 64, 64);
    }

    function drawBioTank() {
        reset();
        g.fillStyle(0x164e63, 0.3);
        g.fillRoundedRect(14, 12, 36, 42, 10);
        g.fillStyle(0x082f49, 1);
        g.fillRoundedRect(18, 16, 28, 34, 8);

        g.fillStyle(0x67e8f9, 0.25);
        g.fillRoundedRect(20, 18, 24, 30, 6);
        g.fillStyle(0x67e8f9, 0.8);
        g.fillEllipse(32, 30, 10, 14);

        g.lineStyle(2, 0x22d3ee, 0.8);
        g.strokeRoundedRect(14, 12, 36, 42, 10);
        g.fillStyle(0x0f172a, 0.8);
        g.fillRect(24, 50, 16, 4);

        g.generateTexture('bio_tank', 64, 64);
    }

    function drawSecurityChief() {
        reset();
        g.fillStyle(0x3b0764, 0.35);
        g.fillEllipse(32, 40, 42, 20);

        g.fillStyle(0x581c87, 1);
        g.fillRoundedRect(16, 18, 32, 30, 8);
        g.fillStyle(0xa855f7, 0.8);
        g.fillRect(20, 24, 24, 6);

        g.fillStyle(0xe879f9, 0.9);
        g.fillCircle(32, 34, 5);
        g.fillStyle(0xf5d0fe, 0.9);
        g.fillCircle(33, 33, 2);

        g.fillStyle(0x2e1065, 1);
        g.fillRect(14, 29, 4, 12);
        g.fillRect(46, 29, 4, 12);

        g.generateTexture('security_chief', 64, 64);
    }

    drawMutantTestSubject();
    drawBioTank();
    drawSecurityChief();
    g.destroy();
}
