// ------------------------
// Garrison Defender AI Behaviors and Update Functions
// ------------------------

// Updates rifle defender patrol sway and standard firing cadence.
function updateGarrisonRifleBehavior(scene, defender, time, timeSlowMultiplier) {
    if (!defender.homeX) {
        defender.homeX = defender.x;
        defender.homeY = defender.y;
    }
    defender.patrolAngle += 0.02 * timeSlowMultiplier;
    const sway = Math.sin(defender.patrolAngle) * 40;
    const targetX = defender.homeX + sway;
    defender.setVelocityX((targetX - defender.x) * 0.6 * timeSlowMultiplier);

    if (time > defender.lastShot + 900) {
        garrisonShootAtPlayer(scene, defender);
        defender.lastShot = time;
    }
}

// Updates shield defender support movement, ally healing pulses, and suppressive fire.
function updateGarrisonShieldBehavior(scene, defender, time, timeSlowMultiplier) {
    const allies = scene.garrisonDefenders;
    if (!allies) return;

    let nearest = null;
    let nearestDist = Infinity;
    allies.children.entries.forEach(ally => {
        if (ally === defender || !ally.active) return;
        const dist = Phaser.Math.Distance.Between(defender.x, defender.y, ally.x, ally.y);
        if (dist < nearestDist) {
            nearestDist = dist;
            nearest = ally;
        }
    });

    if (nearest && nearestDist > 40) {
        const angle = Phaser.Math.Angle.Between(defender.x, defender.y, nearest.x, nearest.y);
        defender.setVelocity(Math.cos(angle) * 90 * timeSlowMultiplier, Math.sin(angle) * 60 * timeSlowMultiplier);
    } else {
        defender.setVelocity(Math.sin(time * 0.002) * 40 * timeSlowMultiplier, Math.cos(time * 0.002) * 30 * timeSlowMultiplier);
    }

    if (nearest && nearest.hp < nearest.maxHp && time > defender.lastSupport + 1600) {
        nearest.hp = Math.min(nearest.maxHp, nearest.hp + 1);
        defender.lastSupport = time;
        const pulse = scene.add.circle(nearest.x, nearest.y, 16, 0x38bdf8, 0.4);
        scene.tweens.add({
            targets: pulse,
            alpha: 0,
            scale: 1.6,
            duration: 500,
            onComplete: () => pulse.destroy()
        });
    }

    if (time > defender.lastShot + 1300) {
        garrisonShootAtPlayer(scene, defender);
        defender.lastShot = time;
    }
}

// Updates heavy defender spacing from player and fires tri-shot spreads on cooldown.
function updateGarrisonHeavyBehavior(scene, defender, time, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    if (!player) return;

    const angle = Phaser.Math.Angle.Between(defender.x, defender.y, player.x, player.y);
    const desiredDistance = 220;
    const distance = Phaser.Math.Distance.Between(defender.x, defender.y, player.x, player.y);
    const approach = distance > desiredDistance ? 1 : -0.4;

    defender.setVelocity(
        Math.cos(angle) * 70 * approach * timeSlowMultiplier,
        Math.sin(angle) * 60 * approach * timeSlowMultiplier
    );

    if (time > defender.lastShot + 1400) {
        const spread = 0.12;
        [-spread, 0, spread].forEach(offset => {
            garrisonShootAtPlayer(scene, defender, angle + offset);
        });
        defender.lastShot = time;
    }
}

// Updates sniper repositioning state and long-cooldown precision shots.
function updateGarrisonSniperBehavior(scene, defender, time, delta, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    if (!player) return;

    if (!defender.isPositioned) {
        defender.positionTimer += delta * timeSlowMultiplier;
        defender.setVelocity((Math.random() - 0.5) * 40 * timeSlowMultiplier, (Math.random() - 0.5) * 30 * timeSlowMultiplier);
        if (defender.positionTimer > 1500) {
            defender.isPositioned = true;
            defender.setVelocity(0, (Math.random() - 0.5) * 20 * timeSlowMultiplier);
        }
    } else {
        if (time > defender.lastShot + 2300) {
            const angle = Phaser.Math.Angle.Between(defender.x, defender.y, player.x, player.y);
            garrisonShootAtPlayer(scene, defender, angle, 'sniper');
            defender.lastShot = time;
        }
    }
}

