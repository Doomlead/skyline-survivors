const test = require('node:test');
const assert = require('node:assert');

const { ENEMY_TYPES, ENEMY_HP_VALUES, ENEMY_SCORE_VALUES } = require('../js/config/enemyConfig');

test('each enemy type has HP and score values defined', () => {
    ENEMY_TYPES.forEach((type) => {
        assert.ok(
            ENEMY_HP_VALUES[type] !== undefined,
            `Missing HP value for enemy type: ${type}`
        );
        assert.ok(
            ENEMY_SCORE_VALUES[type] !== undefined,
            `Missing score value for enemy type: ${type}`
        );
    });
});
