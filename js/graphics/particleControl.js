// ParticleControl.js - Phaser-equivalent particle controller
class ParticleControl {
    constructor(sprite, velocity, lifespan, color, screenWidth, screenHeight) {
        this.sprite = sprite;
        this.velocity = velocity; // {x, y}
        this.lifespan = lifespan;
        this.color = color;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.spawnTime = Date.now();
        this.affectedByGravity = sprite.getData('affectedByGravity') || false;
    }

    update(delta) {
        const tpf = delta / 1000; // Convert milliseconds to seconds

        // Movement
        this.sprite.x += this.velocity.x * tpf * 3;
        this.sprite.y += this.velocity.y * tpf * 3;

        // Apply friction
        this.velocity.x *= (1 - 3 * tpf);
        this.velocity.y *= (1 - 3 * tpf);

        if (Math.abs(this.velocity.x) + Math.abs(this.velocity.y) < 0.001) {
            this.velocity.x = 0;
            this.velocity.y = 0;
        }

        // Bounce off screen edges
        if (this.sprite.x < 0) {
            this.velocity.x = Math.abs(this.velocity.x);
        } else if (this.sprite.x > this.screenWidth) {
            this.velocity.x = -Math.abs(this.velocity.x);
        }

        if (this.sprite.y < 0) {
            this.velocity.y = Math.abs(this.velocity.y);
        } else if (this.sprite.y > this.screenHeight) {
            this.velocity.y = -Math.abs(this.velocity.y);
        }

        // Rotation to face movement direction
        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            this.sprite.rotation = Math.atan2(this.velocity.y, this.velocity.x) + Math.PI / 2;
        }

        // Scaling and alpha based on age and speed
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        const difTime = Date.now() - this.spawnTime;
        const percentLife = 1 - difTime / this.lifespan;

        let alpha = this.lesserValue(1.5, this.lesserValue(percentLife * 2, speed / 100));
        alpha *= alpha;
        this.sprite.setAlpha(alpha);

        // Set tint based on color
        const colorInt = Phaser.Display.Color.GetColor(
            this.color.r * 255,
            this.color.g * 255,
            this.color.b * 255
        );
        this.sprite.setTint(colorInt);

        const scale = 0.3 + this.lesserValue(this.lesserValue(1.5, 0.02 * speed + 0.1), alpha);
        this.sprite.setScale(scale * 0.65);

        // Check if particle has expired
        if (difTime > this.lifespan) {
            this.sprite.destroy();
            return false; // Signal that particle should be removed
        }

        return true; // Particle still alive
    }

    applyGravity(gravityPoint, distance) {
        const gravityStrength = 1000 / (distance * distance + 10000);
        this.velocity.x += gravityPoint.x * gravityStrength;
        this.velocity.y += gravityPoint.y * gravityStrength;

        // Add tangential force when close
        if (distance < 400) {
            const tangentialStrength = 3 / (distance + 100);
            this.velocity.x += gravityPoint.y * tangentialStrength;
            this.velocity.y += -gravityPoint.x * tangentialStrength;
        }
    }

    lesserValue(a, b) {
        return a < b ? a : b;
    }
}

window.ParticleControl = ParticleControl;
