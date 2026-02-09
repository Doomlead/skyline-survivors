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
    reinforcementCap: 10
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
    component.nextShot = Phaser.Math.Between(600, 1200);
    return component;
}

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

    objective.shieldsRemaining = ASSAULT_BASE_CONFIG.shieldGeneratorCount;
    const shieldOffset = 120;
    for (let i = 0; i < ASSAULT_BASE_CONFIG.shieldGeneratorCount; i++) {
        const direction = i % 2 === 0 ? -1 : 1;
        const shieldX = wrapValue(baseX + direction * shieldOffset, CONFIG.worldWidth);
        const shieldY = baseY - 10;
        createAssaultComponent(scene, shieldX, shieldY, 'assaultShieldGen', 'shield', ASSAULT_BASE_CONFIG.shieldGeneratorHp);
    }

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

function hitAssaultTarget(projectile, target) {
    const mothershipObjective = gameState.mothershipObjective;
    const isMothershipEncounter = gameState.mode === 'mothership' && mothershipObjective?.active;
    const isMothershipExterior = isMothershipEncounter && target?.mothershipRole === 'exterior';
    const isMothershipInterior = isMothershipEncounter && target?.mothershipRole === 'interior';
    if (isMothershipExterior || isMothershipInterior) {
        if (!target.active) {
            if (projectile && projectile.active) projectile.destroy();
            return;
        }
        if (projectile && projectile.empDisableDuration && target.assaultRole === 'turret') {
            target.empDisabledUntil = this.time.now + projectile.empDisableDuration;
            createExplosion(this, target.x, target.y, 0x38bdf8);
        }
        target.hp -= projectile.damage || 1;
        if (target.hp <= 0) {
            if (isMothershipExterior) {
                mothershipObjective.exteriorHardpointsRemaining = Math.max(
                    0,
                    (mothershipObjective.exteriorHardpointsRemaining ?? 0) - 1
                );
            } else if (isMothershipInterior) {
                mothershipObjective.interiorObjectivesRemaining = Math.max(
                    0,
                    (mothershipObjective.interiorObjectivesRemaining ?? 0) - 1
                );
            }
            createExplosion(this, target.x, target.y, 0xff6b35);
            target.destroy();
            if (isMothershipExterior && mothershipObjective.exteriorHardpointsRemaining === 0) {
                showRebuildObjectiveBanner(this, 'EXTERIOR DEFENSE GRID DOWN', '#22d3ee');
                screenShake(this, 10, 300);
            }
            if (isMothershipInterior && mothershipObjective.interiorObjectivesRemaining === 0) {
                showRebuildObjectiveBanner(this, 'INTERIOR POWER GRID DISABLED', '#a855f7');
                screenShake(this, 10, 280);
            }
        }
        if (projectile && projectile.active && !projectile.isPiercing) {
            projectile.destroy();
        }
        return;
    }

    const objective = gameState.assaultObjective;
    if (!objective || !objective.active || !target.active) {
        if (projectile && projectile.active) projectile.destroy();
        return;
    }

    if (projectile && projectile.empDisableDuration && (target.assaultRole === 'turret' || target.assaultRole === 'shield')) {
        target.empDisabledUntil = this.time.now + projectile.empDisableDuration;
        createExplosion(this, target.x, target.y, 0x38bdf8);
    }

    if (target.assaultRole === 'core' && isAssaultShieldBlocking(this)) {
        if (objective.shieldHitCooldown <= 0) {
            createExplosion(this, target.x, target.y - 6, 0x38bdf8);
            objective.shieldHitCooldown = 350;
        }
        if (projectile && projectile.active) projectile.destroy();
        return;
    }

    target.hp -= projectile.damage || 1;
    if (target.assaultRole === 'core') {
        objective.baseHp = Math.max(0, target.hp);
    }

    if (target.hp <= 0) {
        if (target.assaultRole === 'shield') {
            objective.shieldsRemaining = Math.max(0, objective.shieldsRemaining - 1);
            createExplosion(this, target.x, target.y, 0x22d3ee);
            if (objective.shieldsRemaining === 0) {
                showRebuildObjectiveBanner(this, 'Shield generators down - core exposed', '#22d3ee');
            }
            target.destroy();
        } else if (target.assaultRole === 'turret') {
            createExplosion(this, target.x, target.y, 0xf97316);
            target.destroy();
        } else {
            objective.active = false;
            objective.baseHp = 0;
            createExplosion(this, target.x, target.y, 0xff6b35);
            target.destroy();
            this.assaultBase = null;
            const baseReward = getMissionScaledReward(5000);
            gameState.score += baseReward;
            winGame(this);
        }
    }
    if (projectile && projectile.active && !projectile.isPiercing) {
        projectile.destroy();
    }
}
