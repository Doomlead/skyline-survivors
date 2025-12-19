// ═══════════════════════════════════════════════════════════════════════════
// background.js - Procedural Background Generation with Seamless Parallax
// ═══════════════════════════════════════════════════════════════════════════

// Foreground depth base - gameplay sprites should stay at or above this; background layers remain below
var FG_DEPTH_BASE = 100;

// ------------------------
// Background Configuration
// ------------------------

var BACKGROUND_LAYERS = {
    sky: {
        key: 'bg_sky',
        speedX: 0.0,
        depth: 0,
        generator: 'generateSkyLayer',
    },
    atmosphere: {
        key: 'bg_atmosphere',
        speedX: 0.02,
        depth: 1,
        generator: 'generateAtmosphereLayer',
    },
    stars: {
        key: 'bg_stars',
        speedX: 0.05,
        depth: 2,
        generator: 'generateStarsLayer',
    },
    horizonCity: {
        key: 'bg_horizon_city',
        speedX: 0.1,
        depth: 3,
        generator: 'generateHorizonCityLayer',
    },
    distantCity: {
        key: 'bg_distant_city',
        speedX: 0.2,
        depth: 4,
        generator: 'generateDistantCityLayer',
    },
    midCity: {
        key: 'bg_mid_city',
        speedX: 0.4,
        depth: 5,
        generator: 'generateMidCityLayer',
    },
    nearCity: {
        key: 'bg_near_city',
        speedX: 0.6,
        depth: 6,
        generator: 'generateNearCityLayer',
    },
    terrain: {
        key: 'bg_terrain',
        speedX: 0.85,
        depth: 7,
        generator: 'generateTerrainLayer',
    },
};

var LAYER_ORDER = [
    'sky',
    'atmosphere',
    'stars',
    'horizonCity',
    'distantCity',
    'midCity',
    'nearCity',
    'terrain',
];

