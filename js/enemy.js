// ------------------------
// Enemy AI and behaviors
// ------------------------

// OPTIMIZED trail configs - reduced frequency and lifespan
const ENEMY_TRAIL_CONFIGS = {
    default: {
        tint: [0xffffff],
        speed: 15,
        scale: { start: 0.3, end: 0 },
        alpha: { start: 0.4, end: 0 },
        lifespan: 200,
        frequency: 80
    },
    mutant: {
        tint: [0xffbb66],
        speed: 30,
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 250,
        frequency: 60
    },
    drone: {
        tint: [0xff66ff],
        speed: 25,
        scale: { start: 0.4, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 250,
        frequency: 70
    },
    bomber: {
        tint: [0xff5533],
        speed: 20,
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 300,
        frequency: 60,
        gravityY: 30
    },
    pod: {
        tint: [0xaa00ff],
        speed: 25,
        scale: { start: 0.45, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 300,
        frequency: 65
    },
    swarmer: {
        tint: [0x66ff66],
        speed: 35,
        scale: { start: 0.35, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 180,
        frequency: 50
    },
    baiter: {
        tint: [0xff66ff],
        speed: 40,
        scale: { start: 0.4, end: 0 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 180,
        frequency: 40
    },
    // New enemy trail configs
    kamikaze: {
        tint: [0xff0000],
        speed: 50,
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.7, end: 0 },
        lifespan: 150,
        frequency: 30
    },
    turret: { // No trail for stationary
        tint: [0x666666],
        speed: 0,
        scale: { start: 0.2, end: 0 },
        alpha: { start: 0.3, end: 0 },
        lifespan: 100,
        frequency: 200
    },
    shield: {
        tint: [0x00ffff],
        speed: 20,
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.4, end: 0 },
        lifespan: 300,
        frequency: 100
    },
    seeker: {
        tint: [0x8844ff],
        speed: 35,
        scale: { start: 0.4, end: 0 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 200,
        frequency: 50
    },
    spawner: {
        tint: [0xffff00],
        speed: 25,
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 250,
        frequency: 70
    },
    shielder: {
        tint: [0x00ff00],
        speed: 20,
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.4, end: 0 },
        lifespan: 300,
        frequency: 80
    },
    bouncer: {
        tint: [0xff6600],
        speed: 45,
        scale: { start: 0.4, end: 0 },
        alpha: { start: 0.7, end: 0 },
        lifespan: 120,
        frequency: 25
    },
    sniper: { // Minimal trail
        tint: [0x333333],
        speed: 10,
        scale: { start: 0.3, end: 0 },
        alpha: { start: 0.3, end: 0 },
        lifespan: 150,
        frequency: 150
    },
    swarmLeader: {
        tint: [0x6600ff],
        speed: 30,
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 280,
        frequency: 60
    },
    regenerator: {
        tint: [0x00aa44],
        speed: 15,
        scale: { start: 0.4, end: 0 },
        alpha: { start: 0.4, end: 0 },
        lifespan: 350,
        frequency: 90
    }
};

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

function getEnemyHP(type) {
    switch (type) {
        case 'lander': return 1;
        case 'mutant': return 2;
        case 'drone': return 1;
        case 'bomber': return 3;
        case 'pod': return 2;
        case 'swarmer': return 1;
        case 'kamikaze': return 1;
        case 'turret': return 4;
        case 'shield': return 5; // 2 for shield + 3 for core
        case 'seeker': return 2;
        case 'spawner': return 3;
        case 'shielder': return 3;
        case 'bouncer': return 2;
        case 'sniper': return 2;
        case 'swarmLeader': return 4;
        case 'regenerator': return 3;
        default: return 1;
    }
}

function spawnEnemy(scene, type, x, y) {
    // Clamp X so enemies never spawn too close to world edges
    const spawnX = Phaser.Math.Clamp(x, 100, CONFIG.worldWidth - 100);

    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    const terrainVariation = Math.sin(spawnX / 200) * 30;
    const minClearance = 40;
    const topLimit = 20;
    const maxY = groundLevel - terrainVariation - minClearance;
    const spawnY = Phaser.Math.Clamp(y, topLimit, Math.max(topLimit + 10, maxY));
    const enemy = enemies.create(spawnX, spawnY, type);
    
    // Scale: swarmers small, new types vary by role
    let scale = 2.0;
    if (type === 'swarmer') scale = 1.35;
    else if (type === 'kamikaze' || type === 'bouncer') scale = 1.8; // Fast/small
    else if (type === 'turret' || type === 'sniper') scale = 2.2; // Stationary/large
    else if (type === 'shield' || type === 'shielder') scale = 2.5; // Tanky/large
    else if (type === 'spawner' || type === 'swarmLeader') scale = 2.3; // Medium/large
    else if (type === 'seeker' || type === 'regenerator') scale = 2.0; // Standard
    
    enemy.setScale(scale);
    enemy.enemyType = type;
    enemy.hp = getEnemyHP(type);
    enemy.lastShot = 0;
    enemy.patrolAngle = Math.random() * Math.PI * 2;
    enemy._topEscapeAt = null;
    
    // Initial velocity based on type
    let speed = 50 + Math.random() * 100;
    if (type === 'kamikaze' || type === 'bouncer') speed *= 1.5; // Faster
    if (type === 'turret' || type === 'sniper') speed = 20; // Slower/stationary
    enemy.setVelocity((Math.random() - 0.5) * speed, (Math.random() - 0.5) * speed);
    
    // Special properties
    if (type === 'shield') enemy.shieldHP = 2; // Separate shield health
    if (type === 'shielder') enemy.protectedAllies = [];
    if (type === 'swarmLeader') enemy.buffRadius = 200;
    if (type === 'regenerator') enemy.lastHeal = 0; enemy.healAmount = 1;
    if (type === 'spawner') enemy.spawnTimer = 0; enemy.minionsSpawned = 0;
    if (type === 'turret') enemy.isPlanted = false; enemy.plantTimer = 0;
    
    createSpawnEffect(scene, spawnX, spawnY, type);
    if (audioManager) audioManager.playSound('enemySpawn');

    // Only create trails for moving enemies
    if (type !== 'turret' && type !== 'sniper') {
        createEnemyTrail(scene, enemy);
    }
    return enemy;
}

function spawnRandomEnemy(scene) {
    // Expanded enemy types pool including new 10 types
    const types = [
        'lander', 'mutant', 'drone', 'bomber', 'pod', 'baiter',
        'kamikaze', 'turret', 'shield', 'seeker', 'spawner', 
        'shielder', 'bouncer', 'sniper', 'swarmLeader', 'regenerator'
    ];
    const type = Phaser.Utils.Array.GetRandom(types);
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
    // Adjust spawn Y for stationary types
    if (type === 'turret' || type === 'sniper') {
        y = CONFIG.worldHeight * 0.3 + Math.random() * 0.4 * CONFIG.worldHeight; // Mid-height
    }
    spawnEnemy(scene, type, x, y);
}

function spawnEnemyWave(scene) {
    if (gameState.mode === 'classic') {
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

function updateEnemies(scene, time, delta) {
    const topLimit = 20;
    enemies.children.entries.forEach(enemy => {
        wrapWorldBounds(enemy);
        const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
        const terrainVariation = Math.sin(enemy.x / 200) * 30;
        const minClearance = 40;
        const enemyGroundY = groundLevel - terrainVariation - minClearance;
        if (enemy.y > enemyGroundY) {
            enemy.y = enemyGroundY;
            if (enemy.body.velocity.y > 0) enemy.setVelocityY(0);
        }
        if (enemy.y < topLimit) {
            if (!enemy._topEscapeAt) enemy._topEscapeAt = time;
            enemy.y = topLimit;
            if (enemy.body.velocity.y < 0) enemy.setVelocityY(0);
        } else if (enemy._topEscapeAt) {
            enemy._topEscapeAt = null;
        }

        const timeSlowMultiplier = playerState.powerUps.timeSlow > 0 ? 0.3 : 1.0;

        switch (enemy.enemyType) {
            case 'lander':
                updateLanderBehavior(scene, enemy, time);
                if (timeSlowMultiplier < 1) {
                    enemy.setVelocity(enemy.body.velocity.x * timeSlowMultiplier, enemy.body.velocity.y * timeSlowMultiplier);
                }
                break;
            case 'mutant': {
                const mutantAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
                enemy.setVelocity(Math.cos(mutantAngle) * 150 * timeSlowMultiplier, Math.sin(mutantAngle) * 150 * timeSlowMultiplier);
                break;
            }
            case 'drone':
                enemy.patrolAngle += 0.02 * timeSlowMultiplier;
                enemy.setVelocity(Math.cos(enemy.patrolAngle) * 120 * timeSlowMultiplier, Math.sin(enemy.patrolAngle) * 120 * timeSlowMultiplier);
                if (time > enemy.lastShot + 1500 && Math.random() < 0.03) {
                    shootAtPlayer(scene, enemy);
                    enemy.lastShot = time;
                }
                break;
            case 'bomber':
                // Bomber: patrol horizontally and drop mines (distinctive behavior)
                updateBomber(scene, enemy, time, 140 * timeSlowMultiplier);

                // Occasional direct shot as well
                if (time > enemy.lastShot + 1400 && Math.random() < 0.04) {
                    shootAtPlayer(scene, enemy);
                    enemy.lastShot = time;
                }
                break;
            case 'turret':
                // Plant and shoot in alternating cardinal/diagonal pattern
                if (!enemy.isPlanted) {
                    enemy.plantTimer += delta * timeSlowMultiplier;
                    if (enemy.plantTimer > 2000) { // Plant after 2 seconds
                        enemy.isPlanted = true;
                        enemy.setVelocity(0, 0);
                        enemy.body.setImmovable(true);
                        enemy.rotation = 0; // Start facing up
                        enemy.shootMode = 0; // 0 = cardinal, 1 = diagonal
                    } else {
                        // Drift slowly while seeking position
                        enemy.setVelocity((Math.random() - 0.5) * 50 * timeSlowMultiplier, (Math.random() - 0.5) * 50 * timeSlowMultiplier);
                    }
                } else {
                    // Shoot every 1.2 seconds, alternating between cardinal and diagonal
                    if (time > enemy.lastShot + 1200) {
                        let directions;
                        
                        if (enemy.shootMode === 0) {
                            // Cardinal directions: Up, Right, Down, Left
                            directions = [
                                -Math.PI / 2,    // Up
                                0,               // Right
                                Math.PI / 2,     // Down
                                Math.PI          // Left
                            ];
                        } else {
                            // Diagonal directions: Up-Right, Down-Right, Down-Left, Up-Left
                            directions = [
                                -Math.PI / 4,        // Up-Right
                                Math.PI / 4,         // Down-Right
                                3 * Math.PI / 4,     // Down-Left
                                -3 * Math.PI / 4     // Up-Left
                            ];
                        }
                        
                        directions.forEach(dir => {
                            const proj = enemyProjectiles.create(enemy.x, enemy.y, 'enemyProjectile');
                            proj.setScale(2.0);
                            proj.setVelocity(Math.cos(dir) * 200, Math.sin(dir) * 200);
                            proj.rotation = dir;
                        });
                        
                        // Rotate turret 45 degrees after firing
                        enemy.rotation += Math.PI / 4;
                        
                        enemy.lastShot = time;
                        enemy.shootMode = (enemy.shootMode + 1) % 2; // Toggle between 0 and 1
                        if (audioManager) audioManager.playSound('enemyShoot');
                    }
                }
                break;
            case 'pod':
                updatePod(scene, enemy, time, 60 * timeSlowMultiplier);
                break;
            case 'swarmer':
                updateSwarmer(scene, enemy, time, 200 * timeSlowMultiplier);
                break;
            case 'baiter':
                updateBaiter(scene, enemy, time, 180 * timeSlowMultiplier);
                break;
            // NEW ENEMY BEHAVIORS
            case 'kamikaze': {
                // Fast charge directly at player
                const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
                const kamikazeSpeed = 250 * timeSlowMultiplier;
                enemy.setVelocity(Math.cos(angle) * kamikazeSpeed, Math.sin(angle) * kamikazeSpeed);
                // Occasional erratic burst
                if (Math.random() < 0.02) {
                    enemy.setVelocity(enemy.body.velocity.x + (Math.random() - 0.5) * 100, enemy.body.velocity.y + (Math.random() - 0.5) * 100);
                }
                // Shoot rarely
                if (time > enemy.lastShot + 2000 && Math.random() < 0.01) {
                    shootAtPlayer(scene, enemy);
                    enemy.lastShot = time;
                }
                break;
            }
            // Note: turret case is handled above - this duplicate was removed
            case 'shield': {
                // Tanky with shield phase
                if (!enemy.shieldBroken) {
                    // Shield active - reduced damage taken
                    enemy.shieldHP = Math.max(0, enemy.shieldHP - 0.5); // Half damage to shield
                    if (enemy.shieldHP <= 0) {
                        enemy.shieldBroken = true;
                        // Visual effect - shield breaks
                        createExplosion(scene, enemy.x, enemy.y, 0x00ffff);
                    }
                } else {
                    // Core takes full damage
                    enemy.hp -= 1; // Normal damage
                }
                // Slow patrol
                enemy.patrolAngle += 0.01 * timeSlowMultiplier;
                enemy.setVelocity(Math.cos(enemy.patrolAngle) * 80 * timeSlowMultiplier, Math.sin(enemy.patrolAngle) * 80 * timeSlowMultiplier);
                // Shoot occasionally
                if (time > enemy.lastShot + 2500 && Math.random() < 0.02) {
                    shootAtPlayer(scene, enemy);
                    enemy.lastShot = time;
                }
                break;
            }
            case 'seeker': {
                // Predicts player movement
                const playerVelX = player.body.velocity.x;
                const playerVelY = player.body.velocity.y;
                const predictTime = 1000; // Predict 1 second ahead
                const predictedPlayerX = player.x + playerVelX * (predictTime / 1000);
                const predictedPlayerY = player.y + playerVelY * (predictTime / 1000);
                const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, predictedPlayerX, predictedPlayerY);
                const seekerSpeed = 160 * timeSlowMultiplier;
                enemy.setVelocity(Math.cos(angle) * seekerSpeed, Math.sin(angle) * seekerSpeed);
                // Shoot more frequently
                if (time > enemy.lastShot + 1200 && Math.random() < 0.04) {
                    shootAtPlayer(scene, enemy);
                    enemy.lastShot = time;
                }
                break;
            }
            case 'spawner': {
                // Periodically spawns minions
                enemy.spawnTimer += delta * timeSlowMultiplier;
                if (enemy.spawnTimer > 3000 && enemy.minionsSpawned < 6) { // Spawn every 3s, max 6
                    for (let i = 0; i < 2; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const spawnX = enemy.x + Math.cos(angle) * 40;
                        const spawnY = enemy.y + Math.sin(angle) * 40;
                        spawnEnemy(scene, 'swarmer', spawnX, spawnY);
                    }
                    enemy.minionsSpawned++;
                    enemy.spawnTimer = 0;
                }
                // Slow circular patrol
                enemy.patrolAngle += 0.015 * timeSlowMultiplier;
                enemy.setVelocity(Math.cos(enemy.patrolAngle) * 70 * timeSlowMultiplier, Math.sin(enemy.patrolAngle) * 70 * timeSlowMultiplier);
                // Shoot
                if (time > enemy.lastShot + 2000 && Math.random() < 0.03) {
                    shootAtPlayer(scene, enemy);
                    enemy.lastShot = time;
                }
                break;
            }
            case 'shielder': {
                // Protects nearby allies
                if (!enemy.protectedAllies) enemy.protectedAllies = [];
                // Find nearby allies within buff radius
                enemies.children.entries.forEach(ally => {
                    if (ally !== enemy && ally.active && Phaser.Math.Distance.Between(enemy.x, enemy.y, ally.x, ally.y) < 150) {
                        if (!enemy.protectedAllies.includes(ally)) {
                            enemy.protectedAllies.push(ally);
                            // Visual link
                            const line = scene.add.graphics();
                            line.lineStyle(2, 0x00ff00, 0.5);
                            line.moveTo(enemy.x, enemy.y);
                            line.lineTo(ally.x, ally.y);
                            line.strokePath();
                            // Fade link
                            scene.tweens.add({
                                targets: line,
                                alpha: 0,
                                duration: 1000,
                                onComplete: () => line.destroy()
                            });
                        }
                        // Reduce ally damage taken
                        if (ally.lastDamageTime && time - ally.lastDamageTime < 500) {
                            ally.hp += 1; // Heal 1 HP if recently damaged
                        }
                    }
                });
                // Patrol near allies
                let nearestAlly = null;
                let nearestDist = Infinity;
                enemies.children.entries.forEach(ally => {
                    if (ally !== enemy && ally.active) {
                        const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, ally.x, ally.y);
                        if (dist < nearestDist && dist < 200) {
                            nearestDist = dist;
                            nearestAlly = ally;
                        }
                    }
                });
                if (nearestAlly) {
                    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, nearestAlly.x, nearestAlly.y);
                    enemy.setVelocity(Math.cos(angle) * 100 * timeSlowMultiplier, Math.sin(angle) * 100 * timeSlowMultiplier);
                } else {
                    // Random patrol if no allies
                    enemy.setVelocity((Math.random() - 0.5) * 80 * timeSlowMultiplier, (Math.random() - 0.5) * 80 * timeSlowMultiplier);
                }
                // Shoot to protect
                if (time > enemy.lastShot + 1800 && Math.random() < 0.035) {
                    shootAtPlayer(scene, enemy);
                    enemy.lastShot = time;
                }
                break;
            }
            case 'bouncer': {
                // Erratic ricochet movement
                enemy.bounceTimer += delta * timeSlowMultiplier;
                if (enemy.bounceTimer > 500) { // Change direction every 0.5s
                    const newAngle = Math.random() * Math.PI * 2;
                    const bounceSpeed = 180 * timeSlowMultiplier;
                    enemy.setVelocity(Math.cos(newAngle) * bounceSpeed, Math.sin(newAngle) * bounceSpeed);
                    enemy.bounceTimer = 0;
                }
                // Shoot while bouncing
                if (time > enemy.lastShot + 1000 && Math.random() < 0.025) {
                    shootAtPlayer(scene, enemy);
                    enemy.lastShot = time;
                }
                break;
            }
            case 'sniper': {
                // Sniper positions itself and shoots long-range
                if (!enemy.isPositioned) {
                    // Just position after a short delay - don't need to reach edge
                    if (!enemy.positionTimer) enemy.positionTimer = 0;
                    enemy.positionTimer += delta * timeSlowMultiplier;
                    
                    // Drift slowly while positioning
                    enemy.setVelocity((Math.random() - 0.5) * 40 * timeSlowMultiplier, (Math.random() - 0.5) * 40 * timeSlowMultiplier);
                    
                    // Position after 1.5 seconds
                    if (enemy.positionTimer > 1500) {
                        enemy.isPositioned = true;
                        enemy.setVelocity(0, (Math.random() - 0.5) * 20 * timeSlowMultiplier);
                    }
                } else {
                    // Slight vertical drift while sniping
                    if (Math.abs(enemy.body.velocity.y) < 10) {
                        enemy.setVelocityY((Math.random() - 0.5) * 30 * timeSlowMultiplier);
                    }
                    
                    // Snipe every 2.5 seconds (guaranteed shot, no random chance)
                    if (time > enemy.lastShot + 2500) {
                        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
                        const proj = enemyProjectiles.create(enemy.x, enemy.y, 'enemyProjectile_baiter');
                        proj.setScale(2.0);
                        proj.setVelocity(Math.cos(angle) * 450, Math.sin(angle) * 450); // Fast long-range
                        proj.damage = 2; // Higher damage
                        proj.rotation = angle;
                        enemy.lastShot = time;
                        if (audioManager) audioManager.playSound('enemyShoot');
                    }
                }
                break;
            }
            case 'swarmLeader': {
                // Buffs nearby smaller enemies
                enemies.children.entries.forEach(ally => {
                    if (ally !== enemy && ally.active && Phaser.Math.Distance.Between(enemy.x, enemy.y, ally.x, ally.y) < enemy.buffRadius) {
                        // Buff speed and damage
                        if (ally.body) {
                            ally.body.setVelocity(ally.body.velocity.x * 1.2, ally.body.velocity.y * 1.2);
                        }
                        if (ally.projectiles) ally.projectiles.forEach(p => p.damage *= 1.5);
                        // Visual buff indicator
                        const buffGlow = scene.add.circle(ally.x, ally.y, 15, 0x00ff00, 0.3);
                        scene.tweens.add({
                            targets: buffGlow,
                            alpha: 0,
                            scale: 1.5,
                            duration: 500,
                            onComplete: () => buffGlow.destroy()
                        });
                    }
                });
                // Command movement - towards player but evasive
                const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
                const evasion = Math.sin(time * 0.01) * 0.5;
                enemy.setVelocity(Math.cos(angle + evasion) * 100 * timeSlowMultiplier, Math.sin(angle + evasion) * 100 * timeSlowMultiplier);
                // Command shots
                if (time > enemy.lastShot + 1600 && Math.random() < 0.04) {
                    shootAtPlayer(scene, enemy);
                    enemy.lastShot = time;
                }
                break;
            }
            case 'regenerator': {
                // Heals over time
                enemy.lastHeal += timeSlowMultiplier;
                if (enemy.lastHeal > 5000 && enemy.hp < getEnemyHP('regenerator')) { // Heal every 5s
                    enemy.hp = Math.min(getEnemyHP('regenerator'), enemy.hp + enemy.healAmount);
                    enemy.lastHeal = 0;
                    // Healing visual
                    createExplosion(scene, enemy.x, enemy.y, 0x00ff00); // Green heal effect
                }
                // Slow, deliberate movement
                enemy.patrolAngle += 0.008 * timeSlowMultiplier;
                enemy.setVelocity(Math.cos(enemy.patrolAngle) * 60 * timeSlowMultiplier, Math.sin(enemy.patrolAngle) * 60 * timeSlowMultiplier);
                // Shoot
                if (time > enemy.lastShot + 2200 && Math.random() < 0.025) {
                    shootAtPlayer(scene, enemy);
                    enemy.lastShot = time;
                }
                break;
            }
        }

        if (enemy._topEscapeAt && time - enemy._topEscapeAt > 1500) {
            const ex = enemy.x, ey = enemy.y, et = enemy.enemyType;
            enemy.destroy();
            const camX = scene.cameras.main.scrollX;
            const rx = camX + Phaser.Math.Between(50, CONFIG.width - 50);
            const ry = Phaser.Math.Between(topLimit + 20, (scene.groundLevel || CONFIG.worldHeight - 80) - Math.sin(rx / 200) * 30 - 60);
            spawnEnemy(scene, et, rx, ry);
        }
    });
}

function updateLanderBehavior(scene, enemy, time) {
    if (!enemy.targetHuman && !enemy.abductedHuman) {
        let nearestHuman = null;
        let nearestDist = Infinity;
        humans.children.entries.forEach(human => {
            if (!human.isAbducted) {
                const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, human.x, human.y);
                if (dist < nearestDist && dist < 700) {
                    nearestDist = dist;
                    nearestHuman = human;
                }
            }
        });
        if (nearestHuman) {
            enemy.targetHuman = nearestHuman;
            nearestHuman.isAbducted = true;
            nearestHuman.abductor = enemy;
        }
    }
    if (enemy.targetHuman && enemy.targetHuman.active) {
        const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy.targetHuman.x, enemy.targetHuman.y);
        if (dist < 50 && !enemy.abductedHuman) {
            enemy.abductedHuman = enemy.targetHuman;
            enemy.targetHuman = null;
        }
        if (!enemy.abductedHuman) {
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, enemy.targetHuman.x, enemy.targetHuman.y);
            enemy.setVelocity(Math.cos(angle) * 120, Math.sin(angle) * 120);
        }
    }
    if (enemy.abductedHuman && enemy.abductedHuman.active) {
        enemy.abductedHuman.x = enemy.x;
        enemy.abductedHuman.y = enemy.y + 15;
        enemy.setVelocity(0, -100);
        if (enemy.y < 50) {
            const humanX = enemy.abductedHuman.x;
            const humanY = enemy.abductedHuman.y;
            enemy.abductedHuman.destroy();
            enemy.abductedHuman = null;
            enemy.destroy();
            spawnEnemy(scene, 'mutant', humanX, humanY);
        }
    } else if (!enemy.targetHuman) {
        if (Math.random() < 0.01) enemy.setVelocityX(-enemy.body.velocity.x);
        if (time > enemy.lastShot + 2000 && Math.random() < 0.02) {
            shootAtPlayer(scene, enemy);
            enemy.lastShot = time;
        }
    }
}

