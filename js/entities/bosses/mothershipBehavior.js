// ------------------------
// File: js/entities/bosses/mothershipBehavior.js
// ------------------------

function updateMothershipCoreBehavior(scene, boss, time, delta, timeSlowMultiplier) { // Update mothership core behavior.
    const player = getActivePlayer(scene);
    const anchorX = boss.anchorX ?? boss.x;
    const anchorY = boss.anchorY ?? boss.y;
    boss.setPosition(anchorX, anchorY);
    boss.setVelocity(0, 0);

    if (typeof tickShieldPhaseState === 'function') tickShieldPhaseState(boss, time, delta);
    const phase = typeof getEncounterPhase === 'function' ? getEncounterPhase(boss) : (boss.corePhase || 0);
    boss.corePhase = phase;

    // Use the unified attack pattern system for mothership core too
    if (!boss.attackState) {
        initBossAttackState(boss);
        boss.attackState.nextAttackTime = time + 2000; // Grace period
    }
    updateBossAttackPattern(scene, boss, time, timeSlowMultiplier);
}

function updateMothershipBosses(scene, time, delta) { // Update mothership bosses.
    const { bosses } = scene;
    if (!bosses) return;

    bosses.children.entries.forEach(boss => {
        if (!boss.active || boss.bossType !== 'mothershipCore') return;

        const timeSlowMultiplier = playerState.powerUps.timeSlow > 0 ? 0.3 : 1.0;
        updateMothershipCoreBehavior(scene, boss, time, delta, timeSlowMultiplier);
    });
}