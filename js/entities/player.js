// ------------------------
// Player mechanics and controls
// ------------------------

function updatePlayer(scene, time) {
    const { player, cursors, spaceKey, shiftKey, qKey, pKey, particleManager, audioManager } = scene;
    if (!player || !cursors) return;
    if (playerState.controlScheme === 'veritech') {
        updateVeritechController(scene, time);
        return;
    }
    let speed = playerState.powerUps.speed > 0 ? 400 : playerState.baseSpeed;
    player.setVelocity(0, 0);
    const vInput = window.virtualInput || { left: false, right: false, up: false, down: false, fire: false };

    if (cursors.left.isDown || vInput.left) {
        player.setVelocityX(-speed);
        player.flipX = true;
        playerState.direction = 'left';
    } else if (cursors.right.isDown || vInput.right) {
        player.setVelocityX(speed);
        player.flipX = false;
        playerState.direction = 'right';
    }
    if (cursors.up.isDown || vInput.up) player.setVelocityY(-speed);
    else if (cursors.down.isDown || vInput.down) player.setVelocityY(speed);

    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    const terrainVariation = Math.sin(player.x / 200) * 30;
    const minY = 20;
    const maxY = groundLevel - terrainVariation - 20;
    if (player.y < minY) player.y = minY;
    if (player.y > maxY) player.y = maxY;

    if ((spaceKey.isDown || vInput.fire) && time > playerState.lastFire + playerState.fireRate) {
        fireWeapon(scene);
        if (audioManager) {
            audioManager.playSound(playerState.powerUps.laser > 0 ? 'playerFireSpread' : 'playerFire');
        }
        playerState.lastFire = time;
    }

    if (Phaser.Input.Keyboard.JustDown(shiftKey)) useSmartBomb(scene);
    if (Phaser.Input.Keyboard.JustDown(qKey)) useHyperspace(scene);
    if (Phaser.Input.Keyboard.JustDown(pKey)) togglePause(scene);

    if (playerState.powerUps.shield > 0 && !player.shieldSprite) {
        player.shieldSprite = scene.add.sprite(player.x, player.y, 'shield');
        player.shieldSprite.setAlpha(0.7);
        player.shieldSprite.setDepth(FG_DEPTH_BASE + 11);
        player.shieldSprite.setScale(1.2);
    } else if (playerState.powerUps.shield <= 0 && player.shieldSprite) {
        const shieldSprite = player.shieldSprite;
        const shieldX = shieldSprite.x;
        const shieldY = shieldSprite.y;
        scene.tweens.add({
            targets: shieldSprite,
            scale: 2,
            alpha: 0,
            duration: 300,
            ease: 'Power2.easeOut',
            onComplete: () => {
                if (shieldSprite && shieldSprite.destroy) shieldSprite.destroy();
                if (player.shieldSprite === shieldSprite) player.shieldSprite = null;
            }
        });
        createExplosion(scene, shieldX, shieldY, 0x00aaff);
    }

    if (player.shieldSprite) {
        player.shieldSprite.x = player.x;
        player.shieldSprite.y = player.y;
        const pulse = Math.sin(Date.now() * 0.008) * 0.15 + 0.7;
        player.shieldSprite.setAlpha(pulse);
        const colorShift = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;
        player.shieldSprite.setTint(Phaser.Display.Color.GetColor(
            Math.floor(255 * colorShift),
            255,
            Math.floor(255 * colorShift)
        ));
    }

    const velocityX = player.body.velocity.x;
    const velocityY = player.body.velocity.y;
    const movementSpeed = Math.hypot(velocityX, velocityY);
    if (particleManager && movementSpeed > 20) {
        const rotation = movementSpeed > 0
            ? Math.atan2(velocityY, velocityX)
            : (playerState.direction === 'right' ? 0 : Math.PI);
        const exhaustInterval = 40;
        if (!playerState.lastExhaustTime || time - playerState.lastExhaustTime >= exhaustInterval) {
            particleManager.makeExhaustFire(player.x, player.y, rotation);
            playerState.lastExhaustTime = time;
        }
        particleManager.makeExhaustTrail(player.x, player.y, rotation, movementSpeed);
    } else if (particleManager) {
        particleManager.stopExhaustTrail();
    }
}

