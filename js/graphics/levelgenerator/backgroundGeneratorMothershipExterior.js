//backgroundGeneratorMothershipExterior.js

var BackgroundGeneratorMothershipExterior = (function() {
    function BackgroundGeneratorMothershipExterior(scene, config) {
        this.scene = scene;
        this.config = config;
        this.generatedTextures = new Map();
    }

    // Reuse the RNG and Noise functions from backgroundGenerator.js pattern
    BackgroundGeneratorMothershipExterior.prototype.createRNG = BackgroundGenerator.prototype.createRNG;
    BackgroundGeneratorMothershipExterior.prototype.generateLoopingNoise = BackgroundGenerator.prototype.generateLoopingNoise;

    BackgroundGeneratorMothershipExterior.prototype.generateAllTextures = function() {
        this.generateDeepHullLayer();
        this.generateActiveHullLayer();
        this.generateGreebleLayer();
    };

    BackgroundGeneratorMothershipExterior.prototype.generateDeepHullLayer = function() {
        var textureWidth = 2048;
        var textureHeight = 600;
        var graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
        var random = this.createRNG(this.config.backgroundSeed);

        // Dark biomechanical plates
        graphics.fillStyle(0x1a1a2e, 1);
        graphics.fillRect(0, 0, textureWidth, textureHeight);

        for (var i = 0; i < 20; i++) {
            var x = random() * textureWidth;
            var y = random() * textureHeight;
            graphics.fillStyle(0x16213e, 0.5);
            graphics.fillRect(x, y, 400 * random(), 300 * random());
        }

        graphics.generateTexture('ms_ext_deep', textureWidth, textureHeight);
    };

    BackgroundGeneratorMothershipExterior.prototype.generateActiveHullLayer = function() {
        var textureWidth = 2048;
        var textureHeight = 600;
        var graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
        var random = this.createRNG(this.config.backgroundSeed + 1);

        // Energy Vents
        for (var i = 0; i < 15; i++) {
            var vx = random() * textureWidth;
            var vy = random() * textureHeight;
            graphics.fillStyle(0x00fff2, 0.2); // Cyan energy glow
            graphics.fillEllipse(vx, vy, 100, 40);
            graphics.fillStyle(0xffffff, 0.8);
            graphics.fillRect(vx - 20, vy - 2, 40, 4);
        }

        graphics.generateTexture('ms_ext_active', textureWidth, textureHeight);
    };

    BackgroundGeneratorMothershipExterior.prototype.generateGreebleLayer = function() {
        var textureWidth = 2048;
        var textureHeight = 600;
        var graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
        var random = this.createRNG(this.config.backgroundSeed + 2);

        // Tiny mechanical details (Greebles)
        for (var i = 0; i < 200; i++) {
            graphics.fillStyle(0x4e4e6a, random());
            graphics.fillRect(random() * textureWidth, random() * textureHeight, 4, 12);
            graphics.fillRect(random() * textureWidth, random() * textureHeight, 10, 4);
        }

        graphics.generateTexture('ms_ext_greeble', textureWidth, textureHeight);
    };

    return BackgroundGeneratorMothershipExterior;
})();