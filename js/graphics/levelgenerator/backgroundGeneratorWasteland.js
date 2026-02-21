// ═══════════════════════════════════════════════════════════════════════════
// backgroundGeneratorWasteland.js - Wasteland/Desert Style Background
// ═══════════════════════════════════════════════════════════════════════════

var BackgroundGeneratorWasteland = (function() {
    /**
     * Handles the BackgroundGeneratorWasteland routine and encapsulates its core gameplay logic.
     * Parameters: scene, config.
     * Returns: value defined by the surrounding game flow.
     */
    function BackgroundGeneratorWasteland(scene, config) {
        this.scene = scene;
        this.config = config;
        this.generatedTextures = new Map();
    }

    /**
     * Handles the createRNG routine and encapsulates its core gameplay logic.
     * Parameters: seed.
     * Returns: value defined by the surrounding game flow.
     */
    BackgroundGeneratorWasteland.prototype.createRNG = function(seed) {
        var state = seed >>> 0;
        return function() {
            state += 0x6d2b79f5;
            var t = state;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    };

    /**
     * Handles the generateLoopingNoise routine and encapsulates its core gameplay logic.
     * Parameters: length, step, magnitude, seed.
     * Returns: value defined by the surrounding game flow.
     */
    BackgroundGeneratorWasteland.prototype.generateLoopingNoise = function(length, step, magnitude, seed) {
        var values = [];
        var numSteps = Math.ceil(length / step);
        for (var i = 0; i <= numSteps; i++) {
            var angle = (i / numSteps) * Math.PI * 2;
            var val = Math.sin(angle + seed) * magnitude;
            val += Math.sin(angle * 2.3 + seed * 1.5) * (magnitude * 0.5);
            val += Math.sin(angle * 4.7 + seed * 2.1) * (magnitude * 0.25);
            if (i === numSteps) val = values[0];
            values.push(val);
        }
        return values;
    };

    /**
     * Handles the generateAllTextures routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    BackgroundGeneratorWasteland.prototype.generateAllTextures = function() {
        console.log('[BackgroundGeneratorWasteland] Starting texture generation...');

        for (var i = 0; i < LAYER_ORDER.length; i++) {
            var layerName = LAYER_ORDER[i];
            var layerConfig = BACKGROUND_LAYERS[layerName];
            this.generateLayerTexture(layerName, layerConfig);
        }

        console.log('[BackgroundGeneratorWasteland] All textures generated!');
        return this.generatedTextures;
    };

    /**
     * Handles the generateLayerTexture routine and encapsulates its core gameplay logic.
     * Parameters: layerName, layerConfig.
     * Returns: value defined by the surrounding game flow.
     */
    BackgroundGeneratorWasteland.prototype.generateLayerTexture = function(layerName, layerConfig) {
        var worldWidth = this.config.worldWidth;
        var worldHeight = this.config.worldHeight;

        var textureWidth = worldWidth;
        if (layerConfig.widthMultiplier && layerConfig.widthMultiplier < 1) {
            textureWidth = Math.ceil(worldWidth * layerConfig.widthMultiplier);
        }

        var graphics = this.scene.add.graphics();
        var rng = this.createRNG((this.config.backgroundSeed || 1337) + layerConfig.depth * 1000);

        var dims = {
            width: textureWidth,
            height: worldHeight,
            worldWidth: worldWidth,
            worldHeight: worldHeight
        };

        if (typeof this[layerConfig.generator] === 'function') {
            this[layerConfig.generator](graphics, rng, dims);
        } else {
            console.warn('[BackgroundGeneratorWasteland] Generator "' + layerConfig.generator + '" not found');
        }

        graphics.generateTexture(layerConfig.key, textureWidth, worldHeight);
        graphics.destroy();

        this.generatedTextures.set(layerName, layerConfig.key);
        console.log('[BackgroundGeneratorWasteland] Generated: ' + layerConfig.key + ' (' + textureWidth + 'x' + worldHeight + ')');

        return layerConfig.key;
    };

    // ═══════════════════════════════════════════════════════════════════════
    // WASTELAND STYLE LAYER GENERATORS - Orange/Brown Desert Theme
    // ═══════════════════════════════════════════════════════════════════════

    BackgroundGeneratorWasteland.prototype.generateSkyLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var bandHeight = 20;

        // Orange/red wasteland sky gradient
        for (var y = 0; y < worldHeight; y += bandHeight) {
            var t = y / worldHeight;
            var r, g, b;

            if (t < 0.2) {
                // Dark orange top
                r = Math.floor(30 + t * 60);
                g = Math.floor(15 + t * 30);
                b = Math.floor(10 + t * 15);
            } else if (t < 0.4) {
                // Transition to brighter orange
                var mt = (t - 0.2) / 0.2;
                r = Math.floor(90 + mt * 50);
                g = Math.floor(45 + mt * 35);
                b = Math.floor(25 + mt * 15);
            } else if (t < 0.6) {
                // Bright yellow-orange horizon
                var mt2 = (t - 0.4) / 0.2;
                r = Math.floor(140 + mt2 * 40);
                g = Math.floor(80 + mt2 * 40);
                b = Math.floor(40 + mt2 * 20);
            } else if (t < 0.8) {
                // Fade to dusty brown
                var bt = (t - 0.6) / 0.2;
                r = Math.floor(180 - bt * 40);
                g = Math.floor(120 - bt * 35);
                b = Math.floor(60 - bt * 20);
            } else {
                // Deep brown near ground
                var bt2 = (t - 0.8) / 0.2;
                r = Math.floor(140 - bt2 * 50);
                g = Math.floor(85 - bt2 * 35);
                b = Math.floor(40 - bt2 * 20);
            }

            graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
            graphics.fillRect(0, y, textureWidth, bandHeight + 1);
        }
    };

    /**
     * Handles the generateAtmosphereLayer routine and encapsulates its core gameplay logic.
     * Parameters: graphics, random, dims.
     * Returns: value defined by the surrounding game flow.
     */
    BackgroundGeneratorWasteland.prototype.generateAtmosphereLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;

        // Dust clouds
        for (var i = 0; i < 15; i++) {
            var px = random() * textureWidth;
            var py = worldHeight * 0.2 + random() * worldHeight * 0.4;
            var size = 80 + random() * 120;

            graphics.fillStyle(0x8b6f47, 0.08);
            graphics.fillCircle(px, py, size * 1.2);
            graphics.fillStyle(0xa89968, 0.06);
            graphics.fillCircle(px + 20, py, size);
        }

        // Heat shimmer bands
        for (var i = 0; i < 8; i++) {
            var by = worldHeight * 0.5 + i * 40;
            graphics.fillStyle(0xd4a574, 0.03);
            graphics.fillRect(0, by, textureWidth, 25 + random() * 30);
        }

        // Haze
        graphics.fillStyle(0xc9a97a, 0.05);
        graphics.fillRect(0, worldHeight * 0.6, textureWidth, worldHeight * 0.2);
    };

    /**
     * Handles the generateStarsLayer routine and encapsulates its core gameplay logic.
     * Parameters: graphics, random, dims.
     * Returns: value defined by the surrounding game flow.
     */
    BackgroundGeneratorWasteland.prototype.generateStarsLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;

        // Few stars visible through dust
        for (var i = 0; i < 80; i++) {
            var x = random() * textureWidth;
            var y = random() * (worldHeight * 0.35);
            var brightness = 0.15 + random() * 0.4;

            graphics.fillStyle(0xffddaa, brightness);
            var size = random() > 0.92 ? 2 : 1;
            graphics.fillRect(x, y, size, size);
        }

        // Distant sun/moon glow
        var sunX = textureWidth * (0.3 + random() * 0.4);
        var sunY = worldHeight * 0.25;

        graphics.fillStyle(0xffaa44, 0.12);
        graphics.fillCircle(sunX, sunY, 80);
        graphics.fillStyle(0xffcc66, 0.18);
        graphics.fillCircle(sunX, sunY, 50);
        graphics.fillStyle(0xffee88, 0.25);
        graphics.fillCircle(sunX, sunY, 30);
    };

    /**
     * Handles the generateHorizonCityLayer routine and encapsulates its core gameplay logic.
     * Parameters: graphics, random, dims.
     * Returns: value defined by the surrounding game flow.
     */
    BackgroundGeneratorWasteland.prototype.generateHorizonCityLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var horizonY = worldHeight - 120;
        var seed = (this.config.backgroundSeed || 1337) + 100;

        var noiseStep = 18;
        var skylineNoise = this.generateLoopingNoise(textureWidth, noiseStep, 35, seed * 0.7);
        var detailNoise = this.generateLoopingNoise(textureWidth, noiseStep * 0.5, 12, seed * 1.3);

        // Buried ruins silhouette
        graphics.fillStyle(0x3d2f1f, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);

        var buildingRng = this.createRNG(seed);
        /**
         * Handles the buildingRandom routine and encapsulates its core gameplay logic.
         * Parameters: none.
         * Returns: value defined by the surrounding game flow.
         */
        var buildingRandom = function() { return buildingRng(); };

        for (var i = 0; i < skylineNoise.length; i++) {
            var x = i * noiseStep;
            if (x > textureWidth) break;

            var detailIdx = Math.min(i * 2, detailNoise.length - 1);
            var baseHeight = 12 + Math.abs(skylineNoise[i]) * 0.6 + Math.abs(detailNoise[detailIdx]) * 0.3;

            var buried = buildingRandom() > 0.4;

            if (buried) {
                // Mostly buried structure
                graphics.lineTo(x, horizonY - baseHeight * 0.3);
            } else {
                // Partial structure visible
                graphics.lineTo(x, horizonY - baseHeight);
                if (buildingRandom() > 0.8) {
                    // Antenna stub
                    graphics.lineTo(x + noiseStep * 0.45, horizonY - baseHeight - 8);
                }
            }
        }

        graphics.lineTo(textureWidth, horizonY - 12);
        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        // Sand dunes over ruins
        graphics.fillStyle(0x5a4a3a, 0.6);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);

        for (var i = 0; i < skylineNoise.length; i++) {
            var x = i * noiseStep + noiseStep * 0.3;
            if (x > textureWidth) break;
            var height = 8 + Math.abs(detailNoise[i % detailNoise.length]) * 0.5;
            graphics.lineTo(x, horizonY - height);
        }

        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        // Scattered distant fires/lights
        var fireCount = Math.max(1, Math.ceil(4 * (textureWidth / dims.worldWidth)));
        for (var i = 0; i < fireCount; i++) {
            var fx = random() * textureWidth;
            graphics.fillStyle(0xff6622, 0.15);
            graphics.fillCircle(fx, horizonY - 8 - random() * 15, 6 + random() * 5);
        }
    };

    /**
     * Handles the generateMidCityLayer routine and encapsulates its core gameplay logic.
     * Parameters: graphics, random, dims.
     * Returns: value defined by the surrounding game flow.
     */
    BackgroundGeneratorWasteland.prototype.generateMidCityLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var worldWidthRef = dims ? dims.worldWidth : this.config.worldWidth;
        var groundY = worldHeight - 100;
        var widthRatio = textureWidth / worldWidthRef;
        var seed = (this.config.backgroundSeed || 1337) + 200;

        // Broken highway/bridge remains
        graphics.fillStyle(0x4a3a2a, 1);

        var segmentCount = Math.max(3, Math.ceil(10 * widthRatio));
        for (var i = 0; i < segmentCount; i++) {
            var segX = i * (textureWidth / segmentCount) + random() * 40 * widthRatio;
            var segY = groundY - 40 - random() * 20;
            var segWidth = 30 + random() * 50;
            var tilted = random() > 0.5;

            if (tilted) {
                graphics.beginPath();
                graphics.moveTo(segX, segY);
                graphics.lineTo(segX + segWidth, segY + 15);
                graphics.lineTo(segX + segWidth - 5, segY + 25);
                graphics.lineTo(segX - 5, segY + 10);
                graphics.closePath();
                graphics.fillPath();
            } else {
                graphics.fillRect(segX, segY, segWidth, 8);
            }
        }

        // Partially buried structures
        var buildingNoise = this.generateLoopingNoise(textureWidth, 30, 45, seed * 0.5);
        var buildingCount = Math.max(4, Math.ceil(20 * widthRatio));

        for (var i = 0; i < buildingCount; i++) {
            var bx = i * (textureWidth / buildingCount) + random() * 25 * widthRatio;
            var bWidth = 18 + random() * 35;

            var noiseIdx = Math.floor((bx / textureWidth) * buildingNoise.length) % buildingNoise.length;
            var bHeight = 40 + Math.abs(buildingNoise[noiseIdx]) * 0.7 + random() * 30;

            var by = worldHeight - 92;
            var left = bx - bWidth / 2;
            var top = by - bHeight;

            if (left < 0) left = 0;
            if (left + bWidth > textureWidth) bWidth = textureWidth - left;
            if (bWidth < 8) continue;

            var mostly_buried = random() > 0.4;

            graphics.fillStyle(0x3d2d1d, 1);

            if (mostly_buried) {
                // Just top visible
                var visibleHeight = bHeight * (0.15 + random() * 0.25);
                graphics.fillRect(left, by - visibleHeight, bWidth, visibleHeight);

                // Few windows
                if (random() > 0.7) {
                    graphics.fillStyle(0x1a1510, 0.6);
                    graphics.fillRect(left + bWidth * 0.3, by - visibleHeight + 5, 4, 6);
                }
            } else {
                // More visible, tilted
                graphics.beginPath();
                graphics.moveTo(left, by);
                graphics.lineTo(left + bWidth * 0.1, top + bHeight * 0.2);
                graphics.lineTo(left + bWidth * 0.9, top + bHeight * 0.15);
                graphics.lineTo(left + bWidth, by);
                graphics.closePath();
                graphics.fillPath();

                // Broken windows
                graphics.fillStyle(0x1a1510, 0.7);
                for (var w = 0; w < 3; w++) {
                    if (random() > 0.5) {
                        graphics.fillRect(
                            left + bWidth * 0.2 + w * (bWidth * 0.25),
                            top + bHeight * 0.3 + random() * (bHeight * 0.2),
                            5, 7
                        );
                    }
                }
            }
        }

        // Sand dunes
        var duneCount = Math.max(3, Math.ceil(8 * widthRatio));
        for (var i = 0; i < duneCount; i++) {
            var dx = random() * textureWidth;
            var dy = groundY - 10 - random() * 15;
            var dw = 40 + random() * 80;
            var dh = 15 + random() * 25;

            graphics.fillStyle(0x7a5a3a, 0.5);
            graphics.fillEllipse(dx, dy, dw, dh);
        }
    };

    /**
     * Handles the generateTerrainLayer routine and encapsulates its core gameplay logic.
     * Parameters: graphics, random, dims.
     * Returns: value defined by the surrounding game flow.
     */
    BackgroundGeneratorWasteland.prototype.generateTerrainLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var worldWidthRef = dims ? dims.worldWidth : this.config.worldWidth;
        var widthRatio = textureWidth / worldWidthRef;
        var groundY = worldHeight - 80;

        // Sandy desert terrain with dunes
        var baseNoise = this.generateLoopingNoise(textureWidth, 40, 25, 0.5);
        var midNoise = this.generateLoopingNoise(textureWidth, 30, 15, 1.2);
        var topNoise = this.generateLoopingNoise(textureWidth, 35, 10, 2.1);

        // Base sand layer (dark)
        graphics.fillStyle(0x5a4428, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        for (var i = 0; i < baseNoise.length; i++) {
            var x = i * 40;
            if (x > textureWidth) break;
            graphics.lineTo(x, groundY - baseNoise[i] - 12);
        }
        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        // Mid sand layer
        graphics.fillStyle(0x7a5a38, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        for (var i = 0; i < midNoise.length; i++) {
            var x = i * 30;
            if (x > textureWidth) break;
            graphics.lineTo(x, groundY - midNoise[i] - 6);
        }
        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        // Top sand layer (lightest)
        graphics.fillStyle(0x9a7a48, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        for (var i = 0; i < topNoise.length; i++) {
            var x = i * 35;
            if (x > textureWidth) break;
            graphics.lineTo(x, groundY - topNoise[i] - 2);
        }
        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        // Rocks and boulders
        var rockCount = Math.max(5, Math.ceil(25 * widthRatio));
        for (var i = 0; i < rockCount; i++) {
            var rx = random() * textureWidth;
            var ry = groundY + random() * 20 - 5;
            var rw = 8 + random() * 20;
            var rh = 6 + random() * 12;

            graphics.fillStyle(0x3a2a1a, 1);
            graphics.fillEllipse(rx, ry, rw, rh);
            graphics.fillStyle(0x4a3a2a, 0.6);
            graphics.fillEllipse(rx + 2, ry - 2, rw * 0.7, rh * 0.7);
        }

        // Skeletal remains
        var skeletonCount = Math.max(2, Math.ceil(8 * widthRatio));
        for (var i = 0; i < skeletonCount; i++) {
            var sx = random() * textureWidth;
            var sy = groundY + random() * 15;

            graphics.fillStyle(0xd4c4b4, 0.8);
            // Ribcage
            graphics.fillRect(sx, sy, 12, 6);
            graphics.fillRect(sx + 2, sy + 2, 8, 2);
            // Skull
            graphics.fillCircle(sx + 15, sy + 2, 4);
            graphics.fillRect(sx + 13, sy + 5, 4, 3);
        }

        // Rusted metal debris
        var debrisCount = Math.max(10, Math.ceil(50 * widthRatio));
        for (var i = 0; i < debrisCount; i++) {
            var dx = random() * textureWidth;
            var dy = groundY - 2 - random() * 20;
            var dw = 4 + random() * 12;
            var dh = 2 + random() * 6;

            graphics.fillStyle(0x6a4a2a, 0.7);
            graphics.fillRect(dx, dy, dw, dh);
        }

        // Partially buried structures
        var structureCount = Math.max(2, Math.ceil(12 * widthRatio));
        for (var i = 0; i < structureCount; i++) {
            var bx = i * (textureWidth / structureCount) + random() * 60 * widthRatio;
            var bWidth = 30 + random() * 50;
            var bHeight = 60 + random() * 100;
            var noiseIdx = Math.floor((bx / textureWidth) * topNoise.length) % topNoise.length;
            var by = groundY - topNoise[noiseIdx];
            var left = bx - bWidth / 2;
            var visibleHeight = bHeight * (0.2 + random() * 0.3);
            var top = by - visibleHeight;

            if (left < 0) left = 0;
            if (left + bWidth > textureWidth) bWidth = textureWidth - left;
            if (bWidth < 15) continue;

            graphics.fillStyle(0x3d2d1d, 1);

            // Tilted buried building
            graphics.beginPath();
            graphics.moveTo(left, by);
            graphics.lineTo(left + bWidth * 0.15, top + visibleHeight * 0.1);

            var segments = 3 + Math.floor(random() * 3);
            for (var s = 0; s <= segments; s++) {
                graphics.lineTo(
                    left + (bWidth / segments) * s,
                    top + random() * visibleHeight * 0.4
                );
            }

            graphics.lineTo(left + bWidth, by);
            graphics.closePath();
            graphics.fillPath();

            // Sand covering parts
            graphics.fillStyle(0x8a6a3a, 0.6);
            for (var s = 0; s < 5; s++) {
                graphics.fillRect(
                    left + random() * bWidth,
                    top + random() * visibleHeight,
                    8 + random() * 15,
                    6 + random() * 10
                );
            }

            // Few broken windows
            for (var w = 0; w < 4; w++) {
                if (random() > 0.6) {
                    graphics.fillStyle(0x1a1510, 0.8);
                    graphics.fillRect(
                        left + 8 + w * 12,
                        top + random() * visibleHeight * 0.5,
                        6, 8
                    );
                }
            }
        }

        // Bleached warning signs
        var signCount = Math.max(1, Math.ceil(3 * widthRatio));
        for (var i = 0; i < signCount; i++) {
            var sx = random() * textureWidth;
            var sy = groundY - 3;
            var tilted = random() * 0.3 - 0.15;

            graphics.fillStyle(0x5a4a3a, 1);
            graphics.beginPath();
            graphics.moveTo(sx, sy);
            graphics.lineTo(sx + 2, sy - 18);
            graphics.lineTo(sx - 2, sy - 18);
            graphics.closePath();
            graphics.fillPath();

            // Faded sign
            graphics.fillStyle(0xc4a474, 0.5);
            graphics.fillRect(sx - 8, sy - 25, 16, 10);
        }
    };

    return BackgroundGeneratorWasteland;
})();
