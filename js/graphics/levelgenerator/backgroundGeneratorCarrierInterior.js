// ═══════════════════════════════════════════════════════════════════════════
// js/graphics/levelgenerator/backgroundGeneratorCarrierInterior.js
// ═══════════════════════════════════════════════════════════════════════════

var BackgroundGeneratorCarrierInterior = (function() {
    function BackgroundGeneratorCarrierInterior(scene, config) {
        BackgroundGeneratorMothershipInterior.call(this, scene, config);
    }

    BackgroundGeneratorCarrierInterior.prototype = Object.create(BackgroundGeneratorMothershipInterior.prototype);
    BackgroundGeneratorCarrierInterior.prototype.constructor = BackgroundGeneratorCarrierInterior;

    BackgroundGeneratorCarrierInterior.prototype.generateCorridorBack = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;

        graphics.fillStyle(0x081310, 1);
        graphics.fillRect(0, 0, textureWidth, worldHeight);

        for (var i = 0; i < 14; i++) {
            var bayY = 60 + i * (worldHeight / 14);
            graphics.fillStyle(0x103229, 0.4);
            graphics.fillRect(0, bayY, textureWidth, 8);
        }

        for (var l = 0; l < 30; l++) {
            var lx = random() * textureWidth;
            var ly = worldHeight * 0.22 + random() * (worldHeight * 0.58);
            graphics.fillStyle(0x34d399, 0.2 + random() * 0.2);
            graphics.fillCircle(lx, ly, 2 + random() * 5);
        }
    };

    BackgroundGeneratorCarrierInterior.prototype.generateInfrastructure = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var groundY = worldHeight - 100;

        var floorNoise = this.generateLoopingNoise(textureWidth, 44, 7, 0.9);

        graphics.fillStyle(0x123226, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        for (var i = 0; i < floorNoise.length; i++) {
            var x = i * 44;
            if (x > textureWidth) break;
            graphics.lineTo(x, groundY - floorNoise[i]);
        }
        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        for (var d = 0; d < 14; d++) {
            var dockX = random() * (textureWidth - 120);
            var dockY = 120 + random() * (groundY - 220);
            graphics.fillStyle(0x164e3f, 0.75);
            graphics.fillRect(dockX, dockY, 110, 28);
            graphics.fillStyle(0x34d399, 0.28);
            graphics.fillRect(dockX + 6, dockY + 6, 98, 4);
            graphics.fillStyle(0x6ee7b7, 0.14);
            graphics.fillRect(dockX + 10, dockY + 16, 90, 6);
        }

        graphics.fillStyle(0x0e241d, 0.95);
        graphics.fillRect(0, 0, textureWidth, 86);

        for (var c = 0; c < 16; c++) {
            var cx = random() * textureWidth;
            var len = 30 + random() * 90;
            graphics.fillStyle(0x14532d, 0.9);
            graphics.fillRect(cx - 4, 86, 8, len);
            graphics.fillStyle(0x6ee7b7, 0.2);
            graphics.fillRect(cx - 2, 90, 4, len - 8);
        }

        graphics.lineStyle(2, 0x34d399, 0.24);
        for (var x2 = 0; x2 < textureWidth; x2 += 96) {
            graphics.beginPath();
            graphics.moveTo(x2, groundY - 8);
            graphics.lineTo(x2 + 24, groundY - 5);
            graphics.lineTo(x2 + 46, groundY - 9);
            graphics.lineTo(x2 + 68, groundY - 6);
            graphics.strokePath();
        }
        graphics.lineStyle(0);
    };

    return BackgroundGeneratorCarrierInterior;
})();
