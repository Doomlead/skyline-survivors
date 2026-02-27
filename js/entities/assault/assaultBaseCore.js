// ------------------------
// File: js/entities/assault/assaultBaseCore.js
// ------------------------

// This file is unchanged - it handles the assault mission structure,
// not boss movement/attack AI.

const ASSAULT_BASE_CONFIG = {
    baseHp: 70,
    shieldGeneratorHp: 18,
    turretHp: 16,
    shieldGeneratorCount: 2,
    turretCount: 5,
    defenderCount: 6,
    spawnInterval: 2200,
    turretFireInterval: 1300,
    reinforcementInterval: 6800,
    reinforcementBatch: 2,
    reinforcementCap: 10,
    shieldStages: 3,
    damageWindowMs: 4200,
    intermissionMs: 1600
};

const ASSAULT_BASE_TEXTURES = [
    'assaultBaseRaider',
    'assaultBaseCarrier',
    'assaultBaseNova',
    'assaultBaseSiege',
    'assaultBaseDreadnought'
];

const ASSAULT_INTERIOR_CONFIG = {
    transitionDelayMs: 1200,
    powerConduitCount: 6,
    securityNodeCount: 4,
    powerConduitHp: 12,
    securityNodeHp: 18,
    coreChamberHp: 120,
    reinforcementInterval: 4200,
    reinforcementBatch: 2,
    interiorEnemyTypes: ['seeker', 'kamikaze', 'shield', 'bomber']
};

const ASSAULT_INTERIOR_STYLE_BY_BASE = {
    assaultBaseRaider: 'raider_interior',
    assaultBaseCarrier: 'carrier_interior',
    assaultBaseNova: 'nova_interior',
    assaultBaseSiege: 'siege_interior',
    assaultBaseDreadnought: 'dreadnought_interior'
};

// Returns the assault base texture variant key based on objective state or random selection.
function getAssaultBaseTextureKey(objective) {
    if (objective?.baseVariant && ASSAULT_BASE_TEXTURES.includes(objective.baseVariant)) {
        return objective.baseVariant;
    }
    return Phaser.Utils.Array.GetRandom(ASSAULT_BASE_TEXTURES);
}

// Creates a static assault objective component (base/turret/shield) with role metadata and HP.
function createAssaultComponent(scene, x, y, texture, role, hp) {
    const component = scene.assaultTargets.create(x, y, texture);
    component.setDepth(FG_DEPTH_BASE + 2);
    component.setImmovable(true);
    component.body.setAllowGravity(false);
    component.body.setVelocity(0, 0);
    component.assaultRole = role;
    component.hp = hp;
    component.maxHp = hp;
    component.nextShot = Phaser.Math.Between(600, 1200);
    return component;
}

// Returns whether active assault shields are currently blocking direct base damage.
function isAssaultShieldBlocking(scene) {
    const objective = gameState.assaultObjective;
    if (!objective || objective.shieldsRemaining <= 0) return false;
    const { assaultTargets } = scene;
    if (!assaultTargets) return true;
    const now = scene.time?.now || 0;
    let blocking = false;
    assaultTargets.children.entries.forEach((target) => {
        if (!target || !target.active || target.assaultRole !== 'shield') return;
        if (target.empDisabledUntil && target.empDisabledUntil > now) return;
        blocking = true;
    });
    return blocking;
}

// Spawns shield generator components for the current assault objective shield stage.
function spawnAssaultShieldGenerators(scene, objective) {
    const baseX = objective?.baseX || CONFIG.worldWidth * 0.5;
    const base = scene.assaultBase;
    const baseY = base?.y || (CONFIG.worldHeight * 0.6);
    const shieldOffset = 120;
    objective.shieldsRemaining = ASSAULT_BASE_CONFIG.shieldGeneratorCount;
    for (let i = 0; i < ASSAULT_BASE_CONFIG.shieldGeneratorCount; i++) {
        const direction = i % 2 === 0 ? -1 : 1;
        const shieldX = wrapValue(baseX + direction * shieldOffset, CONFIG.worldWidth);
        const shieldY = baseY - 10;
        createAssaultComponent(scene, shieldX, shieldY, 'assaultShieldGen', 'shield', ASSAULT_BASE_CONFIG.shieldGeneratorHp);
    }
}

