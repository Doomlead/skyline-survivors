// ------------------------
// Mothership Core Encounter and Behavior
// ------------------------

const MOTHERSHIP_INTERIOR_TARGET_CONFIG = {
    conduitCount: 3,
    securityNodeCount: 2,
    conduitHp: 9,
    securityNodeHp: 12,
    coreChamberHp: 24
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

function createMothershipInteriorComponent(scene, x, y, texture, role, hp) {
    const component = scene.assaultTargets.create(x, y, texture);
    component.setDepth(FG_DEPTH_BASE + 2);
    component.setImmovable(true);
    component.body.setAllowGravity(false);
    component.body.setVelocity(0, 0);
    component.assaultRole = role;
    component.isMothershipInteriorObjective = true;
    component.hp = hp;
    component.maxHp = hp;
    return component;
}

function spawnMothershipInteriorObjectives(scene) {
    const objective = gameState.mothershipObjective;
    if (!scene || !objective || !scene.assaultTargets) return;

    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    const corridorY = Math.max(120, groundLevel - 30);
    const centerX = CONFIG.worldWidth * 0.52;

    const conduits = [];
    for (let i = 0; i < MOTHERSHIP_INTERIOR_TARGET_CONFIG.conduitCount; i++) {
        const spread = (i - 1) * 150;
        const conduitX = wrapValue(centerX + spread, CONFIG.worldWidth);
        const conduitY = corridorY - 20;
        conduits.push(createMothershipInteriorComponent(
            scene,
            conduitX,
            conduitY,
            'interiorConduit',
            'interior_conduit',
            MOTHERSHIP_INTERIOR_TARGET_CONFIG.conduitHp
        ));
    }

    const nodes = [];
    for (let i = 0; i < MOTHERSHIP_INTERIOR_TARGET_CONFIG.securityNodeCount; i++) {
        const direction = i === 0 ? -1 : 1;
        const nodeX = wrapValue(centerX + direction * 235, CONFIG.worldWidth);
        const nodeY = corridorY - 56;
        nodes.push(createMothershipInteriorComponent(
            scene,
            nodeX,
            nodeY,
            'interiorSecurityNode',
            'interior_security_node',
            MOTHERSHIP_INTERIOR_TARGET_CONFIG.securityNodeHp
        ));
    }

    objective.interiorTargetsRemaining = conduits.length + nodes.length;
    objective.interiorConduitsRemaining = conduits.length;
    objective.interiorSecurityNodesRemaining = nodes.length;
    objective.coreChamberOpen = false;
    objective.coreChamberActive = false;
    objective.coreChamberHp = 0;
    objective.coreChamberHpMax = 0;
}

function openMothershipCoreChamber(scene) {
    const objective = gameState.mothershipObjective;
    if (!scene || !objective || objective.coreChamberOpen || !scene.assaultTargets) return;

    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    const chamberX = wrapValue(CONFIG.worldWidth * 0.52, CONFIG.worldWidth);
    const chamberY = Math.max(110, groundLevel - 74);
    const chamber = createMothershipInteriorComponent(
        scene,
        chamberX,
        chamberY,
        'interiorCoreChamber',
        'interior_core_chamber',
        MOTHERSHIP_INTERIOR_TARGET_CONFIG.coreChamberHp
    );

    objective.coreChamberOpen = true;
    objective.coreChamberActive = true;
    objective.coreChamberHp = chamber.hp;
    objective.coreChamberHpMax = chamber.maxHp;
    showRebuildObjectiveBanner(scene, 'CORE CHAMBER OPEN - BREACH THE INNER CORE', '#f97316');
}

function startMothershipInteriorPhase(scene) {
    const objective = gameState.mothershipObjective;
    if (!scene || !objective) return;

    objective.active = true;
    objective.stage = 'interior_assault';
    objective.reinforcementTimer = 0;
    objective.bossKey = null;
    objective.bossHp = 0;
    objective.bossHpMax = 0;
    objective.phase = 1;
    objective.phaseLabel = 'Phase 2 · Interior Assault';
    objective.gateLabel = 'Destroy conduits + security nodes';
    objective.gateColor = '#fbbf24';
    objective.shipLocked = true;

    if (scene.bosses) {
        scene.bosses.children.entries.forEach((boss) => {
            if (boss && boss.active && boss.bossType === 'mothershipCore') {
                boss.destroy();
            }
        });
    }

    if (typeof switchBackgroundStyle === 'function') {
        switchBackgroundStyle(scene, 'mothership_interior');
    }

    if (aegisState.active) {
        ejectPilot(scene);
    }

    if (scene.aegis) {
        scene.aegis.body.enable = false;
        scene.aegis.setVisible(false);
        scene.aegis.setActive(false);
    }

    if (gameState.rebuildObjective) {
        gameState.rebuildObjective.active = false;
        gameState.rebuildObjective.stage = null;
        gameState.rebuildObjective.timer = 0;
        gameState.rebuildObjective.hangarRebuildTimer = 0;
    }

    spawnMothershipInteriorObjectives(scene);
    showRebuildObjectiveBanner(scene, 'PHASE 2: BOARD THE INTERIOR AND DISABLE SECURITY SYSTEMS', '#f59e0b');
}

function setupMothershipEncounter(scene) {
    if (!scene) return;
    const objective = gameState.mothershipObjective;
    if (!objective) return;

    objective.active = true;
    objective.stage = 'exterior_core';
    objective.bossKey = 'mothershipCore';
    objective.reinforcementTimer = 0;
    objective.phase = 0;
    objective.shieldsRemaining = 0;
    objective.damageWindowMs = 0;
    objective.shipLocked = false;
    objective.interiorTargetsRemaining = 0;
    objective.interiorConduitsRemaining = 0;
    objective.interiorSecurityNodesRemaining = 0;
    objective.coreChamberOpen = false;
    objective.coreChamberActive = false;
    objective.coreChamberHp = 0;
    objective.coreChamberHpMax = 0;

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
        objective.shieldsRemaining = boss.phaseState?.shieldHp || 0;
    }

    showRebuildObjectiveBanner(scene, 'FINAL ASSAULT: DESTROY THE MOTHERSHIP CORE', '#38bdf8');
}

