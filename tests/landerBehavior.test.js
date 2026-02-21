const test = require('node:test');
const assert = require('node:assert');

const { updateLanderBehavior } = require('../js/entities/enemyBehaviors');
const { destroyEnemy } = require('../js/entities/enemyCore');

test('lander releases target humans that are no longer active', () => {
    const targetHuman = { active: false, isAbducted: true, abductor: null };
    const enemy = { targetHuman, abductedHuman: null };

    updateLanderBehavior({}, enemy, 0);

    assert.strictEqual(enemy.targetHuman, null);
    assert.strictEqual(targetHuman.isAbducted, false);
    assert.strictEqual(targetHuman.abductor, null);
});

test('destroying a lander frees its targeted human if not yet abducted', () => {
    global.createExplosion = () => {};
    global.createEnhancedDeathEffect = () => {};
    global.spawnPowerUp = () => {};
    global.spawnEnemy = () => {};
    global.getMissionScaledReward = (v) => v;
    global.getEnemyScore = () => 100;
    global.completeWave = () => {};
    global.CONFIG = { width: 800, height: 600 };
    global.gameState = { mode: 'classic', wave: 1, killsThisWave: 0, enemiesToKillThisWave: 1, rewardMultiplier: 1, score: 0 };
    global.FG_DEPTH_BASE = 0;
    global.Phaser = { Math: { Between: () => 0 } };

    const targetHuman = { active: true, isAbducted: true, abductor: null };
    const enemy = {
        enemyType: 'lander',
        targetHuman,
        abductedHuman: null,
        /**
         * Handles the destroy routine and encapsulates its core gameplay logic.
         * Parameters: none.
         * Returns: value defined by the surrounding game flow.
         */
        destroy() { this.destroyed = true; }
    };
    targetHuman.abductor = enemy;

    const makeTextStub = () => ({
        y: 0,
        /**
         * Handles the setOrigin routine and encapsulates its core gameplay logic.
         * Parameters: none.
         * Returns: value defined by the surrounding game flow.
         */
        setOrigin() { return this; },
        /**
         * Handles the setDepth routine and encapsulates its core gameplay logic.
         * Parameters: none.
         * Returns: value defined by the surrounding game flow.
         */
        setDepth() { return this; },
        /**
         * Handles the setScrollFactor routine and encapsulates its core gameplay logic.
         * Parameters: none.
         * Returns: value defined by the surrounding game flow.
         */
        setScrollFactor() { return this; },
        /**
         * Handles the destroy routine and encapsulates its core gameplay logic.
         * Parameters: none.
         * Returns: value defined by the surrounding game flow.
         */
        destroy() { this.destroyed = true; }
    });
    const scene = {
        enemies: {
            children: { entries: [enemy] },
            countActive: () => 0
        },
        particleManager: null,
        audioManager: null,
        add: { text: makeTextStub },
        tweens: { add: ({ onComplete }) => { if (onComplete) onComplete(); } },
        time: { delayedCall: () => {} }
    };

    destroyEnemy(scene, enemy);

    assert.strictEqual(targetHuman.isAbducted, false);
    assert.strictEqual(targetHuman.abductor, null);
    assert.strictEqual(enemy.targetHuman, null);

    delete global.createExplosion;
    delete global.createEnhancedDeathEffect;
    delete global.spawnPowerUp;
    delete global.spawnEnemy;
    delete global.getMissionScaledReward;
    delete global.getEnemyScore;
    delete global.completeWave;
    delete global.CONFIG;
    delete global.gameState;
    delete global.FG_DEPTH_BASE;
    delete global.Phaser;
});
