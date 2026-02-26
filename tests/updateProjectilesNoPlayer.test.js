const test = require('node:test');
const assert = require('node:assert');

const { updateProjectiles } = require('../js/entities/player/playerWeapons');

test('updateProjectiles still updates enemy projectiles when player is unavailable', () => {
    global.wrapWorldBounds = () => {};
    global.playerState = { powerUps: { timeSlow: 1 } };
    global.CONFIG = { worldWidth: 2000, worldHeight: 1200 };

    const velocityCalls = [];
    const enemyProjectile = {
        active: true,
        x: 10,
        y: 0,
        projectileType: 'normal',
        body: { velocity: { x: 90, y: 30 } },
        setVelocity: (x, y) => velocityCalls.push({ x, y }),
        destroy: () => {}
    };

    const scene = {
        player: null,
        groundLevel: 9999,
        projectiles: { children: { entries: [] } },
        enemyProjectiles: { children: { entries: [enemyProjectile] } }
    };

    updateProjectiles(scene);

    assert.strictEqual(velocityCalls.length, 1, 'enemy projectile should still be slowed when player is missing');
    assert.deepStrictEqual(velocityCalls[0], { x: 27, y: 9 });

    delete global.wrapWorldBounds;
    delete global.playerState;
    delete global.CONFIG;
});
