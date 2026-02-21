// ------------------------
// file: js/entities/player/playerWeapons.js
// ------------------------

// Fires the current player weapon loadout, including primary, coverage, and missile behaviors.
function fireWeapon(scene, angleOverride = null) {
    const { projectiles, drones } = scene;
    const player = getActivePlayer(scene);
    if (!player || !projectiles) return;
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
    const primaryWeapon = playerState.primaryWeapon || (p.laser > 0 ? 'laser' : 'multiShot');
    const activeLaserTier = primaryWeapon === 'laser' ? p.laser : 0;
    const activeMultiShotTier = primaryWeapon === 'multiShot' ? p.multiShot : 0;
    const laserConfig = getLaserConfig(activeLaserTier, p.piercing);
    const shotPattern = getPrimaryShotPattern(activeLaserTier, activeMultiShotTier);
    const coveragePattern = getCoverageShotPattern();

    fireShotPattern(scene, fireX, fireY, baseAngle, speed, damage, laserConfig, shotPattern);

    const coverageConfig = getCoverageConfig();
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
        const missileSpeed = speed - 50;
        createProjectile(
            scene,
            fireX,
            fireY,
            Math.cos(baseAngle) * missileSpeed,
            Math.sin(baseAngle) * missileSpeed,
            'homing',
            damage,
            { homingTier: p.missile }
        );
    }
    if (p.overdrive > 0) {
        // Overdrive shots - orange flame bolts
        createProjectile(scene, fireX, fireY, Math.cos(baseAngle - 0.08) * speed, Math.sin(baseAngle - 0.08) * speed, 'overdrive', damage);
        createProjectile(scene, fireX, fireY, Math.cos(baseAngle + 0.08) * speed, Math.sin(baseAngle + 0.08) * speed, 'overdrive', damage);
    }

    // Drone projectiles - green energy orbs
    if (!drones || !drones.children || !drones.children.entries) return;
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

// Returns projectile speed/damage/type tuning derived from laser tier and piercing state.
function getLaserConfig(laserTier, hasPiercing) {
    const basePiercing = hasPiercing > 0 || laserTier >= 1;
    switch (laserTier) {
        case 1:
            return { type: 'piercing', piercing: true };
        case 2:
            return { type: 'wave', piercing: true };
        case 0:
        default:
            return { type: basePiercing ? 'piercing' : 'normal', piercing: basePiercing };
    }
}

// Returns side/rear coverage firing configuration derived from current coverage power-up tier.
function getCoverageConfig() {
    return { type: 'normal', piercing: false };
}

// Returns primary weapon shot-pattern offsets based on active laser/multi-shot tiers.
function getPrimaryShotPattern(laserTier, multiShotTier) {
    if (laserTier > 0) {
        return getShotPattern(0);
    }
    return getShotPattern(multiShotTier || 0);
}

// Returns directional offsets used for side/rear coverage firing patterns.
function getCoverageShotPattern() {
    return getShotPattern(0);
}

// Computes projectile spawn origin offset from player position along a firing angle.
function getFireOrigin(player, angle, distance = 25) {
    return {
        fireX: player.x + Math.cos(angle) * distance,
        fireY: player.y + Math.sin(angle) * distance
    };
}

// Returns missile shot pattern offsets for the specified missile tier.
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

// Spawns a full projectile pattern from one origin using shared projectile creation rules.
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

