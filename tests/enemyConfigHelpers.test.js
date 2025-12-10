const test = require('node:test');
const assert = require('node:assert');

const {
    getEnemyHP,
    getEnemyScore,
    getEnemyScale
} = require('../js/config/enemyConfig');

test('enemy config helpers are exported and return expected values', () => {
    assert.strictEqual(getEnemyHP('mutant'), 2);
    assert.strictEqual(getEnemyScore('pod'), 250);
    assert.strictEqual(getEnemyScale('sniper'), 2.2);

    // Unknown types should fall back to defaults
    assert.strictEqual(getEnemyHP('unknown-type'), 1);
    assert.strictEqual(getEnemyScore('unknown-type'), 100);
    assert.strictEqual(getEnemyScale('unknown-type'), 2.0);
});
