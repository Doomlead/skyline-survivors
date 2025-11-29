// ------------------------
// Background - OPTIMIZED for performance
// ------------------------

function createBackground(scene) {
    const groundY = CONFIG.worldHeight - 80;
    
    // ========================================
    // LAYER 0: Simple gradient sky
    // ========================================
    const skyGradient = scene.add.graphics();
    const bandHeight = 30; // Larger bands = fewer draw calls
    
    for (let y = 0; y < CONFIG.worldHeight; y += bandHeight) {
        const t = y / CONFIG.worldHeight;
        let r, g, b;
        
        if (t < 0.4) {
            r = Math.floor(8 + t * 30);
            g = Math.floor(10 + t * 20);
            b = Math.floor(30 + t * 40);
        } else if (t < 0.7) {
            const mt = (t - 0.4) / 0.3;
            r = Math.floor(20 + mt * 50);
            g = Math.floor(18 + mt * 15);
            b = Math.floor(46 - mt * 20);
        } else {
            const bt = (t - 0.7) / 0.3;
            r = Math.floor(70 - bt * 40);
            g = Math.floor(33 - bt * 20);
            b = Math.floor(26 - bt * 15);
        }
        skyGradient.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
        skyGradient.fillRect(0, y, CONFIG.worldWidth, bandHeight + 1);
    }
    skyGradient.setScrollFactor(0);
    
    // ========================================
    // LAYER 1: Stars (reduced count)
    // ========================================
    const stars = scene.add.graphics();
    
    for (let i = 0; i < 150; i++) {
        const x = Math.random() * CONFIG.worldWidth;
        const y = Math.random() * (CONFIG.worldHeight * 0.5);
        const brightness = 0.3 + Math.random() * 0.7;
        stars.fillStyle(0xffffff, brightness);
        stars.fillRect(x, y, 1 + (Math.random() > 0.8 ? 1 : 0), 1);
    }
    stars.setScrollFactor(0.1);
    
    // ========================================
    // LAYER 2: Distant city silhouettes
    // ========================================
    const distantCity = scene.add.graphics();
    
    for (let i = 0; i < 30; i++) {
        const bx = (i * (CONFIG.worldWidth / 30)) + Math.random() * 40;
        const bWidth = 15 + Math.random() * 30;
        const bHeight = 40 + Math.random() * 80;
        const by = CONFIG.worldHeight - 100;
        const left = bx - bWidth / 2;
        const top = by - bHeight;
        
        distantCity.fillStyle(0x0a0a12, 1);
        
        if (Math.random() > 0.5) {
            // Destroyed building
            distantCity.beginPath();
            distantCity.moveTo(left, by);
            distantCity.lineTo(left, top + bHeight * 0.2);
            distantCity.lineTo(left + bWidth * 0.3, top);
            distantCity.lineTo(left + bWidth * 0.7, top + bHeight * 0.15);
            distantCity.lineTo(left + bWidth, top + bHeight * 0.1);
            distantCity.lineTo(left + bWidth, by);
            distantCity.closePath();
            distantCity.fillPath();
        } else {
            distantCity.fillRect(left, top, bWidth, bHeight);
        }
        
        // Simple windows
        if (Math.random() > 0.3) {
            distantCity.fillStyle(0x4488aa, 0.4);
            for (let wy = 8; wy < bHeight - 5; wy += 12) {
                distantCity.fillRect(left + 3, top + wy, bWidth - 6, 2);
            }
        }
    }
    distantCity.setScrollFactor(0.3);
    
    // ========================================
    // LAYER 3: Mid-distance destroyed city
    // ========================================
    const midCity = scene.add.graphics();
    
    for (let i = 0; i < 25; i++) {
        const bx = (i * (CONFIG.worldWidth / 25)) + Math.random() * 50;
        const bWidth = 25 + Math.random() * 45;
        const bHeight = 60 + Math.random() * 100;
        const by = CONFIG.worldHeight - 90;
        const left = bx - bWidth / 2;
        const top = by - bHeight;
        
        const destroyed = Math.random() > 0.4;
        
        midCity.fillStyle(0x151520, 1);
        
        if (destroyed) {
            midCity.beginPath();
            midCity.moveTo(left, by);
            midCity.lineTo(left, top + bHeight * 0.15);
            
            const segments = 3 + Math.floor(Math.random() * 3);
            for (let s = 0; s <= segments; s++) {
                midCity.lineTo(
                    left + (bWidth / segments) * s,
                    top + Math.random() * bHeight * 0.3
                );
            }
            
            midCity.lineTo(left + bWidth, top + bHeight * 0.1);
            midCity.lineTo(left + bWidth, by);
            midCity.closePath();
            midCity.fillPath();
            
            // Fire glow
            if (Math.random() > 0.5) {
                const fx = left + bWidth / 2;
                const fy = top + bHeight * 0.4;
                midCity.fillStyle(0xff4400, 0.3);
                midCity.fillCircle(fx, fy, 15);
                midCity.fillStyle(0xff8800, 0.5);
                midCity.fillCircle(fx, fy, 8);
            }
        } else {
            midCity.fillRect(left, top, bWidth, bHeight);
            
            // Windows
            midCity.fillStyle(0x6699bb, 0.5);
            for (let fy = 10; fy < bHeight - 8; fy += 14) {
                for (let wx = 4; wx < bWidth - 6; wx += 10) {
                    if (Math.random() > 0.3) {
                        midCity.fillRect(left + wx, top + fy, 6, 8);
                    }
                }
            }
        }
    }
    midCity.setScrollFactor(0.5);
    
    // ========================================
    // LAYER 4: Near destroyed buildings
    // ========================================
    const nearCity = scene.add.graphics();
    
    for (let i = 0; i < 20; i++) {
        const bx = (i * (CONFIG.worldWidth / 20)) + Math.random() * 60;
        const bWidth = 35 + Math.random() * 55;
        const bHeight = 80 + Math.random() * 120;
        const by = CONFIG.worldHeight - 85;
        const left = bx - bWidth / 2;
        const top = by - bHeight;
        
        nearCity.fillStyle(0x1a1a28, 1);
        
        // All near buildings are destroyed
        nearCity.beginPath();
        nearCity.moveTo(left, by);
        nearCity.lineTo(left, top + bHeight * 0.1);
        
        const segments = 4 + Math.floor(Math.random() * 4);
        for (let s = 0; s <= segments; s++) {
            nearCity.lineTo(
                left + (bWidth / segments) * s,
                top + Math.random() * bHeight * 0.35
            );
        }
        
        nearCity.lineTo(left + bWidth, top + bHeight * 0.08);
        nearCity.lineTo(left + bWidth, by);
        nearCity.closePath();
        nearCity.fillPath();
        
        // Rubble
        nearCity.fillStyle(0x121218, 1);
        for (let r = 0; r < 5; r++) {
            const rx = left - 10 + Math.random() * (bWidth + 20);
            const ry = by + Math.random() * 15;
            nearCity.fillRect(rx, ry, 8 + Math.random() * 12, 4 + Math.random() * 8);
        }
        
        // Windows on remaining structure
        nearCity.fillStyle(0x88aacc, 0.6);
        for (let fy = 15; fy < bHeight * 0.6; fy += 16) {
            for (let wx = 6; wx < bWidth - 10; wx += 12) {
                if (Math.random() > 0.4) {
                    const state = Math.random();
                    if (state > 0.85) {
                        nearCity.fillStyle(0xff3300, 0.8);
                    } else if (state > 0.5) {
                        nearCity.fillStyle(0x88aacc, 0.6);
                    } else {
                        nearCity.fillStyle(0x101018, 0.8);
                    }
                    nearCity.fillRect(left + wx, top + fy, 8, 10);
                }
            }
        }
        
        // Fire
        if (Math.random() > 0.4) {
            const fx = left + bWidth * 0.3 + Math.random() * bWidth * 0.4;
            const fy = top + bHeight * 0.2 + Math.random() * bHeight * 0.4;
            nearCity.fillStyle(0xff2200, 0.25);
            nearCity.fillCircle(fx, fy, 20);
            nearCity.fillStyle(0xff5500, 0.45);
            nearCity.fillCircle(fx, fy, 12);
            nearCity.fillStyle(0xffaa00, 0.7);
            nearCity.fillCircle(fx, fy, 6);
        }
    }
    nearCity.setScrollFactor(0.7);
    
    // ========================================
    // LAYER 5: Foreground terrain
    // ========================================
    const terrain = scene.add.graphics();
    
    // Generate looping terrain
    function generateLoopingNoise(length, step, magnitude, seed) {
        const values = [];
        const numSteps = Math.ceil(length / step);
        for (let i = 0; i <= numSteps; i++) {
            const angle = (i / numSteps) * Math.PI * 2;
            let val = Math.sin(angle + seed) * magnitude;
            val += Math.sin(angle * 2 + seed) * (magnitude * 0.5);
            if (i === numSteps) val = values[0];
            values.push(val);
        }
        return values;
    }
    
    // Base layer
    const baseNoise = generateLoopingNoise(CONFIG.worldWidth, 40, 25, 0);
    terrain.fillStyle(0x201515, 1);
    terrain.beginPath();
    terrain.moveTo(0, CONFIG.worldHeight);
    for (let i = 0; i < baseNoise.length; i++) {
        const x = i * 40;
        if (x > CONFIG.worldWidth) break;
        terrain.lineTo(x, groundY - baseNoise[i] - 15);
    }
    terrain.lineTo(CONFIG.worldWidth, CONFIG.worldHeight);
    terrain.closePath();
    terrain.fillPath();
    
    // Top layer
    const topNoise = generateLoopingNoise(CONFIG.worldWidth, 30, 15, 1);
    terrain.fillStyle(0x352520, 1);
    terrain.beginPath();
    terrain.moveTo(0, CONFIG.worldHeight);
    for (let i = 0; i < topNoise.length; i++) {
        const x = i * 30;
        if (x > CONFIG.worldWidth) break;
        terrain.lineTo(x, groundY - topNoise[i] - 5);
    }
    terrain.lineTo(CONFIG.worldWidth, CONFIG.worldHeight);
    terrain.closePath();
    terrain.fillPath();
    
    // Scattered debris
    terrain.fillStyle(0x4a3a2a, 0.8);
    for (let i = 0; i < 80; i++) {
        const rx = Math.random() * CONFIG.worldWidth;
        const ry = groundY - 5 - Math.random() * 40;
        terrain.fillRect(rx, ry, 4 + Math.random() * 10, 2 + Math.random() * 5);
    }
    
    // Foreground buildings
    for (let i = 0; i < 15; i++) {
        const bx = (i * (CONFIG.worldWidth / 15)) + Math.random() * 80;
        const bWidth = 40 + Math.random() * 60;
        const bHeight = 100 + Math.random() * 140;
        const noiseIdx = Math.floor((bx / CONFIG.worldWidth) * topNoise.length) % topNoise.length;
        const by = groundY - topNoise[noiseIdx];
        const left = bx - bWidth / 2;
        const top = by - bHeight;
        
        terrain.fillStyle(0x1c1c28, 1);
        
        // Destroyed shape
        terrain.beginPath();
        terrain.moveTo(left, by);
        terrain.lineTo(left, top + bHeight * 0.08);
        
        const segs = 5 + Math.floor(Math.random() * 4);
        for (let s = 0; s <= segs; s++) {
            terrain.lineTo(
                left + (bWidth / segs) * s,
                top + Math.random() * bHeight * 0.3
            );
        }
        
        terrain.lineTo(left + bWidth, top + bHeight * 0.05);
        terrain.lineTo(left + bWidth, by);
        terrain.closePath();
        terrain.fillPath();
        
        // Rubble pile
        terrain.fillStyle(0x141418, 1);
        for (let r = 0; r < 8; r++) {
            terrain.fillRect(
                left - 15 + Math.random() * (bWidth + 30),
                by - 3 + Math.random() * 20,
                6 + Math.random() * 15,
                3 + Math.random() * 10
            );
        }
        
        // Windows
        terrain.fillStyle(0x99bbdd, 0.7);
        for (let fy = 18; fy < bHeight * 0.5; fy += 18) {
            for (let wx = 8; wx < bWidth - 12; wx += 14) {
                if (Math.random() > 0.3) {
                    const state = Math.random();
                    if (state > 0.88) {
                        terrain.fillStyle(0xff2200, 0.9);
                    } else if (state > 0.6) {
                        terrain.fillStyle(0x99bbdd, 0.7);
                    } else {
                        terrain.fillStyle(0x0c0c12, 0.9);
                    }
                    terrain.fillRect(left + wx, top + fy, 10, 12);
                }
            }
        }
        
        // Fire effects
        if (Math.random() > 0.3) {
            const fx = left + bWidth * 0.2 + Math.random() * bWidth * 0.6;
            const fy = top + bHeight * 0.15 + Math.random() * bHeight * 0.4;
            terrain.fillStyle(0xff1100, 0.2);
            terrain.fillCircle(fx, fy, 25);
            terrain.fillStyle(0xff4400, 0.4);
            terrain.fillCircle(fx, fy, 15);
            terrain.fillStyle(0xff8800, 0.65);
            terrain.fillCircle(fx, fy, 8);
            terrain.fillStyle(0xffcc00, 0.8);
            terrain.fillCircle(fx, fy - 3, 4);
        }
    }
    
    scene.groundLevel = groundY;
}