// Selects nearest valid hostile targets for cluster-missile retargeting.
function getClusterTargets(scene, originX, originY, count, excludeTarget = null) {
    const candidates = [];
    if (scene.enemies) candidates.push(...scene.enemies.children.entries);
    if (scene.garrisonDefenders) candidates.push(...scene.garrisonDefenders.children.entries);
    if (scene.bosses) candidates.push(...scene.bosses.children.entries);
    if (scene.battleships) candidates.push(...scene.battleships.children.entries);
    if (scene.assaultTargets) candidates.push(...scene.assaultTargets.children.entries);

    return candidates
        .filter(target => target.active && target !== excludeTarget)
        .map(target => ({
            target,
            dist: Phaser.Math.Distance.Between(originX, originY, target.x, target.y)
        }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, count)
        .map(entry => entry.target);
}

// Spawns secondary cluster missiles from a parent projectile toward nearby targets.
function spawnClusterMissiles(scene, projectile, excludeTarget = null) {
    if (!scene || !projectile) return;
    const clusterCount = 3;
    const originX = projectile.x;
    const originY = projectile.y;
    const damage = projectile.damage || 1;
    const baseVelocity = projectile.body ? projectile.body.velocity : { x: 1, y: 0 };
    const baseAngle = Phaser.Math.Angle.Between(0, 0, baseVelocity.x, baseVelocity.y);
    const clusterSpeed = 520;
    const targets = getClusterTargets(scene, originX, originY, clusterCount, excludeTarget);

    if (targets.length > 0) {
        targets.forEach(target => {
            const angle = Phaser.Math.Angle.Between(originX, originY, target.x, target.y);
            createProjectile(
                scene,
                originX,
                originY,
                Math.cos(angle) * clusterSpeed,
                Math.sin(angle) * clusterSpeed,
                'homing',
                damage,
                { homingTier: 2 }
            );
        });
        return;
    }

    [-0.2, 0, 0.2].forEach(offset => {
        const angle = baseAngle + offset;
        createProjectile(
            scene,
            originX,
            originY,
            Math.cos(angle) * clusterSpeed,
            Math.sin(angle) * clusterSpeed,
            'homing',
            damage,
            { homingTier: 2 }
        );
    });
}

// Creates and initializes a player projectile with type-specific behavior metadata.
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
    proj.travelDistance = 0;
    proj.lastX = x;
    proj.lastY = y;
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
    const initialSpeed = proj.body ? Math.hypot(proj.body.velocity.x, proj.body.velocity.y) : Math.hypot(vx, vy);
    proj.maxRange = initialSpeed * 3;
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

    return proj;
}

// Updates player/enemy projectile movement modifiers, wrapping, lifetimes, and special behaviors.
function updateProjectiles(scene) {
    const {
        projectiles,
        enemyProjectiles,
        enemies,
        garrisonDefenders,
        bosses,
        battleships,
        player,
        particleManager
    } = scene;
    if (!projectiles || !enemyProjectiles || !player) return;
    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    /**
     * Handles the destroyIfGrounded routine and encapsulates its core gameplay logic.
     * Parameters: proj.
     * Returns: value defined by the surrounding game flow.
     */
    const destroyIfGrounded = (proj) => {
        const terrainVariation = Math.sin(proj.x / 200) * 30;
        const groundY = groundLevel - terrainVariation - 15;
        if (proj.y >= groundY) {
            if (proj.projectileType === 'homing' && particleManager) {
                particleManager.bulletExplosion(proj.x, proj.y);
            }
            proj.destroy();
            return true;
        }
        return false;
    };

    projectiles.children.entries.forEach(proj => {
        wrapWorldBounds(proj);
        if (!proj.active || destroyIfGrounded(proj)) return;
        if (proj.maxRange) {
            if (typeof proj.lastX === 'number' && typeof proj.lastY === 'number') {
                const worldWidth = CONFIG.worldWidth;
                const deltaX = typeof wrappedDistance === 'function'
                    ? wrappedDistance(proj.lastX, proj.x, worldWidth)
                    : proj.x - proj.lastX;
                const deltaY = proj.y - proj.lastY;
                proj.travelDistance = (proj.travelDistance || 0) + Math.hypot(deltaX, deltaY);
            }
            proj.lastX = proj.x;
            proj.lastY = proj.y;
            if (proj.travelDistance > proj.maxRange) {
                if (!proj.isFadingOut) {
                    proj.isFadingOut = true;
                    proj.setVelocity(0, 0);
                    scene.tweens.add({
                        targets: proj,
                        alpha: 0,
                        duration: 150,
                        onComplete: () => {
                            if (proj && proj.active) proj.destroy();
                        }
                    });
                }
                return;
            }
        }
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
            if (bosses) candidates.push(...bosses.children.entries);
            if (battleships) candidates.push(...battleships.children.entries);
            if (scene.assaultTargets) candidates.push(...scene.assaultTargets.children.entries);
            const homingTier = proj.homingTier || 1;
            if (homingTier < 2) return;
            const maxRange = 360;
            const homingSpeed = 550;
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

if (typeof module !== 'undefined') {
    module.exports = {
        getClusterTargets,
        spawnClusterMissiles,
        updateProjectiles,
        fireWeapon
    };
}
