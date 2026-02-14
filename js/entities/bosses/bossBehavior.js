// ------------------------
// File: js/entities/bosses/bossBehavior.js
// ------------------------

// ===== UNIFIED ATTACK PATTERN SYSTEM =====
// This replaces both fireBossBulletPattern and per-behavior shooting.
// Each boss has a pattern sequence it cycles through. This is the ONLY
// place boss projectiles are created (except bomb drops which are special).

function initBossAttackState(boss) { // Init boss attack state.
    boss.attackState = {
        sequenceIndex: 0,
        nextAttackTime: 0,
        spiralAngle: 0,
        burstCount: 0,
        burstMax: 0,
        burstTimer: 0,
        inBurst: false,
    };
}

function getCurrentAttackSequence(boss) { // Get current attack sequence.
    const pattern = getBossAttackPattern(boss.bossType);
    if (!pattern) return null;
    const phase = boss.corePhase || 0;
    const phaseData = pattern.phases[Math.min(phase, pattern.phases.length - 1)];
    return phaseData?.sequence || null;
}

function fireAttackMove(scene, boss, move, pattern, timeSlowMultiplier) { // Fire attack move.
    const { enemyProjectiles, audioManager } = scene;
    if (!enemyProjectiles) return;

    const player = getActivePlayer(scene);
    const adjustedSpeed = move.speed * timeSlowMultiplier;
    const projectileType = pattern.projectileType;
    const damage = pattern.damage;

    switch (move.type) {
        case 'radial': {
            const angleOffset = move.angleOffset || 0;
            for (let i = 0; i < move.count; i++) {
                const angle = (i / move.count) * Math.PI * 2 + angleOffset;
                const proj = enemyProjectiles.create(boss.x, boss.y, projectileType);
                proj.setDepth(FG_DEPTH_BASE + 4);
                proj.setScale(1.3);
                proj.setVelocity(Math.cos(angle) * adjustedSpeed, Math.sin(angle) * adjustedSpeed);
                proj.rotation = angle;
                proj.damage = damage;
                proj.enemyType = boss.bossType;
                scene.time.delayedCall(4000, () => { if (proj?.active) proj.destroy(); });
            }
            break;
        }
        case 'aimed': {
            if (!player) return;
            const baseAngle = Phaser.Math.Angle.Between(boss.x, boss.y, player.x, player.y);
            const spread = move.spread || 0;
            for (let i = 0; i < move.count; i++) {
                const offset = move.count === 1 ? 0 : (spread * (i / (move.count - 1))) - (spread / 2);
                const angle = baseAngle + offset;
                const proj = enemyProjectiles.create(boss.x, boss.y, projectileType);
                proj.setDepth(FG_DEPTH_BASE + 4);
                proj.setScale(1.3);
                proj.setVelocity(Math.cos(angle) * adjustedSpeed, Math.sin(angle) * adjustedSpeed);
                proj.rotation = angle;
                proj.damage = damage;
                proj.enemyType = boss.bossType;
                scene.time.delayedCall(4000, () => { if (proj?.active) proj.destroy(); });
            }
            break;
        }
        case 'spread': {
            if (!player) return;
            const baseAngle2 = Phaser.Math.Angle.Between(boss.x, boss.y, player.x, player.y);
            const totalSpread = move.spread || 0.5;
            for (let i = 0; i < move.count; i++) {
                const offset = move.count === 1 ? 0 : (totalSpread * (i / (move.count - 1))) - (totalSpread / 2);
                const angle = baseAngle2 + offset;
                const proj = enemyProjectiles.create(boss.x, boss.y, projectileType);
                proj.setDepth(FG_DEPTH_BASE + 4);
                proj.setScale(1.3);
                proj.setVelocity(Math.cos(angle) * adjustedSpeed, Math.sin(angle) * adjustedSpeed);
                proj.rotation = angle;
                proj.damage = damage;
                proj.enemyType = boss.bossType;
                scene.time.delayedCall(4000, () => { if (proj?.active) proj.destroy(); });
            }
            break;
        }
        case 'spiral': {
            if (!boss.attackState) boss.attackState = {};
            boss.attackState.spiralAngle = (boss.attackState.spiralAngle || 0) + 0.3;
            for (let i = 0; i < move.count; i++) {
                const angle = boss.attackState.spiralAngle + (i / move.count) * Math.PI * 2;
                const proj = enemyProjectiles.create(boss.x, boss.y, projectileType);
                proj.setDepth(FG_DEPTH_BASE + 4);
                proj.setScale(1.3);
                proj.setVelocity(Math.cos(angle) * adjustedSpeed, Math.sin(angle) * adjustedSpeed);
                proj.rotation = angle;
                proj.damage = damage;
                proj.enemyType = boss.bossType;
                scene.time.delayedCall(4000, () => { if (proj?.active) proj.destroy(); });
            }
            break;
        }
        case 'burst': {
            // Fire count projectiles in rapid succession toward player
            if (!player) return;
            for (let i = 0; i < move.count; i++) {
                scene.time.delayedCall(i * 120, () => {
                    if (!boss?.active || !player?.active) return;
                    const angle = Phaser.Math.Angle.Between(boss.x, boss.y, player.x, player.y);
                    const jitter = (Math.random() - 0.5) * 0.15;
                    const proj = enemyProjectiles.create(boss.x, boss.y, projectileType);
                    proj.setDepth(FG_DEPTH_BASE + 4);
                    proj.setScale(1.2);
                    proj.setVelocity(Math.cos(angle + jitter) * adjustedSpeed, Math.sin(angle + jitter) * adjustedSpeed);
                    proj.rotation = angle + jitter;
                    proj.damage = damage;
                    proj.enemyType = boss.bossType;
                    scene.time.delayedCall(4000, () => { if (proj?.active) proj.destroy(); });
                });
            }
            break;
        }
        case 'bombDrop': {
            for (let i = 0; i < move.count; i++) {
                const bayX = boss.x + (i - Math.floor(move.count / 2)) * 30;
                const mine = enemyProjectiles.create(bayX, boss.y + 20, 'mine');
                mine.setDepth(FG_DEPTH_BASE + 4);
                mine.setScale(1.5);
                mine.setVelocityY(adjustedSpeed);
                mine.isMine = true;
                mine.damage = damage;
                mine.enemyType = boss.bossType;
                scene.tweens.add({
                    targets: mine,
                    rotation: Math.PI * 2,
                    duration: 1000,
                    repeat: -1
                });
                scene.time.delayedCall(5000, () => { if (mine?.active) mine.destroy(); });
            }
            break;
        }
    }

    if (audioManager) audioManager.playSound('enemyShoot');
}

