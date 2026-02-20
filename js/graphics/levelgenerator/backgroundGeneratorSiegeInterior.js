// ═══════════════════════════════════════════════════════════════════════════
// js/graphics/levelgenerator/backgroundGeneratorSiegeInterior.js
// ═══════════════════════════════════════════════════════════════════════════

var BackgroundGeneratorSiegeInterior = (function() {
    function BackgroundGeneratorSiegeInterior(scene, config) {
        BackgroundGeneratorMothershipInterior.call(this, scene, config);
    }

    BackgroundGeneratorSiegeInterior.prototype = Object.create(BackgroundGeneratorMothershipInterior.prototype);
    BackgroundGeneratorSiegeInterior.prototype.constructor = BackgroundGeneratorSiegeInterior;

    BackgroundGeneratorSiegeInterior.prototype.generateCorridorBack = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;

        graphics.fillStyle(0x121212, 1);
        graphics.fillRect(0, 0, textureWidth, worldHeight);

        for (var i = 0; i < 12; i++) {
            var x = i * (textureWidth / 12);
            graphics.fillStyle(0x2a2a2a, 0.45);
            graphics.fillRect(x, 0, 12, worldHeight);
        }

        for (var l = 0; l < 24; l++) {
            var lx = random() * textureWidth;
            var ly = worldHeight * 0.3 + random() * (worldHeight * 0.5);
            graphics.fillStyle(0xf59e0b, 0.18 + random() * 0.2);
            graphics.fillRect(lx, ly, 8 + random() * 16, 2 + random() * 3);
        }
    };

    BackgroundGeneratorSiegeInterior.prototype.generateInfrastructure = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var groundY = worldHeight - 100;

        var floorNoise = this.generateLoopingNoise(textureWidth, 42, 6, 0.7);

        graphics.fillStyle(0x252525, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        for (var i = 0; i < floorNoise.length; i++) {
            var x = i * 42;
            if (x > textureWidth) break;
            graphics.lineTo(x, groundY - floorNoise[i]);
        }
        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        for (var w = 0; w < 16; w++) {
            var wx = random() * textureWidth;
            var wy = 90 + random() * (groundY - 180);
            var ww = 24 + random() * 42;
            var wh = 80 + random() * 150;
            graphics.fillStyle(0x3f3f46, 0.75);
            graphics.fillRect(wx, wy, ww, wh);
            graphics.fillStyle(0xf59e0b, 0.18);
            graphics.fillRect(wx + 2, wy + 6, ww - 4, 3);
        }

        graphics.fillStyle(0x1c1c1c, 0.95);
        graphics.fillRect(0, 0, textureWidth, 88);

        for (var c = 0; c < 14; c++) {
            var cx = random() * textureWidth;
            var len = 40 + random() * 95;
            graphics.fillStyle(0x52525b, 0.95);
            graphics.fillRect(cx - 5, 88, 10, len);
            graphics.fillStyle(0xf59e0b, 0.12);
            graphics.fillRect(cx - 1, 94, 2, len - 12);
        }

        graphics.lineStyle(2, 0xf59e0b, 0.22);
        for (var x2 = 0; x2 < textureWidth; x2 += 100) {
            graphics.beginPath();
            graphics.moveTo(x2, groundY - 7);
            graphics.lineTo(x2 + 20, groundY - 3);
            graphics.lineTo(x2 + 40, groundY - 7);
            graphics.lineTo(x2 + 60, groundY - 3);
            graphics.lineTo(x2 + 80, groundY - 7);
            graphics.strokePath();
        }
        graphics.lineStyle(0);
    };

    return BackgroundGeneratorSiegeInterior;
})();
