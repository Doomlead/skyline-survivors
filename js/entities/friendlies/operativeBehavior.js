// ------------------------
// Operative Behavior - Friendly Comrades
// ------------------------

const OPERATIVE_CLASS_CONFIG = {
    infantry: {
        texture: 'operativeInfantry',
        scale: 1.25,
        fireCooldown: 650,
        range: 420,
        projectileSpeed: 440,
        projectileType: 'normal',
        damage: 1,
        patrolRange: 60,
        moveSpeed: 80,
        roamSpeed: 70,
        roamLeash: 140
    },
    gunner: {
        texture: 'operativeGunner',
        scale: 1.25,
        fireCooldown: 900,
        range: 500,
        projectileSpeed: 500,
        projectileType: 'piercing',
        damage: 2,
        patrolRange: 50,
        moveSpeed: 65,
        braceDuration: 700,
        roamSpeed: 60,
        roamLeash: 160
    },
    medic: {
        texture: 'operativeMedic',
        scale: 1.2,
        fireCooldown: 0,
        range: 0,
        projectileSpeed: 0,
        projectileType: 'normal',
        damage: 0,
        patrolRange: 70,
        moveSpeed: 70,
        supportCooldown: 5200,
        supportRange: 260,
        roamSpeed: 80,
        roamLeash: 120
    },
    saboteur: {
        texture: 'operativeSaboteur',
        scale: 1.2,
        fireCooldown: 1200,
        range: 360,
        projectileSpeed: 360,
        projectileType: 'piercing',
        damage: 2,
        patrolRange: 50,
        moveSpeed: 90,
        empDisableDuration: 3600,
        roamSpeed: 85,
        roamLeash: 140
    }
};

const OPERATIVE_RARITY_WEIGHTS = [
    { type: 'infantry', weight: 65 },
    { type: 'gunner', weight: 20 },
    { type: 'medic', weight: 10 },
    { type: 'saboteur', weight: 5 }
];

const OPERATIVE_FOLLOW_CONFIG = {
    radius: 62,
    verticalRatio: 0.4,
    spacingJitter: 0.15,
    moveSpeed: 110,
    sacrificeSpeed: 140,
    interceptLeadTime: 0.2,
    interceptHorizon: 1.4
};

function pickOperativeType() {
    const total = OPERATIVE_RARITY_WEIGHTS.reduce((sum, entry) => sum + entry.weight, 0);
    const roll = Math.random() * total;
    let accumulator = 0;
    for (const entry of OPERATIVE_RARITY_WEIGHTS) {
        accumulator += entry.weight;
        if (roll <= accumulator) return entry.type;
    }
    return 'infantry';
}

function spawnOperative(scene, type, x, y) {
    const { friendlies, audioManager } = scene;
    if (!friendlies) return null;
    const config = OPERATIVE_CLASS_CONFIG[type] || OPERATIVE_CLASS_CONFIG.infantry;

    const operative = friendlies.create(x, y, config.texture);
    operative.setDepth(FG_DEPTH_BASE + 2);
    operative.setScale(config.scale);
    operative.setImmovable(false);
    if (operative.body) {
        operative.body.setAllowGravity(true);
        operative.body.setGravityY(60);
        operative.body.setMaxVelocity(200, 160);
        operative.body.setVelocity(0, 0);
    }
    operative.isOperative = true;
    operative.operativeType = type;
    operative.lastShot = 0;
    operative.lastSupport = 0;
    operative.blinkOffset = Math.random() * Math.PI * 2;
    operative.homeX = x;
    operative.homeY = y;
    operative.bracedUntil = 0;
    if (scene) {
        scene.operativeSpawnIndex = (scene.operativeSpawnIndex || 0) + 1;
        operative.formationIndex = scene.operativeSpawnIndex;
    } else {
        operative.formationIndex = 0;
    }
    operative.currentState = 'PATROL';
    operative.isBodyBlocking = false;

    createSpawnEffect(scene, x, y, 'drone');
    if (audioManager) audioManager.playSound('enemySpawn');

    return operative;
}