function updateMutant(scene, enemy, time, speed) {
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    enemy.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
}

function updateBomber(scene, enemy, time, speed) {
    if (!enemy.patrolDirection) {
        enemy.patrolDirection = Math.random() < 0.5 ? -1 : 1;
        enemy.lastMineDrop = 0;
    }
    enemy.setVelocityX(speed * enemy.patrolDirection);
    if (time > enemy.lastMineDrop + 3000) {
        // Use the distinctive mine texture
        const mine = enemyProjectiles.create(enemy.x, enemy.y + 10, 'mine');
        mine.setScale(1.25);
        mine.setVelocityY(50);
        mine.isMine = true;
        mine.enemyType = 'bomber';
        enemy.lastMineDrop = time;
        
        // Add spinning effect to mine
        scene.tweens.add({
            targets: mine,
            rotation: Math.PI * 2,
            duration: 1000,
            repeat: -1,
            ease: 'Linear'
        });
        
        scene.time.delayedCall(5000, () => {
            if (mine && mine.active) mine.destroy();
        });
    }
}

function updatePod(scene, enemy, time, speed) {
    if (!enemy.movePattern) enemy.movePattern = Math.random() * Math.PI * 2;
    enemy.movePattern += 0.02;
    enemy.setVelocity(Math.cos(enemy.movePattern) * speed, Math.sin(enemy.movePattern) * speed * 0.5);
}

