const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sourcePath = path.join(__dirname, '../js/entities/player/buildInteriorPlatforms.js');
const source = fs.readFileSync(sourcePath, 'utf8');

function loadCreateInteriorPlatform() {
    const context = {
        FG_DEPTH_BASE: 100,
        CONFIG: {},
        console
    };
    vm.createContext(context);
    vm.runInContext(source, context);
    return context.createInteriorPlatform;
}

function makeStubScene() {
    const visuals = [];
    const scene = {
        textures: { exists: () => true },
        add: {
            rectangle: (x, y, width, height) => ({
                x,
                y,
                width,
                height,
                body: { checkCollision: {} },
                setDepth(depth) { this.depth = depth; return this; },
                setStrokeStyle() { return this; }
            }),
            tileSprite: (x, y, width, height) => {
                const visual = { x, y, width, height, setDepth(depth) { this.depth = depth; return this; } };
                visuals.push(visual);
                return visual;
            }
        },
        physics: {
            add: {
                existing: () => {}
            }
        }
    };
    return { scene, visuals };
}

test('createInteriorPlatform splits very wide ground visuals into segments', () => {
    const createInteriorPlatform = loadCreateInteriorPlatform();
    const { scene, visuals } = makeStubScene();

    const platform = createInteriorPlatform(scene, {
        x: 1000,
        y: 500,
        width: 2400,
        height: 20,
        type: 'ground'
    });

    assert.ok(Array.isArray(platform.visuals));
    assert.strictEqual(platform.visuals.length, 4);
    assert.strictEqual(visuals.length, 4);
});
