// ------------------------
// Utility functions
// ------------------------

function wrapWorldBounds(sprite) {
    if (sprite.x < 0) sprite.x = CONFIG.worldWidth;
    else if (sprite.x > CONFIG.worldWidth) sprite.x = 0;
}


function createExplosion(scene, x, y, color = 0xffff00) {
    if (audioManager) audioManager.playSound('explosion');
    // ENHANCED: 8 particles for dramatic effect
    for (let i = 0; i < 8; i++) {
        const particle = scene.add.sprite(x, y, 'explosion');
        particle.setTint(color);
        const angle = (Math.PI * 2 / 8) * i;
        scene.tweens.add({
            targets: particle,
            x: x + Math.cos(angle) * 30,
            y: y + Math.sin(angle) * 30,
            alpha: 0,
            scale: 0.5,
            duration: 300,
            onComplete: () => particle.destroy()
        });
    }
}

function createSpawnEffect(scene, x, y, enemyType) {
    const colors = {
        'lander': 0xff4444,
        'mutant': 0xff8844,
        'drone': 0xff44ff,
        'bomber': 0xff0000,
        'pod': 0xaa00ff,
        'swarmer': 0x00ff00,
        'baiter': 0xff00ff
    };
    const color = colors[enemyType] || 0xff4444;
    // ENHANCED: 12 particles with spread patterns
    for (let i = 0; i < 12; i++) {
        const particle = scene.add.sprite(x, y, 'explosion');
        particle.setTint(color);
        particle.setScale(0.8);
        const angle = (Math.PI * 2 / 12) * i;
        const startX = x + Math.cos(angle) * 5;
        const startY = y + Math.sin(angle) * 5;
        scene.tweens.add({
            targets: particle,
            x: startX + Math.cos(angle) * 40,
            y: startY + Math.sin(angle) * 40,
            alpha: 0,
            scale: 0.2,
            duration: 400,
            ease: 'Power2.easeOut',
            onComplete: () => particle.destroy()
        });
    }
    const flash = scene.add.sprite(x, y, 'explosion');
    flash.setTint(color);
    flash.setScale(2);
    flash.setAlpha(0.7);
    scene.tweens.add({
        targets: flash,
        scale: 0.5,
        alpha: 0,
        duration: 300,
        ease: 'Power2.easeOut',
        onComplete: () => flash.destroy()
    });
}

function screenShake(scene, intensity = 10, duration = 200) {
    if (!scene.cameras || !scene.cameras.main) return;
    const camera = scene.cameras.main;
    const originalX = camera.scrollX;
    const originalY = camera.scrollY;
    camera.setScroll(
        originalX + (Math.random() - 0.5) * intensity,
        originalY + (Math.random() - 0.5) * intensity
    );
    scene.tweens.add({
        targets: camera,
        scrollX: originalX,
        scrollY: originalY,
        duration: duration,
        ease: 'Power2.easeOut'
    });
}

function createPowerUpCollectionEffect(scene, x, y, powerUpType) {
    const flash = scene.add.circle(x, y, 30, 0xffffff, 0.8);
    flash.setDepth(50);
    scene.tweens.add({
        targets: flash,
        radius: 80,
        alpha: 0,
        duration: 400,
        ease: 'Power2.easeOut',
        onComplete: () => flash.destroy()
    });
    for (let i = 0; i < 6; i++) {
        const particle = scene.add.circle(x, y, 3, 0x00ff00, 1);
        const angle = (Math.PI * 2 / 6) * i;
        scene.tweens.add({
            targets: particle,
            x: x + Math.cos(angle) * 40,
            y: y + Math.sin(angle) * 40,
            alpha: 0,
            scale: 0.2,
            duration: 500,
            delay: i * 50,
            onComplete: () => particle.destroy()
        });
    }
    const powerfulTypes = ['double', 'invincibility', 'timeSlow', 'overdrive'];
    if (powerfulTypes.includes(powerUpType)) {
        screenShake(scene, 8, 150);
    }
}

function createEnhancedDeathEffect(scene, x, y, enemyType) {
    const deathColors = {
        'lander': 0xff4444,
        'mutant': 0xff8844,
        'drone': 0xff44ff,
        'bomber': 0xff0000,
        'pod': 0xaa00ff,
        'swarmer': 0x00ff00,
        'baiter': 0xff00ff
    };
    const color = deathColors[enemyType] || 0xff4444;
    // ENHANCED: 2 expanding rings for dramatic effect
    for (let ring = 0; ring < 2; ring++) {
        setTimeout(() => {
            for (let i = 0; i < 16; i++) {
                const particle = scene.add.circle(x, y, 2 + ring, color, 1);
                const angle = (Math.PI * 2 / 16) * i;
                const distance = 60 + (ring * 20);
                scene.tweens.add({
                    targets: particle,
                    x: x + Math.cos(angle) * distance,
                    y: y + Math.sin(angle) * distance,
                    alpha: 0,
                    scale: 0.1,
                    duration: 600 + ring * 200,
                    delay: ring * 100,
                    onComplete: () => particle.destroy()
                });
            }
        }, ring * 80);
    }
    const blast = scene.add.circle(x, y, 8, color, 1);
    scene.tweens.add({
        targets: blast,
        radius: 40,
        alpha: 0,
        duration: 400,
        ease: 'Power2.easeOut',
        onComplete: () => blast.destroy()
    });
    const bossTypes = ['bomber', 'pod'];
    if (bossTypes.includes(enemyType)) {
        screenShake(scene, 12, 200);
    }
}

function getResponsiveScale() {
    const isMobile = window.innerWidth <= 900;
    const isLandscape = window.innerWidth > window.innerHeight;
    let maxWidth = window.innerWidth;
    let maxHeight = window.innerHeight;
    if (isMobile) {
        maxHeight = window.innerHeight - 140;
    }
    const baseWidth = CONFIG.width;
    const baseHeight = CONFIG.height;
    const scaleX = maxWidth / baseWidth;
    const scaleY = maxHeight / baseHeight;
    const scale = Math.min(scaleX, scaleY);
    const finalScale = isMobile && isLandscape ? scale : Math.min(scale, 1);
    return {
        width: Math.floor(baseWidth * finalScale),
        height: Math.floor(baseHeight * finalScale),
        scale: finalScale
    };
}

function getScreenPosition(scene, worldX, worldY) {
    const cam = scene.cameras.main;
    return {
        x: worldX - cam.scrollX,
        y: worldY - cam.scrollY
    };
}

function startGame(mode = 'classic') {
    gameState.mode = mode;
    if (mode === 'survival') gameState.timeRemaining = 30 * 60 * 1000;
    const menu = document.getElementById('menu-overlay');
    if (menu) menu.style.display = 'none';

    if (window.Phaser && window.game && game.scene && game.scene.scenes && game.scene.scenes.length) {
        const scene = game.scene.scenes[0];
        if (scene && scene.scene && scene.scene.isActive()) {
            resetGameState();
            scene.scene.restart();
        }
    }

    if (audioManager && audioManager.audioContext.state === 'suspended') {
        audioManager.audioContext.resume().catch(() => {});
    }
}

// Make startGame available globally
window.startGame = startGame;
