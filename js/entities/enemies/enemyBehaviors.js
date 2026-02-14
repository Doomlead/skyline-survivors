// ------------------------
// Enemy AI Behaviors and Update Functions
// ------------------------

function releaseTargetHuman(enemy) { // Release target human.
    const target = enemy.targetHuman;
    if (!target) return;
    target.isAbducted = false;
    if (target.abductor === enemy) {
        target.abductor = null;
    }
    enemy.targetHuman = null;
}

// Handles landers hunting humans, abducting them, and mutating if they escape.
function updateLanderBehavior(scene, enemy, time) {
    if (enemy.targetHuman && !enemy.targetHuman.active) {
        releaseTargetHuman(enemy);
    }
    const humans = scene.humans;
    if (!humans) return;
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

// Drives aggressive pursuit for mutants, constantly steering toward the player.
function updateMutantBehavior(scene, enemy, time, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    if (!player) return;
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    enemy.setVelocity(Math.cos(angle) * 150 * timeSlowMultiplier, Math.sin(angle) * 150 * timeSlowMultiplier);
}

// Gives drones a lazy patrol arc and opportunistic potshots at the player.
function updateDroneBehavior(scene, enemy, time, timeSlowMultiplier) {
    enemy.patrolAngle += 0.02 * timeSlowMultiplier;
    enemy.setVelocity(Math.cos(enemy.patrolAngle) * 120 * timeSlowMultiplier, Math.sin(enemy.patrolAngle) * 120 * timeSlowMultiplier);
    if (time > enemy.lastShot + 1500 && Math.random() < 0.03) {
        shootAtPlayer(scene, enemy);
        enemy.lastShot = time;
    }
}

// Moves bombers horizontally while dropping timed mines and firing intermittently.
function updateBomberBehavior(scene, enemy, time, timeSlowMultiplier) {
    const enemyProjectiles = scene.enemyProjectiles;
    if (!enemyProjectiles) return;
    if (!enemy.patrolDirection) {
        enemy.patrolDirection = Math.random() < 0.5 ? -1 : 1;
        enemy.lastMineDrop = 0;
    }
    const speed = 140 * timeSlowMultiplier;
    enemy.setVelocityX(speed * enemy.patrolDirection);
    
    if (time > enemy.lastMineDrop + 3000) {
        const mine = enemyProjectiles.create(enemy.x, enemy.y + 10, 'mine');
        mine.setDepth(FG_DEPTH_BASE + 4);
        mine.setScale(1.25);
        mine.setVelocityY(50);
        mine.isMine = true;
        mine.enemyType = 'bomber';
        enemy.lastMineDrop = time;
        
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
    
    if (time > enemy.lastShot + 1400 && Math.random() < 0.04) {
        shootAtPlayer(scene, enemy);
        enemy.lastShot = time;
    }
}

// Plants turrets after a short delay, then alternates cardinal/diagonal volleys.
function updateTurretBehavior(scene, enemy, time, delta, timeSlowMultiplier) {
    const enemyProjectiles = scene.enemyProjectiles;
    const audioManager = scene.audioManager;
    if (!enemyProjectiles) return;
    if (!enemy.isPlanted) {
        enemy.plantTimer += delta * timeSlowMultiplier;
        if (enemy.plantTimer > 2000) {
            enemy.isPlanted = true;
            enemy.setVelocity(0, 0);
            enemy.body.setImmovable(true);
            enemy.rotation = 0;
            enemy.shootMode = 0;
        } else {
            enemy.setVelocity((Math.random() - 0.5) * 50 * timeSlowMultiplier, (Math.random() - 0.5) * 50 * timeSlowMultiplier);
        }
    } else {
        if (time > enemy.lastShot + 1200) {
            let directions;
            if (enemy.shootMode === 0) {
                // Cardinal directions: up, right, down, left
                directions = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
            } else {
                // Diagonal directions: up-right, down-right, down-left, up-left
                directions = [-Math.PI / 4, Math.PI / 4, 3 * Math.PI / 4, -3 * Math.PI / 4];
            }
            
            directions.forEach(dir => {
                const proj = enemyProjectiles.create(enemy.x, enemy.y, 'enemyProjectile');
                proj.setDepth(FG_DEPTH_BASE + 4);
                proj.setScale(2.0);
                proj.setVelocity(Math.cos(dir) * 200, Math.sin(dir) * 200);
                proj.rotation = dir;

                // Ensure turret projectiles despawn after 3 seconds
                scene.time.delayedCall(3000, () => {
                    if (proj && proj.active) proj.destroy();
                });
            });
            
            enemy.rotation += Math.PI / 4;
            enemy.lastShot = time;
            enemy.shootMode = (enemy.shootMode + 1) % 2;
            if (audioManager) audioManager.playSound('enemyShoot');
        }
    }
}

// Pods drift with shield-like bursts and occasionally shoot at the player.
function updatePodBehavior(scene, enemy, time, timeSlowMultiplier) {
    if (!enemy.movePattern) enemy.movePattern = Math.random() * Math.PI * 2;
    enemy.movePattern += 0.02;
    const speed = 60 * timeSlowMultiplier;
    enemy.setVelocity(Math.cos(enemy.movePattern) * speed, Math.sin(enemy.movePattern) * speed * 0.5);
}

// Swarmer drones zig-zag toward the player and may fire quick shots.
function updateSwarmerBehavior(scene, enemy, time, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    if (!player) return;
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    const wobble = Math.sin(time * 0.01) * 0.5;
    const speed = 200 * timeSlowMultiplier;
    enemy.setVelocity(Math.cos(angle + wobble) * speed, Math.sin(angle + wobble) * speed);
}

// Baiters circle the player with erratic velocity changes and rapid fire.
function updateBaiterBehavior(scene, enemy, time, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    if (!player) return;
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    const speed = 180 * timeSlowMultiplier;
    enemy.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    if (Math.random() < 0.01) {
        enemy.setVelocity(enemy.body.velocity.x * 1.5, enemy.body.velocity.y * 1.5);
    }
}

// Kamikazes home in aggressively and occasionally juke before firing.
function updateKamikazeBehavior(scene, enemy, time, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    if (!player) return;
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    const speed = 250 * timeSlowMultiplier;
    enemy.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    if (Math.random() < 0.02) {
        enemy.setVelocity(enemy.body.velocity.x + (Math.random() - 0.5) * 100, enemy.body.velocity.y + (Math.random() - 0.5) * 100);
    }
    if (time > enemy.lastShot + 2000 && Math.random() < 0.01) {
        shootAtPlayer(scene, enemy);
        enemy.lastShot = time;
    }
}

// Shields patrol in slow arcs and pepper the player with shots.
function updateShieldBehavior(scene, enemy, time, timeSlowMultiplier) {
    enemy.patrolAngle += 0.01 * timeSlowMultiplier;
    enemy.setVelocity(Math.cos(enemy.patrolAngle) * 80 * timeSlowMultiplier, Math.sin(enemy.patrolAngle) * 80 * timeSlowMultiplier);
    if (time > enemy.lastShot + 2500 && Math.random() < 0.02) {
        shootAtPlayer(scene, enemy);
        enemy.lastShot = time;
    }
}

// Predicts the player's position and chases that future location before shooting.
function updateSeekerBehavior(scene, enemy, time, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    if (!player || !player.body) return;
    const playerVelX = player.body.velocity.x;
    const playerVelY = player.body.velocity.y;
    const predictTime = 1000;
    const predictedPlayerX = player.x + playerVelX * (predictTime / 1000);
    const predictedPlayerY = player.y + playerVelY * (predictTime / 1000);
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, predictedPlayerX, predictedPlayerY);
    const speed = 160 * timeSlowMultiplier;
    enemy.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    if (time > enemy.lastShot + 1200 && Math.random() < 0.04) {
        shootAtPlayer(scene, enemy);
        enemy.lastShot = time;
    }
}

// Periodically emits swarmer minions while pacing and shooting at the player.
function updateSpawnerBehavior(scene, enemy, time, delta, timeSlowMultiplier) {
    enemy.spawnTimer += delta * timeSlowMultiplier;
    if (enemy.spawnTimer > 3000 && enemy.minionsSpawned < 6) {
        for (let i = 0; i < 2; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spawnX = enemy.x + Math.cos(angle) * 40;
            const spawnY = enemy.y + Math.sin(angle) * 40;
            spawnEnemy(scene, 'swarmer', spawnX, spawnY, false);
        }
        enemy.minionsSpawned++;
        enemy.spawnTimer = 0;
    }
    enemy.patrolAngle += 0.015 * timeSlowMultiplier;
    enemy.setVelocity(Math.cos(enemy.patrolAngle) * 70 * timeSlowMultiplier, Math.sin(enemy.patrolAngle) * 70 * timeSlowMultiplier);
    if (time > enemy.lastShot + 2000 && Math.random() < 0.03) {
        shootAtPlayer(scene, enemy);
        enemy.lastShot = time;
    }
}

// Links nearby allies with protective tethers and throttles their speed to keep formation.
function updateShielderBehavior(scene, enemy, time, timeSlowMultiplier) {
    const enemies = scene.enemies;
    if (!enemies) return;
    if (!enemy.protectedAllies) enemy.protectedAllies = [];
    
    enemies.children.entries.forEach(ally => {
        if (ally !== enemy && ally.active && Phaser.Math.Distance.Between(enemy.x, enemy.y, ally.x, ally.y) < 150) {
            if (!enemy.protectedAllies.includes(ally)) {
                enemy.protectedAllies.push(ally);
                const line = scene.add.graphics();
                line.lineStyle(2, 0x00ff00, 0.5);
                line.moveTo(enemy.x, enemy.y);
                line.lineTo(ally.x, ally.y);
                line.strokePath();
                scene.tweens.add({
                    targets: line,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => line.destroy()
                });
            }
            if (ally.lastDamageTime && time - ally.lastDamageTime < 500) {
                ally.hp += 1;
            }
        }
    });
    
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
        enemy.setVelocity((Math.random() - 0.5) * 80 * timeSlowMultiplier, (Math.random() - 0.5) * 80 * timeSlowMultiplier);
    }
    
    if (time > enemy.lastShot + 1800 && Math.random() < 0.035) {
        shootAtPlayer(scene, enemy);
        enemy.lastShot = time;
    }
}

