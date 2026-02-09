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
    pulseBaseAlpha: 0.75,
    pulseRange: 0.2
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
    const { audioManager } = scene;
    const cargoCount = window.ShipController?.cargo ?? 0;
    if (cargoCount <= 0) return;
    if (!isPlayerOverHangar(scene, hangar)) return;

    window.ShipController?.resetCargo();
    registerComboEvent(Math.min(3, cargoCount));
    const dropOffScore = getCombatScaledReward(HUMAN_RESCUE_SCORE * HUMAN_DROP_OFF_SCORE_MULTIPLIER * cargoCount);
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

function isPlayerOnLandingZone(scene, landingZone) {
    const player = getActivePlayer(scene);
    if (!player || !landingZone) return false;
    const dx = typeof wrappedDistance === 'function'
        ? wrappedDistance(landingZone.x, player.x, CONFIG.worldWidth)
        : (player.x - landingZone.x);
    const zoneCenterY = landingZone.y - landingZone.displayHeight * 0.5;
    const dy = player.y - zoneCenterY;
    const xRange = landingZone.displayWidth * 0.35;
    const yRange = landingZone.displayHeight * 0.35;
    return Math.abs(dx) <= xRange && Math.abs(dy) <= yRange;
}

function handleHangarRebuild(scene, hangar, delta) {
    const objective = gameState.rebuildObjective;
    if (!objective || !objective.active || !aegisState.destroyed || !pilotState.active) return;
    if (gameState.mode === 'mothership' && (gameState.mothershipObjective?.phase ?? 0) < 2) return;
    if (objective.stage !== 'hangar_rebuild') return;
    if (!scene || !hangar || !hangar.active) return;
    const landingZone = hangar.landingZone;
    if (!landingZone || !landingZone.active) return;

    if (!isPlayerOnLandingZone(scene, landingZone)) {
        return;
    }

    objective.hangarRebuildTimer += delta;
    if (objective.hangarRebuildTimer < HANGAR_REBUILD_CONFIG.durationMs) return;

    objective.extractionX = hangar.x;
    objective.extractionY = hangar.y;
    rebuildAegisAtExtraction(scene, objective);
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
        const pulse = 0.65 + Math.sin(time * 0.004 + friendly.blinkOffset) * 0.25;
        const tintColor = Phaser.Display.Color.Interpolate.ColorWithColor(
            { r: 34, g: 197, b: 94 },
            { r: 14, g: 165, b: 233 },
            100,
            Math.floor(pulse * 100)
        );
        friendly.setTint(Phaser.Display.Color.GetColor(tintColor.r, tintColor.g, tintColor.b));
        friendly.y = friendly.baseY + Math.sin(time * 0.002 + friendly.blinkOffset) * 1.5;
        if (friendly.landingZone && friendly.landingZone.active) {
            const landingZone = friendly.landingZone;
            landingZone.x = friendly.x;
            const rebuildPulse = Math.sin(time * 0.005 + landingZone.blinkOffset);
            const targetAlpha = HANGAR_REBUILD_CONFIG.pulseBaseAlpha + rebuildPulse * HANGAR_REBUILD_CONFIG.pulseRange;
            const shouldPulse = gameState.rebuildObjective?.active && aegisState.destroyed && pilotState.active;
            landingZone.setAlpha(shouldPulse ? targetAlpha : 0.85);
        }
        dropOffCargo(scene, friendly);
        handleHangarRebuild(scene, friendly, delta);
    });
}
