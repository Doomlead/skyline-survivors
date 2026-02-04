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
    xRange: 70,
    yRange: 24,
    yOffset: 18
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

function isPilotInRebuildZone(scene, hangar) {
    if (!scene || !hangar || !pilotState.active || !scene.pilot) return false;
    if (!pilotState.grounded) return false;
    const pilot = scene.pilot;
    const dx = typeof wrappedDistance === 'function'
        ? wrappedDistance(hangar.x, pilot.x, CONFIG.worldWidth)
        : (pilot.x - hangar.x);
    const groundY = hangar.baseY ?? hangar.y;
    const targetY = groundY - HANGAR_REBUILD_CONFIG.yOffset;
    const dy = pilot.y - targetY;
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

function updateHangarRebuildIndicator(scene, hangar, time) {
    if (!scene || !hangar) return;
    if (!hangar.rebuildIndicator) {
        hangar.rebuildIndicator = scene.add.graphics();
        hangar.rebuildIndicator.setDepth(FG_DEPTH_BASE + 2);
    }
    const indicator = hangar.rebuildIndicator;
    const pulse = 0.4 + Math.sin(time * 0.004) * 0.35;
    const groundY = (hangar.baseY ?? hangar.y) - 6;
    indicator.clear();
    indicator.lineStyle(2, 0x22d3ee, 0.4 + pulse);
    indicator.fillStyle(0x0ea5e9, 0.15 + pulse * 0.2);
    indicator.strokeEllipse(hangar.x, groundY, 110, 24);
    indicator.fillEllipse(hangar.x, groundY, 110, 24);

    if (!hangar.rebuildLabel) {
        hangar.rebuildLabel = scene.add.text(hangar.x, hangar.y - 80, 'REBUILD ZONE', {
            fontSize: '12px',
            fontFamily: 'Orbitron',
            color: '#67e8f9',
            stroke: '#0f172a',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(FG_DEPTH_BASE + 3);
    }
    hangar.rebuildLabel.setPosition(hangar.x, hangar.y - 80);
    hangar.rebuildLabel.setAlpha(0.6 + pulse * 0.4);
}

function clearHangarRebuildIndicator(hangar) {
    if (hangar.rebuildIndicator) {
        hangar.rebuildIndicator.destroy();
        hangar.rebuildIndicator = null;
    }
    if (hangar.rebuildLabel) {
        hangar.rebuildLabel.destroy();
        hangar.rebuildLabel = null;
    }
}

function handleHangarRebuild(scene, hangar, delta) {
    const objective = gameState.rebuildObjective;
    if (!objective || !objective.active || !veritechState.destroyed || !pilotState.active) return;
    if (!scene || !hangar || !hangar.active) return;

    if (!isPilotInRebuildZone(scene, hangar)) {
        objective.hangarRebuildTimer = 0;
        objective.stage = 'reach_hangar';
        return;
    }

    objective.stage = 'hold_hangar';
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
        if (gameState.rebuildObjective?.active && veritechState.destroyed && pilotState.active) {
            updateHangarRebuildIndicator(scene, friendly, time);
        } else {
            clearHangarRebuildIndicator(friendly);
        }
    });
}
