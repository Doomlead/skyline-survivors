const test = require('node:test');
const assert = require('node:assert');

const { updateRegeneratorBehavior } = require('../js/entities/enemyBehaviors');

test('regenerator heal timer scales with delta and slow effects', () => {
    const enemy = {
        lastHeal: 0,
        lastShot: Infinity,
        patrolAngle: 0,
        setVelocity(x, y) { // Set velocity.
            this.velocity = { x, y };
        }
    };

    const scene = {};

    updateRegeneratorBehavior(scene, enemy, 0, 500, 1);
    assert.strictEqual(enemy.lastHeal, 500);

    updateRegeneratorBehavior(scene, enemy, 0, 500, 0.3);
    assert.strictEqual(enemy.lastHeal, 650);
});
