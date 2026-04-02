const test = require('node:test');
const assert = require('node:assert');

const { updateProjectiles } = require('../js/entities/player/playerWeapons');

test('updateProjectiles does not throw when playerState is unavailable', () => {
    global.CONFIG = { worldHeight: 600, worldWidth: 1200 };
    global.wrapWorldBounds = () => {};

    const scene = {
        player: { x: 100, y: 100, active: true },
        time: { now: 0 },
        enemyProjectiles: {
            children: {
                entries: [{
                    active: true,
                    x: 200,
                    y: 120,
                    body: { velocity: { x: 100, y: 0 } },
                    setVelocity: () => {},
                    destroy: () => {}
                }]
            }
        }
    };

    delete global.playerState;

    assert.doesNotThrow(() => updateProjectiles(scene));

    delete global.CONFIG;
    delete global.wrapWorldBounds;
});
