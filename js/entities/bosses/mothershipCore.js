// ------------------------
// Mothership Core Encounter and Behavior
// ------------------------

const MOTHERSHIP_EXTERIOR_CONFIG = {
    hardpointHp: 26,
    hardpointCount: 4,
    turretCount: 4,
    defenderCount: 8,
    spawnInterval: 2300,
    turretFireInterval: 1150,
    reinforcementInterval: 6000,
    reinforcementBatch: 3,
    reinforcementCap: 12
};

const MOTHERSHIP_INTERIOR_CONFIG = {
    conduitHp: 18,
    conduitCount: 3,
    nodeHp: 22,
    nodeCount: 3,
    spawnInterval: 2400,
    reinforcementInterval: 6200,
    reinforcementBatch: 2,
    reinforcementCap: 10
};

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

function createMothershipExteriorTarget(scene, x, y, texture, role, hp) {
    const component = createAssaultComponent(scene, x, y, texture, role, hp);
    component.mothershipRole = 'exterior';
    return component;
}

function setupMothershipExteriorObjectives(scene, objective) {
    if (!scene || !scene.assaultTargets || !objective) return;
    const breachPosition = getMothershipBreachPosition(scene);
    const baseX = breachPosition.x;
    const baseY = breachPosition.y - 40;
    const scaledHp = Math.round(MOTHERSHIP_EXTERIOR_CONFIG.hardpointHp * (gameState.spawnMultiplier || 1));

    const clampSpread = 260;
    for (let i = 0; i < MOTHERSHIP_EXTERIOR_CONFIG.hardpointCount; i++) {
        const offset = clampSpread * ((i / Math.max(1, MOTHERSHIP_EXTERIOR_CONFIG.hardpointCount - 1)) - 0.5);
        const hardpointX = wrapValue(baseX + offset, CONFIG.worldWidth);
        const hardpointY = baseY - 20 + Phaser.Math.Between(-12, 12);
        createMothershipExteriorTarget(scene, hardpointX, hardpointY, 'assaultShieldGen', 'shield', scaledHp);
    }

    const turretSpread = 320;
    for (let i = 0; i < MOTHERSHIP_EXTERIOR_CONFIG.turretCount; i++) {
        const offset = turretSpread * ((i / Math.max(1, MOTHERSHIP_EXTERIOR_CONFIG.turretCount - 1)) - 0.5);
        const turretX = wrapValue(baseX + offset, CONFIG.worldWidth);
        const turretY = baseY + 35 + Phaser.Math.Between(-10, 10);
        createMothershipExteriorTarget(scene, turretX, turretY, 'assaultTurret', 'turret', scaledHp);
    }

    objective.exteriorHardpointsRemaining = MOTHERSHIP_EXTERIOR_CONFIG.hardpointCount + MOTHERSHIP_EXTERIOR_CONFIG.turretCount;
    objective.subObjectiveTargets = {
        exteriorHardpointsTotal: objective.exteriorHardpointsRemaining,
        interiorObjectivesTotal: objective.interiorObjectivesRemaining,
        coreShieldStages: objective.coreShieldStage
    };
    objective.subObjectiveProgress = {
        exteriorHardpointsDestroyed: 0,
        interiorObjectivesCleared: 0,
        coreShieldStage: 0
    };
    objective.exteriorSpawnTimer = 0;
    objective.exteriorTurretFireTimer = 0;
    objective.exteriorReinforcementTimer = 0;

    showRebuildObjectiveBanner(scene, 'EXTERIOR DEFENSE GRID: DESTROY DOCKING CLAMPS', '#f97316');
    spawnAssaultDefenders(scene, baseX);
}

