const test = require('node:test');
const assert = require('node:assert');

const { updateProjectiles } = require('../js/entities/player/playerWeapons');

test('updateProjectiles still updates enemy projectiles when player projectile entries are unavailable', () => {
    global.wrapWorldBounds = () => {};
    global.playerState = { powerUps: { timeSlow: 1 } };
    global.CONFIG = { worldWidth: 2000, worldHeight: 1200 };

    const velocityCalls = [];
    const enemyProjectile = {
        active: true,
        x: 10,
        y: 0,
        projectileType: 'normal',
        body: { velocity: { x: 100, y: 50 } },
        setVelocity: (x, y) => velocityCalls.push({ x, y }),
        destroy: () => {}
    };

    const scene = {
        player: { active: true },
        groundLevel: 9999,
        projectiles: { children: null },
        enemyProjectiles: { children: { entries: [enemyProjectile] } },
        enemies: { children: { entries: [] } },
        garrisonDefenders: { children: { entries: [] } },
        bosses: { children: { entries: [] } },
        battleships: { children: { entries: [] } },
        assaultTargets: { children: { entries: [] } }
    };

    updateProjectiles(scene);

    assert.strictEqual(velocityCalls.length, 1, 'enemy projectile should still be slowed when player group is unavailable');
    assert.deepStrictEqual(velocityCalls[0], { x: 30, y: 15 });

    delete global.wrapWorldBounds;
    delete global.playerState;
    delete global.CONFIG;
});
