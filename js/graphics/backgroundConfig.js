// Background configuration defining each parallax layer and its scroll speed

const BACKGROUND_LAYERS = {
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
        speedX: 0.1,
        depth: 3,
        generator: 'generateHorizonCityLayer',
    },
    distantCity: {
        key: 'bg_distant_city',
        speedX: 0.2,
        depth: 4,
        generator: 'generateDistantCityLayer',
    },
    midCity: {
        key: 'bg_mid_city',
        speedX: 0.4,
        depth: 5,
        generator: 'generateMidCityLayer',
    },
    nearCity: {
        key: 'bg_near_city',
        speedX: 0.6,
        depth: 6,
        generator: 'generateNearCityLayer',
    },
    terrain: {
        key: 'bg_terrain',
        speedX: 0.85,
        depth: 7,
        generator: 'generateTerrainLayer',
    },
};

const LAYER_ORDER = [
    'sky',
    'atmosphere',
    'stars',
    'horizonCity',
    'distantCity',
    'midCity',
    'nearCity',
    'terrain',
];
