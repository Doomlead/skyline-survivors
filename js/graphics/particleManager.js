// ParticleManager.js - Wrap-aware particle manager
class ParticleManager {
    constructor(scene, worldWidth, worldHeight) {
        this.scene = scene;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.spawnTime = Date.now();
        this.particles = [];
        this.lastTrailPosition = null;
        this.baseTrailSpacing = 14;

        this.createParticleTextures();
    }

    /**
     * Handles the createParticleTextures routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    createParticleTextures() {
        if (!this.scene.textures.exists('particle')) {
            const graphics = this.scene.add.graphics();
            graphics.fillStyle(0xffffff, 1);
            graphics.fillRect(0, 0, 8, 8);
            graphics.generateTexture('particle', 8, 8);
            graphics.destroy();
        }

        if (!this.scene.textures.exists('glowParticle')) {
            const graphics = this.scene.add.graphics();
            graphics.fillStyle(0xffffff, 1);
            graphics.fillCircle(8, 8, 8);
            graphics.generateTexture('glowParticle', 16, 16);
            graphics.destroy();
        }
    }

    // Wrap value to 0-worldWidth range
    wrapX(x) {
        x = x % this.worldWidth;
        if (x < 0) x += this.worldWidth;
        return x;
    }

    /**
     * Handles the update routine and encapsulates its core gameplay logic.
     * Parameters: delta.
     * Returns: value defined by the surrounding game flow.
     */
    update(delta) {
        // Get camera info for wrap-aware rendering
        const mainCam = this.scene.cameras.main;
        const cameraScrollX = mainCam ? mainCam.scrollX : 0;
        const cameraWidth = mainCam ? mainCam.width : CONFIG.width;

        this.particles = this.particles.filter(particleControl => {
            return particleControl.update(delta, cameraScrollX, cameraWidth);
        });
    }

    /**
     * Handles the applyGravityToParticles routine and encapsulates its core gameplay logic.
     * Parameters: gravitySourceX, gravitySourceY.
     * Returns: value defined by the surrounding game flow.
     */
    applyGravityToParticles(gravitySourceX, gravitySourceY) {
        this.particles.forEach(particleControl => {
            if (particleControl.affectedByGravity) {
                // Use canonical X for gravity calculations
                const dx = gravitySourceX - particleControl.canonicalX;
                const dy = gravitySourceY - particleControl.sprite.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                const normalizedGravity = {
                    x: dx / distance,
                    y: dy / distance
                };

                particleControl.applyGravity(normalizedGravity, distance);
            }
        });
    }

    /**
     * Handles the enemyExplosion routine and encapsulates its core gameplay logic.
     * Parameters: x, y.
     * Returns: value defined by the surrounding game flow.
     */
    enemyExplosion(x, y) {
        // Wrap the spawn position to canonical coordinates
        x = this.wrapX(x);
        
        const hue1 = Math.random() * 6;
        const hue2 = (Math.random() * 2) % 6;
        const color1 = this.hsvToColor(hue1, 0.5, 1);
        const color2 = this.hsvToColor(hue2, 0.5, 1);

        for (let i = 0; i < 120; i++) {
            const velocity = this.getRandomVelocity(250);
            const sprite = this.scene.add.sprite(x, y, 'particle');
            sprite.setDepth(FG_DEPTH_BASE + 20);

            const color = {
                r: color1.r + (color2.r - color1.r) * Math.random() * 0.5,
                g: color1.g + (color2.g - color1.g) * Math.random() * 0.5,
                b: color1.b + (color2.b - color1.b) * Math.random() * 0.5
            };

            sprite.setData('affectedByGravity', true);
            const control = new ParticleControl(sprite, velocity, 3100, color, this.worldWidth, this.worldHeight);
            this.particles.push(control);
        }
    }

    /**
     * Handles the bulletExplosion routine and encapsulates its core gameplay logic.
     * Parameters: x, y.
     * Returns: value defined by the surrounding game flow.
     */
    bulletExplosion(x, y) {
        x = this.wrapX(x);
        const color = { r: 0.676, g: 0.844, b: 0.898 };

        for (let i = 0; i < 30; i++) {
            const velocity = this.getRandomVelocity(175);
            const sprite = this.scene.add.sprite(x, y, 'particle');
            sprite.setDepth(FG_DEPTH_BASE + 20);

            sprite.setData('affectedByGravity', true);
            const control = new ParticleControl(sprite, velocity, 1000, color, this.worldWidth, this.worldHeight);
            this.particles.push(control);
        }
    }

