// ------------------------
// Garrison Defender Graphics - Assault Base Defenders
// ------------------------

function createGarrisonDefenderGraphics(scene) { // Create garrison defender graphics.
    // ========================
    // GARRISON RIFLE TROOPER
    // ========================
    const rifleTrooper = scene.add.graphics();
    const rtW = 22, rtH = 26;
    const rtCx = rtW / 2;

    // Shadow base
    rifleTrooper.fillStyle(0x1f2937, 0.8);
    rifleTrooper.fillEllipse(rtCx, 24, 14, 4);

    // Legs
    rifleTrooper.fillStyle(0x374151, 1);
    rifleTrooper.fillRect(rtCx - 5, 16, 4, 7);
    rifleTrooper.fillRect(rtCx + 1, 16, 4, 7);

    // Torso armor
    rifleTrooper.fillStyle(0x4b5563, 1);
    rifleTrooper.fillRoundedRect(rtCx - 6, 8, 12, 10, 3);
    rifleTrooper.fillStyle(0x6b7280, 1);
    rifleTrooper.fillRoundedRect(rtCx - 5, 9, 10, 6, 3);

    // Helmet
    rifleTrooper.fillStyle(0x111827, 1);
    rifleTrooper.fillEllipse(rtCx, 5, 10, 6);
    rifleTrooper.fillStyle(0x22d3ee, 0.9);
    rifleTrooper.fillRect(rtCx - 3, 4, 6, 2);

    // Arms
    rifleTrooper.fillStyle(0x374151, 1);
    rifleTrooper.fillRect(rtCx - 8, 9, 3, 6);
    rifleTrooper.fillRect(rtCx + 5, 9, 3, 6);

    // Rifle
    rifleTrooper.fillStyle(0x0f172a, 1);
    rifleTrooper.fillRect(rtCx + 6, 12, 10, 2);
    rifleTrooper.fillRect(rtCx + 12, 11, 3, 4);
    rifleTrooper.fillStyle(0xf97316, 0.9);
    rifleTrooper.fillCircle(rtCx + 15, 12, 1);

    rifleTrooper.generateTexture('garrisonDefenderRifle', rtW, rtH);
    rifleTrooper.destroy();

    // ========================
    // GARRISON SHIELD GUARD
    // ========================
    const shieldGuard = scene.add.graphics();
    const sgW = 24, sgH = 26;
    const sgCx = sgW / 2;

    // Shield glow
    shieldGuard.fillStyle(0x38bdf8, 0.2);
    shieldGuard.fillEllipse(sgCx + 5, 13, 14, 20);

    // Shield body
    shieldGuard.fillStyle(0x0ea5e9, 1);
    shieldGuard.fillRoundedRect(sgCx + 1, 5, 10, 18, 5);
    shieldGuard.lineStyle(1, 0x7dd3fc, 1);
    shieldGuard.strokeRoundedRect(sgCx + 1, 5, 10, 18, 5);

    // Body
    shieldGuard.fillStyle(0x334155, 1);
    shieldGuard.fillRoundedRect(sgCx - 6, 8, 10, 11, 3);

    // Helmet
    shieldGuard.fillStyle(0x1f2937, 1);
    shieldGuard.fillEllipse(sgCx - 1, 5, 9, 6);
    shieldGuard.fillStyle(0xfbbf24, 0.9);
    shieldGuard.fillRect(sgCx - 3, 4, 5, 2);

    // Legs
    shieldGuard.fillStyle(0x475569, 1);
    shieldGuard.fillRect(sgCx - 5, 19, 3, 5);
    shieldGuard.fillRect(sgCx - 1, 19, 3, 5);

    shieldGuard.generateTexture('garrisonDefenderShield', sgW, sgH);
    shieldGuard.destroy();

    // ========================
    // GARRISON HEAVY GUNNER
    // ========================
    const heavyGunner = scene.add.graphics();
    const hgW = 26, hgH = 26;
    const hgCx = hgW / 2;

    // Shoulder armor
    heavyGunner.fillStyle(0x475569, 1);
    heavyGunner.fillCircle(hgCx - 7, 10, 5);
    heavyGunner.fillCircle(hgCx + 7, 10, 5);

    // Torso
    heavyGunner.fillStyle(0x4b5563, 1);
    heavyGunner.fillRoundedRect(hgCx - 8, 8, 16, 12, 4);
    heavyGunner.fillStyle(0x9ca3af, 0.6);
    heavyGunner.fillRoundedRect(hgCx - 5, 10, 10, 6, 3);

    // Helmet
    heavyGunner.fillStyle(0x1f2937, 1);
    heavyGunner.fillEllipse(hgCx, 5, 12, 7);
    heavyGunner.fillStyle(0xef4444, 0.9);
    heavyGunner.fillRect(hgCx - 4, 4, 8, 2);

    // Legs
    heavyGunner.fillStyle(0x374151, 1);
    heavyGunner.fillRect(hgCx - 6, 19, 4, 6);
    heavyGunner.fillRect(hgCx + 2, 19, 4, 6);

    // Heavy cannon
    heavyGunner.fillStyle(0x111827, 1);
    heavyGunner.fillRect(hgCx + 6, 12, 10, 4);
    heavyGunner.fillRect(hgCx + 12, 11, 4, 6);
    heavyGunner.fillStyle(0xf97316, 1);
    heavyGunner.fillCircle(hgCx + 15, 14, 1.3);

    heavyGunner.generateTexture('garrisonDefenderHeavy', hgW, hgH);
    heavyGunner.destroy();

    // ========================
    // GARRISON SNIPER
    // ========================
    const sniper = scene.add.graphics();
    const snW = 24, snH = 26;
    const snCx = snW / 2;

    // Cloak
    sniper.fillStyle(0x1e293b, 1);
    sniper.fillTriangle(snCx - 7, 9, snCx + 7, 9, snCx, 24);
    sniper.fillStyle(0x334155, 0.8);
    sniper.fillTriangle(snCx - 5, 10, snCx + 5, 10, snCx, 22);

    // Helmet
    sniper.fillStyle(0x0f172a, 1);
    sniper.fillEllipse(snCx, 6, 10, 6);
    sniper.fillStyle(0x22c55e, 0.9);
    sniper.fillRect(snCx - 3, 5, 6, 2);

    // Long rifle
    sniper.fillStyle(0x0f172a, 1);
    sniper.fillRect(snCx + 2, 12, 12, 2);
    sniper.fillRect(snCx + 10, 11, 4, 4);
    sniper.fillStyle(0x94a3b8, 1);
    sniper.fillRect(snCx + 5, 10, 3, 1);

    sniper.generateTexture('garrisonDefenderSniper', snW, snH);
    sniper.destroy();

    // ========================
    // GARRISON MEDIC
    // ========================
    const medic = scene.add.graphics();
    const mdW = 24, mdH = 26;
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
    medic.fillStyle(0x7dd3fc, 0.3);
    medic.fillCircle(mdCx, 16, 10);

    medic.generateTexture('garrisonDefenderMedic', mdW, mdH);
    medic.destroy();

    // ========================
    // GARRISON ENGINEER
    // ========================
    const engineer = scene.add.graphics();
    const enW = 24, enH = 26;
    const enCx = enW / 2;

    // Tool pack
    engineer.fillStyle(0xf59e0b, 0.8);
    engineer.fillRoundedRect(enCx - 7, 9, 14, 9, 3);
    engineer.fillStyle(0xfbbf24, 1);
    engineer.fillRect(enCx - 3, 11, 6, 2);

    // Torso
    engineer.fillStyle(0x4b5563, 1);
    engineer.fillRoundedRect(enCx - 6, 8, 12, 10, 3);

    // Helmet
    engineer.fillStyle(0x1f2937, 1);
    engineer.fillEllipse(enCx, 5, 10, 6);
    engineer.fillStyle(0xfacc15, 0.9);
    engineer.fillRect(enCx - 3, 4, 6, 2);

    // Legs
    engineer.fillStyle(0x374151, 1);
    engineer.fillRect(enCx - 5, 19, 3, 5);
    engineer.fillRect(enCx + 1, 19, 3, 5);

    // Wrench arm
    engineer.fillStyle(0x94a3b8, 1);
    engineer.fillRect(enCx + 5, 12, 6, 2);
    engineer.fillCircle(enCx + 11, 13, 2);

    engineer.generateTexture('garrisonDefenderEngineer', enW, enH);
    engineer.destroy();

    // ========================
    // GARRISON JETPACK TROOPER
    // ========================
    const jetpack = scene.add.graphics();
    const jpW = 24, jpH = 28;
    const jpCx = jpW / 2;

    // Jet exhaust
    jetpack.fillStyle(0xf97316, 0.7);
    jetpack.fillTriangle(jpCx - 6, 22, jpCx - 2, 28, jpCx + 2, 22);
    jetpack.fillTriangle(jpCx + 2, 22, jpCx + 6, 28, jpCx + 10, 22);
    jetpack.fillStyle(0xfef08a, 0.9);
    jetpack.fillTriangle(jpCx - 4, 22, jpCx - 2, 26, jpCx, 22);
    jetpack.fillTriangle(jpCx + 4, 22, jpCx + 6, 26, jpCx + 8, 22);

    // Jetpack body
    jetpack.fillStyle(0x1f2937, 1);
    jetpack.fillRoundedRect(jpCx - 7, 8, 14, 12, 3);
    jetpack.fillStyle(0x60a5fa, 0.9);
    jetpack.fillCircle(jpCx - 4, 14, 2);
    jetpack.fillCircle(jpCx + 4, 14, 2);

    // Torso
    jetpack.fillStyle(0x475569, 1);
    jetpack.fillRoundedRect(jpCx - 5, 9, 10, 9, 3);

    // Helmet
    jetpack.fillStyle(0x0f172a, 1);
    jetpack.fillEllipse(jpCx, 5, 10, 6);
    jetpack.fillStyle(0x38bdf8, 0.9);
    jetpack.fillRect(jpCx - 3, 4, 6, 2);

    // Legs
    jetpack.fillStyle(0x334155, 1);
    jetpack.fillRect(jpCx - 4, 19, 3, 5);
    jetpack.fillRect(jpCx + 1, 19, 3, 5);

    jetpack.generateTexture('garrisonDefenderJetpack', jpW, jpH);
    jetpack.destroy();

    // ========================
    // GARRISON DRONE SENTINEL
    // ========================
    const drone = scene.add.graphics();
    const drW = 26, drH = 20;
    const drCx = drW / 2;

    // Glow aura
    drone.fillStyle(0x22d3ee, 0.2);
    drone.fillEllipse(drCx, 10, 22, 14);

    // Body
    drone.fillStyle(0x111827, 1);
    drone.fillEllipse(drCx, 10, 18, 10);
    drone.fillStyle(0x475569, 1);
    drone.fillEllipse(drCx, 9, 12, 6);

    // Eye
    drone.fillStyle(0x22d3ee, 1);
    drone.fillCircle(drCx, 10, 2.5);
    drone.fillStyle(0xffffff, 0.8);
    drone.fillCircle(drCx - 1, 9, 1);

    // Side thrusters
    drone.fillStyle(0x0f172a, 1);
    drone.fillRect(2, 8, 4, 4);
    drone.fillRect(drW - 6, 8, 4, 4);
    drone.fillStyle(0x38bdf8, 0.7);
    drone.fillCircle(4, 10, 1);
    drone.fillCircle(drW - 4, 10, 1);

    drone.generateTexture('garrisonDefenderDrone', drW, drH);
    drone.destroy();

    // ========================
    // GARRISON WALKER BOT
    // ========================
    const walker = scene.add.graphics();
    const wbW = 26, wbH = 24;
    const wbCx = wbW / 2;

    // Base shadow
    walker.fillStyle(0x111827, 0.8);
    walker.fillEllipse(wbCx, 22, 16, 4);

    // Body core
    walker.fillStyle(0x4b5563, 1);
    walker.fillRoundedRect(wbCx - 7, 6, 14, 10, 3);
    walker.fillStyle(0x9ca3af, 0.8);
    walker.fillCircle(wbCx, 11, 3);

    // Turret eye
    walker.fillStyle(0xf97316, 1);
    walker.fillCircle(wbCx, 11, 1.5);

    // Legs
    walker.fillStyle(0x374151, 1);
    walker.fillRect(wbCx - 9, 14, 4, 6);
    walker.fillRect(wbCx + 5, 14, 4, 6);
    walker.fillStyle(0x1f2937, 1);
    walker.fillRect(wbCx - 10, 19, 6, 2);
    walker.fillRect(wbCx + 4, 19, 6, 2);

    // Side cannons
    walker.fillStyle(0x0f172a, 1);
    walker.fillRect(wbCx - 12, 10, 4, 2);
    walker.fillRect(wbCx + 8, 10, 4, 2);

    walker.generateTexture('garrisonDefenderWalker', wbW, wbH);
    walker.destroy();

    // ========================
    // GARRISON PLASMA HOUND
    // ========================
    const hound = scene.add.graphics();
    const hdW = 28, hdH = 20;
    const hdCx = hdW / 2;

    // Body
    hound.fillStyle(0x7c2d12, 1);
    hound.fillEllipse(hdCx, 10, 18, 10);
    hound.fillStyle(0xfb923c, 0.9);
    hound.fillEllipse(hdCx + 2, 9, 10, 6);

    // Head
    hound.fillStyle(0x9a3412, 1);
    hound.fillCircle(hdCx + 8, 8, 4);
    hound.fillStyle(0xfacc15, 1);
    hound.fillCircle(hdCx + 9, 8, 1.2);

    // Plasma spine
    hound.fillStyle(0x22d3ee, 0.9);
    hound.fillTriangle(hdCx - 6, 5, hdCx - 2, 2, hdCx, 6);
    hound.fillTriangle(hdCx - 2, 5, hdCx + 2, 2, hdCx + 4, 6);

    // Legs
    hound.fillStyle(0x78350f, 1);
    hound.fillRect(hdCx - 8, 14, 3, 4);
    hound.fillRect(hdCx - 2, 14, 3, 4);
    hound.fillRect(hdCx + 4, 14, 3, 4);

    // Tail
    hound.fillStyle(0x7c2d12, 1);
    hound.fillRect(hdCx - 12, 9, 4, 2);

    hound.generateTexture('garrisonDefenderHound', hdW, hdH);
    hound.destroy();
}