function updateSwarmer(scene, enemy, time, speed) {
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    const wobble = Math.sin(time * 0.01) * 0.5;
    enemy.setVelocity(Math.cos(angle + wobble) * speed, Math.sin(angle + wobble) * speed);
}

function updateBaiter(scene, enemy, time, speed) {
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    enemy.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    if (Math.random() < 0.01) {
        enemy.setVelocity(enemy.body.velocity.x * 1.5, enemy.body.velocity.y * 1.5);
    }
}

function updateDrone(scene, enemy, time, speed) {
    if (!enemy.patrolTarget) {
        enemy.patrolTarget = { x: Math.random() * CONFIG.worldWidth, y: 50 + Math.random() * 200 };
        enemy.patrolTimer = 0;
    }
    enemy.patrolTimer++;
    if (enemy.patrolTimer < 180) {
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, enemy.patrolTarget.x, enemy.patrolTarget.y);
        enemy.setVelocity(Math.cos(angle) * speed * 0.7, Math.sin(angle) * speed * 0.7);
    } else {
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
        enemy.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        if (enemy.patrolTimer > 240) {
            enemy.patrolTimer = 0;
            enemy.patrolTarget = { x: Math.random() * CONFIG.worldWidth, y: 50 + Math.random() * 200 };
        }
    }
}