// Updates medic target selection, ally healing behavior, and backup offense.
function updateGarrisonMedicBehavior(scene, defender, time, timeSlowMultiplier) {
    const allies = scene.garrisonDefenders;
    if (!allies) return;

    let target = null;
    let lowestHpRatio = 1;
    allies.children.entries.forEach(ally => {
        if (!ally.active || ally === defender) return;
        const ratio = ally.hp / ally.maxHp;
        if (ratio < lowestHpRatio) {
            lowestHpRatio = ratio;
            target = ally;
        }
    });

    if (target) {
        const angle = Phaser.Math.Angle.Between(defender.x, defender.y, target.x, target.y);
        defender.setVelocity(Math.cos(angle) * 80 * timeSlowMultiplier, Math.sin(angle) * 60 * timeSlowMultiplier);
        if (lowestHpRatio < 1 && time > defender.lastSupport + 1800) {
            target.hp = Math.min(target.maxHp, target.hp + 1);
            defender.lastSupport = time;
            const pulse = scene.add.circle(target.x, target.y, 14, 0x7dd3fc, 0.4);
            scene.tweens.add({
                targets: pulse,
                alpha: 0,
                scale: 1.4,
                duration: 450,
                onComplete: () => pulse.destroy()
            });
        }
    } else {
        defender.setVelocity(Math.sin(time * 0.002) * 40 * timeSlowMultiplier, Math.cos(time * 0.002) * 30 * timeSlowMultiplier);
    }

    if (time > defender.lastShot + 1600) {
        garrisonShootAtPlayer(scene, defender);
        defender.lastShot = time;
    }
}

// Updates engineer hover/wobble patrol and periodic fire support.
function updateGarrisonEngineerBehavior(scene, defender, time, timeSlowMultiplier) {
    if (!defender.homeX) {
        defender.homeX = defender.x;
        defender.homeY = defender.y;
    }

    const wobble = Math.sin(time * 0.003) * 50;
    defender.setVelocity((defender.homeX + wobble - defender.x) * 0.4 * timeSlowMultiplier, Math.cos(time * 0.002) * 30 * timeSlowMultiplier);

    if (time > defender.lastShot + 1400) {
        garrisonShootAtPlayer(scene, defender);
        defender.lastShot = time;
    }
}

// Updates jetpack defender aerial strafing and fast projectile attack timing.
function updateGarrisonJetpackBehavior(scene, defender, time, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    if (!player) return;

    if (!defender.swoopPhase) defender.swoopPhase = Math.random() * Math.PI * 2;
    defender.swoopPhase += 0.02 * timeSlowMultiplier;
    const angle = Phaser.Math.Angle.Between(defender.x, defender.y, player.x, player.y);
    const offset = Math.sin(defender.swoopPhase) * 0.6;
    const speed = 160 * timeSlowMultiplier;
    defender.setVelocity(Math.cos(angle + offset) * speed, Math.sin(angle + offset) * speed);

    if (time > defender.lastShot + 900) {
        garrisonShootAtPlayer(scene, defender, angle, 'jetpack');
        defender.lastShot = time;
    }
}

// Updates drone defender orbit/chase behavior and rapid-fire pressure.
function updateGarrisonDroneBehavior(scene, defender, time, timeSlowMultiplier) {
    if (!defender.orbitAngle) defender.orbitAngle = Math.random() * Math.PI * 2;
    if (!defender.homeX) {
        defender.homeX = defender.x;
        defender.homeY = defender.y;
    }
    defender.orbitAngle += 0.02 * timeSlowMultiplier;
    const radius = 60;
    defender.x = defender.homeX + Math.cos(defender.orbitAngle) * radius;
    defender.y = defender.homeY + Math.sin(defender.orbitAngle) * radius * 0.6;

    if (time > defender.lastShot + 1200) {
        garrisonShootAtPlayer(scene, defender);
        defender.lastShot = time;
    }
}

