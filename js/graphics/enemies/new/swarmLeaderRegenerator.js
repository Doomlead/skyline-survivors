// ------------------------
// Enemy Graphics - New (Swarm Leader, Regenerator)
// ------------------------

function createSwarmLeaderGraphics(scene) {
    // ========================
    // SWARM LEADER - Buffs Nearby Enemies
    // ========================
    const swarmLeaderGraphics = scene.add.graphics();
    const slw = 28, slh = 28;
    const slcx = slw / 2, slcy = slh / 2;

    // Command aura outer
    swarmLeaderGraphics.fillStyle(0x6600ff, 0.08);
    swarmLeaderGraphics.fillCircle(slcx, slcy, 14);

    // Command aura middle
    swarmLeaderGraphics.lineStyle(2, 0x6600ff, 0.2);
    swarmLeaderGraphics.strokeCircle(slcx, slcy, 13);

    // Command aura inner
    swarmLeaderGraphics.lineStyle(1, 0xaa44ff, 0.3);
    swarmLeaderGraphics.strokeCircle(slcx, slcy, 11);

    // Crown spikes
    // Left spike
    swarmLeaderGraphics.fillStyle(0xcc9900, 1);
    swarmLeaderGraphics.beginPath();
    swarmLeaderGraphics.moveTo(slcx - 6, slcy - 6);
    swarmLeaderGraphics.lineTo(slcx - 4, slcy - 12);
    swarmLeaderGraphics.lineTo(slcx - 2, slcy - 6);
    swarmLeaderGraphics.closePath();
    swarmLeaderGraphics.fillPath();
    swarmLeaderGraphics.fillStyle(0xffcc00, 1);
    swarmLeaderGraphics.beginPath();
    swarmLeaderGraphics.moveTo(slcx - 5.5, slcy - 7);
    swarmLeaderGraphics.lineTo(slcx - 4, slcy - 11);
    swarmLeaderGraphics.lineTo(slcx - 3, slcy - 7);
    swarmLeaderGraphics.closePath();
    swarmLeaderGraphics.fillPath();

    // Center spike
    swarmLeaderGraphics.fillStyle(0xcc9900, 1);
    swarmLeaderGraphics.beginPath();
    swarmLeaderGraphics.moveTo(slcx - 2, slcy - 6);
    swarmLeaderGraphics.lineTo(slcx, slcy - 14);
    swarmLeaderGraphics.lineTo(slcx + 2, slcy - 6);
    swarmLeaderGraphics.closePath();
    swarmLeaderGraphics.fillPath();
    swarmLeaderGraphics.fillStyle(0xffcc00, 1);
    swarmLeaderGraphics.beginPath();
    swarmLeaderGraphics.moveTo(slcx - 1.5, slcy - 7);
    swarmLeaderGraphics.lineTo(slcx, slcy - 13);
    swarmLeaderGraphics.lineTo(slcx + 1.5, slcy - 7);
    swarmLeaderGraphics.closePath();
    swarmLeaderGraphics.fillPath();

    // Right spike
    swarmLeaderGraphics.fillStyle(0xcc9900, 1);
    swarmLeaderGraphics.beginPath();
    swarmLeaderGraphics.moveTo(slcx + 2, slcy - 6);
    swarmLeaderGraphics.lineTo(slcx + 4, slcy - 12);
    swarmLeaderGraphics.lineTo(slcx + 6, slcy - 6);
    swarmLeaderGraphics.closePath();
    swarmLeaderGraphics.fillPath();
    swarmLeaderGraphics.fillStyle(0xffcc00, 1);
    swarmLeaderGraphics.beginPath();
    swarmLeaderGraphics.moveTo(slcx + 2.5, slcy - 7);
    swarmLeaderGraphics.lineTo(slcx + 4, slcy - 11);
    swarmLeaderGraphics.lineTo(slcx + 5.5, slcy - 7);
    swarmLeaderGraphics.closePath();
    swarmLeaderGraphics.fillPath();

    // Crown gems
    swarmLeaderGraphics.fillStyle(0xff0000, 1);
    swarmLeaderGraphics.fillCircle(slcx - 4, slcy - 10, 1);
    swarmLeaderGraphics.fillCircle(slcx, slcy - 12, 1.2);
    swarmLeaderGraphics.fillCircle(slcx + 4, slcy - 10, 1);

    // Main body shadow
    swarmLeaderGraphics.fillStyle(0x4400aa, 1);
    swarmLeaderGraphics.fillEllipse(slcx, slcy + 2, 18, 15);

    // Main body
    swarmLeaderGraphics.fillStyle(0x6600ff, 1);
    swarmLeaderGraphics.fillEllipse(slcx, slcy + 1, 17, 14);

    // Body highlight
    swarmLeaderGraphics.fillStyle(0x7722ff, 1);
    swarmLeaderGraphics.fillEllipse(slcx - 1, slcy, 13, 10);

    // Body shine
    swarmLeaderGraphics.fillStyle(0x9944ff, 0.6);
    swarmLeaderGraphics.fillEllipse(slcx - 2, slcy - 2, 8, 6);

    // Inner body
    swarmLeaderGraphics.fillStyle(0x8833ff, 1);
    swarmLeaderGraphics.fillEllipse(slcx, slcy + 1, 12, 10);

    // Command eye socket
    swarmLeaderGraphics.fillStyle(0x330066, 1);
    swarmLeaderGraphics.fillCircle(slcx, slcy, 4);

    // Eye white
    swarmLeaderGraphics.fillStyle(0xffffff, 1);
    swarmLeaderGraphics.fillCircle(slcx, slcy, 3.5);

    // Eye iris
    swarmLeaderGraphics.fillStyle(0xffcc00, 1);
    swarmLeaderGraphics.fillCircle(slcx, slcy, 2.5);

    // Eye inner
    swarmLeaderGraphics.fillStyle(0xffaa00, 1);
    swarmLeaderGraphics.fillCircle(slcx, slcy, 1.8);

    // Pupil
    swarmLeaderGraphics.fillStyle(0x000000, 1);
    swarmLeaderGraphics.fillCircle(slcx, slcy, 1);

    // Eye highlight
    swarmLeaderGraphics.fillStyle(0xffffff, 0.9);
    swarmLeaderGraphics.fillCircle(slcx - 1, slcy - 1, 0.7);

    // Buff emanation points
    // Left
    swarmLeaderGraphics.fillStyle(0xffff00, 0.4);
    swarmLeaderGraphics.fillCircle(slcx - 8, slcy + 1, 3);
    swarmLeaderGraphics.fillStyle(0xffff00, 1);
    swarmLeaderGraphics.fillCircle(slcx - 8, slcy + 1, 2);
    swarmLeaderGraphics.fillStyle(0xffffaa, 1);
    swarmLeaderGraphics.fillCircle(slcx - 8, slcy + 1, 1);

    // Right
    swarmLeaderGraphics.fillStyle(0xffff00, 0.4);
    swarmLeaderGraphics.fillCircle(slcx + 8, slcy + 1, 3);
    swarmLeaderGraphics.fillStyle(0xffff00, 1);
    swarmLeaderGraphics.fillCircle(slcx + 8, slcy + 1, 2);
    swarmLeaderGraphics.fillStyle(0xffffaa, 1);
    swarmLeaderGraphics.fillCircle(slcx + 8, slcy + 1, 1);

    // Bottom
    swarmLeaderGraphics.fillStyle(0xffff00, 0.4);
    swarmLeaderGraphics.fillCircle(slcx, slcy + 9, 3);
    swarmLeaderGraphics.fillStyle(0xffff00, 1);
    swarmLeaderGraphics.fillCircle(slcx, slcy + 9, 2);
    swarmLeaderGraphics.fillStyle(0xffffaa, 1);
    swarmLeaderGraphics.fillCircle(slcx, slcy + 9, 1);

    // Royal markings
    swarmLeaderGraphics.lineStyle(1, 0x4400aa, 0.6);
    swarmLeaderGraphics.beginPath();
    swarmLeaderGraphics.moveTo(slcx - 5, slcy + 3);
    swarmLeaderGraphics.lineTo(slcx - 8, slcy + 1);
    swarmLeaderGraphics.strokePath();
    swarmLeaderGraphics.beginPath();
    swarmLeaderGraphics.moveTo(slcx + 5, slcy + 3);
    swarmLeaderGraphics.lineTo(slcx + 8, slcy + 1);
    swarmLeaderGraphics.strokePath();
    swarmLeaderGraphics.beginPath();
    swarmLeaderGraphics.moveTo(slcx, slcy + 5);
    swarmLeaderGraphics.lineTo(slcx, slcy + 9);
    swarmLeaderGraphics.strokePath();

    // Body edge
    swarmLeaderGraphics.lineStyle(1, 0x330088, 0.7);
    swarmLeaderGraphics.strokeEllipse(slcx, slcy + 1, 16, 13);

    swarmLeaderGraphics.generateTexture('swarmLeader', slw, slh);
    swarmLeaderGraphics.destroy();

}

