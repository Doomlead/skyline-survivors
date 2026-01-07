// ═══════════════════════════════════════════════════════════════════════════
// backgroundManager.js - Parallax setup and lifecycle
// ═══════════════════════════════════════════════════════════════════════════

// ------------------------
// Module-level instances and Global Functions
// ------------------------

var backgroundGeneratorInstance = null;
var parallaxManagerInstance = null;

function createBackground(scene) {
    var generatorConfig = {
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

function initParallaxTracking(playerX, playerY) {
    if (parallaxManagerInstance) {
        // Pass both X and Y to the manager
        parallaxManagerInstance.initTracking(playerX, playerY);
    }
}

function updateParallax(playerX, playerY) {
    if (parallaxManagerInstance) {
        // Pass both X and Y to the manager
        parallaxManagerInstance.update(playerX, playerY);
    }
}

function destroyParallax() {
    if (parallaxManagerInstance) {
        parallaxManagerInstance.destroy();
        parallaxManagerInstance = null;
    }
    backgroundGeneratorInstance = null;
}