// Initializes and spawns the full assault mission objective structure and defender forces.
function setupAssaultObjective(scene) {
    if (!scene || !scene.assaultTargets) return;
    const objective = gameState.assaultObjective;
    if (!objective) return;

    objective.active = true;
    objective.spawnTimer = 0;
    objective.turretFireTimer = 0;
    objective.shieldHitCooldown = 0;
    objective.reinforcementTimer = 0;
    objective.phaseLabel = '';
    objective.gateLabel = '';
    objective.gateColor = '#ffffff';
    objective.interiorPhase = false;
    objective.interiorStarted = false;
    objective.powerConduitsRemaining = 0;
    objective.powerConduitsTotal = 0;
    objective.securityNodesRemaining = 0;
    objective.securityNodesTotal = 0;
    objective.coreChamberOpen = false;
    objective.coreChamberHp = 0;
    objective.coreChamberHpMax = 0;
    objective.coreChamberActive = false;
    objective.interiorReinforcementTimer = 0;
    objective.shipLocked = false;
    objective.transitionTimer = 0;
    const scaledHp = Math.round(ASSAULT_BASE_CONFIG.baseHp * (gameState.spawnMultiplier || 1));
    objective.baseHpMax = scaledHp;
    objective.baseHp = scaledHp;

    const baseX = CONFIG.worldWidth * 0.5;
    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    const terrainVariation = Math.sin(baseX / 200) * 30;
    const baseY = Math.max(140, groundLevel - terrainVariation - 24);

    const baseTexture = getAssaultBaseTextureKey(objective);
    objective.baseVariant = baseTexture;
    const base = createAssaultComponent(scene, baseX, baseY, baseTexture, 'core', scaledHp);
    scene.assaultBase = base;
    objective.baseX = baseX;

    objective.shieldStageTotal = ASSAULT_BASE_CONFIG.shieldStages;
    objective.shieldStage = 1;
    objective.damageWindowUntil = 0;
    objective.intermissionUntil = 0;
    spawnAssaultShieldGenerators(scene, objective);

    const turretSpread = 200;
    for (let i = 0; i < ASSAULT_BASE_CONFIG.turretCount; i++) {
        const offset = turretSpread * ((i / (ASSAULT_BASE_CONFIG.turretCount - 1)) - 0.5);
        const turretX = wrapValue(baseX + offset, CONFIG.worldWidth);
        const turretY = baseY + 34;
        createAssaultComponent(scene, turretX, turretY, 'assaultTurret', 'turret', ASSAULT_BASE_CONFIG.turretHp);
    }

    showRebuildObjectiveBanner(scene, 'ASSAULT OBJECTIVE: Destroy the base core', '#f97316');
    spawnAssaultDefenders(scene, baseX);
}

