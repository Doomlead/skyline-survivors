const test = require('node:test');
const assert = require('node:assert');

const { useSmartBomb } = require('../js/entities/player/playerSupport');

test('smart bomb clears active garrison defenders', () => {
    global.gameState = { smartBombs: 1 };
    global.createExplosion = () => {};
    global.destroyEnemy = () => {};

    const destroyedDefenders = [];
    global.destroyGarrisonDefender = (_scene, defender) => {
        destroyedDefenders.push(defender);
    };
    global.isFlashReductionEnabled = () => false;
    global.CONFIG = { width: 800, height: 600 };
    global.FG_DEPTH_BASE = 0;

    const scene = {
        enemies: { children: { entries: [] } },
        garrisonDefenders: {
            children: {
                entries: [
                    { active: true, x: 10, y: 20, destroy: () => {} },
                    { active: false, x: 30, y: 40, destroy: () => {} }
                ]
            }
        },
        enemyProjectiles: { clear: () => {} },
        audioManager: { playSound: () => {} },
        cameras: { main: { scrollX: 0 } },
        add: {},
        tweens: {
            add: ({ onComplete }) => {
                if (onComplete) onComplete();
            }
        }
    };

    // supply chainable rectangle object used by useSmartBomb tween
    scene.add.rectangle = () => {
        const rect = {
            setScrollFactor: () => rect,
            setDepth: () => rect,
            destroy: () => {}
        };
        return rect;
    };

    useSmartBomb(scene);

    assert.strictEqual(destroyedDefenders.length, 1);
    assert.strictEqual(gameState.smartBombs, 0);

    delete global.gameState;
    delete global.createExplosion;
    delete global.destroyEnemy;
    delete global.destroyGarrisonDefender;
    delete global.isFlashReductionEnabled;
    delete global.CONFIG;
    delete global.FG_DEPTH_BASE;
});

test('smart bomb still clears enemies when enemyProjectiles group is missing', () => {
    global.gameState = { smartBombs: 1 };
    global.createExplosion = () => {};

    const destroyedEnemies = [];
    global.destroyEnemy = (_scene, enemy) => {
        destroyedEnemies.push(enemy);
    };
    global.isFlashReductionEnabled = () => false;
    global.CONFIG = { width: 800, height: 600 };
    global.FG_DEPTH_BASE = 0;

    const scene = {
        enemies: {
            children: {
                entries: [
                    { active: true, x: 100, y: 120 },
                    { active: false, x: 140, y: 160 }
                ]
            }
        },
        garrisonDefenders: null,
        enemyProjectiles: null,
        audioManager: { playSound: () => {} },
        cameras: { main: { scrollX: 0 } },
        add: {},
        tweens: {
            add: ({ onComplete }) => {
                if (onComplete) onComplete();
            }
        }
    };

    scene.add.rectangle = () => {
        const rect = {
            setScrollFactor: () => rect,
            setDepth: () => rect,
            destroy: () => {}
        };
        return rect;
    };

    useSmartBomb(scene);

    assert.strictEqual(destroyedEnemies.length, 1);
    assert.strictEqual(gameState.smartBombs, 0);

    delete global.gameState;
    delete global.createExplosion;
    delete global.destroyEnemy;
    delete global.isFlashReductionEnabled;
    delete global.CONFIG;
    delete global.FG_DEPTH_BASE;
});


test('smart bomb flash overlay remains centered on screen when camera is scrolled', () => {
    global.gameState = { smartBombs: 1 };
    global.createExplosion = () => {};
    global.destroyEnemy = () => {};
    global.isFlashReductionEnabled = () => false;
    global.CONFIG = { width: 800, height: 600 };
    global.FG_DEPTH_BASE = 0;

    let flashX;
    const scene = {
        enemies: { children: { entries: [] } },
        garrisonDefenders: null,
        enemyProjectiles: null,
        audioManager: { playSound: () => {} },
        cameras: { main: { scrollX: 320 } },
        add: {},
        tweens: {
            add: ({ onComplete }) => {
                if (onComplete) onComplete();
            }
        }
    };

    scene.add.rectangle = (x) => {
        flashX = x;
        const rect = {
            setScrollFactor: () => rect,
            setDepth: () => rect,
            destroy: () => {}
        };
        return rect;
    };

    useSmartBomb(scene);

    assert.strictEqual(flashX, 400);

    delete global.gameState;
    delete global.createExplosion;
    delete global.destroyEnemy;
    delete global.isFlashReductionEnabled;
    delete global.CONFIG;
    delete global.FG_DEPTH_BASE;
});


test('smart bomb still clears garrison defenders when enemies group is missing', () => {
    global.gameState = { smartBombs: 1 };
    global.createExplosion = () => {};
    global.destroyEnemy = () => {};
    global.isFlashReductionEnabled = () => false;
    global.CONFIG = { width: 800, height: 600 };
    global.FG_DEPTH_BASE = 0;

    const destroyedDefenders = [];
    global.destroyGarrisonDefender = (_scene, defender) => {
        destroyedDefenders.push(defender);
    };

    let clearedProjectiles = false;
    const scene = {
        enemies: null,
        garrisonDefenders: {
            children: {
                entries: [
                    { active: true, x: 15, y: 25, destroy: () => {} },
                    { active: false, x: 35, y: 45, destroy: () => {} }
                ]
            }
        },
        enemyProjectiles: { clear: () => { clearedProjectiles = true; } },
        audioManager: { playSound: () => {} },
        cameras: { main: { scrollX: 0 } },
        add: {},
        tweens: {
            add: ({ onComplete }) => {
                if (onComplete) onComplete();
            }
        }
    };

    scene.add.rectangle = () => {
        const rect = {
            setScrollFactor: () => rect,
            setDepth: () => rect,
            destroy: () => {}
        };
        return rect;
    };

    useSmartBomb(scene);

    assert.strictEqual(destroyedDefenders.length, 1);
    assert.strictEqual(clearedProjectiles, true);
    assert.strictEqual(gameState.smartBombs, 0);

    delete global.gameState;
    delete global.createExplosion;
    delete global.destroyEnemy;
    delete global.destroyGarrisonDefender;
    delete global.isFlashReductionEnabled;
    delete global.CONFIG;
    delete global.FG_DEPTH_BASE;
});
