const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sourcePath = path.join(__dirname, '../js/entities/bosses/mothershipCore.js');
const source = fs.readFileSync(sourcePath, 'utf8');

function loadFireInteriorTurret() {
    const context = {
        CONFIG: { worldWidth: 1000, worldHeight: 600, width: 800, height: 600 },
        FG_DEPTH_BASE: 100,
        Phaser: {
            Math: {
                Angle: {
                    Between: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1)
                }
            },
            Utils: { Array: { GetRandom: (arr) => arr[0] } }
        },
        getActivePlayer: () => ({ x: 100, y: 100, active: true }),
        console,
        Math
    };

    vm.createContext(context);
    vm.runInContext(source, context);
    return context.fireInteriorTurret;
}

test('fireInteriorTurret safely returns when enemyProjectiles group is unavailable', () => {
    const fireInteriorTurret = loadFireInteriorTurret();

    assert.doesNotThrow(() => {
        fireInteriorTurret({}, { active: true, x: 0, y: 0, assaultRole: 'power_conduit' });
    });
});

test('fireInteriorTurret handles projectile entries without physics body', () => {
    const fireInteriorTurret = loadFireInteriorTurret();

    const projectile = {
        active: true,
        setDepth: () => projectile,
        setVelocity: () => projectile,
        setTint: () => projectile,
        destroy: () => {}
    };

    const scene = {
        enemyProjectiles: {
            create: () => projectile
        },
        time: {
            delayedCall: (_delay, cb) => cb()
        }
    };

    assert.doesNotThrow(() => {
        fireInteriorTurret(scene, { active: true, x: 0, y: 0, assaultRole: 'security_node' });
    });
});