// Updates walker defender grounded advance behavior and heavy shot cadence.
function updateGarrisonWalkerBehavior(scene, defender, time, timeSlowMultiplier) {
    if (!defender.walkDirection) defender.walkDirection = Math.random() < 0.5 ? -1 : 1;
    defender.setVelocityX(70 * defender.walkDirection * timeSlowMultiplier);

    if (Math.random() < 0.01) {
        defender.walkDirection *= -1;
    }

    if (time > defender.lastShot + 1500) {
        garrisonShootAtPlayer(scene, defender);
        defender.lastShot = time;
    }
}

// Updates hound defender aggressive pursuit and close-range firing rhythm.
function updateGarrisonHoundBehavior(scene, defender, time, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    if (!player) return;

    const angle = Phaser.Math.Angle.Between(defender.x, defender.y, player.x, player.y);
    const speed = 220 * timeSlowMultiplier;
    const weave = Math.sin(time * 0.01) * 0.3;
    defender.setVelocity(Math.cos(angle + weave) * speed, Math.sin(angle + weave) * speed * 0.6);

    if (time > defender.lastShot + 1100) {
        garrisonShootAtPlayer(scene, defender, angle, 'hound');
        defender.lastShot = time;
    }
}

// Main per-frame update loop that dispatches behavior logic for each active garrison defender.
function updateGarrisonDefenders(scene, time, delta) {
    const { garrisonDefenders } = scene;
    if (!garrisonDefenders) return;

    const topLimit = 20;
    garrisonDefenders.children.entries.forEach(defender => {
        if (!defender || !defender.body || !defender.active) return;
        wrapWorldBounds(defender);

        const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
        const terrainVariation = Math.sin(defender.x / 200) * 30;
        const minClearance = 32;
        const defenderGroundY = groundLevel - terrainVariation - minClearance;

        if (defender.y > defenderGroundY) {
            defender.y = defenderGroundY;
            if (defender.body.velocity.y > 0) defender.setVelocityY(0);
        }
        if (defender.y < topLimit) {
            defender.y = topLimit;
            if (defender.body.velocity.y < 0) defender.setVelocityY(0);
        }

        const timeSlowMultiplier = playerState.powerUps.timeSlow > 0 ? 0.3 : 1.0;

        switch (defender.garrisonType) {
            case 'rifle':
                updateGarrisonRifleBehavior(scene, defender, time, timeSlowMultiplier);
                break;
            case 'shield':
                updateGarrisonShieldBehavior(scene, defender, time, timeSlowMultiplier);
                break;
            case 'heavy':
                updateGarrisonHeavyBehavior(scene, defender, time, timeSlowMultiplier);
                break;
            case 'sniper':
                updateGarrisonSniperBehavior(scene, defender, time, delta, timeSlowMultiplier);
                break;
            case 'medic':
                updateGarrisonMedicBehavior(scene, defender, time, timeSlowMultiplier);
                break;
            case 'engineer':
                updateGarrisonEngineerBehavior(scene, defender, time, timeSlowMultiplier);
                break;
            case 'jetpack':
                updateGarrisonJetpackBehavior(scene, defender, time, timeSlowMultiplier);
                break;
            case 'drone':
                updateGarrisonDroneBehavior(scene, defender, time, timeSlowMultiplier);
                break;
            case 'walker':
                updateGarrisonWalkerBehavior(scene, defender, time, timeSlowMultiplier);
                break;
            case 'hound':
                updateGarrisonHoundBehavior(scene, defender, time, timeSlowMultiplier);
                break;
        }
    });
}