// Handles projectile damage against assault targets, including shields, turret/base deaths, and scoring.
function hitAssaultTarget(projectile, target) {
    const assaultObjective = gameState.assaultObjective;
    const mothershipObjective = gameState.mothershipObjective;
    const isInteriorTarget = !!target?.interiorTarget
        || target?.assaultRole === 'power_conduit'
        || target?.assaultRole === 'security_node'
        || target?.assaultRole === 'interior_core';
    if (isInteriorTarget) {
        if (assaultObjective?.active && assaultObjective?.interiorPhase) {
            hitAssaultInteriorTarget(projectile, target);
        } else if (mothershipObjective?.active && mothershipObjective?.interiorPhase && typeof hitInteriorTarget === 'function') {
            hitInteriorTarget(projectile, target);
        } else if (projectile && projectile.active && !projectile.isPiercing) {
            projectile.destroy();
        }
        return;
    }

    const objective = gameState.assaultObjective;
    if (!objective || !objective.active || !target.active) {
        if (projectile && projectile.active) projectile.destroy();
        return;
    }

    const scene = projectile.scene;
    const now = scene.time?.now || 0;

    if (projectile && projectile.empDisableDuration && (target.assaultRole === 'turret' || target.assaultRole === 'shield')) {
        target.empDisabledUntil = now + projectile.empDisableDuration;
        createExplosion(scene, target.x, target.y, 0x38bdf8);
    }

    if (target.assaultRole === 'core') {
        if (objective.damageWindowUntil > 0 && now < objective.damageWindowUntil) {
            target.hp -= projectile.damage || 1;
            objective.baseHp = Math.max(0, target.hp);
            target.setTint(0xff0000);
            scene.time.delayedCall(50, () => {
                if (target && target.active) target.clearTint();
            });
        } else {
            if (objective.shieldHitCooldown <= 0) {
                createFloatingText(scene, target.x, target.y - 40, 'SHIELD ACTIVE', '#38bdf8');
                createExplosion(scene, target.x, target.y - 6, 0x38bdf8, 0.5);
                objective.shieldHitCooldown = 500;
            }
        }
    } else {
        target.hp -= projectile.damage || 1;
        if (target.hp <= 0) {
            if (target.assaultRole === 'shield') {
                objective.shieldsRemaining = Math.max(0, (objective.shieldsRemaining || 0) - 1);
                createExplosion(scene, target.x, target.y, 0x22d3ee);

                if (objective.shieldsRemaining <= 0) {
                    const windowDuration = ASSAULT_BASE_CONFIG.damageWindowMs;
                    objective.damageWindowUntil = now + windowDuration;
                    showRebuildObjectiveBanner(scene, `SHIELDS DOWN - CORE VULNERABLE (${Math.round(windowDuration / 1000)}s)`, '#ff4444');
                }
                target.destroy();
            } else if (target.assaultRole === 'turret') {
                createExplosion(scene, target.x, target.y, 0xf97316);
                target.destroy();
            }
        }
    }

    if (projectile && projectile.active && !projectile.isPiercing) projectile.destroy();

    if (objective.baseHp <= 0 && objective.active) {
        objective.baseHp = 0;
        createExplosion(scene, target.x, target.y, 0xff6b35);
        if (target && target.active && target.assaultRole === 'core') target.destroy();
        scene.assaultBase = null;
        handleAssaultBaseExteriorDefeat(scene, objective);
    }
}

// Handles exterior assault-base destruction by transitioning into on-foot interior phase.
function handleAssaultBaseExteriorDefeat(scene, objective) {
    if (!scene || !objective) return;

    objective.interiorPhase = true;
    objective.active = true;
    objective.interiorStarted = false;
    objective.shipLocked = true;

    const phaseReward = getMissionScaledReward(3000);
    gameState.score += phaseReward;

    showRebuildObjectiveBanner(scene, 'ASSAULT BASE BREACHED - INFILTRATION IN PROGRESS', '#ff6b35');

    scene.time.delayedCall(ASSAULT_INTERIOR_CONFIG.transitionDelayMs, () => {
        beginAssaultBaseInterior(scene);
    });
}

