// Generates procedural background layers as reusable textures for parallax tiling

class BackgroundGenerator {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.rng = this.createRNG(config.backgroundSeed || 1337);
        this.generatedTextures = new Map();
    }

    createRNG(seed) {
        if (typeof createBackgroundRNG === 'function') {
            return createBackgroundRNG(seed);
        }
        let state = seed >>> 0;
        return () => {
            state += 0x6d2b79f5;
            let t = state;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    generateLoopingNoise(length, step, magnitude, seed) {
        const globalNoise = typeof window !== 'undefined' ? window.generateLoopingNoise : undefined;
        if (typeof globalNoise === 'function') {
            return globalNoise(length, step, magnitude, seed);
        }
        const values = [];
        const numSteps = Math.ceil(length / step);
        for (let i = 0; i <= numSteps; i++) {
            const angle = (i / numSteps) * Math.PI * 2;
            let val = Math.sin(angle + seed) * magnitude;
            val += Math.sin(angle * 2.3 + seed * 1.5) * (magnitude * 0.5);
            val += Math.sin(angle * 4.7 + seed * 2.1) * (magnitude * 0.25);
            if (i === numSteps) val = values[0];
            values.push(val);
        }
        return values;
    }

    generateAllTextures() {
        for (const layerName of LAYER_ORDER) {
            const layerConfig = BACKGROUND_LAYERS[layerName];
            this.generateLayerTexture(layerName, layerConfig);
        }
        return this.generatedTextures;
    }

    generateLayerTexture(layerName, layerConfig) {
        const { worldWidth, worldHeight } = this.config;
        const renderTexture = this.scene.add.renderTexture(0, 0, worldWidth, worldHeight);
        const graphics = this.scene.add.graphics();

        this.rng = this.createRNG(this.config.backgroundSeed || 1337);
        this[layerConfig.generator](graphics, this.rng);

        renderTexture.draw(graphics);
        renderTexture.saveTexture(layerConfig.key);

        graphics.destroy();
        renderTexture.destroy();

        this.generatedTextures.set(layerName, layerConfig.key);
        return layerConfig.key;
    }

    generateSkyLayer(graphics, random) {
        const { worldWidth, worldHeight } = this.config;
        const bandHeight = 20;

        for (let y = 0; y < worldHeight; y += bandHeight) {
            const t = y / worldHeight;
            let r;
            let g;
            let b;

            if (t < 0.15) {
                r = Math.floor(5 + t * 20);
                g = Math.floor(8 + t * 25);
                b = Math.floor(25 + t * 35);
            } else if (t < 0.35) {
                const mt = (t - 0.15) / 0.2;
                r = Math.floor(13 + mt * 35);
                g = Math.floor(14 + mt * 20);
                b = Math.floor(43 + mt * 10);
            } else if (t < 0.55) {
                const mt = (t - 0.35) / 0.2;
                r = Math.floor(48 + mt * 60);
                g = Math.floor(34 + mt * 20);
                b = Math.floor(53 - mt * 30);
            } else if (t < 0.75) {
                const bt = (t - 0.55) / 0.2;
                r = Math.floor(108 - bt * 30);
                g = Math.floor(54 - bt * 25);
                b = Math.floor(23 - bt * 10);
            } else {
                const bt = (t - 0.75) / 0.25;
                r = Math.floor(78 - bt * 45);
                g = Math.floor(29 - bt * 18);
                b = Math.floor(13 - bt * 8);
            }

            graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
            graphics.fillRect(0, y, worldWidth, bandHeight + 1);
        }
    }

    generateAtmosphereLayer(graphics, random) {
        const { worldWidth, worldHeight } = this.config;

        for (let i = 0; i < 8; i++) {
            const px = random() * worldWidth;
            const py = worldHeight * 0.3 + random() * worldHeight * 0.3;

            for (let s = 0; s < 6; s++) {
                const size = 30 + s * 15;
                const alpha = 0.08 - s * 0.01;
                graphics.fillStyle(0x222222, alpha);
                graphics.fillCircle(px + s * 8 - 20, py - s * 40, size);
            }
        }

        graphics.fillStyle(0x443355, 0.06);
        for (let i = 0; i < 12; i++) {
            const cx = random() * worldWidth;
            const cy = worldHeight * 0.15 + random() * worldHeight * 0.25;
            const width = 100 + random() * 200;
            const height = 30 + random() * 60;
            graphics.fillEllipse(cx, cy, width, height);
        }

        for (let i = 0; i < 5; i++) {
            const by = worldHeight * 0.4 + i * 50;
            graphics.fillStyle(0x4a3a30, 0.04);
            graphics.fillRect(0, by, worldWidth, 30 + random() * 40);
        }
    }

    generateStarsLayer(graphics, random) {
        const { worldWidth, worldHeight } = this.config;

        for (let i = 0; i < 180; i++) {
            const x = random() * worldWidth;
            const y = random() * (worldHeight * 0.45);
            const brightness = 0.2 + random() * 0.8;

            if (random() > 0.85) {
                graphics.fillStyle(0xffaa88, brightness * 0.7);
            } else if (random() > 0.9) {
                graphics.fillStyle(0x88aaff, brightness * 0.8);
            } else {
                graphics.fillStyle(0xffffff, brightness);
            }

            const size = random() > 0.9 ? 2 : 1;
            graphics.fillRect(x, y, size, size);

            if (random() > 0.95) {
                graphics.fillStyle(0xffffff, brightness * 0.3);
                graphics.fillRect(x - 1, y, 3, 1);
                graphics.fillRect(x, y - 1, 1, 3);
            }
        }

        for (let i = 0; i < 5; i++) {
            const dx = random() * worldWidth;
            const dy = random() * (worldHeight * 0.3);
            graphics.fillStyle(0xffffff, 0.7);
            graphics.fillRect(dx, dy, 3, 1);
            graphics.fillStyle(0xff4400, 0.5);
            graphics.fillRect(dx + 3, dy, 2, 1);
        }

        for (let i = 0; i < 3; i++) {
            const fx = random() * worldWidth;
            const fy = worldHeight * 0.5 + random() * worldHeight * 0.2;
            graphics.fillStyle(0xff8844, 0.15);
            graphics.fillCircle(fx, fy, 25);
            graphics.fillStyle(0xffcc66, 0.25);
            graphics.fillCircle(fx, fy, 12);
        }
    }

    generateHorizonCityLayer(graphics, random) {
        const { worldWidth, worldHeight } = this.config;
        const horizonY = worldHeight - 120;
        const buildingRng = this.createRNG(this.config.backgroundSeed + 100);
        const buildingRandom = () => buildingRng();

        graphics.fillStyle(0x060608, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);

        let hx = 0;
        while (hx < worldWidth + 50) {
            const buildingWidth = 8 + buildingRandom() * 25;
            const buildingHeight = 20 + buildingRandom() * 70;
            const destroyed = buildingRandom() > 0.6;

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

        for (let i = 0; i < 10; i++) {
            const fx = random() * worldWidth;
            graphics.fillStyle(0xff3300, 0.2);
            graphics.fillCircle(fx, horizonY - 20, 12);
            graphics.fillStyle(0xff6600, 0.35);
            graphics.fillCircle(fx, horizonY - 20, 6);
        }
    }

    generateDistantCityLayer(graphics, random) {
        const { worldWidth, worldHeight } = this.config;

        for (let i = 0; i < 35; i++) {
            const bx = i * (worldWidth / 35) + random() * 40;
            const bWidth = 18 + random() * 35;
            const bHeight = 50 + random() * 100;
            const by = worldHeight - 105;
            const left = bx - bWidth / 2;
            const top = by - bHeight;

            const buildingType = random();
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
                const segs = 2 + Math.floor(random() * 3);
                for (let s = 0; s <= segs; s++) {
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
                for (let wy = 10; wy < bHeight - 8; wy += 14) {
                    graphics.fillRect(left + 3, top + wy, bWidth - 6, 2);
                }
            }

            if (random() > 0.75) {
                graphics.fillStyle(0xff4400, 0.25);
                graphics.fillCircle(left + bWidth / 2, top + bHeight * 0.3, 8);
            }
        }

        for (let i = 0; i < 6; i++) {
            const sx = random() * worldWidth;
            const sy = worldHeight - 130;
            graphics.fillStyle(0x222228, 0.3);
            for (let s = 0; s < 5; s++) {
                graphics.fillCircle(sx + s * 4, sy - s * 25, 12 + s * 4);
            }
        }
    }

    generateMidCityLayer(graphics, random) {
        const { worldWidth, worldHeight } = this.config;
        const bridgeY = worldHeight - 100;

        graphics.fillStyle(0x181820, 1);

        for (let i = 0; i < 8; i++) {
            const px = i * (worldWidth / 8) + 50;
            const collapsed = random() > 0.6;

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

        for (let i = 0; i < 6; i++) {
            const segX = i * (worldWidth / 6) + random() * 100;
            const segY = bridgeY - 55 + random() * 30;
            const segWidth = 60 + random() * 80;
            const angle = -0.1 + random() * 0.2;

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

        for (let i = 0; i < 28; i++) {
            const bx = i * (worldWidth / 28) + random() * 50;
            const bWidth = 28 + random() * 50;
            const bHeight = 70 + random() * 110;
            const by = worldHeight - 92;
            const left = bx - bWidth / 2;
            const top = by - bHeight;

            const destroyed = random() > 0.35;
            const buildingType = random();

            graphics.fillStyle(0x161620, 1);

            if (destroyed) {
                graphics.beginPath();
                graphics.moveTo(left, by);
                graphics.lineTo(left, top + bHeight * 0.12);

                const segments = 3 + Math.floor(random() * 4);
                for (let s = 0; s <= segments; s++) {
                    graphics.lineTo(left + (bWidth / segments) * s, top + random() * bHeight * 0.35);
                }

                graphics.lineTo(left + bWidth, top + bHeight * 0.1);
                graphics.lineTo(left + bWidth, by);
                graphics.closePath();
                graphics.fillPath();

                graphics.lineStyle(1, 0x2a2a35, 0.8);
                for (let r = 0; r < 3; r++) {
                    const rx = left + 5 + random() * (bWidth - 10);
                    graphics.beginPath();
                    graphics.moveTo(rx, top + bHeight * 0.15);
                    graphics.lineTo(rx + (random() - 0.5) * 10, top - 10);
                    graphics.strokePath();
                }
                graphics.lineStyle(0);

                if (random() > 0.4) {
                    const fx = left + bWidth / 2;
                    const fy = top + bHeight * 0.35;
                    graphics.fillStyle(0xff4400, 0.3);
                    graphics.fillCircle(fx, fy, 18);
                    graphics.fillStyle(0xff7700, 0.5);
                    graphics.fillCircle(fx, fy, 10);
                    graphics.fillStyle(0xffaa00, 0.7);
                    graphics.fillCircle(fx, fy, 5);
                }
            } else {
                if (buildingType > 0.85) {
                    graphics.fillRect(left, top + bHeight * 0.3, bWidth, bHeight * 0.7);
                    graphics.beginPath();
                    graphics.arc(left + bWidth / 2, top + bHeight * 0.3, bWidth / 2, Math.PI, 0);
                    graphics.closePath();
                    graphics.fillPath();
                } else {
                    graphics.fillRect(left, top, bWidth, bHeight);
                }

                graphics.fillStyle(0x6699bb, 0.5);
                for (let fy = 12; fy < bHeight - 10; fy += 15) {
                    for (let wx = 5; wx < bWidth - 8; wx += 11) {
                        if (random() > 0.25) {
                            const state = random();
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

        const craneX = worldWidth * 0.3;
        const craneY = worldHeight - 100;
        graphics.fillStyle(0x222230, 1);
        graphics.fillRect(craneX, craneY - 80, 6, 80);
        graphics.beginPath();
        graphics.moveTo(craneX + 3, craneY - 80);
        graphics.lineTo(craneX + 80, craneY - 40);
        graphics.lineTo(craneX + 80, craneY - 35);
        graphics.lineTo(craneX + 3, craneY - 75);
        graphics.closePath();
        graphics.fillPath();

        graphics.lineStyle(1, 0x1a1a25, 0.8);
        graphics.beginPath();
        graphics.moveTo(craneX + 60, craneY - 38);
        graphics.lineTo(craneX + 65, craneY);
        graphics.strokePath();
        graphics.lineStyle(0);
    }

    generateNearCityLayer(graphics, random) {
        const { worldWidth, worldHeight } = this.config;

        for (let i = 0; i < 6; i++) {
            const poleX = i * (worldWidth / 6) + 80;
            const poleY = worldHeight - 88;
            const fallen = random() > 0.5;

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
                    graphics.fillStyle(0xffffff, 0.8);
                    graphics.fillCircle(poleX + 35, poleY - 10, 1.5);
                }
            } else {
                graphics.fillStyle(0x1c1c28, 1);
                graphics.fillRect(poleX - 3, poleY - 70, 6, 70);
                graphics.fillRect(poleX - 20, poleY - 65, 40, 4);

                graphics.lineStyle(1, 0x181822, 0.7);
                graphics.beginPath();
                graphics.moveTo(poleX - 18, poleY - 63);
                graphics.lineTo(poleX - 25, poleY - 30);
                graphics.strokePath();
                graphics.beginPath();
                graphics.moveTo(poleX + 18, poleY - 63);
                graphics.lineTo(poleX + 30, poleY - 20);
                graphics.strokePath();
                graphics.lineStyle(0);
            }
        }

        for (let i = 0; i < 18; i++) {
            const rx = i * (worldWidth / 18) + random() * 60;
            const ry = worldHeight - 85 + random() * 20;
            graphics.fillStyle(0x1e1e28, 1);
            graphics.fillRect(rx - 25, ry - 15, 50 + random() * 30, 10 + random() * 8);
        }

        for (let i = 0; i < 14; i++) {
            const bx = i * (worldWidth / 14) + random() * 50;
            const bWidth = 36 + random() * 60;
            const bHeight = 80 + random() * 140;
            const by = worldHeight - 85;
            const left = bx - bWidth / 2;
            const top = by - bHeight;

            graphics.fillStyle(0x22222c, 1);
            graphics.beginPath();
            graphics.moveTo(left, by);
            graphics.lineTo(left, top + bHeight * 0.08);

            const segs = 4 + Math.floor(random() * 4);
            for (let s = 0; s <= segs; s++) {
                graphics.lineTo(left + (bWidth / segs) * s, top + random() * bHeight * 0.3);
            }

            graphics.lineTo(left + bWidth, top + bHeight * 0.05);
            graphics.lineTo(left + bWidth, by);
            graphics.closePath();
            graphics.fillPath();

            graphics.fillStyle(0x99bbdd, 0.6);
            for (let fy = 14; fy < bHeight * 0.4; fy += 18) {
                for (let wx = 8; wx < bWidth - 10; wx += 15) {
                    if (random() > 0.3) {
                        const state = random();
                        if (state > 0.85) {
                            graphics.fillStyle(0xff3300, 0.8);
                        } else if (state > 0.6) {
                            graphics.fillStyle(0x99bbdd, 0.6);
                        } else {
                            graphics.fillStyle(0x0c0c16, 0.9);
                        }
                        graphics.fillRect(left + wx, top + fy, 10, 12);
                    }
                }
            }

            if (random() > 0.35) {
                const fx = left + bWidth * 0.2 + random() * bWidth * 0.6;
                const fy = top + bHeight * 0.15 + random() * bHeight * 0.4;

                graphics.fillStyle(0xff2200, 0.35);
                graphics.fillCircle(fx, fy, 22);
                graphics.fillStyle(0xff5500, 0.55);
                graphics.fillCircle(fx, fy, 14);
                graphics.fillStyle(0xff8800, 0.75);
                graphics.fillCircle(fx, fy - 3, 8);
                graphics.fillStyle(0xffcc00, 0.9);
                graphics.fillCircle(fx, fy - 5, 4);
                graphics.fillStyle(0xffffaa, 0.8);
                graphics.fillCircle(fx, fy - 7, 2);

                graphics.fillStyle(0x1a1a1a, 0.25);
                graphics.fillCircle(fx - 6, fy - 35, 20);
                graphics.fillCircle(fx + 4, fy - 55, 24);
                graphics.fillCircle(fx - 2, fy - 78, 27);
            }
        }
    }

    generateTerrainLayer(graphics, random) {
        const { worldWidth, worldHeight } = this.config;
        const groundY = worldHeight - 80;

        const baseNoise = this.generateLoopingNoise(worldWidth, 35, 28, 0.5);
        const midNoise = this.generateLoopingNoise(worldWidth, 25, 18, 1.2);
        const topNoise = this.generateLoopingNoise(worldWidth, 28, 14, 2.1);

        graphics.fillStyle(0x1a1210, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        for (let i = 0; i < baseNoise.length; i++) {
            const x = i * 35;
            if (x > worldWidth) break;
            graphics.lineTo(x, groundY - baseNoise[i] - 18);
        }
        graphics.lineTo(worldWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        graphics.fillStyle(0x252018, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        for (let i = 0; i < midNoise.length; i++) {
            const x = i * 25;
            if (x > worldWidth) break;
            graphics.lineTo(x, groundY - midNoise[i] - 10);
        }
        graphics.lineTo(worldWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        graphics.fillStyle(0x352a20, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        for (let i = 0; i < topNoise.length; i++) {
            const x = i * 28;
            if (x > worldWidth) break;
            graphics.lineTo(x, groundY - topNoise[i] - 4);
        }
        graphics.lineTo(worldWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        for (let i = 0; i < 12; i++) {
            const cx = random() * worldWidth;
            const cy = groundY + 5 + random() * 20;
            const cw = 20 + random() * 40;
            const ch = 8 + random() * 15;

            graphics.fillStyle(0x3a3028, 1);
            graphics.fillEllipse(cx, cy, cw + 6, ch + 3);

            graphics.fillStyle(0x151210, 1);
            graphics.fillEllipse(cx, cy + 2, cw, ch);

            graphics.fillStyle(0x1a1510, 0.6);
            graphics.fillEllipse(cx, cy, cw + 15, ch + 8);
        }

        for (let i = 0; i < 8; i++) {
            const vx = random() * worldWidth;
            const vy = groundY + random() * 15;
            const flipped = random() > 0.5;

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

        for (let i = 0; i < 10; i++) {
            const tx = random() * worldWidth;
            const ty = groundY - topNoise[Math.floor(tx / 28) % topNoise.length];

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

        graphics.fillStyle(0x4a3a2a, 0.8);
        for (let i = 0; i < 100; i++) {
            const rx = random() * worldWidth;
            const ry = groundY - 3 - random() * 35;
            graphics.fillRect(rx, ry, 3 + random() * 10, 2 + random() * 5);
        }

        graphics.fillStyle(0x8a8070, 0.5);
        for (let i = 0; i < 6; i++) {
            const bx = random() * worldWidth;
            const by = groundY + 5 + random() * 20;

            graphics.fillEllipse(bx, by, 8, 2);
            graphics.fillCircle(bx - 3, by, 2);
            graphics.fillCircle(bx + 3, by, 2);
        }

        for (let i = 0; i < 5; i++) {
            const px = random() * worldWidth;
            const py = groundY + 10 + random() * 15;
            const pw = 20 + random() * 30;
            const ph = 5 + random() * 8;

            graphics.fillStyle(0x2a4a30, 0.4);
            graphics.fillEllipse(px, py, pw + 4, ph + 2);
            graphics.fillStyle(0x3a6a40, 0.6);
            graphics.fillEllipse(px, py, pw, ph);
            graphics.fillStyle(0x5a8a50, 0.3);
            graphics.fillEllipse(px - pw * 0.2, py - 1, pw * 0.3, ph * 0.4);
        }

        for (let i = 0; i < 18; i++) {
            const bx = i * (worldWidth / 18) + random() * 80;
            const bWidth = 45 + random() * 70;
            const bHeight = 110 + random() * 150;
            const noiseIdx = Math.floor((bx / worldWidth) * topNoise.length) % topNoise.length;
            const by = groundY - topNoise[noiseIdx];
            const left = bx - bWidth / 2;
            const top = by - bHeight;

            graphics.fillStyle(0x1e1e2a, 1);

            graphics.beginPath();
            graphics.moveTo(left, by);
            graphics.lineTo(left, top + bHeight * 0.06);

            const segs = 5 + Math.floor(random() * 5);
            for (let s = 0; s <= segs; s++) {
                graphics.lineTo(left + (bWidth / segs) * s, top + random() * bHeight * 0.32);
            }

            graphics.lineTo(left + bWidth, top + bHeight * 0.04);
            graphics.lineTo(left + bWidth, by);
            graphics.closePath();
            graphics.fillPath();

            graphics.fillStyle(0x161622, 0.8);
            for (let h = 0; h < 5; h++) {
                const hx = left + 10 + random() * (bWidth - 20);
                const hy = top + bHeight * (0.2 + random() * 0.5);
                graphics.fillRect(hx, hy, 8 + random() * 12, 4 + random() * 6);
            }

            graphics.lineStyle(1, 0x4a3a30, 1);
            for (let r = 0; r < 6; r++) {
                const rx = left + 10 + random() * (bWidth - 20);
                graphics.beginPath();
                graphics.moveTo(rx, top + bHeight * 0.08);
                graphics.lineTo(rx + (random() - 0.5) * 20, top - 12 - random() * 20);
                graphics.strokePath();
            }
            graphics.lineStyle(0);

            graphics.fillStyle(0x161620, 1);
            for (let r = 0; r < 12; r++) {
                graphics.fillRect(left - 18 + random() * (bWidth + 36), by - 4 + random() * 25, 8 + random() * 18, 4 + random() * 12);
            }

            graphics.fillStyle(0xaaccee, 0.7);
            for (let fy = 20; fy < bHeight * 0.45; fy += 20) {
                for (let wx = 10; wx < bWidth - 15; wx += 16) {
                    if (random() > 0.28) {
                        const state = random();
                        if (state > 0.9) {
                            graphics.fillStyle(0xff2200, 0.9);
                        } else if (state > 0.65) {
                            graphics.fillStyle(0xaaccee, 0.7);
                        } else if (state > 0.35) {
                            graphics.fillStyle(0x0e0e18, 0.95);
                        } else {
                            graphics.fillStyle(0x080810, 0.95);
                            graphics.fillRect(left + wx, top + fy, 12, 14);
                            graphics.lineStyle(1, 0x4a4a5a, 0.6);
                            graphics.beginPath();
                            graphics.moveTo(left + wx + 2, top + fy + 2);
                            graphics.lineTo(left + wx + 10, top + fy + 12);
                            graphics.strokePath();
                            graphics.beginPath();
                            graphics.moveTo(left + wx + 10, top + fy + 3);
                            graphics.lineTo(left + wx + 4, top + fy + 11);
                            graphics.strokePath();
                            graphics.lineStyle(0);
                            continue;
                        }
                        graphics.fillRect(left + wx, top + fy, 12, 14);
                    }
                }
            }

            if (random() > 0.25) {
                const fx = left + bWidth * 0.2 + random() * bWidth * 0.6;
                const fy = top + bHeight * 0.12 + random() * bHeight * 0.4;

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

                graphics.fillStyle(0x1a1a1a, 0.2);
                graphics.fillCircle(fx - 8, fy - 40, 18);
                graphics.fillCircle(fx + 5, fy - 60, 22);
                graphics.fillCircle(fx - 3, fy - 85, 25);
                graphics.fillCircle(fx + 10, fy - 110, 28);
            }
        }

        for (let i = 0; i < 4; i++) {
            const sx = random() * worldWidth;
            const sy = groundY - 5;

            graphics.fillStyle(0x3a3530, 1);
            graphics.fillRect(sx - 1, sy - 25, 3, 25);

            graphics.fillStyle(0xaaaa30, 0.8);
            graphics.fillRect(sx - 10, sy - 35, 20, 12);
            graphics.fillStyle(0x1a1a15, 0.9);
            graphics.fillRect(sx - 8, sy - 33, 16, 8);
        }
    }
}
