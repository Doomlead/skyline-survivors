(function registerGlobeBackdrop(global) {
    function createStars(scene) {
        if (!scene.textures.exists('build-star')) {
            const graphics = scene.add.graphics();
            graphics.fillStyle(0xffffff, 1);
            graphics.fillCircle(2, 2, 2);
            graphics.generateTexture('build-star', 4, 4);
            graphics.destroy();
        }

        scene.add.particles(0, 0, 'build-star', {
            x: { min: 0, max: scene.scale.width },
            y: { min: 0, max: scene.scale.height },
            quantity: 2,
            speedY: 6,
            lifespan: 6000,
            alpha: { start: 0.7, end: 0 },
            scale: { start: 0.8, end: 0.4 },
            blendMode: 'ADD'
        });
    }

    function createBackdrop(scene, width, height) {
        const backdropGrid = scene.add.graphics();
        backdropGrid.lineStyle(1, 0x102a3f, 0.4);
        const spacing = 60;
        for (let x = 0; x < width * 2; x += spacing) {
            backdropGrid.lineBetween(x, 0, x, height * 2);
        }
        for (let y = 0; y < height * 2; y += spacing) {
            backdropGrid.lineBetween(0, y, width * 2, y);
        }

        const backdropGlow = scene.add.circle(width / 2, height / 2 + 20, 180, 0x0b2a3b, 0.25);
        backdropGlow.setBlendMode(Phaser.BlendModes.ADD);

        return { backdropGrid, backdropGlow };
    }

    function refreshBackdrop(scene, width, height, backdropGrid, backdropGlow) {
        if (backdropGrid) backdropGrid.destroy();
        if (backdropGlow) backdropGlow.destroy();
        return createBackdrop(scene, width, height);
    }

    global.GlobeBackdrop = {
        createBackdrop,
        createStars,
        refreshBackdrop
    };
})(window);
