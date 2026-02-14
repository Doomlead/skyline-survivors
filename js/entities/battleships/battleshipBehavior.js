// ------------------------
// File: js/entities/battleShip/battleshipBehavior.js
// ------------------------

// Battleships now use the same unified attack pattern system as bosses.
// Each battleship type gets its own attack pattern config.

const BATTLESHIP_ATTACK_PATTERNS = {
    raider: {
        projectileType: 'enemyProjectile_baiter',
        damage: 1.1,
        phases: [
            {
                sequence: [
                    { type: 'aimed', count: 2, spread: 0.35, speed: 360, cooldownMs: 1400 },
                    { type: 'radial', count: 4, speed: 300, cooldownMs: 1800 },
                ],
            },
            {
                sequence: [
                    { type: 'aimed', count: 3, spread: 0.3, speed: 400, cooldownMs: 1100 },
                    { type: 'radial', count: 6, speed: 340, cooldownMs: 1500 },
                ],
            },
            {
                sequence: [
                    { type: 'aimed', count: 4, spread: 0.25, speed: 440, cooldownMs: 900 },
                    { type: 'radial', count: 8, speed: 360, cooldownMs: 1200 },
                    { type: 'burst', count: 3, speed: 420, cooldownMs: 1000 },
                ],
            },
        ],
    },
    carrier: {
        projectileType: 'enemyProjectile_drone',
        damage: 1.4,
        phases: [
            {
                sequence: [
                    { type: 'aimed', count: 1, speed: 260, cooldownMs: 2200 },
                    { type: 'spread', count: 2, spread: 0.4, speed: 240, cooldownMs: 2600 },
                ],
            },
            {
                sequence: [
                    { type: 'aimed', count: 2, spread: 0.2, speed: 300, cooldownMs: 1800 },
                    { type: 'radial', count: 4, speed: 260, cooldownMs: 2200 },
                ],
            },
            {
                sequence: [
                    { type: 'aimed', count: 3, spread: 0.2, speed: 340, cooldownMs: 1400 },
                    { type: 'radial', count: 6, speed: 280, cooldownMs: 1800 },
                ],
            },
        ],
    },
    nova: {
        projectileType: 'enemyProjectile_pod',
        damage: 1.2,
        phases: [
            {
                sequence: [
                    { type: 'radial', count: 6, speed: 220, cooldownMs: 2000 },
                ],
            },
            {
                sequence: [
                    { type: 'radial', count: 8, speed: 250, cooldownMs: 1600 },
                    { type: 'spiral', count: 4, speed: 230, cooldownMs: 1800 },
                ],
            },
            {
                sequence: [
                    { type: 'radial', count: 10, speed: 280, cooldownMs: 1200 },
                    { type: 'spiral', count: 6, speed: 260, cooldownMs: 1400 },
                ],
            },
        ],
    },
    siege: {
        projectileType: 'enemyProjectile_piercing',
        damage: 2.2,
        phases: [
            {
                sequence: [
                    { type: 'aimed', count: 1, speed: 320, cooldownMs: 2400 },
                ],
            },
            {
                sequence: [
                    { type: 'aimed', count: 2, spread: 0.1, speed: 360, cooldownMs: 2000 },
                    { type: 'spread', count: 2, spread: 0.3, speed: 300, cooldownMs: 2400 },
                ],
            },
            {
                sequence: [
                    { type: 'aimed', count: 2, spread: 0.1, speed: 400, cooldownMs: 1600 },
                    { type: 'spread', count: 3, spread: 0.35, speed: 340, cooldownMs: 1800 },
                    { type: 'burst', count: 3, speed: 380, cooldownMs: 2000 },
                ],
            },
        ],
    },
    dreadnought: {
        projectileType: 'enemyProjectile',
        damage: 1.8,
        phases: [
            {
                sequence: [
                    { type: 'spread', count: 4, spread: 0.7, speed: 280, cooldownMs: 1800 },
                    { type: 'aimed', count: 2, spread: 0.2, speed: 320, cooldownMs: 2000 },
                ],
            },
            {
                sequence: [
                    { type: 'spread', count: 5, spread: 0.8, speed: 310, cooldownMs: 1400 },
                    { type: 'aimed', count: 3, spread: 0.18, speed: 360, cooldownMs: 1600 },
                    { type: 'radial', count: 6, speed: 280, cooldownMs: 1800 },
                ],
            },
            {
                sequence: [
                    { type: 'spread', count: 6, spread: 0.9, speed: 340, cooldownMs: 1000 },
                    { type: 'aimed', count: 4, spread: 0.15, speed: 400, cooldownMs: 1200 },
                    { type: 'radial', count: 8, speed: 300, cooldownMs: 1400 },
                ],
            },
        ],
    },
};

