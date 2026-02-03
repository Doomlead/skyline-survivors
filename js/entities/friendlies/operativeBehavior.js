// ------------------------
// Operative AI Behaviors and Update Loop
// ------------------------

function findNearestHostile(scene, origin, maxRange = 380) {
    const candidates = [];
    if (scene.enemies) candidates.push(...scene.enemies.children.entries);
    if (scene.bosses) candidates.push(...scene.bosses.children.entries);
    if (scene.battleships) candidates.push(...scene.battleships.children.entries);

    let nearest = null;
    let nearestDist = Infinity;
    candidates.forEach(candidate => {
        if (!candidate || !candidate.active) return;
        const dist = Phaser.Math.Distance.Between(origin.x, origin.y, candidate.x, candidate.y);
        if (dist < nearestDist && dist < maxRange) {
            nearest = candidate;
            nearestDist = dist;
        }
    });

    return nearest;
}

function getSaboteurTarget(scene, operative) {
    const { assaultTargets } = scene;
    if (!assaultTargets) return null;
    let bestTarget = null;
    let bestPriority = 99;
    let bestDistance = Infinity;

    const priorityMap = { turret: 1, shield: 2, core: 3 };
    assaultTargets.children.entries.forEach(target => {
        if (!target.active) return;
        const priority = priorityMap[target.assaultRole] || 4;
        const distance = Phaser.Math.Distance.Between(target.x, target.y, operative.x, operative.y);
        if (priority < bestPriority || (priority === bestPriority && distance < bestDistance)) {
            bestTarget = target;
            bestPriority = priority;
            bestDistance = distance;
        }
    });

    return bestTarget;
}

function updateOperativeInfantry(scene, operative, time, timeSlowMultiplier) {
    const target = findNearestHostile(scene, operative, 360);
    if (target) {
        const angle = Phaser.Math.Angle.Between(operative.x, operative.y, target.x, target.y);
        operative.setVelocity(Math.cos(angle) * 90 * timeSlowMultiplier, 0);
        if (time > operative.lastShot + 650) {
            operativeShootAtTarget(scene, operative, target, angle);
            operative.lastShot = time;
        }
    } else {
        const sway = Math.sin(time * 0.002 + operative.homeX) * 50;
        const targetX = operative.homeX + sway;
        operative.setVelocityX((targetX - operative.x) * 0.6 * timeSlowMultiplier);
    }
}

function updateOperativeHeavy(scene, operative, time, timeSlowMultiplier) {
    const target = findNearestHostile(scene, operative, 420);
    if (!target) {
        operative.setVelocityX(Math.sin(time * 0.0015 + operative.homeX) * 45 * timeSlowMultiplier);
        return;
    }

    const angle = Phaser.Math.Angle.Between(operative.x, operative.y, target.x, target.y);
    const distance = Phaser.Math.Distance.Between(operative.x, operative.y, target.x, target.y);
    const desired = 220;

    if (distance > desired && !operative.braced) {
        operative.setVelocity(Math.cos(angle) * 70 * timeSlowMultiplier, 0);
    } else {
        operative.braced = true;
        operative.braceTimer += timeSlowMultiplier * 16;
        operative.setVelocity(0, 0);
        if (time > operative.lastShot + 1100) {
            const spread = 0.1;
            [-spread, 0, spread].forEach(offset => {
                operativeShootAtTarget(scene, operative, target, angle + offset);
            });
            operative.lastShot = time;
        }
        if (operative.braceTimer > 1600) {
            operative.braced = false;
            operative.braceTimer = 0;
        }
    }
}