// Starts the assault-base interior phase by swapping to interior visuals and spawning targets.
function beginAssaultBaseInterior(scene) {
    const objective = gameState.assaultObjective;
    if (!objective) return;

    objective.interiorStarted = true;

    if (typeof logInteriorTransitionReadiness === 'function') {
        logInteriorTransitionReadiness(scene, 'beginAssaultBaseInterior');
    }

    if (typeof clearExteriorEntities === 'function') {
        clearExteriorEntities(scene);
    } else {
        console.warn('[AssaultInterior] clearExteriorEntities is unavailable; continuing without exterior cleanup.');
    }

    const interiorStyle = ASSAULT_INTERIOR_STYLE_BY_BASE[objective.baseVariant] || 'raider_interior';
    destroyParallax();
    createBackground(scene, interiorStyle);
    const mainCam = scene.cameras.main;
    if (mainCam) {
        initParallaxTracking(mainCam.scrollX, mainCam.scrollY);
    }

    // Initialize interior mission with authored sections (sectionManager owns section setup)
    const started = typeof initInteriorMission === 'function' ? initInteriorMission(scene, 'assault') : false;
    if (!started) {
        console.error('[AssaultInterior] Failed to initialize interior mission.');
        return;
    }
    forceOnFootForAssault(scene);
    spawnAssaultInteriorObjectives(scene);

    objective.phaseLabel = 'PHASE 2 - INTERIOR';
    objective.gateLabel = 'Destroy power conduits & security nodes';
    objective.gateColor = '#ff00ff';

    showRebuildObjectiveBanner(scene, 'INTERIOR BREACH\nDestroy all power conduits and security nodes', '#ff00ff');
}

// Forces pilot-only gameplay during assault interior phase.
function forceOnFootForAssault(scene) {
    const objective = gameState.assaultObjective;
    if (!objective) return;

    if (aegisState.active && scene.aegis) {
        ejectPilot(scene);
    }

    aegisState.active = false;
    aegisState.destroyed = true;
    objective.shipLocked = true;

    if (scene.aegis) {
        scene.aegis.setActive(false).setVisible(false);
        scene.aegis.body.enable = false;
    }

    if (scene.pilot) {
        pilotState.active = true;
        scene.pilot.setActive(true).setVisible(true);
        scene.pilot.setAlpha(1);
        scene.pilot.clearTint();
        scene.pilot.body.enable = true;

        const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
        scene.pilot.setPosition(200, groundLevel - 30);
        pilotState.grounded = false;
        pilotState.vx = 0;
        pilotState.vy = 0;
    }

    syncActivePlayer(scene);
    playerState.powerUps.invincibility = 3000;

    if (gameState.rebuildObjective) {
        gameState.rebuildObjective.active = false;
        gameState.rebuildObjective.stage = null;
    }
}

// Spawns interior objectives for the assault-base phase.
function spawnAssaultInteriorObjectives(scene) {
    const objective = gameState.assaultObjective;
    const cfg = ASSAULT_INTERIOR_CONFIG;
    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;

    objective.powerConduitsTotal = cfg.powerConduitCount;
    objective.powerConduitsRemaining = cfg.powerConduitCount;
    objective.securityNodesTotal = cfg.securityNodeCount;
    objective.securityNodesRemaining = cfg.securityNodeCount;
    objective.coreChamberOpen = false;
    objective.coreChamberActive = false;
    objective.coreChamberHp = 0;
    objective.coreChamberHpMax = cfg.coreChamberHp;
    objective.interiorReinforcementTimer = 0;

    const conduitSpacing = CONFIG.worldWidth / (cfg.powerConduitCount + 1);
    for (let i = 0; i < cfg.powerConduitCount; i++) {
        const cx = conduitSpacing * (i + 1) + (Math.random() - 0.5) * 100;
        const terrainVar = Math.sin(cx / 200) * 30;
        const fallbackY = Math.max(120, groundLevel - terrainVar - 20);
        const cy = getInteriorAnchorY(scene, cx, fallbackY, 20);

        const conduit = createAssaultInteriorComponent(scene, cx, cy, 'assaultTurret', 'power_conduit', cfg.powerConduitHp);
        conduit.setTint(0x00ffff);
    }

    const nodeSpacing = CONFIG.worldWidth / (cfg.securityNodeCount + 1);
    for (let i = 0; i < cfg.securityNodeCount; i++) {
        const nx = nodeSpacing * (i + 1) + (Math.random() - 0.5) * 150;
        const terrainVar = Math.sin(nx / 200) * 30;
        const fallbackY = Math.max(100, groundLevel - terrainVar - 40);
        const ny = getInteriorAnchorY(scene, nx, fallbackY, 40);

        const node = createAssaultInteriorComponent(scene, nx, ny, 'assaultShieldGen', 'security_node', cfg.securityNodeHp);
        node.setTint(0xff00ff);
    }

    spawnAssaultInteriorDefenders(scene, 4);
}

