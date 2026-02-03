// ------------------------
// Operative Core - Friendly Comrade Spawning and Combat Helpers
// ------------------------

const OPERATIVE_CONFIGS = {
    infantry: {
        texture: 'operativeInfantry',
        hp: 4,
        scale: 1.8,
        shot: { texture: 'projectile', speed: 380, damage: 1 }
    },
    heavy: {
        texture: 'operativeHeavy',
        hp: 6,
        scale: 1.9,
        shot: { texture: 'projectile', speed: 320, damage: 2 }
    },
    medic: {
        texture: 'operativeMedic',
        hp: 4,
        scale: 1.8
    },
    saboteur: {
        texture: 'operativeSaboteur',
        hp: 4,
        scale: 1.8,
        shot: { texture: 'projectile', speed: 340, damage: 1 }
    }
};

function getOperativeConfig(type) {
    return OPERATIVE_CONFIGS[type] || OPERATIVE_CONFIGS.infantry;
}

function spawnOperative(scene, type, x, y) {
    const { operatives } = scene;
    if (!operatives) return null;

    const config = getOperativeConfig(type);
    const edgePadding = 80;
    const clampedX = Phaser.Math.Clamp(x, edgePadding, CONFIG.worldWidth - edgePadding);
    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    const terrainVariation = Math.sin(clampedX / 200) * 30;
    const minClearance = 28;
    const maxY = groundLevel - terrainVariation - minClearance;
    const spawnY = Phaser.Math.Clamp(y, 20, Math.max(30, maxY));

    const operative = operatives.create(clampedX, spawnY, config.texture);
    operative.setDepth(FG_DEPTH_BASE + 2);
    operative.setScale(config.scale || 1.8);
    operative.friendlyType = 'operative';
    operative.operativeType = type;
    operative.hp = config.hp;
    operative.maxHp = config.hp;
    operative.lastShot = 0;
    operative.lastSupport = 0;
    operative.lastSabotage = 0;
    operative.braced = false;
    operative.braceTimer = 0;
    operative.homeX = clampedX;
    operative.homeY = spawnY;

    const speed = 40 + Math.random() * 60;
    operative.setVelocity((Math.random() - 0.5) * speed, (Math.random() - 0.5) * speed);

    createSpawnEffect(scene, clampedX, spawnY, 'ally');
    return operative;
}

function operativeShootAtTarget(scene, operative, target, angleOverride = null) {
    const { projectiles } = scene;
    if (!projectiles || !operative || !target) return;
    const config = getOperativeConfig(operative.operativeType);
    if (!config.shot) return;

    const angle = angleOverride ?? Phaser.Math.Angle.Between(operative.x, operative.y, target.x, target.y);
    const proj = projectiles.create(operative.x, operative.y, config.shot.texture || 'projectile');
    proj.setDepth(FG_DEPTH_BASE + 4);
    proj.setScale(0.9);
    proj.setVelocity(Math.cos(angle) * config.shot.speed, Math.sin(angle) * config.shot.speed);
    proj.rotation = angle;
    proj.damage = config.shot.damage || 1;
    proj.projectileType = 'operative';

    scene.time.delayedCall(2500, () => {
        if (proj && proj.active) proj.destroy();
    });
}

function spawnMedkitPowerUp(scene, x, y) {
    const { powerUps } = scene;
    if (!powerUps) return null;
    const medkit = powerUps.create(x, y, 'powerup_medkit');
    medkit.setScale(1.1);
    medkit.setDepth(FG_DEPTH_BASE + 3);
    medkit.powerUpType = 'medkit';
    medkit.birthTime = scene.time.now;
    scene.tweens.add({
        targets: medkit,
        y: y - 8,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    scene.time.delayedCall(15000, () => {
        if (medkit && medkit.active) medkit.destroy();
    });
    return medkit;
}

function hitOperative(projectile, operative) {
    if (!operative || !operative.active) return;
    operative.hp -= projectile.damage || 1;
    if (this.audioManager) this.audioManager.playSound('hitEnemy');
    if (this.particleManager) this.particleManager.bulletExplosion(operative.x, operative.y);
    if (operative.hp <= 0) destroyOperative(this, operative);
    if (projectile && projectile.active && !projectile.isPiercing) {
        projectile.destroy();
    }
}

function destroyOperative(scene, operative) {
    const { operatives, particleManager, audioManager } = scene;
    if (!operatives || !operative || operative.isBeingDestroyed) return;
    operative.isBeingDestroyed = true;

    if (particleManager) {
        if (audioManager) audioManager.playSound('explosion');
        particleManager.enemyExplosion(operative.x, operative.y);
    }
    createEnhancedDeathEffect(scene, operative.x, operative.y, operative.operativeType || 'operative');
    operative.destroy();
}

if (typeof module !== 'undefined') {
    module.exports = {
        spawnOperative
    };
}

