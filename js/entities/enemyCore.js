// ------------------------
// Enemy Spawning, Combat, and Core Management
// ------------------------

function createEnemyTrail(scene, enemy) {
    if (!scene || !enemy) return;
    if (enemy.enemyType === 'lander') return;

    const cfg = ENEMY_TRAIL_CONFIGS[enemy.enemyType] || ENEMY_TRAIL_CONFIGS.default;
    const emitter = scene.add.particles(0, 0, 'particle', {
        follow: enemy,
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

    enemy.trailEmitter = emitter;
    enemy.once('destroy', () => {
        const trail = enemy.trailEmitter;
        if (trail) {
            trail.stop();
            trail.stopFollow();
            scene.time.delayedCall(400, () => {
                if (trail && trail.destroy) trail.destroy();
            });
            enemy.trailEmitter = null;
        }
    });
}

function spawnEnemy(scene, type, x, y) {
    const edgePadding = 100;
    const clampedX = Phaser.Math.Clamp(x, edgePadding, CONFIG.worldWidth - edgePadding);

    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    const terrainVariation = Math.sin(clampedX / 200) * 30;
    const minClearance = 40;
    const topLimit = 20;
    const maxY = groundLevel - terrainVariation - minClearance;
    const spawnY = Phaser.Math.Clamp(y, topLimit, Math.max(topLimit + 10, maxY));
    const enemy = enemies.create(clampedX, spawnY, type);
    
    const scale = getEnemyScale(type);
    enemy.setScale(scale);
    enemy.enemyType = type;
    enemy.hp = getEnemyHP(type);
    enemy.lastShot = 0;
    enemy.patrolAngle = Math.random() * Math.PI * 2;
    enemy._topEscapeAt = null;
    
    let speed = 50 + Math.random() * 100;
    if (type === 'kamikaze' || type === 'bouncer') speed *= 1.5;
    if (type === 'turret' || type === 'sniper') speed = 20;
    enemy.setVelocity((Math.random() - 0.5) * speed, (Math.random() - 0.5) * speed);
    
    // Special properties
    if (type === 'shield') enemy.shieldHP = 2;
    if (type === 'shielder') enemy.protectedAllies = [];
    if (type === 'swarmLeader') enemy.buffRadius = 200;
    if (type === 'regenerator') { enemy.lastHeal = 0; enemy.healAmount = 1; }
    if (type === 'spawner') { enemy.spawnTimer = 0; enemy.minionsSpawned = 0; }
    if (type === 'turret') { enemy.isPlanted = false; enemy.plantTimer = 0; }
    
    createSpawnEffect(scene, x, spawnY, type);
    if (audioManager) audioManager.playSound('enemySpawn');

    if (type !== 'turret' && type !== 'sniper') {
        createEnemyTrail(scene, enemy);
    }
    return enemy;
}

function spawnRandomEnemy(scene) {
    const type = Phaser.Utils.Array.GetRandom(ENEMY_TYPES);
    let x, y;
    
    if (Math.random() < 0.7) {
        x = scene.cameras.main.scrollX + (Math.random() < 0.5 ? -50 : CONFIG.width + 50);
        y = Math.random() * CONFIG.worldHeight;
    } else {
        const randomHuman = Phaser.Utils.Array.GetRandom(humans.children.entries);
        if (randomHuman) {
            x = randomHuman.x + (Math.random() - 0.5) * 300;
            y = randomHuman.y + (Math.random() - 0.5) * 200;
        } else {
            x = Math.random() * CONFIG.worldWidth;
            y = Math.random() * CONFIG.worldHeight;
        }
    }
    
    if (type === 'turret' || type === 'sniper') {
        y = CONFIG.worldHeight * 0.3 + Math.random() * 0.4 * CONFIG.worldHeight;
    }
    spawnEnemy(scene, type, x, y);
}

function spawnEnemyWave(scene) {
    if (gameState.mode === 'classic') {
        const bossWaves = [5, 10, 15];
        if (bossWaves.includes(gameState.wave)) {
            startBossEncounter(scene, { mode: 'classic', wave: gameState.wave });
            return;
        }
        if (!gameState.enemiesToKillThisWave) {
            gameState.enemiesToKillThisWave = 20 + (gameState.wave - 1) * 5;
        }
        gameState.killsThisWave = 0;
        const waveSize = gameState.enemiesToKillThisWave;
        const groupSize = 3;
        const initialDelay = 8000;
        const groupDelay = 4000;
        for (let i = 0; i < waveSize; i++) {
            const groupIndex = Math.floor(i / groupSize);
            const delay = initialDelay + groupIndex * groupDelay;
            scene.time.delayedCall(delay, () => {
                spawnRandomEnemy(scene);
            });
        }
    } else {
        const waveSize = 3 + gameState.wave;
        for (let i = 0; i < waveSize; i++) {
            scene.time.delayedCall(i * 1000, () => {
                spawnRandomEnemy(scene);
            });
        }
    }
}

function shootAtPlayer(scene, enemy) {
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    
    let textureName = 'enemyProjectile';
    let speed = 300;
    let damage = 1;
    
    const shootConfig = {
        lander: { texture: 'enemyProjectile_lander', speed: 280 },
        mutant: { texture: 'enemyProjectile_mutant', speed: 350 },
        drone: { texture: 'enemyProjectile_drone', speed: 320 },
        bomber: { texture: 'enemyProjectile_bomber', speed: 250 },
        pod: { texture: 'enemyProjectile_pod', speed: 300 },
        swarmer: { texture: 'enemyProjectile_swarmer', speed: 400 },
        baiter: { texture: 'enemyProjectile_baiter', speed: 450 },
        kamikaze: { texture: 'enemyProjectile', speed: 350, damage: 1.5 },
        turret: { texture: 'enemyProjectile', speed: 250, damage: 1.2 },
        shield: { texture: 'enemyProjectile', speed: 200, damage: 0.8 },
        seeker: { texture: 'enemyProjectile', speed: 320, damage: 1.3 },
        spawner: { texture: 'enemyProjectile', speed: 220 },
        shielder: { texture: 'enemyProjectile', speed: 280, damage: 1.2 },
        bouncer: { texture: 'enemyProjectile_swarmer', speed: 380 },
        sniper: { texture: 'enemyProjectile_piercing', speed: 450, damage: 2 },
        swarmLeader: { texture: 'enemyProjectile', speed: 300, damage: 1.5 },
        regenerator: { texture: 'enemyProjectile', speed: 240 }
    };
    
    const config = shootConfig[enemy.enemyType] || {};
    textureName = config.texture || textureName;
    speed = config.speed || speed;
    damage = config.damage || damage;
    
    const proj = enemyProjectiles.create(enemy.x, enemy.y, textureName);
    proj.setScale(1.25);
    proj.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    proj.rotation = angle;
    proj.enemyType = enemy.enemyType;
    proj.damage = damage;
    
    if (enemy.enemyType === 'baiter' || enemy.enemyType === 'sniper') {
        const emitter = scene.add.particles(0, 0, 'particle', {
            follow: proj,
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.6, end: 0 },
            tint: enemy.enemyType === 'sniper' ? 0x333333 : 0xff00ff,
            lifespan: 200,
            frequency: 20,
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
    scene.time.delayedCall(3000, () => {
        if (proj && proj.active) proj.destroy();
    });
}

function hitEnemy(projectile, enemy) {
    enemy.hp -= projectile.damage || 1;
    if (audioManager) audioManager.playSound('hitEnemy');
    if (projectile.projectileType === 'homing' && particleManager) {
        particleManager.bulletExplosion(enemy.x, enemy.y);
    }
    if (enemy.hp <= 0) destroyEnemy(this, enemy);
    projectile.destroy();
}

function destroyEnemy(scene, enemy) {
    if (!enemy || enemy.isBeingDestroyed) return;
    enemy.isBeingDestroyed = true;

    let explosionSoundPlayed = false;

    // Special death effects
    if (enemy.enemyType === 'kamikaze') {
        createExplosion(scene, enemy.x, enemy.y, 0xff0000);
        explosionSoundPlayed = true;
        enemies.children.entries.forEach(other => {
            if (other !== enemy && other.active && Phaser.Math.Distance.Between(enemy.x, enemy.y, other.x, other.y) < 80) {
                other.hp -= 1;
                if (other.hp <= 0) destroyEnemy(scene, other);
            }
        });
    } else if (enemy.enemyType === 'shield' && !enemy.shieldBroken) {
        createExplosion(scene, enemy.x, enemy.y, 0x00ffff);
        explosionSoundPlayed = true;
    } else if (enemy.enemyType === 'spawner') {
        if (Math.random() < 0.5 && enemy.minionsSpawned < 8) {
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spawnX = enemy.x + Math.cos(angle) * 50;
                const spawnY = enemy.y + Math.sin(angle) * 50;
                spawnEnemy(scene, 'swarmer', spawnX, spawnY);
            }
        }
    } else if (enemy.enemyType === 'swarmLeader') {
        enemies.children.entries.forEach(ally => {
            if (ally !== enemy && ally.active && Phaser.Math.Distance.Between(enemy.x, enemy.y, ally.x, ally.y) < 200) {
                if (ally.body) {
                    ally.body.setVelocity(ally.body.velocity.x * 0.5, ally.body.velocity.y * 0.5);
                }
                const debuff = scene.add.circle(ally.x, ally.y, 20, 0xff0000, 0.4);
                scene.tweens.add({
                    targets: debuff,
                    alpha: 0,
                    scale: 2,
                    duration: 1000,
                    onComplete: () => debuff.destroy()
                });
            }
        });
    } else if (enemy.enemyType === 'regenerator') {
        enemy.lastHeal = 999999;
    }

    if (enemy.enemyType === 'lander' && enemy.abductedHuman && enemy.abductedHuman.active) {
        const fallingHuman = enemy.abductedHuman;
        enemy.abductedHuman = null;
        fallingHuman.isAbducted = true;
        fallingHuman.abductor = null;
        fallingHuman.setVelocity(0, 0);
        if (fallingHuman.body) {
            fallingHuman.body.setGravityY(60);
            fallingHuman.body.setMaxVelocity(200, 120);
            fallingHuman.body.setSize(12, 18, true);
        }
        createExplosion(scene, fallingHuman.x, fallingHuman.y, 0x00ff00);
        explosionSoundPlayed = true;
    }

    if (particleManager) {
        if (!explosionSoundPlayed && audioManager) audioManager.playSound('explosion');
        particleManager.enemyExplosion(enemy.x, enemy.y);
    }
    createEnhancedDeathEffect(scene, enemy.x, enemy.y, enemy.enemyType);
    const score = getEnemyScore(enemy.enemyType);
    gameState.score += score;

    if (enemy.enemyType === 'pod') {
        for (let i = 0; i < 3; i++) {
            const offsetX = Phaser.Math.Between(-20, 20);
            const offsetY = Phaser.Math.Between(-20, 20);
            spawnEnemy(scene, 'swarmer', enemy.x + offsetX, enemy.y + offsetY);
        }
    }

    const scorePopup = scene.add.text(
        enemy.x, enemy.y - 20, 
        '+' + score,
        {
            fontSize: '16px',
            fontFamily: 'Orbitron',
            color: '#ffff00',
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

    if (Math.random() < 0.2) spawnPowerUp(scene, enemy.x, enemy.y);
    enemy.destroy();

    if (gameState.mode === 'classic') {
        if (enemy.enemyType !== 'swarmer') {
            gameState.killsThisWave = (gameState.killsThisWave || 0) + 1;
        }
        
        const enemiesLeft = Math.max(0, (gameState.enemiesToKillThisWave || 0) - (gameState.killsThisWave || 0));
        if (enemiesLeft <= 0 && enemies.countActive(true) === 0) {
            completeWave(scene);
        }
    }
}

function completeWave(scene) {
    const completedWave = gameState.wave;
    gameState.score += 1000 * completedWave;
    if (audioManager) audioManager.playSound('waveComplete');

    const waveText = scene.add.text(
        CONFIG.width / 2,
        CONFIG.height / 2,
        `WAVE ${completedWave} COMPLETE!\nBonus: ${1000 * completedWave} points`,
        {
            fontSize: '36px',
            fontFamily: 'Orbitron',
            color: '#00ff00',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    scene.tweens.add({
        targets: waveText,
        alpha: 0,
        y: CONFIG.height / 2 - 50,
        duration: 2000,
        onComplete: () => waveText.destroy()
    });

    gameState.wave++;
    gameState.killsThisWave = 0;
    gameState.enemiesToKillThisWave = 20 + (gameState.wave - 1) * 5;
    scene.time.delayedCall(2000, () => {
        spawnEnemyWave(scene);
    });
}
