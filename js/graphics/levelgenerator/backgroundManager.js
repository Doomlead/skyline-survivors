// ═══════════════════════════════════════════════════════════════════════════
// backgroundManager.js - Parallax setup and lifecycle
// ═══════════════════════════════════════════════════════════════════════════

// ------------------------
// Module-level instances and Global Functions
// ------------------------

var backgroundGeneratorInstance = null;
var parallaxManagerInstance = null;

// Update BACKGROUND_STYLE_GENERATORS in backgroundManager.js
var BACKGROUND_STYLE_GENERATORS = {
    cyberpunk: BackgroundGeneratorCyberpunk,
    wasteland: BackgroundGeneratorWasteland,
    wasteland2: BackgroundGeneratorWasteland2,
    industrial: BackgroundGeneratorIndustrial,
    destroyedindustrial: BackgroundGeneratorDestroyedIndustrial,
    mothership_exterior: BackgroundGeneratorMothershipExterior,
    mothership_interior: BackgroundGeneratorMothershipInterior
};

var BACKGROUND_STYLE_OPTIONS = Object.keys(BACKGROUND_STYLE_GENERATORS);
var MOTHERSHIP_STYLE_KEYS = ['mothership_exterior', 'mothership_interior'];

function resolveBackgroundStyle(style) {
    var requested = style || CONFIG.backgroundStyle;
    if (requested) {
        var normalized = requested.toLowerCase();
        if (BACKGROUND_STYLE_GENERATORS[normalized]) {
            return normalized;
        }
        console.warn('[BackgroundManager] Unknown background style "' + requested + '", falling back to random selection.');
    }

    if (typeof gameState !== 'undefined' && gameState.mode === 'mothership') {
        return 'mothership_exterior';
    }

    var nonMothershipOptions = BACKGROUND_STYLE_OPTIONS.filter(function(option) {
        return MOTHERSHIP_STYLE_KEYS.indexOf(option) === -1;
    });
    var options = nonMothershipOptions.length ? nonMothershipOptions : BACKGROUND_STYLE_OPTIONS;
    var index = Math.floor(Math.random() * options.length);
    return options[index];
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
    setActiveBackgroundLayers(styleToUse);
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
