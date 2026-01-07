// ------------------------
// file: js/entities/player/playerWeapons.js
// ------------------------

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
