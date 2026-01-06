// ------------------------
// Player mechanics and controls
// ------------------------

function getActivePlayer(scene) {
    return veritechState.active ? scene.veritech : scene.pilot;
}

function syncActivePlayer(scene) {
    scene.player = getActivePlayer(scene);
    return scene.player;
}

function setVeritechMode(scene, mode) {
    veritechState.mode = mode;
    const texture = mode === 'guardian' ? 'veritech_guardian' : 'veritech_fighter';
    if (scene.veritech) {
        scene.veritech.setTexture(texture);
        if (mode === 'guardian') {
            scene.veritech.body.setSize(22, 28);
        } else {
            scene.veritech.body.setSize(28, 12);
        }
    }
}

function ejectPilot(scene) {
    if (!scene.veritech || !scene.pilot || !veritechState.active) return;
    veritechState.active = false;
    pilotState.active = true;
    pilotState.grounded = false;
    pilotState.vx = veritechState.vx * 0.5;
    pilotState.vy = -120;
    pilotState.facing = veritechState.facing;
    scene.pilot.setPosition(scene.veritech.x, scene.veritech.y);
    scene.pilot.setActive(true).setVisible(true);
    scene.pilot.body.enable = true;
    scene.veritech.body.enable = false;
    scene.veritech.setAlpha(1);
    if (scene.veritech.shieldSprite) {
        scene.veritech.shieldSprite.destroy();
        scene.veritech.shieldSprite = null;
    }
    syncActivePlayer(scene);
}

function enterVeritech(scene) {
    if (!scene.veritech || !scene.pilot || !pilotState.active) return;
    if (veritechState.destroyed) return;
    const dist = Phaser.Math.Distance.Between(scene.pilot.x, scene.pilot.y, scene.veritech.x, scene.veritech.y);
    if (dist > 60) return;
    pilotState.active = false;
    veritechState.active = true;
    pilotState.vx = 0;
    pilotState.vy = 0;
    scene.pilot.setActive(false).setVisible(false);
    scene.pilot.body.enable = false;
    scene.veritech.body.enable = true;
    scene.pilot.setAlpha(1);
    if (scene.pilot.shieldSprite) {
        scene.pilot.shieldSprite.destroy();
        scene.pilot.shieldSprite = null;
    }
    syncActivePlayer(scene);
}

