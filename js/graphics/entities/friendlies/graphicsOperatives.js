// ------------------------
// Operative Graphics - Friendly Comrades
// ------------------------

function createOperativeGraphics(scene) { // Create operative graphics.
    // ========================
    // OPERATIVE INFANTRY
    // ========================
    const infantry = scene.add.graphics();
    const infW = 22, infH = 26;
    const infCx = infW / 2;

    // Shadow
    infantry.fillStyle(0x0f172a, 0.7);
    infantry.fillEllipse(infCx, 24, 12, 4);

    // Legs
    infantry.fillStyle(0x1f2937, 1);
    infantry.fillRect(infCx - 5, 17, 4, 7);
    infantry.fillRect(infCx + 1, 17, 4, 7);

    // Torso armor
    infantry.fillStyle(0x0ea5e9, 1);
    infantry.fillRoundedRect(infCx - 6, 8, 12, 10, 3);
    infantry.fillStyle(0x38bdf8, 0.9);
    infantry.fillRoundedRect(infCx - 5, 9, 10, 6, 3);

    // Helmet
    infantry.fillStyle(0x111827, 1);
    infantry.fillEllipse(infCx, 5, 10, 6);
    infantry.fillStyle(0xa7f3d0, 0.9);
    infantry.fillRect(infCx - 3, 4, 6, 2);

    // Arms
    infantry.fillStyle(0x1f2937, 1);
    infantry.fillRect(infCx - 8, 9, 3, 6);
    infantry.fillRect(infCx + 5, 9, 3, 6);

    // Rifle
    infantry.fillStyle(0x0f172a, 1);
    infantry.fillRect(infCx + 6, 12, 9, 2);
    infantry.fillRect(infCx + 12, 11, 3, 4);
    infantry.fillStyle(0x22d3ee, 0.9);
    infantry.fillCircle(infCx + 15, 12, 1);

    infantry.generateTexture('operativeInfantry', infW, infH);
    infantry.destroy();

    // ========================
    // OPERATIVE HEAVY GUNNER
    // ========================
    const gunner = scene.add.graphics();
    const hgW = 26, hgH = 26;
    const hgCx = hgW / 2;

    // Shoulder plates
    gunner.fillStyle(0x7c2d12, 1);
    gunner.fillCircle(hgCx - 7, 10, 5);
    gunner.fillCircle(hgCx + 7, 10, 5);

    // Torso
    gunner.fillStyle(0xdc2626, 1);
    gunner.fillRoundedRect(hgCx - 8, 8, 16, 12, 4);
    gunner.fillStyle(0xf97316, 0.9);
    gunner.fillRoundedRect(hgCx - 5, 10, 10, 6, 3);

    // Helmet
    gunner.fillStyle(0x111827, 1);
    gunner.fillEllipse(hgCx, 5, 12, 7);
    gunner.fillStyle(0xfacc15, 0.9);
    gunner.fillRect(hgCx - 4, 4, 8, 2);

    // Legs
    gunner.fillStyle(0x1f2937, 1);
    gunner.fillRect(hgCx - 6, 19, 4, 6);
    gunner.fillRect(hgCx + 2, 19, 4, 6);

    // Gatling cannon
    gunner.fillStyle(0x0f172a, 1);
    gunner.fillRect(hgCx + 6, 12, 10, 4);
    gunner.fillRect(hgCx + 12, 11, 4, 6);
    gunner.fillStyle(0xfb923c, 1);
    gunner.fillCircle(hgCx + 15, 14, 1.4);

    gunner.generateTexture('operativeGunner', hgW, hgH);
    gunner.destroy();

    // ========================
    // OPERATIVE MEDIC
    // ========================
    const medic = scene.add.graphics();
    const mdW = 24, mdH = 26;
    const mdCx = mdW / 2;

    // Backpack
    medic.fillStyle(0x0f766e, 0.9);
    medic.fillRoundedRect(mdCx - 7, 9, 14, 10, 3);
    medic.fillStyle(0x5eead4, 1);
    medic.fillRect(mdCx - 1, 11, 2, 6);
    medic.fillRect(mdCx - 3, 13, 6, 2);

    // Torso
    medic.fillStyle(0x0ea5e9, 1);
    medic.fillRoundedRect(mdCx - 6, 8, 12, 10, 3);

    // Helmet
    medic.fillStyle(0x111827, 1);
    medic.fillEllipse(mdCx, 5, 10, 6);
    medic.fillStyle(0xfef3c7, 0.9);
    medic.fillRect(mdCx - 3, 4, 6, 2);

    // Legs
    medic.fillStyle(0x1f2937, 1);
    medic.fillRect(mdCx - 5, 19, 3, 5);
    medic.fillRect(mdCx + 1, 19, 3, 5);

    // Med glow
    medic.fillStyle(0x99f6e4, 0.3);
    medic.fillCircle(mdCx, 16, 10);

    medic.generateTexture('operativeMedic', mdW, mdH);
    medic.destroy();

    // ========================
    // OPERATIVE SABOTEUR
    // ========================
    const saboteur = scene.add.graphics();
    const sbW = 24, sbH = 26;
    const sbCx = sbW / 2;

    // Cloak
    saboteur.fillStyle(0x1f2937, 1);
    saboteur.fillTriangle(sbCx - 7, 9, sbCx + 7, 9, sbCx, 24);
    saboteur.fillStyle(0x334155, 0.85);
    saboteur.fillTriangle(sbCx - 5, 10, sbCx + 5, 10, sbCx, 22);

    // Helmet
    saboteur.fillStyle(0x0f172a, 1);
    saboteur.fillEllipse(sbCx, 6, 10, 6);
    saboteur.fillStyle(0xfb923c, 0.9);
    saboteur.fillRect(sbCx - 3, 5, 6, 2);

    // EMP satchel
    saboteur.fillStyle(0x7c2d12, 1);
    saboteur.fillRoundedRect(sbCx + 2, 12, 6, 6, 2);
    saboteur.fillStyle(0xfdba74, 0.9);
    saboteur.fillRect(sbCx + 4, 14, 2, 2);

    saboteur.generateTexture('operativeSaboteur', sbW, sbH);
    saboteur.destroy();
}
