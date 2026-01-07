// ═══════════════════════════════════════════════════════════════════════════
// backgroundGeneratorIndustrial.js - Industrial/Toxic Style Background
// ═══════════════════════════════════════════════════════════════════════════

var BackgroundGeneratorIndustrial = (function() {
    function BackgroundGeneratorIndustrial(scene, config) {
        this.scene = scene;
        this.config = config;
        this.generatedTextures = new Map();
    }

    BackgroundGeneratorIndustrial.prototype.createRNG = function(seed) {
        var state = seed >>> 0;
        return function() {
            state += 0x6d2b79f5;
            var t = state;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    };

    BackgroundGeneratorIndustrial.prototype.generateLoopingNoise = function(length, step, magnitude, seed) {
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

    BackgroundGeneratorIndustrial.prototype.generateAllTextures = function() {
        console.log('[BackgroundGeneratorIndustrial] Starting texture generation...');

        for (var i = 0; i < LAYER_ORDER.length; i++) {
            var layerName = LAYER_ORDER[i];
            var layerConfig = BACKGROUND_LAYERS[layerName];
            this.generateLayerTexture(layerName, layerConfig);
        }

        console.log('[BackgroundGeneratorIndustrial] All textures generated!');
        return this.generatedTextures;
    };

    BackgroundGeneratorIndustrial.prototype.generateLayerTexture = function(layerName, layerConfig) {
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
            console.warn('[BackgroundGeneratorIndustrial] Generator "' + layerConfig.generator + '" not found');
        }

        graphics.generateTexture(layerConfig.key, textureWidth, worldHeight);
        graphics.destroy();

        this.generatedTextures.set(layerName, layerConfig.key);
        console.log('[BackgroundGeneratorIndustrial] Generated: ' + layerConfig.key + ' (' + textureWidth + 'x' + worldHeight + ')');

        return layerConfig.key;
    };

    // ═══════════════════════════════════════════════════════════════════════
    // INDUSTRIAL STYLE LAYER GENERATORS - Green/Gray Toxic Theme
    // ═══════════════════════════════════════════════════════════════════════

    BackgroundGeneratorIndustrial.prototype.generateSkyLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var bandHeight = 20;

        // Toxic green/gray sky gradient
        for (var y = 0; y < worldHeight; y += bandHeight) {
            var t = y / worldHeight;
            var r, g, b;

            if (t < 0.2) {
                // Dark gray-green top
                r = Math.floor(15 + t * 25);
                g = Math.floor(20 + t * 35);
                b = Math.floor(15 + t * 25);
            } else if (t < 0.4) {
                // Transition to sickly green
                var mt = (t - 0.2) / 0.2;
                r = Math.floor(40 + mt * 30);
                g = Math.floor(55 + mt * 45);
                b = Math.floor(40 + mt * 20);
            } else if (t < 0.6) {
                // Brighter toxic green
                var mt2 = (t - 0.4) / 0.2;
                r = Math.floor(70 + mt2 * 30);
                g = Math.floor(100 + mt2 * 40);
                b = Math.floor(60 + mt2 * 20);
            } else if (t < 0.8) {
                // Fade to murky yellow-green
                var bt = (t - 0.6) / 0.2;
                r = Math.floor(100 - bt * 20);
                g = Math.floor(140 - bt * 40);
                b = Math.floor(80 - bt * 30);
            } else {
                // Deep murky green near ground
                var bt2 = (t - 0.8) / 0.2;
                r = Math.floor(80 - bt2 * 30);
                g = Math.floor(100 - bt2 * 40);
                b = Math.floor(50 - bt2 * 25);
            }

            graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
            graphics.fillRect(0, y, textureWidth, bandHeight + 1);
        }
    };

    BackgroundGeneratorIndustrial.prototype.generateAtmosphereLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;

        // Toxic smoke plumes
        for (var i = 0; i < 12; i++) {
            var px = random() * textureWidth;
            var py = worldHeight * 0.3 + random() * worldHeight * 0.3;

            // Layered smoke
            for (var s = 0; s < 7; s++) {
                var size = 40 + s * 18;
                var alpha = 0.12 - s * 0.015;
                var color = random() > 0.5 ? 0x4a5a3a : 0x3a4a3a;
                graphics.fillStyle(color, alpha);
                graphics.fillCircle(px + s * 10 - 25, py - s * 45, size);
            }
        }

        // Smog bands
        for (var i = 0; i < 6; i++) {
            var by = worldHeight * 0.45 + i * 45;
            graphics.fillStyle(0x5a6a4a, 0.06);
            graphics.fillRect(0, by, textureWidth, 30 + random() * 35);
        }

        // Chemical haze
        graphics.fillStyle(0x6a7a5a, 0.08);
        graphics.fillRect(0, worldHeight * 0.55, textureWidth, worldHeight * 0.25);
    };

    BackgroundGeneratorIndustrial.prototype.generateStarsLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;

        // Very few stars visible through pollution
        for (var i = 0; i < 60; i++) {
            var x = random() * textureWidth;
            var y = random() * (worldHeight * 0.3);
            var brightness = 0.1 + random() * 0.3;

            graphics.fillStyle(0xccddaa, brightness);
            var size = 1;
            graphics.fillRect(x, y, size, size);
        }

        // Polluted moon glow
        var moonX = textureWidth * (0.65 + random() * 0.25);
        var moonY = worldHeight * 0.2;

        graphics.fillStyle(0x88aa66, 0.08);
        graphics.fillCircle(moonX, moonY, 70);
        graphics.fillStyle(0xaacc88, 0.12);
        graphics.fillCircle(moonX, moonY, 45);
        graphics.fillStyle(0xccee99, 0.18);
        graphics.fillCircle(moonX, moonY, 25);

        // Industrial lights/flares in distance
        for (var i = 0; i < 8; i++) {
            var fx = random() * textureWidth;
            var fy = worldHeight * 0.4 + random() * worldHeight * 0.15;
            var color = random() > 0.5 ? 0xff6644 : 0xffaa44;
            graphics.fillStyle(color, 0.2);
            graphics.fillCircle(fx, fy, 12);
            graphics.fillStyle(color, 0.35);
            graphics.fillCircle(fx, fy, 6);
        }
    };

    BackgroundGeneratorIndustrial.prototype.generateHorizonCityLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var horizonY = worldHeight - 120;
        var seed = (this.config.backgroundSeed || 1337) + 100;

        var noiseStep = 15;
        var skylineNoise = this.generateLoopingNoise(textureWidth, noiseStep, 50, seed * 0.7);
        var detailNoise = this.generateLoopingNoise(textureWidth, noiseStep * 0.5, 20, seed * 1.3);

        // Factory silhouettes
        graphics.fillStyle(0x1a1a1a, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);

        var buildingRng = this.createRNG(seed);
        var buildingRandom = function() { return buildingRng(); };

        for (var i = 0; i < skylineNoise.length; i++) {
            var x = i * noiseStep;
            if (x > textureWidth) break;

            var detailIdx = Math.min(i * 2, detailNoise.length - 1);
            var baseHeight = 30 + Math.abs(skylineNoise[i]) + Math.abs(detailNoise[detailIdx]) * 0.4;

            var hasSmokestacks = buildingRandom() > 0.6;

            graphics.lineTo(x, horizonY - baseHeight);

            if (hasSmokestacks && i > 0 && i < skylineNoise.length - 2) {
                // Add smokestacks
                var stackHeight = 15 + random() * 20;
                graphics.lineTo(x + noiseStep * 0.2, horizonY - baseHeight);
                graphics.lineTo(x + noiseStep * 0.2, horizonY - baseHeight - stackHeight);
                graphics.lineTo(x + noiseStep * 0.3, horizonY - baseHeight - stackHeight);
                graphics.lineTo(x + noiseStep * 0.3, horizonY - baseHeight);

                graphics.lineTo(x + noiseStep * 0.7, horizonY - baseHeight);
                graphics.lineTo(x + noiseStep * 0.7, horizonY - baseHeight - stackHeight * 0.8);
                graphics.lineTo(x + noiseStep * 0.8, horizonY - baseHeight - stackHeight * 0.8);
                graphics.lineTo(x + noiseStep * 0.8, horizonY - baseHeight);
            }
        }

        graphics.lineTo(textureWidth, horizonY - 30);
        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        // Smoke from stacks
        var smokeCount = Math.max(3, Math.ceil(12 * (textureWidth / dims.worldWidth)));
        for (var i = 0; i < smokeCount; i++) {
            var sx = random() * textureWidth;
            var sy = horizonY - 30 - random() * 40;

            for (var p = 0; p < 4; p++) {
                graphics.fillStyle(0x3a4a3a, 0.15 - p * 0.03);
                graphics.fillCircle(sx + p * 8, sy - p * 15, 12 + p * 6);
            }
        }

        // Industrial warning lights
        var lightCount = Math.max(5, Math.ceil(15 * (textureWidth / dims.worldWidth)));
        for (var i = 0; i < lightCount; i++) {
            var lx = random() * textureWidth;
            var ly = horizonY - 15 - random() * 50;
            if (random() > 0.5) {
                graphics.fillStyle(0xff4422, 0.4);
                graphics.fillCircle(lx, ly, 3);
            }
        }
    };

    BackgroundGeneratorIndustrial.prototype.generateMidCityLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var worldWidthRef = dims ? dims.worldWidth : this.config.worldWidth;
        var groundY = worldHeight - 100;
        var widthRatio = textureWidth / worldWidthRef;
        var seed = (this.config.backgroundSeed || 1337) + 200;

        // Pipelines and industrial infrastructure
        graphics.fillStyle(0x2a2a2a, 1);

        var pipelineCount = Math.max(3, Math.ceil(8 * widthRatio));
        for (var i = 0; i < pipelineCount; i++) {
            var px = i * (textureWidth / pipelineCount) + random() * 40 * widthRatio;
            var py = groundY - 30 - random() * 40;
            var pipeWidth = 8 + random() * 12;
            var pipeLength = 60 + random() * 100;

            // Horizontal pipe
            graphics.fillRect(px, py, pipeLength, pipeWidth);

            // Support pillars
            for (var s = 0; s < 3; s++) {
                graphics.fillRect(px + s * (pipeLength / 3), py + pipeWidth, 6, 30);
            }

            // Joints/connectors
            graphics.fillStyle(0x4a4a4a, 1);
            graphics.fillRect(px + pipeLength * 0.3, py - 4, pipeWidth + 8, pipeWidth + 8);
            graphics.fillRect(px + pipeLength * 0.7, py - 4, pipeWidth + 8, pipeWidth + 8);
            graphics.fillStyle(0x2a2a2a, 1);
        }

        // Factory buildings
        var buildingNoise = this.generateLoopingNoise(textureWidth, 30, 55, seed * 0.5);
        var buildingCount = Math.max(4, Math.ceil(18 * widthRatio));

        for (var i = 0; i < buildingCount; i++) {
            var bx = i * (textureWidth / buildingCount) + random() * 30 * widthRatio;
            var bWidth = 30 + random() * 50;

            var noiseIdx = Math.floor((bx / textureWidth) * buildingNoise.length) % buildingNoise.length;
            var bHeight = 60 + Math.abs(buildingNoise[noiseIdx]) + random() * 40;

            var by = worldHeight - 92;
            var left = bx - bWidth / 2;
            var top = by - bHeight;

            if (left < 0) left = 0;
            if (left + bWidth > textureWidth) bWidth = textureWidth - left;
            if (bWidth < 12) continue;

            graphics.fillStyle(0x1a1a1a, 1);
            graphics.fillRect(left, top, bWidth, bHeight);

            // Industrial vents
            graphics.fillStyle(0x2a2a2a, 1);
            for (var v = 0; v < 3; v++) {
                graphics.fillRect(
                    left + 5 + v * (bWidth / 3),
                    top + bHeight * 0.2,
                    6, 12
                );
            }

            // Smokestacks on some buildings
            if (random() > 0.5) {
                var stackX = left + bWidth * 0.3;
                var stackHeight = 20 + random() * 30;
                graphics.fillStyle(0x252525, 1);
                graphics.fillRect(stackX, top - stackHeight, 8, stackHeight);
                graphics.fillRect(stackX + bWidth * 0.4, top - stackHeight * 0.7, 8, stackHeight * 0.7);

                // Smoke
                for (var s = 0; s < 3; s++) {
                    graphics.fillStyle(0x3a4a3a, 0.2 - s * 0.05);
                    graphics.fillCircle(stackX + 4, top - stackHeight - s * 12, 10 + s * 5);
                }
            }

            // Warning lights
            graphics.fillStyle(0xff3300, 0.6);
            for (var l = 0; l < 3; l++) {
                if (random() > 0.7) {
                    graphics.fillCircle(
                        left + 5 + l * (bWidth / 3),
                        top + 5,
                        2
                    );
                }
            }

            // Windows (fewer than residential)
            graphics.fillStyle(0x4a5a3a, 0.5);
            for (var fy = 15; fy < bHeight - 10; fy += 20) {
                for (var wx = 8; wx < bWidth - 10; wx += 15) {
                    if (random() > 0.6) {
                        var state = random();
                        if (state > 0.8) {
                            graphics.fillStyle(0xff6622, 0.6);
                        } else if (state > 0.5) {
                            graphics.fillStyle(0x6a7a5a, 0.5);
                        } else {
                            graphics.fillStyle(0x101010, 0.9);
                        }
                        graphics.fillRect(left + wx, top + fy, 5, 10);
                    }
                }
            }
        }

        // Conveyor systems
        var conveyorCount = Math.max(2, Math.ceil(5 * widthRatio));
        for (var i = 0; i < conveyorCount; i++) {
            var cx = random() * textureWidth;
            var cy = groundY - 45;

            graphics.fillStyle(0x3a3a3a, 0.8);
            graphics.fillRect(cx, cy, 80, 6);
            graphics.fillRect(cx + 10, cy - 10, 4, 16);
            graphics.fillRect(cx + 50, cy - 10, 4, 16);
        }
    };

    BackgroundGeneratorIndustrial.prototype.generateTerrainLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var worldWidthRef = dims ? dims.worldWidth : this.config.worldWidth;
        var widthRatio = textureWidth / worldWidthRef;
        var groundY = worldHeight - 80;

        // Polluted industrial ground
        var baseNoise = this.generateLoopingNoise(textureWidth, 35, 20, 0.5);
        var midNoise = this.generateLoopingNoise(textureWidth, 25, 12, 1.2);
        var topNoise = this.generateLoopingNoise(textureWidth, 28, 8, 2.1);

        // Base layer (darkest)
        graphics.fillStyle(0x1a1a15, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        for (var i = 0; i < baseNoise.length; i++) {
            var x = i * 35;
            if (x > textureWidth) break;
            graphics.lineTo(x, groundY - baseNoise[i] - 12);
        }
        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        // Mid layer
        graphics.fillStyle(0x2a2a20, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        for (var i = 0; i < midNoise.length; i++) {
            var x = i * 25;
            if (x > textureWidth) break;
            graphics.lineTo(x, groundY - midNoise[i] - 6);
        }
        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        // Top layer
        graphics.fillStyle(0x3a3a25, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        for (var i = 0; i < topNoise.length; i++) {
            var x = i * 28;
            if (x > textureWidth) break;
            graphics.lineTo(x, groundY - topNoise[i] - 2);
        }
        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        // Toxic puddles (more than other styles)
        var puddleCount = Math.max(3, Math.ceil(15 * widthRatio));
        for (var i = 0; i < puddleCount; i++) {
            var px = random() * textureWidth;
            var py = groundY + 8 + random() * 18;
            var pw = 25 + random() * 40;
            var ph = 6 + random() * 10;

            graphics.fillStyle(0x3a5a30, 0.5);
            graphics.fillEllipse(px, py, pw + 6, ph + 3);
            graphics.fillStyle(0x4a7a40, 0.7);
            graphics.fillEllipse(px, py, pw, ph);

            // Bubbles
            if (random() > 0.7) {
                graphics.fillStyle(0x5a8a50, 0.5);
                graphics.fillCircle(px + random() * 10 - 5, py, 3);
            }
        }

        // Industrial waste barrels
        var barrelCount = Math.max(4, Math.ceil(20 * widthRatio));
        for (var i = 0; i < barrelCount; i++) {
            var bx = random() * textureWidth;
            var by = groundY + random() * 15;
            var fallen = random() > 0.6;

            graphics.fillStyle(0x4a3a2a, 1);
            if (fallen) {
                graphics.fillRect(bx, by, 14, 10);
                graphics.fillRect(bx + 3, by + 2, 8, 6);
            } else {
                graphics.fillRect(bx, by, 10, 14);
                graphics.fillRect(bx + 2, by + 3, 6, 8);
            }

            // Hazard symbol
            graphics.fillStyle(0xccaa33, 0.6);
            graphics.fillCircle(bx + 5, by + 5, 3);
        }

        // Rusted pipes
        var pipeCount = Math.max(5, Math.ceil(25 * widthRatio));
        for (var i = 0; i < pipeCount; i++) {
            var px = random() * textureWidth;
            var py = groundY - 5 + random() * 25;
            var pLen = 40 + random() * 80;

            graphics.fillStyle(0x3a2a2a, 1);
            graphics.fillRect(px, py, pLen, 5);
            graphics.fillRect(px + pLen * 0.3, py - 2, 8, 9);
            graphics.fillRect(px + pLen * 0.7, py - 2, 8, 9);
        }

        // Industrial buildings/warehouses
        var buildingCount = Math.max(3, Math.ceil(14 * widthRatio));
        for (var i = 0; i < buildingCount; i++) {
            var bx = i * (textureWidth / buildingCount) + random() * 70 * widthRatio;
            var bWidth = 50 + random() * 80;
            var bHeight = 100 + random() * 140;
            var noiseIdx = Math.floor((bx / textureWidth) * topNoise.length) % topNoise.length;
            var by = groundY - topNoise[noiseIdx];
            var left = bx - bWidth / 2;
            var top = by - bHeight;

            if (left < 0) left = 0;
            if (left + bWidth > textureWidth) bWidth = textureWidth - left;
            if (bWidth < 25) continue;

            graphics.fillStyle(0x2a2a2a, 1);
            graphics.fillRect(left, top, bWidth, bHeight);

            // Corrugated siding effect
            graphics.fillStyle(0x1a1a1a, 0.3);
            for (var s = 0; s < bWidth; s += 8) {
                graphics.fillRect(left + s, top, 4, bHeight);
            }

            // Large industrial doors
            graphics.fillStyle(0x3a3a3a, 1);
            graphics.fillRect(left + bWidth * 0.2, by - bHeight * 0.4, bWidth * 0.25, bHeight * 0.35);

            // Door details
            graphics.fillStyle(0x1a1a1a, 1);
            for (var d = 0; d < 5; d++) {
                graphics.fillRect(
                    left + bWidth * 0.2,
                    by - bHeight * 0.4 + d * (bHeight * 0.07),
                    bWidth * 0.25,
                    2
                );
            }

            // Vents
            graphics.fillStyle(0x4a4a4a, 0.7);
            for (var v = 0; v < 4; v++) {
                graphics.fillRect(
                    left + bWidth * 0.6 + v * 10,
                    top + bHeight * 0.3,
                    6, 15
                );
            }

            // Warning lights on corners
            graphics.fillStyle(0xff3300, 0.7);
            graphics.fillCircle(left + 5, top + 5, 3);
            graphics.fillCircle(left + bWidth - 5, top + 5, 3);

            // Smokestacks
            if (random() > 0.6) {
                var stackX = left + bWidth * 0.7;
                var stackHeight = 30 + random() * 40;
                graphics.fillStyle(0x2a2a2a, 1);
                graphics.fillRect(stackX, top - stackHeight, 10, stackHeight);

                // Active smoke
                for (var s = 0; s < 5; s++) {
                    graphics.fillStyle(0x3a4a3a, 0.15 - s * 0.025);
                    graphics.fillCircle(stackX + 5, top - stackHeight - s * 12, 12 + s * 6);
                }
            }

            // Leaking pipes
            if (random() > 0.5) {
                var pipeX = left + bWidth * 0.4;
                graphics.fillStyle(0x2a2a2a, 1);
                graphics.fillRect(pipeX, top + bHeight * 0.6, 6, bHeight * 0.4);

                // Leak effect
                graphics.fillStyle(0x4a7a40, 0.4);
                graphics.fillCircle(pipeX + 3, by - bHeight * 0.2, 8);
                graphics.fillCircle(pipeX + 3, by - bHeight * 0.1, 6);
            }
        }

        // Hazard signs
        var signCount = Math.max(2, Math.ceil(6 * widthRatio));
        for (var i = 0; i < signCount; i++) {
            var sx = random() * textureWidth;
            var sy = groundY - 3;

            graphics.fillStyle(0x2a2a2a, 1);
            graphics.fillRect(sx - 2, sy - 28, 4, 28);

            // Triangular hazard sign
            graphics.fillStyle(0xccaa33, 0.9);
            graphics.beginPath();
            graphics.moveTo(sx, sy - 48);
            graphics.lineTo(sx - 12, sy - 28);
            graphics.lineTo(sx + 12, sy - 28);
            graphics.closePath();
            graphics.fillPath();

            // Exclamation mark
            graphics.fillStyle(0x1a1a1a, 1);
            graphics.fillRect(sx - 2, sy - 44, 4, 10);
            graphics.fillCircle(sx, sy - 32, 2);
        }
    };

    return BackgroundGeneratorIndustrial;
})();
