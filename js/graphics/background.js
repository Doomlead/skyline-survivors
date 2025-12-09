// ------------------------
// Background - DETAILED Post-Apocalyptic Cityscape
// ------------------------

function createBackground(scene) {
    const rng = createBackgroundRNG(CONFIG.backgroundSeed || 1337);
    const random = () => rng();
    const { withWrappedX } = createBackgroundWrapHelpers(CONFIG);
    const groundY = CONFIG.worldHeight - 80;
    const EXTENDED_WIDTH = CONFIG.worldWidth + 200;

    createSkyAndCityLayers(scene, {
        random,
        withWrappedX,
        extendedWidth: EXTENDED_WIDTH,
    });

    createForegroundTerrain(scene, {
        random,
        withWrappedX,
        groundY,
    });

    scene.groundLevel = groundY;
}
