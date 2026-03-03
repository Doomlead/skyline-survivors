// ------------------------
// Interior Behaviors: CentralIntelligence
// ------------------------
const INTERIOR_CENTRALINTELLIGENCE_ENEMIES = ['the_overseer', 'assault_drone'];

function updateInteriorCentralIntelligenceBehaviors(scene, time, delta) {
    if (!scene?.enemies) return;
    const timeSlowMultiplier = playerState?.powerUps?.timeSlow > 0 ? 0.3 : 1.0;
    const entries = scene.enemies.children?.entries || [];
    entries.forEach(enemy => {
        if (!enemy || !enemy.active) return;
        if (enemy.interiorSection !== 'central_intelligence_core') return;
        const fn = interiorCentralIntelligenceDispatch[enemy.enemyType];
        if (typeof fn === 'function') fn(scene, enemy, time, delta, timeSlowMultiplier);
    });
}

function updateCentralIntelligenceTheOverseer(scene, enemy, time, delta, timeSlowMultiplier) {
    const player = typeof getActivePlayer === 'function' ? getActivePlayer(scene) : null;
    if (!player) return;
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    enemy.setVelocity(Math.cos(angle) * 95 * timeSlowMultiplier, Math.sin(angle) * 95 * timeSlowMultiplier);
    if (time > (enemy.lastShot || 0) + 1500 && typeof shootAtPlayer === 'function') {
        shootAtPlayer(scene, enemy);
        enemy.lastShot = time;
    }
}

function updateCentralIntelligenceAssaultDrone(scene, enemy, time, delta, timeSlowMultiplier) {
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

const interiorCentralIntelligenceDispatch = {
    'the_overseer': updateCentralIntelligenceTheOverseer,
    'assault_drone': updateCentralIntelligenceAssaultDrone,
};

if (typeof module !== 'undefined') {
    module.exports = { updateInteriorCentralIntelligenceBehaviors };
}