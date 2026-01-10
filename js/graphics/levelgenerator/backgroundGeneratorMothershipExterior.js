// ═══════════════════════════════════════════════════════════════════════════
// backgroundGeneratorMothershipExterior.js - Alien Mothership Exterior Hull
// Massive alien structure with biomechanical hull, energy systems, and defenses
// ═══════════════════════════════════════════════════════════════════════════

var BackgroundGeneratorMothershipExterior = (function() {
    function BackgroundGeneratorMothershipExterior(scene, config) {
        this.scene = scene;
        this.config = config;
        this.generatedTextures = new Map();
    }

    BackgroundGeneratorMothershipExterior.prototype.createRNG = function(seed) {
        var state = seed >>> 0;
        return function() {
            state += 0x6d2b79f5;
            var t = state;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    };

    BackgroundGeneratorMothershipExterior.prototype.generateLoopingNoise = function(length, step, magnitude, seed) {
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

    BackgroundGeneratorMothershipExterior.prototype.generateAllTextures = function() {
        console.log('[BackgroundGeneratorMothershipExterior] Starting texture generation...');

        for (var i = 0; i < LAYER_ORDER.length; i++) {
            var layerName = LAYER_ORDER[i];
            var layerConfig = BACKGROUND_LAYERS[layerName];
            this.generateLayerTexture(layerName, layerConfig);
        }

        console.log('[BackgroundGeneratorMothershipExterior] All textures generated!');
        return this.generatedTextures;
    };

    BackgroundGeneratorMothershipExterior.prototype.generateLayerTexture = function(layerName, layerConfig) {
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
            console.warn('[BackgroundGeneratorMothershipExterior] Generator "' + layerConfig.generator + '" not found');
        }

        graphics.generateTexture(layerConfig.key, textureWidth, worldHeight);
        graphics.destroy();

        this.generatedTextures.set(layerName, layerConfig.key);
        console.log('[BackgroundGeneratorMothershipExterior] Generated: ' + layerConfig.key + ' (' + textureWidth + 'x' + worldHeight + ')');

        return layerConfig.key;
    };

    // ═══════════════════════════════════════════════════════════════════════
    // MOTHERSHIP EXTERIOR GENERATORS
    // ═══════════════════════════════════════════════════════════════════════

    BackgroundGeneratorMothershipExterior.prototype.generateSkyLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var bandHeight = 25;

        // Deep space with alien energy field
        for (var y = 0; y < worldHeight; y += bandHeight) {
            var t = y / worldHeight;
            var r, g, b;

            if (t < 0.3) {
                // Deep purple void
                r = Math.floor(15 + t * 25);
                g = Math.floor(5 + t * 15);
                b = Math.floor(35 + t * 45);
            } else if (t < 0.5) {
                // Transition to cyan energy field
                var mt = (t - 0.3) / 0.2;
                r = Math.floor(40 + mt * 20);
                g = Math.floor(20 + mt * 50);
                b = Math.floor(80 + mt * 40);
            } else if (t < 0.7) {
                // Bright cyan center
                var mt2 = (t - 0.5) / 0.2;
                r = Math.floor(60 - mt2 * 20);
                g = Math.floor(70 + mt2 * 30);
                b = Math.floor(120 - mt2 * 20);
            } else {
                // Return to purple depths
                var bt = (t - 0.7) / 0.3;
                r = Math.floor(40 - bt * 25);
                g = Math.floor(100 - bt * 80);
                b = Math.floor(100 - bt * 40);
            }

            graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
            graphics.fillRect(0, y, textureWidth, bandHeight + 1);
        }

        // Nebula clouds
        for (var i = 0; i < 8; i++) {
            var nx = random() * textureWidth;
            var ny = random() * worldHeight;
            var size = 100 + random() * 200;
            
            graphics.fillStyle(0x663399, 0.08);
            graphics.fillCircle(nx, ny, size * 1.3);
            graphics.fillStyle(0x4466aa, 0.06);
            graphics.fillCircle(nx + 30, ny - 20, size);
        }
    };

    BackgroundGeneratorMothershipExterior.prototype.generateAtmosphereLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;

        // Energy field distortions
        for (var i = 0; i < 15; i++) {
            var px = random() * textureWidth;
            var py = random() * worldHeight;
            var size = 60 + random() * 120;
            
            graphics.fillStyle(0x00ffff, 0.04);
            graphics.fillCircle(px, py, size * 1.2);
            graphics.fillStyle(0x00aaff, 0.06);
            graphics.fillCircle(px + 10, py, size * 0.8);
            graphics.fillStyle(0x0088ff, 0.03);
            graphics.fillCircle(px - 10, py + 10, size);
        }

        // Plasma tendrils
        for (var i = 0; i < 10; i++) {
            var sx = random() * textureWidth;
            var sy = random() * worldHeight * 0.6;
            
            for (var s = 0; s < 7; s++) {
                var drift = Math.sin(s * 0.8) * 20;
                var alpha = 0.08 - s * 0.01;
                graphics.fillStyle(0xff00ff, alpha);
                graphics.fillEllipse(sx + drift + s * 8, sy + s * 35, 15 + s * 8, 25 + s * 12);
            }
        }

        // Energy waves
        for (var i = 0; i < 5; i++) {
            var wy = worldHeight * 0.2 + i * (worldHeight * 0.15);
            graphics.fillStyle(0x00ccff, 0.03);
            graphics.fillRect(0, wy, textureWidth, 35 + random() * 25);
        }
    };

    BackgroundGeneratorMothershipExterior.prototype.generateStarsLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;

        // Distant stars
        for (var i = 0; i < 120; i++) {
            var x = random() * textureWidth;
            var y = random() * worldHeight;
            var brightness = 0.2 + random() * 0.6;
            var color = random() > 0.7 ? 0xaaffff : 0xffffff;
            
            graphics.fillStyle(color, brightness);
            var size = random() > 0.9 ? 2 : 1;
            graphics.fillRect(x, y, size, size);
        }

        // Alien constellations
        for (var i = 0; i < 8; i++) {
            var cx = random() * textureWidth;
            var cy = random() * worldHeight * 0.5;
            
            graphics.lineStyle(1, 0x66ffff, 0.15);
            graphics.beginPath();
            graphics.moveTo(cx, cy);
            
            for (var j = 0; j < 3; j++) {
                var nx = cx + (random() - 0.5) * 80;
                var ny = cy + (random() - 0.5) * 80;
                graphics.lineTo(nx, ny);
                graphics.fillStyle(0xaaffff, 0.5);
                graphics.fillCircle(nx, ny, 2);
            }
            graphics.strokePath();
            graphics.lineStyle(0);
        }

        // Energy cores (distant ship lights)
        for (var i = 0; i < 12; i++) {
            var ex = random() * textureWidth;
            var ey = random() * worldHeight;
            
            graphics.fillStyle(0xff00ff, 0.12);
            graphics.fillCircle(ex, ey, 18);
            graphics.fillStyle(0xff66ff, 0.25);
            graphics.fillCircle(ex, ey, 10);
            graphics.fillStyle(0xffaaff, 0.4);
            graphics.fillCircle(ex, ey, 5);
        }
    };

    BackgroundGeneratorMothershipExterior.prototype.generateHorizonCityLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var horizonY = worldHeight - 150;
        var seed = (this.config.backgroundSeed || 1337) + 100;

        // Distant mothership structures
        var structureNoise = this.generateLoopingNoise(textureWidth, 45, 55, seed * 0.7);
        
        graphics.fillStyle(0x1a0d2a, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        
        for (var i = 0; i < structureNoise.length; i++) {
            var x = i * 45;
            if (x > textureWidth) break;
            
            var height = 20 + Math.abs(structureNoise[i]) * 0.7;
            graphics.lineTo(x, horizonY - height);
            
            // Spires
            if (random() > 0.7) {
                graphics.lineTo(x + 15, horizonY - height - 30);
                graphics.lineTo(x + 30, horizonY - height);
            }
        }
        
        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        // Distant energy nodes
        for (var i = 0; i < 20; i++) {
            var nx = random() * textureWidth;
            var ny = horizonY - 10 - random() * 40;
            
            graphics.fillStyle(0x00ffff, 0.15);
            graphics.fillCircle(nx, ny, 8);
            graphics.fillStyle(0x00aaff, 0.3);
            graphics.fillCircle(nx, ny, 4);
        }

        // Energy beams
        for (var i = 0; i < 6; i++) {
            var bx = random() * textureWidth;
            graphics.lineStyle(2, 0x00ffff, 0.2);
            graphics.beginPath();
            graphics.moveTo(bx, horizonY - random() * 30);
            graphics.lineTo(bx + (random() - 0.5) * 20, 0);
            graphics.strokePath();
            graphics.lineStyle(0);
        }
    };

    BackgroundGeneratorMothershipExterior.prototype.generateMidCityLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var baseY = worldHeight - 120;

        // Large hull plates
        var plateNoise = this.generateLoopingNoise(textureWidth, 80, 35, 1.5);
        
        for (var i = 0; i < plateNoise.length; i++) {
            var px = i * 80;
            if (px > textureWidth) break;
            
            var plateWidth = 70 + random() * 30;
            var plateHeight = 40 + Math.abs(plateNoise[i]) * 0.8;
            var py = baseY - plateHeight;
            
            // Main plate
            graphics.fillStyle(0x2a1a3a, 1);
            graphics.fillRect(px, py, plateWidth, plateHeight);
            
            // Plate edges
            graphics.fillStyle(0x3a2a4a, 1);
            graphics.fillRect(px, py, 3, plateHeight);
            graphics.fillRect(px + plateWidth - 3, py, 3, plateHeight);
            
            // Biomechanical veins
            graphics.lineStyle(1, 0x663399, 0.4);
            for (var v = 0; v < 5; v++) {
                graphics.beginPath();
                graphics.moveTo(px + random() * plateWidth, py);
                var vx = px + random() * plateWidth;
                var vy = py + plateHeight * 0.5;
                graphics.lineTo(vx, vy);
                graphics.lineTo(px + random() * plateWidth, py + plateHeight);
                graphics.strokePath();
            }
            graphics.lineStyle(0);
            
            // Energy conduits
            if (random() > 0.6) {
                var cx = px + plateWidth * 0.5;
                var cy = py + plateHeight * 0.5;
                
                graphics.fillStyle(0x00ffff, 0.15);
                graphics.fillCircle(cx, cy, 12);
                graphics.fillStyle(0x00aaff, 0.3);
                graphics.fillCircle(cx, cy, 6);
                
                // Pulsing glow
                for (var p = 0; p < 3; p++) {
                    graphics.fillStyle(0x00ffff, 0.08 - p * 0.02);
                    graphics.fillCircle(cx, cy, 12 + p * 8);
                }
            }
        }

        // Greeble details
        for (var i = 0; i < 100; i++) {
            var gx = random() * textureWidth;
            var gy = baseY - random() * 80;
            var gtype = random();
            
            graphics.fillStyle(0x1a0d2a, 0.6);
            
            if (gtype > 0.7) {
                // Small vents
                graphics.fillRect(gx, gy, 3 + random() * 5, 2 + random() * 4);
            } else if (gtype > 0.4) {
                // Sensor nodes
                graphics.fillCircle(gx, gy, 2 + random() * 3);
            } else {
                // Cable conduits
                graphics.fillRect(gx, gy, 1 + random() * 2, 8 + random() * 12);
            }
        }

        // Shield generator nodes
        for (var i = 0; i < 8; i++) {
            var sx = (i * (textureWidth / 8)) + random() * 50;
            var sy = baseY - 40 - random() * 30;
            
            // Generator housing
            graphics.fillStyle(0x3a2a4a, 1);
            graphics.fillRect(sx - 10, sy, 20, 25);
            
            // Shield emitter
            graphics.fillStyle(0x00ffff, 0.3);
            graphics.fillCircle(sx, sy + 12, 8);
            graphics.fillStyle(0x00aaff, 0.5);
            graphics.fillCircle(sx, sy + 12, 5);
            
            // Energy field
            for (var s = 0; s < 4; s++) {
                graphics.fillStyle(0x00ffff, 0.06 - s * 0.01);
                graphics.fillCircle(sx, sy + 12, 15 + s * 10);
            }
        }
    };

    BackgroundGeneratorMothershipExterior.prototype.generateTerrainLayer = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var groundY = worldHeight - 80;

        // Main hull surface with biomechanical detail
        var hullNoise = this.generateLoopingNoise(textureWidth, 40, 18, 0.8);
        var detailNoise = this.generateLoopingNoise(textureWidth, 25, 10, 1.6);
        
        // Base hull layer
        graphics.fillStyle(0x3a2a4a, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        for (var i = 0; i < hullNoise.length; i++) {
            var x = i * 40;
            if (x > textureWidth) break;
            graphics.lineTo(x, groundY - hullNoise[i] - 12);
        }
        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        // Detail hull layer
        graphics.fillStyle(0x4a3a5a, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        for (var i = 0; i < detailNoise.length; i++) {
            var x = i * 25;
            if (x > textureWidth) break;
            graphics.lineTo(x, groundY - detailNoise[i] - 5);
        }
        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        // Top detail layer (lightest)
        graphics.fillStyle(0x5a4a6a, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        var topStep = 30;
        for (var i = 0; i < textureWidth / topStep; i++) {
            var x = i * topStep;
            var noiseIdx = Math.floor(i * (detailNoise.length / (textureWidth / topStep))) % detailNoise.length;
            graphics.lineTo(x, groundY - detailNoise[noiseIdx] * 0.5 - 2);
        }
        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        // Large energy vents
        for (var i = 0; i < 12; i++) {
            var vx = (i * (textureWidth / 12)) + random() * 60;
            var vy = groundY - random() * 20;
            var vw = 20 + random() * 25;
            var vh = 15 + random() * 20;
            
            // Vent housing
            graphics.fillStyle(0x1a0d2a, 1);
            graphics.fillRect(vx - vw/2, vy, vw, vh);
            
            // Interior glow
            graphics.fillStyle(0xff00ff, 0.15);
            graphics.fillRect(vx - vw/2 + 3, vy + 3, vw - 6, vh - 6);
            
            // Pulsing energy
            for (var p = 0; p < 5; p++) {
                var alpha = 0.25 - p * 0.04;
                graphics.fillStyle(0xff00ff, alpha);
                graphics.fillCircle(vx, vy + vh/2, 8 + p * 6);
            }
            
            // Energy particles
            for (var e = 0; e < 8; e++) {
                var ex = vx + (random() - 0.5) * vw;
                var ey = vy - 20 - e * 15;
                graphics.fillStyle(0xff66ff, 0.4 - e * 0.04);
                graphics.fillCircle(ex, ey, 3 - e * 0.3);
            }
        }

        // Defense turret mounts
        for (var i = 0; i < 10; i++) {
            var tx = random() * textureWidth;
            var ty = groundY - 15 - random() * 15;
            
            // Base mount
            graphics.fillStyle(0x2a1a3a, 1);
            graphics.fillCircle(tx, ty + 8, 12);
            
            // Turret barrel
            graphics.fillStyle(0x3a2a4a, 1);
            graphics.fillRect(tx - 3, ty - 10, 6, 18);
            graphics.fillRect(tx - 6, ty + 6, 12, 6);
            
            // Targeting sensor
            graphics.fillStyle(0xff0000, 0.6);
            graphics.fillCircle(tx, ty, 4);
            graphics.fillStyle(0xff6666, 0.8);
            graphics.fillCircle(tx, ty, 2);
            
            // Targeting beam
            if (random() > 0.5) {
                graphics.lineStyle(1, 0xff0000, 0.3);
                graphics.beginPath();
                graphics.moveTo(tx, ty);
                graphics.lineTo(tx + (random() - 0.5) * 100, ty - 50 - random() * 100);
                graphics.strokePath();
                graphics.lineStyle(0);
            }
        }

        // Power conduit network
        graphics.lineStyle(2, 0x00ffff, 0.15);
        var conduitY = groundY - 5;
        graphics.beginPath();
        graphics.moveTo(0, conduitY);
        for (var x = 0; x < textureWidth; x += 30) {
            conduitY += (random() - 0.5) * 10;
            graphics.lineTo(x, conduitY);
        }
        graphics.strokePath();
        
        // Conduit nodes
        for (var x = 0; x < textureWidth; x += 80) {
            var nx = x + random() * 30;
            graphics.fillStyle(0x00ffff, 0.4);
            graphics.fillCircle(nx, conduitY, 5);
            graphics.fillStyle(0x00aaff, 0.6);
            graphics.fillCircle(nx, conduitY, 3);
        }
        graphics.lineStyle(0);

        // Biomechanical structures
        for (var i = 0; i < 15; i++) {
            var bx = random() * textureWidth;
            var bw = 30 + random() * 40;
            var bh = 50 + random() * 80;
            var by = groundY - hullNoise[Math.floor((bx / textureWidth) * hullNoise.length) % hullNoise.length];
            
            graphics.fillStyle(0x2a1a3a, 1);
            
            // Organic tower shape
            graphics.beginPath();
            graphics.moveTo(bx - bw/2, by);
            
            // Bulbous middle
            var segments = 6;
            for (var s = 0; s <= segments; s++) {
                var t = s / segments;
                var wx = bw/2 * (1 + Math.sin(t * Math.PI) * 0.3);
                var wy = by - bh * t;
                if (s % 2 === 0) {
                    graphics.lineTo(bx - wx, wy);
                } else {
                    graphics.lineTo(bx + wx, wy);
                }
            }
            
            graphics.closePath();
            graphics.fillPath();
            
            // Veins
            graphics.lineStyle(1, 0x663399, 0.5);
            for (var v = 0; v < 4; v++) {
                graphics.beginPath();
                graphics.moveTo(bx - bw/4, by);
                graphics.lineTo(bx + (random() - 0.5) * bw/2, by - bh * 0.5);
                graphics.lineTo(bx + bw/4, by - bh);
                graphics.strokePath();
            }
            graphics.lineStyle(0);
            
            // Glowing nodes
            for (var n = 0; n < 3; n++) {
                var ny = by - bh * (0.3 + n * 0.3);
                graphics.fillStyle(0x00ffff, 0.2);
                graphics.fillCircle(bx, ny, 8);
                graphics.fillStyle(0x00aaff, 0.4);
                graphics.fillCircle(bx, ny, 4);
            }
        }

        // Dense greeble layer
        for (var i = 0; i < 200; i++) {
            var gx = random() * textureWidth;
            var gy = groundY - random() * 60;
            var gtype = random();
            
            if (gtype > 0.8) {
                // Vents
                graphics.fillStyle(0x1a0d2a, 0.8);
                graphics.fillRect(gx, gy, 2 + random() * 4, 4 + random() * 6);
                graphics.fillStyle(0xff00ff, 0.1);
                graphics.fillRect(gx + 1, gy + 1, 2, 3);
            } else if (gtype > 0.6) {
                // Cables
                graphics.lineStyle(1, 0x2a1a3a, 0.6);
                graphics.beginPath();
                graphics.moveTo(gx, gy);
                graphics.lineTo(gx + (random() - 0.5) * 20, gy + 10 + random() * 15);
                graphics.strokePath();
                graphics.lineStyle(0);
            } else if (gtype > 0.4) {
                // Sensors
                graphics.fillStyle(0x663399, 0.4);
                graphics.fillCircle(gx, gy, 1 + random() * 3);
            } else {
                // Small panels
                graphics.fillStyle(0x3a2a4a, 0.5);
                graphics.fillRect(gx, gy, 3 + random() * 6, 2 + random() * 5);
            }
        }

        // Alien symbols/glyphs
        for (var i = 0; i < 8; i++) {
            var sx = random() * textureWidth;
            var sy = groundY - 20 - random() * 30;
            
            graphics.fillStyle(0x00ffff, 0.25);
            
            // Random alien glyph
            var glyphType = Math.floor(random() * 3);
            if (glyphType === 0) {
                // Circle with lines
                graphics.fillCircle(sx, sy, 8);
                graphics.lineStyle(2, 0x00ffff, 0.3);
                graphics.beginPath();
                graphics.moveTo(sx - 8, sy);
                graphics.lineTo(sx + 8, sy);
                graphics.moveTo(sx, sy - 8);
                graphics.lineTo(sx, sy + 8);
                graphics.strokePath();
                graphics.lineStyle(0);
            } else if (glyphType === 1) {
                // Triangle
                graphics.beginPath();
                graphics.moveTo(sx, sy - 8);
                graphics.lineTo(sx - 7, sy + 8);
                graphics.lineTo(sx + 7, sy + 8);
                graphics.closePath();
                graphics.fillPath();
            } else {
                // Spiral
                for (var a = 0; a < Math.PI * 4; a += 0.5) {
                    var r = a * 1.5;
                    graphics.fillCircle(sx + Math.cos(a) * r, sy + Math.sin(a) * r, 1);
                }
            }
        }

        // Energy pools/leaks
        for (var i = 0; i < 6; i++) {
            var px = random() * textureWidth;
            var py = groundY + 10 + random() * 15;
            var pw = 40 + random() * 50;
            
            graphics.fillStyle(0xff00ff, 0.15);
            graphics.fillEllipse(px, py, pw, 12);
            graphics.fillStyle(0xff66ff, 0.25);
            graphics.fillEllipse(px, py, pw * 0.7, 8);
            graphics.fillStyle(0xffaaff, 0.15);
            graphics.fillEllipse(px - pw * 0.2, py - 2, pw * 0.4, 6);
        }
    };

    return BackgroundGeneratorMothershipExterior;
})();