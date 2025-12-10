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
}

function getResponsiveScale() {
    const isMobile = window.innerWidth <= 900;
    const isLandscape = window.innerWidth > window.innerHeight;
    const hud = document.getElementById('hud-container');
    const controls = document.getElementById('controls-text');
    const touchControls = document.getElementById('touch-controls');
    const footer = document.getElementById('footer-note');
    const buildControls = document.getElementById('build-controls');

    const getOuterHeight = (el) => {
        if (!el) return 0;
        const styles = window.getComputedStyle(el);
        const marginTop = parseFloat(styles.marginTop) || 0;
        const marginBottom = parseFloat(styles.marginBottom) || 0;
        return el.offsetHeight + marginTop + marginBottom;
    };

    const reservedHeight = getOuterHeight(hud) + getOuterHeight(controls) + getOuterHeight(buildControls) + getOuterHeight(touchControls) + getOuterHeight(footer) + 16;
    const maxWidth = Math.max(320, window.innerWidth - 24);
    let maxHeight = Math.max(180, window.innerHeight - reservedHeight);

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
    const missionPayload = window.missionPlanner ? missionPlanner.prepareLaunchPayload(mode) : null;
    resetGameState();
    gameState.mode = mode;
    applyMissionPayload(missionPayload);
    if (mode === 'survival') gameState.timeRemaining = gameState.totalSurvivalDuration;
    const menu = document.getElementById('menu-overlay');
    if (menu) menu.style.display = 'none';

    if (window.Phaser && window.game && game.scene) {
        const scene = game.scene.getScene(SCENE_KEYS.game);
        if (scene && scene.scene) {
            if (scene.scene.isActive()) {
                scene.scene.restart();
            } else {
                game.scene.start(SCENE_KEYS.game);
            }
        } else if (game.scene) {
            game.scene.start(SCENE_KEYS.game);
        }
        if (game.scene.isActive(SCENE_KEYS.build)) {
            game.scene.stop(SCENE_KEYS.build);
            const toggleBtn = document.getElementById('build-toggle');
            const returnBtn = document.getElementById('build-return');
            if (toggleBtn) toggleBtn.classList.remove('hidden');
            if (returnBtn) returnBtn.classList.add('hidden');
        }
        if (game.scene.isActive(SCENE_KEYS.menu)) {
            game.scene.stop(SCENE_KEYS.menu);
        }
    }

    if (audioManager && audioManager.audioContext.state === 'suspended') {
        audioManager.audioContext.resume().catch(() => {});
    }
}

// Make startGame available globally
window.startGame = startGame;

function applyMissionPayload(missionPayload) {
    if (!missionPayload) {
        gameState.missionContext = null;
        gameState.missionDirectives = null;
        gameState.rewardMultiplier = 1;
        gameState.spawnMultiplier = 1;
        gameState.missionDistrictState = null;
        return;
    }
    gameState.missionContext = missionPayload;
    gameState.missionDirectives = missionPayload.directives;
    gameState.missionDistrictState = missionPayload.districtState || missionPayload.directives?.districtState || null;
    gameState.rewardMultiplier = missionPayload?.directives?.rewardMultiplier || 1;
    gameState.spawnMultiplier = missionPayload?.directives?.spawnMultiplier || 1;
    if (missionPayload?.directives?.humans) {
        gameState.humans = missionPayload.directives.humans;
    }
}

function getMissionScaledReward(base) {
    return Math.round(base * (gameState.rewardMultiplier || 1));
}

function enterMainMenu() {
    const menu = document.getElementById('menu-overlay');
    if (menu) menu.style.display = 'none';

    if (window.game && game.scene) {
        if (game.scene.isActive(SCENE_KEYS.build)) {
            game.scene.stop(SCENE_KEYS.build);
        }
        if (game.scene.isActive(SCENE_KEYS.game)) {
            game.scene.stop(SCENE_KEYS.game);
        }
        game.scene.start(SCENE_KEYS.menu);
    }
}

function enterDistrictMap(options = false) {
    const overlayLaunch = typeof options === 'object' ? !!options.fromOverlay : !!options;
    const fromVictory = typeof options === 'object' ? !!options.fromVictory : false;
    const menu = document.getElementById('menu-overlay');
    if (menu) menu.style.display = 'none';

    if (window.game && game.scene) {
        const mainScene = game.scene.getScene(SCENE_KEYS.game);
        if (mainScene && mainScene.scene.isActive()) {
            if (fromVictory) {
                mainScene.scene.stop();
            } else {
                mainScene.scene.pause();
            }
        }
        if (game.scene.isActive(SCENE_KEYS.menu)) {
            game.scene.stop(SCENE_KEYS.menu);
        }
        game.scene.start(SCENE_KEYS.build);
        game.scene.bringToTop(SCENE_KEYS.build);
    }

    const toggleBtn = document.getElementById('build-toggle');
    const returnBtn = document.getElementById('build-return');
    if (overlayLaunch) {
        if (toggleBtn) toggleBtn.classList.add('hidden');
        if (returnBtn) returnBtn.classList.add('hidden');
    } else {
        if (toggleBtn) toggleBtn.classList.add('hidden');
        if (returnBtn) returnBtn.classList.remove('hidden');
    }
}

function openBuildView() {
    const menu = document.getElementById('menu-overlay');
    if (menu) menu.style.display = 'none';

    enterDistrictMap();
}

function closeBuildView() {
    if (window.game && game.scene) {
        if (game.scene.isActive(SCENE_KEYS.build)) {
            game.scene.stop(SCENE_KEYS.build);
        }
        const mainScene = game.scene.getScene(SCENE_KEYS.game);
        if (mainScene && mainScene.scene.isPaused()) {
            mainScene.scene.resume();
        }
    }

    const toggleBtn = document.getElementById('build-toggle');
    const returnBtn = document.getElementById('build-return');
    if (toggleBtn) toggleBtn.classList.remove('hidden');
    if (returnBtn) returnBtn.classList.add('hidden');
}

window.openBuildView = openBuildView;
window.closeBuildView = closeBuildView;
window.enterMainMenu = enterMainMenu;
window.enterDistrictMap = enterDistrictMap;
