// ------------------------
// Assault Base Core - Objective Setup and Damage Handling
// ------------------------

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
    shieldBaseHpRatio: 0.22,
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

function getAssaultBaseTextureKey(objective) {
    if (objective?.baseVariant && ASSAULT_BASE_TEXTURES.includes(objective.baseVariant)) {
        return objective.baseVariant;
    }
    return Phaser.Utils.Array.GetRandom(ASSAULT_BASE_TEXTURES);
}

function createAssaultComponent(scene, x, y, texture, role, hp) {
    const component = scene.assaultTargets.create(x, y, texture);
    component.setDepth(FG_DEPTH_BASE + 2);
    component.setImmovable(true);
    component.body.setAllowGravity(false);
    component.body.setVelocity(0, 0);
    component.assaultRole = role;
    component.hp = hp;
    component.maxHp = hp;
    component.maxHP = hp;
    component.nextShot = Phaser.Math.Between(600, 1200);
    return component;
}

function isAssaultShieldBlocking(scene) {
    const objective = gameState.assaultObjective;
    if (!objective || !objective.active) return false;
    if (objective.extShieldsCleared) return false;

    const { assaultTargets } = scene;
    if (!assaultTargets) return false;

    const now = scene.time?.now || 0;
    let blocking = false;
    assaultTargets.children.entries.forEach((target) => {
        if (!target || !target.active || target.assaultRole !== 'shield') return;
        if (target.empDisabledUntil && target.empDisabledUntil > now) return;
        blocking = true;
    });
    return blocking;
}

function spawnAssaultShieldGenerators(scene, objective) {
    const baseX = objective?.baseX || CONFIG.worldWidth * 0.5;
    const base = scene.assaultBase;
    const baseY = base?.y || (CONFIG.worldHeight * 0.6);
    const shieldOffset = 120;
    objective.extShieldsRemaining = ASSAULT_BASE_CONFIG.shieldGeneratorCount;
    objective.shieldsRemaining = objective.extShieldsRemaining;
    objective.extShieldsCleared = false;

    for (let i = 0; i < ASSAULT_BASE_CONFIG.shieldGeneratorCount; i++) {
        const direction = i % 2 === 0 ? -1 : 1;
        const shieldX = wrapValue(baseX + direction * shieldOffset, CONFIG.worldWidth);
        const shieldY = baseY - 10;
        createAssaultComponent(scene, shieldX, shieldY, 'assaultShieldGen', 'shield', ASSAULT_BASE_CONFIG.shieldGeneratorHp);
    }
}

function setupAssaultObjective(scene) {
    if (!scene || !scene.assaultTargets) return;
    const objective = gameState.assaultObjective;
    if (!objective) return;

    objective.active = true;
    objective.spawnTimer = 0;
    objective.turretFireTimer = 0;
    objective.shieldHitCooldown = 0;
    objective.reinforcementTimer = 0;

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

    const shieldBaseHp = Math.max(1, Math.ceil(scaledHp * ASSAULT_BASE_CONFIG.shieldBaseHpRatio));
    if (typeof initializeShieldPhaseState === 'function') {
        initializeShieldPhaseState(base, {
            shieldStages: ASSAULT_BASE_CONFIG.shieldStages,
            shieldBaseHp,
            damageWindowMs: ASSAULT_BASE_CONFIG.damageWindowMs,
            intermissionMs: ASSAULT_BASE_CONFIG.intermissionMs,
            label: 'Core Shield'
        });
    }

    spawnAssaultShieldGenerators(scene, objective);

    const turretSpread = 200;
    for (let i = 0; i < ASSAULT_BASE_CONFIG.turretCount; i++) {
        const offset = turretSpread * ((i / (ASSAULT_BASE_CONFIG.turretCount - 1)) - 0.5);
        const turretX = wrapValue(baseX + offset, CONFIG.worldWidth);
        const turretY = baseY + 34;
        createAssaultComponent(scene, turretX, turretY, 'assaultTurret', 'turret', ASSAULT_BASE_CONFIG.turretHp);
    }

    showRebuildObjectiveBanner(scene, 'ASSAULT OBJECTIVE: Destroy shield generators, then break core shields', '#f97316');
    spawnAssaultDefenders(scene, baseX);
}

