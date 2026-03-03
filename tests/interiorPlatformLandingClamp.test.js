const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sourcePath = path.join(__dirname, '../js/entities/player/playerControls.js');
const source = fs.readFileSync(sourcePath, 'utf8');

function loadLandingClampHelper() {
    const context = {
        CONFIG: { worldHeight: 900 },
        console
    };
    vm.createContext(context);
    vm.runInContext(source, context);
    return context.clampPilotToInteriorPlatforms;
}

test('clampPilotToInteriorPlatforms lands pilot on top when descending through a platform', () => {
    const clampPilotToInteriorPlatforms = loadLandingClampHelper();
    const pilot = {
        x: 400,
        y: 360,
        body: { halfHeight: 9 }
    };
    const scene = {
        platforms: {
            children: {
                entries: [
                    { active: true, x: 400, y: 350, width: 200, height: 12 }
                ]
            }
        }
    };

    const landed = clampPilotToInteriorPlatforms(scene, pilot, 330);

    assert.strictEqual(landed, true);
    assert.strictEqual(pilot.y, 335, 'pilot center Y should be clamped so feet rest on platform top');
});

test('clampPilotToInteriorPlatforms ignores platforms when pilot is outside horizontal span', () => {
    const clampPilotToInteriorPlatforms = loadLandingClampHelper();
    const pilot = {
        x: 700,
        y: 360,
        body: { halfHeight: 9 }
    };
    const scene = {
        platforms: {
            children: {
                entries: [
                    { active: true, x: 400, y: 350, width: 200, height: 12 }
                ]
            }
        }
    };

    const landed = clampPilotToInteriorPlatforms(scene, pilot, 330);

    assert.strictEqual(landed, false);
    assert.strictEqual(pilot.y, 360);
});
