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
    objective.phase = boss.phaseIndex || 0;
    objective.shieldsRemaining = boss.shieldsRemaining || 0;

    objective.reinforcementTimer += delta;
    const baseInterval = 4200;
    const interval = getBossReinforcementInterval(boss, baseInterval);
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
