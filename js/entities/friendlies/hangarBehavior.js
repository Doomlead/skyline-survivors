// ------------------------
// Hangar Behavior - Beacon Pulse
// ------------------------

const HANGAR_DROP_OFF_CONFIG = {
    xRange: 80,
    yRange: 70,
    botSpawnOffset: 70
};
const HANGAR_REBUILD_CONFIG = {
    durationMs: 30000,
    xRange: 90,
    yRange: 50
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

function isPilotUnderHangar(scene, hangar) {
    if (!pilotState.active || !scene?.pilot || !hangar) return false;
    const dx = typeof wrappedDistance === 'function'
        ? wrappedDistance(hangar.x, scene.pilot.x, CONFIG.worldWidth)
        : (scene.pilot.x - hangar.x);
    const groundY = typeof getHangarGroundY === 'function' ? getHangarGroundY(scene, hangar.x) : hangar.y;
    const dy = scene.pilot.y - groundY;
    return Math.abs(dx) <= HANGAR_REBUILD_CONFIG.xRange
        && Math.abs(dy) <= HANGAR_REBUILD_CONFIG.yRange;
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

    if (!isPilotUnderHangar(scene, hangar)) {
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

function updateHangarBeacon(scene, hangar, time) {
    if (!hangar?.beaconPad || !hangar?.beaconBeam || !hangar?.beaconLabel) return;
    const groundY = typeof getHangarGroundY === 'function' ? getHangarGroundY(scene, hangar.x) : hangar.y;
    const beamHeight = Math.max(40, hangar.y - groundY - 12);
    const rebuildActive = gameState.rebuildObjective?.active && veritechState.destroyed && pilotState.active;
    const pulse = 0.55 + Math.sin(time * 0.004 + hangar.blinkOffset) * 0.25;
    const alpha = rebuildActive ? 0.7 + pulse * 0.3 : 0.25 + pulse * 0.1;

    hangar.beaconPad.setPosition(hangar.x, groundY);
    hangar.beaconPad.setAlpha(alpha);
    hangar.beaconBeam.setPosition(hangar.x, hangar.y - beamHeight / 2);
    hangar.beaconBeam.setSize(14, beamHeight);
    hangar.beaconBeam.setAlpha(alpha * 0.6);
    hangar.beaconLabel.setPosition(hangar.x, groundY - 16);
    hangar.beaconLabel.setText(rebuildActive ? 'REBUILD ZONE' : 'HANGAR DROP ZONE');
    hangar.beaconLabel.setAlpha(Math.min(1, alpha + 0.2));
}

function updateHangars(scene, time, delta) {
    const { friendlies } = scene;
    if (!friendlies || !friendlies.children) return;

    friendlies.children.entries.forEach((friendly) => {
        if (!friendly || !friendly.active || !friendly.isHangar) return;
        const groundY = typeof getHangarGroundY === 'function' ? getHangarGroundY(scene, friendly.x) : friendly.baseY;
        const groundOffset = Number.isFinite(friendly.groundOffset) ? friendly.groundOffset : 0;
        friendly.baseY = groundY + groundOffset;
        const pulse = 0.65 + Math.sin(time * 0.004 + friendly.blinkOffset) * 0.25;
        const tintColor = Phaser.Display.Color.Interpolate.ColorWithColor(
            { r: 34, g: 197, b: 94 },
            { r: 14, g: 165, b: 233 },
            100,
            Math.floor(pulse * 100)
        );
        friendly.setTint(Phaser.Display.Color.GetColor(tintColor.r, tintColor.g, tintColor.b));
        friendly.y = friendly.baseY + Math.sin(time * 0.002 + friendly.blinkOffset) * 1.5;
        updateHangarBeacon(scene, friendly, time);
        dropOffCargo(scene, friendly);
        handleHangarRebuild(scene, friendly, delta);
    });
}
