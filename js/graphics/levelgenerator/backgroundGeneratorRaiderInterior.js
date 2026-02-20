// ═══════════════════════════════════════════════════════════════════════════
// js/graphics/levelgenerator/backgroundGeneratorRaiderInterior.js
// ═══════════════════════════════════════════════════════════════════════════

var BackgroundGeneratorRaiderInterior = (function() {
    function BackgroundGeneratorRaiderInterior(scene, config) {
        BackgroundGeneratorMothershipInterior.call(this, scene, config);
    }

    BackgroundGeneratorRaiderInterior.prototype = Object.create(BackgroundGeneratorMothershipInterior.prototype);
    BackgroundGeneratorRaiderInterior.prototype.constructor = BackgroundGeneratorRaiderInterior;

    BackgroundGeneratorRaiderInterior.prototype.generateCorridorBack = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;

        graphics.fillStyle(0x140909, 1);
        graphics.fillRect(0, 0, textureWidth, worldHeight);

        graphics.lineStyle(2, 0x2a1210, 0.45);
        var vanishX = textureWidth * 0.55;
        var vanishY = worldHeight * 0.45;

        for (var i = 0; i < 12; i++) {
            var y = i * (worldHeight / 12);
            graphics.beginPath();
            graphics.moveTo(0, y);
            graphics.lineTo(vanishX, vanishY);
            graphics.lineTo(textureWidth, y);
            graphics.strokePath();
        }
        graphics.lineStyle(0);

        for (var l = 0; l < 26; l++) {
            var lx = random() * textureWidth;
            var ly = worldHeight * 0.3 + random() * (worldHeight * 0.45);
            graphics.fillStyle(0xff6b35, 0.15 + random() * 0.2);
            graphics.fillCircle(lx, ly, 2 + random() * 4);
        }
    };

    BackgroundGeneratorRaiderInterior.prototype.generateInfrastructure = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var groundY = worldHeight - 100;

        var floorNoise = this.generateLoopingNoise(textureWidth, 36, 10, 1.5);

        graphics.fillStyle(0x2c1715, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        for (var i = 0; i < floorNoise.length; i++) {
            var x = i * 36;
            if (x > textureWidth) break;
            graphics.lineTo(x, groundY - floorNoise[i]);
        }
        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        for (var r = 0; r < 40; r++) {
            var rx = random() * textureWidth;
            var ry = 90 + random() * (groundY - 160);
            var rw = 35 + random() * 70;
            var rh = 8 + random() * 18;
            graphics.fillStyle(0x3f1f1a, 0.45);
            graphics.fillRect(rx, ry, rw, rh);
            graphics.fillStyle(0xff6b35, 0.15);
            graphics.fillRect(rx + 2, ry + 2, rw - 4, 2);
        }

        graphics.fillStyle(0x25100f, 0.9);
        graphics.fillRect(0, 0, textureWidth, 78);

        for (var c = 0; c < 18; c++) {
            var cx = random() * textureWidth;
            var len = 20 + random() * 95;
            graphics.fillStyle(0x4a211a, 0.9);
            graphics.fillRect(cx - 3, 78, 6, len);
            graphics.fillStyle(0xff6b35, 0.25);
            graphics.fillRect(cx - 1, 84, 2, len - 10);
        }

        graphics.lineStyle(3, 0xff6b35, 0.2);
        for (var x2 = 0; x2 < textureWidth; x2 += 85) {
            var px = x2 + random() * 20;
            graphics.beginPath();
            graphics.moveTo(px, groundY - 4);
            graphics.lineTo(px + 16, groundY - 1);
            graphics.lineTo(px + 30, groundY - 5);
            graphics.lineTo(px + 45, groundY - 2);
            graphics.strokePath();
        }
        graphics.lineStyle(0);
    };

    return BackgroundGeneratorRaiderInterior;
})();