function spawnMedicPickup(scene, x, y) {
    const { powerUps } = scene;
    if (!powerUps) return null;

    const pickup = powerUps.create(x, y, 'powerup_shield');
    pickup.setScale(1.1);
    pickup.setDepth(FG_DEPTH_BASE + 3);
    pickup.powerUpType = 'shield';
    pickup.birthTime = scene.time.now;

    scene.tweens.add({
        targets: pickup,
        y: y - 10,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    scene.time.delayedCall(8000, () => {
        if (pickup && pickup.active) pickup.destroy();
    });

    return pickup;
}

function findNearestEnemy(scene, origin) {
    const { enemies, bosses, battleships } = scene;
    const candidates = [];
    if (enemies) candidates.push(...enemies.children.entries);
    if (bosses) candidates.push(...bosses.children.entries);
    if (battleships) candidates.push(...battleships.children.entries);

    let nearest = null;
    let nearestDist = Infinity;
    candidates.forEach((target) => {
        if (!target || !target.active) return;
        const dx = typeof wrappedDistance === 'function'
            ? wrappedDistance(origin.x, target.x, CONFIG.worldWidth)
            : (target.x - origin.x);
        const dy = target.y - origin.y;
        const dist = Math.hypot(dx, dy);
        if (dist < nearestDist) {
            nearestDist = dist;
            nearest = target;
        }
    });

    return { target: nearest, distance: nearestDist };
}

function getOperativeSquadSize(scene) {
    if (!scene?.friendlies?.children?.entries) return 0;
    return scene.friendlies.children.entries.filter(entry => entry?.active && entry.isOperative).length;
}

function getFormationOffset(index, squadSize, time) {
    if (!squadSize || squadSize <= 0) return { x: 0, y: 0 };
    const slot = ((index || 0) % squadSize);
    const angleStep = (Math.PI * 2) / squadSize;
    const wobble = Math.sin(time * 0.002 + slot) * OPERATIVE_FOLLOW_CONFIG.spacingJitter;
    const angle = angleStep * slot + wobble;
    return {
        x: Math.cos(angle) * OPERATIVE_FOLLOW_CONFIG.radius,
        y: Math.sin(angle) * OPERATIVE_FOLLOW_CONFIG.radius * OPERATIVE_FOLLOW_CONFIG.verticalRatio
    };
}

function moveOperativeToTarget(operative, targetX, speed, timeSlowMultiplier) {
    const deltaX = typeof wrappedDistance === 'function'
        ? wrappedDistance(operative.x, targetX, CONFIG.worldWidth)
        : (targetX - operative.x);
    const absDx = Math.abs(deltaX);
    if (absDx < 4) {
        operative.setVelocityX(0);
        return;
    }
    operative.setVelocityX(Math.sign(deltaX) * speed * timeSlowMultiplier);
}

function getActiveRebuildZone(scene) {
    const { friendlies } = scene;
    if (!friendlies?.children?.entries) return null;
    for (const friendly of friendlies.children.entries) {
        if (friendly?.active && friendly.isHangar && friendly.landingZone?.active) {
            return friendly.landingZone;
        }
    }
    return null;
}

function isPlayerOnLandingZone(player, landingZone) {
    if (!player || !landingZone) return false;
    const dx = typeof wrappedDistance === 'function'
        ? wrappedDistance(landingZone.x, player.x, CONFIG.worldWidth)
        : (player.x - landingZone.x);
    const zoneCenterY = landingZone.y - landingZone.displayHeight * 0.5;
    const dy = player.y - zoneCenterY;
    const xRange = landingZone.displayWidth * 0.35;
    const yRange = landingZone.displayHeight * 0.35;
    return Math.abs(dx) <= xRange && Math.abs(dy) <= yRange;
}

function findThreateningProjectile(scene, player, landingZone) {
    const enemyProjectiles = scene?.enemyProjectiles;
    if (!enemyProjectiles?.children?.entries) return null;
    const targetX = landingZone ? landingZone.x : player.x;
    const targetY = landingZone ? landingZone.y - landingZone.displayHeight * 0.5 : player.y;
    const targetRadius = landingZone ? Math.max(landingZone.displayWidth, landingZone.displayHeight) * 0.35 : 38;
    let best = null;
    let bestDistance = Infinity;

    enemyProjectiles.children.entries.forEach((proj) => {
        if (!proj || !proj.active || !proj.body) return;
        const vx = proj.body.velocity.x || 0;
        const vy = proj.body.velocity.y || 0;
        const speedSq = vx * vx + vy * vy;
        if (speedSq < 1) return;
        const relX = proj.x - targetX;
        const relY = proj.y - targetY;
        const tClosest = -(relX * vx + relY * vy) / speedSq;
        if (tClosest < 0 || tClosest > OPERATIVE_FOLLOW_CONFIG.interceptHorizon) return;
        const closestX = relX + vx * tClosest;
        const closestY = relY + vy * tClosest;
        const closestDist = Math.hypot(closestX, closestY);
        if (closestDist > targetRadius) return;
        const distToPlayer = Phaser.Math.Distance.Between(proj.x, proj.y, targetX, targetY);
        if (distToPlayer < bestDistance) {
            bestDistance = distToPlayer;
            best = proj;
        }
    });

    return best;
}

function applyOperativeDefensiveVisual(scene, operative, time) {
    if (!operative) return;
    if (operative.isBodyBlocking) {
        if (!operative.defenseSprite) {
            operative.defenseSprite = scene.add.sprite(operative.x, operative.y, 'shieldEffect');
            operative.defenseSprite.setDepth(FG_DEPTH_BASE + 4);
            operative.defenseSprite.setScale(0.25);
            operative.defenseSprite.setAlpha(0.55);
        }
    }
    if (operative.defenseSprite) {
        if (!operative.isBodyBlocking || !operative.active) {
            operative.defenseSprite.destroy();
            operative.defenseSprite = null;
        } else {
            operative.defenseSprite.x = operative.x;
            operative.defenseSprite.y = operative.y - 6;
            const pulse = 0.4 + Math.sin(time * 0.008 + operative.blinkOffset) * 0.2;
            operative.defenseSprite.setAlpha(pulse);
        }
    }
}

function findNearestAssaultTarget(scene, origin) {
    const { assaultTargets } = scene;
    if (!assaultTargets) return { target: null, distance: Infinity };

    let nearest = null;
    let nearestDist = Infinity;
    assaultTargets.children.entries.forEach((target) => {
        if (!target || !target.active) return;
        if (target.assaultRole !== 'turret' && target.assaultRole !== 'shield') return;
        const dx = typeof wrappedDistance === 'function'
            ? wrappedDistance(origin.x, target.x, CONFIG.worldWidth)
            : (target.x - origin.x);
        const dy = target.y - origin.y;
        const dist = Math.hypot(dx, dy);
        if (dist < nearestDist) {
            nearestDist = dist;
            nearest = target;
        }
    });

    return { target: nearest, distance: nearestDist };
}

function updateOperativeInfantry(scene, operative, time, timeSlowMultiplier, movementOverride) {
    const config = OPERATIVE_CLASS_CONFIG.infantry;
    if (movementOverride) {
        moveOperativeToTarget(operative, movementOverride.targetX, movementOverride.speed, timeSlowMultiplier);
    } else {
        const patrolAngle = (operative.patrolAngle || 0) + 0.02 * timeSlowMultiplier;
        operative.patrolAngle = patrolAngle;
        const sway = Math.sin(patrolAngle + operative.blinkOffset) * config.patrolRange;
        const targetX = operative.homeX + sway;
        operative.setVelocityX((targetX - operative.x) * 0.6 * timeSlowMultiplier);
    }

    if (time > operative.lastShot + config.fireCooldown) {
        const { target, distance } = findNearestEnemy(scene, operative);
        if (target && distance <= config.range) {
            const angle = Phaser.Math.Angle.Between(operative.x, operative.y, target.x, target.y);
            createProjectile(
                scene,
                operative.x,
                operative.y,
                Math.cos(angle) * config.projectileSpeed,
                Math.sin(angle) * config.projectileSpeed,
                config.projectileType,
                config.damage
            );
            operative.lastShot = time;
        }
    }
}

function updateOperativeGunner(scene, operative, time, timeSlowMultiplier, movementOverride) {
    const config = OPERATIVE_CLASS_CONFIG.gunner;
    const { target, distance } = findNearestEnemy(scene, operative);
    const inRange = target && distance <= config.range;

    if (inRange && !movementOverride) {
        operative.bracedUntil = Math.max(operative.bracedUntil || 0, time + config.braceDuration);
    }

    if (movementOverride) {
        moveOperativeToTarget(operative, movementOverride.targetX, movementOverride.speed, timeSlowMultiplier);
    } else {
        if (operative.bracedUntil && time < operative.bracedUntil) {
            operative.setVelocityX(0);
        } else {
            const patrolAngle = (operative.patrolAngle || 0) + 0.016 * timeSlowMultiplier;
            operative.patrolAngle = patrolAngle;
            const sway = Math.sin(patrolAngle + operative.blinkOffset) * config.patrolRange;
            const targetX = operative.homeX + sway;
            operative.setVelocityX((targetX - operative.x) * 0.5 * timeSlowMultiplier);
        }
    }

    if (inRange && time > operative.lastShot + config.fireCooldown) {
        const angle = Phaser.Math.Angle.Between(operative.x, operative.y, target.x, target.y);
        const spread = 0.1;
        [-spread, 0, spread].forEach(offset => {
            createProjectile(
                scene,
                operative.x,
                operative.y,
                Math.cos(angle + offset) * config.projectileSpeed,
                Math.sin(angle + offset) * config.projectileSpeed,
                config.projectileType,
                config.damage
            );
        });
        operative.lastShot = time;
    }
}

function updateOperativeMedic(scene, operative, time, timeSlowMultiplier, movementOverride) {
    const config = OPERATIVE_CLASS_CONFIG.medic;
    const player = getActivePlayer(scene);

    if (player) {
        if (movementOverride) {
            moveOperativeToTarget(operative, movementOverride.targetX, movementOverride.speed, timeSlowMultiplier);
        } else {
            const dx = typeof wrappedDistance === 'function'
                ? wrappedDistance(operative.x, player.x, CONFIG.worldWidth)
                : (player.x - operative.x);
            const absDx = Math.abs(dx);
            if (absDx > 80) {
                operative.setVelocityX(Math.sign(dx) * config.moveSpeed * timeSlowMultiplier);
            } else {
                operative.setVelocityX(0);
            }
        }

        const distance = Phaser.Math.Distance.Between(operative.x, operative.y, player.x, player.y);
        if (distance <= config.supportRange && time > operative.lastSupport + config.supportCooldown) {
            spawnMedicPickup(scene, operative.x, operative.y - 8);
            createExplosion(scene, operative.x, operative.y - 6, 0x5eead4);
            operative.lastSupport = time;
        }
    } else if (!movementOverride) {
        const patrolAngle = (operative.patrolAngle || 0) + 0.02 * timeSlowMultiplier;
        operative.patrolAngle = patrolAngle;
        const sway = Math.sin(patrolAngle + operative.blinkOffset) * config.patrolRange;
        const targetX = operative.homeX + sway;
        operative.setVelocityX((targetX - operative.x) * 0.5 * timeSlowMultiplier);
    }
}

function updateOperativeSaboteur(scene, operative, time, timeSlowMultiplier, movementOverride) {
    const config = OPERATIVE_CLASS_CONFIG.saboteur;
    const useAssaultTargets = gameState.mode === 'assault' && scene.assaultTargets;

    let targetData = useAssaultTargets
        ? findNearestAssaultTarget(scene, operative)
        : findNearestEnemy(scene, operative);

    const { target, distance } = targetData;

    if (movementOverride) {
        moveOperativeToTarget(operative, movementOverride.targetX, movementOverride.speed, timeSlowMultiplier);
    } else if (target) {
        const dx = typeof wrappedDistance === 'function'
            ? wrappedDistance(operative.x, target.x, CONFIG.worldWidth)
            : (target.x - operative.x);
        const absDx = Math.abs(dx);
        if (absDx > 90) {
            operative.setVelocityX(Math.sign(dx) * config.moveSpeed * timeSlowMultiplier);
        } else {
            operative.setVelocityX(0);
        }

        if (distance <= config.range && time > operative.lastShot + config.fireCooldown) {
            const angle = Phaser.Math.Angle.Between(operative.x, operative.y, target.x, target.y);
            const projectile = createProjectile(
                scene,
                operative.x,
                operative.y,
                Math.cos(angle) * config.projectileSpeed,
                Math.sin(angle) * config.projectileSpeed,
                config.projectileType,
                config.damage
            );
            if (projectile) {
                projectile.empDisableDuration = config.empDisableDuration;
            }
            operative.lastShot = time;
        }
    } else if (!movementOverride) {
        const patrolAngle = (operative.patrolAngle || 0) + 0.02 * timeSlowMultiplier;
        operative.patrolAngle = patrolAngle;
        const sway = Math.sin(patrolAngle + operative.blinkOffset) * config.patrolRange;
        const targetX = operative.homeX + sway;
        operative.setVelocityX((targetX - operative.x) * 0.5 * timeSlowMultiplier);
    }
}

function updateOperativeHomeAnchor(scene, operative, timeSlowMultiplier, delta) {
    const config = OPERATIVE_CLASS_CONFIG[operative.operativeType] || OPERATIVE_CLASS_CONFIG.infantry;
    const player = getActivePlayer(scene);
    if (!player || !config.roamSpeed) return;

    const dx = typeof wrappedDistance === 'function'
        ? wrappedDistance(operative.homeX, player.x, CONFIG.worldWidth)
        : (player.x - operative.homeX);
    if (Math.abs(dx) <= (config.roamLeash || 0)) return;

    const step = Math.sign(dx) * config.roamSpeed * timeSlowMultiplier * (delta / 1000);
    if (typeof wrapValue === 'function') {
        operative.homeX = wrapValue(operative.homeX + step, CONFIG.worldWidth);
    } else {
        operative.homeX += step;
    }
}

function updateOperatives(scene, time, delta) {
    const { friendlies } = scene;
    if (!friendlies) return;

    const timeSlowMultiplier = playerState.powerUps.timeSlow > 0 ? 0.3 : 1.0;
    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    const topLimit = 20;

    const player = getActivePlayer(scene);
    const isPilotActive = pilotState.active && aegisState.destroyed && player === scene.pilot;
    const rebuildObjective = gameState.rebuildObjective;
    const isRebuildActive = isPilotActive && rebuildObjective?.active && rebuildObjective.stage === 'hangar_rebuild';
    const landingZone = isRebuildActive ? getActiveRebuildZone(scene) : null;
    const isPilotOnPad = isRebuildActive && player && landingZone && isPlayerOnLandingZone(player, landingZone);
    const squadSize = getOperativeSquadSize(scene);

    friendlies.children.entries.forEach((friendly) => {
        if (!friendly || !friendly.body || !friendly.active || !friendly.isOperative) return;

        wrapWorldBounds(friendly);
        updateOperativeHomeAnchor(scene, friendly, timeSlowMultiplier, delta);

        const terrainVariation = Math.sin(friendly.x / 200) * 30;
        const minClearance = 28;
        const operativeGroundY = groundLevel - terrainVariation - minClearance;

        if (friendly.y > operativeGroundY) {
            friendly.y = operativeGroundY;
            if (friendly.body.velocity.y > 0) friendly.setVelocityY(0);
        }
        if (friendly.y < topLimit) {
            friendly.y = topLimit;
            if (friendly.body.velocity.y < 0) friendly.setVelocityY(0);
        }

        let movementOverride = null;
        friendly.isBodyBlocking = false;

        if (isPilotActive && player) {
            if (isPilotOnPad) {
                const threat = findThreateningProjectile(scene, player, landingZone);
                if (threat) {
                    const dirX = player.x - threat.x;
                    const dirY = player.y - threat.y;
                    const distance = Math.max(1, Math.hypot(dirX, dirY));
                    const interceptRatio = Math.min(0.5, Math.max(0.25, distance / 500));
                    const targetX = threat.x + dirX * interceptRatio + threat.body.velocity.x * OPERATIVE_FOLLOW_CONFIG.interceptLeadTime;
                    movementOverride = {
                        targetX,
                        speed: OPERATIVE_FOLLOW_CONFIG.sacrificeSpeed
                    };
                    friendly.currentState = 'SACRIFICE';
                    friendly.isBodyBlocking = true;
                } else {
                    const offset = getFormationOffset(friendly.formationIndex || 0, squadSize, time);
                    movementOverride = {
                        targetX: wrapValue(player.x + offset.x, CONFIG.worldWidth),
                        speed: OPERATIVE_FOLLOW_CONFIG.moveSpeed
                    };
                    friendly.currentState = 'DEFEND_REBUILD';
                }
            } else {
                const offset = getFormationOffset(friendly.formationIndex || 0, squadSize, time);
                movementOverride = {
                    targetX: wrapValue(player.x + offset.x, CONFIG.worldWidth),
                    speed: OPERATIVE_FOLLOW_CONFIG.moveSpeed
                };
                friendly.currentState = 'FOLLOW_LEADER';
            }
        } else {
            friendly.currentState = 'PATROL';
        }

        if (scene?.audioManager && friendly === friendlies.children.entries[0]) {
            if (scene.operativeRadioState !== friendly.currentState) {
                const now = time || 0;
                if (!scene.operativeRadioCooldown || now > scene.operativeRadioCooldown) {
                    if (friendly.currentState === 'FOLLOW_LEADER') {
                        scene.audioManager.playSound('squadDeployed');
                        scene.operativeRadioCooldown = now + 2000;
                    } else if (friendly.currentState === 'SACRIFICE') {
                        scene.audioManager.playSound('squadSacrifice');
                        scene.operativeRadioCooldown = now + 2000;
                    }
                }
                scene.operativeRadioState = friendly.currentState;
            }
        }

        switch (friendly.operativeType) {
            case 'infantry':
                updateOperativeInfantry(scene, friendly, time, timeSlowMultiplier, movementOverride);
                break;
            case 'gunner':
                updateOperativeGunner(scene, friendly, time, timeSlowMultiplier, movementOverride);
                break;
            case 'medic':
                updateOperativeMedic(scene, friendly, time, timeSlowMultiplier, movementOverride);
                break;
            case 'saboteur':
                updateOperativeSaboteur(scene, friendly, time, timeSlowMultiplier, movementOverride);
                break;
        }

        applyOperativeDefensiveVisual(scene, friendly, time);
    });
}
