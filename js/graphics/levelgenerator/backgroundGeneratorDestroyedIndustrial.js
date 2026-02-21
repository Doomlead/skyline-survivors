// ═══════════════════════════════════════════════════════════════════════════
// backgroundGeneratorDestroyedIndustrial.js - Destroyed Heavy Industrial Complex
// Features gas tanks, distillation towers, cooling towers, massive smokestacks,
// and complex pipeline networks - all damaged and burning
// ═══════════════════════════════════════════════════════════════════════════

var BackgroundGeneratorDestroyedIndustrial = (function() {
    /**
     * Handles the BackgroundGeneratorDestroyedIndustrial routine and encapsulates its core gameplay logic.
     * Parameters: scene, config.
     * Returns: value defined by the surrounding game flow.
     */
    function BackgroundGeneratorDestroyedIndustrial(scene, config) {
        this.scene = scene;
        this.config = config;
        this.generatedTextures = new Map();
    }

    /**
     * Handles the createRNG routine and encapsulates its core gameplay logic.
     * Parameters: seed.
     * Returns: value defined by the surrounding game flow.
     */
    BackgroundGeneratorDestroyedIndustrial.prototype.createRNG = function(seed) {
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
    BackgroundGeneratorDestroyedIndustrial.prototype.generateLoopingNoise = function(length, step, magnitude, seed) {
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
    BackgroundGeneratorDestroyedIndustrial.prototype.generateAllTextures = function() {
        console.log('[BackgroundGeneratorDestroyedIndustrial] Starting texture generation...');

        for (var i = 0; i < LAYER_ORDER.length; i++) {
            var layerName = LAYER_ORDER[i];
            var layerConfig = BACKGROUND_LAYERS[layerName];
            this.generateLayerTexture(layerName, layerConfig);
        }

        console.log('[BackgroundGeneratorDestroyedIndustrial] All textures generated!');
        return this.generatedTextures;
    };

    /**
     * Handles the generateLayerTexture routine and encapsulates its core gameplay logic.
     * Parameters: layerName, layerConfig.
     * Returns: value defined by the surrounding game flow.
     */
    BackgroundGeneratorDestroyedIndustrial.prototype.generateLayerTexture = function(layerName, layerConfig) {
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
            console.warn('[BackgroundGeneratorDestroyedIndustrial] Generator "' + layerConfig.generator + '" not found');
        }

        graphics.generateTexture(layerConfig.key, textureWidth, worldHeight);
        graphics.destroy();

        this.generatedTextures.set(layerName, layerConfig.key);
        console.log('[BackgroundGeneratorDestroyedIndustrial] Generated: ' + layerConfig.key);

        return layerConfig.key;
    };

    // ═══════════════════════════════════════════════════════════════════════
    // DESTROYED INDUSTRIAL STYLE GENERATORS
    // ═══════════════════════════════════════════════════════════════════════

    BackgroundGeneratorDestroyedIndustrial.prototype.generateSkyLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var bandHeight = 20;

        for (var y = 0; y < worldHeight; y += bandHeight) {
            var t = y / worldHeight;
            var r, g, b;
            
            if (t < 0.15) {
                r = Math.floor(8 + t * 22);
                g = Math.floor(5 + t * 18);
                b = Math.floor(18 + t * 28);
            } else if (t < 0.35) {
                var mt = (t - 0.15) / 0.2;
                r = Math.floor(20 + mt * 45);
                g = Math.floor(12 + mt * 20);
                b = Math.floor(35 + mt * 5);
            } else if (t < 0.55) {
                var mt2 = (t - 0.35) / 0.2;
                r = Math.floor(65 + mt2 * 50);
                g = Math.floor(32 + mt2 * 15);
                b = Math.floor(40 - mt2 * 20);
            } else if (t < 0.75) {
                var bt = (t - 0.55) / 0.2;
                r = Math.floor(115 - bt * 25);
                g = Math.floor(47 - bt * 20);
                b = Math.floor(20 - bt * 8);
            } else {
                var bt2 = (t - 0.75) / 0.25;
                r = Math.floor(90 - bt2 * 50);
                g = Math.floor(27 - bt2 * 16);
                b = Math.floor(12 - bt2 * 6);
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
    BackgroundGeneratorDestroyedIndustrial.prototype.generateAtmosphereLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;

        for (var i = 0; i < 14; i++) {
            var px = random() * textureWidth;
            var py = worldHeight * 0.35 + random() * worldHeight * 0.25;
            
            for (var s = 0; s < 10; s++) {
                var size = 20 + s * 16;
                var alpha = 0.12 - s * 0.011;
                var drift = Math.sin(s * 0.5) * 8;
                graphics.fillStyle(0x1a1818, alpha);
                graphics.fillCircle(px + s * 5 + drift, py - s * 32, size);
            }
        }
        
        for (var i = 0; i < 10; i++) {
            var cx = random() * textureWidth;
            var cy = worldHeight * 0.15 + random() * worldHeight * 0.3;
            var width = 100 + random() * 160;
            var height = 30 + random() * 50;
            var tint = random() > 0.7 ? 0x445533 : 0x443322;
            graphics.fillStyle(tint, 0.06);
            graphics.fillEllipse(cx, cy, width, height);
        }
        
        for (var i = 0; i < 8; i++) {
            var vx = random() * textureWidth;
            var vy = worldHeight * 0.45 + random() * worldHeight * 0.25;
            for (var s = 0; s < 5; s++) {
                graphics.fillStyle(0x888888, 0.04 - s * 0.007);
                graphics.fillEllipse(vx + s * 2, vy - s * 18, 12 + s * 10, 18 + s * 14);
            }
        }
        
        for (var i = 0; i < 7; i++) {
            var by = worldHeight * 0.3 + i * 40;
            graphics.fillStyle(0x352a20, 0.045);
            graphics.fillRect(0, by, textureWidth, 28 + random() * 32);
        }
    };

    /**
     * Handles the generateStarsLayer routine and encapsulates its core gameplay logic.
     * Parameters: graphics, random, dims.
     * Returns: value defined by the surrounding game flow.
     */
    BackgroundGeneratorDestroyedIndustrial.prototype.generateStarsLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;

        for (var i = 0; i < 100; i++) {
            var x = random() * textureWidth;
            var y = random() * (worldHeight * 0.32);
            var brightness = 0.12 + random() * 0.5;
            
            if (random() > 0.92) {
                graphics.fillStyle(0xffaa88, brightness * 0.5);
            } else {
                graphics.fillStyle(0xffffff, brightness);
            }
            
            var size = random() > 0.94 ? 2 : 1;
            graphics.fillRect(x, y, size, size);
        }
        
        for (var i = 0; i < 15; i++) {
            var sx = random() * textureWidth;
            var sy = worldHeight * 0.35 + random() * worldHeight * 0.4;
            graphics.fillStyle(0xffaa22, 0.9);
            graphics.fillRect(sx, sy, 2, 1);
            graphics.fillStyle(0xff6600, 0.6);
            graphics.fillRect(sx + 2, sy, 2, 1);
            graphics.fillStyle(0xff3300, 0.3);
            graphics.fillRect(sx + 4, sy, 1, 1);
        }
        
        for (var i = 0; i < 6; i++) {
            var fx = random() * textureWidth;
            var fy = worldHeight * 0.5 + random() * worldHeight * 0.2;
            graphics.fillStyle(0xff4400, 0.1);
            graphics.fillCircle(fx, fy, 35);
            graphics.fillStyle(0xff6622, 0.18);
            graphics.fillCircle(fx, fy, 18);
            graphics.fillStyle(0xffaa44, 0.25);
            graphics.fillCircle(fx, fy, 8);
        }
        
        for (var i = 0; i < 3; i++) {
            var ex = random() * textureWidth;
            var ey = worldHeight * 0.55 + random() * worldHeight * 0.15;
            graphics.fillStyle(0x44aaff, 0.4);
            graphics.fillCircle(ex, ey, 4);
            graphics.fillStyle(0xaaddff, 0.7);
            graphics.fillCircle(ex, ey, 2);
        }
    };

    /**
     * Handles the generateHorizonCityLayer routine and encapsulates its core gameplay logic.
     * Parameters: graphics, random, dims.
     * Returns: value defined by the surrounding game flow.
     */
    BackgroundGeneratorDestroyedIndustrial.prototype.generateHorizonCityLayer = function(graphics, random, dims) {
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
            var type = cRand();
            
            if (type > 0.85) {
                var tw = 25 + cRand() * 15;
                var th = 50 + cRand() * 40;
                graphics.lineTo(hx, horizonY);
                graphics.lineTo(hx + tw * 0.2, horizonY - th);
                graphics.lineTo(hx + tw * 0.35, horizonY - th * 0.7);
                graphics.lineTo(hx + tw * 0.65, horizonY - th * 0.7);
                graphics.lineTo(hx + tw * 0.8, horizonY - th);
                graphics.lineTo(hx + tw, horizonY);
                hx += tw + cRand() * 8;
            } else if (type > 0.6) {
                var sw = 4 + cRand() * 6;
                var sh = 40 + cRand() * 50;
                graphics.lineTo(hx, horizonY);
                graphics.lineTo(hx, horizonY - sh);
                graphics.lineTo(hx + sw, horizonY - sh);
                graphics.lineTo(hx + sw, horizonY);
                hx += sw + 5 + cRand() * 15;
            } else {
                var bw = 15 + cRand() * 30;
                var bh = 20 + cRand() * 35;
                var damaged = cRand() > 0.5;
                if (damaged) {
                    graphics.lineTo(hx, horizonY - bh * 0.4);
                    graphics.lineTo(hx + bw * 0.3, horizonY - bh);
                    graphics.lineTo(hx + bw * 0.7, horizonY - bh * 0.6);
                    graphics.lineTo(hx + bw, horizonY - bh * 0.8);
                } else {
                    graphics.lineTo(hx, horizonY - bh);
                    graphics.lineTo(hx + bw, horizonY - bh);
                }
                hx += bw + cRand() * 8;
            }
        }
        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();
        
        for (var i = 0; i < 12; i++) {
            var fx = random() * textureWidth;
            graphics.fillStyle(0xff3300, 0.18);
            graphics.fillCircle(fx, horizonY - 25, 14);
            graphics.fillStyle(0xff6600, 0.3);
            graphics.fillCircle(fx, horizonY - 25, 7);
        }
    };

    /**
     * Handles the generateMidCityLayer routine and encapsulates its core gameplay logic.
     * Parameters: graphics, random, dims.
     * Returns: value defined by the surrounding game flow.
     */
    BackgroundGeneratorDestroyedIndustrial.prototype.generateMidCityLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var baseY = worldHeight - 95;
        
        // Massive spherical gas tanks
        for (var i = 0; i < 6; i++) {
            var cx = (i * (textureWidth / 6)) + random() * 100;
            var r = 25 + random() * 30;
            var cy = baseY - r - 10 - random() * 20;
            
            graphics.fillStyle(0x0e0e12, 1);
            graphics.beginPath();
            graphics.moveTo(cx - r * 0.5, cy + r * 0.5);
            graphics.lineTo(cx - r * 0.8, baseY);
            graphics.lineTo(cx - r * 0.6, baseY);
            graphics.lineTo(cx - r * 0.3, cy + r * 0.7);
            graphics.closePath();
            graphics.fillPath();
            
            graphics.beginPath();
            graphics.moveTo(cx + r * 0.5, cy + r * 0.5);
            graphics.lineTo(cx + r * 0.8, baseY);
            graphics.lineTo(cx + r * 0.6, baseY);
            graphics.lineTo(cx + r * 0.3, cy + r * 0.7);
            graphics.closePath();
            graphics.fillPath();
            
            graphics.fillStyle(0x16161f, 1);
            graphics.fillCircle(cx, cy, r);
            
            graphics.fillStyle(0x1e1e28, 0.5);
            graphics.fillEllipse(cx - r * 0.3, cy - r * 0.3, r * 0.4, r * 0.3);
            
            graphics.fillStyle(0x0a0a0e, 0.8);
            graphics.fillRect(cx - r, cy - 2, r * 2, 4);
        }
        
        // Distillation columns
        for (var i = 0; i < 12; i++) {
            var bx = (i * (textureWidth / 12)) + random() * 80;
            var w = 20 + random() * 20;
            var h = 100 + random() * 120;
            var left = bx - w / 2;
            var top = baseY - h;
            
            graphics.fillStyle(0x111118, 1);
            graphics.fillRect(left, top, w, h);
            
            graphics.lineStyle(1, 0x08080a, 0.8);
            for (var y = top; y < baseY; y += 20) {
                graphics.beginPath();
                graphics.moveTo(left, y);
                graphics.lineTo(left + w, y + 20);
                graphics.strokePath();
                graphics.beginPath();
                graphics.moveTo(left + w, y);
                graphics.lineTo(left, y + 20);
                graphics.strokePath();
            }
            graphics.lineStyle(0);
            
            if (random() > 0.4) {
                var py = top + random() * (h * 0.8);
                graphics.fillStyle(0x111118, 1);
                graphics.fillRect(left - 15, py, w + 30, 4);
            }
        }
        
        // Pipeline web
        var levels = [baseY - 40, baseY - 80, baseY - 120];
        for (var l = 0; l < levels.length; l++) {
            var py = levels[l];
            if (random() > 0.3) {
                graphics.fillStyle(0x0d0d12, 1);
                graphics.fillRect(0, py, textureWidth, 6 + random() * 4);
                
                for (var j = 0; j < textureWidth; j += 60) {
                    graphics.fillStyle(0x181820, 1);
                    graphics.fillRect(j, py - 2, 8, 10 + random() * 4);
                }
            }
        }
        
        // Broken bridges
        for (var i = 0; i < 5; i++) {
            var cx = random() * textureWidth;
            var cy = baseY - 50 - random() * 60;
            graphics.fillStyle(0x14141c, 1);
            
            graphics.beginPath();
            graphics.moveTo(cx, cy);
            graphics.lineTo(cx + 80, cy + random() * 20);
            graphics.lineTo(cx + 80, cy + 10 + random() * 20);
            graphics.lineTo(cx, cy + 10);
            graphics.closePath();
            graphics.fillPath();
            
            graphics.lineStyle(1, 0x0a0a0e, 0.7);
            for (var c = 0; c < 5; c++) {
                graphics.beginPath();
                graphics.moveTo(cx + 10 + c * 15, cy + 10);
                graphics.lineTo(cx + 10 + c * 15, cy + 10 + 10 + random() * 30);
                graphics.strokePath();
            }
            graphics.lineStyle(0);
        }
    };

    /**
     * Handles the generateTerrainLayer routine and encapsulates its core gameplay logic.
     * Parameters: graphics, random, dims.
     * Returns: value defined by the surrounding game flow.
     */
    BackgroundGeneratorDestroyedIndustrial.prototype.generateTerrainLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var groundY = worldHeight - 78;
        
        var baseNoise = this.generateLoopingNoise(textureWidth, 35, 22, 0.5);
        var midNoise = this.generateLoopingNoise(textureWidth, 25, 14, 1.2);
        var topNoise = this.generateLoopingNoise(textureWidth, 28, 10, 2.1);
        
        var layers = [
            { noise: baseNoise, color: 0x141210, offset: 18, step: 35 },
            { noise: midNoise, color: 0x1c1814, offset: 10, step: 25 },
            { noise: topNoise, color: 0x262220, offset: 4, step: 28 }
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
        
        // Foreground cooling towers
        for (var i = 0; i < 3; i++) {
            var tx = (i * (textureWidth / 3)) + 100 + random() * 150;
            var tw = 75 + random() * 50;
            var th = 160 + random() * 100;
            var nIdx = Math.floor((tx / textureWidth) * topNoise.length) % topNoise.length;
            var by = groundY - topNoise[nIdx];
            var left = tx - tw / 2;
            var collapsed = random() > 0.5;
            
            graphics.fillStyle(0x1a1a24, 1);
            
            if (collapsed) {
                graphics.beginPath();
                graphics.moveTo(left - 30, by);
                graphics.lineTo(left - 20, by - th * 0.25);
                graphics.lineTo(left + tw * 0.2, by - th * 0.35);
                graphics.lineTo(left + tw * 0.4, by - th * 0.2);
                graphics.lineTo(left + tw * 0.6, by - th * 0.3);
                graphics.lineTo(left + tw * 0.8, by - th * 0.15);
                graphics.lineTo(left + tw + 30, by);
                graphics.closePath();
                graphics.fillPath();
                
                graphics.fillStyle(0x141420, 1);
                for (var r = 0; r < 25; r++) {
                    graphics.fillRect(left - 50 + random() * (tw + 100), by - 10 + random() * 30, 15 + random() * 30, 10 + random() * 18);
                }
                
                if (random() > 0.3) {
                    var fx = tx;
                    var fy = by - th * 0.15;
                    graphics.fillStyle(0xff1100, 0.15);
                    graphics.fillCircle(fx, fy, 45);
                    graphics.fillStyle(0xff3300, 0.3);
                    graphics.fillCircle(fx, fy, 28);
                    graphics.fillStyle(0xff6600, 0.5);
                    graphics.fillCircle(fx, fy, 16);
                }
            }
        }
        
        // Railroad tracks
        var trackY = groundY + 10;
        graphics.fillStyle(0x3a3530, 1);
        graphics.fillRect(0, trackY, textureWidth, 4);
        graphics.fillRect(0, trackY + 14, textureWidth, 4);
        graphics.fillStyle(0x2a2520, 1);
        for (var tx = 0; tx < textureWidth; tx += 20) {
            if (random() > 0.12) {
                graphics.fillRect(tx, trackY - 3, 10, 22);
            }
        }
        
        // Toxic puddles
        for (var i = 0; i < 5; i++) {
            var px = random() * textureWidth;
            var py = groundY + 15 + random() * 15;
            var pw = 35 + random() * 50;
            var ph = 8 + random() * 12;
            
            graphics.fillStyle(0x2a4a28, 0.35);
            graphics.fillEllipse(px, py, pw + 8, ph + 4);
            graphics.fillStyle(0x3a6a38, 0.55);
            graphics.fillEllipse(px, py, pw, ph);
        }
        
        // Barrels
        for (var i = 0; i < 15; i++) {
            var bx = random() * textureWidth;
            var bby = groundY + random() * 18;
            var fallen = random() > 0.45;
            
            graphics.fillStyle(0x2a2822, 1);
            if (fallen) {
                graphics.fillEllipse(bx, bby + 8, 22, 12);
            } else {
                graphics.fillEllipse(bx, bby, 12, 20);
            }
        }
        
        // Warning signs
        for (var i = 0; i < 4; i++) {
            var sx = random() * textureWidth;
            var sy = groundY - 10;
            var fallen = random() > 0.55;
            
            if (fallen) {
                graphics.fillStyle(0x3a3530, 1);
                graphics.fillRect(sx, sy + 18, 30, 4);
                graphics.fillStyle(0xaaaa20, 0.7);
                graphics.fillRect(sx + 22, sy + 14, 14, 12);
            } else {
                graphics.fillStyle(0x3a3530, 1);
                graphics.fillRect(sx - 2, sy - 35, 5, 35);
                graphics.fillStyle(0xaaaa20, 0.85);
                graphics.beginPath();
                graphics.moveTo(sx, sy - 52);
                graphics.lineTo(sx + 15, sy - 37);
                graphics.lineTo(sx, sy - 22);
                graphics.lineTo(sx - 15, sy - 37);
                graphics.closePath();
                graphics.fillPath();
            }
        }
    };

    return BackgroundGeneratorDestroyedIndustrial;
})();