function updateMothershipExteriorObjectives(scene, objective, delta) {
    if (!scene || !objective) return;
    if (objective.exteriorHardpointsRemaining <= 0) return;

    objective.exteriorSpawnTimer += delta;
    objective.exteriorTurretFireTimer += delta;
    objective.exteriorReinforcementTimer += delta;

    if (objective.exteriorSpawnTimer >= MOTHERSHIP_EXTERIOR_CONFIG.spawnInterval) {
        objective.exteriorSpawnTimer = 0;
        const assaultMix = ['mutant', 'shield', 'spawner', 'kamikaze', 'seeker', 'turret'];
        spawnRandomEnemy(scene, assaultMix);
    }

    if (objective.exteriorReinforcementTimer >= MOTHERSHIP_EXTERIOR_CONFIG.reinforcementInterval) {
        objective.exteriorReinforcementTimer = 0;
        const currentCount = scene.garrisonDefenders?.countActive(true) || 0;
        if (currentCount < MOTHERSHIP_EXTERIOR_CONFIG.reinforcementCap) {
            const reinforcements = Math.min(
                MOTHERSHIP_EXTERIOR_CONFIG.reinforcementBatch,
                MOTHERSHIP_EXTERIOR_CONFIG.reinforcementCap - currentCount
            );
            const breachX = getMothershipBreachPosition(scene).x;
            for (let i = 0; i < reinforcements; i++) {
                const type = Phaser.Utils.Array.GetRandom(GARRISON_DEFENDER_TYPES || ['rifle']);
                const offsetX = Phaser.Math.Between(-240, 240);
                const spawnX = wrapValue(breachX + offsetX, CONFIG.worldWidth);
                const spawnY = CONFIG.worldHeight * 0.22 + Phaser.Math.Between(-20, 60);
                spawnGarrisonDefender(scene, type, spawnX, spawnY);
            }
        }
    }

    if (objective.exteriorTurretFireTimer >= MOTHERSHIP_EXTERIOR_CONFIG.turretFireInterval) {
        objective.exteriorTurretFireTimer = 0;
        if (scene.assaultTargets) {
            scene.assaultTargets.children.entries.forEach((target) => {
                if (!target.active || target.mothershipRole !== 'exterior' || target.assaultRole !== 'turret') return;
                if (target.empDisabledUntil && target.empDisabledUntil > scene.time.now) return;
                const dummy = { x: target.x, y: target.y, enemyType: 'turret' };
                shootAtPlayer(scene, dummy);
            });
        }
    }
}

function startMothershipTransition(scene, objective, options = {}) {
    if (!scene || !objective || objective.transitionActive) return;
    const {
        bannerText = 'TRANSITION IN PROGRESS',
        bannerColor = '#38bdf8',
        transitionDuration = objective.transitionDuration ?? 1200,
        fadeMs = objective.transitionFadeMs ?? 300,
        onMidTransition
    } = options;
    objective.transitionActive = true;
    objective.transitionTimer = 0;
    objective.transitionDuration = transitionDuration;
    objective.transitionFadeMs = fadeMs;
    showRebuildObjectiveBanner(scene, bannerText, bannerColor);

    const camera = scene.cameras?.main;
    if (camera) {
        camera.fadeOut(fadeMs, 0, 0, 0);
    }
    if (scene.time) {
        scene.time.delayedCall(fadeMs, () => {
            if (typeof onMidTransition === 'function') {
                onMidTransition();
            }
            if (camera) {
                camera.fadeIn(fadeMs, 0, 0, 0);
            }
        });
    } else if (typeof onMidTransition === 'function') {
        onMidTransition();
    }
}

