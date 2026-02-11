// ------------------------
// Assault Base Behavior - Spawns and Attacks
// ------------------------

function spawnAssaultDefenders(scene, baseX) {
    const defenderTypes = GARRISON_DEFENDER_TYPES || ['rifle'];
    for (let i = 0; i < ASSAULT_BASE_CONFIG.defenderCount; i++) {
        const type = Phaser.Utils.Array.GetRandom(defenderTypes);
        const offsetX = Phaser.Math.Between(-260, 260);
        const spawnX = wrapValue(baseX + offsetX, CONFIG.worldWidth);
        const spawnY = CONFIG.worldHeight * 0.25 + Phaser.Math.Between(-40, 80);
        spawnGarrisonDefender(scene, type, spawnX, spawnY);
    }
}

function updateAssaultCoreShieldPhase(scene) {
    const objective = gameState.assaultObjective;
    if (!objective || !objective.active) return;

    const base = scene.assaultBase;
    if (!base || !base.active) return;

    const now = scene.time?.now || 0;
    if (typeof tickShieldPhaseState === 'function') tickShieldPhaseState(base, now);

    if (typeof getPhaseHudStatus === 'function') {
        const hud = getPhaseHudStatus(base, now);
        objective.phaseLabel = hud.phaseText;
        objective.gateLabel = hud.gateText;
        objective.gateColor = hud.gateColor;
        objective.coreVulnerable = hud.isVulnerable;
        objective.shieldBarPercent = hud.shieldBarPercent;
    }
}

function updateAssaultObjective(scene, delta) {
    const objective = gameState.assaultObjective;
    if (!objective || !objective.active) return;

    objective.spawnTimer += delta;
    objective.turretFireTimer += delta;
    objective.reinforcementTimer += delta;
    objective.shieldHitCooldown = Math.max(0, objective.shieldHitCooldown - delta);

    updateAssaultCoreShieldPhase(scene);

    const basePhase = scene.assaultBase ? getEncounterPhase(scene.assaultBase) : 0;
    const phaseFactor = Math.max(0.55, 1 - basePhase * 0.15);

    if (objective.spawnTimer >= ASSAULT_BASE_CONFIG.spawnInterval * phaseFactor) {
        objective.spawnTimer = 0;
        const assaultMix = ['mutant', 'shield', 'spawner', 'kamikaze', 'seeker', 'turret'];
        spawnRandomEnemy(scene, assaultMix);
    }

    if (objective.reinforcementTimer >= ASSAULT_BASE_CONFIG.reinforcementInterval * phaseFactor) {
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
                const spawnX = wrapValue((objective.baseX || CONFIG.worldWidth * 0.5) + offsetX, CONFIG.worldWidth);
                const spawnY = CONFIG.worldHeight * 0.25 + Phaser.Math.Between(-30, 60);
                spawnGarrisonDefender(scene, type, spawnX, spawnY);
            }
        }
    }

    if (objective.turretFireTimer >= ASSAULT_BASE_CONFIG.turretFireInterval * phaseFactor) {
        objective.turretFireTimer = 0;
        if (scene.assaultTargets) {
            scene.assaultTargets.children.entries.forEach((target) => {
                if (!target.active || target.assaultRole !== 'turret') return;
                if (target.empDisabledUntil && target.empDisabledUntil > scene.time.now) return;
                const dummy = { x: target.x, y: target.y, enemyType: 'turret' };
                shootAtPlayer(scene, dummy);
            });
        }
    }
}