    /**
     * Handles the playerExplosion routine and encapsulates its core gameplay logic.
     * Parameters: x, y.
     * Returns: value defined by the surrounding game flow.
     */
    playerExplosion(x, y) {
        x = this.wrapX(x);
        const color1 = { r: 1, g: 1, b: 1 };
        const color2 = { r: 1, g: 1, b: 0 };

        for (let i = 0; i < 1200; i++) {
            const velocity = this.getRandomVelocity(1000);
            const sprite = this.scene.add.sprite(x, y, 'particle');
            sprite.setDepth(FG_DEPTH_BASE + 20);

            const t = Math.random();
            const color = {
                r: color1.r + (color2.r - color1.r) * t,
                g: color1.g + (color2.g - color1.g) * t,
                b: color1.b + (color2.b - color1.b) * t
            };

            sprite.setData('affectedByGravity', true);
            const control = new ParticleControl(sprite, velocity, 2800, color, this.worldWidth, this.worldHeight);
            this.particles.push(control);
        }
    }

    /**
     * Handles the sprayParticle routine and encapsulates its core gameplay logic.
     * Parameters: x, y, sprayVelX, sprayVelY.
     * Returns: value defined by the surrounding game flow.
     */
    sprayParticle(x, y, sprayVelX, sprayVelY) {
        x = this.wrapX(x);
        const sprite = this.scene.add.sprite(x, y, 'particle');
        sprite.setDepth(FG_DEPTH_BASE + 20);
        const color = { r: 0.8, g: 0.4, b: 0.8 };
        const velocity = { x: sprayVelX, y: sprayVelY };

        sprite.setData('affectedByGravity', true);
        const control = new ParticleControl(sprite, velocity, 3500, color, this.worldWidth, this.worldHeight);
        this.particles.push(control);
    }

    /**
     * Handles the blackHoleExplosion routine and encapsulates its core gameplay logic.
     * Parameters: x, y.
     * Returns: value defined by the surrounding game flow.
     */
    blackHoleExplosion(x, y) {
        x = this.wrapX(x);
        const hue = ((Date.now() - this.spawnTime) * 0.003) % 6;
        const numParticles = 150;
        const color = this.hsvToColor(hue, 0.25, 1);
        const startOffset = Math.random() * Math.PI * 2 / numParticles;

        for (let i = 0; i < numParticles; i++) {
            const alpha = Math.PI * 2 * i / numParticles + startOffset;
            const speed = Math.random() * 200 + 300;
            const velocity = {
                x: Math.cos(alpha) * speed,
                y: Math.sin(alpha) * speed
            };

            const posX = x + velocity.x * 0.1;
            const posY = y + velocity.y * 0.1;

            const sprite = this.scene.add.sprite(posX, posY, 'particle');
            sprite.setDepth(FG_DEPTH_BASE + 20);
            sprite.setData('affectedByGravity', true);
            const control = new ParticleControl(sprite, velocity, 1000, color, this.worldWidth, this.worldHeight);
            this.particles.push(control);
        }
    }

    /**
     * Handles the makeExhaustFire routine and encapsulates its core gameplay logic.
     * Parameters: x, y, rotation.
     * Returns: value defined by the surrounding game flow.
     */
    makeExhaustFire(x, y, rotation) {
        x = this.wrapX(x);
        const midColor = { r: 1, g: 0.73, b: 0.12 };
        const sideColor = { r: 0.78, g: 0.15, b: 0.04 };

        const t = (Date.now() - this.spawnTime) / 1000;
        const direction = { x: Math.cos(rotation), y: Math.sin(rotation) };

        const baseVel = { x: direction.x * -45, y: direction.y * -45 };
        const perpVel = {
            x: baseVel.y * 2 * Math.sin(t * 10),
            y: -baseVel.x * 2 * Math.sin(t * 10)
        };

        const posX = this.wrapX(x + direction.x * -25);
        const posY = y + direction.y * -25;

        // Middle stream
        const randAngleMid = Math.random() * Math.PI * 2;
        const randVecMid = { x: Math.cos(randAngleMid), y: Math.sin(randAngleMid) };
        const velMid = {
            x: baseVel.x + randVecMid.x * 7.5,
            y: baseVel.y + randVecMid.y * 7.5
        };

        this.createExhaustParticle(posX, posY, velMid, midColor, 'particle');
        this.createExhaustParticle(posX, posY, velMid, midColor, 'glowParticle');

        // Side streams
        const randAngle1 = Math.random() * Math.PI * 2;
        const randAngle2 = Math.random() * Math.PI * 2;
        const randVec1 = { x: Math.cos(randAngle1), y: Math.sin(randAngle1) };
        const randVec2 = { x: Math.cos(randAngle2), y: Math.sin(randAngle2) };

        const velSide1 = {
            x: baseVel.x + randVec1.x * 2.4 + perpVel.x,
            y: baseVel.y + randVec1.y * 2.4 + perpVel.y
        };

        const velSide2 = {
            x: baseVel.x + randVec2.x * 2.4 - perpVel.x,
            y: baseVel.y + randVec2.y * 2.4 - perpVel.y
        };

        this.createExhaustParticle(posX, posY, velSide1, sideColor, 'particle');
        this.createExhaustParticle(posX, posY, velSide2, sideColor, 'particle');
        this.createExhaustParticle(posX, posY, velSide1, sideColor, 'glowParticle');
        this.createExhaustParticle(posX, posY, velSide2, sideColor, 'glowParticle');
    }

