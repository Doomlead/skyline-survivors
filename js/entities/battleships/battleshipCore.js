// ------------------------
// Battleship Spawning, Combat, and Core Management
// ------------------------

const BATTLESHIP_TYPES = ['raider', 'carrier', 'nova', 'siege', 'dreadnought'];

const BATTLESHIP_TEXTURES = {
    raider: 'battleshipRaider',
    carrier: 'battleshipCarrier',
    nova: 'battleshipNova',
    siege: 'battleshipSiege',
    dreadnought: 'battleshipDreadnought'
};

const BATTLESHIP_TRAIL_CONFIGS = {
    raider: {
        tint: [0xf87171],
        speed: 40,
        scale: { start: 0.45, end: 0 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 220,
        frequency: 70
    },
    carrier: {
        tint: [0xfb923c],
        speed: 25,
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 300,
        frequency: 120
    },
    nova: {
        tint: [0x6366f1],
        speed: 30,
        scale: { start: 0.55, end: 0 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 260,
        frequency: 90
    },
    siege: {
        tint: [0x9ca3af],
        speed: 20,
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.4, end: 0 },
        lifespan: 320,
        frequency: 140
    },
    dreadnought: {
        tint: [0xa855f7],
        speed: 22,
        scale: { start: 0.7, end: 0 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 320,
        frequency: 110
    }
};

const BATTLESHIP_HP_MULTIPLIER = 3;

const BATTLESHIP_HP_VALUES = {
    raider: 16,
    carrier: 22,
    nova: 20,
    siege: 24,
    dreadnought: 30
};

const BATTLESHIP_SCORE_VALUES = {
    raider: 300,
    carrier: 450,
    nova: 400,
    siege: 500,
    dreadnought: 700
};

const BATTLESHIP_SCALE_VALUES = {
    raider: 2.4,
    carrier: 2.6,
    nova: 2.5,
    siege: 2.7,
    dreadnought: 2.9
};

const BATTLESHIP_SHOT_CONFIGS = {
    raider: {
        projectileType: 'enemyProjectile_baiter',
        speed: 420,
        damage: 1.1,
        interval: 800
    },
    carrier: {
        projectileType: 'enemyProjectile_drone',
        speed: 300,
        damage: 1.4,
        interval: 1400
    },
    nova: {
        projectileType: 'enemyProjectile_pod',
        speed: 260,
        damage: 1.2,
        interval: 1300
    },
    siege: {
        projectileType: 'enemyProjectile_piercing',
        speed: 360,
        damage: 2.2,
        interval: 1700
    },
    dreadnought: {
        projectileType: 'enemyProjectile',
        speed: 320,
        damage: 1.8,
        interval: 1200
    }
};

function getRandomBattleshipType() {
    return Phaser.Utils.Array.GetRandom(BATTLESHIP_TYPES);
}

function getBattleshipHP(type) {
    const baseHP = BATTLESHIP_HP_VALUES[type] || 18;
    return Math.round(baseHP * BATTLESHIP_HP_MULTIPLIER);
}

function getBattleshipScore(type) {
    return BATTLESHIP_SCORE_VALUES[type] || 300;
}

function getBattleshipScale(type) {
    return BATTLESHIP_SCALE_VALUES[type] || 2.4;
}

function getBattleshipShotConfig(type) {
    return BATTLESHIP_SHOT_CONFIGS[type] || BATTLESHIP_SHOT_CONFIGS.raider;
}

function createBattleshipTrail(scene, battleship) {
    if (!scene || !battleship) return;

    const cfg = BATTLESHIP_TRAIL_CONFIGS[battleship.battleshipType] || BATTLESHIP_TRAIL_CONFIGS.raider;
    const emitter = scene.add.particles(0, 0, 'particle', {
        follow: battleship,
        lifespan: cfg.lifespan,
        scale: cfg.scale,
        alpha: cfg.alpha,
        tint: cfg.tint,
        quantity: cfg.quantity || 1,
        frequency: cfg.frequency,
        speedX: { min: -cfg.speed, max: cfg.speed },
        speedY: { min: -cfg.speed * 0.6, max: cfg.speed * 0.6 },
        blendMode: cfg.blendMode || 'ADD',
        gravityY: cfg.gravityY || 0
    });

    battleship.trailEmitter = emitter;
    battleship.once('destroy', () => {
        const trail = battleship.trailEmitter;
        if (trail) {
            trail.stop();
            trail.stopFollow();
            scene.time.delayedCall(400, () => {
                if (trail && trail.destroy) trail.destroy();
            });
            battleship.trailEmitter = null;
        }
    });
}

function spawnBattleship(scene, type, x, y) {
    const { battleships, audioManager } = scene;
    if (!battleships) return null;
    const key = BATTLESHIP_TEXTURES[type] || BATTLESHIP_TEXTURES.raider;

    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    const terrainVariation = Math.sin(x / 200) * 30;
    const minClearance = 70;
    const topLimit = 30;
    const maxY = groundLevel - terrainVariation - minClearance;
    const spawnY = Phaser.Math.Clamp(y, topLimit, Math.max(topLimit + 20, maxY));

    const battleship = battleships.create(x, spawnY, key);
    battleship.setDepth(FG_DEPTH_BASE + 5);

    battleship.battleshipType = type;
    battleship.hp = getBattleshipHP(type);
    battleship.maxHP = battleship.hp;
    battleship.lastShot = 0;
    if (typeof initializeShieldPhaseState === 'function') {
        initializeShieldPhaseState(battleship, {
            shieldStages: 2,
            shieldBaseHp: Math.ceil(battleship.maxHP * 0.24),
            damageWindowMs: 3000,
            intermissionMs: 1300,
            label: 'Phase'
        });
    }

    battleship.setScale(getBattleshipScale(type));

    if (type === 'carrier') {
        battleship.launchTimer = 0;
        battleship.launchInterval = 2800;
        battleship.minionsSpawned = 0;
        battleship.maxMinions = 6;
    }

    const initialSpeed = type === 'siege' ? 30 : 60;
    battleship.setVelocity((Math.random() - 0.5) * initialSpeed, (Math.random() - 0.5) * initialSpeed);

    createSpawnEffect(scene, x, spawnY, 'boss');
    if (audioManager) audioManager.playSound('enemySpawn');
    createBattleshipTrail(scene, battleship);

    return battleship;
}

function shootFromBattleshipSource(scene, sourceX, sourceY, battleship, shotConfig, fireAngle) {
    const { enemyProjectiles, audioManager } = scene;
    const player = getActivePlayer(scene);
    if (!player || !enemyProjectiles) return;

    const proj = enemyProjectiles.create(sourceX, sourceY, shotConfig.projectileType);
    proj.setDepth(FG_DEPTH_BASE + 4);
    proj.setScale(1.4);

    let angle = fireAngle;
    if (!angle) {
        angle = Phaser.Math.Angle.Between(sourceX, sourceY, player.x, player.y);
    }

    proj.setVelocity(
        Math.cos(angle) * shotConfig.speed,
        Math.sin(angle) * shotConfig.speed
    );
    proj.rotation = angle;
    proj.enemyType = battleship.battleshipType;
    proj.damage = shotConfig.damage;

    if (audioManager) audioManager.playSound('enemyShoot');
    scene.time.delayedCall(3500, () => {
        if (proj && proj.active) proj.destroy();
    });
}

function hitBattleship(projectile, battleship) {
    const scene = projectile.scene;
    const audioManager = scene.audioManager;
    const particleManager = scene.particleManager;

    const now = scene.time?.now || 0;
    const incomingDamage = projectile.damage || 1;
    const shieldResult = typeof applyShieldStageDamage === 'function'
        ? applyShieldStageDamage(battleship, incomingDamage, now)
        : { appliedToShield: false, shieldBroken: false };

    if (!shieldResult.appliedToShield) {
        battleship.hp -= incomingDamage;
    }

    scene.tweens.add({
        targets: battleship,
        alpha: 0.6,
        duration: 100,
        yoyo: true,
        ease: 'Linear'
    });

    if (audioManager) audioManager.playSound('hitEnemy');
    if (shieldResult.shieldBroken) {
        createExplosion(scene, battleship.x, battleship.y, 0x67e8f9);
    }
    if (projectile.projectileType === 'homing' && particleManager) {
        particleManager.bulletExplosion(battleship.x, battleship.y);
    }
    if (projectile.projectileType === 'homing' && projectile.homingTier === 3 && !projectile.hasClustered) {
        projectile.hasClustered = true;
        spawnClusterMissiles(scene, projectile, battleship);
    }

    if (battleship.hp <= 0) destroyBattleship(scene, battleship);
    if (projectile && projectile.active && !projectile.isPiercing) {
        projectile.destroy();
    }
}

function playerHitBattleship(playerSprite, battleship) {
    const scene = battleship.scene;
    const audioManager = scene.audioManager;

    const now = scene.time?.now || 0;
    const collisionDamage = playerState.powerUps.invincibility > 0 ? 2 : 1;
    const shieldResult = typeof applyShieldStageDamage === 'function'
        ? applyShieldStageDamage(battleship, collisionDamage, now)
        : { appliedToShield: false };

    if (playerState.powerUps.invincibility > 0) {
        if (!shieldResult.appliedToShield) battleship.hp -= 2;
        if (battleship.hp <= 0) destroyBattleship(scene, battleship);
        return;
    }

    if (playerState.powerUps.shield > 0) {
        playerState.powerUps.shield = 0;
        if (!shieldResult.appliedToShield) battleship.hp -= 1;
        if (battleship.hp <= 0) destroyBattleship(scene, battleship);
        screenShake(scene, 12, 200);
        if (audioManager) audioManager.playSound('hitPlayer');
    } else {
        screenShake(scene, 18, 320);
        playerDie(scene);
    }
}

function startBattleshipEncounter(scene, triggerInfo = {}) {
    if (gameState.battleshipActive) return null;

    const battleshipType = getRandomBattleshipType();
    if (!battleshipType) return null;

    const spawnOffset = Math.random() < 0.5 ? -220 : 220;
    const spawnX = scene.cameras.main.scrollX + CONFIG.width / 2 + spawnOffset;
    const spawnY = CONFIG.height / 2;

    gameState.battleshipActive = true;
    gameState.currentBossKey = `battleship-${battleshipType}`;
    gameState.currentBossName = `battleship-${battleshipType}`;

    const warning = scene.add.text(
        CONFIG.width / 2,
        CONFIG.height / 2,
        `WARNING!\nBATTLESHIP INBOUND`,
        {
            fontSize: '32px',
            fontFamily: 'Orbitron',
            color: '#ff6b6b',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(210);

    scene.tweens.add({
        targets: warning,
        alpha: 0,
        y: CONFIG.height / 2 - 40,
        duration: 2500,
        onComplete: () => warning.destroy()
    });

    if (triggerInfo.mode === 'classic' && triggerInfo.wave) {
        gameState.classicBossFlags[triggerInfo.wave] = true;
    }

    return spawnBattleship(scene, battleshipType, spawnX, spawnY);
}

function completeBattleshipWave(scene) {
    const audioManager = scene.audioManager;
    const completedWave = gameState.wave;
    const battleReward = getMissionScaledReward(3500);
    gameState.score += battleReward;
    if (audioManager) audioManager.playSound('waveComplete');

    const battleText = scene.add.text(
        CONFIG.width / 2,
        CONFIG.height / 2,
        `BATTLESHIP DESTROYED!\nWAVE ${completedWave} COMPLETE!\nBonus: ${battleReward} points`,
        {
            fontSize: '32px',
            fontFamily: 'Orbitron',
            color: '#00ff88',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    scene.tweens.add({
        targets: battleText,
        alpha: 0,
        y: CONFIG.height / 2 - 80,
        duration: 3000,
        onComplete: () => battleText.destroy()
    });

    const waveLimit = typeof CLASSIC_WAVE_LIMIT === 'number' ? CLASSIC_WAVE_LIMIT : 15;
    if (gameState.mode === 'classic' && completedWave >= waveLimit) {
        scene.time.delayedCall(1000, () => {
            winGame(scene);
        });
        return;
    }

    gameState.wave++;
    gameState.killsThisWave = 0;
    gameState.enemiesToKillThisWave = 20 + (gameState.wave - 1) * 5;

    scene.time.delayedCall(3000, () => {
        spawnEnemyWave(scene);
    });
}

function destroyBattleship(scene, battleship) {
    const { battleships } = scene;
    if (!battleships) return;

    screenShake(scene, 18, 400);

    for (let i = 0; i < 2; i++) {
        setTimeout(() => {
            createEnhancedDeathEffect(scene, battleship.x, battleship.y, battleship.battleshipType);
        }, i * 150);
    }

    registerComboEvent(2);
    const score = getCombatScaledReward(getBattleshipScore(battleship.battleshipType));
    gameState.score += score;

    const scorePopup = scene.add.text(
        battleship.x, battleship.y - 30,
        `+${score}`,
        {
            fontSize: '20px',
            fontFamily: 'Orbitron',
            color: '#ffe066',
            stroke: '#000000',
            strokeThickness: 3
        }
    ).setOrigin(0.5).setDepth(FG_DEPTH_BASE + 10);

    scene.tweens.add({
        targets: scorePopup,
        y: scorePopup.y - 50,
        alpha: 0,
        duration: 1500,
        onComplete: () => scorePopup.destroy()
    });

    spawnPowerUp(scene, battleship.x, battleship.y);
    battleship.destroy();

    if (battleships.countActive(true) === 0) {
        gameState.battleshipActive = false;
        if (gameState.currentBossKey && gameState.currentBossKey.startsWith('battleship')) {
            gameState.currentBossKey = null;
            gameState.currentBossName = '';
        }
    }

    if (gameState.mode === 'classic'
        && battleships.countActive(true) === 0
        && scene.enemies?.countActive(true) === 0) {
        completeBattleshipWave(scene);
    }
}

if (typeof module !== 'undefined') {
    module.exports = { spawnBattleship, destroyBattleship };
}
