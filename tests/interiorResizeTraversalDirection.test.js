const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('rebuildInteriorPlatformsOnResize preserves rtl traversal direction', () => {
    const source = fs.readFileSync(
        path.join(__dirname, '../js/entities/player/buildInteriorPlatforms.js'),
        'utf8'
    );
    const context = {
        console,
        Math,
        CONFIG: { backgroundSeed: 777 }
    };
    vm.createContext(context);
    vm.runInContext(source, context);

    let capturedTemplate = null;
    context.buildInteriorPlatforms = (_scene, _seed, sectionTemplate) => {
        capturedTemplate = sectionTemplate;
    };

    const scene = {
        interiorPlatformsActive: true,
        interiorPlatformSeed: 123,
        interiorSectionTemplate: 'shield_control',
        interiorTraversalDirection: 'rtl'
    };

    context.rebuildInteriorPlatformsOnResize(scene);

    assert.deepEqual(capturedTemplate, {
        id: 'shield_control',
        traversalDirection: 'rtl'
    });
});