function updateVeritechController(scene, time) {
    const { veritech, pilot } = playerState;
    if (veritech.active) {
        updateVeritech(scene, time, veritech);
    } else if (pilot.active) {
        updatePilot(scene, time, pilot);
    }
}

function updateVeritech(scene, time, state) {
    const { player, cursors, spaceKey, shiftKey, audioManager } = scene;
    if (!player || !cursors) return;

    const speed = playerState.powerUps.speed > 0 ? 400 : playerState.baseSpeed;
    player.setVelocity(0, 0);

    if (cursors.left.isDown) {
        player.setVelocityX(-speed);
        player.flipX = true;
        playerState.facingRight = false;
        playerState.direction = 'left';
    } else if (cursors.right.isDown) {
        player.setVelocityX(speed);
        player.flipX = false;
        playerState.facingRight = true;
        playerState.direction = 'right';
    }
    if (cursors.up.isDown) player.setVelocityY(-speed);
    else if (cursors.down.isDown) player.setVelocityY(speed);

    if (spaceKey.isDown && time > playerState.lastFire + playerState.fireRate) {
        fireWeapon(scene);
        if (audioManager) {
            audioManager.playSound(playerState.powerUps.laser > 0 ? 'playerFireSpread' : 'playerFire');
        }
        playerState.lastFire = time;
    }

    if (Phaser.Input.Keyboard.JustDown(shiftKey)) {
        toggleVeritechTransform(state);
    }
}

function updatePilot(scene, time, state) {
    const { pilotSprite, cursors, spaceKey, audioManager } = scene;
    if (!pilotSprite || !cursors) return;
    if (!pilotSprite.active) return;

    const speed = 180;
    pilotSprite.setVelocity(0, 0);

    if (cursors.left.isDown) {
        pilotSprite.setVelocityX(-speed);
        state.facing = -1;
    } else if (cursors.right.isDown) {
        pilotSprite.setVelocityX(speed);
        state.facing = 1;
    }
    if (cursors.up.isDown) pilotSprite.setVelocityY(-speed);
    else if (cursors.down.isDown) pilotSprite.setVelocityY(speed);

    if (spaceKey.isDown && time > playerState.lastFire + playerState.fireRate) {
        fireWeapon(scene);
        if (audioManager) {
            audioManager.playSound(playerState.powerUps.laser > 0 ? 'playerFireSpread' : 'playerFire');
        }
        playerState.lastFire = time;
    }
}

function toggleVeritechTransform(state) {
    const now = Date.now();
    if (now - state.lastTransformTime < state.transformCooldownMs) return;
    state.mode = state.mode === 'fighter' ? 'guardian' : 'fighter';
    state.lastTransformTime = now;
}

function fireWeapon(scene) {
    const { player, projectiles, drones, audioManager } = scene;
    if (!player || !projectiles || !drones) return;
    let speed = 600;
    if (playerState.powerUps.speed > 0) speed = 750;
    const fireX = player.x + (playerState.direction === 'right' ? 25 : -25);
    const fireY = player.y;
    const velocityX = playerState.direction === 'right' ? speed : -speed;
    const baseDamage = 1;
    const damage = playerState.powerUps.double > 0 ? baseDamage * 2 : baseDamage;

    // Determine if piercing is active
    const isPiercing = playerState.powerUps.piercing > 0;

    switch (playerState.powerUps.laser) {
        case 0:
            // Normal shot - use piercing texture if active
            createProjectile(scene, fireX, fireY, velocityX, 0, isPiercing ? 'piercing' : 'normal', damage);
            break;
        case 1:
            // Spread shot - cyan diamond projectiles
            createProjectile(scene, fireX, fireY, velocityX, 0, 'spread', damage);
            createProjectile(scene, fireX, fireY - 5, velocityX, -100, 'spread', damage);
            createProjectile(scene, fireX, fireY + 5, velocityX, 100, 'spread', damage);
            break;
        case 2:
            // Wave shot - purple sinusoidal energy
            createProjectile(scene, fireX, fireY, velocityX, 0, 'wave', damage, true);
            break;
    }

    if (playerState.powerUps.missile > 0) {
        createProjectile(scene, fireX, fireY - 10, velocityX, 0, 'homing', damage);
    }
    if (playerState.powerUps.overdrive > 0) {
        // Overdrive shots - orange flame bolts
        createProjectile(scene, fireX, fireY - 15, velocityX, -50, 'overdrive', damage);
        createProjectile(scene, fireX, fireY + 15, velocityX, 50, 'overdrive', damage);
    }
    if (playerState.powerUps.rearShot > 0) {
        const rearVelocityX = playerState.direction === 'right' ? -speed : speed;
        createProjectile(scene, player.x, fireY, rearVelocityX, 0, isPiercing ? 'piercing' : 'normal', damage);
    }
    if (playerState.powerUps.sideShot > 0) {
        // Side shots - teal vertical bolts
        createProjectile(scene, player.x, fireY, 0, -speed, 'side', damage);
        createProjectile(scene, player.x, fireY, 0, speed, 'side', damage);
    }
    if (playerState.powerUps.multiShot > 0) {
        // Multi-shot - small yellow pellets
        createProjectile(scene, fireX, fireY - 10, velocityX, -150, 'multi', damage);
        createProjectile(scene, fireX, fireY - 5, velocityX, -75, 'multi', damage);
        createProjectile(scene, fireX, fireY + 5, velocityX, 75, 'multi', damage);
        createProjectile(scene, fireX, fireY + 10, velocityX, 150, 'multi', damage);
    }

    // Drone projectiles - green energy orbs
    drones.children.entries.forEach(drone => {
        const dProj = projectiles.create(drone.x, drone.y, 'projectile_drone');
        dProj.setScale(1.25);
        dProj.setDepth(FG_DEPTH_BASE + 6);
        dProj.setVelocity(velocityX, 0);
        dProj.damage = damage;
        dProj.projectileType = 'drone';
        scene.time.delayedCall(2000, () => {
            if (dProj && dProj.active) dProj.destroy();
        });
    });
}