    /**
     * Handles the makeExhaustTrail routine and encapsulates its core gameplay logic.
     * Parameters: x, y, rotation, speed.
     * Returns: value defined by the surrounding game flow.
     */
    makeExhaustTrail(x, y, rotation, speed) {
        const direction = { x: Math.cos(rotation), y: Math.sin(rotation) };
        const trailOrigin = {
            x: this.wrapX(x + direction.x * -20),
            y: y + direction.y * -20
        };

        const spacing = Math.max(6, this.baseTrailSpacing - speed * 0.01);

        if (!this.lastTrailPosition) {
            this.lastTrailPosition = { ...trailOrigin };
            return;
        }

        // Calculate wrapped distance for trail
        let deltaX = trailOrigin.x - this.lastTrailPosition.x;
        
        // Handle wrap-around distance
        if (deltaX > this.worldWidth / 2) {
            deltaX -= this.worldWidth;
        } else if (deltaX < -this.worldWidth / 2) {
            deltaX += this.worldWidth;
        }
        
        const deltaY = trailOrigin.y - this.lastTrailPosition.y;
        const distance = Math.hypot(deltaX, deltaY);

        if (distance < spacing) {
            return;
        }

        const steps = Math.min(6, Math.floor(distance / spacing));
        const normal = { x: deltaX / distance, y: deltaY / distance };
        const color = { r: 0.55, g: 0.82, b: 1 };

        for (let i = 1; i <= steps; i++) {
            const posX = this.wrapX(this.lastTrailPosition.x + normal.x * spacing * i);
            const posY = this.lastTrailPosition.y + normal.y * spacing * i;
            const wobble = (Math.random() - 0.5) * 12;
            const sideways = { x: -direction.y * wobble, y: direction.x * wobble };
            const drift = {
                x: direction.x * -35 + sideways.x,
                y: direction.y * -35 + sideways.y
            };
            this.createTrailParticle(posX, posY, drift, color);
        }

        this.lastTrailPosition = { ...trailOrigin };
    }

    /**
     * Handles the stopExhaustTrail routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    stopExhaustTrail() {
        this.lastTrailPosition = null;
    }

    /**
     * Handles the createTrailParticle routine and encapsulates its core gameplay logic.
     * Parameters: x, y, velocity, color.
     * Returns: value defined by the surrounding game flow.
     */
    createTrailParticle(x, y, velocity, color) {
        const sprite = this.scene.add.sprite(x, y, 'glowParticle');
        sprite.setDepth(FG_DEPTH_BASE + 15);
        const lifespan = 500 + Math.random() * 350;
        sprite.setData('affectedByGravity', false);
        const control = new ParticleControl(sprite, velocity, lifespan, color, this.worldWidth, this.worldHeight);
        this.particles.push(control);
    }

    /**
     * Handles the createExhaustParticle routine and encapsulates its core gameplay logic.
     * Parameters: x, y, velocity, color, texture.
     * Returns: value defined by the surrounding game flow.
     */
    createExhaustParticle(x, y, velocity, color, texture) {
        const sprite = this.scene.add.sprite(x, y, texture);
        sprite.setDepth(FG_DEPTH_BASE + 15);
        sprite.setData('affectedByGravity', true);
        const control = new ParticleControl(sprite, velocity, 800, color, this.worldWidth, this.worldHeight);
        this.particles.push(control);
    }

    /**
     * Handles the hsvToColor routine and encapsulates its core gameplay logic.
     * Parameters: h, s, v.
     * Returns: value defined by the surrounding game flow.
     */
    hsvToColor(h, s, v) {
        if (h === 0 && s === 0) {
            return { r: v, g: v, b: v };
        }

        const c = s * v;
        const x = c * (1 - Math.abs(h % 2 - 1));
        const m = v - c;

        if (h < 1) return { r: c + m, g: x + m, b: m };
        else if (h < 2) return { r: x + m, g: c + m, b: m };
        else if (h < 3) return { r: m, g: c + m, b: x + m };
        else if (h < 4) return { r: m, g: x + m, b: c + m };
        else if (h < 5) return { r: x + m, g: m, b: c + m };
        else return { r: c + m, g: m, b: x + m };
    }

    /**
     * Handles the getRandomVelocity routine and encapsulates its core gameplay logic.
     * Parameters: max.
     * Returns: value defined by the surrounding game flow.
     */
    getRandomVelocity(max) {
        const angle = Math.random() * Math.PI * 2;
        const random = Math.random() * 5 + 1;
        const particleSpeed = max * (1 - 0.6 / random);

        return {
            x: Math.cos(angle) * particleSpeed,
            y: Math.sin(angle) * particleSpeed
        };
    }

    /**
     * Handles the destroy routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    destroy() {
        this.particles.forEach(control => {
            if (control.sprite && !control.sprite.destroyed) {
                control.sprite.destroy();
            }
        });
        this.particles = [];
    }
}

window.ParticleManager = ParticleManager;
