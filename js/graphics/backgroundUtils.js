// Background utility helpers for shared background behaviors
// Provides RNG, wrapping helpers, and noise generation utilities

function createBackgroundRNG(seed) {
    let state = seed >>> 0;
    return function mulberry32() {
        state += 0x6D2B79F5;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function createBackgroundWrapHelpers(config) {
    const wrapOffsets = [0, config.worldWidth, -config.worldWidth];
    const withWrappedX = (x, draw) => {
        for (const offset of wrapOffsets) {
            draw(x + offset);
        }
    };

    return { wrapOffsets, withWrappedX };
}

function generateLoopingNoise(length, step, magnitude, seed) {
    const values = [];
    const numSteps = Math.ceil(length / step);
    for (let i = 0; i <= numSteps; i++) {
        const angle = (i / numSteps) * Math.PI * 2;
        let val = Math.sin(angle + seed) * magnitude;
        val += Math.sin(angle * 2.3 + seed * 1.5) * (magnitude * 0.5);
        val += Math.sin(angle * 4.7 + seed * 2.1) * (magnitude * 0.25);
        if (i === numSteps) val = values[0];
        values.push(val);
    }
    return values;
}
