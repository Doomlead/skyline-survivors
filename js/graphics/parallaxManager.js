// ═══════════════════════════════════════════════════════════════════════════
// parralaxManager.js - Manages TileSprite layers and seamless scrolling using accumulated offsets
// ═══════════════════════════════════════════════════════════════════════════

class ParallaxManager {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.layers = [];
        this._prevPlayerX = 0;
        this._prevPlayerY = 0;
        this._accumScrollX = 0;
        this._accumScrollY = 0;
    }

    /**
     * Handles the createLayers routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    createLayers() {
        const { worldWidth, worldHeight } = this.config;
        
        // Use the ACTUAL current camera/canvas dimensions, not the config snapshot
        const cam = this.scene.cameras ? this.scene.cameras.main : null;
        const camWidth = cam ? cam.width : (this.config.width || 800);
        const camHeight = cam ? cam.height : (this.config.height || 500);

        for (const layerName of LAYER_ORDER) {
            const layerConfig = BACKGROUND_LAYERS[layerName];

            if (!this.scene.textures.exists(layerConfig.key)) {
                continue;
            }

            const texture = this.scene.textures.get(layerConfig.key);
            const frame = texture.getSourceImage();
            const texHeight = frame.height;

            // Use current camera dimensions for the TileSprite size
            const tileSprite = this.scene.add.tileSprite(0, 0, camWidth, texHeight, layerConfig.key);

            tileSprite.setOrigin(0, 0);
            tileSprite.setScrollFactor(0);
            tileSprite.setDepth(layerConfig.depth);

            const scaleY = camHeight / texHeight;
            tileSprite.setScale(1, scaleY);

            this.layers.push({
                sprite: tileSprite,
                speedX: layerConfig.speedX,
                scaleY,
                name: layerName,
            });
        }
        
        // Update config to reflect what we actually used
        this.config.width = camWidth;
        this.config.height = camHeight;
    }

    /**
     * Handles the initTracking routine and encapsulates its core gameplay logic.
     * Parameters: playerX, playerY.
     * Returns: value defined by the surrounding game flow.
     */
    initTracking(playerX, playerY) {
        this._prevPlayerX = playerX;
        this._accumScrollX = 0;
        this._prevPlayerY = playerY || 0;
        this._accumScrollY = 0;
    }

    /**
     * Handles the update routine and encapsulates its core gameplay logic.
     * Parameters: playerX, playerY.
     * Returns: value defined by the surrounding game flow.
     */
    update(playerX, playerY) {
        const worldWidth = this.config.worldWidth;
        
        // --- Horizontal Logic ---
        let dx = playerX - this._prevPlayerX;
        const halfWorld = worldWidth * 0.5;
        if (dx > halfWorld) {
            dx -= worldWidth;
        } else if (dx < -halfWorld) {
            dx += worldWidth;
        }

        this._accumScrollX += dx;
        this._prevPlayerX = playerX;

        // --- Vertical Logic ---
        const nextScrollY = playerY !== undefined ? playerY : this._prevPlayerY;
        this._accumScrollY = Math.max(0, nextScrollY);
        this._prevPlayerY = nextScrollY;

        for (const layer of this.layers) {
            layer.sprite.tilePositionX = this._accumScrollX * layer.speedX;
            layer.sprite.tilePositionY = this._accumScrollY / (layer.scaleY || 1);
        }
    }

    /**
     * Handles the refresh routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    refresh() {
        for (const layer of this.layers) {
            layer.sprite.tilePositionX = this._accumScrollX * layer.speedX;
            layer.sprite.tilePositionY = this._accumScrollY / (layer.scaleY || 1);
        }
    }

    /**
     * Handles the resize routine and encapsulates its core gameplay logic.
     * Parameters: width, height.
     * Returns: value defined by the surrounding game flow.
     */
    resize(width, height) {
        this.config.width = width;
        this.config.height = height;

        for (const layer of this.layers) {
            const texture = this.scene.textures.get(layer.sprite.texture.key);
            const frame = texture.getSourceImage();
            const texHeight = frame.height;
            const scaleY = height / texHeight;

            layer.sprite.setSize(width, texHeight);
            layer.sprite.setScale(1, scaleY);
            layer.scaleY = scaleY;
        }
        this.refresh();
    }

    /**
     * Handles the destroy routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    destroy() {
        for (const layer of this.layers) {
            layer.sprite.destroy();
        }
        this.layers = [];
    }
}
