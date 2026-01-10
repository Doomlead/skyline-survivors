//backgroundGeneratorMothershipInterior.js

var BackgroundGeneratorMothershipInterior = (function() {
    function BackgroundGeneratorMothershipInterior(scene, config) {
        this.scene = scene;
        this.config = config;
    }

    BackgroundGeneratorMothershipInterior.prototype.createRNG = BackgroundGenerator.prototype.createRNG;

    BackgroundGeneratorMothershipInterior.prototype.generateAllTextures = function() {
        this.generateCorridorBack();
        this.generateInfrastructure();
    };

    BackgroundGeneratorMothershipInterior.prototype.generateInfrastructure = function() {
        var textureWidth = 2048;
        var textureHeight = 600;
        var graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
        var random = this.createRNG(this.config.backgroundSeed + 5);
        var groundY = textureHeight - 80;
        var ceilingY = 80;

        // Ceiling and Floor architecture
        graphics.fillStyle(0x2d3436, 1);
        graphics.fillRect(0, groundY, textureWidth, 80); // Floor
        graphics.fillRect(0, 0, textureWidth, ceilingY); // Ceiling

        // Vertical Bulkheads and Platforms
        for (var i = 0; i < 12; i++) {
            var bx = (i * (textureWidth / 12)) + (random() * 50);
            
            // Bulkhead (Vertical support)
            graphics.fillStyle(0x0984e3, 0.3);
            graphics.fillRect(bx, 0, 40, textureHeight);

            // Foot Combat Platform
            if (random() > 0.4) {
                var platY = groundY - 100 - (random() * 150);
                graphics.fillStyle(0x636e72, 1);
                graphics.fillRect(bx - 20, platY, 150, 15);
                
                // Tech detail on platform
                graphics.fillStyle(0x00cec9, 0.6);
                graphics.fillRect(bx - 10, platY + 5, 20, 5);
            }
        }

        // Alien Cables / Pipes
        graphics.lineStyle(4, 0x000000, 0.8);
        for (var p = 0; p < 8; p++) {
            var py = 100 + (p * 50);
            graphics.beginPath();
            graphics.moveTo(0, py);
            graphics.lineTo(textureWidth, py + (random() * 20 - 10));
            graphics.strokePath();
        }

        graphics.generateTexture('ms_int_infra', textureWidth, textureHeight);
    };

    BackgroundGeneratorMothershipInterior.prototype.generateCorridorBack = function() {
        // Implementation for deep corridor haze and energy cores
        var textureWidth = 2048;
        var textureHeight = 600;
        var graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
        var random = this.createRNG(this.config.backgroundSeed + 6);

        graphics.fillStyle(0x000000, 1);
        graphics.fillRect(0, 0, textureWidth, textureHeight);

        // Distant glowing cores
        for (var c = 0; c < 5; c++) {
            graphics.fillStyle(0xd63031, 0.2);
            graphics.fillCircle(random() * textureWidth, textureHeight / 2, 150);
        }

        graphics.generateTexture('ms_int_back', textureWidth, textureHeight);
    };

    return BackgroundGeneratorMothershipInterior;
})();