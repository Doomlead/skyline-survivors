// ------------------------
// File: js/entities/bosses/bossCore.js
// ------------------------

// Creates and attaches the configured particle trail emitter for a spawned boss.
function createBossTrail(scene, boss) {
    if (!scene || !boss) return;
    if (boss.bossType === 'fortressTurret' || boss.bossType === 'mothershipCore') return;

    const cfg = BOSS_TRAIL_CONFIGS[boss.bossType] || BOSS_TRAIL_CONFIGS.megaLander;
    const emitter = scene.add.particles(0, 0, 'particle', {
        follow: boss,
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

    boss.trailEmitter = emitter;
    boss.once('destroy', () => {
        const trail = boss.trailEmitter;
        if (trail) {
            trail.stop();
            trail.stopFollow();
            scene.time.delayedCall(500, () => {
                if (trail && trail.destroy) trail.destroy();
            });
            boss.trailEmitter = null;
        }
    });
}

// Builds and shuffles the boss encounter queue used by classic/survival progression.
function initializeBossQueue() {
    const pool = BOSS_TYPES.filter(type => type !== 'mothershipCore');
    const queue = [];

    while (queue.length < 3 && pool.length > 0) {
        const pickIndex = Math.floor(Math.random() * pool.length);
        queue.push(pool.splice(pickIndex, 1)[0]);
    }

    gameState.bossQueue = queue;
    gameState.bossesDefeated = 0;
}

// Finds a collision-safe boss spawn position away from player and nearby entities.
function getSafeBossSpawnPosition(scene, desiredX, desiredY, bossType) {
    const player = getActivePlayer(scene);
    if (!player) return { x: desiredX, y: desiredY };

    const minDistance = bossType === 'mothershipCore' ? 180 : 1500;
    const attempts = 6;
    const baseDirection = Math.random() < 0.5 ? -1 : 1;
    const baseX = wrapValue(player.x + baseDirection * minDistance, CONFIG.worldWidth);
    const baseY = Phaser.Math.Clamp(desiredY, 40, CONFIG.worldHeight - 80);
    let bestCandidate = { x: baseX, y: baseY };
    let bestDistance = Math.hypot(wrappedDistance(player.x, baseX, CONFIG.worldWidth), player.y - baseY);

    for (let i = 0; i < attempts; i++) {
        const offsetX = i === 0 ? 0 : (Math.random() < 0.5 ? -1 : 1) * (minDistance + Math.random() * 220);
        const offsetY = i === 0 ? 0 : (Math.random() < 0.5 ? -1 : 1) * (minDistance * 0.2 + Math.random() * 120);
        const candidateX = wrapValue(baseX + offsetX, CONFIG.worldWidth);
        const candidateY = Phaser.Math.Clamp(baseY + offsetY, 40, CONFIG.worldHeight - 80);
        const dx = wrappedDistance(player.x, candidateX, CONFIG.worldWidth);
        const dy = player.y - candidateY;
        const distance = Math.hypot(dx, dy);

        if (distance >= minDistance) {
            return { x: candidateX, y: candidateY };
        }

        if (distance > bestDistance) {
            bestDistance = distance;
            bestCandidate = { x: candidateX, y: candidateY };
        }
    }

    return bestCandidate;
}

// Applies boss damage reduction rules and returns effective damage dealt.
function applyBossDamage(boss, rawDamage) {
    const damage = rawDamage || 1;
    const reduction = typeof BOSS_DAMAGE_REDUCTION === 'number' ? BOSS_DAMAGE_REDUCTION : 0;
    return Math.max(0.1, damage * (1 - reduction));
}

// Spawns and initializes a boss entity, metadata, visuals, and behavior state.
function spawnBoss(scene, type, x, y) {
    const { bosses, audioManager } = scene;
    if (!bosses) return null;
    const safeSpawn = getSafeBossSpawnPosition(scene, x, y, type);
    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    const terrainVariation = Math.sin(safeSpawn.x / 200) * 30;
    const minClearance = 60;
    const topLimit = 30;
    const maxY = groundLevel - terrainVariation - minClearance;
    const spawnY = Phaser.Math.Clamp(safeSpawn.y, topLimit, Math.max(topLimit + 20, maxY));
    const spawnX = safeSpawn.x;

    const boss = bosses.create(spawnX, spawnY, type);
    boss.setDepth(FG_DEPTH_BASE + 5);

    const scale = getBossScale(type);
    boss.setScale(scale);
    boss.bossType = type;
    boss.hp = getBossHP(type);
    boss.maxHP = boss.hp;
    boss.corePhase = 0;

    // Initialize attack state with a grace period so boss doesn't shoot frame 1
    initBossAttackState(boss);
    boss.attackState.nextAttackTime = (scene.time?.now || 0) + 1500; // 1.5s grace period on spawn

    // Initialize shield phase system
    if (typeof initializeShieldPhaseState === 'function') {
        const stageCount = type === 'mothershipCore' ? 3 : 2;
        initializeShieldPhaseState(boss, {
            shieldStages: stageCount,
            shieldBaseHp: Math.ceil(boss.maxHP * (type === 'mothershipCore' ? 0.20 : 0.25)),
            damageWindowMs: type === 'mothershipCore' ? 5000 : 4000,
            intermissionMs: type === 'mothershipCore' ? 2000 : 1500,
            label: 'Phase'
        });
    }

    // Special properties per boss type (movement only)
    if (type === 'megaLander') boss.orbitAngle = 0;
    if (type === 'hiveDrone') { boss.hoverBaseY = spawnY; boss.patrolDir = 1; }
    if (type === 'behemothBomber') { boss.bomberDirection = Math.random() < 0.5 ? -1 : 1; }
    if (type === 'colossalPod') { boss.podPattern = 0; boss.driftDir = 1; }
    if (type === 'leviathanBaiter') boss.serpentinePhase = 0;
    if (type === 'apexKamikaze') { boss.chargeState = 'circle'; boss.chargeTimer = 0; boss.circleAngle = Math.random() * Math.PI * 2; }
    if (type === 'fortressTurret') { boss.isPlanted = false; }
    if (type === 'overlordShield') boss.orbitAngle = 0;
    if (type === 'mothershipCore' && typeof initializeMothershipCore === 'function') {
        initializeMothershipCore(boss);
    }

    // Initial velocity
    let speed = 0;
    if (type !== 'fortressTurret' && type !== 'mothershipCore') {
        speed = 40;
    }
    boss.setVelocity((Math.random() - 0.5) * speed, (Math.random() - 0.5) * speed);

    createSpawnEffect(scene, spawnX, spawnY, 'boss');
    if (audioManager) audioManager.playSound('enemySpawn');

    createBossTrail(scene, boss);
    return boss;
}

// Dequeues and returns the next boss type, repopulating queue when needed.
function getNextBossType() {
    if (!gameState.bossQueue) {
        initializeBossQueue();
    }
    return gameState.bossQueue.shift();
}

// Starts a boss encounter for the current mode, including selection, spawn, and UI state.
function startBossEncounter(scene, triggerInfo = {}) {
    if (gameState.bossActive) return null;

    const bossType = getNextBossType();
    if (!bossType) return null;

    const spawnOffset = Math.random() < 0.5 ? -200 : 200;
    const spawnX = scene.cameras.main.scrollX + CONFIG.width / 2 + spawnOffset;
    const spawnY = CONFIG.height / 2;

    gameState.bossActive = true;
    gameState.currentBossKey = bossType;
    gameState.currentBossName = bossType;

    const warning = scene.add.text(
        CONFIG.width / 2,
        CONFIG.height / 2,
        `WARNING!\n${bossType.toUpperCase()} INBOUND`,
        {
            fontSize: '32px',
            fontFamily: 'Orbitron',
            color: '#ff4444',
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
    if (triggerInfo.mode === 'survival' && triggerInfo.minute) {
        gameState.survivalBossFlags[triggerInfo.minute] = true;
    }

    return spawnBoss(scene, bossType, spawnX, spawnY);
}

// Fires one projectile volley from a specific boss source point using provided shot config.
function shootFromBossSource(scene, sourceX, sourceY, boss, shotConfig, fireAngle) {
    const { enemyProjectiles, audioManager } = scene;
    const player = getActivePlayer(scene);
    if (!player || !enemyProjectiles) return;
    const proj = enemyProjectiles.create(sourceX, sourceY, shotConfig.projectileType);
    proj.setDepth(FG_DEPTH_BASE + 4);
    proj.setScale(1.5);

    let angle = fireAngle;
    if (angle === undefined || angle === null) {
        angle = Phaser.Math.Angle.Between(sourceX, sourceY, player.x, player.y);
    }

    proj.setVelocity(
        Math.cos(angle) * shotConfig.speed,
        Math.sin(angle) * shotConfig.speed
    );
    proj.rotation = angle;
    proj.enemyType = boss.bossType;
    proj.damage = shotConfig.damage;

    if (shotConfig.damage > 1.5) {
        const emitter = scene.add.particles(0, 0, 'particle', {
            follow: proj,
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.7, end: 0 },
            tint: 0xff6600,
            lifespan: 250,
            frequency: 30,
            blendMode: 'ADD'
        });
        proj.emitter = emitter;

        const originalDestroy = proj.destroy.bind(proj);
        proj.destroy = () => {
            if (proj.emitter) {
                proj.emitter.stop();
                proj.emitter.stopFollow();
                scene.time.delayedCall(500, () => {
                    if (proj.emitter) proj.emitter.destroy();
                });
            }
            originalDestroy();
        };
    }

    if (audioManager) audioManager.playSound('enemyShoot');
    scene.time.delayedCall(4000, () => {
        if (proj && proj.active) proj.destroy();
    });
}

// Handles player-projectile impact on bosses, including damage, phase gates, and death checks.
function hitBoss(projectile, boss) {
    const scene = projectile.scene;
    const audioManager = scene.audioManager;
    const particleManager = scene.particleManager;

    const rawDamage = projectile.damage || 1;
    const scaledDamage = applyBossDamage(boss, rawDamage);
    const now = scene.time?.now || 0;
    const shieldResult = typeof applyShieldStageDamage === 'function'
        ? applyShieldStageDamage(boss, scaledDamage, now)
        : { appliedToShield: false, shieldBroken: false };

    if (shieldResult.immune) {
        createFloatingText(scene, boss.x, boss.y - 50, 'IMMUNE', '#a3a3a3');
        if (projectile && projectile.active && !projectile.isPiercing) projectile.destroy();
        return;
    }

    if (shieldResult.capped) {
        createFloatingText(scene, boss.x, boss.y - 50, 'RESISTING', '#ffaa00');
        if (projectile && projectile.active && !projectile.isPiercing) projectile.destroy();
        return;
    }

    if (shieldResult.appliedToShield) {
        if (shieldResult.shieldBroken) {
            createExplosion(scene, boss.x, boss.y, 0x38bdf8, 1.0);
            scene.cameras.main.shake(100, 0.005);
            showRebuildObjectiveBanner(scene, `${boss.bossType.toUpperCase()} SHIELD DOWN! ATTACK NOW!`, '#ff4444');
        } else {
            createExplosion(scene, projectile.x, projectile.y, 0x38bdf8, 0.3);
            // Show shield HP as feedback
            const state = boss.phaseState;
            if (state && Math.random() < 0.3) {
                createFloatingText(scene, projectile.x, projectile.y - 20,
                    `${Math.ceil(state.shieldHp)}`, '#38bdf8');
            }
        }
    } else {
        boss.hp -= scaledDamage;
        boss.setTint(0xff0000);
        scene.time.delayedCall(60, () => {
            if (boss && boss.active) boss.clearTint();
        });

        // Show damage numbers occasionally
        if (Math.random() < 0.25) {
            createFloatingText(scene, projectile.x, projectile.y - 15,
                `-${scaledDamage.toFixed(1)}`, '#ff6666');
        }
    }

    scene.tweens.add({
        targets: boss,
        alpha: 0.6,
        duration: 80,
        yoyo: true,
        ease: 'Linear'
    });

    if (audioManager) audioManager.playSound('hitEnemy');
    if (projectile.projectileType === 'homing' && particleManager) {
        particleManager.bulletExplosion(boss.x, boss.y);
    }
    if (projectile.projectileType === 'homing' && projectile.homingTier === 3 && !projectile.hasClustered) {
        projectile.hasClustered = true;
        spawnClusterMissiles(scene, projectile, boss);
    }

    if (boss.hp <= 0) destroyBoss(scene, boss);
    if (projectile && projectile.active && !projectile.isPiercing) {
        projectile.destroy();
    }
}

// Handles player collision with a boss and applies contact damage/invulnerability effects.
function playerHitBoss(playerSprite, boss) {
    const scene = boss.scene;
    const audioManager = scene.audioManager;

    const now = scene.time?.now || 0;
    const impactDamage = playerState.powerUps.invincibility > 0 ? 3 : 2;
    const shieldResult = typeof applyShieldStageDamage === 'function'
        ? applyShieldStageDamage(boss, applyBossDamage(boss, impactDamage), now)
        : { appliedToShield: false };

    if (playerState.powerUps.invincibility > 0) {
        if (!shieldResult.appliedToShield) boss.hp -= applyBossDamage(boss, 3);
        if (boss.hp <= 0) destroyBoss(scene, boss);
        return;
    }

    if (playerState.powerUps.shield > 0) {
        playerState.powerUps.shield = 0;
        if (!shieldResult.appliedToShield) boss.hp -= applyBossDamage(boss, 2);
        if (boss.hp <= 0) destroyBoss(scene, boss);
        screenShake(scene, 10, 200);
        if (audioManager) audioManager.playSound('hitPlayer');
    } else {
        screenShake(scene, 18, 320);
        playerDie(scene);
    }
}

// Destroys boss entities, awards rewards, updates progression flags, and cleans encounter state.
function destroyBoss(scene, boss) {
    const { bosses, enemies } = scene;
    if (!bosses) return;

    screenShake(scene, 25, 500);

    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            createEnhancedDeathEffect(scene, boss.x, boss.y, boss.bossType);
        }, i * 150);
    }

    // Boss-specific death effects
    switch (boss.bossType) {
        case 'megaLander':
            for (let i = 0; i < 4; i++) {
                createExplosion(scene, boss.x + Math.cos(i * Math.PI / 2) * 40, boss.y + Math.sin(i * Math.PI / 2) * 40, 0xff4444);
            }
            break;
        case 'titanMutant':
            for (let i = 0; i < 3; i++) {
                const armX = boss.x + (i - 1) * 40;
                createExplosion(scene, armX, boss.y + 40, 0xffaa66);
            }
            break;
        case 'behemothBomber':
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    createExplosion(scene, boss.x + Math.random() * 80 - 40, boss.y + Math.random() * 60 - 30, 0xff5533);
                }, i * 100);
            }
            break;
        case 'overlordShield':
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                createExplosion(scene, boss.x + Math.cos(angle) * 60, boss.y + Math.sin(angle) * 60, 0x00ffff);
            }
            break;
    }

    registerComboEvent(3);
    const score = getBossScore(boss.bossType);
    const scaledReward = getCombatScaledReward(score) * 2;
    gameState.score += scaledReward;

    const scorePopup = scene.add.text(
        boss.x, boss.y - 40,
        '★ BOSS DOWN ★\n+' + scaledReward,
        {
            fontSize: '24px',
            fontFamily: 'Orbitron',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }
    ).setOrigin(0.5).setDepth(FG_DEPTH_BASE + 10);

    scene.tweens.add({
        targets: scorePopup,
        y: scorePopup.y - 60,
        alpha: 0,
        duration: 2000,
        onComplete: () => scorePopup.destroy()
    });

    spawnPowerUp(scene, boss.x, boss.y);
    spawnPowerUp(scene, boss.x, boss.y);

    boss.destroy();

    if (boss.bossType === 'mothershipCore' && gameState.mode === 'mothership') {
        if (typeof handleMothershipCoreDefeat === 'function') {
            handleMothershipCoreDefeat(scene);
        }
    }

    gameState.bossesDefeated = (gameState.bossesDefeated || 0) + 1;
    gameState.survivalBossesDefeated = gameState.mode === 'survival'
        ? (gameState.survivalBossesDefeated || 0) + 1
        : gameState.survivalBossesDefeated;

    scene.time.delayedCall(0, () => {
        if (bosses.countActive(true) === 0) {
            gameState.bossActive = false;
            gameState.currentBossKey = null;
            gameState.currentBossName = '';
        }

        if (gameState.mode === 'classic'
            && bosses.countActive(true) === 0
            && enemies.countActive(true) === 0) {
            completeBossWave(scene);
        }
    });
}

