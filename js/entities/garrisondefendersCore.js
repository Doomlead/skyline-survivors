// ------------------------
// Garrison Defender Spawning, Combat, and Core Management
// ------------------------

const GARRISON_DEFENDER_CONFIGS = {
    rifle: {
        texture: 'garrisonDefenderRifle',
        hp: 3,
        score: 220,
        scale: 2.0,
        shot: { texture: 'enemyProjectile', speed: 320, damage: 1 }
    },
    shield: {
        texture: 'garrisonDefenderShield',
        hp: 5,
        score: 260,
        scale: 2.1,
        shot: { texture: 'enemyProjectile', speed: 260, damage: 1 }
    },
    heavy: {
        texture: 'garrisonDefenderHeavy',
        hp: 6,
        score: 320,
        scale: 2.2,
        shot: { texture: 'enemyProjectile_bomber', speed: 260, damage: 2 }
    },
    sniper: {
        texture: 'garrisonDefenderSniper',
        hp: 3,
        score: 300,
        scale: 2.0,
        shot: { texture: 'enemyProjectile_piercing', speed: 460, damage: 2 }
    },
    medic: {
        texture: 'garrisonDefenderMedic',
        hp: 4,
        score: 240,
        scale: 2.0,
        shot: { texture: 'enemyProjectile', speed: 280, damage: 1 }
    },
    engineer: {
        texture: 'garrisonDefenderEngineer',
        hp: 4,
        score: 240,
        scale: 2.0,
        shot: { texture: 'enemyProjectile', speed: 290, damage: 1 }
    },
    jetpack: {
        texture: 'garrisonDefenderJetpack',
        hp: 3,
        score: 260,
        scale: 2.0,
        shot: { texture: 'enemyProjectile_swarmer', speed: 380, damage: 1 }
    },
    drone: {
        texture: 'garrisonDefenderDrone',
        hp: 3,
        score: 230,
        scale: 2.0,
        shot: { texture: 'enemyProjectile_drone', speed: 340, damage: 1 }
    },
    walker: {
        texture: 'garrisonDefenderWalker',
        hp: 7,
        score: 340,
        scale: 2.1,
        shot: { texture: 'enemyProjectile', speed: 240, damage: 2 }
    },
    hound: {
        texture: 'garrisonDefenderHound',
        hp: 4,
        score: 280,
        scale: 2.0,
        shot: { texture: 'enemyProjectile_swarmer', speed: 360, damage: 1.5 }
    }
};

const GARRISON_DEFENDER_TYPES = Object.keys(GARRISON_DEFENDER_CONFIGS);

function getGarrisonDefenderConfig(type) {
    return GARRISON_DEFENDER_CONFIGS[type] || GARRISON_DEFENDER_CONFIGS.rifle;
}

function spawnGarrisonDefender(scene, type, x, y) {
    const { garrisonDefenders, audioManager } = scene;
    if (!garrisonDefenders) return null;

    const config = getGarrisonDefenderConfig(type);
    const edgePadding = 100;
    const clampedX = Phaser.Math.Clamp(x, edgePadding, CONFIG.worldWidth - edgePadding);
    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    const terrainVariation = Math.sin(clampedX / 200) * 30;
    const minClearance = 32;
    const topLimit = 20;
    const maxY = groundLevel - terrainVariation - minClearance;
    const spawnY = Phaser.Math.Clamp(y, topLimit, Math.max(topLimit + 10, maxY));

    const defender = garrisonDefenders.create(clampedX, spawnY, config.texture);
    defender.setDepth(FG_DEPTH_BASE + 2);
    defender.setScale(config.scale);
    defender.garrisonType = type;
    defender.hp = config.hp;
    defender.maxHp = config.hp;
    defender.lastShot = 0;
    defender.lastSupport = 0;
    defender.patrolAngle = Math.random() * Math.PI * 2;
    defender.homeX = clampedX;
    defender.homeY = spawnY;
    defender.positionTimer = 0;

    const speed = 50 + Math.random() * 80;
    defender.setVelocity((Math.random() - 0.5) * speed, (Math.random() - 0.5) * speed);

    createSpawnEffect(scene, clampedX, spawnY, 'enemy');
    if (audioManager) audioManager.playSound('enemySpawn');

    return defender;
}

