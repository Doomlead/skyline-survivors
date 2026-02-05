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

const SQUAD_AURA_CONFIG = {
    baseRadius: 70,
    ringSpacing: 18,
    angleDrift: 0.0008,
    followSnapDistance: 10,
    interceptWindow: 1.4,
    interceptRadiusScale: 0.35,
    bodyBlockLeadTime: 0.12,
    stateCalloutCooldown: 3200,
    bodyBlockTint: 0x38bdf8
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

function getOperativeFormationOffset(index, squadSize, time) {
    if (!squadSize) return { x: 0, y: 0 };
    const ringIndex = index % Math.max(1, Math.ceil(squadSize / 6));
    const radius = SQUAD_AURA_CONFIG.baseRadius + ringIndex * SQUAD_AURA_CONFIG.ringSpacing;
    const angleStep = (Math.PI * 2) / squadSize;
    const angle = angleStep * index + time * SQUAD_AURA_CONFIG.angleDrift;
    return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * (radius * 0.3)
    };
}

function getRebuildLandingZone(scene) {
    const { friendlies } = scene;
    if (!friendlies || !friendlies.children) return null;
    for (const friendly of friendlies.children.entries) {
        if (!friendly || !friendly.active || !friendly.isHangar) continue;
        if (friendly.landingZone && friendly.landingZone.active) {
            return friendly.landingZone;
        }
    }
    return null;
}

function isPilotInRebuildZone(scene, landingZone) {
    if (!landingZone || !pilotState.active || aegisState.active) return false;
    if (typeof isPlayerOnLandingZone === 'function') {
        return isPlayerOnLandingZone(scene, landingZone);
    }
    const dx = typeof wrappedDistance === 'function'
        ? wrappedDistance(landingZone.x, scene.pilot.x, CONFIG.worldWidth)
        : (scene.pilot.x - landingZone.x);
    const zoneCenterY = landingZone.y - landingZone.displayHeight * 0.5;
    const dy = scene.pilot.y - zoneCenterY;
    const xRange = landingZone.displayWidth * 0.35;
    const yRange = landingZone.displayHeight * 0.35;
    return Math.abs(dx) <= xRange && Math.abs(dy) <= yRange;
}

function findThreateningProjectile(scene, targetX, targetY, radius, maxTime) {
    const { enemyProjectiles } = scene;
    if (!enemyProjectiles || !enemyProjectiles.children) return null;
    let best = null;
    let bestDistance = Infinity;

    enemyProjectiles.children.entries.forEach((projectile) => {
        if (!projectile || !projectile.active || !projectile.body) return;
        const velocity = projectile.body.velocity;
        const speedSq = velocity.x * velocity.x + velocity.y * velocity.y;
        if (speedSq < 1) return;

        const toTargetX = targetX - projectile.x;
        const toTargetY = targetY - projectile.y;
        const timeToImpact = (toTargetX * velocity.x + toTargetY * velocity.y) / speedSq;
        if (timeToImpact <= 0 || timeToImpact > maxTime) return;

        const closestX = projectile.x + velocity.x * timeToImpact;
        const closestY = projectile.y + velocity.y * timeToImpact;
        const distance = Phaser.Math.Distance.Between(closestX, closestY, targetX, targetY);
        if (distance > radius) return;

        const originDistance = Phaser.Math.Distance.Between(projectile.x, projectile.y, targetX, targetY);
        if (originDistance < bestDistance) {
            bestDistance = originDistance;
            best = projectile;
        }
    });

    return best;
}

function applyOperativeDefenseVisual(operative, isDefending) {
    if (isDefending) {
        operative.setTint(SQUAD_AURA_CONFIG.bodyBlockTint);
    } else if (operative.tintTopLeft !== 0xffffff) {
        operative.clearTint();
    }
}

function setOperativeState(scene, operative, nextState, time) {
    if (operative.currentState === nextState) return;
    operative.currentState = nextState;
    const { audioManager } = scene;
    if (!audioManager) return;
    if (time < (scene.lastOperativeCallout || 0) + SQUAD_AURA_CONFIG.stateCalloutCooldown) return;
    const soundKey = nextState === 'BODY_BLOCK' ? 'cargoDrop' : 'powerUpCollect';
    audioManager.playSound(soundKey);
    scene.lastOperativeCallout = time;
}

