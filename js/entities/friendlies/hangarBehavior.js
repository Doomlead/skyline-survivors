// ------------------------
// Hangar Behavior - Beacon Pulse
// ------------------------

const HANGAR_DROP_OFF_CONFIG = {
    xRange: 80,
    yRange: 70,
    botSpawnOffset: 70
};

function getHangarGroundY(scene, hangarX) {
    const groundLevel = scene?.groundLevel || CONFIG.worldHeight - 80;
    const terrainVariation = Math.sin(hangarX / 200) * 30;
    return groundLevel - terrainVariation - 12;
}

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

function isPilotInRebuildZone(scene, hangar) {
    if (!pilotState.active || !pilotState.grounded) return false;
    const player = scene?.pilot;
    if (!player || !hangar) return false;
    const zoneX = hangar.rebuildZone?.x ?? hangar.x;
    const zoneY = hangar.rebuildZone?.y ?? getHangarGroundY(scene, hangar.x);
    const dx = typeof wrappedDistance === 'function'
        ? wrappedDistance(zoneX, player.x, CONFIG.worldWidth)
        : (player.x - zoneX);
    const dy = player.y - zoneY;
    return Math.abs(dx) <= HANGAR_REBUILD_CONFIG.zoneWidth * 0.5
        && Math.abs(dy) <= HANGAR_REBUILD_CONFIG.zoneHeight * 0.5;
}

function dropOffCargo(scene, hangar) {
    const { audioManager } = scene;
    const cargoCount = window.ShipController?.cargo ?? 0;
    if (cargoCount <= 0) return;
    if (!isPlayerOverHangar(scene, hangar)) return;

    window.ShipController?.resetCargo();
    const dropOffScore = getMissionScaledReward(HUMAN_RESCUE_SCORE * HUMAN_DROP_OFF_SCORE_MULTIPLIER * cargoCount);
    gameState.score += dropOffScore;

    if (audioManager) audioManager.playSound('cargoDrop');
    const dropText = scene.add.text(
        hangar.x,
        hangar.y - 62,
        `SQUAD DEPLOYED +${dropOffScore}`,
        {
            fontSize: '16px',
            fontFamily: 'Orbitron',
            color: '#38bdf8',
            stroke: '#0f172a',
            strokeThickness: 4
        }
    ).setOrigin(0.5);
    scene.tweens.add({
        targets: dropText,
        y: hangar.y - 92,
        alpha: 0,
        duration: 1200,
        ease: 'Power2',
        onComplete: () => dropText.destroy()
    });
    createExplosion(scene, hangar.x, hangar.y - 18, 0x38bdf8);

    for (let i = 0; i < cargoCount; i++) {
        const offsetX = Phaser.Math.Between(-HANGAR_DROP_OFF_CONFIG.botSpawnOffset, HANGAR_DROP_OFF_CONFIG.botSpawnOffset);
        const spawnX = wrapValue(hangar.x + offsetX, CONFIG.worldWidth);
        const spawnY = hangar.y - 26 + Phaser.Math.Between(-8, 8);
        const operativeType = typeof pickOperativeType === 'function' ? pickOperativeType() : 'infantry';
        spawnOperative(scene, operativeType, spawnX, spawnY);
    }
}

function handleHangarRebuild(scene, hangar, delta) {
    const objective = gameState.rebuildObjective;
    if (!objective || !objective.active || !veritechState.destroyed || !pilotState.active) return;
    if (!scene || !hangar || !hangar.active) return;
    if (objective.branch !== 'hangar') return;

    if (!isPilotInRebuildZone(scene, hangar)) {
        objective.hangarRebuildTimer = 0;
        return;
    }

    objective.hangarRebuildTimer += delta;
    if (objective.hangarRebuildTimer < HANGAR_REBUILD_CONFIG.durationMs) return;

    objective.extractionX = hangar.x;
    objective.extractionY = hangar.y;
    rebuildVeritechAtExtraction(scene, objective);
    objective.active = false;
    objective.stage = null;
    objective.timer = 0;
    objective.encounterSpawned = false;
    objective.hangarRebuildTimer = 0;
    objective.shipReturned = true;
}

function updateHangars(scene, time, delta) {
    const { friendlies } = scene;
    if (!friendlies || !friendlies.children) return;

    friendlies.children.entries.forEach((friendly) => {
        if (!friendly || !friendly.active || !friendly.isHangar) return;
        const groundY = getHangarGroundY(scene, friendly.x);
        if (friendly.rebuildZone) {
            const isPilotActive = pilotState.active && veritechState.destroyed;
            const isRebuildActive = isPilotActive
                && gameState.rebuildObjective?.active
                && gameState.rebuildObjective?.branch === 'hangar';
            const pulse = 0.8 + Math.sin(time * 0.006 + friendly.blinkOffset) * 0.2;
            friendly.rebuildZone.setPosition(friendly.x, groundY);
            friendly.rebuildZone.setVisible(isPilotActive);
            friendly.rebuildZone.setAlpha(isRebuildActive ? pulse : 0.6);
            friendly.rebuildZone.setScale(isRebuildActive ? 1.05 : 1);
            friendly.rebuildZone.setTint(isRebuildActive ? 0x22d3ee : 0x38bdf8);
        }
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
        handleHangarRebuild(scene, friendly, delta);
    });
}