function setupMothershipInteriorObjectives(scene, objective) {
    if (!scene || !scene.assaultTargets || !objective) return;
    const breachPosition = getMothershipBreachPosition(scene);
    const baseX = breachPosition.x;
    const baseY = breachPosition.y - 20;
    const conduitHp = Math.round(MOTHERSHIP_INTERIOR_CONFIG.conduitHp * (gameState.spawnMultiplier || 1));
    const nodeHp = Math.round(MOTHERSHIP_INTERIOR_CONFIG.nodeHp * (gameState.spawnMultiplier || 1));

    const conduitSpread = 200;
    for (let i = 0; i < MOTHERSHIP_INTERIOR_CONFIG.conduitCount; i++) {
        const offset = conduitSpread * ((i / Math.max(1, MOTHERSHIP_INTERIOR_CONFIG.conduitCount - 1)) - 0.5);
        const conduitX = wrapValue(baseX + offset, CONFIG.worldWidth);
        const conduitY = baseY - 12 + Phaser.Math.Between(-8, 8);
        const conduit = createAssaultComponent(scene, conduitX, conduitY, 'assaultShieldGen', 'shield', conduitHp);
        conduit.mothershipRole = 'interior';
    }

    const nodeSpread = 300;
    for (let i = 0; i < MOTHERSHIP_INTERIOR_CONFIG.nodeCount; i++) {
        const offset = nodeSpread * ((i / Math.max(1, MOTHERSHIP_INTERIOR_CONFIG.nodeCount - 1)) - 0.5);
        const nodeX = wrapValue(baseX + offset, CONFIG.worldWidth);
        const nodeY = baseY + 32 + Phaser.Math.Between(-6, 6);
        const node = createAssaultComponent(scene, nodeX, nodeY, 'assaultTurret', 'turret', nodeHp);
        node.mothershipRole = 'interior';
    }

    objective.interiorObjectivesRemaining = MOTHERSHIP_INTERIOR_CONFIG.conduitCount + MOTHERSHIP_INTERIOR_CONFIG.nodeCount;
    objective.subObjectiveTargets = {
        exteriorHardpointsTotal: objective.exteriorHardpointsRemaining,
        interiorObjectivesTotal: objective.interiorObjectivesRemaining,
        coreShieldStages: objective.coreShieldStage
    };
    objective.subObjectiveProgress = {
        exteriorHardpointsDestroyed: objective.subObjectiveProgress?.exteriorHardpointsDestroyed ?? 0,
        interiorObjectivesCleared: 0,
        coreShieldStage: objective.subObjectiveProgress?.coreShieldStage ?? 0
    };
    objective.exteriorSpawnTimer = 0;
    objective.exteriorReinforcementTimer = 0;
    showRebuildObjectiveBanner(scene, 'INTERIOR: DISABLE POWER CONDUITS', '#a855f7');
}

function updateMothershipInteriorObjectives(scene, objective, delta) {
    if (!scene || !objective) return;
    if (objective.interiorObjectivesRemaining <= 0) return;

    objective.exteriorSpawnTimer += delta;
    objective.exteriorReinforcementTimer += delta;

    if (objective.exteriorSpawnTimer >= MOTHERSHIP_INTERIOR_CONFIG.spawnInterval) {
        objective.exteriorSpawnTimer = 0;
        const interiorMix = ['mutant', 'seeker', 'kamikaze', 'shield'];
        spawnRandomEnemy(scene, interiorMix);
    }

    if (objective.exteriorReinforcementTimer >= MOTHERSHIP_INTERIOR_CONFIG.reinforcementInterval) {
        objective.exteriorReinforcementTimer = 0;
        const currentCount = scene.garrisonDefenders?.countActive(true) || 0;
        if (currentCount < MOTHERSHIP_INTERIOR_CONFIG.reinforcementCap) {
            const reinforcements = Math.min(
                MOTHERSHIP_INTERIOR_CONFIG.reinforcementBatch,
                MOTHERSHIP_INTERIOR_CONFIG.reinforcementCap - currentCount
            );
            const breachX = getMothershipBreachPosition(scene).x;
            for (let i = 0; i < reinforcements; i++) {
                const type = Phaser.Utils.Array.GetRandom(GARRISON_DEFENDER_TYPES || ['rifle']);
                const offsetX = Phaser.Math.Between(-200, 200);
                const spawnX = wrapValue(breachX + offsetX, CONFIG.worldWidth);
                const spawnY = CONFIG.worldHeight * 0.3 + Phaser.Math.Between(-10, 50);
                spawnGarrisonDefender(scene, type, spawnX, spawnY);
            }
        }
    }
}

