const test = require('node:test');
const assert = require('node:assert');

const { updateEnemies } = require('../js/entities/enemyBehaviors');

test('updateEnemies does not throw when global playerState is unavailable', () => {
    const previousConfig = global.CONFIG;
    const previousWrap = global.wrapWorldBounds;
    const previousPlayerState = global.playerState;

    delete global.playerState;
    global.CONFIG = { worldHeight: 600, width: 800 };
    global.wrapWorldBounds = () => {};

    const enemy = {
        x: 100,
        y: 200,
        enemyType: 'drone',
        active: true,
        patrolAngle: 0,
        lastShot: 0,
        body: { velocity: { x: 0, y: 0 } },
        setVelocity: () => {},
        setVelocityY: () => {}
    };

    const scene = {
        groundLevel: 520,
        enemies: {
            children: {
                entries: [enemy]
            }
        }
    };

    assert.doesNotThrow(() => updateEnemies(scene, 0, 16));

    global.CONFIG = previousConfig;
    global.wrapWorldBounds = previousWrap;
    if (typeof previousPlayerState === 'undefined') {
        delete global.playerState;
    } else {
        global.playerState = previousPlayerState;
    }
});