// Makes bouncers ricochet vertically and fire when close to the player.
function updateBouncerBehavior(scene, enemy, time, delta, timeSlowMultiplier) {
    if (!enemy.bounceTimer) enemy.bounceTimer = 0;
    enemy.bounceTimer += delta * timeSlowMultiplier;
    
    if (enemy.bounceTimer > 500) {
        const newAngle = Math.random() * Math.PI * 2;
        const speed = 180 * timeSlowMultiplier;
        enemy.setVelocity(Math.cos(newAngle) * speed, Math.sin(newAngle) * speed);
        enemy.bounceTimer = 0;
    }
    
    if (time > enemy.lastShot + 1000 && Math.random() < 0.025) {
        shootAtPlayer(scene, enemy);
        enemy.lastShot = time;
    }
}

// Snipers hover at range, taking aimed shots and repositioning when too close.
function updateSniperBehavior(scene, enemy, time, delta, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    const enemyProjectiles = scene.enemyProjectiles;
    const audioManager = scene.audioManager;
    if (!player || !enemyProjectiles) return;
    if (!enemy.isPositioned) {
        if (!enemy.positionTimer) enemy.positionTimer = 0;
        enemy.positionTimer += delta * timeSlowMultiplier;
        enemy.setVelocity((Math.random() - 0.5) * 40 * timeSlowMultiplier, (Math.random() - 0.5) * 40 * timeSlowMultiplier);
        
        if (enemy.positionTimer > 1500) {
            enemy.isPositioned = true;
            enemy.setVelocity(0, (Math.random() - 0.5) * 20 * timeSlowMultiplier);
        }
    } else {
        if (Math.abs(enemy.body.velocity.y) < 10) {
            enemy.setVelocityY((Math.random() - 0.5) * 30 * timeSlowMultiplier);
        }
        
        if (time > enemy.lastShot + 2500) {
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
            const proj = enemyProjectiles.create(enemy.x, enemy.y, 'enemyProjectile_baiter');
            proj.setDepth(FG_DEPTH_BASE + 4);
            proj.setScale(2.0);
            proj.setVelocity(Math.cos(angle) * 450, Math.sin(angle) * 450);
            proj.damage = 2;
            proj.rotation = angle;

            // Ensure sniper projectiles despawn after 3 seconds
            scene.time.delayedCall(3000, () => {
                if (proj && proj.active) proj.destroy();
            });

            enemy.lastShot = time;
            if (audioManager) audioManager.playSound('enemyShoot');
        }
    }
}

