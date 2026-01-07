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
