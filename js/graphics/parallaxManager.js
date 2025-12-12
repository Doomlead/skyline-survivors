// Manages TileSprite layers and seamless scrolling using accumulated offsets

class ParallaxManager {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.layers = [];
        this._prevPlayerX = 0;
        this._accumScrollX = 0;
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

            const tileSprite = this.scene.add.tileSprite(0, 0, camWidth, camHeight, layerConfig.key);

            tileSprite.setOrigin(0, 0);
            tileSprite.setScrollFactor(0);

            // Keep all background layers behind gameplay objects. Gameplay sprites
            // default to depth 0, so give parallax layers a negative offset while
            // preserving their relative ordering.
            tileSprite.setDepth(-1000 + layerConfig.depth);

            const scaleY = camHeight / texHeight;
            tileSprite.setScale(1, scaleY);

            this.layers.push({
                sprite: tileSprite,
                speedX: layerConfig.speedX,
                name: layerName,
            });
        }
    }

    initTracking(playerX) {
        this._prevPlayerX = playerX;
        this._accumScrollX = 0;
    }

    update(playerX) {
        const worldWidth = this.config.worldWidth;
        let dx = playerX - this._prevPlayerX;
        const halfWorld = worldWidth * 0.5;
        if (dx > halfWorld) {
            dx -= worldWidth;
        } else if (dx < -halfWorld) {
            dx += worldWidth;
        }

        this._accumScrollX += dx;
        this._prevPlayerX = playerX;

        for (const layer of this.layers) {
            layer.sprite.tilePositionX = this._accumScrollX * layer.speedX;
        }
    }

    refresh() {
        for (const layer of this.layers) {
            layer.sprite.tilePositionX = this._accumScrollX * layer.speedX;
        }
    }

    destroy() {
        for (const layer of this.layers) {
            layer.sprite.destroy();
        }
        this.layers = [];
    }
}
