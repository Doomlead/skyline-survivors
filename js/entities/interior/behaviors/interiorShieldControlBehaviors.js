// ------------------------
// Interior Behaviors: ShieldControl
// ------------------------
const INTERIOR_SHIELDCONTROL_ENEMIES = ['shield_operator', 'assault_drone', 'sniper_nest_unit'];
// Runs behavior updates for all enemies in this interior section.
function updateInteriorShieldControlBehaviors(scene, time, delta) {
    if (!scene?.enemies) return;
    const timeSlowMultiplier = playerState?.powerUps?.timeSlow > 0 ? 0.3 : 1.0;
    const entries = scene.enemies.children?.entries || [];
    entries.forEach(enemy => {
        if (!enemy || !enemy.active) return;
        if (enemy.interiorSection !== 'shield_control') return;
        const fn = interiorBehaviorDispatch[enemy.enemyType];
        if (typeof fn === 'function') fn(scene, enemy, time, delta, timeSlowMultiplier);
    });
}

function updateShieldOperator(scene, enemy, time, delta, timeSlowMultiplier) {
    if (typeof enemy.patrolAngle !== 'number') enemy.patrolAngle = Math.random() * Math.PI * 2;
    enemy.patrolAngle += 0.015 * timeSlowMultiplier;
    enemy.setVelocity(Math.cos(enemy.patrolAngle) * 110 * timeSlowMultiplier, Math.sin(enemy.patrolAngle) * 80 * timeSlowMultiplier);
    if (time > (enemy.lastShot || 0) + 1700 && Math.random() < 0.025 && typeof shootAtPlayer === 'function') {
        shootAtPlayer(scene, enemy);
        enemy.lastShot = time;
    }
}

function updateAssaultDrone(scene, enemy, time, delta, timeSlowMultiplier) {
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

function updateSniperNestUnit(scene, enemy, time, delta, timeSlowMultiplier) {
    enemy.setVelocity(0, 0);
    if (time > (enemy.lastShot || 0) + 1200) {
        if (typeof shootAtPlayer === 'function') shootAtPlayer(scene, enemy);
        enemy.lastShot = time;
    }
}

const interiorBehaviorDispatch = {
    'shield_operator': updateShieldOperator,
    'assault_drone': updateAssaultDrone,
    'sniper_nest_unit': updateSniperNestUnit,
};

if (typeof module !== 'undefined') {
    module.exports = { updateInteriorShieldControlBehaviors };
}
