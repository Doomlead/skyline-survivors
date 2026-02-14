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

function hitAssaultTarget(projectile, target) {
    const mothershipObjective = gameState.mothershipObjective;
    if (target?.assaultRole && typeof target.assaultRole === 'string' && target.assaultRole.indexOf('interior_') === 0) {
        if (mothershipObjective?.active && mothershipObjective.stage === 'interior_assault' && typeof hitMothershipInteriorTarget === 'function') {
            hitMothershipInteriorTarget(projectile, target);
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
        objective.active = false;
        objective.baseHp = 0;
        createExplosion(scene, target.x, target.y, 0xff6b35);
        if (target && target.active && target.assaultRole === 'core') target.destroy();
        scene.assaultBase = null;
        const baseReward = getMissionScaledReward(5000);
        gameState.score += baseReward;
        winGame(scene);
    }
}