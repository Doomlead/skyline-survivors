// ═══════════════════════════════════════════════════════════════════════════
// parralaxManager.js - Manages TileSprite layers and seamless scrolling using accumulated offsets
// ═══════════════════════════════════════════════════════════════════════════

class ParallaxManager {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.layers = [];
        this._prevPlayerX = 0;
        this._prevPlayerY = 0; // NEW: Track previous Y
        this._accumScrollX = 0;
        this._accumScrollY = 0; // NEW: Accumulate Y scroll
    }

    createLayers() {
        const { worldWidth, worldHeight } = this.config;
        const camWidth = this.config.width;
        const camHeight = this.config.height;

        for (const layerName of LAYER_ORDER) {
            const layerConfig = BACKGROUND_LAYERS[layerName];

            if (!this.scene.textures.exists(layerConfig.key)) {
                continue;
            }

            const texture = this.scene.textures.get(layerConfig.key);
            const frame = texture.getSourceImage();
            const texHeight = frame.height;

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
    }

    initTracking(playerX, playerY) {
        this._prevPlayerX = playerX;
        this._accumScrollX = 0;
        this._prevPlayerY = playerY || 0; // NEW: Init Y
        this._accumScrollY = 0;           // NEW: Init Y
    }

    update(playerX, playerY) {
        const worldWidth = this.config.worldWidth;
        
        // --- Horizontal Logic (Existing) ---
        let dx = playerX - this._prevPlayerX;
        const halfWorld = worldWidth * 0.5;
        if (dx > halfWorld) {
            dx -= worldWidth;
        } else if (dx < -halfWorld) {
            dx += worldWidth;
        }

        this._accumScrollX += dx;
        this._prevPlayerX = playerX;

        // --- Vertical Logic (NEW) ---
        // We assume no vertical wrapping in this game world, so simple delta works
        let dy = (playerY !== undefined) ? (playerY - this._prevPlayerY) : 0;
        this._accumScrollY += dy;
        this._prevPlayerY = playerY;

        for (const layer of this.layers) {
            layer.sprite.tilePositionX = this._accumScrollX * layer.speedX;
            // Set speedY to 1.0 so background locks perfectly to vertical camera movement
            layer.sprite.tilePositionY = this._accumScrollY / (layer.scaleY || 1);
        }
    }

    refresh() {
        for (const layer of this.layers) {
            layer.sprite.tilePositionX = this._accumScrollX * layer.speedX;
            layer.sprite.tilePositionY = this._accumScrollY / (layer.scaleY || 1);
        }
    }

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

    destroy() {
        for (const layer of this.layers) {
            layer.sprite.destroy();
        }
        this.layers = [];
    }
}