function createProjectile(scene, x, y, vx, vy, type = 'normal', damage = 1, piercing = false) {
    const { projectiles } = scene;
    if (!projectiles) return;
    let proj;
    let textureName;
    
    // Select texture based on projectile type
    switch (type) {
        case 'homing': textureName = 'missile'; break;
        case 'spread': textureName = 'projectile_spread'; break;
        case 'wave': textureName = 'projectile_wave'; break;
        case 'piercing': textureName = 'projectile_piercing'; break;
        case 'overdrive': textureName = 'projectile_overdrive'; break;
        case 'side': textureName = 'projectile_side'; break;
        case 'multi': textureName = 'projectile_multi'; break;
        case 'drone': textureName = 'projectile_drone'; break;
        case 'normal':
        default: textureName = 'projectile'; break;
    }
    
    proj = projectiles.create(x, y, textureName);
    proj.setScale(1.25);
    proj.setDepth(FG_DEPTH_BASE + 6);
    proj.setVelocity(vx, vy);
    proj.projectileType = type;
    proj.damage = damage;
    proj.isPiercing = piercing || playerState.powerUps.piercing > 0 || type === 'wave' || type === 'piercing';
    proj.birthTime = scene.time.now;
    
    // Flip sprite if moving left
    if (vx < 0) proj.flipX = true;
    
    // Add visual effects based on type - OPTIMIZED: reduced particle counts
    if (type === 'wave') {
        scene.tweens.add({
            targets: proj,
            y: y + 15,
            duration: 150,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    } else if (type === 'homing') {
        const emitter = scene.add.particles(0, 0, 'particle', {
            follow: proj,
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.5, end: 0 },
            tint: 0xff6600,
            lifespan: 150,
            frequency: 50,
            blendMode: 'ADD'
        });
        proj.emitter = emitter;
    } else if (type === 'overdrive') {
        const emitter = scene.add.particles(0, 0, 'particle', {
            follow: proj,
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.6, end: 0 },
            tint: 0xff8800,
            lifespan: 120,
            frequency: 40,
            blendMode: 'ADD'
        });
        proj.emitter = emitter;
    }
    
    if (playerState.powerUps.timeSlow > 0) {
        proj.setVelocity(vx * 1.5, vy * 1.5);
    }

    // Override destroy to clean up particles
    const originalDestroy = proj.destroy.bind(proj);
    proj.destroy = () => {
        if (proj.emitter) {
            proj.emitter.stop();
            proj.emitter.stopFollow();
            // Let particles fade out naturally
            scene.time.delayedCall(500, () => {
                if (proj.emitter) proj.emitter.destroy();
            });
        }
        originalDestroy();
    };
    
    scene.time.delayedCall(3000, () => {
        if (proj && proj.active) proj.destroy();
    });
}

