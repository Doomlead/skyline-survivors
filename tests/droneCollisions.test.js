const test = require('node:test');
const assert = require('node:assert');

const { droneHitEnemy } = require('../js/entities/player/playerCollisions');

test('droneHitEnemy destroys active enemy and consumes one drone charge', () => {
    let explosionCalls = 0;
    let destroyEnemyCalls = 0;
    global.playerState = { powerUps: { drone: 2 } };
    global.createExplosion = () => {
        explosionCalls += 1;
    };
    global.destroyEnemy = () => {
        destroyEnemyCalls += 1;
    };

    const drone = {
        active: true,
        x: 10,
        y: 20,
        destroyCalled: false,
        destroy() {
            this.destroyCalled = true;
            this.active = false;
        }
    };
    const enemy = { active: true };

    droneHitEnemy.call({}, drone, enemy);

    assert.strictEqual(explosionCalls, 1);
    assert.strictEqual(destroyEnemyCalls, 1);
    assert.strictEqual(drone.destroyCalled, true);
    assert.strictEqual(global.playerState.powerUps.drone, 1);

    delete global.playerState;
    delete global.createExplosion;
    delete global.destroyEnemy;
});