function updateBossAttackPattern(scene, boss, time, timeSlowMultiplier) { // Update boss attack pattern.
    if (!boss.attackState) initBossAttackState(boss);

    const state = boss.attackState;
    if (time < state.nextAttackTime) return;

    const sequence = getCurrentAttackSequence(boss);
    if (!sequence || sequence.length === 0) return;

    const pattern = getBossAttackPattern(boss.bossType);
    if (!pattern) return;

    const moveIndex = state.sequenceIndex % sequence.length;
    const move = sequence[moveIndex];

    fireAttackMove(scene, boss, move, pattern, timeSlowMultiplier);

    state.sequenceIndex = (state.sequenceIndex + 1) % sequence.length;
    state.nextAttackTime = time + move.cooldownMs;
}


// ===== MOVEMENT BEHAVIORS =====
// These ONLY handle movement. No shooting.

function updateMegaLanderBehavior(scene, boss, time, timeSlowMultiplier) { // Update mega lander behavior.
    if (!boss.orbitAngle) boss.orbitAngle = 0;
    const phase = boss.corePhase || 0;
    const orbitSpeed = (0.005 + phase * 0.003) * timeSlowMultiplier;
    boss.orbitAngle += orbitSpeed;

    const centerX = scene.cameras.main.scrollX + CONFIG.width / 2;
    const centerY = CONFIG.height / 2;
    const orbitRadius = 150 - phase * 15;

    boss.x = centerX + Math.cos(boss.orbitAngle) * orbitRadius;
    boss.y = centerY + Math.sin(boss.orbitAngle) * orbitRadius * 0.6;
    boss.setVelocity(0, 0);
}

