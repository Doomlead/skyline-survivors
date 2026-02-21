const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sourcePath = path.join(__dirname, '../js/entities/player/playerControls.js');
const source = fs.readFileSync(sourcePath, 'utf8');

function loadClampHelper() {
    const context = {
        CONFIG: { worldHeight: 900 },
        console
    };
    vm.createContext(context);
    vm.runInContext(source, context);
    return context.getInteriorGroundClampY;
}

test('getInteriorGroundClampY aligns pilot to interior ground top using body half-height', () => {
    const getInteriorGroundClampY = loadClampHelper();
    const scene = { groundLevel: 700 };
    const pilot = { body: { halfHeight: 9 } };

    assert.strictEqual(getInteriorGroundClampY(scene, pilot), 681);
});

test('getInteriorGroundClampY falls back to default half-height when body dimensions are absent', () => {
    const getInteriorGroundClampY = loadClampHelper();
    const scene = { groundLevel: 700 };

    assert.strictEqual(getInteriorGroundClampY(scene, {}), 681);
});