function createRegeneratorGraphics(scene) {
    // ========================
    // REGENERATOR - Self-healing Enemy
    // ========================
    const regeneratorGraphics = scene.add.graphics();
    const rgw = 28, rgh = 28;
    const rgcx = rgw / 2, rgcy = rgh / 2;

    // Healing aura outer
    regeneratorGraphics.fillStyle(0x00ff44, 0.08);
    regeneratorGraphics.fillCircle(rgcx, rgcy, 14);

    // Healing aura middle
    regeneratorGraphics.fillStyle(0x00ff66, 0.12);
    regeneratorGraphics.fillCircle(rgcx, rgcy, 12);

    // Healing particles floating
    regeneratorGraphics.fillStyle(0xaaffaa, 0.8);
    regeneratorGraphics.fillCircle(rgcx - 8, rgcy - 8, 1.2);
    regeneratorGraphics.fillCircle(rgcx + 9, rgcy - 6, 1);
    regeneratorGraphics.fillCircle(rgcx - 10, rgcy + 4, 1.3);
    regeneratorGraphics.fillCircle(rgcx + 8, rgcy + 7, 1.1);
    regeneratorGraphics.fillCircle(rgcx + 2, rgcy - 10, 0.9);
    regeneratorGraphics.fillCircle(rgcx - 4, rgcy + 10, 1);

    // Outer membrane
    regeneratorGraphics.fillStyle(0x006622, 1);
    regeneratorGraphics.fillEllipse(rgcx, rgcy, 22, 20);

    // Main body
    regeneratorGraphics.fillStyle(0x00aa44, 1);
    regeneratorGraphics.fillEllipse(rgcx, rgcy, 20, 18);

    // Body highlight
    regeneratorGraphics.fillStyle(0x00cc55, 1);
    regeneratorGraphics.fillEllipse(rgcx - 2, rgcy - 2, 14, 12);

    // Body shine
    regeneratorGraphics.fillStyle(0x00ee66, 0.5);
    regeneratorGraphics.fillEllipse(rgcx - 3, rgcy - 4, 8, 6);

    // Regenerating tissue patches
    regeneratorGraphics.fillStyle(0x00cc55, 0.8);
    regeneratorGraphics.fillEllipse(rgcx - 5, rgcy - 2, 5, 7);
    regeneratorGraphics.fillEllipse(rgcx + 5, rgcy - 1, 5, 6);
    regeneratorGraphics.fillEllipse(rgcx, rgcy + 5, 7, 4);

    // Tissue patch highlights
    regeneratorGraphics.fillStyle(0x44ff88, 0.6);
    regeneratorGraphics.fillEllipse(rgcx - 5.5, rgcy - 3, 3, 4);
    regeneratorGraphics.fillEllipse(rgcx + 4.5, rgcy - 2, 3, 4);
    regeneratorGraphics.fillEllipse(rgcx - 1, rgcy + 4.5, 4, 2.5);

    // Core nucleus ring
    regeneratorGraphics.lineStyle(1, 0x006633, 0.8);
    regeneratorGraphics.strokeCircle(rgcx, rgcy, 5);

    // Core nucleus body
    regeneratorGraphics.fillStyle(0x00aa44, 1);
    regeneratorGraphics.fillCircle(rgcx, rgcy, 4.5);

    regeneratorGraphics.fillStyle(0x00ff66, 1);
    regeneratorGraphics.fillCircle(rgcx, rgcy, 3.5);

    // Nucleus highlight
    regeneratorGraphics.fillStyle(0x44ff88, 1);
    regeneratorGraphics.fillCircle(rgcx - 0.5, rgcy - 0.5, 2.5);

    // Central core
    regeneratorGraphics.fillStyle(0x006633, 1);
    regeneratorGraphics.fillCircle(rgcx, rgcy, 2);

    regeneratorGraphics.fillStyle(0xffffff, 1);
    regeneratorGraphics.fillCircle(rgcx, rgcy, 1.5);

    regeneratorGraphics.fillStyle(0x00ff00, 1);
    regeneratorGraphics.fillCircle(rgcx, rgcy, 1);

    // Core highlight
    regeneratorGraphics.fillStyle(0xaaffaa, 0.9);
    regeneratorGraphics.fillCircle(rgcx - 0.4, rgcy - 0.4, 0.4);

    // Cell division lines (healing pattern)
    regeneratorGraphics.lineStyle(1, 0x008833, 0.4);
    regeneratorGraphics.beginPath();
    regeneratorGraphics.moveTo(rgcx, rgcy - 8);
    regeneratorGraphics.lineTo(rgcx, rgcy + 8);
    regeneratorGraphics.strokePath();
    regeneratorGraphics.beginPath();
    regeneratorGraphics.moveTo(rgcx - 8, rgcy);
    regeneratorGraphics.lineTo(rgcx + 8, rgcy);
    regeneratorGraphics.strokePath();

    // Healing energy pulses
    regeneratorGraphics.lineStyle(1, 0x66ff88, 0.3);
    regeneratorGraphics.strokeCircle(rgcx, rgcy, 7);
    regeneratorGraphics.strokeCircle(rgcx, rgcy, 9);

    // Outer membrane edge
    regeneratorGraphics.lineStyle(1, 0x005522, 0.8);
    regeneratorGraphics.strokeEllipse(rgcx, rgcy, 20, 18);

    // Healing sparkles
    regeneratorGraphics.fillStyle(0xffffff, 0.9);
    regeneratorGraphics.fillCircle(rgcx - 6, rgcy - 5, 0.8);
    regeneratorGraphics.fillCircle(rgcx + 7, rgcy - 3, 0.7);
    regeneratorGraphics.fillCircle(rgcx + 4, rgcy + 6, 0.6);
    regeneratorGraphics.fillCircle(rgcx - 5, rgcy + 5, 0.7);

    regeneratorGraphics.generateTexture('regenerator', rgw, rgh);
    regeneratorGraphics.destroy();
}
