const { describe, it, expect } = require('vitest');
const {
    ENEMY_TYPES,
    ENEMY_HP_VALUES,
    ENEMY_SCORE_VALUES
} = require('../js/config/enemyConfig');

describe('enemy configuration completeness', () => {
    it('has hp and score values for every enemy type', () => {
        ENEMY_TYPES.forEach((type) => {
            expect(ENEMY_HP_VALUES[type]).toBeDefined();
            expect(ENEMY_SCORE_VALUES[type]).toBeDefined();
        });
    });
});
