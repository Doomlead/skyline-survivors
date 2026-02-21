const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sourcePath = path.join(__dirname, '../js/entities/player/buildInteriorPlatforms.js');
const source = fs.readFileSync(sourcePath, 'utf8');

function loadGetInteriorAnchorY(worldWidth) {
    const context = {
        CONFIG: { worldWidth },
        console
    };
    vm.createContext(context);
    vm.runInContext(source, context);
    return context.getInteriorAnchorY;
}

test('getInteriorAnchorY prefers wrapped-nearest platform anchor near world edge', () => {
    const getInteriorAnchorY = loadGetInteriorAnchorY(1000);

    const scene = {
        physics: { world: { bounds: { width: 1000 } } },
        interiorPlatformAnchors: [
            { x: 100, y: 210 },
            { x: 980, y: 190 }
        ]
    };

    const y = getInteriorAnchorY(scene, 5, 170, 20);

    assert.strictEqual(y, 170);
});

test('getInteriorAnchorY falls back when no anchors are present', () => {
    const getInteriorAnchorY = loadGetInteriorAnchorY(1000);
    const y = getInteriorAnchorY({ interiorPlatformAnchors: [] }, 100, 321, 20);
    assert.strictEqual(y, 321);
});
