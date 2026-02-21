const test = require('node:test');
const assert = require('node:assert');

const { useHyperspace } = require('../js/entities/player/playerSupport');

test('useHyperspace falls back to createExplosion when particleManager lacks blackHoleExplosion', () => {
    global.CONFIG = { worldWidth: 1000, worldHeight: 800 };
    global.getActivePlayer = () => ({ x: 0, y: 0, active: true });

    let explosionCalls = 0;
    global.createExplosion = () => {
        explosionCalls += 1;
    };

    const scene = {
        groundLevel: 500,
        particleManager: {},
        audioManager: { playSound: () => {} }
    };

    assert.doesNotThrow(() => useHyperspace(scene));
    assert.strictEqual(explosionCalls, 1);

    delete global.CONFIG;
    delete global.getActivePlayer;
    delete global.createExplosion;
});
