// ------------------------
// Assault Base Behavior - Spawns and Attacks
// ------------------------

function wrapAssaultX(scene, x) {
    if (scene?.wrapSystem?.wrapValue) {
        return scene.wrapSystem.wrapValue(x);
    }
    const worldWidth = CONFIG?.worldWidth || 0;
    if (!worldWidth) return x;
    let wrapped = x % worldWidth;
    if (wrapped < 0) wrapped += worldWidth;
    return wrapped;
}

function spawnAssaultDefenders(scene, baseX) {
    const defenderTypes = GARRISON_DEFENDER_TYPES || ['rifle'];
    for (let i = 0; i < ASSAULT_BASE_CONFIG.defenderCount; i++) {
        const type = Phaser.Utils.Array.GetRandom(defenderTypes);
        const offsetX = Phaser.Math.Between(-260, 260);
        const spawnX = wrapAssaultX(scene, baseX + offsetX);
        const spawnY = CONFIG.worldHeight * 0.25 + Phaser.Math.Between(-40, 80);
        spawnGarrisonDefender(scene, type, spawnX, spawnY);
    }
}

function updateAssaultObjective(scene, delta) {
    const objective = gameState.assaultObjective;
    if (!objective || !objective.active) return;
    objective.spawnTimer += delta;
    objective.turretFireTimer += delta;
    objective.reinforcementTimer += delta;
    objective.shieldHitCooldown = Math.max(0, objective.shieldHitCooldown - delta);
    if (objective.spawnTimer >= ASSAULT_BASE_CONFIG.spawnInterval) {
        objective.spawnTimer = 0;
        const assaultMix = ['mutant', 'shield', 'spawner', 'kamikaze', 'seeker', 'turret'];
        spawnRandomEnemy(scene, assaultMix);
    }

    if (objective.reinforcementTimer >= ASSAULT_BASE_CONFIG.reinforcementInterval) {
        objective.reinforcementTimer = 0;
        const currentCount = scene.garrisonDefenders?.countActive(true) || 0;
        if (currentCount < ASSAULT_BASE_CONFIG.reinforcementCap) {
            const reinforcements = Math.min(
                ASSAULT_BASE_CONFIG.reinforcementBatch,
                ASSAULT_BASE_CONFIG.reinforcementCap - currentCount
            );
            for (let i = 0; i < reinforcements; i++) {
                const type = Phaser.Utils.Array.GetRandom(GARRISON_DEFENDER_TYPES || ['rifle']);
                const offsetX = Phaser.Math.Between(-240, 240);
                const spawnX = wrapAssaultX(scene, (objective.baseX || CONFIG.worldWidth * 0.5) + offsetX);
                const spawnY = CONFIG.worldHeight * 0.25 + Phaser.Math.Between(-30, 60);
                spawnGarrisonDefender(scene, type, spawnX, spawnY);
            }
        }
    }

    if (objective.turretFireTimer >= ASSAULT_BASE_CONFIG.turretFireInterval) {
        objective.turretFireTimer = 0;
        if (scene.assaultTargets) {
            scene.assaultTargets.children.entries.forEach((target) => {
                if (!target.active || target.assaultRole !== 'turret') return;
                const dummy = { x: target.x, y: target.y, enemyType: 'turret' };
                shootAtPlayer(scene, dummy);
            });
        }
    }
}
