const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('initInteriorMission keeps window.interiorState in sync with latest mission state', () => {
    const source = fs.readFileSync(path.join(__dirname, '../js/interiors/sectionManager.js'), 'utf8');

    const context = {
        console,
        Math,
        window: {},
        buildInteriorPlatformsFromLayout: () => {},
        spawnSectionEnemies: () => {},
        updateInteriorUI: () => {},
        setupReinforcements: () => {},
        updateInteriorHazards: () => {},
        completeAssaultMission: () => {},
        completeMothershipMission: () => {},
        clearInteriorHazards: () => {},
        spawnInteriorEnemy: () => {},
        FG_DEPTH_BASE: 10
    };

    vm.createContext(context);
    vm.runInContext(source, context);

    const scene = {
        add: {
            rectangle: () => ({
                setDepth: () => {},
                destroy: () => {},
                setAlpha: () => {}
            }),
            text: () => ({
                setOrigin: () => ({ setDepth: () => ({}) }),
                destroy: () => {},
                setText: () => {},
                setColor: () => {}
            })
        },
        physics: {
            add: {
                existing: () => {},
                collider: () => ({ destroy: () => {} })
            }
        },
        tweens: {
            add: () => {}
        },
        pilot: {
            setPosition: () => {}
        }
    };

    const started = context.initInteriorMission(scene, 'assault');

    assert.strictEqual(started, true);
    assert.strictEqual(context.window.interiorState.missionType, 'assault');
    assert.strictEqual(context.window.interiorState.sections.length, 3);
});