// ------------------------
// Background Generator Class
// ------------------------

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

    BackgroundGenerator.prototype.generateLoopingNoise = function(length, step, magnitude, seed) {
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
        
        var graphics = this.scene.add.graphics();
        var rng = this.createRNG((this.config.backgroundSeed || 1337) + layerConfig.depth * 1000);
        
        if (typeof this[layerConfig.generator] === 'function') {
            this[layerConfig.generator](graphics, rng);
        } else {
            console.warn('[BackgroundGenerator] Generator "' + layerConfig.generator + '" not found');
        }
        
        // KEY: Use generateTexture() - creates static texture TileSprite can use
        graphics.generateTexture(layerConfig.key, worldWidth, worldHeight);
        graphics.destroy();
        
        this.generatedTextures.set(layerName, layerConfig.key);
        console.log('[BackgroundGenerator] Generated: ' + layerConfig.key);
        
        return layerConfig.key;
    };

    // ═══════════════════════════════════════════════════════════════════════
    // LAYER GENERATORS
    // ═══════════════════════════════════════════════════════════════════════

    BackgroundGenerator.prototype.generateSkyLayer = function(graphics, random) {
        var worldWidth = this.config.worldWidth;
        var worldHeight = this.config.worldHeight;
        var bandHeight = 20;

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
            graphics.fillRect(0, y, worldWidth, bandHeight + 1);
        }
    };

    BackgroundGenerator.prototype.generateAtmosphereLayer = function(graphics, random) {
        var worldWidth = this.config.worldWidth;
        var worldHeight = this.config.worldHeight;

        for (var i = 0; i < 8; i++) {
            var px = random() * worldWidth;
            var py = worldHeight * 0.3 + random() * worldHeight * 0.3;

            for (var s = 0; s < 6; s++) {
                var size = 30 + s * 15;
                var alpha = 0.08 - s * 0.01;
                graphics.fillStyle(0x222222, alpha);
                graphics.fillCircle(px + s * 8 - 20, py - s * 40, size);
            }
        }

        graphics.fillStyle(0x443355, 0.06);
        for (var i = 0; i < 12; i++) {
            var cx = random() * worldWidth;
            var cy = worldHeight * 0.15 + random() * worldHeight * 0.25;
            var width = 100 + random() * 200;
            var height = 30 + random() * 60;
            graphics.fillEllipse(cx, cy, width, height);
        }

        for (var i = 0; i < 5; i++) {
            var by = worldHeight * 0.4 + i * 50;
            graphics.fillStyle(0x4a3a30, 0.04);
            graphics.fillRect(0, by, worldWidth, 30 + random() * 40);
        }
    };

    BackgroundGenerator.prototype.generateStarsLayer = function(graphics, random) {
        var worldWidth = this.config.worldWidth;
        var worldHeight = this.config.worldHeight;

        for (var i = 0; i < 180; i++) {
            var x = random() * worldWidth;
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

        for (var i = 0; i < 5; i++) {
            var dx = random() * worldWidth;
            var dy = random() * (worldHeight * 0.3);
            graphics.fillStyle(0xffffff, 0.7);
            graphics.fillRect(dx, dy, 3, 1);
            graphics.fillStyle(0xff4400, 0.5);
            graphics.fillRect(dx + 3, dy, 2, 1);
        }

        for (var i = 0; i < 3; i++) {
            var fx = random() * worldWidth;
            var fy = worldHeight * 0.5 + random() * worldHeight * 0.2;
            graphics.fillStyle(0xff8844, 0.15);
            graphics.fillCircle(fx, fy, 25);
            graphics.fillStyle(0xffcc66, 0.25);
            graphics.fillCircle(fx, fy, 12);
        }
    };

    BackgroundGenerator.prototype.generateHorizonCityLayer = function(graphics, random) {
        var worldWidth = this.config.worldWidth;
        var worldHeight = this.config.worldHeight;
        var horizonY = worldHeight - 120;
        var self = this;
        var buildingRng = this.createRNG((this.config.backgroundSeed || 1337) + 100);
        var buildingRandom = function() { return buildingRng(); };

        graphics.fillStyle(0x060608, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);

        var hx = 0;
        while (hx < worldWidth + 50) {
            var buildingWidth = 8 + buildingRandom() * 25;
            var buildingHeight = 20 + buildingRandom() * 70;
            var destroyed = buildingRandom() > 0.6;

            if (destroyed) {
                graphics.lineTo(hx, horizonY - buildingHeight * 0.3);
                graphics.lineTo(hx + buildingWidth * 0.3, horizonY - buildingHeight);
                graphics.lineTo(hx + buildingWidth * 0.6, horizonY - buildingHeight * 0.5);
                graphics.lineTo(hx + buildingWidth, horizonY - buildingHeight * 0.7);
            } else {
                graphics.lineTo(hx, horizonY - buildingHeight);
                graphics.lineTo(hx + buildingWidth, horizonY - buildingHeight);
            }

            hx += buildingWidth + buildingRandom() * 5;
        }

        graphics.lineTo(worldWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        for (var i = 0; i < 10; i++) {
            var fx = random() * worldWidth;
            graphics.fillStyle(0xff3300, 0.2);
            graphics.fillCircle(fx, horizonY - 20, 12);
            graphics.fillStyle(0xff6600, 0.35);
            graphics.fillCircle(fx, horizonY - 20, 6);
        }
    };

    BackgroundGenerator.prototype.generateDistantCityLayer = function(graphics, random) {
        var worldWidth = this.config.worldWidth;
        var worldHeight = this.config.worldHeight;

        for (var i = 0; i < 35; i++) {
            var bx = i * (worldWidth / 35) + random() * 40;
            var bWidth = 18 + random() * 35;
            var bHeight = 50 + random() * 100;
            var by = worldHeight - 105;
            var left = bx - bWidth / 2;
            var top = by - bHeight;

            var buildingType = random();
            graphics.fillStyle(0x0c0c14, 1);

            if (buildingType > 0.8) {
                graphics.beginPath();
                graphics.moveTo(left + bWidth * 0.3, by);
                graphics.lineTo(left + bWidth * 0.3, top + bHeight * 0.3);
                graphics.lineTo(left + bWidth * 0.5, top);
                graphics.lineTo(left + bWidth * 0.7, top + bHeight * 0.3);
                graphics.lineTo(left + bWidth * 0.7, by);
                graphics.closePath();
                graphics.fillPath();
            } else if (buildingType > 0.5) {
                graphics.beginPath();
                graphics.moveTo(left, by);
                graphics.lineTo(left, top + bHeight * 0.2);
                var segs = 2 + Math.floor(random() * 3);
                for (var s = 0; s <= segs; s++) {
                    graphics.lineTo(left + (bWidth / segs) * s, top + random() * bHeight * 0.25);
                }
                graphics.lineTo(left + bWidth, top + bHeight * 0.15);
                graphics.lineTo(left + bWidth, by);
                graphics.closePath();
                graphics.fillPath();
            } else {
                graphics.fillRect(left, top, bWidth, bHeight);
                if (random() > 0.7) {
                    graphics.fillRect(left + bWidth / 2 - 1, top - 15, 2, 15);
                }
            }

            if (random() > 0.4) {
                graphics.fillStyle(0x4488aa, 0.3);
                for (var wy = 10; wy < bHeight - 8; wy += 14) {
                    graphics.fillRect(left + 3, top + wy, bWidth - 6, 2);
                }
            }

            if (random() > 0.75) {
                graphics.fillStyle(0xff4400, 0.25);
                graphics.fillCircle(left + bWidth / 2, top + bHeight * 0.3, 8);
            }
        }

        for (var i = 0; i < 6; i++) {
            var sx = random() * worldWidth;
            var sy = worldHeight - 130;
            graphics.fillStyle(0x222228, 0.3);
            for (var s = 0; s < 5; s++) {
                graphics.fillCircle(sx + s * 4, sy - s * 25, 12 + s * 4);
            }
        }
    };

    BackgroundGenerator.prototype.generateMidCityLayer = function(graphics, random) {
        var worldWidth = this.config.worldWidth;
        var worldHeight = this.config.worldHeight;
        var bridgeY = worldHeight - 100;

        graphics.fillStyle(0x181820, 1);

        for (var i = 0; i < 8; i++) {
            var px = i * (worldWidth / 8) + 50;
            var collapsed = random() > 0.6;

            if (collapsed) {
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

        for (var i = 0; i < 6; i++) {
            var segX = i * (worldWidth / 6) + random() * 100;
            var segY = bridgeY - 55 + random() * 30;
            var segWidth = 60 + random() * 80;
            var angle = -0.1 + random() * 0.2;

            graphics.fillStyle(0x1a1a24, 1);
            graphics.beginPath();
            graphics.moveTo(segX, segY);
            graphics.lineTo(segX + segWidth, segY + segWidth * angle);
            graphics.lineTo(segX + segWidth, segY + segWidth * angle + 8);
            graphics.lineTo(segX, segY + 8);
            graphics.closePath();
            graphics.fillPath();

            graphics.fillStyle(0xffff00, 0.3);
            graphics.fillRect(segX + 10, segY + 3, 15, 2);
            graphics.fillRect(segX + 35, segY + 3, 15, 2);
        }

        for (var i = 0; i < 28; i++) {
            var bx = i * (worldWidth / 28) + random() * 50;
            var bWidth = 28 + random() * 50;
            var bHeight = 70 + random() * 110;
            var by = worldHeight - 92;
            var left = bx - bWidth / 2;
            var top = by - bHeight;

            var destroyed = random() > 0.35;
            var buildingType = random();

            graphics.fillStyle(0x161620, 1);

            if (destroyed) {
                graphics.beginPath();
                graphics.moveTo(left, by);
                graphics.lineTo(left, top + bHeight * 0.12);

                var segments = 3 + Math.floor(random() * 4);
                for (var s = 0; s <= segments; s++) {
                    graphics.lineTo(left + (bWidth / segments) * s, top + random() * bHeight * 0.35);
                }

                graphics.lineTo(left + bWidth, top + bHeight * 0.1);
                graphics.lineTo(left + bWidth, by);
                graphics.closePath();
                graphics.fillPath();

                if (random() > 0.4) {
                    var fx = left + bWidth / 2;
                    var fy = top + bHeight * 0.35;
                    graphics.fillStyle(0xff4400, 0.3);
                    graphics.fillCircle(fx, fy, 18);
                    graphics.fillStyle(0xff7700, 0.5);
                    graphics.fillCircle(fx, fy, 10);
                }
            } else {
                graphics.fillRect(left, top, bWidth, bHeight);

                graphics.fillStyle(0x6699bb, 0.5);
                for (var fy = 12; fy < bHeight - 10; fy += 15) {
                    for (var wx = 5; wx < bWidth - 8; wx += 11) {
                        if (random() > 0.25) {
                            var state = random();
                            if (state > 0.92) {
                                graphics.fillStyle(0xff4400, 0.7);
                            } else if (state > 0.6) {
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

        var craneX = worldWidth * 0.3;
        var craneY = worldHeight - 100;
        graphics.fillStyle(0x222230, 1);
        graphics.fillRect(craneX, craneY - 80, 6, 80);
        graphics.beginPath();
        graphics.moveTo(craneX + 3, craneY - 80);
        graphics.lineTo(craneX + 80, craneY - 40);
        graphics.lineTo(craneX + 80, craneY - 35);
        graphics.lineTo(craneX + 3, craneY - 75);
        graphics.closePath();
        graphics.fillPath();
    };

    BackgroundGenerator.prototype.generateNearCityLayer = function(graphics, random) {
        var worldWidth = this.config.worldWidth;
        var worldHeight = this.config.worldHeight;

        for (var i = 0; i < 6; i++) {
            var poleX = i * (worldWidth / 6) + 80;
            var poleY = worldHeight - 88;
            var fallen = random() > 0.5;

            if (fallen) {
                graphics.fillStyle(0x1c1c28, 1);
                graphics.beginPath();
                graphics.moveTo(poleX, poleY);
                graphics.lineTo(poleX + 40, poleY - 15);
                graphics.lineTo(poleX + 42, poleY - 12);
                graphics.lineTo(poleX + 3, poleY + 3);
                graphics.closePath();
                graphics.fillPath();

                if (random() > 0.5) {
                    graphics.fillStyle(0x44aaff, 0.6);
                    graphics.fillCircle(poleX + 35, poleY - 10, 3);
                }
            } else {
                graphics.fillStyle(0x1c1c28, 1);
                graphics.fillRect(poleX - 3, poleY - 70, 6, 70);
                graphics.fillRect(poleX - 20, poleY - 65, 40, 4);
            }
        }

        for (var i = 0; i < 18; i++) {
            var rx = i * (worldWidth / 18) + random() * 60;
            var ry = worldHeight - 85 + random() * 20;
            graphics.fillStyle(0x1e1e28, 1);
            graphics.fillRect(rx - 25, ry - 15, 50 + random() * 30, 10 + random() * 8);
        }

        for (var i = 0; i < 14; i++) {
            var bx = i * (worldWidth / 14) + random() * 50;
            var bWidth = 36 + random() * 60;
            var bHeight = 80 + random() * 140;
            var by = worldHeight - 85;
            var left = bx - bWidth / 2;
            var top = by - bHeight;

            graphics.fillStyle(0x22222c, 1);
            graphics.beginPath();
            graphics.moveTo(left, by);
            graphics.lineTo(left, top + bHeight * 0.08);

            var segs = 4 + Math.floor(random() * 4);
            for (var s = 0; s <= segs; s++) {
                graphics.lineTo(left + (bWidth / segs) * s, top + random() * bHeight * 0.3);
            }

            graphics.lineTo(left + bWidth, top + bHeight * 0.05);
            graphics.lineTo(left + bWidth, by);
            graphics.closePath();
            graphics.fillPath();

            if (random() > 0.35) {
                var fx = left + bWidth * 0.2 + random() * bWidth * 0.6;
                var fy = top + bHeight * 0.15 + random() * bHeight * 0.4;

                graphics.fillStyle(0xff2200, 0.35);
                graphics.fillCircle(fx, fy, 22);
                graphics.fillStyle(0xff5500, 0.55);
                graphics.fillCircle(fx, fy, 14);
                graphics.fillStyle(0xff8800, 0.75);
                graphics.fillCircle(fx, fy - 3, 8);

                graphics.fillStyle(0x1a1a1a, 0.25);
                graphics.fillCircle(fx - 6, fy - 35, 20);
                graphics.fillCircle(fx + 4, fy - 55, 24);
            }
        }
    };

    BackgroundGenerator.prototype.generateTerrainLayer = function(graphics, random) {
        var worldWidth = this.config.worldWidth;
        var worldHeight = this.config.worldHeight;
        var groundY = worldHeight - 80;

        var baseNoise = this.generateLoopingNoise(worldWidth, 35, 28, 0.5);
        var midNoise = this.generateLoopingNoise(worldWidth, 25, 18, 1.2);
        var topNoise = this.generateLoopingNoise(worldWidth, 28, 14, 2.1);

        // Base terrain
        graphics.fillStyle(0x1a1210, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        for (var i = 0; i < baseNoise.length; i++) {
            var x = i * 35;
            if (x > worldWidth) break;
            graphics.lineTo(x, groundY - baseNoise[i] - 18);
        }
        graphics.lineTo(worldWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        // Mid terrain
        graphics.fillStyle(0x252018, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        for (var i = 0; i < midNoise.length; i++) {
            var x = i * 25;
            if (x > worldWidth) break;
            graphics.lineTo(x, groundY - midNoise[i] - 10);
        }
        graphics.lineTo(worldWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        // Top terrain
        graphics.fillStyle(0x352a20, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        for (var i = 0; i < topNoise.length; i++) {
            var x = i * 28;
            if (x > worldWidth) break;
            graphics.lineTo(x, groundY - topNoise[i] - 4);
        }
        graphics.lineTo(worldWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        // Craters
        for (var i = 0; i < 12; i++) {
            var cx = random() * worldWidth;
            var cy = groundY + 5 + random() * 20;
            var cw = 20 + random() * 40;
            var ch = 8 + random() * 15;

            graphics.fillStyle(0x3a3028, 1);
            graphics.fillEllipse(cx, cy, cw + 6, ch + 3);
            graphics.fillStyle(0x151210, 1);
            graphics.fillEllipse(cx, cy + 2, cw, ch);
        }

        // Wrecked vehicles
        for (var i = 0; i < 8; i++) {
            var vx = random() * worldWidth;
            var vy = groundY + random() * 15;
            var flipped = random() > 0.5;

            graphics.fillStyle(0x2a2520, 1);
            if (flipped) {
                graphics.fillRect(vx, vy, 25, 8);
                graphics.fillRect(vx + 3, vy - 5, 18, 5);
            } else {
                graphics.fillRect(vx, vy, 25, 10);
                graphics.fillRect(vx + 4, vy - 6, 16, 6);
            }

            graphics.fillStyle(0x151512, 1);
            graphics.fillCircle(vx + 5, vy + 10, 4);
            if (!flipped) {
                graphics.fillCircle(vx + 20, vy + 10, 4);
            }
        }

        // Dead trees
        for (var i = 0; i < 10; i++) {
            var tx = random() * worldWidth;
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
            graphics.lineStyle(0);
        }

        // Scattered debris
        graphics.fillStyle(0x4a3a2a, 0.8);
        for (var i = 0; i < 100; i++) {
            var rx = random() * worldWidth;
            var ry = groundY - 3 - random() * 35;
            graphics.fillRect(rx, ry, 3 + random() * 10, 2 + random() * 5);
        }

        // Toxic puddles
        for (var i = 0; i < 5; i++) {
            var px = random() * worldWidth;
            var py = groundY + 10 + random() * 15;
            var pw = 20 + random() * 30;
            var ph = 5 + random() * 8;

            graphics.fillStyle(0x2a4a30, 0.4);
            graphics.fillEllipse(px, py, pw + 4, ph + 2);
            graphics.fillStyle(0x3a6a40, 0.6);
            graphics.fillEllipse(px, py, pw, ph);
        }

        // Foreground buildings
        for (var i = 0; i < 18; i++) {
            var bx = i * (worldWidth / 18) + random() * 80;
            var bWidth = 45 + random() * 70;
            var bHeight = 110 + random() * 150;
            var noiseIdx = Math.floor((bx / worldWidth) * topNoise.length) % topNoise.length;
            var by = groundY - topNoise[noiseIdx];
            var left = bx - bWidth / 2;
            var top = by - bHeight;

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
            for (var r = 0; r < 12; r++) {
                graphics.fillRect(
                    left - 18 + random() * (bWidth + 36),
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

        // Warning signs
        for (var i = 0; i < 4; i++) {
            var sx = random() * worldWidth;
            var sy = groundY - 5;

            graphics.fillStyle(0x3a3530, 1);
            graphics.fillRect(sx - 1, sy - 25, 3, 25);
            graphics.fillStyle(0xaaaa30, 0.8);
            graphics.fillRect(sx - 10, sy - 35, 20, 12);
        }
    };

    return BackgroundGenerator;
})();

// ------------------------
// Parallax Manager Class
// ------------------------

var ParallaxManager = (function() {
    function ParallaxManager(scene, config) {
        this.scene = scene;
        this.config = config;
        this.layers = [];
        this._prevPlayerX = 0;
    }

    ParallaxManager.prototype.createLayers = function() {
        var camWidth = this.config.width;
        var camHeight = this.config.height;

        for (var i = 0; i < LAYER_ORDER.length; i++) {
            var layerName = LAYER_ORDER[i];
            var layerConfig = BACKGROUND_LAYERS[layerName];

            if (!this.scene.textures.exists(layerConfig.key)) {
                console.warn('[ParallaxManager] Texture ' + layerConfig.key + ' not found');
                continue;
            }

            var tileSprite = this.scene.add.tileSprite(0, 0, camWidth, camHeight, layerConfig.key);

            tileSprite.setOrigin(0, 0);
            tileSprite.setScrollFactor(0);
            tileSprite.setDepth(layerConfig.depth);

            this.layers.push({
                sprite: tileSprite,
                speedX: layerConfig.speedX,
                name: layerName
            });
        }

        console.log('[ParallaxManager] Created ' + this.layers.length + ' parallax layers');
    };

    ParallaxManager.prototype.initTracking = function(playerX) {
        // Initialize with camera scroll position instead of player position
        var scene = this.scene;
        var mainCam = scene.cameras.main;
        this._prevPlayerX = mainCam.scrollX;
    };

    ParallaxManager.prototype.update = function(playerX) {
        var scene = this.scene;
        var mainCam = scene.cameras.main;

        // Always lock parallax offsets to the camera's scroll position so they realign perfectly when the
        // world recenters itself. This avoids tiny seams when the wrap math lands between texture pixels.
        var wrapWidth = this.config.worldWidth || 1;
        var normalizedScrollX = ((mainCam.scrollX % wrapWidth) + wrapWidth) % wrapWidth;

        for (var i = 0; i < this.layers.length; i++) {
            var layer = this.layers[i];
            var sprite = layer.sprite;
            var textureWidth = (sprite.texture && sprite.texture.getSourceImage()) ? sprite.texture.getSourceImage().width : wrapWidth;
            var effectiveWidth = wrapWidth || textureWidth || 1;

            var nextPos = (normalizedScrollX * layer.speedX) % effectiveWidth;
            nextPos = ((nextPos % effectiveWidth) + effectiveWidth) % effectiveWidth;

            sprite.tilePositionX = nextPos;
        }
    };

    ParallaxManager.prototype.syncToCamera = function(scrollX) {
        this._prevPlayerX = scrollX;
    };

    ParallaxManager.prototype.destroy = function() {
        for (var i = 0; i < this.layers.length; i++) {
            if (this.layers[i].sprite) {
                this.layers[i].sprite.destroy();
            }
        }
        this.layers = [];
    };

    return ParallaxManager;
})();

// ------------------------
// Module-level instances and Global Functions
// ------------------------

var backgroundGeneratorInstance = null;
var parallaxManagerInstance = null;

function createBackground(scene) {
    var generatorConfig = {
        worldWidth: CONFIG.worldWidth,
        worldHeight: CONFIG.worldHeight,
        width: CONFIG.width,
        height: CONFIG.height,
        backgroundSeed: CONFIG.backgroundSeed || 1337,
    };

    backgroundGeneratorInstance = new BackgroundGenerator(scene, generatorConfig);
    backgroundGeneratorInstance.generateAllTextures();

    parallaxManagerInstance = new ParallaxManager(scene, generatorConfig);
    parallaxManagerInstance.createLayers();

    scene.groundLevel = generatorConfig.worldHeight - 80;
}

function initParallaxTracking(playerX) {
    if (parallaxManagerInstance) {
        parallaxManagerInstance.initTracking(playerX);
    }
}

function updateParallax(playerX) {
    if (parallaxManagerInstance) {
        parallaxManagerInstance.update(playerX);
    }
}

function syncParallaxToCamera(scrollX) {
    if (parallaxManagerInstance && parallaxManagerInstance.syncToCamera) {
        parallaxManagerInstance.syncToCamera(scrollX);
    }
}

function destroyParallax() {
    if (parallaxManagerInstance) {
        parallaxManagerInstance.destroy();
        parallaxManagerInstance = null;
    }
    backgroundGeneratorInstance = null;
}