// ------------------------
// File: js/entities/bosses/mothershipBehavior.js
// ------------------------

// Updates mothership core movement/phase behavior and delegates firing logic each frame.
function updateMothershipCoreBehavior(scene, boss, time, delta, timeSlowMultiplier) {
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

// Per-frame update dispatcher for active mothership-specific boss entities.
function updateMothershipBosses(scene, time, delta) {
    const { bosses } = scene;
    if (!bosses) return;

    bosses.children.entries.forEach(boss => {
        if (!boss.active || boss.bossType !== 'mothershipCore') return;

        const timeSlowMultiplier = playerState.powerUps.timeSlow > 0 ? 0.3 : 1.0;
        updateMothershipCoreBehavior(scene, boss, time, delta, timeSlowMultiplier);
    });
}