function updateProjectiles(scene) {
    const { projectiles, enemyProjectiles, enemies, player } = scene;
    if (!projectiles || !enemyProjectiles || !enemies || !player) return;
    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    const destroyIfGrounded = (proj) => {
        const terrainVariation = Math.sin(proj.x / 200) * 30;
        const groundY = groundLevel - terrainVariation - 15;
        if (proj.y >= groundY) {
            proj.destroy();
            return true;
        }
        return false;
    };

    projectiles.children.entries.forEach(proj => {
        wrapWorldBounds(proj);
        if (!proj.active || destroyIfGrounded(proj)) return;
        if (proj.projectileType === 'homing') {
            let nearestEnemy = null;
            let nearestDist = Infinity;
            enemies.children.entries.forEach(enemy => {
                const dist = Phaser.Math.Distance.Between(proj.x, proj.y, enemy.x, enemy.y);
                if (dist < nearestDist && dist < 300) {
                    nearestDist = dist;
                    nearestEnemy = enemy;
                }
            });
            if (nearestEnemy) {
                const angle = Phaser.Math.Angle.Between(proj.x, proj.y, nearestEnemy.x, nearestEnemy.y);
                proj.setVelocity(Math.cos(angle) * 500, Math.sin(angle) * 500);
                proj.rotation = angle;
            }
        }
    });

    enemyProjectiles.children.entries.forEach(proj => {
        wrapWorldBounds(proj);
        if (!proj.active || destroyIfGrounded(proj)) return;
        if (playerState.powerUps.timeSlow > 0 && !proj.isSlowed) {
            proj.setVelocity(proj.body.velocity.x * 0.3, proj.body.velocity.y * 0.3);
            proj.isSlowed = true;
        } else if (playerState.powerUps.timeSlow <= 0 && proj.isSlowed) {
            proj.setVelocity(proj.body.velocity.x * 3.33, proj.body.velocity.y * 3.33);
            proj.isSlowed = false;
        }
    });
}


function playerHitEnemy(playerSprite, enemy) {
    const audioManager = this.audioManager;
    if (playerState.powerUps.invincibility > 0) {
        destroyEnemy(this, enemy);
        return;
    }
    if (playerState.powerUps.shield > 0) {
        playerState.powerUps.shield = 0;
        destroyEnemy(this, enemy);
        screenShake(this, 10, 200);
        if (audioManager) audioManager.playSound('hitPlayer');
    } else {
        screenShake(this, 15, 300);
        playerDie(this);
    }
}

function playerHitProjectile(playerSprite, projectile) {
    const audioManager = this.audioManager;
    if (playerState.powerUps.invincibility > 0) {
        projectile.destroy();
        return;
    }
    if (playerState.powerUps.shield > 0) {
        playerState.powerUps.shield = 0;
        projectile.destroy();
        screenShake(this, 8, 150);
        if (audioManager) audioManager.playSound('hitPlayer');
    } else {
        projectile.destroy();
        screenShake(this, 12, 250);
        playerDie(this);
    }
}

function playerDie(scene) {
    const { player, particleManager, audioManager, drones } = scene;
    if (!player) return;
    if (scene._isRespawning || gameState.gameOver) return;
    gameState.lives--;
    if (particleManager) {
        if (audioManager) audioManager.playSound('explosion');
        particleManager.playerExplosion(player.x, player.y);
    } else {
        createExplosion(scene, player.x, player.y);
    }
    screenShake(scene, 20, 500);

    if (gameState.lives <= 0) {
        gameOver(scene);
    } else {
        scene._isRespawning = true;
        player.setActive(false).setVisible(false);
        player.body.enable = false;

        const p = playerState.powerUps;
        const weaponKeys = ['laser','drone','shield','missile','overdrive','rearShot','sideShot','rapid','multiShot','piercing','speed','magnet','double','timeSlow'];
        const activeWeapons = weaponKeys.filter(k => p[k] && p[k] > 0);
        const toRemove = Math.ceil(activeWeapons.length / 2);
        Phaser.Utils.Array.Shuffle(activeWeapons);
        for (let i = 0; i < toRemove; i++) {
            const key = activeWeapons[i];
            if (key) p[key] = 0;
        }
        p.invincibility = 0;
        if (!p.overdrive && !p.rapid) playerState.fireRate = 200;
        drones.clear(true);
        if (player.shieldSprite) {
            player.shieldSprite.destroy();
            player.shieldSprite = null;
        }

        scene.time.delayedCall(1000, () => {
            player.x = 100;
            player.y = 300;
            player.setActive(true).setVisible(true);
            player.body.enable = true;
            playerState.powerUps.invincibility = 2000;
            scene._isRespawning = false;
        });
    }
}

