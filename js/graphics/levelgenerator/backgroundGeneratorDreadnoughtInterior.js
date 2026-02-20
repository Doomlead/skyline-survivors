// ═══════════════════════════════════════════════════════════════════════════
// js/graphics/levelgenerator/backgroundGeneratorDreadnoughtInterior.js
// ═══════════════════════════════════════════════════════════════════════════

var BackgroundGeneratorDreadnoughtInterior = (function() {
    function BackgroundGeneratorDreadnoughtInterior(scene, config) {
        BackgroundGeneratorMothershipInterior.call(this, scene, config);
    }

    BackgroundGeneratorDreadnoughtInterior.prototype = Object.create(BackgroundGeneratorMothershipInterior.prototype);
    BackgroundGeneratorDreadnoughtInterior.prototype.constructor = BackgroundGeneratorDreadnoughtInterior;

    BackgroundGeneratorDreadnoughtInterior.prototype.generateCorridorBack = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;

        graphics.fillStyle(0x090909, 1);
        graphics.fillRect(0, 0, textureWidth, worldHeight);

        var vanishX = textureWidth * 0.5;
        var vanishY = worldHeight * 0.5;
        graphics.lineStyle(3, 0x1f1f1f, 0.55);
        for (var i = 0; i < 16; i++) {
            var y = i * (worldHeight / 16);
            graphics.beginPath();
            graphics.moveTo(0, y);
            graphics.lineTo(vanishX, vanishY);
            graphics.lineTo(textureWidth, y);
            graphics.strokePath();
        }
        graphics.lineStyle(0);

        for (var l = 0; l < 32; l++) {
            var lx = random() * textureWidth;
            var ly = worldHeight * 0.24 + random() * (worldHeight * 0.58);
            var tone = random() > 0.5 ? 0x22d3ee : 0xef4444;
            graphics.fillStyle(tone, 0.17 + random() * 0.2);
            graphics.fillCircle(lx, ly, 2 + random() * 4);
        }
    };

    BackgroundGeneratorDreadnoughtInterior.prototype.generateInfrastructure = function(graphics, random, dims) {
        var textureWidth = dims ? dims.width : this.config.worldWidth;
        var worldHeight = dims ? dims.height : this.config.worldHeight;
        var groundY = worldHeight - 100;

        var floorNoise = this.generateLoopingNoise(textureWidth, 34, 11, 1.8);

        graphics.fillStyle(0x191919, 1);
        graphics.beginPath();
        graphics.moveTo(0, worldHeight);
        for (var i = 0; i < floorNoise.length; i++) {
            var x = i * 34;
            if (x > textureWidth) break;
            graphics.lineTo(x, groundY - floorNoise[i]);
        }
        graphics.lineTo(textureWidth, worldHeight);
        graphics.closePath();
        graphics.fillPath();

        for (var b = 0; b < 20; b++) {
            var bx = random() * textureWidth;
            var by = 90 + random() * (groundY - 200);
            var bw = 26 + random() * 60;
            var bh = 30 + random() * 90;
            graphics.fillStyle(0x262626, 0.95);
            graphics.fillRect(bx, by, bw, bh);
            graphics.fillStyle(0x525252, 0.55);
            graphics.fillRect(bx + 4, by + 6, bw - 8, bh - 12);
        }

        graphics.fillStyle(0x111111, 0.95);
        graphics.fillRect(0, 0, textureWidth, 90);

        for (var c = 0; c < 22; c++) {
            var cx = random() * textureWidth;
            var len = 26 + random() * 120;
            graphics.fillStyle(0x3f3f46, 0.95);
            graphics.fillRect(cx - 4, 90, 8, len);
            var coreColor = random() > 0.5 ? 0x22d3ee : 0xef4444;
            graphics.fillStyle(coreColor, 0.2);
            graphics.fillRect(cx - 1, 95, 2, len - 14);
        }

        graphics.lineStyle(3, 0x22d3ee, 0.14);
        for (var x2 = 0; x2 < textureWidth; x2 += 80) {
            var px = x2 + random() * 18;
            graphics.beginPath();
            graphics.moveTo(px, groundY - 4);
            for (var s = 0; s < 6; s++) {
                graphics.lineTo(px + s * 12, groundY - 4 + Math.sin(s * 1.3) * 3);
            }
            graphics.strokePath();
        }
        graphics.lineStyle(0);
    };

    return BackgroundGeneratorDreadnoughtInterior;
})();
