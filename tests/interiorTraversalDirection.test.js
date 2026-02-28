const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sourcePath = path.join(__dirname, '../js/entities/player/buildInteriorPlatforms.js');
const source = fs.readFileSync(sourcePath, 'utf8');

function loadTraversalHelpers() {
    const context = {
        CONFIG: { worldWidth: 2400 },
        Phaser: {
            Math: {
                Clamp: (value, min, max) => Math.max(min, Math.min(max, value))
            }
        },
        console
    };
    vm.createContext(context);
    vm.runInContext(source, context);
    return context;
}

test('resolveInteriorTraversalDirection defaults to ltr and accepts rtl', () => {
    const ctx = loadTraversalHelpers();

    assert.strictEqual(ctx.resolveInteriorTraversalDirection(null), 'ltr');
    assert.strictEqual(ctx.resolveInteriorTraversalDirection({ id: 'security_hub' }), 'ltr');
    assert.strictEqual(ctx.resolveInteriorTraversalDirection({ traversalDirection: 'rtl' }), 'rtl');
    assert.strictEqual(ctx.resolveInteriorTraversalDirection({ traversalDirection: 'bogus' }), 'ltr');
});

test('applyInteriorTraversalToRatio mirrors ratios for rtl traversal', () => {
    const ctx = loadTraversalHelpers();

    assert.strictEqual(ctx.applyInteriorTraversalToRatio(0.2, 'ltr'), 0.2);
    assert.strictEqual(ctx.applyInteriorTraversalToRatio(0.2, 'rtl'), 0.8);
    assert.strictEqual(ctx.applyInteriorTraversalToRatio(2, 'rtl'), 0);
    assert.strictEqual(ctx.applyInteriorTraversalToRatio(-2, 'ltr'), 0);
});

test('toInteriorDirectionalX mirrors x positions using scene traversal direction', () => {
    const ctx = loadTraversalHelpers();

    assert.strictEqual(ctx.toInteriorDirectionalX({ interiorTraversalDirection: 'ltr' }, 300), 300);
    assert.strictEqual(ctx.toInteriorDirectionalX({ interiorTraversalDirection: 'rtl' }, 300), 2100);
    assert.strictEqual(ctx.toInteriorDirectionalX({ interiorTraversalDirection: 'rtl' }, 5000), 0);
});