function garrisonShootAtPlayer(scene, defender, forcedAngle = null, overrideType = null) {
    const { enemyProjectiles, audioManager } = scene;
    const player = getActivePlayer(scene);
    if (!player || !enemyProjectiles || !defender) return;

    const typeKey = overrideType || defender.garrisonType;
    const config = getGarrisonDefenderConfig(typeKey);
    const angle = forcedAngle ?? Phaser.Math.Angle.Between(defender.x, defender.y, player.x, player.y);

    const proj = enemyProjectiles.create(defender.x, defender.y, config.shot.texture || 'enemyProjectile');
    proj.setDepth(FG_DEPTH_BASE + 4);
    proj.setScale(1.3);
    proj.setVelocity(Math.cos(angle) * config.shot.speed, Math.sin(angle) * config.shot.speed);
    proj.rotation = angle;
    proj.enemyType = `garrison-${typeKey}`;
    proj.damage = config.shot.damage || 1;

    if (audioManager) audioManager.playSound('enemyShoot');
    scene.time.delayedCall(3000, () => {
        if (proj && proj.active) proj.destroy();
    });
}

function hitGarrisonDefender(projectile, defender) {
    const { audioManager, particleManager } = this;
    defender.hp -= projectile.damage || 1;
    if (audioManager) audioManager.playSound('hitEnemy');
    if (particleManager) particleManager.bulletExplosion(defender.x, defender.y);
    if (defender.hp <= 0) destroyGarrisonDefender(this, defender);
    projectile.destroy();
}

function destroyGarrisonDefender(scene, defender) {
    const { garrisonDefenders, particleManager, audioManager } = scene;
    if (!garrisonDefenders || !defender || defender.isBeingDestroyed) return;
    defender.isBeingDestroyed = true;

    if (particleManager) {
        if (audioManager) audioManager.playSound('explosion');
        particleManager.enemyExplosion(defender.x, defender.y);
    }
    createEnhancedDeathEffect(scene, defender.x, defender.y, defender.garrisonType);

    const score = getMissionScaledReward(getGarrisonDefenderScore(defender.garrisonType));
    gameState.score += score;

    const scorePopup = scene.add.text(
        defender.x, defender.y - 20,
        '+' + score,
        {
            fontSize: '16px',
            fontFamily: 'Orbitron',
            color: '#ffd166',
            stroke: '#000000',
            strokeThickness: 3
        }
    ).setOrigin(0.5);

    scene.tweens.add({
        targets: scorePopup,
        y: scorePopup.y - 30,
        alpha: 0,
        duration: 1000,
        onComplete: () => scorePopup.destroy()
    });

    if (Math.random() < 0.15) spawnPowerUp(scene, defender.x, defender.y);
    defender.destroy();
}

function getGarrisonDefenderScore(type) {
    const config = getGarrisonDefenderConfig(type);
    return config.score || 200;
}

function playerHitGarrisonDefender(playerSprite, defender) {
    const audioManager = this.audioManager;
    if (playerState.powerUps.invincibility > 0) {
        destroyGarrisonDefender(this, defender);
        return;
    }
    if (playerState.powerUps.shield > 0) {
        playerState.powerUps.shield = 0;
        destroyGarrisonDefender(this, defender);
        screenShake(this, 10, 200);
        if (audioManager) audioManager.playSound('hitPlayer');
    } else {
        screenShake(this, 15, 300);
        playerDie(this);
    }
}

if (typeof module !== 'undefined') {
    module.exports = {
        spawnGarrisonDefender,
        destroyGarrisonDefender
    };
}
