// ------------------------
// file: js/entities/player/playerWeapons.js
// ------------------------

function fireWeapon(scene, angleOverride = null) {
    const { projectiles, drones } = scene;
    const player = getActivePlayer(scene);
    if (!player || !projectiles || !drones) return;
    let speed = 600;
    if (playerState.powerUps.speed > 0) speed = 750;
    const p = playerState.powerUps;
    const baseAngle = typeof angleOverride === 'number'
        ? angleOverride
        : (playerState.direction === 'right' ? 0 : Math.PI);
    const { fireX, fireY } = getFireOrigin(player, baseAngle);
    const velocityX = Math.cos(baseAngle) * speed;
    const velocityY = Math.sin(baseAngle) * speed;
    const baseDamage = 1;
    const damage = p.double > 0 ? baseDamage * 2 : baseDamage;
    const laserConfig = getLaserConfig(p);
    const shotPattern = p.laser > 0 ? getShotPattern(0) : getShotPattern(p.multiShot || 0);

    fireShotPattern(scene, fireX, fireY, baseAngle, speed, damage, laserConfig, shotPattern);

    const coverageConfig = getCoverageConfig();
    const coveragePattern = getShotPattern(0);
    if (p.coverage > 0) {
        const rearAngle = baseAngle + Math.PI;
        const rearOrigin = getFireOrigin(player, rearAngle);
        fireShotPattern(scene, rearOrigin.fireX, rearOrigin.fireY, rearAngle, speed, damage, coverageConfig, coveragePattern);
    }

    if (p.coverage > 1) {
        const leftAngle = baseAngle - Math.PI / 2;
        const rightAngle = baseAngle + Math.PI / 2;
        const leftOrigin = getFireOrigin(player, leftAngle);
        const rightOrigin = getFireOrigin(player, rightAngle);
        fireShotPattern(scene, leftOrigin.fireX, leftOrigin.fireY, leftAngle, speed, damage, coverageConfig, coveragePattern);
        fireShotPattern(scene, rightOrigin.fireX, rightOrigin.fireY, rightAngle, speed, damage, coverageConfig, coveragePattern);
    }

    if (p.missile > 0) {
        const missileAngles = getMissileAngles(p.missile);
        missileAngles.forEach((offset, index) => {
            const angle = baseAngle + offset;
            const missileSpeed = speed - 50 + index * 5;
            createProjectile(
                scene,
                fireX,
                fireY,
                Math.cos(angle) * missileSpeed,
                Math.sin(angle) * missileSpeed,
                'homing',
                damage,
                { homingTier: p.missile }
            );
        });
    }
    if (p.overdrive > 0) {
        // Overdrive shots - orange flame bolts
        createProjectile(scene, fireX, fireY, Math.cos(baseAngle - 0.08) * speed, Math.sin(baseAngle - 0.08) * speed, 'overdrive', damage);
        createProjectile(scene, fireX, fireY, Math.cos(baseAngle + 0.08) * speed, Math.sin(baseAngle + 0.08) * speed, 'overdrive', damage);
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

function getLaserConfig(powerUps) {
    const basePiercing = powerUps.piercing > 0 || powerUps.laser >= 1;
    switch (powerUps.laser) {
        case 1:
            return { type: 'piercing', piercing: true };
        case 2:
            return { type: 'wave', piercing: true };
        case 0:
        default:
            return { type: basePiercing ? 'piercing' : 'normal', piercing: basePiercing };
    }
}

function getCoverageConfig() {
    return { type: 'normal', piercing: false };
}

function getFireOrigin(player, angle, distance = 25) {
    return {
        fireX: player.x + Math.cos(angle) * distance,
        fireY: player.y + Math.sin(angle) * distance
    };
}

function getShotPattern(tier) {
    switch (tier) {
        case 1:
            return { mode: 'twin', offsets: [-8, 8] };
        case 2:
            return { mode: 'spread', angles: [-0.15, 0, 0.15] };
        case 3:
            return { mode: 'multi', angles: [-0.25, -0.125, 0, 0.125, 0.25] };
        case 0:
        default:
            return { mode: 'single', angles: [0] };
    }
}

function fireShotPattern(scene, originX, originY, baseAngle, speed, damage, laserConfig, shotPattern) {
    if (shotPattern.mode === 'twin') {
        shotPattern.offsets.forEach(offset => {
            const offsetX = Math.cos(baseAngle + Math.PI / 2) * offset;
            const offsetY = Math.sin(baseAngle + Math.PI / 2) * offset;
            createProjectile(
                scene,
                originX + offsetX,
                originY + offsetY,
                Math.cos(baseAngle) * speed,
                Math.sin(baseAngle) * speed,
                laserConfig.type,
                damage,
                { piercing: laserConfig.piercing }
            );
        });
        return;
    }
    shotPattern.angles.forEach(angleOffset => {
        const angle = baseAngle + angleOffset;
        createProjectile(
            scene,
            originX,
            originY,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            laserConfig.type,
            damage,
            { piercing: laserConfig.piercing }
        );
    });
}

function getMissileAngles(tier) {
    switch (tier) {
        case 2:
            return [-0.18, 0, 0.18];
        case 3:
            return [-0.25, -0.12, 0, 0.12, 0.25];
        case 1:
        default:
            return [0];
    }
}

function createProjectile(scene, x, y, vx, vy, type = 'normal', damage = 1, options = {}) {
    const { projectiles } = scene;
    if (!projectiles) return;
    let proj;
    let textureName;
    const piercing = options.piercing || false;
    
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
    if (type === 'homing') {
        proj.homingTier = options.homingTier || 1;
    }
    
    // Flip sprite if moving left
    if (vx < 0) proj.flipX = true;
    
    // Add visual effects based on type - OPTIMIZED: reduced particle counts
    if (type === 'wave') {
        proj.waveStartTime = scene.time.now;
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
    if (type === 'wave') {
        proj.baseVx = proj.body.velocity.x;
        proj.baseVy = proj.body.velocity.y;
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
        if (proj.projectileType === 'wave' && typeof proj.baseVx === 'number') {
            const elapsed = scene.time.now - (proj.waveStartTime || scene.time.now);
            const baseSpeed = Math.hypot(proj.baseVx, proj.baseVy) || 1;
            const perpX = -proj.baseVy / baseSpeed;
            const perpY = proj.baseVx / baseSpeed;
            const waveOffset = Math.sin(elapsed * 0.02) * 120;
            proj.setVelocity(
                proj.baseVx + perpX * waveOffset,
                proj.baseVy + perpY * waveOffset
            );
        }
        if (proj.projectileType === 'homing') {
            let nearestEnemy = null;
            let nearestDist = Infinity;
            const candidates = [];
            if (enemies) candidates.push(...enemies.children.entries);
            if (garrisonDefenders) candidates.push(...garrisonDefenders.children.entries);
            const homingTier = proj.homingTier || 1;
            const maxRange = homingTier === 3 ? 450 : homingTier === 2 ? 360 : 300;
            const homingSpeed = homingTier === 3 ? 650 : homingTier === 2 ? 550 : 500;
            candidates.forEach(enemy => {
                if (!enemy.active) return;
                const dist = Phaser.Math.Distance.Between(proj.x, proj.y, enemy.x, enemy.y);
                if (dist < nearestDist && dist < maxRange) {
                    nearestDist = dist;
                    nearestEnemy = enemy;
                }
            });
            if (nearestEnemy) {
                const angle = Phaser.Math.Angle.Between(proj.x, proj.y, nearestEnemy.x, nearestEnemy.y);
                proj.setVelocity(Math.cos(angle) * homingSpeed, Math.sin(angle) * homingSpeed);
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