function updatePlayer(scene, time, delta) {
    const {
        veritech,
        pilot,
        cursors,
        spaceKey,
        shiftKey,
        ctrlKey,
        bKey,
        eKey,
        rKey,
        qKey,
        pKey,
        particleManager,
        audioManager
    } = scene;
    if (!veritech || !cursors) return;

    const vInput = window.virtualInput || { left: false, right: false, up: false, down: false, fire: false };
    const left = cursors.left.isDown || vInput.left;
    const right = cursors.right.isDown || vInput.right;
    const up = cursors.up.isDown || vInput.up;
    const down = cursors.down.isDown || vInput.down;

    if (veritechState.transformCooldown > 0) {
        veritechState.transformCooldown -= delta;
    }

    if (Phaser.Input.Keyboard.JustDown(shiftKey) && veritechState.active && veritechState.transformCooldown <= 0) {
        const nextMode = veritechState.mode === 'fighter' ? 'guardian' : 'fighter';
        setVeritechMode(scene, nextMode);
        veritechState.transformCooldown = 350;
    }

    if (eKey && Phaser.Input.Keyboard.JustDown(eKey) && veritechState.active) {
        ejectPilot(scene);
    }

    if (rKey && Phaser.Input.Keyboard.JustDown(rKey) && pilotState.active) {
        enterVeritech(scene);
    }

    if (bKey && Phaser.Input.Keyboard.JustDown(bKey)) useSmartBomb(scene);
    if (Phaser.Input.Keyboard.JustDown(qKey)) useHyperspace(scene);
    if (Phaser.Input.Keyboard.JustDown(pKey)) togglePause(scene);

    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    const minY = 20;

    if (veritechState.active) {
        const speed = veritechState.mode === 'fighter' ? 320 : 220;
        const horizontalSpeed = speed * 0.4;
        const accel = veritechState.mode === 'fighter' ? 0.18 : 0.2;
        const drag = veritechState.mode === 'fighter' ? 0.92 : 0.9;
        const gravity = veritechState.mode === 'guardian' ? 520 : 0;

        if (left) {
            veritechState.vx -= horizontalSpeed * accel;
            veritechState.facing = -1;
        } else if (right) {
            veritechState.vx += horizontalSpeed * accel;
            veritechState.facing = 1;
        }

        if (veritechState.mode === 'fighter') {
            if (up) veritechState.vy -= speed * accel;
            if (down) veritechState.vy += speed * accel;
        } else {
            if (up) veritechState.vy -= speed * accel * 1.2;
            if (down) veritechState.vy += speed * accel * 0.7;
            veritechState.vy += gravity * (delta / 1000);
        }

        veritechState.vx *= drag;
        veritechState.vy *= drag;

        const maxSpeed = speed * 1.1;
        const maxHorizontalSpeed = horizontalSpeed * 1.1;
        veritechState.vx = Phaser.Math.Clamp(veritechState.vx, -maxHorizontalSpeed, maxHorizontalSpeed);
        veritechState.vy = Phaser.Math.Clamp(veritechState.vy, -maxSpeed, maxSpeed);

        veritech.x += veritechState.vx * (delta / 1000);
        veritech.y += veritechState.vy * (delta / 1000);
        veritech.body.setVelocity(veritechState.vx, veritechState.vy);

        const terrainVariation = Math.sin(veritech.x / 200) * 30;
        const maxY = groundLevel - terrainVariation - 20;
        if (veritech.y < minY) veritech.y = minY;
        if (veritech.y > maxY) {
            veritech.y = maxY;
            veritechState.vy = 0;
        }

        if (veritechState.mode === 'guardian') {
            veritechState.aimAngle = getGuardianAimAngle(left, right, up, down);
        }

        veritech.flipX = veritechState.facing < 0;
        playerState.direction = veritechState.facing < 0 ? 'left' : 'right';
        syncActivePlayer(scene);
    } else if (pilotState.active) {
        const speed = 200;
        const horizontalSpeed = speed * 0.65;
        const jumpForce = -320;
        const gravity = 900;

        if (left) {
            pilotState.vx = -horizontalSpeed;
            pilotState.facing = -1;
        } else if (right) {
            pilotState.vx = horizontalSpeed;
            pilotState.facing = 1;
        } else {
            pilotState.vx *= 0.8;
        }

        const jumpPressed = (ctrlKey && ctrlKey.isDown) || vInput.up;
        if (jumpPressed && pilotState.grounded && (left || right || !(spaceKey.isDown || vInput.fire))) {
            pilotState.vy = jumpForce;
            pilotState.grounded = false;
        }

        pilotState.vy += gravity * (delta / 1000);
        pilotState.vy = Math.min(pilotState.vy, 900);

        pilot.x += pilotState.vx * (delta / 1000);
        pilot.y += pilotState.vy * (delta / 1000);
        pilot.body.setVelocity(pilotState.vx, pilotState.vy);

        const terrainVariation = Math.sin(pilot.x / 200) * 30;
        const maxY = groundLevel - terrainVariation - 12;
        if (pilot.y < minY) pilot.y = minY;
        if (pilot.y > maxY) {
            pilot.y = maxY;
            pilotState.vy = 0;
            pilotState.grounded = true;
        } else {
            pilotState.grounded = false;
        }

        pilot.flipX = pilotState.facing < 0;
        playerState.direction = pilotState.facing < 0 ? 'left' : 'right';
        syncActivePlayer(scene);
    }

    const activePlayer = syncActivePlayer(scene);

    if ((spaceKey.isDown || vInput.fire) && time > playerState.lastFire + playerState.fireRate) {
        let angle = null;
        if (pilotState.active) {
            angle = getPilotAimAngle(left, right, up, down, pilotState.grounded);
        } else if (veritechState.active && veritechState.mode === 'guardian') {
            angle = veritechState.aimAngle;
        }
        fireWeapon(scene, angle);
        if (audioManager) {
            audioManager.playSound(playerState.powerUps.laser > 0 ? 'playerFireSpread' : 'playerFire');
        }
        playerState.lastFire = time;
    }

    if (playerState.powerUps.shield > 0 && !activePlayer.shieldSprite) {
        activePlayer.shieldSprite = scene.add.sprite(activePlayer.x, activePlayer.y, 'shield');
        activePlayer.shieldSprite.setAlpha(0.7);
        activePlayer.shieldSprite.setDepth(FG_DEPTH_BASE + 11);
        activePlayer.shieldSprite.setScale(1.2);
    } else if (playerState.powerUps.shield <= 0 && activePlayer.shieldSprite) {
        const shieldSprite = activePlayer.shieldSprite;
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
                if (activePlayer.shieldSprite === shieldSprite) activePlayer.shieldSprite = null;
            }
        });
        createExplosion(scene, shieldX, shieldY, 0x00aaff);
    }

    if (activePlayer.shieldSprite) {
        activePlayer.shieldSprite.x = activePlayer.x;
        activePlayer.shieldSprite.y = activePlayer.y;
        const pulse = Math.sin(Date.now() * 0.008) * 0.15 + 0.7;
        activePlayer.shieldSprite.setAlpha(pulse);
        const colorShift = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;
        activePlayer.shieldSprite.setTint(Phaser.Display.Color.GetColor(
            Math.floor(255 * colorShift),
            255,
            Math.floor(255 * colorShift)
        ));
    }

    const velocityX = activePlayer.body.velocity.x;
    const velocityY = activePlayer.body.velocity.y;
    const movementSpeed = Math.hypot(velocityX, velocityY);
    if (particleManager && movementSpeed > 20 && veritechState.active) {
        const rotation = movementSpeed > 0
            ? Math.atan2(velocityY, velocityX)
            : (playerState.direction === 'right' ? 0 : Math.PI);
        const exhaustInterval = 40;
        if (!playerState.lastExhaustTime || time - playerState.lastExhaustTime >= exhaustInterval) {
            particleManager.makeExhaustFire(activePlayer.x, activePlayer.y, rotation);
            playerState.lastExhaustTime = time;
        }
        particleManager.makeExhaustTrail(activePlayer.x, activePlayer.y, rotation, movementSpeed);
    } else if (particleManager) {
        particleManager.stopExhaustTrail();
    }
}

