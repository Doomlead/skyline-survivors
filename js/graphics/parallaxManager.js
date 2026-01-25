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
        this._lastZoom = null;
        this._lastCamWidth = null;
        this._lastCamHeight = null;
    }

    _getEffectiveDimensions(width, height) {
        const cam = this.scene.cameras?.main;
        const zoom = cam?.zoom || 1;
        return {
            width: width / zoom,
            height: height / zoom,
            zoom,
        };
    }

    createLayers() {
        const { worldWidth, worldHeight } = this.config;
        const cam = this.scene.cameras?.main;
        const camWidth = cam?.width || this.config.width;
        const camHeight = cam?.height || this.config.height;
        const effective = this._getEffectiveDimensions(camWidth, camHeight);

        for (const layerName of LAYER_ORDER) {
            const layerConfig = BACKGROUND_LAYERS[layerName];

            if (!this.scene.textures.exists(layerConfig.key)) {
                continue;
            }

            const texture = this.scene.textures.get(layerConfig.key);
            const frame = texture.getSourceImage();
            const texHeight = frame.height;

            const tileSprite = this.scene.add.tileSprite(0, 0, effective.width, texHeight, layerConfig.key);

            tileSprite.setOrigin(0, 0);
            tileSprite.setScrollFactor(0);
            tileSprite.setDepth(layerConfig.depth);

            const scaleY = effective.height / texHeight;
            tileSprite.setScale(1, scaleY);

            this.layers.push({
                sprite: tileSprite,
                speedX: layerConfig.speedX,
                scaleY,
                name: layerName,
            });
        }

        this._lastZoom = effective.zoom;
        this._lastCamWidth = camWidth;
        this._lastCamHeight = camHeight;
    }

    initTracking(playerX, playerY) {
        this._prevPlayerX = playerX;
        this._accumScrollX = 0;
        this._prevPlayerY = playerY || 0; // NEW: Init Y
        this._accumScrollY = 0;           // NEW: Init Y
    }

    update(playerX, playerY) {
        const worldWidth = this.config.worldWidth;
        const cam = this.scene.cameras?.main;
        const camWidth = cam?.width || this.config.width;
        const camHeight = cam?.height || this.config.height;
        const zoom = cam?.zoom || 1;

        if (this._lastZoom !== zoom || this._lastCamWidth !== camWidth || this._lastCamHeight !== camHeight) {
            this.resize(camWidth, camHeight);
        }
        
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
        const nextScrollY = playerY !== undefined ? playerY : this._prevPlayerY;
        this._accumScrollY = Math.max(0, nextScrollY);
        this._prevPlayerY = nextScrollY;


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
        const effective = this._getEffectiveDimensions(width, height);
        this.config.width = width;
        this.config.height = height;

        for (const layer of this.layers) {
            const texture = this.scene.textures.get(layer.sprite.texture.key);
            const frame = texture.getSourceImage();
            const texHeight = frame.height;
            const scaleY = effective.height / texHeight;

            layer.sprite.setSize(effective.width, texHeight);
            layer.sprite.setScale(1, scaleY);
            layer.scaleY = scaleY;
        }
        this._lastZoom = effective.zoom;
        this._lastCamWidth = width;
        this._lastCamHeight = height;
        this.refresh();
    }

    destroy() {
        for (const layer of this.layers) {
            layer.sprite.destroy();
        }
        this.layers = [];
    }
}
