const test = require('node:test');
const assert = require('node:assert');

const { getClusterTargets } = require('../js/entities/player/playerWeapons');

test('getClusterTargets ignores null/inactive entries and returns nearest active targets', () => {
    global.Phaser = {
        Math: {
            Distance: {
                Between: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1)
            }
        }
    };

    const scene = {
        enemies: {
            children: {
                entries: [
                    null,
                    { active: false, x: 5, y: 5 },
                    { active: true, x: 100, y: 0 },
                    undefined
                ]
            }
        },
        bosses: {
            children: {
                entries: [{ active: true, x: 40, y: 0 }]
            }
        },
        garrisonDefenders: null,
        battleships: null,
        assaultTargets: null
    };

    const targets = getClusterTargets(scene, 0, 0, 2);
    assert.strictEqual(targets.length, 2);
    assert.strictEqual(targets[0].x, 40);
    assert.strictEqual(targets[1].x, 100);

    delete global.Phaser;
});
