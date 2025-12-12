// ------------------------
// Background - Procedural textures with parallax tiling
// ------------------------

let backgroundGeneratorInstance;
let parallaxManagerInstance;
let fallbackBackgroundSprite;

function createBackground(scene) {
    const generatorConfig = {
        worldWidth: CONFIG.worldWidth,
        worldHeight: CONFIG.worldHeight,
        width: CONFIG.width,
        height: CONFIG.height,
        backgroundSeed: CONFIG.backgroundSeed || 1337,
    };

    try {
        backgroundGeneratorInstance = new BackgroundGenerator(scene, generatorConfig);
        backgroundGeneratorInstance.generateAllTextures();

        parallaxManagerInstance = new ParallaxManager(scene, generatorConfig);
        parallaxManagerInstance.createLayers();
    } catch (error) {
        console.error('Background generation failed, falling back to simple background', error);
        createSimpleFallbackBackground(scene, generatorConfig);
    }

    scene.groundLevel = generatorConfig.worldHeight - 80;
}

function initParallaxTracking(playerX) {
    if (parallaxManagerInstance) {
        parallaxManagerInstance.initTracking(playerX);
    }
}

function updateParallax(playerX) {
    if (parallaxManagerInstance) {
        parallaxManagerInstance.update(playerX);
    }
}

function destroyParallax() {
    if (parallaxManagerInstance) {
        parallaxManagerInstance.destroy();
        parallaxManagerInstance = null;
    }
    backgroundGeneratorInstance = null;

    if (fallbackBackgroundSprite) {
        fallbackBackgroundSprite.destroy();
        fallbackBackgroundSprite = null;
    }
}

function createSimpleFallbackBackground(scene, generatorConfig) {
    if (fallbackBackgroundSprite) return;

    const graphics = scene.add.graphics();
    const { width, height } = generatorConfig;

    const topColor = Phaser.Display.Color.GetColor(5, 8, 30);
    const bottomColor = Phaser.Display.Color.GetColor(40, 24, 12);

    const bands = 8;
    const bandHeight = height / bands;

    for (let i = 0; i < bands; i++) {
        const t = i / (bands - 1);
        const r = Phaser.Math.Linear(Phaser.Display.Color.GetRed(topColor), Phaser.Display.Color.GetRed(bottomColor), t);
        const g = Phaser.Math.Linear(Phaser.Display.Color.GetGreen(topColor), Phaser.Display.Color.GetGreen(bottomColor), t);
        const b = Phaser.Math.Linear(Phaser.Display.Color.GetBlue(topColor), Phaser.Display.Color.GetBlue(bottomColor), t);
        graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
        graphics.fillRect(0, i * bandHeight, width, bandHeight + 1);
    }

    const key = 'bg_fallback';
    graphics.generateTexture(key, width, height);
    graphics.destroy();

    fallbackBackgroundSprite = scene.add.image(0, 0, key);
    fallbackBackgroundSprite.setOrigin(0, 0);
    fallbackBackgroundSprite.setScrollFactor(0);
    fallbackBackgroundSprite.setDepth(-10);
}