function updateTitanMutantBehavior(scene, boss, time, timeSlowMultiplier) { // Update titan mutant behavior.
    const player = getActivePlayer(scene);
    if (!player) return;
    const phase = boss.corePhase || 0;

    const angle = Phaser.Math.Angle.Between(boss.x, boss.y, player.x, player.y);
    const wobble = Math.sin(time * 0.006) * (0.4 - phase * 0.05);
    const speed = (60 + phase * 15) * timeSlowMultiplier;

    // Keep distance - approach but don't ram
    const dist = Phaser.Math.Distance.Between(boss.x, boss.y, player.x, player.y);
    const approachFactor = dist < 180 ? -0.3 : (dist > 350 ? 1.0 : 0.2);

    boss.setVelocity(
        Math.cos(angle + wobble) * speed * approachFactor,
        Math.sin(angle + wobble) * speed * approachFactor
    );
}

function updateHiveDroneBehavior(scene, boss, time, timeSlowMultiplier) { // Update hive drone behavior.
    if (!boss.hoverBaseY) boss.hoverBaseY = boss.y;
    const phase = boss.corePhase || 0;

    // Horizontal patrol
    if (!boss.patrolDir) boss.patrolDir = 1;
    const leftBound = scene.cameras.main.scrollX + 80;
    const rightBound = scene.cameras.main.scrollX + CONFIG.width - 80;

    if (boss.x >= rightBound) boss.patrolDir = -1;
    else if (boss.x <= leftBound) boss.patrolDir = 1;

    const hSpeed = (40 + phase * 10) * timeSlowMultiplier;
    boss.setVelocityX(boss.patrolDir * hSpeed);

    // Vertical bob
    const bobSpeed = 0.003 + phase * 0.001;
    const bobAmount = 30 + phase * 10;
    boss.y = boss.hoverBaseY + Math.sin(time * bobSpeed) * bobAmount;
}

function updateBehemothBomberBehavior(scene, boss, time, delta, timeSlowMultiplier) { // Update behemoth bomber behavior.
    const phase = boss.corePhase || 0;
    if (!boss.bomberDirection) boss.bomberDirection = Math.random() < 0.5 ? -1 : 1;

    // Reverse at screen edges
    const leftBound = scene.cameras.main.scrollX + 60;
    const rightBound = scene.cameras.main.scrollX + CONFIG.width - 60;
    if (boss.x >= rightBound) boss.bomberDirection = -1;
    else if (boss.x <= leftBound) boss.bomberDirection = 1;

    const hSpeed = (35 + phase * 8) * timeSlowMultiplier;
    boss.setVelocityX(hSpeed * boss.bomberDirection);

    // Stay in upper portion
    const targetY = CONFIG.height * (0.3 + phase * 0.05);
    if (boss.y < targetY - 20) boss.setVelocityY(25 * timeSlowMultiplier);
    else if (boss.y > targetY + 20) boss.setVelocityY(-25 * timeSlowMultiplier);
    else boss.setVelocityY(Math.sin(time * 0.003) * 10);
}

function updateColossalPodBehavior(scene, boss, time, timeSlowMultiplier) { // Update colossal pod behavior.
    const phase = boss.corePhase || 0;
    if (!boss.podPattern) boss.podPattern = 0;
    boss.podPattern += (0.012 + phase * 0.003) * timeSlowMultiplier;

    const baseY = CONFIG.height / 2;
    boss.y = baseY + Math.sin(boss.podPattern) * (70 + phase * 10);

    // Gentle horizontal drift with reversal
    if (!boss.driftDir) boss.driftDir = 1;
    const leftBound = scene.cameras.main.scrollX + 100;
    const rightBound = scene.cameras.main.scrollX + CONFIG.width - 100;
    if (boss.x >= rightBound) boss.driftDir = -1;
    else if (boss.x <= leftBound) boss.driftDir = 1;

    boss.setVelocityX((25 + phase * 5) * boss.driftDir * timeSlowMultiplier);
}

