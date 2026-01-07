// ═══════════════════════════════════════════════════════════════════════════
// backgroundGenerator.js - Procedural Background Generation
// ═══════════════════════════════════════════════════════════════════════════

var BackgroundGenerator = (function() {
    function BackgroundGenerator(scene, config) {
        this.scene = scene;
        this.config = config;
        this.generatedTextures = new Map();
    }

    BackgroundGenerator.prototype.createRNG = function(seed) {
        var state = seed >>> 0;
        return function() {
            state += 0x6d2b79f5;
            var t = state;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    };

    // Generate seamlessly looping noise for a given texture width
    BackgroundGenerator.prototype.generateLoopingNoise = function(length, step, magnitude, seed) {
        var values = [];
        var numSteps = Math.ceil(length / step);
        for (var i = 0; i <= numSteps; i++) {
            var angle = (i / numSteps) * Math.PI * 2;
            var val = Math.sin(angle + seed) * magnitude;
            val += Math.sin(angle * 2.3 + seed * 1.5) * (magnitude * 0.5);
            val += Math.sin(angle * 4.7 + seed * 2.1) * (magnitude * 0.25);
            if (i === numSteps) val = values[0]; // Ensure perfect loop
            values.push(val);
        }
        return values;
    };

    BackgroundGenerator.prototype.generateAllTextures = function() {
        console.log('[BackgroundGenerator] Starting texture generation...');

        for (var i = 0; i < LAYER_ORDER.length; i++) {
            var layerName = LAYER_ORDER[i];
            var layerConfig = BACKGROUND_LAYERS[layerName];
            this.generateLayerTexture(layerName, layerConfig);
        }

        console.log('[BackgroundGenerator] All textures generated!');
        return this.generatedTextures;
    };

    BackgroundGenerator.prototype.generateLayerTexture = function(layerName, layerConfig) {
        var worldWidth = this.config.worldWidth;
        var worldHeight = this.config.worldHeight;

        // Calculate texture width based on widthMultiplier for seamless parallax looping
        // horizonCity: 0.25 = generates at 1/4 width, tiles 4 times
        // midCity: 0.5 = generates at 1/2 width, tiles 2 times
        // terrain: 0.333 = generates at 1/3 width, tiles 3 times
        var textureWidth = worldWidth;
        if (layerConfig.widthMultiplier && layerConfig.widthMultiplier < 1) {
            textureWidth = Math.ceil(worldWidth * layerConfig.widthMultiplier);
        }

        var graphics = this.scene.add.graphics();
        var rng = this.createRNG((this.config.backgroundSeed || 1337) + layerConfig.depth * 1000);

        // Pass texture dimensions to generator for proper sizing
        var dims = {
            width: textureWidth,
            height: worldHeight,
            worldWidth: worldWidth,  // Original world width for reference
            worldHeight: worldHeight
        };

        if (typeof this[layerConfig.generator] === 'function') {
            this[layerConfig.generator](graphics, rng, dims);
        } else {
            console.warn('[BackgroundGenerator] Generator "' + layerConfig.generator + '" not found');
        }

        graphics.generateTexture(layerConfig.key, textureWidth, worldHeight);
        graphics.destroy();

        this.generatedTextures.set(layerName, layerConfig.key);
        console.log('[BackgroundGenerator] Generated: ' + layerConfig.key + ' (' + textureWidth + 'x' + worldHeight + ') - Tiles ' + Math.round(worldWidth / textureWidth) + 'x');

        return layerConfig.key;
    };

    // ═══════════════════════════════════════════════════════════════════════
    // LAYER GENERATORS
    // ═══════════════════════════════════════════════════════════════════════

    BackgroundGenerator.prototype.generateSkyLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var bandHeight = 20;

        graphics.fillStyle(0x0b0d22, 1);
        graphics.fillRect(0, 0, textureWidth, worldHeight);

        for (var y = 0; y < worldHeight; y += bandHeight) {
            var blend = y / worldHeight;
            var r = Math.floor(10 + blend * 40);
            var g = Math.floor(12 + blend * 50);
            var b = Math.floor(30 + blend * 100);
            var color = (r << 16) | (g << 8) | b;

            graphics.fillStyle(color, 1);
            graphics.fillRect(0, y, textureWidth, bandHeight + 1);
        }
    };

    BackgroundGenerator.prototype.generateAtmosphereLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;

        graphics.fillStyle(0x051225, 0.7);
        graphics.fillRect(0, 0, textureWidth, worldHeight);

        for (var i = 0; i < 10; i++) {
            var x = random() * textureWidth;
            var y = random() * worldHeight * 0.7;
            var radius = 120 + random() * 240;

            graphics.fillStyle(0x0b3b48, 0.06);
            graphics.fillCircle(x, y, radius * 1.4);
            graphics.fillStyle(0x0f4b5a, 0.09);
            graphics.fillCircle(x, y, radius);
        }

        for (var l = 0; l < 120; l++) {
            var lx = random() * textureWidth;
            var ly = random() * worldHeight * 0.5;
            var width = 100 + random() * 500;
            var height = 20 + random() * 60;

            graphics.fillStyle(0x2bb7c6, 0.025);
            graphics.fillEllipse(lx, ly, width, height);
        }
    };

    BackgroundGenerator.prototype.generateStarsLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;

        graphics.fillStyle(0x000000, 0);
        graphics.fillRect(0, 0, textureWidth, worldHeight);

        var starCount = Math.floor(350 + random() * 120);
        for (var i = 0; i < starCount; i++) {
            var x = random() * textureWidth;
            var y = random() * worldHeight * 0.6;
            var size = random();
            var brightness = 0.3 + random() * 0.7;

            if (size > 0.85) {
                graphics.fillStyle(0xffddaa, brightness);
                graphics.fillCircle(x, y, 2.2);
            } else if (size > 0.65) {
                graphics.fillStyle(0xbbe9ff, brightness);
                graphics.fillCircle(x, y, 1.6);
            } else {
                graphics.fillStyle(0xffffff, brightness);
                graphics.fillCircle(x, y, 1.1);
            }
        }
    };

    BackgroundGenerator.prototype.generateHorizonCityLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var horizonY = worldHeight * 0.58;

        graphics.fillStyle(0x0f172a, 1);
        graphics.fillRect(0, horizonY, textureWidth, worldHeight - horizonY);

        var widthRatio = textureWidth / this.config.worldWidth;
        var buildingCount = Math.max(6, Math.ceil(24 * widthRatio));

        for (var i = 0; i < buildingCount; i++) {
            var baseWidth = 60 + random() * 80;
            var buildingWidth = baseWidth * (0.6 + random() * 0.5);
            var buildingHeight = 80 + random() * 120;
            var x = i * (textureWidth / buildingCount) + random() * 40 * widthRatio;
            var y = horizonY - buildingHeight;

            if (x + buildingWidth > textureWidth) {
                buildingWidth = textureWidth - x;
            }
            if (buildingWidth < 10) continue;

            graphics.fillStyle(0x111827, 1);
            graphics.fillRect(x, y, buildingWidth, buildingHeight);

            var windowCountX = Math.floor(buildingWidth / 18);
            var windowCountY = Math.floor(buildingHeight / 22);

            for (var wy = 0; wy < windowCountY; wy++) {
                for (var wx = 0; wx < windowCountX; wx++) {
                    if (random() > 0.4) {
                        var light = random();
                        if (light > 0.8) graphics.fillStyle(0xffcc66, 0.8);
                        else if (light > 0.6) graphics.fillStyle(0x99ccff, 0.6);
                        else graphics.fillStyle(0x334155, 0.4);

                        graphics.fillRect(
                            x + 6 + wx * 16,
                            y + 6 + wy * 18,
                            6,
                            10
                        );
                    }
                }
            }
        }
    };

    BackgroundGenerator.prototype.generateMidCityLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var groundY = worldHeight * 0.72;

        graphics.fillStyle(0x0c1324, 1);
        graphics.fillRect(0, groundY, textureWidth, worldHeight - groundY);

        var widthRatio = textureWidth / this.config.worldWidth;
        var buildingCount = Math.max(5, Math.ceil(14 * widthRatio));
        var skylineNoise = this.generateLoopingNoise(textureWidth, 30, 60, random() * 20);

        for (var i = 0; i < buildingCount; i++) {
            var baseWidth = 80 + random() * 90;
            var buildingWidth = baseWidth * (0.75 + random() * 0.4);
            var x = i * (textureWidth / buildingCount) + random() * 30 * widthRatio;
            var noiseIndex = Math.floor((x / textureWidth) * skylineNoise.length) % skylineNoise.length;
            var buildingHeight = 150 + skylineNoise[noiseIndex] + random() * 50;
            var y = groundY - buildingHeight;

            if (x + buildingWidth > textureWidth) {
                buildingWidth = textureWidth - x;
            }
            if (buildingWidth < 20) continue;

            graphics.fillStyle(0x111827, 1);
            graphics.fillRect(x, y, buildingWidth, buildingHeight);

            var windowRows = Math.floor(buildingHeight / 20);
            var windowCols = Math.floor(buildingWidth / 16);

            for (var row = 0; row < windowRows; row++) {
                for (var col = 0; col < windowCols; col++) {
                    if (random() > 0.5) {
                        var lightState = random();
                        if (lightState > 0.85) graphics.fillStyle(0xffcc55, 0.85);
                        else if (lightState > 0.65) graphics.fillStyle(0x93c5fd, 0.6);
                        else graphics.fillStyle(0x1f2937, 0.7);

                        graphics.fillRect(
                            x + 6 + col * 14,
                            y + 8 + row * 18,
                            6,
                            10
                        );
                    }
                }
            }

            if (random() > 0.7) {
                var towerHeight = 30 + random() * 60;
                var towerWidth = 8 + random() * 12;
                graphics.fillStyle(0x1e293b, 1);
                graphics.fillRect(x + buildingWidth * 0.5 - towerWidth / 2, y - towerHeight, towerWidth, towerHeight);

                graphics.fillStyle(0xf97316, 0.8);
                graphics.fillCircle(x + buildingWidth * 0.5, y - towerHeight, 4 + random() * 3);
            }
        }
    };

    BackgroundGenerator.prototype.generateTerrainLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var groundY = worldHeight * 0.85;

        graphics.fillStyle(0x151515, 1);
        graphics.fillRect(0, groundY, textureWidth, worldHeight - groundY);

        var widthRatio = textureWidth / this.config.worldWidth;

        var topNoise = this.generateLoopingNoise(textureWidth, 12, 18, random() * 10);
        graphics.fillStyle(0x1d1d1d, 1);
        graphics.beginPath();
        graphics.moveTo(0, groundY);
        for (var i = 0; i < topNoise.length; i++) {
            var x = (i / (topNoise.length - 1)) * textureWidth;
            graphics.lineTo(x, groundY - topNoise[i]);
        }
        graphics.lineTo(textureWidth, groundY + 200);
        graphics.lineTo(0, groundY + 200);
        graphics.closePath();
        graphics.fillPath();

        // Debris
        var debrisCount = Math.max(6, Math.ceil(20 * widthRatio));
        for (var d = 0; d < debrisCount; d++) {
            var dx = random() * textureWidth;
            var dy = groundY + random() * 40;
            var size = 8 + random() * 18;

            graphics.fillStyle(0x202020, 1);
            graphics.fillRect(dx, dy, size, size * 0.5);
            graphics.fillStyle(0x2d2d2d, 0.6);
            graphics.fillRect(dx + 2, dy + 2, size * 0.7, size * 0.3);
        }

        // Tracks / Cracks
        var trackCount = Math.max(4, Math.ceil(10 * widthRatio));
        for (var t = 0; t < trackCount; t++) {
            var tx = random() * textureWidth;
            var ty = groundY + random() * 50;
            var length = 80 + random() * 180;

            graphics.fillStyle(0x2b2b2b, 0.8);
            graphics.fillRect(tx, ty, length, 2);
            graphics.fillRect(tx + random() * 10, ty + 6, length * 0.8, 2);
        }

        // Buildings (ruins)
        var ruinCount = Math.max(4, Math.ceil(12 * widthRatio));
        for (var r = 0; r < ruinCount; r++) {
            var rx = random() * textureWidth;
            var ry = groundY - 3 - random() * 35;
            graphics.fillRect(rx, ry, 3 + random() * 10, 2 + random() * 5);
        }

        // Toxic puddles - scale count
        var puddleCount = Math.max(1, Math.ceil(5 * widthRatio));
        for (var p = 0; p < puddleCount; p++) {
            var px = random() * textureWidth;
            var py = groundY + 10 + random() * 15;
            var pw = 20 + random() * 30;
            var ph = 5 + random() * 8;

            graphics.fillStyle(0x2a4a30, 0.4);
            graphics.fillEllipse(px, py, pw + 4, ph + 2);
            graphics.fillStyle(0x3a6a40, 0.6);
            graphics.fillEllipse(px, py, pw, ph);
        }

        // Foreground buildings - scale count for 1/3 width
        var buildingCount = Math.max(3, Math.ceil(18 * widthRatio));
        for (var b = 0; b < buildingCount; b++) {
            var bx = b * (textureWidth / buildingCount) + random() * 80 * widthRatio;
            var bWidth = 45 + random() * 70;
            var bHeight = 110 + random() * 150;
            var noiseIdx = Math.floor((bx / textureWidth) * topNoise.length) % topNoise.length;
            var by = groundY - topNoise[noiseIdx];
            var left = bx - bWidth / 2;
            var top = by - bHeight;

            // Clamp to texture bounds
            if (left < 0) left = 0;
            if (left + bWidth > textureWidth) bWidth = textureWidth - left;
            if (bWidth < 20) continue;

            graphics.fillStyle(0x1e1e2a, 1);
            graphics.beginPath();
            graphics.moveTo(left, by);
            graphics.lineTo(left, top + bHeight * 0.06);

            var segs = 5 + Math.floor(random() * 5);
            for (var s = 0; s <= segs; s++) {
                graphics.lineTo(left + (bWidth / segs) * s, top + random() * bHeight * 0.32);
            }

            graphics.lineTo(left + bWidth, top + bHeight * 0.04);
            graphics.lineTo(left + bWidth, by);
            graphics.closePath();
            graphics.fillPath();

            // Rubble pile
            graphics.fillStyle(0x161620, 1);
            for (var rb = 0; rb < 12; rb++) {
                var rubbleX = left - 18 + random() * (bWidth + 36);
                if (rubbleX < 0) rubbleX = 0;
                if (rubbleX > textureWidth - 8) continue;

                graphics.fillRect(
                    rubbleX,
                    by - 4 + random() * 25,
                    8 + random() * 18,
                    4 + random() * 12
                );
            }

            // Windows
            for (var fy = 20; fy < bHeight * 0.45; fy += 20) {
                for (var wx = 10; wx < bWidth - 15; wx += 16) {
                    if (random() > 0.28) {
                        var state = random();
                        if (state > 0.9) {
                            graphics.fillStyle(0xff2200, 0.9);
                        } else if (state > 0.65) {
                            graphics.fillStyle(0xaaccee, 0.7);
                        } else {
                            graphics.fillStyle(0x0e0e18, 0.95);
                        }
                        graphics.fillRect(left + wx, top + fy, 12, 14);
                    }
                }
            }

            // Fire
            if (random() > 0.25) {
                var fx = left + bWidth * 0.2 + random() * bWidth * 0.6;
                var fy = top + bHeight * 0.12 + random() * bHeight * 0.4;

                graphics.fillStyle(0xff1100, 0.15);
                graphics.fillCircle(fx, fy, 35);
                graphics.fillStyle(0xff5500, 0.55);
                graphics.fillCircle(fx, fy, 16);
                graphics.fillStyle(0xff8800, 0.75);
                graphics.fillCircle(fx, fy - 4, 10);

                // Smoke
                graphics.fillStyle(0x1a1a1a, 0.2);
                graphics.fillCircle(fx - 8, fy - 40, 18);
                graphics.fillCircle(fx + 5, fy - 60, 22);
            }
        }

        // Warning signs - scale count
        var signCount = Math.max(1, Math.ceil(4 * widthRatio));
        for (var sgn = 0; sgn < signCount; sgn++) {
            var sx = random() * textureWidth;
            var sy = groundY - 5;

            graphics.fillStyle(0x3a3530, 1);
            graphics.fillRect(sx - 1, sy - 25, 3, 25);
            graphics.fillStyle(0xaaaa30, 0.8);
            graphics.fillRect(sx - 10, sy - 35, 20, 12);
        }
    };

    return BackgroundGenerator;
})();