function hitAssaultTarget(projectile, target) {
    const scene = this;
    const objective = gameState.assaultObjective;
    if (!objective || !objective.active || !target.active) {
        if (projectile && projectile.active) projectile.destroy();
        return;
    }

    const now = scene.time?.now || 0;

    if (projectile && projectile.empDisableDuration && (target.assaultRole === 'turret' || target.assaultRole === 'shield')) {
        target.empDisabledUntil = now + projectile.empDisableDuration;
        createExplosion(scene, target.x, target.y, 0x38bdf8);
    }

    if (target.assaultRole === 'core') {
        if (isAssaultShieldBlocking(scene)) {
            if (objective.shieldHitCooldown <= 0) {
                createExplosion(scene, target.x, target.y - 6, 0x38bdf8);
                objective.shieldHitCooldown = 350;
            }
            if (projectile && projectile.active) projectile.destroy();
            return;
        }

        const result = typeof applyShieldStageDamage === 'function'
            ? applyShieldStageDamage(target, projectile.damage || 1, now)
            : { appliedToHp: true, damageApplied: projectile.damage || 1 };

        if (result.blocked) {
            createExplosion(scene, projectile.x, projectile.y, 0x888888);
            if (projectile && projectile.active) projectile.destroy();
            return;
        }

        if (result.appliedToShield) {
            scene.tweens.add({ targets: target, alpha: 0.7, duration: 80, yoyo: true, ease: 'Linear' });
            target.setTint(0x38bdf8);
            scene.time.delayedCall(80, () => {
                if (target && target.active) target.clearTint();
            });

            if (result.shieldBroken) {
                createExplosion(scene, target.x, target.y, 0x22d3ee);
                createExplosion(scene, target.x - 25, target.y + 15, 0x38bdf8);
                createExplosion(scene, target.x + 25, target.y - 15, 0x38bdf8);
                const state = getShieldPhaseState(target);
                if (state?.allShieldsCleared) {
                    showRebuildObjectiveBanner(scene, 'ALL CORE SHIELDS DOWN — DESTROY THE CORE!', '#ff4444');
                } else {
                    showRebuildObjectiveBanner(scene, `Core shield ${state?.stagesCleared || 0}/${state?.shieldStages || 1} down — damage window open`, '#22d3ee');
                }
                screenShake(scene, 10, 180);
            }

            if (projectile && projectile.active && !projectile.isPiercing) projectile.destroy();
            return;
        }

        if (result.appliedToHp) {
            target.hp -= result.damageApplied;
            objective.baseHp = Math.max(0, target.hp);
            scene.tweens.add({ targets: target, alpha: 0.6, duration: 100, yoyo: true, ease: 'Linear' });
        }

        if (target.hp <= 0) {
            objective.active = false;
            objective.baseHp = 0;
            createExplosion(scene, target.x, target.y, 0xff6b35);
            for (let i = 0; i < 4; i++) {
                scene.time.delayedCall(i * 120, () => {
                    createExplosion(scene, target.x + (Math.random() - 0.5) * 60, target.y + (Math.random() - 0.5) * 40, 0xff6b35);
                });
            }
            target.destroy();
            scene.assaultBase = null;
            const baseReward = getMissionScaledReward(5000);
            gameState.score += baseReward;
            screenShake(scene, 20, 400);
            winGame(scene);
        }

        if (projectile && projectile.active && !projectile.isPiercing) projectile.destroy();
        return;
    }

    if (target.assaultRole === 'shield') {
        target.hp -= (projectile.damage || 1);
        scene.tweens.add({ targets: target, alpha: 0.6, duration: 80, yoyo: true, ease: 'Linear' });

        if (target.hp <= 0) {
            objective.extShieldsRemaining = Math.max(0, (objective.extShieldsRemaining || 1) - 1);
            objective.shieldsRemaining = objective.extShieldsRemaining;
            createExplosion(scene, target.x, target.y, 0x22d3ee);
            target.destroy();

            if (objective.extShieldsRemaining === 0) {
                objective.extShieldsCleared = true;
                showRebuildObjectiveBanner(scene, 'Shield generators destroyed — break the core shields!', '#22d3ee');
                screenShake(scene, 8, 150);
            }
        }

        if (projectile && projectile.active && !projectile.isPiercing) projectile.destroy();
        return;
    }

    if (target.assaultRole === 'turret') {
        target.hp -= (projectile.damage || 1);
        scene.tweens.add({ targets: target, alpha: 0.6, duration: 80, yoyo: true, ease: 'Linear' });

        if (target.hp <= 0) {
            createExplosion(scene, target.x, target.y, 0xf97316);
            target.destroy();
        }

        if (projectile && projectile.active && !projectile.isPiercing) projectile.destroy();
    }
}
