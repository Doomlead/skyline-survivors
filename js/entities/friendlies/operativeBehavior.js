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
