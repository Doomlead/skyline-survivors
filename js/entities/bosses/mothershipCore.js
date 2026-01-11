// ------------------------
// Mothership Core Encounter and Behavior
// ------------------------

function initializeMothershipCore(boss) {
    if (!boss) return;
    boss.corePhase = 0;
    boss.lastPulse = 0;
}

function setupMothershipEncounter(scene) {
    if (!scene) return;
    const objective = gameState.mothershipObjective;
    if (!objective) return;

    objective.active = true;
    objective.bossKey = 'mothershipCore';
    objective.reinforcementTimer = 0;
    objective.phase = 0;

    const spawnX = scene.cameras.main.scrollX + CONFIG.width / 2;
    const spawnY = CONFIG.height * 0.35;
    const boss = spawnBoss(scene, 'mothershipCore', spawnX, spawnY);
    if (boss) {
        gameState.bossActive = true;
        gameState.currentBossKey = 'mothershipCore';
        gameState.currentBossName = 'Mothership Core';
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
    objective.phase = boss.corePhase || 0;

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
