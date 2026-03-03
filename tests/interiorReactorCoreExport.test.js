const test = require('node:test');
const assert = require('node:assert');

const {
    runInteriorReactorCore,
    runInteriorReactorCoreCore
} = require('../js/entities/interior/core/interiorReactorCore.js');

test('interior reactor core exports canonical runInteriorReactorCore function', () => {
    assert.equal(typeof runInteriorReactorCore, 'function');
});

test('legacy runInteriorReactorCoreCore alias remains callable', () => {
    assert.equal(runInteriorReactorCoreCore, runInteriorReactorCore);
});