function useSmartBomb(scene) {
    const { enemies, enemyProjectiles, audioManager } = scene;
    if (!enemies || !enemyProjectiles) return;
    if (gameState.smartBombs <= 0) return;
    gameState.smartBombs--;
    if (audioManager) audioManager.playSound('smartBomb');
    enemies.children.entries.forEach(enemy => {
        if (!enemy.active) return;
        createExplosion(scene, enemy.x, enemy.y);
        destroyEnemy(scene, enemy);
    });
    enemyProjectiles.clear(true);
    const reduceFlashes = typeof isFlashReductionEnabled === 'function' && isFlashReductionEnabled();
    const flash = scene.add.rectangle(
        scene.cameras.main.scrollX + CONFIG.width / 2,
        CONFIG.height / 2,
        CONFIG.width,
        CONFIG.height,
        0xffffff,
        reduceFlashes ? 0.4 : 0.8
    ).setScrollFactor(0).setDepth(FG_DEPTH_BASE + 90);
    scene.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 500,
        onComplete: () => flash.destroy()
    });
}

function useHyperspace(scene) {
    const { player, particleManager, audioManager } = scene;
    if (!player) return;
    player.x = Math.random() * CONFIG.worldWidth;
    player.y = 100 + Math.random() * (CONFIG.worldHeight - 200);
    if (particleManager) {
        particleManager.blackHoleExplosion(player.x, player.y);
    } else {
        createExplosion(scene, player.x, player.y, 0x00ffff);
    }
    if (audioManager) audioManager.playSound('hyperspace');
}

function updateDrones(scene, time) {
    const { drones, player } = scene;
    if (!drones || !player) return;
    drones.children.entries.forEach((drone, index) => {
        const angle = (time * 0.002 + index * Math.PI * 2 / drones.children.entries.length) % (Math.PI * 2);
        drone.x = player.x + Math.cos(angle) * 60;
        drone.y = player.y + Math.sin(angle) * 40;
    });
}

function spawnHuman(scene, x) {
    const { humans } = scene;
    if (!humans) return;
    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    const terrainVariation = Math.sin(x / 200) * 30;
    const y = groundLevel - terrainVariation - 15;
    const human = humans.create(x, y, 'human');
    human.setScale(1.25);
    human.setDepth(FG_DEPTH_BASE + 1);
    human.setCollideWorldBounds(false);
    human.body.setSize(8, 12);
    human.isAbducted = false;
    human.abductor = null;
}

function rescueHuman(playerSprite, human) {
    const audioManager = this.audioManager;
    if (!human.isAbducted) return;
    gameState.humansRescued++;
    const reward = getMissionScaledReward(1000);
    gameState.score += reward;
    if (audioManager) audioManager.playSound('humanRescued');
    const rescueText = this.add.text(
        human.x,
        human.y - 20,
        `+${reward} RESCUED!`,
        {
            fontSize: '16px',
            fontFamily: 'Orbitron',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3
        }
    ).setOrigin(0.5);
    this.tweens.add({
        targets: rescueText,
        y: human.y - 50,
        alpha: 0,
        duration: 1000,
        onComplete: () => rescueText.destroy()
    });
    createExplosion(this, human.x, human.y, 0x00ff00);
    human.destroy();
    if (Math.random() < 0.4) spawnPowerUp(this, human.x, human.y);
}

function updateHumans(scene) {
    const { humans } = scene;
    if (!humans) return;
    humans.children.entries.forEach(human => {
        if (human.body && human.body.gravity && human.body.gravity.y > 0) {
            const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
            const terrainVariation = Math.sin(human.x / 200) * 30;
            const groundY = groundLevel - terrainVariation - 15;
            if (human.y >= groundY) {
                human.y = groundY;
                human.setGravityY(0);
                human.setVelocity(0, 0);
                human.isAbducted = false;
                human.abductor = null;
            }
        }
        wrapWorldBounds(human);
    });
}
