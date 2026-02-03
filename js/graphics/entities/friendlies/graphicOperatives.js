// ------------------------
// Operative Graphics - Friendly Comrade Classes
// ------------------------

function createOperativeGraphics(scene) {
    // ========================
    // STANDARD INFANTRY
    // ========================
    const infantry = scene.add.graphics();
    const infW = 22, infH = 26;
    const infCx = infW / 2;

    // Shadow
    infantry.fillStyle(0x1f2937, 0.75);
    infantry.fillEllipse(infCx, 24, 14, 4);

    // Legs
    infantry.fillStyle(0x334155, 1);
    infantry.fillRect(infCx - 5, 17, 4, 6);
    infantry.fillRect(infCx + 1, 17, 4, 6);

    // Torso
    infantry.fillStyle(0x64748b, 1);
    infantry.fillRoundedRect(infCx - 6, 8, 12, 10, 3);
    infantry.fillStyle(0x94a3b8, 0.8);
    infantry.fillRoundedRect(infCx - 4, 10, 8, 6, 2);

    // Helmet
    infantry.fillStyle(0x0f172a, 1);
    infantry.fillEllipse(infCx, 5, 10, 6);
    infantry.fillStyle(0x38bdf8, 0.9);
    infantry.fillRect(infCx - 3, 4, 6, 2);

    // Rifle
    infantry.fillStyle(0x111827, 1);
    infantry.fillRect(infCx + 6, 12, 9, 2);
    infantry.fillRect(infCx + 12, 11, 3, 4);
    infantry.fillStyle(0xf97316, 0.9);
    infantry.fillCircle(infCx + 14, 12, 1);

    infantry.generateTexture('operativeInfantry', infW, infH);
    infantry.destroy();

    // ========================
    // HEAVY GUNNER
    // ========================
    const heavy = scene.add.graphics();
    const hgW = 26, hgH = 28;
    const hgCx = hgW / 2;

    // Shoulder plates
    heavy.fillStyle(0x334155, 1);
    heavy.fillCircle(hgCx - 7, 10, 5);
    heavy.fillCircle(hgCx + 7, 10, 5);

    // Torso
    heavy.fillStyle(0x4b5563, 1);
    heavy.fillRoundedRect(hgCx - 8, 9, 16, 12, 4);
    heavy.fillStyle(0x94a3b8, 0.6);
    heavy.fillRoundedRect(hgCx - 5, 11, 10, 6, 3);

    // Helmet
    heavy.fillStyle(0x0f172a, 1);
    heavy.fillEllipse(hgCx, 6, 12, 7);
    heavy.fillStyle(0xef4444, 0.9);
    heavy.fillRect(hgCx - 4, 5, 8, 2);

    // Legs
    heavy.fillStyle(0x1f2937, 1);
    heavy.fillRect(hgCx - 6, 20, 4, 7);
    heavy.fillRect(hgCx + 2, 20, 4, 7);

    // Gatling cannon
    heavy.fillStyle(0x111827, 1);
    heavy.fillRect(hgCx + 6, 13, 10, 4);
    heavy.fillRect(hgCx + 12, 12, 4, 6);
    heavy.fillStyle(0xf97316, 1);
    heavy.fillCircle(hgCx + 15, 15, 1.4);

    heavy.generateTexture('operativeHeavy', hgW, hgH);
    heavy.destroy();

    // ========================
    // COMBAT MEDIC
    // ========================
    const medic = scene.add.graphics();
    const mdW = 22, mdH = 26;
    const mdCx = mdW / 2;

    // Backpack
    medic.fillStyle(0x0ea5e9, 0.8);
    medic.fillRoundedRect(mdCx - 7, 9, 14, 10, 3);
    medic.fillStyle(0x38bdf8, 1);
    medic.fillRect(mdCx - 1, 11, 2, 6);
    medic.fillRect(mdCx - 3, 13, 6, 2);

    // Torso
    medic.fillStyle(0x475569, 1);
    medic.fillRoundedRect(mdCx - 6, 8, 12, 10, 3);

    // Helmet
    medic.fillStyle(0x1f2937, 1);
    medic.fillEllipse(mdCx, 5, 10, 6);
    medic.fillStyle(0xfef3c7, 0.8);
    medic.fillRect(mdCx - 3, 4, 6, 2);

    // Legs
    medic.fillStyle(0x334155, 1);
    medic.fillRect(mdCx - 5, 19, 3, 5);
    medic.fillRect(mdCx + 1, 19, 3, 5);

    // Med glow
    medic.fillStyle(0x7dd3fc, 0.35);
    medic.fillCircle(mdCx, 16, 10);

    medic.generateTexture('operativeMedic', mdW, mdH);
    medic.destroy();

    // ========================
    // SABOTEUR
    // ========================
    const saboteur = scene.add.graphics();
    const sbW = 22, sbH = 26;
    const sbCx = sbW / 2;

    // Cloak
    saboteur.fillStyle(0x0f172a, 1);
    saboteur.fillTriangle(sbCx - 7, 10, sbCx + 7, 10, sbCx, 25);
    saboteur.fillStyle(0x1e293b, 0.85);
    saboteur.fillTriangle(sbCx - 5, 11, sbCx + 5, 11, sbCx, 23);

    // Helmet
    saboteur.fillStyle(0x111827, 1);
    saboteur.fillEllipse(sbCx, 6, 10, 6);
    saboteur.fillStyle(0x22d3ee, 0.9);
    saboteur.fillRect(sbCx - 3, 5, 6, 2);

    // EMP pack
    saboteur.fillStyle(0x14b8a6, 0.9);
    saboteur.fillRoundedRect(sbCx - 6, 14, 12, 6, 2);
    saboteur.fillStyle(0x5eead4, 1);
    saboteur.fillRect(sbCx - 1, 15, 2, 4);

    saboteur.generateTexture('operativeSaboteur', sbW, sbH);
    saboteur.destroy();
}

