// ═══════════════════════════════════════════════════════════════════════════
// backgroundGeneratorMothershipInterior.js - Alien Mothership Interior Corridors
// Enclosed alien architecture with ceiling, bulkheads, platforms, and atmosphere
// ═══════════════════════════════════════════════════════════════════════════

var BackgroundGeneratorMothershipInterior = (function() {
    function BackgroundGeneratorMothershipInterior(scene, config) {
        this.scene = scene;
        this.config = config;
        this.generatedTextures = new Map();
    }

    BackgroundGeneratorMothershipInterior.prototype.createRNG = function(seed) {
        var state = seed >>> 0;
        return function() {
            state += 0x6d2b79f5;
            var t = state;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    };

    BackgroundGeneratorMothershipInterior.prototype.generateLoopingNoise = function(length, step, magnitude, seed) {
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

    BackgroundGeneratorMothershipInterior.prototype.generateAllTextures = function() {
        console.log('[BackgroundGeneratorMothershipInterior] Starting texture generation...');

        for (var i = 0; i < LAYER_ORDER.length; i++) {
            var layerName = LAYER_ORDER[i];
            var layerConfig = BACKGROUND_LAYERS[layerName];
            this.generateLayerTexture(layerName, layerConfig);
        }

        console.log('[BackgroundGeneratorMothershipInterior] All textures generated!');
        return this.generatedTextures;
    };

    BackgroundGeneratorMothershipInterior.prototype.generateLayerTexture = function(layerName, layerConfig) {
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
            console.warn('[BackgroundGeneratorMothershipInterior] Generator "' + layerConfig.generator + '" not found');
        }

        graphics.generateTexture(layerConfig.key, textureWidth, worldHeight);
        graphics.destroy();

        this.generatedTextures.set(layerName, layerConfig.key);
        console.log('[BackgroundGeneratorMothershipInterior] Generated: ' + layerConfig.key + ' (' + textureWidth + 'x' + worldHeight + ')');

        return layerConfig.key;
    };

    // ═══════════════════════════════════════════════════════════════════════
    // MOTHERSHIP INTERIOR GENERATORS
    // ═══════════════════════════════════════════════════════════════════════

    BackgroundGeneratorMothershipInterior.prototype.generateSkyLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;

        // Dark interior ambiance with purple/cyan energy lighting
        graphics.fillStyle(0x1a0d2a, 1);
        graphics.fillRect(0, 0, textureWidth, worldHeight);

        // Energy glow bands
        for (var i = 0; i < 5; i++) {
            var by = i * (worldHeight / 5) + worldHeight * 0.1;
            graphics.fillStyle(0x3a1a4a, 0.3);
            graphics.fillRect(0, by, textureWidth, worldHeight / 5);
            
            graphics.fillStyle(0x00ffff, 0.05);
            graphics.fillRect(0, by + 20, textureWidth, 30);
        }

        // Vertical light shafts
        for (var i = 0; i < 12; i++) {
            var x = (i * (textureWidth / 12)) + random() * (textureWidth / 12);
            graphics.fillStyle(0xff00ff, 0.04);
            graphics.fillRect(x, 0, 15 + random() * 20, worldHeight);
        }
    };

    BackgroundGeneratorMothershipInterior.prototype.generateAtmosphereLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;

        // Thick alien atmosphere - floating particles
        for (var i = 0; i < 50; i++) {
            var px = random() * textureWidth;
            var py = random() * worldHeight;
            var size = 8 + random() * 25;
            
            graphics.fillStyle(0x663399, 0.08);
            graphics.fillEllipse(px, py, size, size * 0.7);
            graphics.fillStyle(0x883399, 0.05);
            graphics.fillEllipse(px + 5, py, size * 0.7, size * 0.5);
        }

        // Leaking gases/steam
        for (var i = 0; i < 15; i++) {
            var sx = random() * textureWidth;
            var sy = random() * worldHeight * 0.6;
            
            for (var s = 0; s < 6; s++) {
                var drift = Math.sin(s * 0.7) * 15;
                graphics.fillStyle(0x00ffff, 0.06 - s * 0.008);
                graphics.fillCircle(sx + drift + s * 6, sy - s * 30, 12 + s * 6);
            }
        }

        // Bioelectric sparks
        for (var i = 0; i < 20; i++) {
            var bx = random() * textureWidth;
            var by = random() * worldHeight;
            
            graphics.fillStyle(0xff00ff, 0.15);
            graphics.fillCircle(bx, by, 3);
            graphics.fillStyle(0xffaaff, 0.25);
            graphics.fillCircle(bx, by, 1);
            
            // Spark trail
            graphics.lineStyle(1, 0xff66ff, 0.1);
            graphics.beginPath();
            graphics.moveTo(bx, by);
            graphics.lineTo(bx + (random() - 0.5) * 20, by + (random() - 0.5) * 20);
            graphics.strokePath();
            graphics.lineStyle(0);
        }
    };

    BackgroundGeneratorMothershipInterior.prototype.generateStarsLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;

        // Interior lighting - no stars, but glowing nodes
        for (var i = 0; i < 80; i++) {
            var x = random() * textureWidth;
            var y = random() * worldHeight;
            
            var color = random() > 0.5 ? 0x00ffff : 0xff00ff;
            graphics.fillStyle(color, 0.2 + random() * 0.4);
            graphics.fillCircle(x, y, 1 + random() * 2);
        }

        // Bioluminescent clusters
        for (var i = 0; i < 12; i++) {
            var cx = random() * textureWidth;
            var cy = random() * worldHeight;
            
            for (var j = 0; j < 5; j++) {
                var ox = cx + (random() - 0.5) * 30;
                var oy = cy + (random() - 0.5) * 30;
                
                graphics.fillStyle(0x00ff88, 0.15);
                graphics.fillCircle(ox, oy, 4 + random() * 6);
                graphics.fillStyle(0x00ffaa, 0.3);
                graphics.fillCircle(ox, oy, 2);
            }
        }
    };

    BackgroundGeneratorMothershipInterior.prototype.generateCeilingLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var ceilingY = 100;

        // Ceiling structure - mirrored ground concept
        var ceilingNoise = this.generateLoopingNoise(textureWidth, 35, 15, 0.9);
        
        // Main ceiling
        graphics.fillStyle(0x2a1a3a, 1);
        graphics.beginPath();
        graphics.moveTo(0, 0);
        for (var i = 0; i < ceilingNoise.length; i++) {
            var x = i * 35;
            if (x > textureWidth) break;
            graphics.lineTo(x, ceilingY + ceilingNoise[i]);
        }
        graphics.lineTo(textureWidth, 0);
        graphics.closePath();
        graphics.fillPath();

        // Ceiling detail layer
        graphics.fillStyle(0x3a2a4a, 1);
        graphics.beginPath();
        graphics.moveTo(0, 0);
        for (var i = 0; i < ceilingNoise.length; i++) {
            var x = i * 35;
            if (x > textureWidth) break;
            graphics.lineTo(x, ceilingY + ceilingNoise[i] * 0.7 - 5);
        }
        graphics.lineTo(textureWidth, 0);
        graphics.closePath();
        graphics.fillPath();

        // Hanging conduits
        for (var i = 0; i < 25; i++) {
            var cx = random() * textureWidth;
            var cy = ceilingY - random() * 20;
            var length = 15 + random() * 40;
            var width = 3 + random() * 6;
            
            graphics.fillStyle(0x1a0d2a, 0.8);
            graphics.fillRect(cx - width/2, cy, width, length);
            
            // Glowing core
            graphics.fillStyle(0x00ffff, 0.15);
            graphics.fillRect(cx - width/2 + 1, cy, width - 2, length);
            
            // Connection point
            graphics.fillStyle(0x3a2a4a, 1);
            graphics.fillCircle(cx, cy, width + 2);
        }

        // Ceiling lights
        for (var i = 0; i < 15; i++) {
            var lx = random() * textureWidth;
            var ly = ceilingY - random() * 15;
            
            // Light housing
            graphics.fillStyle(0x2a1a3a, 1);
            graphics.fillRect(lx - 8, ly, 16, 6);
            
            // Light glow
            graphics.fillStyle(0x00ffff, 0.3);
            graphics.fillRect(lx - 6, ly + 2, 12, 3);
            
            // Light beam
            for (var b = 0; b < 8; b++) {
                graphics.fillStyle(0x00ffff, 0.04 - b * 0.004);
                graphics.fillRect(lx - 8 - b * 4, ly + 6, 16 + b * 8, 30 + b * 15);
            }
        }

        // Biomechanical stalactites
        for (var i = 0; i < 12; i++) {
            var sx = random() * textureWidth;
            var sy = ceilingY - random() * 10;
            var slen = 20 + random() * 50;
            
            graphics.fillStyle(0x3a2a4a, 1);
            graphics.beginPath();
            graphics.moveTo(sx, sy);
            graphics.lineTo(sx - 8, sy + slen * 0.3);
            graphics.lineTo(sx - 4, sy + slen * 0.6);
            graphics.lineTo(sx - 2, sy + slen);
            graphics.lineTo(sx + 2, sy + slen);
            graphics.lineTo(sx + 4, sy + slen * 0.6);
            graphics.lineTo(sx + 8, sy + slen * 0.3);
            graphics.closePath();
            graphics.fillPath();
            
            // Glowing tip
            graphics.fillStyle(0xff00ff, 0.4);
            graphics.fillCircle(sx, sy + slen, 4);
            graphics.fillStyle(0xff66ff, 0.6);
            graphics.fillCircle(sx, sy + slen, 2);
        }
    };

    BackgroundGeneratorMothershipInterior.prototype.generateHorizonCityLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var midY = worldHeight / 2;

        // Distant corridor section
        // Draw receding perspective lines
        graphics.lineStyle(2, 0x3a2a4a, 0.3);
        for (var i = 0; i < 8; i++) {
            var startX = i * (textureWidth / 8);
            var endX = textureWidth / 2;
            
            graphics.beginPath();
            graphics.moveTo(startX, 0);
            graphics.lineTo(endX, midY);
            graphics.strokePath();
            
            graphics.beginPath();
            graphics.moveTo(startX, worldHeight);
            graphics.lineTo(endX, midY);
            graphics.strokePath();
        }
        graphics.lineStyle(0);

        // Distant bulkheads
        for (var i = 0; i < 6; i++) {
            var bx = (i * (textureWidth / 6)) + random() * 50;
            var scale = 0.3 + random() * 0.3;
            
            graphics.fillStyle(0x2a1a3a, 0.5);
            graphics.fillRect(bx, midY - 80 * scale, 40 * scale, 160 * scale);
            
            // Door opening
            graphics.fillStyle(0x1a0d2a, 0.7);
            graphics.fillRect(bx + 10 * scale, midY - 40 * scale, 20 * scale, 80 * scale);
        }

        // Distant lights
        for (var i = 0; i < 20; i++) {
            var lx = random() * textureWidth;
            var ly = midY + (random() - 0.5) * 100;
            
            graphics.fillStyle(0x00ffff, 0.15);
            graphics.fillCircle(lx, ly, 3);
            graphics.fillStyle(0x00aaff, 0.25);
            graphics.fillCircle(lx, ly, 1);
        }
    };

    BackgroundGeneratorMothershipInterior.prototype.generateMidCityLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;

        // Internal bulkheads (vertical barriers)
        for (var i = 0; i < 12; i++) {
            var bx = (i * (textureWidth / 12)) + random() * 80;
            var bw = 30 + random() * 40;
            var bh = worldHeight * 0.6 + random() * (worldHeight * 0.2);
            var by = worldHeight - bh;
            
            // Main bulkhead
            graphics.fillStyle(0x2a1a3a, 1);
            graphics.fillRect(bx, by, bw, bh);
            
            // Edge detail
            graphics.fillStyle(0x3a2a4a, 1);
            graphics.fillRect(bx, by, 3, bh);
            graphics.fillRect(bx + bw - 3, by, 3, bh);
            
            // Door section (sometimes)
            if (random() > 0.4) {
                var doorY = by + bh * 0.3;
                var doorH = bh * 0.4;
                
                graphics.fillStyle(0x1a0d2a, 1);
                graphics.fillRect(bx + 5, doorY, bw - 10, doorH);
                
                // Door frame glow
                graphics.lineStyle(2, 0x00ffff, 0.3);
                graphics.strokeRect(bx + 5, doorY, bw - 10, doorH);
                graphics.lineStyle(0);
            }
            
            // Vertical conduits
            for (var c = 0; c < 3; c++) {
                var cx = bx + 8 + c * (bw - 16) / 2;
                graphics.fillStyle(0x663399, 0.4);
                graphics.fillRect(cx, by, 2, bh);
                
                // Energy pulse points
                for (var p = 0; p < 5; p++) {
                    var py = by + (bh / 5) * p;
                    graphics.fillStyle(0x00ffff, 0.3);
                    graphics.fillCircle(cx + 1, py, 4);
                }
            }
        }

        // Wall panels
        for (var i = 0; i < 30; i++) {
            var px = random() * textureWidth;
            var py = worldHeight * 0.3 + random() * (worldHeight * 0.4);
            var pw = 40 + random() * 60;
            var ph = 30 + random() * 50;
            
            graphics.fillStyle(0x3a2a4a, 0.8);
            graphics.fillRect(px, py, pw, ph);
            
            // Panel details
            graphics.fillStyle(0x2a1a3a, 0.6);
            graphics.fillRect(px + 3, py + 3, pw - 6, ph - 6);
            
            // Status lights
            for (var l = 0; l < 4; l++) {
                var lx = px + 8 + l * 10;
                var ly = py + 8;
                var color = random() > 0.7 ? 0xff0000 : 0x00ff00;
                graphics.fillStyle(color, 0.6);
                graphics.fillCircle(lx, ly, 2);
            }
        }

        // Hanging cables
        for (var i = 0; i < 20; i++) {
            var cx = random() * textureWidth;
            var cy = worldHeight * 0.2;
            
            graphics.lineStyle(2, 0x1a0d2a, 0.7);
            graphics.beginPath();
            graphics.moveTo(cx, cy);
            
            // Cable droop
            for (var s = 0; s < 5; s++) {
                var sx = cx + Math.sin(s) * 15;
                var sy = cy + s * 30 + Math.cos(s) * 10;
                graphics.lineTo(sx, sy);
            }
            graphics.strokePath();
            graphics.lineStyle(0);
        }
    };

    BackgroundGeneratorMothershipInterior.prototype.generateTerrainLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var groundY = worldHeight - 120;

        // Main floor with organic texture
        var floorNoise = this.generateLoopingNoise(textureWidth, 30, 12, 1.1);
        var detailNoise = this.generateLoopingNoise(textureWidth, 20, 8, 1.7);
        
        // Base floor
        graphics.fillStyle(0x3a2a4a, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        for (var i = 0; i < floorNoise.length; i++) {
            var x = i * 30;
            if (x > textureWidth) break;
            graphics.lineTo(x, groundY - floorNoise[i]);
        }
        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        // Detail floor layer
        graphics.fillStyle(0x4a3a5a, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        for (var i = 0; i < detailNoise.length; i++) {
            var x = i * 20;
            if (x > textureWidth) break;
            graphics.lineTo(x, groundY - detailNoise[i] - 3);
        }
        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        // Top walkable surface
        graphics.fillStyle(0x5a4a6a, 1);
        graphics.fillRect(0, groundY - 2, textureWidth, 2);

        // Floor grating sections
        for (var x = 0; x < textureWidth; x += 80) {
            var grateX = x + random() * 30;
            var grateW = 50 + random() * 30;
            
            graphics.fillStyle(0x2a1a3a, 0.8);
            graphics.fillRect(grateX, groundY - 8, grateW, 8);
            
            // Grate bars
            graphics.lineStyle(1, 0x1a0d2a, 0.6);
            for (var b = 0; b < grateW; b += 6) {
                graphics.beginPath();
                graphics.moveTo(grateX + b, groundY - 8);
                graphics.lineTo(grateX + b, groundY);
                graphics.strokePath();
            }
            graphics.lineStyle(0);
            
            // Glow from beneath
            graphics.fillStyle(0xff00ff, 0.08);
            graphics.fillRect(grateX, groundY - 8, grateW, 8);
        }

        // Raised platforms for foot combat
        for (var i = 0; i < 15; i++) {
            var px = random() * textureWidth;
            var pw = 60 + random() * 80;
            var ph = 40 + random() * 60;
            var py = groundY - ph;
            
            // Platform base
            graphics.fillStyle(0x2a1a3a, 1);
            graphics.fillRect(px, py, pw, ph);
            
            // Platform top
            graphics.fillStyle(0x3a2a4a, 1);
            graphics.fillRect(px, py, pw, 5);
            
            // Support struts
            graphics.fillStyle(0x1a0d2a, 0.8);
            graphics.fillRect(px + 5, py + 5, 4, ph - 5);
            graphics.fillRect(px + pw - 9, py + 5, 4, ph - 5);
            
            // Platform lights
            for (var l = 0; l < 3; l++) {
                var lx = px + 15 + l * 20;
                graphics.fillStyle(0x00ffff, 0.4);
                graphics.fillRect(lx, py + 2, 8, 2);
            }
            
            // Access ladder
            if (random() > 0.6) {
                var lx = px + pw / 2;
                graphics.fillStyle(0x3a2a4a, 0.8);
                graphics.fillRect(lx - 2, py, 4, ph);
                
                // Rungs
                for (var r = 0; r < ph / 8; r++) {
                    graphics.fillRect(lx - 6, py + r * 8, 12, 2);
                }
            }
        }

        // Floor conduits
        graphics.lineStyle(3, 0x2a1a3a, 0.8);
        var conduitY = groundY - 5;
        for (var x = 0; x < textureWidth; x += 100) {
            graphics.beginPath();
            graphics.moveTo(x, conduitY);
            graphics.lineTo(x + 80, conduitY + (random() - 0.5) * 10);
            graphics.strokePath();
        }
        graphics.lineStyle(0);

        // Energy conduit nodes
        for (var x = 50; x < textureWidth; x += 120) {
            var nx = x + random() * 40;
            
            // Node housing
            graphics.fillStyle(0x2a1a3a, 1);
            graphics.fillCircle(nx, conduitY, 8);
            
            // Energy core
            graphics.fillStyle(0x00ffff, 0.5);
            graphics.fillCircle(nx, conduitY, 5);
            graphics.fillStyle(0x00aaff, 0.7);
            graphics.fillCircle(nx, conduitY, 3);
            
            // Pulsing glow
            for (var p = 0; p < 4; p++) {
                graphics.fillStyle(0x00ffff, 0.1 - p * 0.02);
                graphics.fillCircle(nx, conduitY, 10 + p * 6);
            }
        }

        // Biomechanical growth
        for (var i = 0; i < 20; i++) {
            var bx = random() * textureWidth;
            var by = groundY - random() * 40;
            var bw = 15 + random() * 25;
            var bh = 25 + random() * 40;
            
            graphics.fillStyle(0x3a2a4a, 0.9);
            graphics.beginPath();
            graphics.moveTo(bx, groundY);
            
            // Organic bulge
            for (var s = 0; s <= 8; s++) {
                var t = s / 8;
                var wx = bw/2 * Math.sin(t * Math.PI);
                var wy = groundY - bh * t;
                if (s % 2 === 0) {
                    graphics.lineTo(bx - wx, wy);
                } else {
                    graphics.lineTo(bx + wx, wy);
                }
            }
            graphics.closePath();
            graphics.fillPath();
            
            // Bioluminescent spots
            for (var b = 0; b < 3; b++) {
                var bsy = groundY - bh * (0.3 + b * 0.3);
                graphics.fillStyle(0x00ff88, 0.3);
                graphics.fillCircle(bx, bsy, 3);
                graphics.fillStyle(0x00ffaa, 0.5);
                graphics.fillCircle(bx, bsy, 1);
            }
        }

        // Defense turrets on floor
        for (var i = 0; i < 8; i++) {
            var tx = (i * (textureWidth / 8)) + random() * 60;
            var ty = groundY - 25;
            
            // Turret base
            graphics.fillStyle(0x2a1a3a, 1);
            graphics.fillCircle(tx, groundY - 5, 15);
            
            // Turret body
            graphics.fillStyle(0x3a2a4a, 1);
            graphics.fillRect(tx - 8, ty, 16, 25);
            graphics.fillRect(tx - 12, groundY - 8, 24, 8);
            
            // Barrels
            graphics.fillStyle(0x1a0d2a, 1);
            graphics.fillRect(tx - 10, ty - 12, 4, 12);
            graphics.fillRect(tx + 6, ty - 12, 4, 12);
            
            // Targeting laser
            graphics.fillStyle(0xff0000, 0.7);
            graphics.fillCircle(tx, ty + 8, 3);
            graphics.fillStyle(0xff6666, 0.9);
            graphics.fillCircle(tx, ty + 8, 1);
            
            // Energy core
            graphics.fillStyle(0x00ffff, 0.3);
            graphics.fillRect(tx - 4, ty + 4, 8, 6);
        }

        // Shield generator nodes
        for (var i = 0; i < 6; i++) {
            var sx = (i * (textureWidth / 6)) + random() * 70;
            var sy = groundY - 35;
            
            // Generator housing
            graphics.fillStyle(0x2a1a3a, 1);
            graphics.fillRect(sx - 15, sy, 30, 35);
            
            // Shield projector
            graphics.fillStyle(0x3a2a4a, 1);
            graphics.fillRect(sx - 12, sy - 8, 24, 8);
            
            // Shield energy
            graphics.fillStyle(0x00ffff, 0.4);
            graphics.fillCircle(sx, sy + 15, 10);
            graphics.fillStyle(0x00aaff, 0.6);
            graphics.fillCircle(sx, sy + 15, 6);
            
            // Shield field effect
            for (var s = 0; s < 5; s++) {
                graphics.fillStyle(0x00ffff, 0.08 - s * 0.012);
                graphics.fillCircle(sx, sy + 15, 15 + s * 12);
            }
            
            // Connection cables
            graphics.lineStyle(2, 0x663399, 0.5);
            graphics.beginPath();
            graphics.moveTo(sx, sy + 35);
            graphics.lineTo(sx + (random() - 0.5) * 30, groundY);
            graphics.strokePath();
            graphics.lineStyle(0);
        }

        // Floor debris and details
        for (var i = 0; i < 100; i++) {
            var dx = random() * textureWidth;
            var dy = groundY - random() * 10;
            var dtype = random();
            
            if (dtype > 0.7) {
                // Small panels
                graphics.fillStyle(0x2a1a3a, 0.6);
                graphics.fillRect(dx, dy, 4 + random() * 8, 2 + random() * 5);
            } else if (dtype > 0.4) {
                // Tech debris
                graphics.fillStyle(0x3a2a4a, 0.5);
                graphics.fillCircle(dx, dy, 2 + random() * 4);
            } else {
                // Alien organic matter
                graphics.fillStyle(0x663399, 0.3);
                graphics.fillEllipse(dx, dy, 5 + random() * 8, 3 + random() * 5);
            }
        }

        // Hazard markings
        for (var i = 0; i < 12; i++) {
            var hx = random() * textureWidth;
            var hy = groundY - 5;
            
            // Warning stripes
            graphics.fillStyle(0xffaa00, 0.6);
            for (var s = 0; s < 5; s++) {
                if (s % 2 === 0) {
                    graphics.fillRect(hx + s * 8, hy, 8, 4);
                }
            }
            
            // Hazard symbol
            graphics.fillStyle(0xff0000, 0.5);
            graphics.beginPath();
            graphics.moveTo(hx + 20, hy - 15);
            graphics.lineTo(hx + 10, hy);
            graphics.lineTo(hx + 30, hy);
            graphics.closePath();
            graphics.fillPath();
            
            graphics.fillStyle(0xffaa00, 0.8);
            graphics.fillCircle(hx + 20, hy - 5, 2);
        }

        // Power cables across floor
        for (var i = 0; i < 15; i++) {
            var cx = random() * textureWidth;
            var cw = 30 + random() * 60;
            
            graphics.lineStyle(3, 0x1a0d2a, 0.7);
            graphics.beginPath();
            graphics.moveTo(cx, groundY - 2);
            
            for (var s = 0; s < 5; s++) {
                graphics.lineTo(cx + (cw / 5) * s, groundY - 2 + Math.sin(s) * 3);
            }
            graphics.strokePath();
            
            // Cable glow
            graphics.lineStyle(1, 0x00ffff, 0.2);
            graphics.beginPath();
            graphics.moveTo(cx, groundY - 2);
            for (var s = 0; s < 5; s++) {
                graphics.lineTo(cx + (cw / 5) * s, groundY - 2 + Math.sin(s) * 3);
            }
            graphics.strokePath();
            graphics.lineStyle(0);
        }
    };

    return BackgroundGeneratorMothershipInterior;
})();