function syncMothershipObjectiveProgress(objective) {
    if (!objective) return;
    const targets = objective.subObjectiveTargets || {};
    const progress = objective.subObjectiveProgress || {};
    const exteriorTotal = targets.exteriorHardpointsTotal ?? 0;
    const interiorTotal = targets.interiorObjectivesTotal ?? 0;
    const coreStages = targets.coreShieldStages ?? 0;
    progress.exteriorHardpointsDestroyed = Math.max(0, exteriorTotal - (objective.exteriorHardpointsRemaining ?? 0));
    progress.interiorObjectivesCleared = Math.max(0, interiorTotal - (objective.interiorObjectivesRemaining ?? 0));
    progress.coreShieldStage = Math.max(0, Math.min(coreStages, coreStages - (objective.coreShieldStage ?? 0)));
    objective.subObjectiveProgress = progress;
}

function updateMothershipPhaseState(objective, delta) {
    if (!objective) return;
    const exteriorCleared = (objective.exteriorHardpointsRemaining ?? 0) <= 0;
    const interiorCleared = (objective.interiorObjectivesRemaining ?? 0) <= 0;
    const coreShieldDown = (objective.coreShieldStage ?? 0) <= 0;
    const delay = objective.phaseTransitionDelay ?? 1500;
    let gateReady = false;

    if (objective.phase === 0) {
        gateReady = exteriorCleared;
    } else if (objective.phase === 1) {
        gateReady = interiorCleared;
    } else if (objective.phase === 2) {
        gateReady = coreShieldDown;
    }

    if (gateReady) {
        objective.phaseTransitionTimer += delta;
        if (objective.phaseTransitionTimer >= delay && objective.phase < 2) {
            objective.phase += 1;
            objective.phaseTransitionTimer = 0;
            return true;
        }
    } else {
        objective.phaseTransitionTimer = 0;
    }
    return false;
}

function setupMothershipEncounter(scene) {
    if (!scene) return;
    const objective = gameState.mothershipObjective;
    if (!objective) return;

    objective.active = true;
    objective.bossKey = 'mothershipCore';
    objective.reinforcementTimer = 0;
    objective.phase = 0;
    objective.phaseTransitionTimer = 0;
    objective.phaseTransitionDelay = 1500;
    objective.transitionActive = false;
    objective.transitionTimer = 0;
    objective.transitionDuration = 1200;
    objective.transitionFadeMs = 300;
    objective.exteriorHardpointsRemaining = objective.exteriorHardpointsRemaining ?? 0;
    objective.interiorObjectivesRemaining = objective.interiorObjectivesRemaining ?? 3;
    objective.coreShieldStage = objective.coreShieldStage ?? 2;
    setupMothershipExteriorObjectives(scene, objective);
    syncMothershipObjectiveProgress(objective);

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
    if (objective.transitionActive) {
        objective.transitionTimer += delta;
        if (objective.transitionTimer >= objective.transitionDuration) {
            objective.transitionActive = false;
            objective.transitionTimer = 0;
        }
    } else {
        if (objective.phase === 0) {
            updateMothershipExteriorObjectives(scene, objective, delta);
        } else if (objective.phase === 1) {
            updateMothershipInteriorObjectives(scene, objective, delta);
        }
        const phaseAdvanced = updateMothershipPhaseState(objective, delta);
        if (phaseAdvanced && objective.phase === 1) {
            startMothershipTransition(scene, objective, {
                bannerText: 'BOARDING INITIATED',
                bannerColor: '#22d3ee',
                onMidTransition: () => {
                    swapBackgroundStyle(scene, 'mothership_interior');
                    if (aegisState.active) {
                        ejectPilot(scene);
                    }
                    setupMothershipInteriorObjectives(scene, objective);
                }
            });
            screenShake(scene, 8, 260);
        } else if (phaseAdvanced && objective.phase === 2) {
            startMothershipTransition(scene, objective, {
                bannerText: 'CORE CHAMBER UNLOCKED',
                bannerColor: '#f43f5e'
            });
            screenShake(scene, 10, 320);
        }
    }
    syncMothershipObjectiveProgress(objective);
    boss.corePhase = objective.phase;

    if (objective.transitionActive) return;
    objective.reinforcementTimer += delta;
    const interval = objective.phase === 2 ? 2600 : objective.phase === 1 ? 3400 : 4200;
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
