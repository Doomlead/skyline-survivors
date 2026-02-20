// ═══════════════════════════════════════════════════════════════════════════
// js/graphics/levelgenerator/backgroundGeneratorDreadnoughtInterior.js
// ═══════════════════════════════════════════════════════════════════════════

var BackgroundGeneratorDreadnoughtInterior = (function() {
    function BackgroundGeneratorDreadnoughtInterior(scene, config) {
        this.scene = scene;
        this.config = config;
        this.generatedTextures = new Map();
    }

    BackgroundGeneratorDreadnoughtInterior.prototype.createRNG = function(seed) {
        var state = seed >>> 0;
        return function() {
            state += 0x6d2b79f5;
            var t = state;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    };

    BackgroundGeneratorDreadnoughtInterior.prototype.generateLoopingNoise = function(length, step, magnitude, seed) {
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

    BackgroundGeneratorDreadnoughtInterior.prototype.generateAllTextures = function() {
        console.log('[BackgroundGeneratorDreadnoughtInterior] Starting texture generation...');

        for (var i = 0; i < LAYER_ORDER.length; i++) {
            var layerName = LAYER_ORDER[i];
            var layerConfig = BACKGROUND_LAYERS[layerName];
            this.generateLayerTexture(layerName, layerConfig);
        }

        console.log('[BackgroundGeneratorDreadnoughtInterior] All textures generated!');
        return this.generatedTextures;
    };

    BackgroundGeneratorDreadnoughtInterior.prototype.generateLayerTexture = function(layerName, layerConfig) {
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
            console.warn('[BackgroundGeneratorDreadnoughtInterior] Generator "' + layerConfig.generator + '" not found');
        }

        graphics.generateTexture(layerConfig.key, textureWidth, worldHeight);
        graphics.destroy();

        this.generatedTextures.set(layerName, layerConfig.key);
        console.log('[BackgroundGeneratorDreadnoughtInterior] Generated: ' + layerConfig.key + ' (' + textureWidth + 'x' + worldHeight + ')');

        return layerConfig.key;
    };

    // ═══════════════════════════════════════════════════════════════════════
    // MOTHERSHIP INTERIOR GENERATORS (matching MOTHERSHIP_INT_LAYERS config)
    // ═══════════════════════════════════════════════════════════════════════

    BackgroundGeneratorDreadnoughtInterior.prototype.generateCorridorBack = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;

        // Deep corridor background - dark alien metal with distant lights
        graphics.fillStyle(0x0f0718, 1);
        graphics.fillRect(0, 0, textureWidth, worldHeight);

        // Distant corridor perspective lines
        graphics.lineStyle(2, 0x221034, 0.4);
        var vanishX = textureWidth / 2;
        var vanishY = worldHeight / 2;
        
        for (var i = 0; i < 10; i++) {
            var y = i * (worldHeight / 10);
            graphics.beginPath();
            graphics.moveTo(0, y);
            graphics.lineTo(vanishX, vanishY);
            graphics.lineTo(textureWidth, y);
            graphics.strokePath();
        }
        graphics.lineStyle(0);

        // Distant bulkhead lights
        for (var i = 0; i < 20; i++) {
            var lx = random() * textureWidth;
            var ly = worldHeight * 0.3 + random() * (worldHeight * 0.4);
            var dist = Math.abs(lx - vanishX) / (textureWidth / 2);
            var alpha = 0.3 * (1 - dist);
            
            graphics.fillStyle(0xc084fc, alpha);
            graphics.fillCircle(lx, ly, 2 + random() * 4);
        }

        // Far wall panels
        for (var i = 0; i < 8; i++) {
            var px = (i * (textureWidth / 8)) + random() * 20;
            var py = worldHeight * 0.4;
            var pw = textureWidth / 10;
            var ph = worldHeight * 0.2;
            
            graphics.fillStyle(0x221034, 0.5);
            graphics.fillRect(px, py, pw, ph);
            
            // Panel glow
            graphics.fillStyle(0xc084fc, 0.1);
            graphics.fillRect(px + 2, py + 2, pw - 4, 2);
        }
    };

    BackgroundGeneratorDreadnoughtInterior.prototype.generateInfrastructure = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var groundY = worldHeight - 100;

        // Floor - industrial grating with biomechanical elements
        var floorNoise = this.generateLoopingNoise(textureWidth, 40, 8, 1.2);
        
        graphics.fillStyle(0x2d1b3f, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        for (var i = 0; i < floorNoise.length; i++) {
            var x = i * 40;
            if (x > textureWidth) break;
            graphics.lineTo(x, groundY - floorNoise[i]);
        }
        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        // Floor grating pattern
        graphics.fillStyle(0x221034, 0.8);
        for (var x = 0; x < textureWidth; x += 60) {
            var gx = x + random() * 20;
            graphics.fillRect(gx, groundY - 6, 40, 6);
            
            // Grate lines
            graphics.lineStyle(1, 0x0f0718, 0.6);
            for (var l = 0; l < 40; l += 8) {
                graphics.beginPath();
                graphics.moveTo(gx + l, groundY - 6);
                graphics.lineTo(gx + l, groundY);
                graphics.strokePath();
            }
        }
        graphics.lineStyle(0);

        // Ceiling with hanging cables/conduits
        var ceilingY = 80;
        graphics.fillStyle(0x2d1b3f, 1);
        graphics.fillRect(0, 0, textureWidth, ceilingY);

        // Hanging infrastructure
        for (var i = 0; i < 15; i++) {
            var hx = random() * textureWidth;
            var hangLength = 30 + random() * 80;
            
            // Cable bundle
            graphics.fillStyle(0x221034, 0.9);
            graphics.fillRect(hx - 4, ceilingY, 8, hangLength);
            
            // Glowing conduit core
            graphics.fillStyle(0xc084fc, 0.2);
            graphics.fillRect(hx - 2, ceilingY + 5, 4, hangLength - 10);
            
            // Connection node
            graphics.fillStyle(0x4b2f63, 1);
            graphics.fillCircle(hx, ceilingY + hangLength, 6);
            graphics.fillStyle(0xc084fc, 0.4);
            graphics.fillCircle(hx, ceilingY + hangLength, 3);
        }

        // Wall columns
        for (var i = 0; i < 6; i++) {
            var cx = (i * (textureWidth / 6)) + random() * 40;
            var cw = 40 + random() * 30;
            
            graphics.fillStyle(0x2d1b3f, 1);
            graphics.fillRect(cx, ceilingY, cw, groundY - ceilingY);
            
            // Column detail
            graphics.fillStyle(0x4b2f63, 0.6);
            graphics.fillRect(cx + 5, ceilingY + 20, cw - 10, groundY - ceilingY - 40);
            
            // Status lights
            for (var l = 0; l < 5; l++) {
                var ly = ceilingY + 40 + l * ((groundY - ceilingY) / 5);
                var color = random() > 0.5 ? 0x00ff00 : 0xff0000;
                graphics.fillStyle(color, 0.5);
                graphics.fillCircle(cx + cw/2, ly, 3);
            }
        }

        // Raised platforms
        for (var i = 0; i < 8; i++) {
            var px = random() * textureWidth;
            var pw = 50 + random() * 60;
            var ph = 30 + random() * 50;
            var py = groundY - ph;
            
            graphics.fillStyle(0x2d1b3f, 1);
            graphics.fillRect(px, py, pw, ph);
            graphics.fillStyle(0x4b2f63, 1);
            graphics.fillRect(px, py, pw, 4);
            
            // Support legs
            graphics.fillStyle(0x221034, 0.8);
            graphics.fillRect(px + 5, py + 4, 4, ph - 4);
            graphics.fillRect(px + pw - 9, py + 4, 4, ph - 4);
            
            // Platform lights
            graphics.fillStyle(0xc084fc, 0.3);
            graphics.fillRect(px + 10, py + 2, pw - 20, 2);
        }

        // Scattered debris and tech
        for (var i = 0; i < 60; i++) {
            var dx = random() * textureWidth;
            var dy = groundY - random() * 15;
            var dtype = random();
            
            if (dtype > 0.7) {
                graphics.fillStyle(0x221034, 0.7);
                graphics.fillRect(dx, dy, 3 + random() * 6, 2 + random() * 4);
            } else if (dtype > 0.4) {
                graphics.fillStyle(0x4b2f63, 0.5);
                graphics.fillCircle(dx, dy, 2 + random() * 3);
            } else {
                graphics.fillStyle(0x7c3aed, 0.3);
                graphics.fillEllipse(dx, dy, 4 + random() * 6, 2 + random() * 4);
            }
        }

        // Energy conduits along floor
        graphics.lineStyle(3, 0xc084fc, 0.15);
        for (var x = 0; x < textureWidth; x += 100) {
            var cx = x + random() * 30;
            graphics.beginPath();
            graphics.moveTo(cx, groundY - 3);
            for (var s = 0; s < 5; s++) {
                graphics.lineTo(cx + s * 15, groundY - 3 + Math.sin(s) * 4);
            }
            graphics.strokePath();
        }
        graphics.lineStyle(0);
    };

    return BackgroundGeneratorDreadnoughtInterior;
})();
