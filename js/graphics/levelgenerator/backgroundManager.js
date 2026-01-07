// ═══════════════════════════════════════════════════════════════════════════
// backgroundManager.js - Parallax setup and lifecycle
// ═══════════════════════════════════════════════════════════════════════════

// ------------------------
// Module-level instances and Global Functions
// ------------------------

var backgroundGeneratorInstance = null;
var parallaxManagerInstance = null;

var BACKGROUND_STYLE_GENERATORS = {
    cyberpunk: BackgroundGeneratorCyberpunk,
    wasteland: BackgroundGeneratorWasteland,
    industrial: BackgroundGeneratorIndustrial,
};

var BACKGROUND_STYLE_OPTIONS = Object.keys(BACKGROUND_STYLE_GENERATORS);

function resolveBackgroundStyle(style) {
    var requested = style || CONFIG.backgroundStyle;
    if (requested) {
        var normalized = requested.toLowerCase();
        if (BACKGROUND_STYLE_GENERATORS[normalized]) {
            return normalized;
        }
        console.warn('[BackgroundManager] Unknown background style "' + requested + '", falling back to random selection.');
    }

    var index = Math.floor(Math.random() * BACKGROUND_STYLE_OPTIONS.length);
    return BACKGROUND_STYLE_OPTIONS[index];
}

function createBackground(scene, style) {
    var generatorConfig = {
        worldWidth: CONFIG.worldWidth,
        worldHeight: CONFIG.worldHeight,
        width: CONFIG.width,
        height: CONFIG.height,
        backgroundSeed: CONFIG.backgroundSeed || 1337,
    };

    var styleToUse = resolveBackgroundStyle(style);
    var GeneratorClass = BACKGROUND_STYLE_GENERATORS[styleToUse];

    console.log('[BackgroundManager] Creating ' + styleToUse.toUpperCase() + ' background');
    backgroundGeneratorInstance = new GeneratorClass(scene, generatorConfig);
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
