// ------------------------
// Background - Procedural textures with parallax tiling
// ------------------------

let backgroundGeneratorInstance;
let parallaxManagerInstance;

function createBackground(scene) {
    const generatorConfig = {
        worldWidth: CONFIG.worldWidth,
        worldHeight: CONFIG.worldHeight,
        width: CONFIG.width,
        height: CONFIG.height,
        backgroundSeed: CONFIG.backgroundSeed || 1337,
    };

    backgroundGeneratorInstance = new BackgroundGenerator(scene, generatorConfig);
    backgroundGeneratorInstance.generateAllTextures();

    parallaxManagerInstance = new ParallaxManager(scene, generatorConfig);
    parallaxManagerInstance.createLayers();

    scene.groundLevel = generatorConfig.worldHeight - 80;
}

function initParallaxTracking(playerX) {
    if (parallaxManagerInstance) {
        parallaxManagerInstance.initTracking(playerX);
    }
}

function updateParallax(playerX) {
    if (parallaxManagerInstance) {
        parallaxManagerInstance.update(playerX);
    }
}

function destroyParallax() {
    if (parallaxManagerInstance) {
        parallaxManagerInstance.destroy();
        parallaxManagerInstance = null;
    }
    backgroundGeneratorInstance = null;
}