function getPilotAimAngle(left, right, up, down, grounded) {
    let aimX = 0;
    let aimY = 0;

    if (left) aimX = -1;
    if (right) aimX = 1;

    if (up) aimY = -1;
    if (down && !grounded) aimY = 1;

    if (aimX === 0 && aimY === 0) {
        aimX = pilotState.facing;
    }

    return Math.atan2(aimY, aimX);
}

function getGuardianAimAngle(left, right, up, down) {
    const aimX = (left ? -1 : 0) + (right ? 1 : 0);
    const aimY = (up ? -1 : 0) + (down ? 1 : 0);
    if (aimX === 0 && aimY === 0) {
        return veritechState.facing < 0 ? Math.PI : 0;
    }
    return Math.atan2(aimY, aimX);
}

function fireWeapon(scene, angleOverride = null) {
    const { projectiles, drones } = scene;
    const player = getActivePlayer(scene);
    if (!player || !projectiles || !drones) return;
    let speed = 600;
    if (playerState.powerUps.speed > 0) speed = 750;
    const baseAngle = typeof angleOverride === 'number'
        ? angleOverride
        : (playerState.direction === 'right' ? 0 : Math.PI);
    const fireX = player.x + Math.cos(baseAngle) * 25;
    const fireY = player.y + Math.sin(baseAngle) * 25;
    const velocityX = Math.cos(baseAngle) * speed;
    const velocityY = Math.sin(baseAngle) * speed;
    const baseDamage = 1;
    const damage = playerState.powerUps.double > 0 ? baseDamage * 2 : baseDamage;

    // Determine if piercing is active
    const isPiercing = playerState.powerUps.piercing > 0;

    switch (playerState.powerUps.laser) {
        case 0:
            // Normal shot - use piercing texture if active
            createProjectile(scene, fireX, fireY, velocityX, velocityY, isPiercing ? 'piercing' : 'normal', damage);
            break;
        case 1:
            // Spread shot - cyan diamond projectiles
            createProjectile(scene, fireX, fireY, velocityX, velocityY, 'spread', damage);
            createProjectile(scene, fireX, fireY, Math.cos(baseAngle - 0.15) * speed, Math.sin(baseAngle - 0.15) * speed, 'spread', damage);
            createProjectile(scene, fireX, fireY, Math.cos(baseAngle + 0.15) * speed, Math.sin(baseAngle + 0.15) * speed, 'spread', damage);
            break;
        case 2:
            // Wave shot - purple sinusoidal energy
            createProjectile(scene, fireX, fireY, velocityX, velocityY, 'wave', damage, true);
            break;
    }

    if (playerState.powerUps.missile > 0) {
        createProjectile(scene, fireX, fireY, velocityX, velocityY, 'homing', damage);
    }
    if (playerState.powerUps.overdrive > 0) {
        // Overdrive shots - orange flame bolts
        createProjectile(scene, fireX, fireY, Math.cos(baseAngle - 0.08) * speed, Math.sin(baseAngle - 0.08) * speed, 'overdrive', damage);
        createProjectile(scene, fireX, fireY, Math.cos(baseAngle + 0.08) * speed, Math.sin(baseAngle + 0.08) * speed, 'overdrive', damage);
    }
    if (playerState.powerUps.rearShot > 0) {
        const rearAngle = baseAngle + Math.PI;
        createProjectile(scene, player.x, fireY, Math.cos(rearAngle) * speed, Math.sin(rearAngle) * speed, isPiercing ? 'piercing' : 'normal', damage);
    }
    if (playerState.powerUps.sideShot > 0) {
        // Side shots - teal vertical bolts
        const leftAngle = baseAngle - Math.PI / 2;
        const rightAngle = baseAngle + Math.PI / 2;
        createProjectile(scene, player.x, fireY, Math.cos(leftAngle) * speed, Math.sin(leftAngle) * speed, 'side', damage);
        createProjectile(scene, player.x, fireY, Math.cos(rightAngle) * speed, Math.sin(rightAngle) * speed, 'side', damage);
    }
    if (playerState.powerUps.multiShot > 0) {
        // Multi-shot - small yellow pellets
        createProjectile(scene, fireX, fireY, Math.cos(baseAngle - 0.2) * speed, Math.sin(baseAngle - 0.2) * speed, 'multi', damage);
        createProjectile(scene, fireX, fireY, Math.cos(baseAngle - 0.1) * speed, Math.sin(baseAngle - 0.1) * speed, 'multi', damage);
        createProjectile(scene, fireX, fireY, Math.cos(baseAngle + 0.1) * speed, Math.sin(baseAngle + 0.1) * speed, 'multi', damage);
        createProjectile(scene, fireX, fireY, Math.cos(baseAngle + 0.2) * speed, Math.sin(baseAngle + 0.2) * speed, 'multi', damage);
    }

    // Drone projectiles - green energy orbs
    drones.children.entries.forEach(drone => {
        const dProj = projectiles.create(drone.x, drone.y, 'projectile_drone');
        dProj.setScale(1.25);
        dProj.setDepth(FG_DEPTH_BASE + 6);
        dProj.setVelocity(velocityX, velocityY);
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
    const { projectiles, enemyProjectiles, enemies, garrisonDefenders, player } = scene;
    if (!projectiles || !enemyProjectiles || !player) return;
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
            const candidates = [];
            if (enemies) candidates.push(...enemies.children.entries);
            if (garrisonDefenders) candidates.push(...garrisonDefenders.children.entries);
            candidates.forEach(enemy => {
                if (!enemy.active) return;
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
    const { particleManager, audioManager, drones } = scene;
    const player = getActivePlayer(scene);
    if (!player) return;
    if (scene._isRespawning || gameState.gameOver) return;
    const isVeritechActive = veritechState.active || player === scene.veritech;
    if (particleManager) {
        if (audioManager) audioManager.playSound('explosion');
        particleManager.playerExplosion(player.x, player.y);
    } else {
        createExplosion(scene, player.x, player.y);
    }
    screenShake(scene, 20, 500);

    if (isVeritechActive) {
        veritechState.destroyed = true;
        if (scene.veritech) {
            scene.veritech.setActive(false).setVisible(false);
            scene.veritech.body.enable = false;
        }
        ejectPilot(scene);
        if (gameState.rebuildObjective) {
            gameState.rebuildObjective.active = true;
            gameState.rebuildObjective.stage = 'secure_extraction';
            gameState.rebuildObjective.timer = 0;
            gameState.rebuildObjective.encounterSpawned = false;
            gameState.rebuildObjective.extractionX = scene.pilot ? scene.pilot.x : player.x;
            gameState.rebuildObjective.extractionY = scene.pilot ? scene.pilot.y : player.y;
            gameState.rebuildObjective.branch = gameState.rebuildObjective.branch || 'dropship';
            gameState.rebuildObjective.requiredAlienTech = gameState.rebuildObjective.branch === 'station' ? 3 : 0;
            gameState.rebuildObjective.collectedAlienTech = 0;
            gameState.rebuildObjective.shipReturned = false;
        }
        playerState.powerUps.invincibility = 1500;
        return;
    }

    gameState.lives--;
    if (gameState.lives <= 0) {
        gameOver(scene);
    } else {
        scene._isRespawning = true;
        player.setActive(false).setVisible(false);
        player.body.enable = false;
        pilotState.active = false;
        veritechState.active = true;

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
            setVeritechMode(scene, 'fighter');
            veritechState.destroyed = false;
            scene.veritech.x = 100;
            scene.veritech.y = 300;
            scene.veritech.setActive(true).setVisible(true);
            scene.veritech.body.enable = true;
            scene.pilot.setActive(false).setVisible(false);
            scene.pilot.body.enable = false;
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
    const { particleManager, audioManager } = scene;
    const player = getActivePlayer(scene);
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
    const { drones } = scene;
    const player = getActivePlayer(scene);
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
