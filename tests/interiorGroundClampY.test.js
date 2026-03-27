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

function loadPlatformSupportResolver() {
    const context = {
        CONFIG: { worldHeight: 900 },
        console
    };
    vm.createContext(context);
    vm.runInContext(source, context);
    return context.resolveInteriorPlatformSupport;
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

test('resolveInteriorPlatformSupport snaps pilot to platform top when descending from above', () => {
    const resolveInteriorPlatformSupport = loadPlatformSupportResolver();
    const pilot = {
        x: 120,
        y: 194,
        body: {
            halfHeight: 9,
            setVelocityY(value) {
                this.velocityY = value;
            }
        }
    };
    const pilotState = { vy: 120, grounded: false };
    const platform = { active: true, x: 120, y: 200, platformType: 'platform', body: { width: 100, height: 12 } };
    const scene = { platforms: { children: { entries: [platform] } } };

    const supported = resolveInteriorPlatformSupport(scene, pilot, pilotState, 180);

    assert.strictEqual(supported, true);
    assert.strictEqual(pilot.y, 185);
    assert.strictEqual(pilotState.vy, 0);
    assert.strictEqual(pilot.body.velocityY, 0);
    assert.strictEqual(pilotState.grounded, true);
});

test('resolveInteriorPlatformSupport allows jump-through from below for one-way platforms', () => {
    const resolveInteriorPlatformSupport = loadPlatformSupportResolver();
    const pilot = {
        x: 120,
        y: 212,
        body: {
            halfHeight: 9,
            setVelocityY(value) {
                this.velocityY = value;
            }
        }
    };
    const pilotState = { vy: 80, grounded: false };
    const platform = { active: true, x: 120, y: 200, platformType: 'platform', body: { width: 100, height: 12 } };
    const scene = { platforms: { children: { entries: [platform] } } };

    const supported = resolveInteriorPlatformSupport(scene, pilot, pilotState, 206);

    assert.strictEqual(supported, false);
    assert.strictEqual(pilot.y, 212);
    assert.strictEqual(pilotState.vy, 80);
    assert.strictEqual(pilotState.grounded, false);
});
