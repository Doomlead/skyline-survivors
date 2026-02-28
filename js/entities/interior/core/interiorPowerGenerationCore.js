// ------------------------
// Interior Core: PowerGeneration
// ------------------------
const INTERIOR_POWERGENERATION_SECTION_ID = 'power_generation';
const INTERIOR_POWERGENERATION_ENEMY_TYPES = ['heavy_mech', 'electro_shocker', 'swarm_bot'];

// Spawns one interior section enemy and tags it for section-specific behavior updates.
function spawnInteriorPowerGenerationEnemy(scene, type, x, y, countsTowardsWave = false) {
    if (!INTERIOR_POWERGENERATION_ENEMY_TYPES.includes(type)) return null;
    if (typeof spawnEnemy !== 'function') return null;
    const enemy = spawnEnemy(scene, type, x, y, countsTowardsWave);
    if (!enemy) return null;
    enemy.interiorSection = INTERIOR_POWERGENERATION_SECTION_ID;
    enemy.interiorEnemy = true;
    enemy.seed = Math.random() * Math.PI * 2;
    return enemy;
}

// Spawns a section-sized wave around the current camera bounds.
function spawnInteriorPowerGenerationWave(scene, count = 3) {
    const camX = scene?.cameras?.main ? scene.cameras.main.scrollX : 0;
    const minX = camX + CONFIG.width * 0.2;
    const maxX = camX + CONFIG.width * 0.8;
    for (let i = 0; i < count; i++) {
        const type = Phaser.Utils.Array.GetRandom(INTERIOR_POWERGENERATION_ENEMY_TYPES);
        const x = Phaser.Math.Clamp(Phaser.Math.Between(minX, maxX), 40, Math.max(40, CONFIG.worldWidth - 40));
        const y = Phaser.Math.Between(CONFIG.height * 0.2, CONFIG.height * 0.7);
        spawnInteriorPowerGenerationEnemy(scene, type, x, y, false);
    }
}

// Delegates runtime updates for enemies tagged to this interior section.
function runInteriorPowerGenerationCore(scene, time, delta) {
    if (typeof updateInteriorPowerGenerationBehaviors === 'function') {
        updateInteriorPowerGenerationBehaviors(scene, time, delta);
    }
}

if (typeof module !== 'undefined') {
    module.exports = { spawnInteriorPowerGenerationEnemy, spawnInteriorPowerGenerationWave, runInteriorPowerGenerationCore };
}
