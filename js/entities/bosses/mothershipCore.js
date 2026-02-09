// ------------------------
// Mothership Core Encounter and Behavior
// ------------------------

function initializeMothershipCore(boss) {
    if (!boss) return;
    boss.corePhase = 0;
    boss.lastPulse = 0;
    boss.anchorX = boss.anchorX ?? boss.x;
    boss.anchorY = boss.anchorY ?? boss.y;
    boss.setVelocity(0, 0);
    if (boss.body) {
        boss.body.setImmovable(true);
        boss.body.setAllowGravity(false);
    }
}

function getMothershipBreachPosition(scene) {
    const worldWidth = CONFIG.worldWidth;
    const groundLevel = scene?.groundLevel ?? CONFIG.worldHeight - 80;
    const breachX = worldWidth * 0.68;
    const breachY = groundLevel - 55;
    return { x: breachX, y: breachY };
}

function setupMothershipEncounter(scene) {
    if (!scene) return;
    const objective = gameState.mothershipObjective;
    if (!objective) return;

    objective.active = true;
    objective.bossKey = 'mothershipCore';
    objective.reinforcementTimer = 0;
    objective.phase = 0;
    objective.currentPhase = 0;
    objective.pendingPhase = null;
    objective.phaseTransitionTimer = 0;
    objective.subObjectiveProgress = {
        exteriorHardpointsDestroyed: 0,
        interiorObjectivesCleared: 0,
        coreShieldStage: objective.subObjectiveProgress?.coreShieldStage ?? 0
    };
    objective.phaseGates = {
        exteriorHardpointsRemaining: objective.phaseGates?.exteriorHardpointsRemaining ?? null,
        interiorObjectivesRemaining: objective.phaseGates?.interiorObjectivesRemaining ?? null,
        coreShieldStage: objective.phaseGates?.coreShieldStage ?? null
    };

    const breachPosition = getMothershipBreachPosition(scene);
    const spawnX = breachPosition.x;
    const spawnY = breachPosition.y;
    const boss = spawnBoss(scene, 'mothershipCore', spawnX, spawnY);
    if (boss) {
        gameState.bossActive = true;
        gameState.currentBossKey = 'mothershipCore';
        gameState.currentBossName = 'Mothership Core';
        boss.anchorX = spawnX;
        boss.anchorY = spawnY;
        boss.setVelocity(0, 0);
        if (boss.body) {
            boss.body.setImmovable(true);
            boss.body.setAllowGravity(false);
        }
        objective.bossHp = boss.hp;
        objective.bossHpMax = boss.maxHP;
    }

    showRebuildObjectiveBanner(scene, 'FINAL ASSAULT: DESTROY THE MOTHERSHIP CORE', '#38bdf8');
}

function resolveMothershipPhaseTarget(objective) {
    if (!objective) return 0;
    const gates = objective.phaseGates || {};
    let targetPhase = objective.currentPhase || 0;

    if (typeof gates.exteriorHardpointsRemaining === 'number' && gates.exteriorHardpointsRemaining <= 0) {
        targetPhase = Math.max(targetPhase, 1);
    }
    if (typeof gates.interiorObjectivesRemaining === 'number' && gates.interiorObjectivesRemaining <= 0) {
        targetPhase = Math.max(targetPhase, 2);
    }

    return targetPhase;
}

function updateMothershipPhaseState(objective, delta) {
    if (!objective) return;
    const targetPhase = resolveMothershipPhaseTarget(objective);
    const currentPhase = objective.currentPhase || 0;

    if (targetPhase === currentPhase) {
        objective.pendingPhase = null;
        objective.phaseTransitionTimer = 0;
        objective.phase = currentPhase;
        return;
    }

    if (objective.pendingPhase !== targetPhase) {
        objective.pendingPhase = targetPhase;
        objective.phaseTransitionTimer = 0;
        return;
    }

    objective.phaseTransitionTimer += delta;
    const transitionDuration = objective.phaseTransitionDuration ?? 1200;
    if (objective.phaseTransitionTimer >= transitionDuration) {
        objective.currentPhase = targetPhase;
        objective.phase = targetPhase;
        objective.pendingPhase = null;
        objective.phaseTransitionTimer = 0;
    }
}

function updateMothershipEncounter(scene, delta) {
    const objective = gameState.mothershipObjective;
    if (!objective?.active) return;

    const boss = scene.bosses?.children?.entries?.find(entry => entry.active && entry.bossType === 'mothershipCore');
    if (!boss) {
        objective.active = false;
        return;
    }

    objective.bossHp = boss.hp;
    objective.bossHpMax = boss.maxHP;
    updateMothershipPhaseState(objective, delta);
    boss.corePhase = objective.currentPhase || 0;

    objective.reinforcementTimer += delta;
    const phase = objective.currentPhase || 0;
    const interval = phase === 2 ? 2600 : phase === 1 ? 3400 : 4200;
    if (objective.reinforcementTimer >= interval) {
        objective.reinforcementTimer = 0;
        const reinforcements = ['shield', 'spawner', 'seeker', 'kamikaze', 'bomber'];
        const type = Phaser.Utils.Array.GetRandom(reinforcements);
        const spawnX = scene.cameras.main.scrollX + Math.random() * CONFIG.width;
        const spawnY = CONFIG.height * 0.2 + Math.random() * CONFIG.height * 0.4;
        spawnEnemy(scene, type, spawnX, spawnY, false);
    }
}

function handleMothershipCoreDefeat(scene) {
    const objective = gameState.mothershipObjective;
    if (objective) {
        objective.active = false;
    }
    scene.time.delayedCall(1200, () => {
        winGame(scene);
    });
}