function updateOperativeMedic(scene, operative, time, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    if (player) {
        const dist = Phaser.Math.Distance.Between(operative.x, operative.y, player.x, player.y);
        if (dist > 120) {
            const angle = Phaser.Math.Angle.Between(operative.x, operative.y, player.x, player.y);
            operative.setVelocity(Math.cos(angle) * 80 * timeSlowMultiplier, 0);
        } else {
            operative.setVelocity(0, 0);
        }
    }

    if (time > operative.lastSupport + 5200 && playerState.powerUps.shield <= 0) {
        spawnMedkitPowerUp(scene, operative.x, operative.y - 6);
        operative.lastSupport = time;
        const pulse = scene.add.circle(operative.x, operative.y - 6, 12, 0x7dd3fc, 0.35);
        scene.tweens.add({
            targets: pulse,
            alpha: 0,
            scale: 1.5,
            duration: 500,
            onComplete: () => pulse.destroy()
        });
    }
}

function applySaboteurEMP(scene, target) {
    const objective = gameState.assaultObjective;
    if (!objective || !objective.active || !target.active) return;

    if (target.assaultRole === 'core' && objective.shieldsRemaining > 0) return;

    target.hp -= 2;
    if (target.assaultRole === 'core') {
        objective.baseHp = Math.max(0, target.hp);
    }

    createExplosion(scene, target.x, target.y - 6, 0x22d3ee);

    if (target.hp <= 0) {
        if (target.assaultRole === 'shield') {
            objective.shieldsRemaining = Math.max(0, objective.shieldsRemaining - 1);
            createExplosion(scene, target.x, target.y, 0x22d3ee);
            target.destroy();
        } else if (target.assaultRole === 'turret') {
            createExplosion(scene, target.x, target.y, 0xf97316);
            target.destroy();
        } else {
            objective.active = false;
            objective.baseHp = 0;
            createExplosion(scene, target.x, target.y, 0xff6b35);
            target.destroy();
            scene.assaultBase = null;
            const baseReward = getMissionScaledReward(5000);
            gameState.score += baseReward;
            winGame(scene);
        }
    }
}

function updateOperativeSaboteur(scene, operative, time, timeSlowMultiplier) {
    const target = getSaboteurTarget(scene, operative);
    if (!target) {
        updateOperativeInfantry(scene, operative, time, timeSlowMultiplier);
        return;
    }

    const angle = Phaser.Math.Angle.Between(operative.x, operative.y, target.x, target.y);
    const distance = Phaser.Math.Distance.Between(operative.x, operative.y, target.x, target.y);
    if (distance > 90) {
        operative.setVelocity(Math.cos(angle) * 100 * timeSlowMultiplier, 0);
    } else {
        operative.setVelocity(0, 0);
        if (time > operative.lastSabotage + 1400) {
            applySaboteurEMP(scene, target);
            operative.lastSabotage = time;
        }
    }
}

function updateOperatives(scene, time, delta) {
    const { operatives } = scene;
    if (!operatives) return;

    const topLimit = 20;
    operatives.children.entries.forEach(operative => {
        if (!operative || !operative.body || !operative.active) return;
        wrapWorldBounds(operative);

        const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
        const terrainVariation = Math.sin(operative.x / 200) * 30;
        const minClearance = 28;
        const groundY = groundLevel - terrainVariation - minClearance;

        if (operative.y > groundY) {
            operative.y = groundY;
            if (operative.body.velocity.y > 0) operative.setVelocityY(0);
        }
        if (operative.y < topLimit) {
            operative.y = topLimit;
            if (operative.body.velocity.y < 0) operative.setVelocityY(0);
        }

        const timeSlowMultiplier = playerState.powerUps.timeSlow > 0 ? 0.3 : 1.0;

        switch (operative.operativeType) {
            case 'infantry':
                updateOperativeInfantry(scene, operative, time, timeSlowMultiplier);
                break;
            case 'heavy':
                updateOperativeHeavy(scene, operative, time, timeSlowMultiplier);
                break;
            case 'medic':
                updateOperativeMedic(scene, operative, time, timeSlowMultiplier);
                break;
            case 'saboteur':
                updateOperativeSaboteur(scene, operative, time, timeSlowMultiplier);
                break;
            default:
                updateOperativeInfantry(scene, operative, time, timeSlowMultiplier);
        }
    });
}
