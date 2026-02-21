// ParticleControl.js - Wrap-aware particle controller
class ParticleControl {
    constructor(sprite, velocity, lifespan, color, worldWidth, worldHeight) {
        this.sprite = sprite;
        this.velocity = velocity; // {x, y}
        this.lifespan = lifespan;
        this.color = color;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.spawnTime = Date.now();
        this.affectedByGravity = sprite.getData('affectedByGravity') || false;
        
        // Store canonical X position (always 0 to worldWidth)
        this.canonicalX = sprite.x;
    }

    // Wrap value to 0-worldWidth range
    wrapX(x) {
        x = x % this.worldWidth;
        if (x < 0) x += this.worldWidth;
        return x;
    }

    /**
     * Handles the update routine and encapsulates its core gameplay logic.
     * Parameters: delta, cameraScrollX, cameraWidth.
     * Returns: value defined by the surrounding game flow.
     */
    update(delta, cameraScrollX, cameraWidth) {
        const tpf = delta / 1000; // Convert milliseconds to seconds

        // Movement - update canonical position
        this.canonicalX += this.velocity.x * tpf * 3;
        this.sprite.y += this.velocity.y * tpf * 3;

        // Wrap canonical X to world bounds
        this.canonicalX = this.wrapX(this.canonicalX);

        // Calculate render position relative to camera
        // This ensures particles are visible at wrap boundaries
        const cameraCenterX = cameraScrollX + cameraWidth / 2;
        const halfWorld = this.worldWidth / 2;
        
        let renderX = this.canonicalX;
        let delta_x = this.canonicalX - cameraCenterX;
        
        // Adjust render position if particle is on "wrong side" of wrap
        if (delta_x > halfWorld) {
            renderX = this.canonicalX - this.worldWidth;
        } else if (delta_x < -halfWorld) {
            renderX = this.canonicalX + this.worldWidth;
        }
        
        this.sprite.x = renderX;

        // Apply friction
        this.velocity.x *= (1 - 3 * tpf);
        this.velocity.y *= (1 - 3 * tpf);

        if (Math.abs(this.velocity.x) + Math.abs(this.velocity.y) < 0.001) {
            this.velocity.x = 0;
            this.velocity.y = 0;
        }

        // Bounce off vertical screen edges (Y axis - no wrapping)
        if (this.sprite.y < 0) {
            this.velocity.y = Math.abs(this.velocity.y);
        } else if (this.sprite.y > this.worldHeight) {
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

        // Set depth to render above backgrounds
        this.sprite.setDepth(FG_DEPTH_BASE + 20);

        // Check if particle has expired
        if (difTime > this.lifespan) {
            this.sprite.destroy();
            return false; // Signal that particle should be removed
        }

        return true; // Particle still alive
    }

    /**
     * Handles the applyGravity routine and encapsulates its core gameplay logic.
     * Parameters: gravityPoint, distance.
     * Returns: value defined by the surrounding game flow.
     */
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

    /**
     * Handles the lesserValue routine and encapsulates its core gameplay logic.
     * Parameters: a, b.
     * Returns: value defined by the surrounding game flow.
     */
    lesserValue(a, b) {
        return a < b ? a : b;
    }
}

window.ParticleControl = ParticleControl;