function updateMothershipEncounter(scene, delta) {
    const objective = gameState.mothershipObjective;
    if (!objective?.active) return;

    if (objective.stage === 'exterior_core') {
        const boss = scene.bosses?.children?.entries?.find(entry => entry.active && entry.bossType === 'mothershipCore');
        if (!boss) {
            objective.active = false;
            return;
        }

        objective.bossHp = boss.hp;
        objective.bossHpMax = boss.maxHP;
        objective.phase = typeof getEncounterPhase === 'function' ? getEncounterPhase(boss) : (boss.corePhase || 0);
        objective.shieldsRemaining = boss.phaseState?.shieldHp || 0;
        const hud = typeof getPhaseHudStatus === 'function' ? getPhaseHudStatus(boss, scene.time?.now || 0) : null;
        objective.phaseLabel = hud?.phaseText || `Phase ${(objective.phase || 0) + 1}`;
        objective.gateLabel = hud?.gateText || '';
        objective.gateColor = hud?.gateColor || '#ffffff';

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
        return;
    }

    if (objective.stage !== 'interior_assault') return;

    objective.reinforcementTimer += delta;
    if (objective.reinforcementTimer >= 2600) {
        objective.reinforcementTimer = 0;
        const interiorReinforcements = ['kamikaze', 'turret', 'shield', 'seeker'];
        const type = Phaser.Utils.Array.GetRandom(interiorReinforcements);
        const spawnX = scene.cameras.main.scrollX + Math.random() * CONFIG.width;
        const spawnY = CONFIG.height * 0.38 + Math.random() * CONFIG.height * 0.35;
        spawnEnemy(scene, type, spawnX, spawnY, false);
    }

    if (objective.coreChamberActive) {
        objective.phaseLabel = 'Phase 2 · Core Chamber';
        objective.gateLabel = `Destroy the chamber core (${Math.max(0, Math.ceil(objective.coreChamberHp || 0))})`;
        objective.gateColor = '#ff7878';
    } else {
        objective.phaseLabel = 'Phase 2 · Interior Assault';
        objective.gateLabel = `Conduits ${objective.interiorConduitsRemaining || 0} · Nodes ${objective.interiorSecurityNodesRemaining || 0}`;
        objective.gateColor = '#fbbf24';
    }
}

function hitMothershipInteriorTarget(projectile, target) {
    const objective = gameState.mothershipObjective;
    if (!objective || !objective.active || objective.stage !== 'interior_assault' || !target?.active) {
        if (projectile?.active && !projectile.isPiercing) projectile.destroy();
        return;
    }

    target.hp -= projectile?.damage || 1;
    target.setTint(0xff9f43);
    projectile.scene.time.delayedCall(50, () => {
        if (target && target.active) target.clearTint();
    });

    if (projectile?.active && !projectile.isPiercing) projectile.destroy();
    if (target.hp > 0) {
        if (target.assaultRole === 'interior_core_chamber') {
            objective.coreChamberHp = Math.max(0, target.hp);
        }
        return;
    }

    if (target.assaultRole === 'interior_conduit') {
        objective.interiorConduitsRemaining = Math.max(0, (objective.interiorConduitsRemaining || 0) - 1);
        objective.interiorTargetsRemaining = Math.max(0, (objective.interiorTargetsRemaining || 0) - 1);
        createExplosion(projectile.scene, target.x, target.y, 0x22d3ee);
    } else if (target.assaultRole === 'interior_security_node') {
        objective.interiorSecurityNodesRemaining = Math.max(0, (objective.interiorSecurityNodesRemaining || 0) - 1);
        objective.interiorTargetsRemaining = Math.max(0, (objective.interiorTargetsRemaining || 0) - 1);
        createExplosion(projectile.scene, target.x, target.y, 0xf97316);
    } else if (target.assaultRole === 'interior_core_chamber') {
        objective.coreChamberActive = false;
        objective.coreChamberHp = 0;
        createExplosion(projectile.scene, target.x, target.y, 0xff4444);
        showRebuildObjectiveBanner(projectile.scene, 'MOTHERSHIP INTERIOR SECURED', '#66ff88');
        target.destroy();
        objective.active = false;
        objective.shipLocked = false;
        projectile.scene.time.delayedCall(900, () => {
            winGame(projectile.scene);
        });
        return;
    }

    target.destroy();

    if (!objective.coreChamberOpen && (objective.interiorTargetsRemaining || 0) <= 0) {
        openMothershipCoreChamber(projectile.scene);
    }
}

function handleMothershipCoreDefeat(scene) {
    startMothershipInteriorPhase(scene);
}
