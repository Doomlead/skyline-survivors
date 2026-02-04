// ------------------------
// Hangar Behavior - Beacon Pulse
// ------------------------

const HANGAR_DROP_OFF_CONFIG = {
    xRange: 80,
    yRange: 70,
    botSpawnOffset: 70,
    indicatorYOffset: 18
};
const HANGAR_REBUILD_CONFIG = {
    durationMs: 30000,
    indicatorPulseSpeed: 0.004,
    indicatorAlpha: 0.75,
    xRange: 70,
    yRange: 24
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
    if (!scene || !hangar || !scene.pilot || !pilotState.active) return false;
    const dx = typeof wrappedDistance === 'function'
        ? wrappedDistance(hangar.x, scene.pilot.x, CONFIG.worldWidth)
        : (scene.pilot.x - hangar.x);
    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    const terrainVariation = Math.sin(hangar.x / 200) * 30;
    const groundY = groundLevel - terrainVariation - 12;
    const dy = scene.pilot.y - groundY;
    return Math.abs(dx) <= HANGAR_REBUILD_CONFIG.xRange
        && Math.abs(dy) <= HANGAR_REBUILD_CONFIG.yRange;
}

function shouldShowHangarRebuildIndicator(scene, hangar, objective) {
    if (!objective || !objective.active) return false;
    if (!scene || !hangar || !hangar.active) return false;
    if (!veritechState.destroyed || !pilotState.active) return false;
    return true;
}

function ensureHangarRebuildIndicator(scene, hangar) {
    if (hangar.rebuildIndicator && hangar.rebuildText) return;
    const ring = scene.add.graphics();
    ring.setDepth(FG_DEPTH_BASE + 2);

    const text = scene.add.text(
        hangar.x,
        hangar.y - 110,
        'STAND UNDER HANGAR\nHOLD TO REBUILD',
        {
            fontSize: '14px',
            fontFamily: 'Orbitron',
            color: '#e2e8f0',
            align: 'center',
            stroke: '#0f172a',
            strokeThickness: 4
        }
    ).setOrigin(0.5).setDepth(FG_DEPTH_BASE + 3);

    hangar.rebuildIndicator = ring;
    hangar.rebuildText = text;
}

function updateHangarRebuildIndicator(scene, hangar, objective, time) {
    if (!shouldShowHangarRebuildIndicator(scene, hangar, objective)) {
        if (hangar.rebuildIndicator) hangar.rebuildIndicator.setVisible(false);
        if (hangar.rebuildText) hangar.rebuildText.setVisible(false);
        return;
    }

    ensureHangarRebuildIndicator(scene, hangar);
    const ring = hangar.rebuildIndicator;
    const text = hangar.rebuildText;
    if (!ring || !text) return;

    ring.setVisible(true);
    text.setVisible(true);

    const pulse = 0.5 + Math.sin(time * HANGAR_REBUILD_CONFIG.indicatorPulseSpeed) * 0.5;
    const alpha = HANGAR_REBUILD_CONFIG.indicatorAlpha * (0.6 + pulse * 0.4);
    ring.clear();
    ring.lineStyle(2, 0x38bdf8, alpha);
    ring.strokeEllipse(
        hangar.x,
        hangar.y - HANGAR_DROP_OFF_CONFIG.indicatorYOffset,
        HANGAR_REBUILD_CONFIG.xRange * 1.9,
        HANGAR_REBUILD_CONFIG.yRange * 3
    );

    text.setPosition(hangar.x, hangar.y - 110);

    const isStanding = isPilotUnderHangar(scene, hangar);
    if (isStanding) {
        const remainingMs = Math.max(0, HANGAR_REBUILD_CONFIG.durationMs - (objective?.hangarRebuildTimer || 0));
        const seconds = Math.ceil(remainingMs / 1000);
        text.setText(`REBUILDING VERITECH\nHOLD ${seconds}s`);
        text.setColor('#38bdf8');
    } else {
        text.setText('STAND UNDER HANGAR\nHOLD TO REBUILD');
        text.setColor('#e2e8f0');
    }
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

function updateHangars(scene, time, delta) {
    const { friendlies } = scene;
    if (!friendlies || !friendlies.children) return;

    friendlies.children.entries.forEach((friendly) => {
        if (!friendly || !friendly.active || !friendly.isHangar) return;
        updateHangarRebuildIndicator(scene, friendly, gameState.rebuildObjective, time);
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