function getBattleshipAttackPattern(type) {
    return BATTLESHIP_ATTACK_PATTERNS[type] || BATTLESHIP_ATTACK_PATTERNS.raider;
}

function updateBattleshipAttackPattern(scene, battleship, time, timeSlowMultiplier) {
    if (!battleship.attackState) {
        initBossAttackState(battleship);
        battleship.attackState.nextAttackTime = time + 1200;
    }

    const state = battleship.attackState;
    if (time < state.nextAttackTime) return;

    const pattern = getBattleshipAttackPattern(battleship.battleshipType);
    if (!pattern) return;

    const phase = battleship.corePhase || 0;
    const phaseData = pattern.phases[Math.min(phase, pattern.phases.length - 1)];
    const sequence = phaseData?.sequence;
    if (!sequence || sequence.length === 0) return;

    const moveIndex = state.sequenceIndex % sequence.length;
    const move = sequence[moveIndex];

    // Reuse the boss attack system
    fireAttackMove(scene, battleship, move, pattern, timeSlowMultiplier);

    state.sequenceIndex = (state.sequenceIndex + 1) % sequence.length;
    state.nextAttackTime = time + move.cooldownMs;
}


// ===== BATTLESHIP MOVEMENT BEHAVIORS =====

function updateRaiderBattleshipBehavior(scene, battleship, time, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    if (!player) return;

    if (!battleship.strafePhase) battleship.strafePhase = Math.random() * Math.PI * 2;
    battleship.strafePhase += 0.025 * timeSlowMultiplier;

    const angle = Phaser.Math.Angle.Between(battleship.x, battleship.y, player.x, player.y);
    const dist = Phaser.Math.Distance.Between(battleship.x, battleship.y, player.x, player.y);
    const strafe = Math.sin(battleship.strafePhase) * 0.7;
    const speed = 150 * timeSlowMultiplier;

    // Maintain distance
    const approachFactor = dist < 150 ? -0.5 : (dist > 320 ? 1.0 : 0.1);

    battleship.setVelocity(
        Math.cos(angle + strafe) * speed * approachFactor,
        Math.sin(angle + strafe) * speed * approachFactor
    );
}

function updateCarrierBattleshipBehavior(scene, battleship, time, delta, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    if (!player) return;

    if (!battleship.patrolAngle) battleship.patrolAngle = Math.random() * Math.PI * 2;
    battleship.patrolAngle += 0.006 * timeSlowMultiplier;

    const speed = 55 * timeSlowMultiplier;
    battleship.setVelocity(
        Math.cos(battleship.patrolAngle) * speed,
        Math.sin(battleship.patrolAngle) * speed * 0.4
    );

    // Drone launching (separate from shooting)
    battleship.launchTimer += delta * timeSlowMultiplier;
    if (battleship.launchTimer > battleship.launchInterval && battleship.minionsSpawned < battleship.maxMinions) {
        const launchCount = 2;
        for (let i = 0; i < launchCount; i++) {
            const offset = (i === 0 ? -16 : 16);
            spawnEnemy(scene, 'drone', battleship.x + offset, battleship.y + 18, false);
        }
        battleship.minionsSpawned += launchCount;
        battleship.launchTimer = 0;
    }
}

function updateNovaBattleshipBehavior(scene, battleship, time, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    if (!player) return;

    if (!battleship.orbitAngle) battleship.orbitAngle = Math.random() * Math.PI * 2;
    battleship.orbitAngle += 0.01 * timeSlowMultiplier;

    const orbitRadius = 180;
    const targetX = player.x + Math.cos(battleship.orbitAngle) * orbitRadius;
    const targetY = player.y + Math.sin(battleship.orbitAngle) * orbitRadius * 0.6;

    // Smooth movement toward orbit position
    const moveAngle = Phaser.Math.Angle.Between(battleship.x, battleship.y, targetX, targetY);
    const speed = 120 * timeSlowMultiplier;
    battleship.setVelocity(
        Math.cos(moveAngle) * speed,
        Math.sin(moveAngle) * speed
    );
}

