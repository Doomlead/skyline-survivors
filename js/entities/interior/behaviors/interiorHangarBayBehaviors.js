// ------------------------
// Interior Behaviors: HangarBay
// ------------------------
const INTERIOR_HANGARBAY_ENEMIES = ['mothership_grunt', 'hover_mine', 'laser_turret'];
// Runs behavior updates for all enemies in this interior section.
function updateInteriorHangarBayBehaviors(scene, time, delta) {
    if (!scene?.enemies) return;
    const timeSlowMultiplier = playerState?.powerUps?.timeSlow > 0 ? 0.3 : 1.0;
    const entries = scene.enemies.children?.entries || [];
    entries.forEach(enemy => {
        if (!enemy || !enemy.active) return;
        if (enemy.interiorSection !== 'hangar_bay') return;
        const fn = interiorBehaviorDispatch[enemy.enemyType];
        if (typeof fn === 'function') fn(scene, enemy, time, delta, timeSlowMultiplier);
    });
}

function updateMothershipGrunt(scene, enemy, time, delta, timeSlowMultiplier) {
    if (typeof enemy.patrolAngle !== 'number') enemy.patrolAngle = Math.random() * Math.PI * 2;
    enemy.patrolAngle += 0.015 * timeSlowMultiplier;
    enemy.setVelocity(Math.cos(enemy.patrolAngle) * 110 * timeSlowMultiplier, Math.sin(enemy.patrolAngle) * 80 * timeSlowMultiplier);
    if (time > (enemy.lastShot || 0) + 1700 && Math.random() < 0.025 && typeof shootAtPlayer === 'function') {
        shootAtPlayer(scene, enemy);
        enemy.lastShot = time;
    }
}

function updateHoverMine(scene, enemy, time, delta, timeSlowMultiplier) {
    const wobble = Math.sin(time * 0.004 + (enemy.seed || 0)) * 30;
    enemy.setVelocityX(wobble * timeSlowMultiplier);
    enemy.setVelocityY(Math.cos(time * 0.003 + (enemy.seed || 0)) * 25 * timeSlowMultiplier);
}

function updateLaserTurret(scene, enemy, time, delta, timeSlowMultiplier) {
    enemy.setVelocity(0, 0);
    if (time > (enemy.lastShot || 0) + 1200) {
        if (typeof shootAtPlayer === 'function') shootAtPlayer(scene, enemy);
        enemy.lastShot = time;
    }
}

const interiorBehaviorDispatch = {
    'mothership_grunt': updateMothershipGrunt,
    'hover_mine': updateHoverMine,
    'laser_turret': updateLaserTurret,
};

if (typeof module !== 'undefined') {
    module.exports = { updateInteriorHangarBayBehaviors };
}
