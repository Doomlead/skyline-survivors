const test = require('node:test');
const assert = require('node:assert');

const { updateProjectiles } = require('../js/entities/player/playerWeapons');

test('updateProjectiles safely returns when player projectile entries are unavailable', () => {
    global.playerState = { powerUps: { timeSlow: 0 } };
    global.CONFIG = { worldWidth: 2000, worldHeight: 1200 };

    const scene = {
        player: { active: true },
        projectiles: { children: null },
        enemyProjectiles: { children: { entries: [] } },
        enemies: { children: { entries: [] } },
        garrisonDefenders: { children: { entries: [] } },
        bosses: { children: { entries: [] } },
        battleships: { children: { entries: [] } },
        assaultTargets: { children: { entries: [] } }
    };

    assert.doesNotThrow(() => updateProjectiles(scene));

    delete global.playerState;
    delete global.CONFIG;
});
