// ------------------------
// Hangar Behavior - Beacon Pulse
// ------------------------

const HANGAR_DROP_OFF_CONFIG = {
    xRange: 80,
    yRange: 70,
    botSpawnOffset: 70
};

function isPlayerOverHangar(scene, hangar) {
    const player = getActivePlayer(scene);
    if (!player || !hangar) return false;
    const dx = typeof wrappedDistance === 'function'
        ? wrappedDistance(hangar.x, player.x, CONFIG.worldWidth)
        : (player.x - hangar.x);
    const dropOffY = hangar.y - 32;
    const dy = player.y - dropOffY;
    return Math.abs(dx) <= HANGAR_DROP_OFF_CONFIG.xRange
        && Math.abs(dy) <= HANGAR_DROP_OFF_CONFIG.yRange;
}

function dropOffCargo(scene, hangar) {
    const cargoCount = window.ShipController?.cargo ?? 0;
    if (cargoCount <= 0) return;
    if (!isPlayerOverHangar(scene, hangar)) return;

    window.ShipController?.resetCargo();

    for (let i = 0; i < cargoCount; i++) {
        const offsetX = Phaser.Math.Between(-HANGAR_DROP_OFF_CONFIG.botSpawnOffset, HANGAR_DROP_OFF_CONFIG.botSpawnOffset);
        const spawnX = wrapValue(hangar.x + offsetX, CONFIG.worldWidth);
        const spawnY = hangar.y - 26 + Phaser.Math.Between(-8, 8);
        const operativeType = typeof pickOperativeType === 'function' ? pickOperativeType() : 'infantry';
        spawnOperative(scene, operativeType, spawnX, spawnY);
    }
}

function updateHangars(scene, time) {
    const { friendlies } = scene;
    if (!friendlies || !friendlies.children) return;

    friendlies.children.entries.forEach((friendly) => {
        if (!friendly || !friendly.active || !friendly.isHangar) return;
        const pulse = 0.65 + Math.sin(time * 0.004 + friendly.blinkOffset) * 0.25;
        const tintColor = Phaser.Display.Color.Interpolate.ColorWithColor(
            { r: 34, g: 197, b: 94 },
            { r: 14, g: 165, b: 233 },
            100,
            Math.floor(pulse * 100)
        );
        friendly.setTint(Phaser.Display.Color.GetColor(tintColor.r, tintColor.g, tintColor.b));
        friendly.y = friendly.baseY + Math.sin(time * 0.002 + friendly.blinkOffset) * 1.5;
        dropOffCargo(scene, friendly);
    });
}