// Creates one interior objective component.
function createAssaultInteriorComponent(scene, x, y, texture, role, hp) {
    const component = scene.assaultTargets.create(x, y, texture);
    component.setDepth(FG_DEPTH_BASE + 3);
    component.setImmovable(true);
    component.body.setAllowGravity(false);
    component.body.setVelocity(0, 0);
    component.assaultRole = role;
    component.interiorTarget = true;
    component.hp = hp;
    component.maxHp = hp;
    component.nextShot = Phaser.Math.Between(800, 1800);
    return component;
}

// Spawns interior defenders near the camera location.
function spawnAssaultInteriorDefenders(scene, count) {
    const cfg = ASSAULT_INTERIOR_CONFIG;
    const camX = scene.cameras.main ? scene.cameras.main.scrollX : 0;

    for (let i = 0; i < count; i++) {
        const type = Phaser.Utils.Array.GetRandom(cfg.interiorEnemyTypes);
        const spawnX = wrapValue(camX + CONFIG.width * 0.3 + Math.random() * CONFIG.width * 0.4, CONFIG.worldWidth);
        const spawnY = CONFIG.height * 0.2 + Math.random() * CONFIG.height * 0.5;
        spawnEnemy(scene, type, spawnX, spawnY, false);
    }
}

// Spawns the assault interior core chamber once all gates are destroyed.
function spawnAssaultCoreChamber(scene) {
    const objective = gameState.assaultObjective;
    const cfg = ASSAULT_INTERIOR_CONFIG;
    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;

    const coreX = CONFIG.worldWidth * 0.5;
    const terrainVar = Math.sin(coreX / 200) * 30;
    const fallbackY = Math.max(140, groundLevel - terrainVar - 30);
    const coreY = getInteriorAnchorY(scene, coreX, fallbackY, 30);

    const core = createAssaultInteriorComponent(scene, coreX, coreY, 'assaultBaseRaider', 'interior_core', cfg.coreChamberHp);
    core.setTint(0xffaa00);
    core.setScale(1.3);

    objective.coreChamberActive = true;
    objective.coreChamberHp = cfg.coreChamberHp;
    objective.coreChamberHpMax = cfg.coreChamberHp;

    showRebuildObjectiveBanner(scene, 'CORE CHAMBER EXPOSED\nDestroy the reactor core!', '#ffaa00');
    spawnAssaultInteriorDefenders(scene, 3);
}

// Updates assault interior objective progress, reinforcement cadence, and turret firing.
function updateAssaultInterior(scene, delta) {
    const objective = gameState.assaultObjective;
    if (!objective || !objective.interiorPhase || !objective.interiorStarted) return;

    if (gameState.rebuildObjective && gameState.rebuildObjective.active) {
        gameState.rebuildObjective.active = false;
        gameState.rebuildObjective.stage = null;
    }

    if (!objective.coreChamberOpen) {
        const totalGates = objective.powerConduitsTotal + objective.securityNodesTotal;
        const remaining = objective.powerConduitsRemaining + objective.securityNodesRemaining;
        objective.phaseLabel = 'PHASE 2 - INTERIOR';
        objective.gateLabel = `Targets: ${remaining}/${totalGates} remaining`;
        objective.gateColor = remaining > 0 ? '#ff00ff' : '#00ff00';
        objective.baseHp = remaining;
        objective.baseHpMax = totalGates;
    } else if (objective.coreChamberActive) {
        objective.phaseLabel = 'PHASE 2 - CORE CHAMBER';
        objective.gateLabel = 'Destroy the reactor core!';
        objective.gateColor = '#ffaa00';
        objective.baseHp = objective.coreChamberHp;
        objective.baseHpMax = objective.coreChamberHpMax;
    }

    if (!objective.coreChamberOpen && objective.powerConduitsRemaining <= 0 && objective.securityNodesRemaining <= 0) {
        objective.coreChamberOpen = true;
        spawnAssaultCoreChamber(scene);
    }

    objective.interiorReinforcementTimer += delta;
    if (objective.interiorReinforcementTimer >= ASSAULT_INTERIOR_CONFIG.reinforcementInterval) {
        objective.interiorReinforcementTimer = 0;
        const activeEnemies = scene.enemies ? scene.enemies.countActive(true) : 0;
        if (activeEnemies < 8) {
            spawnAssaultInteriorDefenders(scene, ASSAULT_INTERIOR_CONFIG.reinforcementBatch);
        }
    }

    const interiorTargets = scene.assaultTargets?.children?.entries;
    if (Array.isArray(interiorTargets)) {
        const now = scene.time?.now || 0;
        interiorTargets.forEach(target => {
            if (!target || !target.active || !target.interiorTarget) return;
            if (target.assaultRole === 'interior_core') return;
            if (now >= (target.nextShot || 0)) {
                fireInteriorTurret(scene, target);
                target.nextShot = now + 1200 + Math.random() * 1000;
            }
        });
    }
}

