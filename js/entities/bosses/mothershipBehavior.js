// ------------------------
// Mothership AI Behaviors and Update Functions
// ------------------------

function updateMothershipCoreBehavior(scene, boss, time, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    const centerX = scene.cameras.main.scrollX + CONFIG.width / 2;
    const targetY = CONFIG.height * 0.35;
    const sway = Math.sin(time * 0.0015) * 120;

    boss.x = Phaser.Math.Linear(boss.x, centerX + sway, 0.02);
    boss.y = Phaser.Math.Linear(boss.y, targetY + Math.sin(time * 0.001) * 25, 0.02);

    const hpRatio = boss.maxHp > 0 ? boss.hp / boss.maxHp : 1;
    const phase = hpRatio < 0.33 ? 2 : hpRatio < 0.66 ? 1 : 0;
    boss.corePhase = phase;

    const shotInterval = phase === 2 ? 900 : phase === 1 ? 1200 : 1600;
    if (time > boss.lastShot + shotInterval) {
        const shotConfig = getBossShotConfig('mothershipCore');
        const ringCount = phase === 2 ? 10 : phase === 1 ? 8 : 6;
        for (let i = 0; i < ringCount; i++) {
            const angle = (i / ringCount) * Math.PI * 2;
            const sourceX = boss.x + Math.cos(angle) * 50;
            const sourceY = boss.y + Math.sin(angle) * 35;
            shootFromBossSource(scene, sourceX, sourceY, boss, shotConfig, angle);
        }
        if (player && phase > 0) {
            const aimedAngle = Phaser.Math.Angle.Between(boss.x, boss.y, player.x, player.y);
            const sourceX = boss.x + Math.cos(aimedAngle) * 55;
            const sourceY = boss.y + Math.sin(aimedAngle) * 35;
            shootFromBossSource(scene, sourceX, sourceY, boss, shotConfig, aimedAngle);
        }
        boss.lastShot = time;
    }
}

function updateMothershipBosses(scene, time, delta) {
    const topLimit = 20;
    const { bosses } = scene;
    if (!bosses) return;

    bosses.children.entries.forEach(boss => {
        if (!boss.active || boss.bossType !== 'mothershipCore') return;

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

        updateMothershipCoreBehavior(scene, boss, time, timeSlowMultiplier);
    });
}
