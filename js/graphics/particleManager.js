// ParticleManager.js - Phaser-equivalent particle manager
class ParticleManager {
    constructor(scene, screenWidth, screenHeight) {
        this.scene = scene;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.spawnTime = Date.now();
        this.particles = [];
        this.lastTrailPosition = null;
        this.baseTrailSpacing = 14;

        this.createParticleTextures();
    }

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

    update(delta) {
        this.particles = this.particles.filter(particleControl => {
            return particleControl.update(delta);
        });
    }

    applyGravityToParticles(gravitySourceX, gravitySourceY) {
        this.particles.forEach(particleControl => {
            if (particleControl.affectedByGravity) {
                const dx = gravitySourceX - particleControl.sprite.x;
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

    enemyExplosion(x, y) {
        const hue1 = Math.random() * 6;
        const hue2 = (Math.random() * 2) % 6;
        const color1 = this.hsvToColor(hue1, 0.5, 1);
        const color2 = this.hsvToColor(hue2, 0.5, 1);

        for (let i = 0; i < 120; i++) {
            const velocity = this.getRandomVelocity(250);
            const sprite = this.scene.add.sprite(x, y, 'particle');

            const color = {
                r: color1.r + (color2.r - color1.r) * Math.random() * 0.5,
                g: color1.g + (color2.g - color1.g) * Math.random() * 0.5,
                b: color1.b + (color2.b - color1.b) * Math.random() * 0.5
            };

            sprite.setData('affectedByGravity', true);
            const control = new ParticleControl(sprite, velocity, 3100, color, this.screenWidth, this.screenHeight);
            this.particles.push(control);
        }
    }

    bulletExplosion(x, y) {
        const color = { r: 0.676, g: 0.844, b: 0.898 };

        for (let i = 0; i < 30; i++) {
            const velocity = this.getRandomVelocity(175);
            const sprite = this.scene.add.sprite(x, y, 'particle');

            sprite.setData('affectedByGravity', true);
            const control = new ParticleControl(sprite, velocity, 1000, color, this.screenWidth, this.screenHeight);
            this.particles.push(control);
        }
    }

    playerExplosion(x, y) {
        const color1 = { r: 1, g: 1, b: 1 };
        const color2 = { r: 1, g: 1, b: 0 };

        for (let i = 0; i < 1200; i++) {
            const velocity = this.getRandomVelocity(1000);
            const sprite = this.scene.add.sprite(x, y, 'particle');

            const t = Math.random();
            const color = {
                r: color1.r + (color2.r - color1.r) * t,
                g: color1.g + (color2.g - color1.g) * t,
                b: color1.b + (color2.b - color1.b) * t
            };

            sprite.setData('affectedByGravity', true);
            const control = new ParticleControl(sprite, velocity, 2800, color, this.screenWidth, this.screenHeight);
            this.particles.push(control);
        }
    }

    sprayParticle(x, y, sprayVelX, sprayVelY) {
        const sprite = this.scene.add.sprite(x, y, 'particle');
        const color = { r: 0.8, g: 0.4, b: 0.8 };
        const velocity = { x: sprayVelX, y: sprayVelY };

        sprite.setData('affectedByGravity', true);
        const control = new ParticleControl(sprite, velocity, 3500, color, this.screenWidth, this.screenHeight);
        this.particles.push(control);
    }

    blackHoleExplosion(x, y) {
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
            sprite.setData('affectedByGravity', true);
            const control = new ParticleControl(sprite, velocity, 1000, color, this.screenWidth, this.screenHeight);
            this.particles.push(control);
        }
    }

    makeExhaustFire(x, y, rotation) {
        const midColor = { r: 1, g: 0.73, b: 0.12 };
        const sideColor = { r: 0.78, g: 0.15, b: 0.04 };

        const t = (Date.now() - this.spawnTime) / 1000;
        const direction = { x: Math.cos(rotation), y: Math.sin(rotation) };

        const baseVel = { x: direction.x * -45, y: direction.y * -45 };
        const perpVel = {
            x: baseVel.y * 2 * Math.sin(t * 10),
            y: -baseVel.x * 2 * Math.sin(t * 10)
        };

        const posX = x + direction.x * -25;
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

    makeExhaustTrail(x, y, rotation, speed) {
        const direction = { x: Math.cos(rotation), y: Math.sin(rotation) };
        const trailOrigin = {
            x: x + direction.x * -20,
            y: y + direction.y * -20
        };

        const spacing = Math.max(6, this.baseTrailSpacing - speed * 0.01);

        if (!this.lastTrailPosition) {
            this.lastTrailPosition = { ...trailOrigin };
            return;
        }

        const deltaX = trailOrigin.x - this.lastTrailPosition.x;
        const deltaY = trailOrigin.y - this.lastTrailPosition.y;
        const distance = Math.hypot(deltaX, deltaY);

        if (distance < spacing) {
            return;
        }

        const steps = Math.min(6, Math.floor(distance / spacing));
        const normal = { x: deltaX / distance, y: deltaY / distance };
        const color = { r: 0.55, g: 0.82, b: 1 };

        for (let i = 1; i <= steps; i++) {
            const posX = this.lastTrailPosition.x + normal.x * spacing * i;
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

    stopExhaustTrail() {
        this.lastTrailPosition = null;
    }

    createTrailParticle(x, y, velocity, color) {
        const sprite = this.scene.add.sprite(x, y, 'glowParticle');
        const lifespan = 500 + Math.random() * 350;
        sprite.setData('affectedByGravity', false);
        const control = new ParticleControl(sprite, velocity, lifespan, color, this.screenWidth, this.screenHeight);
        this.particles.push(control);
    }

    createExhaustParticle(x, y, velocity, color, texture) {
        const sprite = this.scene.add.sprite(x, y, texture);
        sprite.setData('affectedByGravity', true);
        const control = new ParticleControl(sprite, velocity, 800, color, this.screenWidth, this.screenHeight);
        this.particles.push(control);
    }

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

    getRandomVelocity(max) {
        const angle = Math.random() * Math.PI * 2;
        const random = Math.random() * 5 + 1;
        const particleSpeed = max * (1 - 0.6 / random);

        return {
            x: Math.cos(angle) * particleSpeed,
            y: Math.sin(angle) * particleSpeed
        };
    }

    destroy() {
        this.particles.forEach(control => {
            control.sprite.destroy();
        });
        this.particles = [];
    }
}

window.ParticleManager = ParticleManager;
