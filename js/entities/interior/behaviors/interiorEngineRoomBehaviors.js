// ------------------------
// Interior Behaviors: EngineRoom
// ------------------------
const INTERIOR_ENGINEROOM_ENEMIES = ['repair_bot', 'plasma_fodder', 'elite_engineer'];
// Runs behavior updates for all enemies in this interior section.
function updateInteriorEngineRoomBehaviors(scene, time, delta) {
    if (!scene?.enemies) return;
    const timeSlowMultiplier = playerState?.powerUps?.timeSlow > 0 ? 0.3 : 1.0;
    const entries = scene.enemies.children?.entries || [];
    entries.forEach(enemy => {
        if (!enemy || !enemy.active) return;
        if (enemy.interiorSection !== 'engine_room') return;
        const fn = interiorBehaviorDispatch[enemy.enemyType];
        if (typeof fn === 'function') fn(scene, enemy, time, delta, timeSlowMultiplier);
    });
}

function updateRepairBot(scene, enemy, time, delta, timeSlowMultiplier) {
    const player = typeof getActivePlayer === 'function' ? getActivePlayer(scene) : null;
    if (!player) return;
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    const weave = Math.sin(time * 0.01 + (enemy.seed || 0)) * 0.35;
    enemy.setVelocity(Math.cos(angle + weave) * 135 * timeSlowMultiplier, Math.sin(angle + weave) * 135 * timeSlowMultiplier);
    if (time > (enemy.lastShot || 0) + 1800 && Math.random() < 0.03 && typeof shootAtPlayer === 'function') {
        shootAtPlayer(scene, enemy);
        enemy.lastShot = time;
    }
}

function updatePlasmaFodder(scene, enemy, time, delta, timeSlowMultiplier) {
    if (typeof enemy.patrolAngle !== 'number') enemy.patrolAngle = Math.random() * Math.PI * 2;
    enemy.patrolAngle += 0.015 * timeSlowMultiplier;
    enemy.setVelocity(Math.cos(enemy.patrolAngle) * 110 * timeSlowMultiplier, Math.sin(enemy.patrolAngle) * 80 * timeSlowMultiplier);
    if (time > (enemy.lastShot || 0) + 1700 && Math.random() < 0.025 && typeof shootAtPlayer === 'function') {
        shootAtPlayer(scene, enemy);
        enemy.lastShot = time;
    }
}

function updateEliteEngineer(scene, enemy, time, delta, timeSlowMultiplier) {
    if (typeof enemy.patrolAngle !== 'number') enemy.patrolAngle = Math.random() * Math.PI * 2;
    enemy.patrolAngle += 0.015 * timeSlowMultiplier;
    enemy.setVelocity(Math.cos(enemy.patrolAngle) * 110 * timeSlowMultiplier, Math.sin(enemy.patrolAngle) * 80 * timeSlowMultiplier);
    if (time > (enemy.lastShot || 0) + 1700 && Math.random() < 0.025 && typeof shootAtPlayer === 'function') {
        shootAtPlayer(scene, enemy);
        enemy.lastShot = time;
    }
}

const interiorBehaviorDispatch = {
    'repair_bot': updateRepairBot,
    'plasma_fodder': updatePlasmaFodder,
    'elite_engineer': updateEliteEngineer,
};

if (typeof module !== 'undefined') {
    module.exports = { updateInteriorEngineRoomBehaviors };
}
