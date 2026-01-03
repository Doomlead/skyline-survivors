// ------------------------
// Assault Base Core - Objective Setup and Damage Handling
// ------------------------

const ASSAULT_BASE_CONFIG = {
    baseHp: 70,
    shieldGeneratorHp: 18,
    turretHp: 16,
    shieldGeneratorCount: 2,
    turretCount: 3,
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

function showAssaultObjectiveBanner(scene, message, color) {
    const manager = scene?.gameManager;
    if (manager && typeof manager.showRebuildObjectiveBanner === 'function') {
        manager.showRebuildObjectiveBanner(scene, message, color);
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

    const baseTexture = getAssaultBaseTextureKey(objective);
    objective.baseVariant = baseTexture;
    const baseX = CONFIG.worldWidth * 0.5;
    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    const terrainVariation = Math.sin(baseX / 200) * 30;
    const terrainY = typeof getTerrainHeightAtX === 'function'
        ? getTerrainHeightAtX(baseX)
        : null;
    const fallbackGroundY = groundLevel - terrainVariation - 4;
    const baseGroundY = typeof terrainY === 'number' ? terrainY : fallbackGroundY;
    const baseTextureSource = scene.textures.get(baseTexture)?.getSourceImage();
    const baseHeight = baseTextureSource?.height || 88;
    const baseY = Math.max(140, baseGroundY - baseHeight / 2);

    const base = createAssaultComponent(scene, baseX, baseY, baseTexture, 'core', scaledHp);
    scene.assaultBase = base;
    objective.baseX = baseX;

    objective.shieldsRemaining = ASSAULT_BASE_CONFIG.shieldGeneratorCount;
    const shieldOffset = 120;
    for (let i = 0; i < ASSAULT_BASE_CONFIG.shieldGeneratorCount; i++) {
        const direction = i % 2 === 0 ? -1 : 1;
        const shieldX = wrapAssaultX(scene, baseX + direction * shieldOffset);
        const shieldY = baseY - 10;
        createAssaultComponent(scene, shieldX, shieldY, 'assaultShieldGen', 'shield', ASSAULT_BASE_CONFIG.shieldGeneratorHp);
    }

    const turretSpread = 170;
    for (let i = 0; i < ASSAULT_BASE_CONFIG.turretCount; i++) {
        const offset = turretSpread * ((i / (ASSAULT_BASE_CONFIG.turretCount - 1)) - 0.5);
        const turretX = wrapAssaultX(scene, baseX + offset);
        const turretY = baseY + 34;
        createAssaultComponent(scene, turretX, turretY, 'assaultTurret', 'turret', ASSAULT_BASE_CONFIG.turretHp);
    }

    showAssaultObjectiveBanner(scene, 'ASSAULT OBJECTIVE: Destroy the base core', '#f97316');
    spawnAssaultDefenders(scene, baseX);
}

function hitAssaultTarget(projectile, target) {
    const objective = gameState.assaultObjective;
    if (!objective || !objective.active || !target.active) {
        if (projectile && projectile.active) projectile.destroy();
        return;
    }

    if (target.assaultRole === 'core' && objective.shieldsRemaining > 0) {
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
                showAssaultObjectiveBanner(this, 'Shield generators down - core exposed', '#22d3ee');
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
    if (projectile && projectile.active) projectile.destroy();
}
