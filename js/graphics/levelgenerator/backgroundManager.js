// 
// js\graphics\levelgenerator\backgroundManager.js - Parallax setup and lifecycle
//

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
    mothership_interior: BackgroundGeneratorMothershipInterior,
    raider_interior: BackgroundGeneratorRaiderInterior,
    carrier_interior: BackgroundGeneratorCarrierInterior,
    nova_interior: BackgroundGeneratorNovaInterior,
    siege_interior: BackgroundGeneratorSiegeInterior,
    dreadnought_interior: BackgroundGeneratorDreadnoughtInterior
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
    // Use the ACTUAL current camera dimensions, not just CONFIG
    var cam = scene.cameras ? scene.cameras.main : null;
    var actualWidth = cam ? cam.width : CONFIG.width;
    var actualHeight = cam ? cam.height : CONFIG.height;
    
    var generatorConfig = {
        worldWidth: CONFIG.worldWidth,
        worldHeight: actualHeight,  // Use actual current height
        width: actualWidth,         // Use actual current width
        height: actualHeight,       // Use actual current height
        backgroundSeed: CONFIG.backgroundSeed || 1337,
    };

    var styleToUse = resolveBackgroundStyle(style);
    setActiveBackgroundLayers(styleToUse);
    var GeneratorClass = BACKGROUND_STYLE_GENERATORS[styleToUse];

    console.log('[BackgroundManager] Creating ' + styleToUse.toUpperCase() + ' background (' + actualWidth + 'x' + actualHeight + ')');
    backgroundGeneratorInstance = new GeneratorClass(scene, generatorConfig);
    backgroundGeneratorInstance.generateAllTextures();

    parallaxManagerInstance = new ParallaxManager(scene, generatorConfig);
    parallaxManagerInstance.createLayers();

    scene.groundLevel = generatorConfig.worldHeight - 80;
    
    // Force an immediate resize to ensure layers match current viewport
    // This handles cases where the viewport changed between config creation and layer creation
    if (cam && (cam.width !== actualWidth || cam.height !== actualHeight)) {
        console.log('[BackgroundManager] Post-creation resize to match camera: ' + cam.width + 'x' + cam.height);
        parallaxManagerInstance.resize(cam.width, cam.height);
    }
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

function resizeParallaxLayers(width, height) {
    if (parallaxManagerInstance) {
        parallaxManagerInstance.resize(width, height);
        var scene = parallaxManagerInstance.scene;
        var baseWorldHeight = parallaxManagerInstance.config.worldHeight || height;
        var baseGroundLevel = baseWorldHeight - 80;
        var groundRatio = baseWorldHeight > 0 ? baseGroundLevel / baseWorldHeight : 1;
        if (scene) {
            scene.groundLevel = height * groundRatio;
            if (scene.physics && scene.physics.world) {
                scene.physics.world.setBounds(0, 0, CONFIG.worldWidth, height, false, false, true, true);
            }
            if (scene.interiorPlatformsActive && typeof rebuildInteriorPlatformsOnResize === 'function') {
                rebuildInteriorPlatformsOnResize(scene);
            }
            alignGroundedActors(scene);
        }
        CONFIG.worldHeight = height;
    }
}

function alignGroundedActors(scene) {
    var groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    if (scene.humans && scene.humans.children && scene.humans.children.entries) {
        scene.humans.children.entries.forEach(function(human) {
            if (!human || !human.active || human.isAbducted) return;
            var isFalling = Boolean(human.body && human.body.gravity && human.body.gravity.y > 0);
            if (isFalling) return;
            var terrainVariation = Math.sin(human.x / 200) * 30;
            human.y = groundLevel - terrainVariation - 15;
            if (human.body) {
                human.setVelocity(0, 0);
                human.setGravityY(0);
            }
        });
    }

    if (scene.assaultTargets && scene.assaultTargets.children && scene.assaultTargets.children.entries) {
        var baseX = gameState?.assaultObjective?.baseX;
        if (typeof baseX !== 'number' && scene.assaultBase) {
            baseX = scene.assaultBase.x;
        }
        if (typeof baseX !== 'number') {
            baseX = CONFIG.worldWidth * 0.5;
        }
        var terrainVariation = Math.sin(baseX / 200) * 30;
        var baseY = Math.max(140, groundLevel - terrainVariation - 24);

        if (scene.assaultBase && scene.assaultBase.active) {
            scene.assaultBase.y = baseY;
            if (scene.assaultBase.body) {
                scene.assaultBase.setVelocity(0, 0);
            }
        }

        scene.assaultTargets.children.entries.forEach(function(target) {
            if (!target || !target.active) return;
            switch (target.assaultRole) {
                case 'core':
                    target.y = baseY;
                    break;
                case 'shield':
                    target.y = baseY - 10;
                    break;
                case 'turret':
                    target.y = baseY + 34;
                    break;
                default:
                    break;
            }
            if (target.body) {
                target.setVelocity(0, 0);
            }
        });
    }

    if (scene.hangar && scene.hangar.active) {
        var hangarX = scene.hangar.x;
        var hangarTerrainVariation = Math.sin(hangarX / 200) * 30;
        var hangarOffset = typeof scene.hangar.groundOffset === 'number' ? scene.hangar.groundOffset : 0;
        scene.hangar.y = groundLevel - hangarTerrainVariation + hangarOffset;
        if (scene.hangar.body) {
            scene.hangar.setVelocity(0, 0);
        }

        var landingZone = scene.hangar.landingZone;
        if (landingZone && landingZone.active) {
            var landingOffset = typeof landingZone.groundOffset === 'number' ? landingZone.groundOffset : 0;
            landingZone.x = hangarX;
            landingZone.y = groundLevel - hangarTerrainVariation + landingOffset;
            if (landingZone.body) {
                landingZone.setVelocity(0, 0);
            }
        }
    }
}

function destroyParallax() {
    if (parallaxManagerInstance) {
        parallaxManagerInstance.destroy();
        parallaxManagerInstance = null;
    }
    backgroundGeneratorInstance = null;
}
