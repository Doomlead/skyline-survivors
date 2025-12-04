// ------------------------
// Background - DETAILED Post-Apocalyptic Cityscape
// ------------------------

function createBackground(scene) {
    const groundY = CONFIG.worldHeight - 80;
    
    // ========================================
    // LAYER 0: Dramatic Gradient Sky with Pollution
    // ========================================
    const skyGradient = scene.add.graphics();
    const bandHeight = 20;
    
    for (let y = 0; y < CONFIG.worldHeight; y += bandHeight) {
        const t = y / CONFIG.worldHeight;
        let r, g, b;
        
        if (t < 0.15) {
            // Deep space - dark with hints of aurora
            r = Math.floor(5 + t * 20);
            g = Math.floor(8 + t * 25);
            b = Math.floor(25 + t * 35);
        } else if (t < 0.35) {
            // Upper atmosphere - sickly green/purple haze
            const mt = (t - 0.15) / 0.2;
            r = Math.floor(13 + mt * 35);
            g = Math.floor(14 + mt * 20);
            b = Math.floor(43 + mt * 10);
        } else if (t < 0.55) {
            // Mid sky - toxic orange/brown smog
            const mt = (t - 0.35) / 0.2;
            r = Math.floor(48 + mt * 60);
            g = Math.floor(34 + mt * 20);
            b = Math.floor(53 - mt * 30);
        } else if (t < 0.75) {
            // Lower sky - burning horizon
            const bt = (t - 0.55) / 0.2;
            r = Math.floor(108 - bt * 30);
            g = Math.floor(54 - bt * 25);
            b = Math.floor(23 - bt * 10);
        } else {
            // Horizon glow - ember red
            const bt = (t - 0.75) / 0.25;
            r = Math.floor(78 - bt * 45);
            g = Math.floor(29 - bt * 18);
            b = Math.floor(13 - bt * 8);
        }
        
        skyGradient.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
        skyGradient.fillRect(0, y, CONFIG.worldWidth, bandHeight + 1);
    }
    skyGradient.setScrollFactor(0);
    
    // ========================================
    // LAYER 0.5: Atmospheric Effects (Smoke, Clouds)
    // ========================================
    const atmosphere = scene.add.graphics();
    
    // Distant smoke plumes
    for (let i = 0; i < 8; i++) {
        const px = Math.random() * CONFIG.worldWidth;
        const py = CONFIG.worldHeight * 0.3 + Math.random() * CONFIG.worldHeight * 0.3;
        
        // Smoke column
        for (let s = 0; s < 6; s++) {
            const size = 30 + s * 15;
            const alpha = 0.08 - s * 0.01;
            atmosphere.fillStyle(0x222222, alpha);
            atmosphere.fillCircle(px + s * 8 - 20, py - s * 40, size);
        }
    }
    
    // Toxic clouds
    atmosphere.fillStyle(0x443355, 0.06);
    for (let i = 0; i < 12; i++) {
        const cx = Math.random() * CONFIG.worldWidth;
        const cy = CONFIG.worldHeight * 0.15 + Math.random() * CONFIG.worldHeight * 0.25;
        const width = 100 + Math.random() * 200;
        const height = 30 + Math.random() * 60;
        atmosphere.fillEllipse(cx, cy, width, height);
    }
    
    // Ash/dust haze bands
    for (let i = 0; i < 5; i++) {
        const by = CONFIG.worldHeight * 0.4 + i * 50;
        atmosphere.fillStyle(0x4a3a30, 0.04);
        atmosphere.fillRect(0, by, CONFIG.worldWidth, 30 + Math.random() * 40);
    }
    
    atmosphere.setScrollFactor(0.05);
    
    // ========================================
    // LAYER 1: Stars & Celestial Bodies
    // ========================================
    const stars = scene.add.graphics();
    
    // Regular stars
    for (let i = 0; i < 180; i++) {
        const x = Math.random() * CONFIG.worldWidth;
        const y = Math.random() * (CONFIG.worldHeight * 0.45);
        const brightness = 0.2 + Math.random() * 0.8;
        
        // Some stars have color tint (pollution effect)
        if (Math.random() > 0.85) {
            stars.fillStyle(0xffaa88, brightness * 0.7);
        } else if (Math.random() > 0.9) {
            stars.fillStyle(0x88aaff, brightness * 0.8);
        } else {
            stars.fillStyle(0xffffff, brightness);
        }
        
        const size = Math.random() > 0.9 ? 2 : 1;
        stars.fillRect(x, y, size, size);
        
        // Twinkle effect on some stars
        if (Math.random() > 0.95) {
            stars.fillStyle(0xffffff, brightness * 0.3);
            stars.fillRect(x - 1, y, 3, 1);
            stars.fillRect(x, y - 1, 1, 3);
        }
    }
    
    // Orbiting debris/satellites
    for (let i = 0; i < 5; i++) {
        const dx = Math.random() * CONFIG.worldWidth;
        const dy = Math.random() * (CONFIG.worldHeight * 0.3);
        stars.fillStyle(0xffffff, 0.7);
        stars.fillRect(dx, dy, 3, 1);
        stars.fillStyle(0xff4400, 0.5);
        stars.fillRect(dx + 3, dy, 2, 1);
    }
    
    // Distant explosions/flashes
    for (let i = 0; i < 3; i++) {
        const fx = Math.random() * CONFIG.worldWidth;
        const fy = CONFIG.worldHeight * 0.5 + Math.random() * CONFIG.worldHeight * 0.2;
        stars.fillStyle(0xff8844, 0.15);
        stars.fillCircle(fx, fy, 25);
        stars.fillStyle(0xffcc66, 0.25);
        stars.fillCircle(fx, fy, 12);
    }
    
    stars.setScrollFactor(0.1);
    
    // ========================================
    // LAYER 2: Very Distant Cityscape (Horizon)
    // ========================================
    const horizonCity = scene.add.graphics();
    const horizonY = CONFIG.worldHeight - 120;
    
    // Continuous skyline silhouette
    horizonCity.fillStyle(0x060608, 1);
    horizonCity.beginPath();
    horizonCity.moveTo(0, CONFIG.worldHeight);
    
    let hx = 0;
    while (hx < CONFIG.worldWidth + 50) {
        const buildingWidth = 8 + Math.random() * 25;
        const buildingHeight = 20 + Math.random() * 70;
        const destroyed = Math.random() > 0.6;
        
        if (destroyed) {
            // Jagged destroyed top
            horizonCity.lineTo(hx, horizonY - buildingHeight * 0.3);
            horizonCity.lineTo(hx + buildingWidth * 0.3, horizonY - buildingHeight);
            horizonCity.lineTo(hx + buildingWidth * 0.6, horizonY - buildingHeight * 0.5);
            horizonCity.lineTo(hx + buildingWidth, horizonY - buildingHeight * 0.7);
        } else {
            horizonCity.lineTo(hx, horizonY - buildingHeight);
            horizonCity.lineTo(hx + buildingWidth, horizonY - buildingHeight);
        }
        
        hx += buildingWidth + Math.random() * 5;
    }
    
    horizonCity.lineTo(CONFIG.worldWidth, CONFIG.worldHeight);
    horizonCity.closePath();
    horizonCity.fillPath();
    
    // Distant fires glow on horizon
    for (let i = 0; i < 10; i++) {
        const fx = Math.random() * CONFIG.worldWidth;
        horizonCity.fillStyle(0xff3300, 0.2);
        horizonCity.fillCircle(fx, horizonY - 20, 12);
        horizonCity.fillStyle(0xff6600, 0.35);
        horizonCity.fillCircle(fx, horizonY - 20, 6);
    }
    
    horizonCity.setScrollFactor(0.2);
    
    // ========================================
    // LAYER 3: Distant City Silhouettes
    // ========================================
    const distantCity = scene.add.graphics();
    
    for (let i = 0; i < 35; i++) {
        const bx = (i * (CONFIG.worldWidth / 35)) + Math.random() * 40;
        const bWidth = 18 + Math.random() * 35;
        const bHeight = 50 + Math.random() * 100;
        const by = CONFIG.worldHeight - 105;
        const left = bx - bWidth / 2;
        const top = by - bHeight;
        
        const buildingType = Math.random();
        
        distantCity.fillStyle(0x0c0c14, 1);
        
        if (buildingType > 0.8) {
            // Tower/Spire
            distantCity.beginPath();
            distantCity.moveTo(left + bWidth * 0.3, by);
            distantCity.lineTo(left + bWidth * 0.3, top + bHeight * 0.3);
            distantCity.lineTo(left + bWidth * 0.5, top);
            distantCity.lineTo(left + bWidth * 0.7, top + bHeight * 0.3);
            distantCity.lineTo(left + bWidth * 0.7, by);
            distantCity.closePath();
            distantCity.fillPath();
        } else if (buildingType > 0.5) {
            // Destroyed building
            distantCity.beginPath();
            distantCity.moveTo(left, by);
            distantCity.lineTo(left, top + bHeight * 0.2);
            
            const segs = 2 + Math.floor(Math.random() * 3);
            for (let s = 0; s <= segs; s++) {
                distantCity.lineTo(
                    left + (bWidth / segs) * s,
                    top + Math.random() * bHeight * 0.25
                );
            }
            
            distantCity.lineTo(left + bWidth, top + bHeight * 0.15);
            distantCity.lineTo(left + bWidth, by);
            distantCity.closePath();
            distantCity.fillPath();
        } else {
            // Regular building
            distantCity.fillRect(left, top, bWidth, bHeight);
            
            // Antenna
            if (Math.random() > 0.7) {
                distantCity.fillRect(left + bWidth / 2 - 1, top - 15, 2, 15);
            }
        }
        
        // Faint windows
        if (Math.random() > 0.4) {
            distantCity.fillStyle(0x4488aa, 0.3);
            for (let wy = 10; wy < bHeight - 8; wy += 14) {
                distantCity.fillRect(left + 3, top + wy, bWidth - 6, 2);
            }
        }
        
        // Small fires
        if (Math.random() > 0.75) {
            distantCity.fillStyle(0xff4400, 0.25);
            distantCity.fillCircle(left + bWidth / 2, top + bHeight * 0.3, 8);
        }
    }
    
    // Distant smoke columns
    for (let i = 0; i < 6; i++) {
        const sx = Math.random() * CONFIG.worldWidth;
        const sy = CONFIG.worldHeight - 130;
        
        distantCity.fillStyle(0x222228, 0.3);
        for (let s = 0; s < 5; s++) {
            distantCity.fillCircle(sx + s * 4, sy - s * 25, 12 + s * 4);
        }
    }
    
    distantCity.setScrollFactor(0.3);
    
    // ========================================
    // LAYER 4: Mid-distance Destroyed City
    // ========================================
    const midCity = scene.add.graphics();
    
    // Collapsed highway/bridge
    const bridgeY = CONFIG.worldHeight - 100;
    midCity.fillStyle(0x181820, 1);
    
    // Bridge pillars
    for (let i = 0; i < 8; i++) {
        const px = i * (CONFIG.worldWidth / 8) + 50;
        const collapsed = Math.random() > 0.6;
        
        if (collapsed) {
            // Broken pillar
            midCity.beginPath();
            midCity.moveTo(px - 8, bridgeY + 20);
            midCity.lineTo(px - 8, bridgeY - 30);
            midCity.lineTo(px - 3, bridgeY - 50);
            midCity.lineTo(px + 5, bridgeY - 35);
            midCity.lineTo(px + 8, bridgeY + 20);
            midCity.closePath();
            midCity.fillPath();
        } else {
            midCity.fillRect(px - 8, bridgeY - 60, 16, 80);
        }
    }
    
    // Broken road segments
    for (let i = 0; i < 6; i++) {
        const segX = i * (CONFIG.worldWidth / 6) + Math.random() * 100;
        const segY = bridgeY - 55 + Math.random() * 30;
        const segWidth = 60 + Math.random() * 80;
        const angle = -0.1 + Math.random() * 0.2;
        
        midCity.fillStyle(0x1a1a24, 1);
        midCity.beginPath();
        midCity.moveTo(segX, segY);
        midCity.lineTo(segX + segWidth, segY + segWidth * angle);
        midCity.lineTo(segX + segWidth, segY + segWidth * angle + 8);
        midCity.lineTo(segX, segY + 8);
        midCity.closePath();
        midCity.fillPath();
        
        // Road markings
        midCity.fillStyle(0xffff00, 0.3);
        midCity.fillRect(segX + 10, segY + 3, 15, 2);
        midCity.fillRect(segX + 35, segY + 3, 15, 2);
    }
    
    // Buildings
    for (let i = 0; i < 28; i++) {
        const bx = (i * (CONFIG.worldWidth / 28)) + Math.random() * 50;
        const bWidth = 28 + Math.random() * 50;
        const bHeight = 70 + Math.random() * 110;
        const by = CONFIG.worldHeight - 92;
        const left = bx - bWidth / 2;
        const top = by - bHeight;
        
        const destroyed = Math.random() > 0.35;
        const buildingType = Math.random();
        
        midCity.fillStyle(0x161620, 1);
        
        if (destroyed) {
            midCity.beginPath();
            midCity.moveTo(left, by);
            midCity.lineTo(left, top + bHeight * 0.12);
            
            const segments = 3 + Math.floor(Math.random() * 4);
            for (let s = 0; s <= segments; s++) {
                midCity.lineTo(
                    left + (bWidth / segments) * s,
                    top + Math.random() * bHeight * 0.35
                );
            }
            
            midCity.lineTo(left + bWidth, top + bHeight * 0.1);
            midCity.lineTo(left + bWidth, by);
            midCity.closePath();
            midCity.fillPath();
            
            // Exposed rebar/structure
            midCity.lineStyle(1, 0x2a2a35, 0.8);
            for (let r = 0; r < 3; r++) {
                const rx = left + 5 + Math.random() * (bWidth - 10);
                midCity.beginPath();
                midCity.moveTo(rx, top + bHeight * 0.15);
                midCity.lineTo(rx + (Math.random() - 0.5) * 10, top - 10);
                midCity.strokePath();
            }
            midCity.lineStyle(0);
            
            // Fire glow
            if (Math.random() > 0.4) {
                const fx = left + bWidth / 2;
                const fy = top + bHeight * 0.35;
                midCity.fillStyle(0xff4400, 0.3);
                midCity.fillCircle(fx, fy, 18);
                midCity.fillStyle(0xff7700, 0.5);
                midCity.fillCircle(fx, fy, 10);
                midCity.fillStyle(0xffaa00, 0.7);
                midCity.fillCircle(fx, fy, 5);
            }
        } else {
            if (buildingType > 0.85) {
                // Domed building
                midCity.fillRect(left, top + bHeight * 0.3, bWidth, bHeight * 0.7);
                midCity.beginPath();
                midCity.arc(left + bWidth / 2, top + bHeight * 0.3, bWidth / 2, Math.PI, 0);
                midCity.closePath();
                midCity.fillPath();
            } else {
                midCity.fillRect(left, top, bWidth, bHeight);
            }
            
            // Windows
            midCity.fillStyle(0x6699bb, 0.5);
            for (let fy = 12; fy < bHeight - 10; fy += 15) {
                for (let wx = 5; wx < bWidth - 8; wx += 11) {
                    if (Math.random() > 0.25) {
                        const state = Math.random();
                        if (state > 0.92) {
                            midCity.fillStyle(0xff4400, 0.7);
                        } else if (state > 0.6) {
                            midCity.fillStyle(0x6699bb, 0.5);
                        } else {
                            midCity.fillStyle(0x101018, 0.8);
                        }
                        midCity.fillRect(left + wx, top + fy, 7, 9);
                    }
                }
            }
        }
    }
    
    // Crane (collapsed)
    const craneX = CONFIG.worldWidth * 0.3;
    const craneY = CONFIG.worldHeight - 100;
    midCity.fillStyle(0x222230, 1);
    midCity.fillRect(craneX, craneY - 80, 6, 80);
    midCity.beginPath();
    midCity.moveTo(craneX + 3, craneY - 80);
    midCity.lineTo(craneX + 80, craneY - 40);
    midCity.lineTo(craneX + 80, craneY - 35);
    midCity.lineTo(craneX + 3, craneY - 75);
    midCity.closePath();
    midCity.fillPath();
    
    // Hanging cable
    midCity.lineStyle(1, 0x1a1a25, 0.8);
    midCity.beginPath();
    midCity.moveTo(craneX + 60, craneY - 38);
    midCity.lineTo(craneX + 65, craneY);
    midCity.strokePath();
    midCity.lineStyle(0);
    
    midCity.setScrollFactor(0.5);
    
    // ========================================
    // LAYER 5: Near Destroyed Buildings
    // ========================================
    const nearCity = scene.add.graphics();
    
    // Power lines (broken)
    for (let i = 0; i < 6; i++) {
        const poleX = i * (CONFIG.worldWidth / 6) + 80;
        const poleY = CONFIG.worldHeight - 88;
        const fallen = Math.random() > 0.5;
        
        if (fallen) {
            // Fallen pole
            nearCity.fillStyle(0x1c1c28, 1);
            nearCity.beginPath();
            nearCity.moveTo(poleX, poleY);
            nearCity.lineTo(poleX + 40, poleY - 15);
            nearCity.lineTo(poleX + 42, poleY - 12);
            nearCity.lineTo(poleX + 3, poleY + 3);
            nearCity.closePath();
            nearCity.fillPath();
            
            // Sparking wire
            if (Math.random() > 0.5) {
                nearCity.fillStyle(0x44aaff, 0.6);
                nearCity.fillCircle(poleX + 35, poleY - 10, 3);
                nearCity.fillStyle(0xffffff, 0.8);
                nearCity.fillCircle(poleX + 35, poleY - 10, 1.5);
            }
        } else {
            // Standing pole
            nearCity.fillStyle(0x1c1c28, 1);
            nearCity.fillRect(poleX - 3, poleY - 70, 6, 70);
            nearCity.fillRect(poleX - 20, poleY - 65, 40, 4);
            
            // Hanging wires
            nearCity.lineStyle(1, 0x181822, 0.7);
            nearCity.beginPath();
            nearCity.moveTo(poleX - 18, poleY - 63);
            nearCity.lineTo(poleX - 25, poleY - 30);
            nearCity.strokePath();
            nearCity.beginPath();
            nearCity.moveTo(poleX + 18, poleY - 63);
            nearCity.lineTo(poleX + 30, poleY - 20);
            nearCity.strokePath();
            nearCity.lineStyle(0);
        }
    }
    
    // Buildings
    for (let i = 0; i < 22; i++) {
        const bx = (i * (CONFIG.worldWidth / 22)) + Math.random() * 65;
        const bWidth = 40 + Math.random() * 60;
        const bHeight = 90 + Math.random() * 130;
        const by = CONFIG.worldHeight - 86;
        const left = bx - bWidth / 2;
        const top = by - bHeight;
        
        nearCity.fillStyle(0x1c1c2a, 1);
        
        // All near buildings heavily destroyed
        nearCity.beginPath();
        nearCity.moveTo(left, by);
        nearCity.lineTo(left, top + bHeight * 0.08);
        
        const segments = 4 + Math.floor(Math.random() * 5);
        for (let s = 0; s <= segments; s++) {
            nearCity.lineTo(
                left + (bWidth / segments) * s,
                top + Math.random() * bHeight * 0.38
            );
        }
        
        nearCity.lineTo(left + bWidth, top + bHeight * 0.06);
        nearCity.lineTo(left + bWidth, by);
        nearCity.closePath();
        nearCity.fillPath();
        
        // Structural damage details
        nearCity.fillStyle(0x141420, 1);
        // Holes in walls
        for (let h = 0; h < 3; h++) {
            const hx = left + 8 + Math.random() * (bWidth - 16);
            const hy = top + bHeight * 0.3 + Math.random() * bHeight * 0.4;
            const hw = 8 + Math.random() * 15;
            const hh = 6 + Math.random() * 12;
            nearCity.fillEllipse(hx, hy, hw, hh);
        }
        
        // Exposed rebar
        nearCity.lineStyle(1, 0x3a2a20, 0.9);
        for (let r = 0; r < 4; r++) {
            const rx = left + 8 + Math.random() * (bWidth - 16);
            nearCity.beginPath();
            nearCity.moveTo(rx, top + bHeight * 0.1);
            nearCity.lineTo(rx + (Math.random() - 0.5) * 15, top - 8 - Math.random() * 15);
            nearCity.strokePath();
        }
        nearCity.lineStyle(0);
        
        // Rubble pile at base
        nearCity.fillStyle(0x141420, 1);
        for (let r = 0; r < 8; r++) {
            const rx = left - 12 + Math.random() * (bWidth + 24);
            const ry = by + Math.random() * 18;
            const rw = 10 + Math.random() * 18;
            const rh = 5 + Math.random() * 10;
            nearCity.fillRect(rx, ry, rw, rh);
        }
        
        // Scattered debris chunks
        nearCity.fillStyle(0x1a1a26, 1);
        for (let d = 0; d < 5; d++) {
            const dx = left - 20 + Math.random() * (bWidth + 40);
            const dy = by + 5 + Math.random() * 25;
            nearCity.beginPath();
            nearCity.moveTo(dx, dy);
            nearCity.lineTo(dx + 4 + Math.random() * 8, dy - 2);
            nearCity.lineTo(dx + 6 + Math.random() * 6, dy + 4);
            nearCity.lineTo(dx + 2, dy + 5);
            nearCity.closePath();
            nearCity.fillPath();
        }
        
        // Windows on remaining structure
        nearCity.fillStyle(0x99bbdd, 0.6);
        for (let fy = 18; fy < bHeight * 0.55; fy += 18) {
            for (let wx = 8; wx < bWidth - 12; wx += 14) {
                if (Math.random() > 0.35) {
                    const state = Math.random();
                    if (state > 0.88) {
                        nearCity.fillStyle(0xff3300, 0.85);
                    } else if (state > 0.55) {
                        nearCity.fillStyle(0x99bbdd, 0.6);
                    } else if (state > 0.3) {
                        nearCity.fillStyle(0x121220, 0.9);
                    } else {
                        // Broken window
                        nearCity.fillStyle(0x0a0a12, 0.9);
                        nearCity.fillRect(left + wx, top + fy, 10, 12);
                        nearCity.lineStyle(1, 0x3a3a4a, 0.5);
                        nearCity.beginPath();
                        nearCity.moveTo(left + wx, top + fy);
                        nearCity.lineTo(left + wx + 10, top + fy + 12);
                        nearCity.moveTo(left + wx + 10, top + fy);
                        nearCity.lineTo(left + wx, top + fy + 12);
                        nearCity.strokePath();
                        nearCity.lineStyle(0);
                        continue;
                    }
                    nearCity.fillRect(left + wx, top + fy, 10, 12);
                }
            }
        }
        
        // Fire effects (larger and more detailed)
        if (Math.random() > 0.35) {
            const fx = left + bWidth * 0.25 + Math.random() * bWidth * 0.5;
            const fy = top + bHeight * 0.18 + Math.random() * bHeight * 0.4;
            
            // Fire glow
            nearCity.fillStyle(0xff2200, 0.2);
            nearCity.fillCircle(fx, fy, 28);
            
            // Outer flame
            nearCity.fillStyle(0xff4400, 0.4);
            nearCity.beginPath();
            nearCity.moveTo(fx - 15, fy + 10);
            nearCity.lineTo(fx - 8, fy - 12);
            nearCity.lineTo(fx, fy - 5);
            nearCity.lineTo(fx + 5, fy - 18);
            nearCity.lineTo(fx + 10, fy - 8);
            nearCity.lineTo(fx + 15, fy + 10);
            nearCity.closePath();
            nearCity.fillPath();
            
            // Mid flame
            nearCity.fillStyle(0xff6600, 0.6);
            nearCity.fillCircle(fx, fy, 12);
            
            // Inner flame
            nearCity.fillStyle(0xff9900, 0.8);
            nearCity.fillCircle(fx, fy - 3, 7);
            
            // Hot core
            nearCity.fillStyle(0xffcc00, 0.9);
            nearCity.fillCircle(fx, fy - 5, 4);
            
            // Smoke above fire
            nearCity.fillStyle(0x222222, 0.25);
            nearCity.fillCircle(fx - 5, fy - 30, 15);
            nearCity.fillCircle(fx + 8, fy - 45, 18);
            nearCity.fillCircle(fx - 3, fy - 60, 20);
        }
    }
    
    nearCity.setScrollFactor(0.7);
    
    // ========================================
    // LAYER 6: Foreground Terrain & Details
    // ========================================
    const terrain = scene.add.graphics();
    
    // Generate looping terrain noise
    function generateLoopingNoise(length, step, magnitude, seed) {
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
    
    // Base terrain layer (darker)
    const baseNoise = generateLoopingNoise(CONFIG.worldWidth, 35, 28, 0.5);
    terrain.fillStyle(0x1a1210, 1);
    terrain.beginPath();
    terrain.moveTo(0, CONFIG.worldHeight);
    for (let i = 0; i < baseNoise.length; i++) {
        const x = i * 35;
        if (x > CONFIG.worldWidth) break;
        terrain.lineTo(x, groundY - baseNoise[i] - 18);
    }
    terrain.lineTo(CONFIG.worldWidth, CONFIG.worldHeight);
    terrain.closePath();
    terrain.fillPath();
    
    // Mid terrain layer
    const midNoise = generateLoopingNoise(CONFIG.worldWidth, 25, 18, 1.2);
    terrain.fillStyle(0x252018, 1);
    terrain.beginPath();
    terrain.moveTo(0, CONFIG.worldHeight);
    for (let i = 0; i < midNoise.length; i++) {
        const x = i * 25;
        if (x > CONFIG.worldWidth) break;
        terrain.lineTo(x, groundY - midNoise[i] - 10);
    }
    terrain.lineTo(CONFIG.worldWidth, CONFIG.worldHeight);
    terrain.closePath();
    terrain.fillPath();
    
    // Top terrain layer
    const topNoise = generateLoopingNoise(CONFIG.worldWidth, 28, 14, 2.1);
    terrain.fillStyle(0x352a20, 1);
    terrain.beginPath();
    terrain.moveTo(0, CONFIG.worldHeight);
    for (let i = 0; i < topNoise.length; i++) {
        const x = i * 28;
        if (x > CONFIG.worldWidth) break;
        terrain.lineTo(x, groundY - topNoise[i] - 4);
    }
    terrain.lineTo(CONFIG.worldWidth, CONFIG.worldHeight);
    terrain.closePath();
    terrain.fillPath();
    
    // Craters
    for (let i = 0; i < 12; i++) {
        const cx = Math.random() * CONFIG.worldWidth;
        const cy = groundY + 5 + Math.random() * 20;
        const cw = 20 + Math.random() * 40;
        const ch = 8 + Math.random() * 15;
        
        // Crater rim
        terrain.fillStyle(0x3a3028, 1);
        terrain.fillEllipse(cx, cy, cw + 6, ch + 3);
        
        // Crater hole
        terrain.fillStyle(0x151210, 1);
        terrain.fillEllipse(cx, cy + 2, cw, ch);
        
        // Scorch marks
        terrain.fillStyle(0x1a1510, 0.6);
        terrain.fillEllipse(cx, cy, cw + 15, ch + 8);
    }
    
    // Wrecked vehicles
    for (let i = 0; i < 8; i++) {
        const vx = Math.random() * CONFIG.worldWidth;
        const vy = groundY + Math.random() * 15;
        const flipped = Math.random() > 0.5;
        
        if (Math.random() > 0.5) {
            // Car wreck
            terrain.fillStyle(0x2a2520, 1);
            if (flipped) {
                terrain.fillRect(vx, vy, 25, 8);
                terrain.fillRect(vx + 3, vy - 5, 18, 5);
            } else {
                terrain.fillRect(vx, vy, 25, 10);
                terrain.fillRect(vx + 4, vy - 6, 16, 6);
            }
            
            // Windows (broken)
            terrain.fillStyle(0x101015, 0.8);
            terrain.fillRect(vx + 5, vy - 5, 5, 4);
            terrain.fillRect(vx + 12, vy - 5, 5, 4);
            
            // Wheels (or lack thereof)
            terrain.fillStyle(0x151512, 1);
            terrain.fillCircle(vx + 5, vy + 10, 4);
            if (!flipped) {
                terrain.fillCircle(vx + 20, vy + 10, 4);
            }
            
            // Fire if burning
            if (Math.random() > 0.6) {
                terrain.fillStyle(0xff4400, 0.4);
                terrain.fillCircle(vx + 12, vy - 8, 8);
                terrain.fillStyle(0xff7700, 0.6);
                terrain.fillCircle(vx + 12, vy - 10, 4);
            }
        } else {
            // Truck/bus wreck
            terrain.fillStyle(0x282420, 1);
            terrain.fillRect(vx, vy, 40, 14);
            terrain.fillRect(vx, vy - 8, 12, 8);
            
            // Burnt out
            terrain.fillStyle(0x151512, 0.9);
            terrain.fillRect(vx + 14, vy + 2, 22, 10);
        }
    }
    
    // Dead trees
    for (let i = 0; i < 10; i++) {
        const tx = Math.random() * CONFIG.worldWidth;
        const ty = groundY - topNoise[Math.floor(tx / 28) % topNoise.length];
        
        terrain.fillStyle(0x1a1815, 1);
        
        // Trunk
        terrain.fillRect(tx - 2, ty - 35, 4, 35);
        
        // Dead branches
        terrain.lineStyle(2, 0x1a1815, 1);
        terrain.beginPath();
        terrain.moveTo(tx, ty - 30);
        terrain.lineTo(tx - 15, ty - 45);
        terrain.strokePath();
        terrain.beginPath();
        terrain.moveTo(tx, ty - 25);
        terrain.lineTo(tx + 12, ty - 38);
        terrain.strokePath();
        terrain.beginPath();
        terrain.moveTo(tx, ty - 18);
        terrain.lineTo(tx - 10, ty - 28);
        terrain.strokePath();
        terrain.lineStyle(0);
    }
    
    // Scattered debris
    terrain.fillStyle(0x4a3a2a, 0.8);
    for (let i = 0; i < 100; i++) {
        const rx = Math.random() * CONFIG.worldWidth;
        const ry = groundY - 3 - Math.random() * 35;
        terrain.fillRect(rx, ry, 3 + Math.random() * 10, 2 + Math.random() * 5);
    }
    
    // Bones/remains (subtle)
    terrain.fillStyle(0x8a8070, 0.5);
    for (let i = 0; i < 6; i++) {
        const bx = Math.random() * CONFIG.worldWidth;
        const by = groundY + 5 + Math.random() * 20;
        
        // Simple bone shapes
        terrain.fillEllipse(bx, by, 8, 2);
        terrain.fillCircle(bx - 3, by, 2);
        terrain.fillCircle(bx + 3, by, 2);
    }
    
    // Toxic puddles
    for (let i = 0; i < 5; i++) {
        const px = Math.random() * CONFIG.worldWidth;
        const py = groundY + 10 + Math.random() * 15;
        const pw = 20 + Math.random() * 30;
        const ph = 5 + Math.random() * 8;
        
        terrain.fillStyle(0x2a4a30, 0.4);
        terrain.fillEllipse(px, py, pw + 4, ph + 2);
        terrain.fillStyle(0x3a6a40, 0.6);
        terrain.fillEllipse(px, py, pw, ph);
        terrain.fillStyle(0x5a8a50, 0.3);
        terrain.fillEllipse(px - pw * 0.2, py - 1, pw * 0.3, ph * 0.4);
    }
    
    // Foreground buildings (largest, most detailed)
    for (let i = 0; i < 18; i++) {
        const bx = (i * (CONFIG.worldWidth / 18)) + Math.random() * 80;
        const bWidth = 45 + Math.random() * 70;
        const bHeight = 110 + Math.random() * 150;
        const noiseIdx = Math.floor((bx / CONFIG.worldWidth) * topNoise.length) % topNoise.length;
        const by = groundY - topNoise[noiseIdx];
        const left = bx - bWidth / 2;
        const top = by - bHeight;
        
        terrain.fillStyle(0x1e1e2a, 1);
        
        // Heavily destroyed shape
        terrain.beginPath();
        terrain.moveTo(left, by);
        terrain.lineTo(left, top + bHeight * 0.06);
        
        const segs = 5 + Math.floor(Math.random() * 5);
        for (let s = 0; s <= segs; s++) {
            terrain.lineTo(
                left + (bWidth / segs) * s,
                top + Math.random() * bHeight * 0.32
            );
        }
        
        terrain.lineTo(left + bWidth, top + bHeight * 0.04);
        terrain.lineTo(left + bWidth, by);
        terrain.closePath();
        terrain.fillPath();
        
        // Wall texture/damage
        terrain.fillStyle(0x161622, 0.8);
        for (let h = 0; h < 5; h++) {
            const hx = left + 10 + Math.random() * (bWidth - 20);
            const hy = top + bHeight * 0.25 + Math.random() * bHeight * 0.45;
            terrain.fillEllipse(hx, hy, 10 + Math.random() * 18, 8 + Math.random() * 14);
        }
        
        // Exposed floors
        terrain.fillStyle(0x222230, 0.9);
        for (let f = 0; f < 4; f++) {
            const fy = top + bHeight * 0.15 + f * (bHeight * 0.15);
            terrain.fillRect(left + 5, fy, bWidth - 10, 3);
        }
        
        // Rebar
        terrain.lineStyle(1, 0x4a3a30, 1);
        for (let r = 0; r < 6; r++) {
            const rx = left + 10 + Math.random() * (bWidth - 20);
            terrain.beginPath();
            terrain.moveTo(rx, top + bHeight * 0.08);
            terrain.lineTo(rx + (Math.random() - 0.5) * 20, top - 12 - Math.random() * 20);
            terrain.strokePath();
        }
        terrain.lineStyle(0);
        
        // Large rubble pile
        terrain.fillStyle(0x161620, 1);
        for (let r = 0; r < 12; r++) {
            terrain.fillRect(
                left - 18 + Math.random() * (bWidth + 36),
                by - 4 + Math.random() * 25,
                8 + Math.random() * 18,
                4 + Math.random() * 12
            );
        }
        
        // Windows
        terrain.fillStyle(0xaaccee, 0.7);
        for (let fy = 20; fy < bHeight * 0.45; fy += 20) {
            for (let wx = 10; wx < bWidth - 15; wx += 16) {
                if (Math.random() > 0.28) {
                    const state = Math.random();
                    if (state > 0.9) {
                        terrain.fillStyle(0xff2200, 0.9);
                    } else if (state > 0.65) {
                        terrain.fillStyle(0xaaccee, 0.7);
                    } else if (state > 0.35) {
                        terrain.fillStyle(0x0e0e18, 0.95);
                    } else {
                        // Broken window with cracks
                        terrain.fillStyle(0x080810, 0.95);
                        terrain.fillRect(left + wx, top + fy, 12, 14);
                        terrain.lineStyle(1, 0x4a4a5a, 0.6);
                        terrain.beginPath();
                        terrain.moveTo(left + wx + 2, top + fy + 2);
                        terrain.lineTo(left + wx + 10, top + fy + 12);
                        terrain.strokePath();
                        terrain.beginPath();
                        terrain.moveTo(left + wx + 10, top + fy + 3);
                        terrain.lineTo(left + wx + 4, top + fy + 11);
                        terrain.strokePath();
                        terrain.lineStyle(0);
                        continue;
                    }
                    terrain.fillRect(left + wx, top + fy, 12, 14);
                }
            }
        }
        
        // Fire (big and detailed)
        if (Math.random() > 0.25) {
            const fx = left + bWidth * 0.2 + Math.random() * bWidth * 0.6;
            const fy = top + bHeight * 0.12 + Math.random() * bHeight * 0.4;
            
            // Ambient glow
            terrain.fillStyle(0xff1100, 0.15);
            terrain.fillCircle(fx, fy, 35);
            
            // Outer fire
            terrain.fillStyle(0xff2200, 0.35);
            terrain.beginPath();
            terrain.moveTo(fx - 20, fy + 15);
            terrain.lineTo(fx - 12, fy - 15);
            terrain.lineTo(fx - 5, fy - 5);
            terrain.lineTo(fx, fy - 25);
            terrain.lineTo(fx + 8, fy - 10);
            terrain.lineTo(fx + 15, fy - 20);
            terrain.lineTo(fx + 20, fy + 15);
            terrain.closePath();
            terrain.fillPath();
            
            // Mid fire
            terrain.fillStyle(0xff5500, 0.55);
            terrain.fillCircle(fx, fy, 16);
            
            // Inner fire
            terrain.fillStyle(0xff8800, 0.75);
            terrain.fillCircle(fx, fy - 4, 10);
            
            // Hot core
            terrain.fillStyle(0xffcc00, 0.9);
            terrain.fillCircle(fx, fy - 7, 5);
            
            // White hot center
            terrain.fillStyle(0xffffaa, 0.8);
            terrain.fillCircle(fx, fy - 9, 2.5);
            
            // Rising smoke
            terrain.fillStyle(0x1a1a1a, 0.2);
            terrain.fillCircle(fx - 8, fy - 40, 18);
            terrain.fillCircle(fx + 5, fy - 60, 22);
            terrain.fillCircle(fx - 3, fy - 85, 25);
            terrain.fillCircle(fx + 10, fy - 110, 28);
        }
    }
    
    // Warning signs
    for (let i = 0; i < 4; i++) {
        const sx = Math.random() * CONFIG.worldWidth;
        const sy = groundY - 5;
        
        // Post
        terrain.fillStyle(0x3a3530, 1);
        terrain.fillRect(sx - 1, sy - 25, 3, 25);
        
        // Sign
        terrain.fillStyle(0xaaaa30, 0.8);
        terrain.fillRect(sx - 10, sy - 35, 20, 12);
        terrain.fillStyle(0x1a1a15, 0.9);
        terrain.fillRect(sx - 8, sy - 33, 16, 8);
    }
    
    scene.groundLevel = groundY;
}