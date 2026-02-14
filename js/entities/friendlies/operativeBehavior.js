// ------------------------
// Operative Behavior - Friendly Comrades
// ------------------------

const OPERATIVE_CLASS_CONFIG = {
    infantry: {
        texture: 'operativeInfantry',
        scale: 1.25,
        baseHealth: 2,
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
        baseHealth: 2,
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
        baseHealth: 2,
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
        baseHealth: 2,
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
    auraRadius: 160,
    auraFireRateMultiplier: 0.7,
    interceptHorizon: 2.0,
    interceptRadiusScale: 0.35,
    bodyBlockLeadTime: 0.25,
    sacrificeSpeed: 180,
    stateCalloutCooldown: 3200,
    bodyBlockTint: 0x38bdf8
};

const COMRADE_BUFF_CONFIG = {
    damagePerLevel: 0.25,
    fireRateReductionPerLevel: 0.05,
    healthPerLevel: 1,
    minFireRateMultiplier: 0.6
};

function pickOperativeType() { // Pick operative type.
    const total = OPERATIVE_RARITY_WEIGHTS.reduce((sum, entry) => sum + entry.weight, 0);
    const roll = Math.random() * total;
    let accumulator = 0;
    for (const entry of OPERATIVE_RARITY_WEIGHTS) {
        accumulator += entry.weight;
        if (roll <= accumulator) return entry.type;
    }
    return 'infantry';
}

function spawnOperative(scene, type, x, y) { // Spawn operative.
    const { friendlies, audioManager } = scene;
    if (!friendlies) return null;
    const config = OPERATIVE_CLASS_CONFIG[type] || OPERATIVE_CLASS_CONFIG.infantry;
    const buffs = getComradeBuffs();

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
    operative.baseHealth = config.baseHealth || 2;
    operative.maxHealth = operative.baseHealth + buffs.healthBonus;
    operative.health = operative.maxHealth;
    operative.stunnedUntil = 0;

    createSpawnEffect(scene, x, y, 'drone');
    if (audioManager) audioManager.playSound('enemySpawn');

    return operative;
}

function spawnMedicPickup(scene, x, y) { // Spawn medic pickup.
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

function getOperativeFormationOffset(index, squadSize, time) { // Get operative formation offset.
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

function getAuraMultiplier(operative, player, auraActive) { // Get aura multiplier.
    if (!auraActive || !player) return 1.0;
    const dx = typeof wrappedDistance === 'function'
        ? wrappedDistance(operative.x, player.x, CONFIG.worldWidth)
        : (player.x - operative.x);
    if (Math.abs(dx) <= SQUAD_AURA_CONFIG.auraRadius) {
        return SQUAD_AURA_CONFIG.auraFireRateMultiplier;
    }
    return 1.0;
}

function getComradeBuffs() { // Get comrade buffs.
    const level = Math.max(0, playerState.comradeBuffs?.level || 0);
    const fireRateMultiplier = Math.max(
        COMRADE_BUFF_CONFIG.minFireRateMultiplier,
        1 - level * COMRADE_BUFF_CONFIG.fireRateReductionPerLevel
    );
    return {
        level,
        damageBonus: level * COMRADE_BUFF_CONFIG.damagePerLevel,
        fireRateMultiplier,
        healthBonus: level * COMRADE_BUFF_CONFIG.healthPerLevel
    };
}

function getTargetDistance(origin, target) { // Get target distance.
    if (!origin || !target) return Infinity;
    const dx = typeof wrappedDistance === 'function'
        ? wrappedDistance(origin.x, target.x, CONFIG.worldWidth)
        : (target.x - origin.x);
    const dy = target.y - origin.y;
    return Math.hypot(dx, dy);
}

function findSquadTarget(scene, operative, player) { // Find squad target.
    if (!player) return findNearestEnemy(scene, operative).target;
    const { target: nearestToPlayer, distance } = findNearestEnemy(scene, player);
    if (nearestToPlayer && distance < 200) {
        return nearestToPlayer;
    }
    return findNearestEnemy(scene, operative).target;
}

function getRebuildLandingZone(scene) { // Get rebuild landing zone.
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

function isPilotInRebuildZone(scene, landingZone) { // Is pilot in rebuild zone.
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

function findThreateningProjectile(scene, targetX, targetY, radius, maxTime) { // Find threatening projectile.
    const { enemyProjectiles } = scene;
    if (!enemyProjectiles || !enemyProjectiles.children) return null;
    let best = null;
    let bestTime = Infinity;

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

        if (timeToImpact < bestTime) {
            bestTime = timeToImpact;
            best = projectile;
        }
    });

    return best;
}

function applyOperativeDefenseVisual(operative, isDefending) { // Apply operative defense visual.
    if (isDefending) {
        operative.setTint(SQUAD_AURA_CONFIG.bodyBlockTint);
    } else if (operative.tintTopLeft !== 0xffffff) {
        operative.clearTint();
    }
}

function setOperativeState(scene, operative, nextState, time) { // Set operative state.
    if (operative.currentState === nextState) return;
    operative.currentState = nextState;
    const { audioManager } = scene;
    if (!audioManager) return;
    if (time < (scene.lastOperativeCallout || 0) + SQUAD_AURA_CONFIG.stateCalloutCooldown) return;
    const soundKey = nextState === 'SACRIFICE' ? 'cargoDrop' : 'powerUpCollect';
    audioManager.playSound(soundKey);
    scene.lastOperativeCallout = time;
}

function findNearestEnemy(scene, origin) { // Find nearest enemy.
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

function findNearestAssaultTarget(scene, origin) { // Find nearest assault target.
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

function updateOperativeInfantry(scene, operative, time, timeSlowMultiplier, player, auraActive) { // Update operative infantry.
    const config = OPERATIVE_CLASS_CONFIG.infantry;
    const buffs = getComradeBuffs();
    const patrolAngle = (operative.patrolAngle || 0) + 0.02 * timeSlowMultiplier;
    operative.patrolAngle = patrolAngle;
    const sway = Math.sin(patrolAngle + operative.blinkOffset) * config.patrolRange;
    const targetX = operative.homeX + sway;
    operative.setVelocityX((targetX - operative.x) * 0.6 * timeSlowMultiplier);

    const auraMultiplier = getAuraMultiplier(operative, player, auraActive);
    const fireCooldown = config.fireCooldown * auraMultiplier * buffs.fireRateMultiplier;
    if (time > operative.lastShot + fireCooldown) {
        const target = findSquadTarget(scene, operative, player);
        const distance = getTargetDistance(operative, target);
        if (target && distance <= config.range) {
            const angle = Phaser.Math.Angle.Between(operative.x, operative.y, target.x, target.y);
            createProjectile(
                scene,
                operative.x,
                operative.y,
                Math.cos(angle) * config.projectileSpeed,
                Math.sin(angle) * config.projectileSpeed,
                config.projectileType,
                config.damage + buffs.damageBonus
            );
            operative.lastShot = time;
        }
    }
}

function updateOperativeGunner(scene, operative, time, timeSlowMultiplier, player, auraActive) { // Update operative gunner.
    const config = OPERATIVE_CLASS_CONFIG.gunner;
    const buffs = getComradeBuffs();
    const target = findSquadTarget(scene, operative, player);
    const distance = getTargetDistance(operative, target);
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

    const auraMultiplier = getAuraMultiplier(operative, player, auraActive);
    const fireCooldown = config.fireCooldown * auraMultiplier * buffs.fireRateMultiplier;
    if (inRange && time > operative.lastShot + fireCooldown) {
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
                config.damage + buffs.damageBonus
            );
        });
        operative.lastShot = time;
    }
}

function updateOperativeMedic(scene, operative, time, timeSlowMultiplier) { // Update operative medic.
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

function updateOperativeSaboteur(scene, operative, time, timeSlowMultiplier, player, auraActive) { // Update operative saboteur.
    const config = OPERATIVE_CLASS_CONFIG.saboteur;
    const buffs = getComradeBuffs();
    const useAssaultTargets = gameState.mode === 'assault' && scene.assaultTargets;

    let target = null;
    let distance = Infinity;

    if (useAssaultTargets) {
        const targetData = findNearestAssaultTarget(scene, operative);
        target = targetData.target;
        distance = targetData.distance;
    } else {
        target = findSquadTarget(scene, operative, player);
        distance = getTargetDistance(operative, target);
    }

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

        const auraMultiplier = getAuraMultiplier(operative, player, auraActive);
        const fireCooldown = config.fireCooldown * auraMultiplier * buffs.fireRateMultiplier;
        if (distance <= config.range && time > operative.lastShot + fireCooldown) {
            const angle = Phaser.Math.Angle.Between(operative.x, operative.y, target.x, target.y);
            const projectile = createProjectile(
                scene,
                operative.x,
                operative.y,
                Math.cos(angle) * config.projectileSpeed,
                Math.sin(angle) * config.projectileSpeed,
                config.projectileType,
                config.damage + buffs.damageBonus
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

function handleOperativeFire(scene, operative, time, player, auraActive) { // Handle operative fire.
    const config = OPERATIVE_CLASS_CONFIG[operative.operativeType] || OPERATIVE_CLASS_CONFIG.infantry;
    const buffs = getComradeBuffs();
    const auraMultiplier = getAuraMultiplier(operative, player, auraActive);
    const fireCooldown = config.fireCooldown * auraMultiplier * buffs.fireRateMultiplier;

    if (operative.operativeType === 'infantry') {
        if (time > operative.lastShot + fireCooldown) {
            const target = findSquadTarget(scene, operative, player);
            const distance = getTargetDistance(operative, target);
            if (target && distance <= config.range) {
                const angle = Phaser.Math.Angle.Between(operative.x, operative.y, target.x, target.y);
                createProjectile(
                    scene,
                    operative.x,
                    operative.y,
                    Math.cos(angle) * config.projectileSpeed,
                    Math.sin(angle) * config.projectileSpeed,
                    config.projectileType,
                    config.damage + buffs.damageBonus
                );
                operative.lastShot = time;
            }
        }
        return;
    }

    if (operative.operativeType === 'gunner') {
        const target = findSquadTarget(scene, operative, player);
        const distance = getTargetDistance(operative, target);
        const inRange = target && distance <= config.range;
        if (inRange) {
            operative.bracedUntil = Math.max(operative.bracedUntil || 0, time + config.braceDuration);
        }
        if (inRange && time > operative.lastShot + fireCooldown) {
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
                    config.damage + buffs.damageBonus
                );
            });
            operative.lastShot = time;
        }
        return;
    }

    if (operative.operativeType === 'saboteur') {
        const useAssaultTargets = gameState.mode === 'assault' && scene.assaultTargets;
        let target = null;
        let distance = Infinity;

        if (useAssaultTargets) {
            const targetData = findNearestAssaultTarget(scene, operative);
            target = targetData.target;
            distance = targetData.distance;
        } else {
            target = findSquadTarget(scene, operative, player);
            distance = getTargetDistance(operative, target);
        }

        if (target && distance <= config.range && time > operative.lastShot + fireCooldown) {
            const angle = Phaser.Math.Angle.Between(operative.x, operative.y, target.x, target.y);
            const projectile = createProjectile(
                scene,
                operative.x,
                operative.y,
                Math.cos(angle) * config.projectileSpeed,
                Math.sin(angle) * config.projectileSpeed,
                config.projectileType,
                config.damage + buffs.damageBonus
            );
            if (projectile) {
                projectile.empDisableDuration = config.empDisableDuration;
            }
            operative.lastShot = time;
        }
    }
}

function updateOperativeHomeAnchor(scene, operative, timeSlowMultiplier, delta) { // Update operative home anchor.
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

function updateOperatives(scene, time, delta) { // Update operatives.
    const { friendlies } = scene;
    if (!friendlies) return;

    const timeSlowMultiplier = playerState.powerUps.timeSlow > 0 ? 0.3 : 1.0;
    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    const topLimit = 20;
    const player = getActivePlayer(scene);
    const pilotOnFoot = pilotState.active && !aegisState.active;
    const auraActive = pilotOnFoot;
    const landingZone = pilotOnFoot ? getRebuildLandingZone(scene) : null;
    const rebuildActive = pilotOnFoot
        && gameState.rebuildObjective?.active
        && gameState.rebuildObjective.stage === 'hangar_rebuild'
        && landingZone
        && isPilotInRebuildZone(scene, landingZone);
    const operatives = friendlies.children.entries.filter((friendly) => (
        friendly && friendly.body && friendly.active && friendly.isOperative
    ));

    operatives.forEach((friendly, index) => {
        if (!friendly || !friendly.body || !friendly.active || !friendly.isOperative) return;

        if (time < (friendly.stunnedUntil || 0)) {
            friendly.setVelocityX(friendly.body.velocity.x * 0.95);
            friendly.body.setAllowGravity(true);
            return;
        }

        wrapWorldBounds(friendly);
        updateOperativeHomeAnchor(scene, friendly, timeSlowMultiplier, delta);

        const terrainVariation = Math.sin(friendly.x / 200) * 30;
        const minClearance = 28;
        const operativeGroundY = groundLevel - terrainVariation - minClearance;

        if (!friendly.isBodyBlocking && friendly.y > operativeGroundY) {
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
                    SQUAD_AURA_CONFIG.interceptHorizon
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
                const moveSpeed = isBodyBlocking ? SQUAD_AURA_CONFIG.sacrificeSpeed : config.moveSpeed;
                friendly.setVelocityX(Math.sign(dx) * moveSpeed * timeSlowMultiplier);
            } else {
                friendly.setVelocityX(0);
            }

            if (isBodyBlocking) {
                friendly.body.setAllowGravity(false);
                const dy = targetY - friendly.y;
                friendly.setVelocityY(dy * 8);
            } else {
                friendly.body.setAllowGravity(true);
                if (Math.abs(targetY - friendly.y) < 6 && friendly.body.velocity.y !== 0) {
                    friendly.setVelocityY(0);
                }
            }

            applyOperativeDefenseVisual(friendly, isBodyBlocking);
            setOperativeState(scene, friendly, isBodyBlocking ? 'SACRIFICE' : 'FOLLOW_LEADER', time);
            handleOperativeFire(scene, friendly, time, player, auraActive);
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
        friendly.body.setAllowGravity(true);
        applyOperativeDefenseVisual(friendly, false);
        setOperativeState(scene, friendly, 'PATROL', time);

        switch (friendly.operativeType) {
            case 'infantry':
                updateOperativeInfantry(scene, friendly, time, timeSlowMultiplier, player, auraActive);
                break;
            case 'gunner':
                updateOperativeGunner(scene, friendly, time, timeSlowMultiplier, player, auraActive);
                break;
            case 'medic':
                updateOperativeMedic(scene, friendly, time, timeSlowMultiplier);
                break;
            case 'saboteur':
                updateOperativeSaboteur(scene, friendly, time, timeSlowMultiplier, player, auraActive);
                break;
        }
    });
}