// ========================
// NEW ENEMY UPDATE FUNCTIONS
// ========================

// No additional functions needed - behaviors are inline in switch statement

function shootAtPlayer(scene, enemy) {
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    
    // Select texture based on enemy type
    let textureName = 'enemyProjectile';
    let speed = 300;
    let damage = 1;
    
    switch (enemy.enemyType) {
        case 'lander':
            textureName = 'enemyProjectile_lander';
            speed = 280;
            break;
        case 'mutant':
            textureName = 'enemyProjectile_mutant';
            speed = 350;
            break;
        case 'drone':
            textureName = 'enemyProjectile_drone';
            speed = 320;
            break;
        case 'bomber':
            textureName = 'enemyProjectile_bomber';
            speed = 250;
            break;
        case 'pod':
            textureName = 'enemyProjectile_pod';
            speed = 300;
            break;
        case 'swarmer':
            textureName = 'enemyProjectile_swarmer';
            speed = 400;
            break;
        case 'baiter':
            textureName = 'enemyProjectile_baiter';
            speed = 450;
            break;
        // New enemy shooting patterns
        case 'kamikaze':
            textureName = 'enemyProjectile';
            speed = 350;
            damage = 1.5;
            break;
        case 'turret':
            textureName = 'enemyProjectile';
            speed = 250;
            damage = 1.2;
            break;
        case 'shield':
            textureName = 'enemyProjectile';
            speed = 200;
            damage = 0.8; // Weaker shots
            break;
        case 'seeker':
            textureName = 'enemyProjectile';
            speed = 320;
            damage = 1.3;
            break;
        case 'spawner':
            textureName = 'enemyProjectile';
            speed = 220;
            break;
        case 'shielder':
            textureName = 'enemyProjectile';
            speed = 280;
            damage = 1.2;
            break;
        case 'bouncer':
            textureName = 'enemyProjectile_swarmer'; // Small fast shots
            speed = 380;
            break;
        case 'sniper':
            textureName = 'enemyProjectile_piercing'; // Long-range piercing
            speed = 450;
            damage = 2;
            break;
        case 'swarmLeader':
            textureName = 'enemyProjectile';
            speed = 300;
            damage = 1.5; // Stronger command shots
            break;
        case 'regenerator':
            textureName = 'enemyProjectile';
            speed = 240;
            break;
        default:
            textureName = 'enemyProjectile';
            speed = 300;
    }
    
    const proj = enemyProjectiles.create(enemy.x, enemy.y, textureName);
    proj.setScale(1.25);
    proj.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    proj.rotation = angle;
    proj.enemyType = enemy.enemyType;
    proj.damage = damage;
    
    // Special effects for certain types
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

function enemyShoot(scene, enemy) {
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    
    // Select texture based on enemy type
    let textureName = 'enemyProjectile';
    let projSpeed = 200;
    
    switch (enemy.enemyType) {
        case 'lander':
            textureName = 'enemyProjectile_lander';
            projSpeed = 180;
            break;
        case 'mutant':
            textureName = 'enemyProjectile_mutant';
            projSpeed = 250;
            break;
        case 'drone':
            textureName = 'enemyProjectile_drone';
            projSpeed = 220;
            break;
        case 'bomber':
            textureName = 'enemyProjectile_bomber';
            projSpeed = 150;
            break;
        case 'pod':
            textureName = 'enemyProjectile_pod';
            projSpeed = 200;
            break;
        case 'swarmer':
            textureName = 'enemyProjectile_swarmer';
            projSpeed = 300;
            break;
        case 'baiter':
            textureName = 'enemyProjectile_baiter';
            projSpeed = 350;
            break;
        default:
            textureName = 'enemyProjectile';
            projSpeed = 200;
    }
    
    const projectile = enemyProjectiles.create(enemy.x, enemy.y, textureName);
    projectile.setScale(1.25);
    projectile.setVelocity(Math.cos(angle) * projSpeed, Math.sin(angle) * projSpeed);
    projectile.rotation = angle;
    projectile.enemyType = enemy.enemyType;
    
    if (audioManager) audioManager.playSound('enemyShoot');
    scene.time.delayedCall(3000, () => {
        if (projectile && projectile.active) projectile.destroy();
    });
}

function hitEnemy(projectile, enemy) {
    enemy.hp -= projectile.damage || 1;
    if (audioManager) audioManager.playSound('hitEnemy');
    if (enemy.hp <= 0) destroyEnemy(this, enemy);
    if (!projectile.isPiercing) projectile.destroy();
}

function destroyEnemy(scene, enemy) {
    // Special death effects for new types
    if (enemy.enemyType === 'kamikaze') {
        // Big explosion on death
        createExplosion(scene, enemy.x, enemy.y, 0xff0000);
        screenShake(scene, 15, 300);
        // Damage nearby enemies/players
        enemies.children.entries.forEach(other => {
            if (other !== enemy && other.active && Phaser.Math.Distance.Between(enemy.x, enemy.y, other.x, other.y) < 80) {
                other.hp -= 1;
                if (other.hp <= 0) destroyEnemy(scene, other);
            }
        });
    } else if (enemy.enemyType === 'shield' && !enemy.shieldBroken) {
        // Shield breaks with blue explosion
        createExplosion(scene, enemy.x, enemy.y, 0x00ffff);
    } else if (enemy.enemyType === 'spawner') {
        // Chance to spawn final minions on death
        if (Math.random() < 0.5 && enemy.minionsSpawned < 8) {
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spawnX = enemy.x + Math.cos(angle) * 50;
                const spawnY = enemy.y + Math.sin(angle) * 50;
                spawnEnemy(scene, 'swarmer', spawnX, spawnY);
            }
        }
    } else if (enemy.enemyType === 'swarmLeader') {
        // Debuff nearby enemies on death
        enemies.children.entries.forEach(ally => {
            if (ally !== enemy && ally.active && Phaser.Math.Distance.Between(enemy.x, enemy.y, ally.x, ally.y) < 200) {
                // Slow them down
                if (ally.body) {
                    ally.body.setVelocity(ally.body.velocity.x * 0.5, ally.body.velocity.y * 0.5);
                }
                // Visual debuff
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
        // No heal on death
        enemy.lastHeal = 999999; // Prevent final heal
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
    }

    createEnhancedDeathEffect(scene, enemy.x, enemy.y, enemy.enemyType);
    let score = 0;
    switch (enemy.enemyType) {
        case 'lander': score = 150; break;
        case 'mutant': score = 200; break;
        case 'drone': score = 100; break;
        case 'bomber': score = 300; break;
        case 'pod': score = 250; break;
        case 'swarmer': score = 75; break;
        case 'baiter': score = 180; break;
        // New enemy scores
        case 'kamikaze': score = 120; break;
        case 'turret': score = 350; break;
        case 'shield': score = 400; break;
        case 'seeker': score = 220; break;
        case 'spawner': score = 280; break;
        case 'shielder': score = 320; break;
        case 'bouncer': score = 160; break;
        case 'sniper': score = 260; break;
        case 'swarmLeader': score = 450; break;
        case 'regenerator': score = 300; break;
    }
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
    screenShake(scene, 4, 100);
    enemy.destroy();

    // In classic mode, track wave progress
    if (gameState.mode === 'classic') {
        // Only count kills for non-swarmers (swarmers spawn from pods and shouldn't count)
        if (enemy.enemyType !== 'swarmer') {
            gameState.killsThisWave = (gameState.killsThisWave || 0) + 1;
        }
        
        // Check wave completion after ANY enemy dies (including swarmers)
        // Wave completes when: all required kills are done AND no enemies remain on screen
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
