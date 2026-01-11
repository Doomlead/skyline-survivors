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

function updateMothershipCoreBehavior(scene, boss, time, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    const centerX = scene.cameras.main.scrollX + CONFIG.width / 2;
    const targetY = CONFIG.height * 0.35;
    const sway = Math.sin(time * 0.0015) * 120;

    boss.x = Phaser.Math.Linear(boss.x, centerX + sway, 0.02);
    boss.y = Phaser.Math.Linear(boss.y, targetY + Math.sin(time * 0.001) * 25, 0.02);

    const hpRatio = boss.maxHp > 0 ? boss.hp / boss.maxHp : 1;
    const phase = hpRatio < 0.33 ? 2 : hpRatio < 0.66 ? 1 : 0;
    boss.corePhase = phase;

    const shotInterval = phase === 2 ? 900 : phase === 1 ? 1200 : 1600;
    if (time > boss.lastShot + shotInterval) {
        const shotConfig = getBossShotConfig('mothershipCore');
        const ringCount = phase === 2 ? 10 : phase === 1 ? 8 : 6;
        for (let i = 0; i < ringCount; i++) {
            const angle = (i / ringCount) * Math.PI * 2;
            const sourceX = boss.x + Math.cos(angle) * 50;
            const sourceY = boss.y + Math.sin(angle) * 35;
            shootFromBossSource(scene, sourceX, sourceY, boss, shotConfig, angle);
        }
        if (player && phase > 0) {
            const aimedAngle = Phaser.Math.Angle.Between(boss.x, boss.y, player.x, player.y);
            const sourceX = boss.x + Math.cos(aimedAngle) * 55;
            const sourceY = boss.y + Math.sin(aimedAngle) * 35;
            shootFromBossSource(scene, sourceX, sourceY, boss, shotConfig, aimedAngle);
        }
        boss.lastShot = time;
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
