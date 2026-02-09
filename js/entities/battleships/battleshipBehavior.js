// ------------------------
// Battleship AI Behaviors and Update Functions
// ------------------------

function updateRaiderBattleshipBehavior(scene, battleship, time, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    if (!player) return;

    if (!battleship.strafePhase) battleship.strafePhase = Math.random() * Math.PI * 2;
    battleship.strafePhase += 0.03 * timeSlowMultiplier;

    const angle = Phaser.Math.Angle.Between(battleship.x, battleship.y, player.x, player.y);
    const strafe = Math.sin(battleship.strafePhase) * 0.6;
    const speed = 180 * timeSlowMultiplier;

    battleship.setVelocity(
        Math.cos(angle + strafe) * speed,
        Math.sin(angle + strafe) * speed
    );

    const shotConfig = getBattleshipShotConfig('raider');
    const shotInterval = getBattleshipPhaseInterval(battleship, shotConfig.interval);
    if (time > battleship.lastShot + shotInterval) {
        const spread = 0.18;
        const leftAngle = angle - spread;
        const rightAngle = angle + spread;
        const sourceOffset = 18;
        const burstCount = 1 + getBattleshipBonusBursts(battleship);

        for (let i = 0; i < burstCount; i++) {
            const burstOffset = i * 0.03;
            const burstLeft = leftAngle - burstOffset;
            const burstRight = rightAngle + burstOffset;
            shootFromBattleshipSource(
                scene,
                battleship.x + Math.cos(burstLeft) * sourceOffset,
                battleship.y + Math.sin(burstLeft) * sourceOffset,
                battleship,
                shotConfig,
                burstLeft
            );
            shootFromBattleshipSource(
                scene,
                battleship.x + Math.cos(burstRight) * sourceOffset,
                battleship.y + Math.sin(burstRight) * sourceOffset,
                battleship,
                shotConfig,
                burstRight
            );
        }
        battleship.lastShot = time;
    }
}

function updateCarrierBattleshipBehavior(scene, battleship, time, delta, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    if (!player) return;

    if (!battleship.patrolAngle) battleship.patrolAngle = Math.random() * Math.PI * 2;
    battleship.patrolAngle += 0.008 * timeSlowMultiplier;

    const speed = 70 * timeSlowMultiplier;
    battleship.setVelocity(
        Math.cos(battleship.patrolAngle) * speed,
        Math.sin(battleship.patrolAngle) * speed * 0.4
    );

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

    const shotConfig = getBattleshipShotConfig('carrier');
    const shotInterval = getBattleshipPhaseInterval(battleship, shotConfig.interval);
    if (time > battleship.lastShot + shotInterval) {
        const angle = Phaser.Math.Angle.Between(battleship.x, battleship.y, player.x, player.y);
        const burstCount = 1 + getBattleshipBonusBursts(battleship);
        for (let i = 0; i < burstCount; i++) {
            const jitter = (i - (burstCount - 1) / 2) * 0.05;
            shootFromBattleshipSource(scene, battleship.x, battleship.y, battleship, shotConfig, angle + jitter);
        }
        battleship.lastShot = time;
    }
}

function updateNovaBattleshipBehavior(scene, battleship, time, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    if (!player) return;

    if (!battleship.orbitAngle) battleship.orbitAngle = Math.random() * Math.PI * 2;
    battleship.orbitAngle += 0.012 * timeSlowMultiplier;

    const orbitRadius = 160;
    const targetX = player.x + Math.cos(battleship.orbitAngle) * orbitRadius;
    const targetY = player.y + Math.sin(battleship.orbitAngle) * orbitRadius * 0.6;

    battleship.x = targetX;
    battleship.y = targetY;

    const shotConfig = getBattleshipShotConfig('nova');
    const shotInterval = getBattleshipPhaseInterval(battleship, shotConfig.interval);
    if (time > battleship.lastShot + shotInterval) {
        const burstCount = 1 + getBattleshipBonusBursts(battleship);
        for (let burst = 0; burst < burstCount; burst++) {
            const rotationOffset = burst * 0.35;
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 + battleship.orbitAngle + rotationOffset;
                const sourceX = battleship.x + Math.cos(angle) * 22;
                const sourceY = battleship.y + Math.sin(angle) * 22;
                shootFromBattleshipSource(scene, sourceX, sourceY, battleship, shotConfig, angle);
            }
        }
        battleship.lastShot = time;
    }
}

