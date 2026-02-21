const test = require('node:test');
const assert = require('node:assert');

const { updateDroneBehavior } = require('../js/entities/enemyBehaviors');

test('updateDroneBehavior initializes missing state to avoid NaN velocities', () => {
    const originalRandom = Math.random;
    Math.random = () => 1;

    const enemy = {
        patrolAngle: undefined,
        lastShot: undefined,
        setVelocity: (vx, vy) => {
            enemy.vx = vx;
            enemy.vy = vy;
        }
    };

    assert.doesNotThrow(() => updateDroneBehavior({}, enemy, 1000, 1));
    assert.ok(Number.isFinite(enemy.vx));
    assert.ok(Number.isFinite(enemy.vy));
    assert.strictEqual(typeof enemy.patrolAngle, 'number');
    assert.strictEqual(enemy.lastShot, 0);

    Math.random = originalRandom;
});