// Buffs nearby swarmers and sprays slowing fields while pursuing the player.
function updateSwarmLeaderBehavior(scene, enemy, time, timeSlowMultiplier) {
    const enemies = scene.enemies;
    const player = getActivePlayer(scene);
    if (!enemies || !player) return;
    const buffInterval = 500;
    const maxBuffSpeed = 260;
    enemies.children.entries.forEach(ally => {
        if (ally !== enemy && ally.active && Phaser.Math.Distance.Between(enemy.x, enemy.y, ally.x, ally.y) < enemy.buffRadius) {
            if (!ally.lastSwarmBuffAt || time - ally.lastSwarmBuffAt >= buffInterval) {
                ally.lastSwarmBuffAt = time;
                if (ally.body) {
                    const boostedX = ally.body.velocity.x * 1.2;
                    const boostedY = ally.body.velocity.y * 1.2;
                    const boostedSpeed = Math.hypot(boostedX, boostedY);
                    if (boostedSpeed > maxBuffSpeed) {
                        const scale = maxBuffSpeed / boostedSpeed;
                        ally.body.setVelocity(boostedX * scale, boostedY * scale);
                    } else {
                        ally.body.setVelocity(boostedX, boostedY);
                    }
                }
                const buffGlow = scene.add.circle(ally.x, ally.y, 15, 0x00ff00, 0.3);
                scene.tweens.add({
                    targets: buffGlow,
                    alpha: 0,
                    scale: 1.5,
                    duration: 500,
                    onComplete: () => buffGlow.destroy()
                });
            }
        }
    });
    
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    const evasion = Math.sin(time * 0.01) * 0.5;
    enemy.setVelocity(Math.cos(angle + evasion) * 100 * timeSlowMultiplier, Math.sin(angle + evasion) * 100 * timeSlowMultiplier);
    
    if (time > enemy.lastShot + 1600 && Math.random() < 0.04) {
        shootAtPlayer(scene, enemy);
        enemy.lastShot = time;
    }
}