function updateLeviathanBaiterBehavior(scene, boss, time, timeSlowMultiplier) { // Update leviathan baiter behavior.
    const player = getActivePlayer(scene);
    if (!player) return;
    const phase = boss.corePhase || 0;

    if (!boss.serpentinePhase) boss.serpentinePhase = 0;
    boss.serpentinePhase += (0.018 + phase * 0.004) * timeSlowMultiplier;

    const angle = Phaser.Math.Angle.Between(boss.x, boss.y, player.x, player.y);
    const weave = Math.sin(boss.serpentinePhase) * (0.6 - phase * 0.08);
    const speed = (80 + phase * 15) * timeSlowMultiplier;

    // Maintain medium distance
    const dist = Phaser.Math.Distance.Between(boss.x, boss.y, player.x, player.y);
    const approachFactor = dist < 160 ? -0.4 : (dist > 300 ? 1.0 : 0.15);

    boss.setVelocity(
        Math.cos(angle + weave) * speed * approachFactor,
        Math.sin(angle + weave) * speed * approachFactor
    );
}

function updateApexKamikazeBehavior(scene, boss, time, timeSlowMultiplier) { // Update apex kamikaze behavior.
    const player = getActivePlayer(scene);
    if (!player) return;
    const phase = boss.corePhase || 0;

    const angle = Phaser.Math.Angle.Between(boss.x, boss.y, player.x, player.y);
    const dist = Phaser.Math.Distance.Between(boss.x, boss.y, player.x, player.y);

    // Charge behavior: circle at distance, then dive in, then pull back
    if (!boss.chargeState) boss.chargeState = 'circle';
    if (!boss.chargeTimer) boss.chargeTimer = 0;
    boss.chargeTimer += timeSlowMultiplier;

    if (boss.chargeState === 'circle') {
        // Circle around player
        if (!boss.circleAngle) boss.circleAngle = Math.random() * Math.PI * 2;
        boss.circleAngle += (0.02 + phase * 0.005) * timeSlowMultiplier;
        const circleRadius = 200 - phase * 20;
        const targetX = player.x + Math.cos(boss.circleAngle) * circleRadius;
        const targetY = player.y + Math.sin(boss.circleAngle) * circleRadius * 0.6;
        const moveAngle = Phaser.Math.Angle.Between(boss.x, boss.y, targetX, targetY);
        const speed = (100 + phase * 15) * timeSlowMultiplier;
        boss.setVelocity(Math.cos(moveAngle) * speed, Math.sin(moveAngle) * speed);

        // Transition to charge after circling
        if (boss.chargeTimer > (120 - phase * 20)) {
            boss.chargeState = 'dive';
            boss.chargeTimer = 0;
        }
    } else if (boss.chargeState === 'dive') {
        // Dive toward player
        const speed = (180 + phase * 30) * timeSlowMultiplier;
        boss.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        boss.rotation += 0.15 * timeSlowMultiplier;

        if (boss.chargeTimer > (40 + phase * 5) || dist < 60) {
            boss.chargeState = 'retreat';
            boss.chargeTimer = 0;
        }
    } else {
        // Retreat
        const speed = (120 + phase * 10) * timeSlowMultiplier;
        boss.setVelocity(Math.cos(angle + Math.PI) * speed, Math.sin(angle + Math.PI) * speed);
        boss.rotation += 0.05 * timeSlowMultiplier;

        if (boss.chargeTimer > 60 || dist > 300) {
            boss.chargeState = 'circle';
            boss.chargeTimer = 0;
        }
    }
}

function updateFortressTurretBehavior(scene, boss, time, timeSlowMultiplier) { // Update fortress turret behavior.
    // Stationary boss
    if (!boss.isPlanted) {
        boss.isPlanted = true;
        boss.setVelocity(0, 0);
        boss.body.setImmovable(true);
    }

    // Slow rotation for visual effect
    const phase = boss.corePhase || 0;
    boss.rotation += (0.005 + phase * 0.003) * timeSlowMultiplier;
}

