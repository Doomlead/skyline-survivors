// ═══════════════════════════════════════════════════════════════════════════
// js/graphics/levelgenerator/backgroundGeneratorNovaInterior.js
// ═══════════════════════════════════════════════════════════════════════════

var BackgroundGeneratorNovaInterior = (function() {
    function BackgroundGeneratorNovaInterior(scene, config) {
        BackgroundGeneratorMothershipInterior.call(this, scene, config);
    }

    BackgroundGeneratorNovaInterior.prototype = Object.create(BackgroundGeneratorMothershipInterior.prototype);
    BackgroundGeneratorNovaInterior.prototype.constructor = BackgroundGeneratorNovaInterior;

    BackgroundGeneratorNovaInterior.prototype.generateCorridorBack = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;

        graphics.fillStyle(0x0b0d24, 1);
        graphics.fillRect(0, 0, textureWidth, worldHeight);

        var centerY = worldHeight * 0.5;
        for (var b = 0; b < 10; b++) {
            var alpha = 0.05 + b * 0.015;
            graphics.fillStyle(0x4338ca, alpha);
            graphics.fillEllipse(textureWidth * 0.5, centerY, textureWidth * (0.8 - b * 0.06), worldHeight * (0.75 - b * 0.05));
        }

        for (var l = 0; l < 28; l++) {
            var lx = random() * textureWidth;
            var ly = worldHeight * 0.2 + random() * (worldHeight * 0.6);
            graphics.fillStyle(0x60a5fa, 0.2 + random() * 0.3);
            graphics.fillCircle(lx, ly, 2 + random() * 4);
        }
    };

    BackgroundGeneratorNovaInterior.prototype.generateInfrastructure = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var groundY = worldHeight - 100;

        var floorNoise = this.generateLoopingNoise(textureWidth, 38, 9, 2.3);

        graphics.fillStyle(0x1a1f4a, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        for (var i = 0; i < floorNoise.length; i++) {
            var x = i * 38;
            if (x > textureWidth) break;
            graphics.lineTo(x, groundY - floorNoise[i]);
        }
        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        for (var p = 0; p < 26; p++) {
            var px = random() * textureWidth;
            var py = 100 + random() * (groundY - 220);
            var r = 12 + random() * 26;
            graphics.fillStyle(0x312e81, 0.45);
            graphics.fillCircle(px, py, r);
            graphics.fillStyle(0x60a5fa, 0.18);
            graphics.fillCircle(px, py, r * 0.45);
        }

        graphics.fillStyle(0x15183d, 0.95);
        graphics.fillRect(0, 0, textureWidth, 84);

        for (var c = 0; c < 18; c++) {
            var cx = random() * textureWidth;
            var len = 28 + random() * 100;
            graphics.fillStyle(0x1d4ed8, 0.7);
            graphics.fillRect(cx - 3, 84, 6, len);
            graphics.fillStyle(0x93c5fd, 0.22);
            graphics.fillRect(cx - 1, 90, 2, len - 12);
        }

        graphics.lineStyle(3, 0x60a5fa, 0.23);
        for (var x2 = 0; x2 < textureWidth; x2 += 90) {
            var wave = Math.sin(x2 * 0.02) * 5;
            graphics.beginPath();
            graphics.moveTo(x2, groundY - 6 + wave);
            graphics.lineTo(x2 + 20, groundY - 2 - wave);
            graphics.lineTo(x2 + 40, groundY - 7 + wave);
            graphics.lineTo(x2 + 60, groundY - 3 - wave);
            graphics.strokePath();
        }
        graphics.lineStyle(0);
    };

    return BackgroundGeneratorNovaInterior;
})();
