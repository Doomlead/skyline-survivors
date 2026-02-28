// ------------------------
// Interior Behaviors: PowerGeneration
// ------------------------
const INTERIOR_POWERGENERATION_ENEMIES = ['heavy_mech', 'electro_shocker', 'swarm_bot'];
// Runs behavior updates for all enemies in this interior section.
function updateInteriorPowerGenerationBehaviors(scene, time, delta) {
    if (!scene?.enemies) return;
    const timeSlowMultiplier = playerState?.powerUps?.timeSlow > 0 ? 0.3 : 1.0;
    const entries = scene.enemies.children?.entries || [];
    entries.forEach(enemy => {
        if (!enemy || !enemy.active) return;
        if (enemy.interiorSection !== 'power_generation') return;
        const fn = interiorBehaviorDispatch[enemy.enemyType];
        if (typeof fn === 'function') fn(scene, enemy, time, delta, timeSlowMultiplier);
    });
}

function updateHeavyMech(scene, enemy, time, delta, timeSlowMultiplier) {
    const player = typeof getActivePlayer === 'function' ? getActivePlayer(scene) : null;
    if (!player) return;
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    enemy.setVelocity(Math.cos(angle) * 95 * timeSlowMultiplier, Math.sin(angle) * 95 * timeSlowMultiplier);
    if (time > (enemy.lastShot || 0) + 1500 && typeof shootAtPlayer === 'function') {
        shootAtPlayer(scene, enemy);
        enemy.lastShot = time;
    }
}

function updateElectroShocker(scene, enemy, time, delta, timeSlowMultiplier) {
    if (typeof enemy.patrolAngle !== 'number') enemy.patrolAngle = Math.random() * Math.PI * 2;
    enemy.patrolAngle += 0.015 * timeSlowMultiplier;
    enemy.setVelocity(Math.cos(enemy.patrolAngle) * 110 * timeSlowMultiplier, Math.sin(enemy.patrolAngle) * 80 * timeSlowMultiplier);
    if (time > (enemy.lastShot || 0) + 1700 && Math.random() < 0.025 && typeof shootAtPlayer === 'function') {
        shootAtPlayer(scene, enemy);
        enemy.lastShot = time;
    }
}

function updateSwarmBot(scene, enemy, time, delta, timeSlowMultiplier) {
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

const interiorBehaviorDispatch = {
    'heavy_mech': updateHeavyMech,
    'electro_shocker': updateElectroShocker,
    'swarm_bot': updateSwarmBot,
};

if (typeof module !== 'undefined') {
    module.exports = { updateInteriorPowerGenerationBehaviors };
}