function updateOverlordShieldBehavior(scene, boss, time, timeSlowMultiplier) { // Update overlord shield behavior.
    const phase = boss.corePhase || 0;
    if (!boss.orbitAngle) boss.orbitAngle = 0;
    boss.orbitAngle += (0.003 + phase * 0.001) * timeSlowMultiplier;

    const centerX = scene.cameras.main.scrollX + CONFIG.width / 2;
    const centerY = CONFIG.height / 2;
    const orbitRadius = 100 + phase * 10;

    boss.x = centerX + Math.cos(boss.orbitAngle) * orbitRadius;
    boss.y = centerY + Math.sin(boss.orbitAngle) * orbitRadius * 0.8;
    boss.setVelocity(0, 0);
}


// ===== MAIN BOSS UPDATE =====

function updateBosses(scene, time, delta) { // Update bosses.
    const topLimit = 20;
    const { bosses } = scene;
    if (!bosses) return;

    bosses.children.entries.forEach(boss => {
        if (!boss.active) return;
        // Skip mothership core - handled by its own updater
        if (boss.bossType === 'mothershipCore') return;

        wrapWorldBounds(boss);

        const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
        const terrainVariation = Math.sin(boss.x / 200) * 30;
        const minClearance = 60;
        const bossGroundY = groundLevel - terrainVariation - minClearance;

        if (boss.y > bossGroundY) {
            boss.y = bossGroundY;
            if (boss.body.velocity.y > 0) boss.setVelocityY(0);
        }
        if (boss.y < topLimit) {
            boss.y = topLimit;
            if (boss.body.velocity.y < 0) boss.setVelocityY(0);
        }

        const timeSlowMultiplier = playerState.powerUps.timeSlow > 0 ? 0.3 : 1.0;

        // Update shield phase state
        if (typeof tickShieldPhaseState === 'function') {
            tickShieldPhaseState(boss, time, delta);
            boss.corePhase = typeof getEncounterPhase === 'function' ? getEncounterPhase(boss) : 0;
        }

        // Movement only
        switch (boss.bossType) {
            case 'megaLander':
                updateMegaLanderBehavior(scene, boss, time, timeSlowMultiplier);
                break;
            case 'titanMutant':
                updateTitanMutantBehavior(scene, boss, time, timeSlowMultiplier);
                break;
            case 'hiveDrone':
                updateHiveDroneBehavior(scene, boss, time, timeSlowMultiplier);
                break;
            case 'behemothBomber':
                updateBehemothBomberBehavior(scene, boss, time, delta, timeSlowMultiplier);
                break;
            case 'colossalPod':
                updateColossalPodBehavior(scene, boss, time, timeSlowMultiplier);
                break;
            case 'leviathanBaiter':
                updateLeviathanBaiterBehavior(scene, boss, time, timeSlowMultiplier);
                break;
            case 'apexKamikaze':
                updateApexKamikazeBehavior(scene, boss, time, timeSlowMultiplier);
                break;
            case 'fortressTurret':
                updateFortressTurretBehavior(scene, boss, time, timeSlowMultiplier);
                break;
            case 'overlordShield':
                updateOverlordShieldBehavior(scene, boss, time, timeSlowMultiplier);
                break;
        }

        // Unified attack pattern - replaces all per-behavior shooting
        updateBossAttackPattern(scene, boss, time, timeSlowMultiplier);
    });
}

// Legacy function kept as no-op since attack patterns are now unified
function fireBossBulletPattern(scene, boss, time, timeSlowMultiplier) {
    // Intentionally empty - handled by updateBossAttackPattern
}

// Legacy helper kept for compatibility
function getBossPhaseShotInterval(boss, baseInterval) {
    if (typeof getPhasedInterval !== 'function') return baseInterval;
    return getPhasedInterval(boss, baseInterval, 170, 260);
}