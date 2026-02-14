// ═══════════════════════════════════════════════════════════════════════════
// backgroundConfig.js - Procedural Background Configuration
// ═══════════════════════════════════════════════════════════════════════════

// Foreground depth base - gameplay sprites should stay at or above this; background layers remain below
var FG_DEPTH_BASE = 100;

// ------------------------
// Background Configuration
// ------------------------

var BACKGROUND_LAYERS = {
    sky: {
        key: 'bg_sky',
        speedX: 0.0,
        depth: 0,
        generator: 'generateSkyLayer',
    },
    atmosphere: {
        key: 'bg_atmosphere',
        speedX: 0.02,
        depth: 1,
        generator: 'generateAtmosphereLayer',
    },
    stars: {
        key: 'bg_stars',
        speedX: 0.05,
        depth: 2,
        generator: 'generateStarsLayer',
    },
    horizonCity: {
        key: 'bg_horizon_city',
        speedX: 0.25,
        depth: 3,
        generator: 'generateHorizonCityLayer',
        widthMultiplier: 0.25,  // 4 maps at 25% width each
    },
    midCity: {
        key: 'bg_mid_city',
        speedX: 0.5,
        depth: 4,
        generator: 'generateMidCityLayer',
        widthMultiplier: 0.5,   // 2 maps at 50% width each
    },
    terrain: {
        key: 'bg_terrain',
        speedX: 1,
        depth: 5,
        generator: 'generateTerrainLayer',
        widthMultiplier: 0.333,  // 3 maps at 33% width each for seamless wrapping
    },
};

var LAYER_ORDER = [
    'sky',
    'atmosphere',
    'stars',
    'horizonCity',
    'midCity',
    'terrain',
];

var MOTHERSHIP_EXT_LAYERS = {
    sky: {
        key: 'ms_ext_sky',
        speedX: 0.0,
        depth: 0,
        generator: 'generateSkyLayer',
    },
    atmosphere: {
        key: 'ms_ext_atmosphere',
        speedX: 0.02,
        depth: 1,
        generator: 'generateAtmosphereLayer',
    },
    stars: {
        key: 'ms_ext_stars',
        speedX: 0.05,
        depth: 2,
        generator: 'generateStarsLayer',
    },
    horizonCity: {
        key: 'ms_ext_horizon',
        speedX: 0.18,
        depth: 3,
        generator: 'generateHorizonCityLayer',
        widthMultiplier: 1,
    },
    midCity: {
        key: 'ms_ext_mid',
        speedX: 0.4,
        depth: 4,
        generator: 'generateMidCityLayer',
        widthMultiplier: 1,
    },
    terrain: {
        key: 'ms_ext_terrain',
        speedX: 1,
        depth: 5,
        generator: 'generateTerrainLayer',
        widthMultiplier: 1,
    },
};

var MOTHERSHIP_EXT_ORDER = [
    'sky',
    'atmosphere',
    'stars',
    'horizonCity',
    'midCity',
    'terrain',
];

var MOTHERSHIP_INT_LAYERS = {
    corridorBack: {
        key: 'ms_int_back',
        speedX: 0.2,
        depth: 4,
        generator: 'generateCorridorBack'
    },
    infrastructure: {
        key: 'ms_int_infra',
        speedX: 0.5,
        depth: 5,
        generator: 'generateInfrastructure'
    }
};

var MOTHERSHIP_INT_ORDER = [
    'corridorBack',
    'infrastructure'
];

var BACKGROUND_LAYER_SETS = {
    default: {
        layers: BACKGROUND_LAYERS,
        order: LAYER_ORDER
    },
    mothership_exterior: {
        layers: MOTHERSHIP_EXT_LAYERS,
        order: MOTHERSHIP_EXT_ORDER
    },
    mothership_interior: {
        layers: MOTHERSHIP_INT_LAYERS,
        order: MOTHERSHIP_INT_ORDER
    }
};

function setActiveBackgroundLayers(styleKey) { // Set active background layers.
    var setKey = styleKey && BACKGROUND_LAYER_SETS[styleKey] ? styleKey : 'default';
    var selection = BACKGROUND_LAYER_SETS[setKey];
    BACKGROUND_LAYERS = selection.layers;
    LAYER_ORDER = selection.order;
    return setKey;
}