// Finalizes post-boss wave flow and transitions to next mission/wave state.
function completeBossWave(scene) {
    const audioManager = scene.audioManager;
    const completedWave = gameState.wave;
    const bossReward = getMissionScaledReward(3000);
    gameState.score += bossReward;
    if (audioManager) audioManager.playSound('waveComplete');

    const bossWaveText = scene.add.text(
        CONFIG.width / 2,
        CONFIG.height / 2,
        `BOSS DEFEATED!\nWAVE ${completedWave} COMPLETE!\nBonus: ${bossReward} points`,
        {
            fontSize: '32px',
            fontFamily: 'Orbitron',
            color: '#00ff00',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    scene.tweens.add({
        targets: bossWaveText,
        alpha: 0,
        y: CONFIG.height / 2 - 80,
        duration: 3000,
        onComplete: () => bossWaveText.destroy()
    });

    const waveLimit = typeof CLASSIC_WAVE_LIMIT === 'number' ? CLASSIC_WAVE_LIMIT : 15;
    const isFinalBossWave = completedWave >= waveLimit;

    if (isFinalBossWave) {
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

// Handles player collision with boss-fired projectiles and applies projectile damage.
function hitBossProjectile(playerSprite, projectile) {
    const audioManager = this.audioManager;

    if (playerState.powerUps.invincibility > 0) {
        projectile.destroy();
        return;
    }

    if (playerState.powerUps.shield > 0) {
        playerState.powerUps.shield = 0;
        projectile.destroy();
        screenShake(this, 10, 150);
        if (audioManager) audioManager.playSound('hitPlayer');
    } else {
        projectile.destroy();
        screenShake(this, 15, 300);
        playerDie(this);
    }
}

// Triggers scheduled survival-mode boss encounters based on elapsed survival progression.
function checkSurvivalBosses(scene) {
    if (gameState.mode !== 'survival' || gameState.bossActive) return;

    const elapsed = gameState.totalSurvivalDuration - gameState.timeRemaining;
    const thresholds = [5, 10, 15];

    thresholds.forEach(minute => {
        if (!gameState.survivalBossFlags[minute] && elapsed >= minute * 60 * 1000) {
            startBossEncounter(scene, { mode: 'survival', minute });
        }
    });
}
