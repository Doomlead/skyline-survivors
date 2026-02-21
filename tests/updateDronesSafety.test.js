const test = require('node:test');
const assert = require('node:assert');

const { updateDrones } = require('../js/entities/player/playerSupport');

test('updateDrones safely handles missing drone group entries', () => {
    global.getActivePlayer = () => ({ x: 100, y: 100, active: true });

    assert.doesNotThrow(() => updateDrones({ drones: {} }, 1000));
    assert.doesNotThrow(() => updateDrones({ drones: { children: {} } }, 1000));
    assert.doesNotThrow(() => updateDrones({ drones: { children: { entries: [] } } }, 1000));

    delete global.getActivePlayer;
});

test('updateDrones skips null/inactive drones and updates active drones', () => {
    global.getActivePlayer = () => ({ x: 200, y: 150, active: true });

    const inactiveDrone = { active: false, x: 0, y: 0 };
    const activeDrone = { active: true, x: 0, y: 0 };
    const scene = {
        drones: {
            children: {
                entries: [null, inactiveDrone, activeDrone]
            }
        }
    };

    updateDrones(scene, 500);

    assert.strictEqual(inactiveDrone.x, 0);
    assert.strictEqual(inactiveDrone.y, 0);
    assert.notStrictEqual(activeDrone.x, 0);
    assert.notStrictEqual(activeDrone.y, 0);

    delete global.getActivePlayer;
});