function updateSiegeBattleshipBehavior(scene, battleship, time, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    if (!player) return;

    if (!battleship.siegePhase) battleship.siegePhase = Math.random() * Math.PI * 2;

    const desiredDistance = 260;
    const angleToPlayer = Phaser.Math.Angle.Between(battleship.x, battleship.y, player.x, player.y);
    const distance = Phaser.Math.Distance.Between(battleship.x, battleship.y, player.x, player.y);
    const retreat = distance < desiredDistance ? -1 : (distance > desiredDistance + 80 ? 1 : 0);
    const speed = 70 * timeSlowMultiplier;

    battleship.setVelocity(
        Math.cos(angleToPlayer) * speed * retreat,
        Math.sin(angleToPlayer) * speed * retreat
    );

    battleship.siegePhase += 0.008 * timeSlowMultiplier;
    battleship.y += Math.sin(battleship.siegePhase) * 0.4;
}

function updateDreadnoughtBattleshipBehavior(scene, battleship, time, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    if (!player) return;

    if (!battleship.advancePhase) battleship.advancePhase = Math.random() * Math.PI * 2;
    battleship.advancePhase += 0.008 * timeSlowMultiplier;

    const angle = Phaser.Math.Angle.Between(battleship.x, battleship.y, player.x, player.y);
    const dist = Phaser.Math.Distance.Between(battleship.x, battleship.y, player.x, player.y);
    const sway = Math.sin(battleship.advancePhase) * 0.25;
    const speed = 90 * timeSlowMultiplier;

    // Keep medium-close range
    const approachFactor = dist < 140 ? -0.3 : (dist > 280 ? 1.0 : 0.15);

    battleship.setVelocity(
        Math.cos(angle + sway) * speed * approachFactor,
        Math.sin(angle + sway) * speed * approachFactor
    );
}

function updateBattleships(scene, time, delta) {
    const { battleships } = scene;
    if (!battleships) return;

    const topLimit = 20;
    battleships.children.entries.forEach(battleship => {
        if (!battleship.active) return;
        wrapWorldBounds(battleship);

        const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
        const terrainVariation = Math.sin(battleship.x / 200) * 30;
        const minClearance = 70;
        const battleshipGroundY = groundLevel - terrainVariation - minClearance;

        if (battleship.y > battleshipGroundY) {
            battleship.y = battleshipGroundY;
            if (battleship.body.velocity.y > 0) battleship.setVelocityY(0);
        }
        if (battleship.y < topLimit) {
            battleship.y = topLimit;
            if (battleship.body.velocity.y < 0) battleship.setVelocityY(0);
        }

        const timeSlowMultiplier = playerState.powerUps.timeSlow > 0 ? 0.3 : 1.0;

        if (typeof tickShieldPhaseState === 'function') {
            tickShieldPhaseState(battleship, time, delta);
            battleship.corePhase = typeof getEncounterPhase === 'function' ? getEncounterPhase(battleship) : 0;
        }

        // Movement only
        switch (battleship.battleshipType) {
            case 'raider':
                updateRaiderBattleshipBehavior(scene, battleship, time, timeSlowMultiplier);
                break;
            case 'carrier':
                updateCarrierBattleshipBehavior(scene, battleship, time, delta, timeSlowMultiplier);
                break;
            case 'nova':
                updateNovaBattleshipBehavior(scene, battleship, time, timeSlowMultiplier);
                break;
            case 'siege':
                updateSiegeBattleshipBehavior(scene, battleship, time, timeSlowMultiplier);
                break;
            case 'dreadnought':
                updateDreadnoughtBattleshipBehavior(scene, battleship, time, timeSlowMultiplier);
                break;
        }

        // Unified attack pattern
        updateBattleshipAttackPattern(scene, battleship, time, timeSlowMultiplier);
    });
}