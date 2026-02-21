const test = require('node:test');
const assert = require('node:assert');

const { getHyperspaceDestination } = require('../js/entities/player/playerSupport');

test('hyperspace destination remains above terrain safety buffer', () => {
    global.CONFIG = { worldWidth: 1000, worldHeight: 800 };

    const originalRandom = Math.random;
    const rolls = [0.5, 1];
    Math.random = () => rolls.shift();

    try {
        const scene = { groundLevel: 500 };
        const destination = getHyperspaceDestination(scene);

        const terrainVariation = Math.sin(destination.x / 200) * 30;
        const groundY = scene.groundLevel - terrainVariation;

        assert.ok(destination.y <= groundY - 120, 'destination should stay above ground safety buffer');
        assert.ok(destination.y >= 80, 'destination should stay within safe top bound');
    } finally {
        Math.random = originalRandom;
        delete global.CONFIG;
    }
});

test('hyperspace destination clamps to safe top when terrain is too high', () => {
    global.CONFIG = { worldWidth: 1000, worldHeight: 800 };

    const originalRandom = Math.random;
    const rolls = [0.1, 0.8];
    Math.random = () => rolls.shift();

    try {
        const scene = { groundLevel: 150 };
        const destination = getHyperspaceDestination(scene);

        assert.strictEqual(destination.y, 80);
    } finally {
        Math.random = originalRandom;
        delete global.CONFIG;
    }
});