// Handles damage logic for assault interior targets and final core destruction.
function hitAssaultInteriorTarget(projectile, target) {
    const objective = gameState.assaultObjective;
    if (!objective || !objective.interiorPhase || !target.active || !target.interiorTarget) {
        if (projectile && projectile.active) projectile.destroy();
        return;
    }

    const scene = projectile.scene;
    target.hp -= projectile.damage || 1;

    target.setTint(0xff0000);
    scene.time.delayedCall(60, () => {
        if (target && target.active) {
            if (target.assaultRole === 'power_conduit') target.setTint(0x00ffff);
            else if (target.assaultRole === 'security_node') target.setTint(0xff00ff);
            else if (target.assaultRole === 'interior_core') target.setTint(0xffaa00);
            else target.clearTint();
        }
    });

    if (target.hp <= 0) {
        if (target.assaultRole === 'power_conduit') {
            objective.powerConduitsRemaining = Math.max(0, objective.powerConduitsRemaining - 1);
            createExplosion(scene, target.x, target.y, 0x00ffff);
            createFloatingText(scene, target.x, target.y - 30, 'CONDUIT DESTROYED', '#00ffff');
            gameState.score += getMissionScaledReward(500);
        } else if (target.assaultRole === 'security_node') {
            objective.securityNodesRemaining = Math.max(0, objective.securityNodesRemaining - 1);
            createExplosion(scene, target.x, target.y, 0xff00ff);
            createFloatingText(scene, target.x, target.y - 30, 'NODE DESTROYED', '#ff00ff');
            gameState.score += getMissionScaledReward(750);
        } else if (target.assaultRole === 'interior_core') {
            objective.coreChamberHp = 0;
            objective.coreChamberActive = false;
            createExplosion(scene, target.x, target.y, 0xffaa00);
            createExplosion(scene, target.x - 30, target.y + 10, 0xff6b35);
            createExplosion(scene, target.x + 30, target.y - 10, 0xff6b35);
            screenShake(scene, 30, 800);
            gameState.score += getMissionScaledReward(8000);

            target.destroy();
            objective.active = false;
            objective.interiorPhase = false;
            objective.shipLocked = false;

            showRebuildObjectiveBanner(scene, 'ASSAULT BASE CORE DESTROYED\nTARGET ELIMINATED!', '#00ff00');
            scene.time.delayedCall(2000, () => {
                winGame(scene);
            });
            if (projectile && projectile.active && !projectile.isPiercing) projectile.destroy();
            return;
        }

        target.destroy();
    }

    if (target.assaultRole === 'interior_core' && target.active) {
        objective.coreChamberHp = Math.max(0, target.hp);
    }

    if (projectile && projectile.active && !projectile.isPiercing) projectile.destroy();
}
