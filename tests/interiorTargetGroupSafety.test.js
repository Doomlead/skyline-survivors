const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadFunction(filePath, functionName, globals) {
    const source = fs.readFileSync(filePath, 'utf8');
    const context = { console, Math, ...globals };
    vm.createContext(context);
    vm.runInContext(source, context);
    return context[functionName];
}

test('updateAssaultInterior does not throw when assaultTargets group lacks children entries', () => {
    const updateAssaultInterior = loadFunction(
        path.join(__dirname, '../js/entities/assault/assaultBaseCore.js'),
        'updateAssaultInterior',
        {
            gameState: {
                assaultObjective: {
                    interiorPhase: true,
                    interiorStarted: true,
                    coreChamberOpen: false,
                    powerConduitsTotal: 2,
                    powerConduitsRemaining: 1,
                    securityNodesTotal: 2,
                    securityNodesRemaining: 1,
                    interiorReinforcementTimer: 0
                },
                rebuildObjective: { active: false }
            },
            ASSAULT_INTERIOR_CONFIG: { reinforcementInterval: 999999, reinforcementBatch: 2 },
            spawnAssaultCoreChamber: () => {},
            spawnAssaultInteriorDefenders: () => {},
            fireInteriorTurret: () => {}
        }
    );

    const scene = {
        assaultTargets: {},
        time: { now: 1000 }
    };

    assert.doesNotThrow(() => updateAssaultInterior(scene, 16));
});

test('updateMothershipInterior does not throw when assaultTargets group lacks children entries', () => {
    const updateMothershipInterior = loadFunction(
        path.join(__dirname, '../js/entities/bosses/mothershipCore.js'),
        'updateMothershipInterior',
        {
            gameState: {
                mothershipObjective: {
                    interiorPhase: true,
                    interiorStarted: true,
                    shipLocked: false,
                    coreChamberOpen: false,
                    powerConduitsTotal: 2,
                    powerConduitsRemaining: 1,
                    securityNodesTotal: 2,
                    securityNodesRemaining: 1,
                    interiorReinforcementTimer: 0
                },
                rebuildObjective: { active: false }
            },
            MOTHERSHIP_INTERIOR_CONFIG: { reinforcementInterval: 999999, reinforcementBatch: 2 },
            aegisState: { active: false, destroyed: false },
            spawnCoreChamber: () => {},
            spawnInteriorDefenders: () => {},
            ejectPilot: () => {},
            syncActivePlayer: () => {},
            fireInteriorTurret: () => {}
        }
    );

    const scene = {
        assaultTargets: {},
        time: { now: 1000 }
    };

    assert.doesNotThrow(() => updateMothershipInterior(scene, 16));
});
