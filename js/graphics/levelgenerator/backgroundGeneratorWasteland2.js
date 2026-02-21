// ═══════════════════════════════════════════════════════════════════════════
// backgroundGeneratorWasteland2.js - Urban Ruins Wasteland Style
// Based on parralax_City.html - Features destroyed urban landscape with
// collapsed buildings, power lines, bridge ruins, and heavy fire/smoke
// ═══════════════════════════════════════════════════════════════════════════

var BackgroundGeneratorWasteland2 = (function() {
    /**
     * Handles the BackgroundGeneratorWasteland2 routine and encapsulates its core gameplay logic.
     * Parameters: scene, config.
     * Returns: value defined by the surrounding game flow.
     */
    function BackgroundGeneratorWasteland2(scene, config) {
        this.scene = scene;
        this.config = config;
        this.generatedTextures = new Map();
    }

    /**
     * Handles the createRNG routine and encapsulates its core gameplay logic.
     * Parameters: seed.
     * Returns: value defined by the surrounding game flow.
     */
    BackgroundGeneratorWasteland2.prototype.createRNG = function(seed) {
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
    BackgroundGeneratorWasteland2.prototype.generateLoopingNoise = function(length, step, magnitude, seed) {
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
    BackgroundGeneratorWasteland2.prototype.generateAllTextures = function() {
        console.log('[BackgroundGeneratorWasteland2] Starting texture generation...');

        for (var i = 0; i < LAYER_ORDER.length; i++) {
            var layerName = LAYER_ORDER[i];
            var layerConfig = BACKGROUND_LAYERS[layerName];
            this.generateLayerTexture(layerName, layerConfig);
        }

        console.log('[BackgroundGeneratorWasteland2] All textures generated!');
        return this.generatedTextures;
    };

    /**
     * Handles the generateLayerTexture routine and encapsulates its core gameplay logic.
     * Parameters: layerName, layerConfig.
     * Returns: value defined by the surrounding game flow.
     */
    BackgroundGeneratorWasteland2.prototype.generateLayerTexture = function(layerName, layerConfig) {
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
            console.warn('[BackgroundGeneratorWasteland2] Generator "' + layerConfig.generator + '" not found');
        }

        graphics.generateTexture(layerConfig.key, textureWidth, worldHeight);
        graphics.destroy();

        this.generatedTextures.set(layerName, layerConfig.key);
        console.log('[BackgroundGeneratorWasteland2] Generated: ' + layerConfig.key);

        return layerConfig.key;
    };

    // ═══════════════════════════════════════════════════════════════════════
    // URBAN RUINS WASTELAND STYLE GENERATORS
    // ═══════════════════════════════════════════════════════════════════════

    BackgroundGeneratorWasteland2.prototype.generateSkyLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var bandHeight = 20;

        // Post-apocalyptic sky gradient
        for (var y = 0; y < worldHeight; y += bandHeight) {
            var t = y / worldHeight;
            var r, g, b;
            
            if (t < 0.15) {
                r = Math.floor(5 + t * 20);
                g = Math.floor(8 + t * 25);
                b = Math.floor(25 + t * 35);
            } else if (t < 0.35) {
                var mt = (t - 0.15) / 0.2;
                r = Math.floor(13 + mt * 35);
                g = Math.floor(14 + mt * 20);
                b = Math.floor(43 + mt * 10);
            } else if (t < 0.55) {
                var mt2 = (t - 0.35) / 0.2;
                r = Math.floor(48 + mt2 * 60);
                g = Math.floor(34 + mt2 * 20);
                b = Math.floor(53 - mt2 * 30);
            } else if (t < 0.75) {
                var bt = (t - 0.55) / 0.2;
                r = Math.floor(108 - bt * 30);
                g = Math.floor(54 - bt * 25);
                b = Math.floor(23 - bt * 10);
            } else {
                var bt2 = (t - 0.75) / 0.25;
                r = Math.floor(78 - bt2 * 45);
                g = Math.floor(29 - bt2 * 18);
                b = Math.floor(13 - bt2 * 8);
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
    BackgroundGeneratorWasteland2.prototype.generateAtmosphereLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;

        // Smoke plumes from fires
        for (var i = 0; i < 8; i++) {
            var px = random() * textureWidth;
            var py = worldHeight * 0.3 + random() * worldHeight * 0.3;
            
            for (var s = 0; s < 6; s++) {
                var size = 30 + s * 15;
                var alpha = 0.08 - s * 0.01;
                graphics.fillStyle(0x222222, alpha);
                graphics.fillCircle(px + s * 8 - 20, py - s * 40, size);
            }
        }
        
        // Toxic clouds
        graphics.fillStyle(0x443355, 0.06);
        for (var i = 0; i < 12; i++) {
            var cx = random() * textureWidth;
            var cy = worldHeight * 0.15 + random() * worldHeight * 0.25;
            var width = 100 + random() * 200;
            var height = 30 + random() * 60;
            graphics.fillEllipse(cx, cy, width, height);
        }
        
        // Haze bands
        for (var i = 0; i < 5; i++) {
            var by = worldHeight * 0.4 + i * 50;
            graphics.fillStyle(0x4a3a30, 0.04);
            graphics.fillRect(0, by, textureWidth, 30 + random() * 40);
        }
    };

    /**
     * Handles the generateStarsLayer routine and encapsulates its core gameplay logic.
     * Parameters: graphics, random, dims.
     * Returns: value defined by the surrounding game flow.
     */
    BackgroundGeneratorWasteland2.prototype.generateStarsLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;

        // Stars
        for (var i = 0; i < 180; i++) {
            var x = random() * textureWidth;
            var y = random() * (worldHeight * 0.45);
            var brightness = 0.2 + random() * 0.8;
            
            if (random() > 0.85) {
                graphics.fillStyle(0xffaa88, brightness * 0.7);
            } else if (random() > 0.9) {
                graphics.fillStyle(0x88aaff, brightness * 0.8);
            } else {
                graphics.fillStyle(0xffffff, brightness);
            }
            
            var size = random() > 0.9 ? 2 : 1;
            graphics.fillRect(x, y, size, size);
            
            if (random() > 0.95) {
                graphics.fillStyle(0xffffff, brightness * 0.3);
                graphics.fillRect(x - 1, y, 3, 1);
                graphics.fillRect(x, y - 1, 1, 3);
            }
        }
        
        // Debris/falling ash
        for (var i = 0; i < 5; i++) {
            var dx = random() * textureWidth;
            var dy = random() * (worldHeight * 0.3);
            graphics.fillStyle(0xffffff, 0.7);
            graphics.fillRect(dx, dy, 3, 1);
            graphics.fillStyle(0xff4400, 0.5);
            graphics.fillRect(dx + 3, dy, 2, 1);
        }
        
        // Distant explosions/fires
        for (var i = 0; i < 3; i++) {
            var fx = random() * textureWidth;
            var fy = worldHeight * 0.5 + random() * worldHeight * 0.2;
            graphics.fillStyle(0xff8844, 0.15);
            graphics.fillCircle(fx, fy, 25);
            graphics.fillStyle(0xffcc66, 0.25);
            graphics.fillCircle(fx, fy, 12);
        }
    };

    /**
     * Handles the generateHorizonCityLayer routine and encapsulates its core gameplay logic.
     * Parameters: graphics, random, dims.
     * Returns: value defined by the surrounding game flow.
     */
    BackgroundGeneratorWasteland2.prototype.generateHorizonCityLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var horizonY = worldHeight - 120;
        var seed = (this.config.backgroundSeed || 1337) + 100;
        
        graphics.fillStyle(0x060608, 1);
        
        var copyRng = this.createRNG(seed);
        /**
         * Handles the cRand routine and encapsulates its core gameplay logic.
         * Parameters: none.
         * Returns: value defined by the surrounding game flow.
         */
        var cRand = function() { return copyRng(); };
        
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        var hx = 0;
        
        while (hx < textureWidth + 50) {
            var bw = 8 + cRand() * 25;
            var bh = 20 + cRand() * 70;
            var destroyed = cRand() > 0.6;
            
            if (destroyed) {
                graphics.lineTo(hx, horizonY - bh * 0.3);
                graphics.lineTo(hx + bw * 0.3, horizonY - bh);
                graphics.lineTo(hx + bw * 0.6, horizonY - bh * 0.5);
                graphics.lineTo(hx + bw, horizonY - bh * 0.7);
            } else {
                graphics.lineTo(hx, horizonY - bh);
                graphics.lineTo(hx + bw, horizonY - bh);
            }
            hx += bw + cRand() * 5;
        }
        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();
        
        // Fires
        for (var i = 0; i < 10; i++) {
            var fx = random() * textureWidth;
            graphics.fillStyle(0xff3300, 0.2);
            graphics.fillCircle(fx, horizonY - 20, 12);
            graphics.fillStyle(0xff6600, 0.35);
            graphics.fillCircle(fx, horizonY - 20, 6);
        }
    };

    /**
     * Handles the generateMidCityLayer routine and encapsulates its core gameplay logic.
     * Parameters: graphics, random, dims.
     * Returns: value defined by the surrounding game flow.
     */
    BackgroundGeneratorWasteland2.prototype.generateMidCityLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var worldWidthRef = dims ? dims.worldWidth : this.config.worldWidth;
        var widthRatio = textureWidth / worldWidthRef;
        var bridgeY = worldHeight - 100;
        var seed = (this.config.backgroundSeed || 1337) + 200;
        
        graphics.fillStyle(0x181820, 1);
        
        // Bridge pillars
        var pillarCount = Math.max(2, Math.ceil(8 * widthRatio));
        for (var i = 0; i < pillarCount; i++) {
            var px = i * (textureWidth / pillarCount) + 50;
            if (random() > 0.6) {
                // Collapsed
                graphics.beginPath();
                graphics.moveTo(px - 8, bridgeY + 20);
                graphics.lineTo(px - 8, bridgeY - 30);
                graphics.lineTo(px - 3, bridgeY - 50);
                graphics.lineTo(px + 5, bridgeY - 35);
                graphics.lineTo(px + 8, bridgeY + 20);
                graphics.closePath();
                graphics.fillPath();
            } else {
                graphics.fillRect(px - 8, bridgeY - 60, 16, 80);
            }
        }
        
        // Road segments
        var segmentCount = Math.max(2, Math.ceil(6 * widthRatio));
        for (var i = 0; i < segmentCount; i++) {
            var segX = i * (textureWidth / segmentCount) + random() * 100;
            var segY = bridgeY - 55 + random() * 30;
            var segW = 60 + random() * 80;
            var ang = -0.1 + random() * 0.2;
            
            graphics.fillStyle(0x1a1a24, 1);
            graphics.beginPath();
            graphics.moveTo(segX, segY);
            graphics.lineTo(segX + segW, segY + segW * ang);
            graphics.lineTo(segX + segW, segY + segW * ang + 8);
            graphics.lineTo(segX, segY + 8);
            graphics.closePath();
            graphics.fillPath();
            
            graphics.fillStyle(0xffff00, 0.3);
            graphics.fillRect(segX + 10, segY + 3, 15, 2);
            graphics.fillRect(segX + 35, segY + 3, 15, 2);
        }
        
        // Buildings with looping noise
        var buildingNoise = this.generateLoopingNoise(textureWidth, 30, 60, seed * 0.5);
        var buildingCount = Math.max(4, Math.ceil(28 * widthRatio));
        
        for (var i = 0; i < buildingCount; i++) {
            var bx = (i * (textureWidth / buildingCount)) + random() * 50;
            var bWidth = 28 + random() * 50;
            var noiseIdx = Math.floor((bx / textureWidth) * buildingNoise.length) % buildingNoise.length;
            var bHeight = 70 + Math.abs(buildingNoise[noiseIdx]) + random() * 50;
            var by = worldHeight - 92;
            var left = bx - bWidth / 2;
            var top = by - bHeight;
            var destroyed = random() > 0.35;
            
            if (left < 0) left = 0;
            if (left + bWidth > textureWidth) bWidth = textureWidth - left;
            if (bWidth < 10) continue;
            
            graphics.fillStyle(0x161620, 1);
            
            if (destroyed) {
                graphics.beginPath();
                graphics.moveTo(left, by);
                graphics.lineTo(left, top + bHeight * 0.12);
                var segs = 3 + Math.floor(random() * 4);
                for (var s = 0; s <= segs; s++) {
                    graphics.lineTo(left + (bWidth / segs) * s, top + random() * bHeight * 0.35);
                }
                graphics.lineTo(left + bWidth, top + bHeight * 0.1);
                graphics.lineTo(left + bWidth, by);
                graphics.closePath();
                graphics.fillPath();
                
                // Rebar
                graphics.lineStyle(1, 0x2a2a35, 0.8);
                for (var r = 0; r < 3; r++) {
                    var rx = left + 5 + random() * (bWidth - 10);
                    graphics.beginPath();
                    graphics.moveTo(rx, top + bHeight * 0.15);
                    graphics.lineTo(rx + (random() - 0.5) * 10, top - 10);
                    graphics.strokePath();
                }
                graphics.lineStyle(0);
                
                // Fire
                if (random() > 0.4) {
                    var fx = left + bWidth / 2;
                    var fy = top + bHeight * 0.35;
                    graphics.fillStyle(0xff4400, 0.3);
                    graphics.fillCircle(fx, fy, 18);
                    graphics.fillStyle(0xff7700, 0.5);
                    graphics.fillCircle(fx, fy, 10);
                    graphics.fillStyle(0xffaa00, 0.7);
                    graphics.fillCircle(fx, fy, 5);
                }
            } else {
                graphics.fillRect(left, top, bWidth, bHeight);
                
                // Windows
                graphics.fillStyle(0x6699bb, 0.5);
                for (var fy = 12; fy < bHeight - 10; fy += 15) {
                    for (var wx = 5; wx < bWidth - 8; wx += 11) {
                        if (random() > 0.25) {
                            var st = random();
                            if (st > 0.92) {
                                graphics.fillStyle(0xff4400, 0.7);
                            } else if (st > 0.6) {
                                graphics.fillStyle(0x6699bb, 0.5);
                            } else {
                                graphics.fillStyle(0x101018, 0.8);
                            }
                            graphics.fillRect(left + wx, top + fy, 7, 9);
                        }
                    }
                }
            }
        }
        
        // Crane
        var cx = textureWidth * 0.3;
        var cy = worldHeight - 100;
        graphics.fillStyle(0x222230, 1);
        graphics.fillRect(cx, cy - 80, 6, 80);
        graphics.beginPath();
        graphics.moveTo(cx + 3, cy - 80);
        graphics.lineTo(cx + 80, cy - 40);
        graphics.lineTo(cx + 80, cy - 35);
        graphics.lineTo(cx + 3, cy - 75);
        graphics.closePath();
        graphics.fillPath();
        
        graphics.lineStyle(1, 0x1a1a25, 0.8);
        graphics.beginPath();
        graphics.moveTo(cx + 60, cy - 38);
        graphics.lineTo(cx + 65, cy);
        graphics.strokePath();
        graphics.lineStyle(0);
    };

    /**
     * Handles the generateTerrainLayer routine and encapsulates its core gameplay logic.
     * Parameters: graphics, random, dims.
     * Returns: value defined by the surrounding game flow.
     */
    BackgroundGeneratorWasteland2.prototype.generateTerrainLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var worldWidthRef = dims ? dims.worldWidth : this.config.worldWidth;
        var widthRatio = textureWidth / worldWidthRef;
        var groundY = worldHeight - 80;
        
        // Terrain layers
        var baseNoise = this.generateLoopingNoise(textureWidth, 35, 28, 0.5);
        var midNoise = this.generateLoopingNoise(textureWidth, 25, 18, 1.2);
        var topNoise = this.generateLoopingNoise(textureWidth, 28, 14, 2.1);
        
        var layers = [
            { noise: baseNoise, color: 0x1a1210, offset: 18, step: 35 },
            { noise: midNoise, color: 0x252018, offset: 10, step: 25 },
            { noise: topNoise, color: 0x352a20, offset: 4, step: 28 }
        ];
        
        for (var l = 0; l < layers.length; l++) {
            var layer = layers[l];
            graphics.fillStyle(layer.color, 1);
            graphics.beginPath();
            graphics.moveTo(0, worldHeight);
            for (var i = 0; i < layer.noise.length; i++) {
                var x = i * layer.step;
                if (x > textureWidth) break;
                graphics.lineTo(x, groundY - layer.noise[i] - layer.offset);
            }
            graphics.lineTo(textureWidth, worldHeight);
            graphics.closePath();
            graphics.fillPath();
        }
        
        // Craters
        var craterCount = Math.max(2, Math.ceil(12 * widthRatio));
        for (var i = 0; i < craterCount; i++) {
            var cx = random() * textureWidth;
            var cy = groundY + 5 + random() * 20;
            var cw = 20 + random() * 40;
            var ch = 8 + random() * 15;
            
            graphics.fillStyle(0x3a3028, 1);
            graphics.fillEllipse(cx, cy, cw + 6, ch + 3);
            graphics.fillStyle(0x151210, 1);
            graphics.fillEllipse(cx, cy + 2, cw, ch);
            graphics.fillStyle(0x1a1510, 0.6);
            graphics.fillEllipse(cx, cy, cw + 15, ch + 8);
        }
        
        // Wrecked vehicles
        var vehicleCount = Math.max(2, Math.ceil(8 * widthRatio));
        for (var i = 0; i < vehicleCount; i++) {
            var vx = random() * textureWidth;
            var vy = groundY + random() * 15;
            var flipped = random() > 0.5;
            
            if (random() > 0.5) {
                graphics.fillStyle(0x2a2520, 1);
                if (flipped) {
                    graphics.fillRect(vx, vy, 25, 8);
                    graphics.fillRect(vx + 3, vy - 5, 18, 5);
                } else {
                    graphics.fillRect(vx, vy, 25, 10);
                    graphics.fillRect(vx + 4, vy - 6, 16, 6);
                }
                
                graphics.fillStyle(0x101015, 0.8);
                graphics.fillRect(vx + 5, vy - 5, 5, 4);
                graphics.fillRect(vx + 12, vy - 5, 5, 4);
                
                graphics.fillStyle(0x151512, 1);
                graphics.fillCircle(vx + 5, vy + 10, 4);
                if (!flipped) {
                    graphics.fillCircle(vx + 20, vy + 10, 4);
                }
                
                if (random() > 0.6) {
                    graphics.fillStyle(0xff4400, 0.4);
                    graphics.fillCircle(vx + 12, vy - 8, 8);
                    graphics.fillStyle(0xff7700, 0.6);
                    graphics.fillCircle(vx + 12, vy - 10, 4);
                }
            } else {
                graphics.fillStyle(0x282420, 1);
                graphics.fillRect(vx, vy, 40, 14);
                graphics.fillRect(vx, vy - 8, 12, 8);
                graphics.fillStyle(0x151512, 0.9);
                graphics.fillRect(vx + 14, vy + 2, 22, 10);
            }
        }
        
        // Dead trees
        var treeCount = Math.max(2, Math.ceil(10 * widthRatio));
        for (var i = 0; i < treeCount; i++) {
            var tx = random() * textureWidth;
            var noiseIdx = Math.floor(tx / 28) % topNoise.length;
            var ty = groundY - topNoise[noiseIdx];
            
            graphics.fillStyle(0x1a1815, 1);
            graphics.fillRect(tx - 2, ty - 35, 4, 35);
            
            graphics.lineStyle(2, 0x1a1815, 1);
            graphics.beginPath();
            graphics.moveTo(tx, ty - 30);
            graphics.lineTo(tx - 15, ty - 45);
            graphics.strokePath();
            graphics.beginPath();
            graphics.moveTo(tx, ty - 25);
            graphics.lineTo(tx + 12, ty - 38);
            graphics.strokePath();
            graphics.beginPath();
            graphics.moveTo(tx, ty - 18);
            graphics.lineTo(tx - 10, ty - 28);
            graphics.strokePath();
            graphics.lineStyle(0);
        }
        
        // Scattered debris
        graphics.fillStyle(0x4a3a2a, 0.8);
        var debrisCount = Math.max(20, Math.ceil(100 * widthRatio));
        for (var i = 0; i < debrisCount; i++) {
            var rx = random() * textureWidth;
            var ry = groundY - 3 - random() * 35;
            graphics.fillRect(rx, ry, 3 + random() * 10, 2 + random() * 5);
        }
        
        // Toxic puddles
        var puddleCount = Math.max(1, Math.ceil(5 * widthRatio));
        for (var i = 0; i < puddleCount; i++) {
            var px = random() * textureWidth;
            var py = groundY + 10 + random() * 15;
            var pw = 20 + random() * 30;
            var ph = 5 + random() * 8;
            
            graphics.fillStyle(0x2a4a30, 0.4);
            graphics.fillEllipse(px, py, pw + 4, ph + 2);
            graphics.fillStyle(0x3a6a40, 0.6);
            graphics.fillEllipse(px, py, pw, ph);
            graphics.fillStyle(0x5a8a50, 0.3);
            graphics.fillEllipse(px - pw * 0.2, py - 1, pw * 0.3, ph * 0.4);
        }
        
        // Warning signs
        var signCount = Math.max(1, Math.ceil(4 * widthRatio));
        for (var i = 0; i < signCount; i++) {
            var sx = random() * textureWidth;
            var sy = groundY - 5;
            
            graphics.fillStyle(0x3a3530, 1);
            graphics.fillRect(sx - 1, sy - 25, 3, 25);
            graphics.fillStyle(0xaaaa30, 0.8);
            graphics.fillRect(sx - 10, sy - 35, 20, 12);
            graphics.fillStyle(0x1a1a15, 0.9);
            graphics.fillRect(sx - 8, sy - 33, 16, 8);
        }
        
        // Foreground hero buildings
        var buildingCount = Math.max(3, Math.ceil(18 * widthRatio));
        for (var i = 0; i < buildingCount; i++) {
            var bx = (i * (textureWidth / buildingCount)) + random() * 80;
            var bWidth = 45 + random() * 70;
            var bHeight = 110 + random() * 150;
            var nIdx = Math.floor((bx / textureWidth) * topNoise.length) % topNoise.length;
            var by = groundY - topNoise[nIdx];
            var left = bx - bWidth / 2;
            var top = by - bHeight;
            
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
            
            // Holes
            graphics.fillStyle(0x141420, 1);
            for (var h = 0; h < 5; h++) {
                graphics.fillEllipse(left + 10 + random() * (bWidth - 20), top + bHeight * 0.25 + random() * bHeight * 0.45, 10 + random() * 18, 8 + random() * 14);
            }
            
            // Exposed floors
            graphics.fillStyle(0x222230, 0.9);
            for (var f = 0; f < 4; f++) {
                graphics.fillRect(left + 5, top + bHeight * 0.15 + f * (bHeight * 0.15), bWidth - 10, 3);
            }
            
            // Rebar
            graphics.lineStyle(1, 0x4a3a30, 1);
            for (var r = 0; r < 6; r++) {
                var rx = left + 10 + random() * (bWidth - 20);
                graphics.beginPath();
                graphics.moveTo(rx, top + bHeight * 0.08);
                graphics.lineTo(rx + (random() - 0.5) * 20, top - 12 - random() * 20);
                graphics.strokePath();
            }
            graphics.lineStyle(0);
            
            // Rubble pile
            graphics.fillStyle(0x161620, 1);
            for (var r = 0; r < 12; r++) {
                var rubbleX = left - 18 + random() * (bWidth + 36);
                if (rubbleX < 0) rubbleX = 0;
                if (rubbleX > textureWidth - 8) continue;
                graphics.fillRect(rubbleX, by - 4 + random() * 25, 8 + random() * 18, 4 + random() * 12);
            }
            
            // Windows
            graphics.fillStyle(0xaaccee, 0.7);
            for (var fy = 20; fy < bHeight * 0.45; fy += 20) {
                for (var wx = 10; wx < bWidth - 15; wx += 16) {
                    if (random() > 0.28) {
                        var st = random();
                        if (st > 0.9) {
                            graphics.fillStyle(0xff2200, 0.9);
                        } else if (st > 0.65) {
                            graphics.fillStyle(0xaaccee, 0.7);
                        } else if (st > 0.35) {
                            graphics.fillStyle(0x0e0e18, 0.95);
                        } else {
                            graphics.fillStyle(0x080810, 0.95);
                            graphics.fillRect(left + wx, top + fy, 12, 14);
                            graphics.lineStyle(1, 0x4a4a5a, 0.6);
                            graphics.beginPath();
                            graphics.moveTo(left + wx + 2, top + fy + 2);
                            graphics.lineTo(left + wx + 10, top + fy + 12);
                            graphics.strokePath();
                            graphics.lineStyle(0);
                            continue;
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
                graphics.fillStyle(0xff2200, 0.35);
                graphics.beginPath();
                graphics.moveTo(fx - 20, fy + 15);
                graphics.lineTo(fx - 12, fy - 15);
                graphics.lineTo(fx - 5, fy - 5);
                graphics.lineTo(fx, fy - 25);
                graphics.lineTo(fx + 8, fy - 10);
                graphics.lineTo(fx + 15, fy - 20);
                graphics.lineTo(fx + 20, fy + 15);
                graphics.closePath();
                graphics.fillPath();
                
                graphics.fillStyle(0xff5500, 0.55);
                graphics.fillCircle(fx, fy, 16);
                graphics.fillStyle(0xff8800, 0.75);
                graphics.fillCircle(fx, fy - 4, 10);
                graphics.fillStyle(0xffcc00, 0.9);
                graphics.fillCircle(fx, fy - 7, 5);
                graphics.fillStyle(0xffffaa, 0.8);
                graphics.fillCircle(fx, fy - 9, 2.5);
                
                // Smoke column
                graphics.fillStyle(0x1a1a1a, 0.2);
                graphics.fillCircle(fx - 8, fy - 40, 18);
                graphics.fillCircle(fx + 5, fy - 60, 22);
                graphics.fillCircle(fx - 3, fy - 85, 25);
                graphics.fillCircle(fx + 10, fy - 110, 28);
            }
        }
    };

    return BackgroundGeneratorWasteland2;
})();