// Allows regenerators to heal periodically while drifting in gentle arcs and firing.
function updateRegeneratorBehavior(scene, enemy, time, delta, timeSlowMultiplier) {
    enemy.lastHeal += delta * timeSlowMultiplier;
    if (enemy.lastHeal > 5000 && enemy.hp < getEnemyHP('regenerator')) {
        enemy.hp = Math.min(getEnemyHP('regenerator'), enemy.hp + enemy.healAmount);
        enemy.lastHeal = 0;
        createExplosion(scene, enemy.x, enemy.y, 0x00ff00);
    }
    
    enemy.patrolAngle += 0.008 * timeSlowMultiplier;
    enemy.setVelocity(Math.cos(enemy.patrolAngle) * 60 * timeSlowMultiplier, Math.sin(enemy.patrolAngle) * 60 * timeSlowMultiplier);
    
    if (time > enemy.lastShot + 2200 && Math.random() < 0.025) {
        shootAtPlayer(scene, enemy);
        enemy.lastShot = time;
    }
}

// Main per-frame update loop that keeps every active enemy inside the play area
// and delegates behavior logic to the appropriate handler for each enemy type.
function updateEnemies(scene, time, delta) {
    const enemies = scene.enemies;
    if (!enemies) return;
    const topLimit = 20;
    
    enemies.children.entries.forEach(enemy => {
        if (!enemy || !enemy.body || !enemy.active) {
            return;
        }
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
            case 'mutant':
                updateMutantBehavior(scene, enemy, time, timeSlowMultiplier);
                break;
            case 'drone':
                updateDroneBehavior(scene, enemy, time, timeSlowMultiplier);
                break;
            case 'bomber':
                updateBomberBehavior(scene, enemy, time, timeSlowMultiplier);
                break;
            case 'turret':
                updateTurretBehavior(scene, enemy, time, delta, timeSlowMultiplier);
                break;
            case 'pod':
                updatePodBehavior(scene, enemy, time, timeSlowMultiplier);
                break;
            case 'swarmer':
                updateSwarmerBehavior(scene, enemy, time, timeSlowMultiplier);
                break;
            case 'baiter':
                updateBaiterBehavior(scene, enemy, time, timeSlowMultiplier);
                break;
            case 'kamikaze':
                updateKamikazeBehavior(scene, enemy, time, timeSlowMultiplier);
                break;
            case 'shield':
                updateShieldBehavior(scene, enemy, time, timeSlowMultiplier);
                break;
            case 'seeker':
                updateSeekerBehavior(scene, enemy, time, timeSlowMultiplier);
                break;
            case 'spawner':
                updateSpawnerBehavior(scene, enemy, time, delta, timeSlowMultiplier);
                break;
            case 'shielder':
                updateShielderBehavior(scene, enemy, time, timeSlowMultiplier);
                break;
            case 'bouncer':
                updateBouncerBehavior(scene, enemy, time, delta, timeSlowMultiplier);
                break;
            case 'sniper':
                updateSniperBehavior(scene, enemy, time, delta, timeSlowMultiplier);
                break;
            case 'swarmLeader':
                updateSwarmLeaderBehavior(scene, enemy, time, timeSlowMultiplier);
                break;
            case 'regenerator':
                updateRegeneratorBehavior(scene, enemy, time, delta, timeSlowMultiplier);
                break;
        }

        if (enemy._topEscapeAt && time - enemy._topEscapeAt > 1500) {
            const et = enemy.enemyType;
            enemy.destroy();
            const camX = scene.cameras.main.scrollX;
            const rx = camX + Phaser.Math.Between(50, CONFIG.width - 50);
            const ry = Phaser.Math.Between(topLimit + 20, (scene.groundLevel || CONFIG.worldHeight - 80) - Math.sin(rx / 200) * 30 - 60);
            const countsTowardsWave = enemy.countsTowardsWave !== false;
            spawnEnemy(scene, et, rx, ry, countsTowardsWave);
        }
    });
}

if (typeof module !== 'undefined') {
    module.exports = { updateLanderBehavior, updateRegeneratorBehavior };
}