function updateSiegeBattleshipBehavior(scene, battleship, time, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    if (!player) return;

    if (!battleship.siegeOffset) battleship.siegeOffset = Math.random() < 0.5 ? -1 : 1;
    if (!battleship.siegePhase) battleship.siegePhase = Math.random() * Math.PI * 2;

    const desiredDistance = 240;
    const angleToPlayer = Phaser.Math.Angle.Between(battleship.x, battleship.y, player.x, player.y);
    const distance = Phaser.Math.Distance.Between(battleship.x, battleship.y, player.x, player.y);
    const retreat = distance < desiredDistance ? -1 : 1;
    const speed = 90 * timeSlowMultiplier;

    battleship.setVelocity(
        Math.cos(angleToPlayer) * speed * retreat,
        Math.sin(angleToPlayer) * speed * retreat
    );

    battleship.siegePhase += 0.01 * timeSlowMultiplier;
    battleship.y += Math.sin(battleship.siegePhase) * 0.5;

    const shotConfig = getBattleshipShotConfig('siege');
    const shotInterval = getBattleshipPhaseInterval(battleship, shotConfig.interval);
    if (time > battleship.lastShot + shotInterval) {
        const fireAngle = angleToPlayer + battleship.siegeOffset * 0.05;
        const burstCount = 1 + getBattleshipBonusBursts(battleship);
        for (let i = 0; i < burstCount; i++) {
            const burstAngle = fireAngle + (i - (burstCount - 1) / 2) * 0.04;
            const barrelX = battleship.x + Math.cos(burstAngle) * 26;
            const barrelY = battleship.y + Math.sin(burstAngle) * 26;
            shootFromBattleshipSource(scene, barrelX, barrelY, battleship, shotConfig, burstAngle);
        }
        battleship.lastShot = time;
    }
}

function updateDreadnoughtBattleshipBehavior(scene, battleship, time, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    if (!player) return;

    if (!battleship.advancePhase) battleship.advancePhase = Math.random() * Math.PI * 2;
    battleship.advancePhase += 0.01 * timeSlowMultiplier;

    const angle = Phaser.Math.Angle.Between(battleship.x, battleship.y, player.x, player.y);
    const sway = Math.sin(battleship.advancePhase) * 0.2;
    const speed = 110 * timeSlowMultiplier;

    battleship.setVelocity(
        Math.cos(angle + sway) * speed,
        Math.sin(angle + sway) * speed
    );

    const shotConfig = getBattleshipShotConfig('dreadnought');
    const shotInterval = getBattleshipPhaseInterval(battleship, shotConfig.interval);
    if (time > battleship.lastShot + shotInterval) {
        const burstCount = 1 + getBattleshipBonusBursts(battleship);
        for (let burst = 0; burst < burstCount; burst++) {
            const offsets = [-0.35, -0.15, 0.15, 0.35];
            const spreadScale = 1 + burst * 0.15;
            offsets.forEach(offset => {
                const fireAngle = angle + offset * spreadScale;
                const sourceX = battleship.x + Math.cos(fireAngle) * 30;
                const sourceY = battleship.y + Math.sin(fireAngle) * 30;
                shootFromBattleshipSource(scene, sourceX, sourceY, battleship, shotConfig, fireAngle);
            });
        }
        battleship.lastShot = time;
    }
}

function updateBattleships(scene, time, delta) {
    const { battleships } = scene;
    if (!battleships) return;

    const topLimit = 20;
    battleships.children.entries.forEach(battleship => {
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
        updateBattleshipPhaseState(scene, battleship, time);

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

        updateBattleshipShieldNodes(scene, battleship, timeSlowMultiplier);
    });
}
