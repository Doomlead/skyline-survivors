// ------------------------
// Mothership AI Behaviors and Update Functions
// ------------------------

function updateMothershipCoreBehavior(scene, boss, time, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    const anchorX = boss.anchorX ?? boss.x;
    const anchorY = boss.anchorY ?? boss.y;
    boss.setPosition(anchorX, anchorY);
    boss.setVelocity(0, 0);

    const phase = boss.phaseIndex || 0;
    boss.corePhase = phase;

    const baseInterval = getBossShotConfig('mothershipCore').interval;
    const shotInterval = getBossPhaseInterval(boss, baseInterval);
    if (time > boss.lastShot + shotInterval) {
        const shotConfig = getBossShotConfig('mothershipCore');
        const ringCount = getBossPhaseSources(boss, 6);
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
    const { bosses } = scene;
    if (!bosses) return;

    bosses.children.entries.forEach(boss => {
        if (!boss.active || boss.bossType !== 'mothershipCore') return;

        const timeSlowMultiplier = playerState.powerUps.timeSlow > 0 ? 0.3 : 1.0;

        updateBossPhaseState(scene, boss, time);
        updateMothershipCoreBehavior(scene, boss, time, timeSlowMultiplier);
        updateBossShieldNodes(scene, boss, timeSlowMultiplier);
    });
}
