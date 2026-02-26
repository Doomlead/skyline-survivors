const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadContext(relativePath, extraContext = {}) {
    const sourcePath = path.join(__dirname, '..', relativePath);
    const source = fs.readFileSync(sourcePath, 'utf8');
    const context = {
        console,
        ...extraContext
    };
    vm.createContext(context);
    vm.runInContext(source, context);
    return context;
}

test('assault exterior-to-interior transition can build authored interior section', () => {
    const calls = [];
    const section = { id: 'assault_section_1', hazards: [{ type: 'laser' }] };

    const context = loadContext('js/entities/assault/assaultBaseCore.js', {
        gameState: {
            assaultObjective: { baseVariant: 'assaultBaseRaider' }
        },
        interiorState: { sections: [section] },
        destroyParallax: () => calls.push(['destroyParallax']),
        createBackground: (_scene, style) => calls.push(['createBackground', style]),
        initParallaxTracking: (x, y) => calls.push(['initParallaxTracking', x, y]),
        initInteriorMission: (_scene, missionType) => calls.push(['initInteriorMission', missionType]),
        buildInteriorPlatformsFromLayout: (_scene, builtSection) => calls.push(['buildPlatforms', builtSection]),
        initializeHazards: (_scene, hazards) => calls.push(['initializeHazards', hazards]),
        initInteriorSpawners: () => calls.push(['initInteriorSpawners']),
        spawnSectionEnemies: (_scene, builtSection) => calls.push(['spawnSectionEnemies', builtSection])
    });

    context.forceOnFootForAssault = () => calls.push(['forceOnFootForAssault']);
    context.spawnAssaultInteriorObjectives = () => calls.push(['spawnAssaultInteriorObjectives']);
    context.showRebuildObjectiveBanner = () => {};

    const scene = {
        cameras: { main: { scrollX: 10, scrollY: 20 } }
    };

    context.beginAssaultBaseInterior(scene);

    assert.deepStrictEqual(calls[0], ['destroyParallax']);
    assert.ok(calls.some(([name, mission]) => name === 'initInteriorMission' && mission === 'assault'));
    assert.ok(calls.some(([name, builtSection]) => name === 'buildPlatforms' && builtSection === section));
    assert.ok(calls.some(([name]) => name === 'initInteriorSpawners'));
    assert.ok(calls.some(([name, builtSection]) => name === 'spawnSectionEnemies' && builtSection === section));
    assert.ok(calls.some(([name]) => name === 'forceOnFootForAssault'));
    assert.ok(calls.some(([name]) => name === 'spawnAssaultInteriorObjectives'));
});

test('mothership exterior-to-interior transition can build authored interior section', () => {
    const calls = [];
    const section = { id: 'mothership_section_1', hazards: [{ type: 'steam' }] };

    const context = loadContext('js/entities/bosses/mothershipCore.js', {
        gameState: {
            mothershipObjective: {}
        },
        interiorState: { sections: [section] },
        initInteriorMission: (_scene, missionType) => calls.push(['initInteriorMission', missionType]),
        buildInteriorPlatformsFromLayout: (_scene, builtSection) => calls.push(['buildPlatforms', builtSection]),
        initializeHazards: (_scene, hazards) => calls.push(['initializeHazards', hazards]),
        initInteriorSpawners: () => calls.push(['initInteriorSpawners']),
        spawnSectionEnemies: (_scene, builtSection) => calls.push(['spawnSectionEnemies', builtSection])
    });

    context.clearExteriorEntities = () => calls.push(['clearExteriorEntities']);
    context.swapToInteriorBackground = () => calls.push(['swapToInteriorBackground']);
    context.forceOnFoot = () => calls.push(['forceOnFoot']);
    context.spawnInteriorObjectives = () => calls.push(['spawnInteriorObjectives']);
    context.showRebuildObjectiveBanner = () => {};

    context.beginMothershipInterior({});

    assert.ok(calls.some(([name]) => name === 'clearExteriorEntities'));
    assert.ok(calls.some(([name]) => name === 'swapToInteriorBackground'));
    assert.ok(calls.some(([name, mission]) => name === 'initInteriorMission' && mission === 'mothership'));
    assert.ok(calls.some(([name, builtSection]) => name === 'buildPlatforms' && builtSection === section));
    assert.ok(calls.some(([name]) => name === 'initInteriorSpawners'));
    assert.ok(calls.some(([name, builtSection]) => name === 'spawnSectionEnemies' && builtSection === section));
    assert.ok(calls.some(([name]) => name === 'forceOnFoot'));
    assert.ok(calls.some(([name]) => name === 'spawnInteriorObjectives'));
});