function updateOperativeSquadFire(scene, operative, time, aimAngle) {
    const config = OPERATIVE_CLASS_CONFIG[operative.operativeType] || OPERATIVE_CLASS_CONFIG.infantry;
    if (!config.fireCooldown || config.fireCooldown <= 0) return;
    if (time <= operative.lastShot + config.fireCooldown) return;
    if (aimAngle === null || aimAngle === undefined) return;

    if (operative.operativeType === 'gunner') {
        const spread = 0.14;
        [-spread, 0, spread].forEach((offset) => {
            createProjectile(
                scene,
                operative.x,
                operative.y,
                Math.cos(aimAngle + offset) * config.projectileSpeed,
                Math.sin(aimAngle + offset) * config.projectileSpeed,
                config.projectileType,
                config.damage
            );
        });
    } else {
        const projectile = createProjectile(
            scene,
            operative.x,
            operative.y,
            Math.cos(aimAngle) * config.projectileSpeed,
            Math.sin(aimAngle) * config.projectileSpeed,
            config.projectileType,
            config.damage
        );
        if (operative.operativeType === 'saboteur' && projectile) {
            projectile.empDisableDuration = config.empDisableDuration;
        }
    }
    operative.lastShot = time;
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

function updateOperativeInfantry(scene, operative, time, timeSlowMultiplier) {
    const config = OPERATIVE_CLASS_CONFIG.infantry;
    const patrolAngle = (operative.patrolAngle || 0) + 0.02 * timeSlowMultiplier;
    operative.patrolAngle = patrolAngle;
    const sway = Math.sin(patrolAngle + operative.blinkOffset) * config.patrolRange;
    const targetX = operative.homeX + sway;
    operative.setVelocityX((targetX - operative.x) * 0.6 * timeSlowMultiplier);

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

function updateOperativeGunner(scene, operative, time, timeSlowMultiplier) {
    const config = OPERATIVE_CLASS_CONFIG.gunner;
    const { target, distance } = findNearestEnemy(scene, operative);
    const inRange = target && distance <= config.range;

    if (inRange) {
        operative.bracedUntil = Math.max(operative.bracedUntil || 0, time + config.braceDuration);
    }

    if (operative.bracedUntil && time < operative.bracedUntil) {
        operative.setVelocityX(0);
    } else {
        const patrolAngle = (operative.patrolAngle || 0) + 0.016 * timeSlowMultiplier;
        operative.patrolAngle = patrolAngle;
        const sway = Math.sin(patrolAngle + operative.blinkOffset) * config.patrolRange;
        const targetX = operative.homeX + sway;
        operative.setVelocityX((targetX - operative.x) * 0.5 * timeSlowMultiplier);
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

function updateOperativeMedic(scene, operative, time, timeSlowMultiplier) {
    const config = OPERATIVE_CLASS_CONFIG.medic;
    const player = getActivePlayer(scene);

    if (player) {
        const dx = typeof wrappedDistance === 'function'
            ? wrappedDistance(operative.x, player.x, CONFIG.worldWidth)
            : (player.x - operative.x);
        const absDx = Math.abs(dx);
        if (absDx > 80) {
            operative.setVelocityX(Math.sign(dx) * config.moveSpeed * timeSlowMultiplier);
        } else {
            operative.setVelocityX(0);
        }

        const distance = Phaser.Math.Distance.Between(operative.x, operative.y, player.x, player.y);
        if (distance <= config.supportRange && time > operative.lastSupport + config.supportCooldown) {
            spawnMedicPickup(scene, operative.x, operative.y - 8);
            createExplosion(scene, operative.x, operative.y - 6, 0x5eead4);
            operative.lastSupport = time;
        }
    } else {
        const patrolAngle = (operative.patrolAngle || 0) + 0.02 * timeSlowMultiplier;
        operative.patrolAngle = patrolAngle;
        const sway = Math.sin(patrolAngle + operative.blinkOffset) * config.patrolRange;
        const targetX = operative.homeX + sway;
        operative.setVelocityX((targetX - operative.x) * 0.5 * timeSlowMultiplier);
    }
}

function updateOperativeSaboteur(scene, operative, time, timeSlowMultiplier) {
    const config = OPERATIVE_CLASS_CONFIG.saboteur;
    const useAssaultTargets = gameState.mode === 'assault' && scene.assaultTargets;

    let targetData = useAssaultTargets
        ? findNearestAssaultTarget(scene, operative)
        : findNearestEnemy(scene, operative);

    const { target, distance } = targetData;

    if (target) {
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
    } else {
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
    const pilotOnFoot = pilotState.active && !aegisState.active;
    const landingZone = pilotOnFoot ? getRebuildLandingZone(scene) : null;
    const rebuildActive = pilotOnFoot
        && gameState.rebuildObjective?.active
        && gameState.rebuildObjective.stage === 'hangar_rebuild'
        && landingZone
        && isPilotInRebuildZone(scene, landingZone);
    const squadAimAngle = pilotOnFoot
        ? (pilotState.aimAngle !== undefined ? pilotState.aimAngle : (pilotState.facing < 0 ? Math.PI : 0))
        : null;
    const operatives = friendlies.children.entries.filter((friendly) => (
        friendly && friendly.body && friendly.active && friendly.isOperative
    ));

    operatives.forEach((friendly, index) => {
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

        if (pilotOnFoot) {
            const config = OPERATIVE_CLASS_CONFIG[friendly.operativeType] || OPERATIVE_CLASS_CONFIG.infantry;
            const formationOffset = getOperativeFormationOffset(index, operatives.length, time);
            const anchorX = rebuildActive ? landingZone.x : scene.pilot.x;
            const anchorY = rebuildActive ? landingZone.y : scene.pilot.y;
            let targetX = anchorX + formationOffset.x;
            let targetY = anchorY + formationOffset.y;

            let isBodyBlocking = false;
            if (rebuildActive && landingZone) {
                const radius = Math.max(landingZone.displayWidth, landingZone.displayHeight) * SQUAD_AURA_CONFIG.interceptRadiusScale;
                const threat = findThreateningProjectile(
                    scene,
                    anchorX,
                    anchorY - landingZone.displayHeight * 0.5,
                    radius,
                    SQUAD_AURA_CONFIG.interceptWindow
                );
                if (threat && threat.body) {
                    const velocity = threat.body.velocity;
                    targetX = threat.x + velocity.x * SQUAD_AURA_CONFIG.bodyBlockLeadTime;
                    targetY = threat.y + velocity.y * SQUAD_AURA_CONFIG.bodyBlockLeadTime;
                    isBodyBlocking = true;
                }
            }
            friendly.isBodyBlocking = isBodyBlocking;

            const dx = typeof wrappedDistance === 'function'
                ? wrappedDistance(friendly.x, targetX, CONFIG.worldWidth)
                : (targetX - friendly.x);
            if (Math.abs(dx) > SQUAD_AURA_CONFIG.followSnapDistance) {
                const speedBoost = isBodyBlocking ? 1.35 : 1.0;
                friendly.setVelocityX(Math.sign(dx) * config.moveSpeed * timeSlowMultiplier * speedBoost);
            } else {
                friendly.setVelocityX(0);
            }

            if (Math.abs(targetY - friendly.y) < 6 && friendly.body.velocity.y !== 0) {
                friendly.setVelocityY(0);
            }

            applyOperativeDefenseVisual(friendly, isBodyBlocking);
            setOperativeState(scene, friendly, isBodyBlocking ? 'BODY_BLOCK' : 'FOLLOW_LEADER', time);
            updateOperativeSquadFire(scene, friendly, time, squadAimAngle);
            if (friendly.operativeType === 'medic' && scene.pilot) {
                const distance = Phaser.Math.Distance.Between(friendly.x, friendly.y, scene.pilot.x, scene.pilot.y);
                if (distance <= config.supportRange && time > friendly.lastSupport + config.supportCooldown) {
                    spawnMedicPickup(scene, friendly.x, friendly.y - 8);
                    createExplosion(scene, friendly.x, friendly.y - 6, 0x5eead4);
                    friendly.lastSupport = time;
                }
            }
            return;
        }

        friendly.isBodyBlocking = false;
        applyOperativeDefenseVisual(friendly, false);
        setOperativeState(scene, friendly, 'PATROL', time);

        switch (friendly.operativeType) {
            case 'infantry':
                updateOperativeInfantry(scene, friendly, time, timeSlowMultiplier);
                break;
            case 'gunner':
                updateOperativeGunner(scene, friendly, time, timeSlowMultiplier);
                break;
            case 'medic':
                updateOperativeMedic(scene, friendly, time, timeSlowMultiplier);
                break;
            case 'saboteur':
                updateOperativeSaboteur(scene, friendly, time, timeSlowMultiplier);
                break;
        }
    });
}
