// ------------------------
// Main game scene and initialization
// ------------------------

function initializeGame(scene) {
    for (let i = 0; i < gameState.humans; i++) {
        spawnHuman(scene, Math.random() * (CONFIG.worldWidth - 200) + 100);
    }
    if (!gameState.bossQueue || gameState.bossQueue.length === 0) {
        initializeBossQueue();
    }
    if (gameState.mode === 'survival') {
        gameState.timeRemaining = gameState.timeRemaining || gameState.totalSurvivalDuration;
    } else {
        gameState.wave = gameState.wave || 1;
        const spawnScale = gameState.spawnMultiplier || 1;
        gameState.enemiesToKillThisWave = Math.max(5, Math.round((20 + (gameState.wave - 1) * 5) * spawnScale));
    }
    if (gameState.mode === 'classic') {
        spawnEnemyWave(scene);
    }
    updateUI();
}

function preload() {
    createGraphics(this);
}

function setupWrapCamera(scene) {
    const mainCam = scene.cameras.main;

    if (wrapCamera) {
        wrapCamera.left?.destroy();
        wrapCamera.right?.destroy();
    }

    const createWrapCam = () => {
        const cam = scene.cameras.add(0, 0, mainCam.width, mainCam.height);
        cam.setZoom(mainCam.zoom);
        cam.setBackgroundColor('rgba(0,0,0,0)');
        cam.setVisible(false);
        return cam;
    };

    wrapCamera = {
        left: createWrapCam(),
        right: createWrapCam()
    };
}

function updateWrapCamera(scene) {
    if (!wrapCamera) return;

    const mainCam = scene.cameras.main;
    const worldWidth = CONFIG.worldWidth;
    const camWidth = mainCam.width;
    const camHeight = mainCam.height;
    const scrollX = mainCam.scrollX;

    const leftCamera = wrapCamera.left;
    const rightCamera = wrapCamera.right;

    // Left edge: camera sees past the left boundary (scrollX < 0)
    if (leftCamera) {
        if (scrollX < 0) {
            // Add 2px buffer to prevent sub-pixel gaps
            const overlapLeft = Math.abs(scrollX) + 2;
            const width = Math.min(overlapLeft, camWidth);
            leftCamera.setViewport(0, 0, width, camHeight);
            // Show the END of the world (right edge wraps to left screen edge)
            leftCamera.setScroll(worldWidth + scrollX - 2, mainCam.scrollY);
            leftCamera.setZoom(mainCam.zoom);
            leftCamera.setVisible(true);
        } else {
            leftCamera.setVisible(false);
        }
    }

    // Right edge: camera sees past the right boundary
    if (rightCamera) {
        if (scrollX + camWidth > worldWidth) {
            // Add 2px buffer to prevent sub-pixel gaps
            const overlapRight = (scrollX + camWidth) - worldWidth + 2;
            const width = Math.min(overlapRight, camWidth);
            rightCamera.setViewport(camWidth - width, 0, width, camHeight);
            // Show the START of the world (left edge wraps to right screen edge)
            rightCamera.setScroll(-2, mainCam.scrollY);  // <-- THE FIX: was mainCam.scrollX - worldWidth
            rightCamera.setZoom(mainCam.zoom);
            rightCamera.setVisible(true);
        } else {
            rightCamera.setVisible(false);
        }
    }
}
function create() {
    // World bounds - disable left/right for wrapping
    this.physics.world.setBounds(0, 0, CONFIG.worldWidth, CONFIG.worldHeight, false, false, true, true);
    
    // Generate backgrounds FIRST
    createBackground(this);

    // Player - keep at/above FG_DEPTH_BASE so gameplay renders over backgrounds
    player = this.physics.add.sprite(100, 300, 'player');
    player.setCollideWorldBounds(false);
    player.setScale(1.25);
    player.body.setSize(25, 10);
    player.setDepth(FG_DEPTH_BASE + 10); // Anchor main sprite well above the base foreground depth

    // Game object groups
    enemies = this.physics.add.group();
    projectiles = this.physics.add.group();
    enemyProjectiles = this.physics.add.group();
    powerUps = this.physics.add.group();
    humans = this.physics.add.group();
    drones = this.physics.add.group();
    explosions = this.add.group();
    bosses = this.physics.add.group();

    particleManager = new ParticleManager(this, CONFIG.worldWidth, CONFIG.worldHeight);

    // Input
    cursors = this.input.keyboard.createCursorKeys();
    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    if (this._restartHandler) {
        this.input.keyboard.off('keydown-R', this._restartHandler);
    }
    this._restartHandler = () => {
        if (gameState.gameOver) {
            resetGameState();
            this.scene.restart();
        }
    };
    this.input.keyboard.on('keydown-R', this._restartHandler);
    
    this.events.once('shutdown', () => {
        if (this._restartHandler) {
            this.input.keyboard.off('keydown-R', this._restartHandler);
            this._restartHandler = null;
        }
        if (particleManager) {
            particleManager.destroy();
            particleManager = null;
        }
        destroyParallax();
        if (wrapCamera) {
            wrapCamera.left?.destroy();
            wrapCamera.right?.destroy();
            wrapCamera = null;
        }
    });

    // Physics overlaps
    this.physics.add.overlap(projectiles, enemies, hitEnemy, null, this);
    this.physics.add.overlap(projectiles, bosses, hitBoss, null, this);
    this.physics.add.overlap(player, enemies, playerHitEnemy, null, this);
    this.physics.add.overlap(player, bosses, playerHitBoss, null, this);
    this.physics.add.overlap(player, enemyProjectiles, playerHitProjectile, null, this);
    this.physics.add.overlap(player, powerUps, collectPowerUp, null, this);
    this.physics.add.overlap(player, humans, rescueHuman, null, this);

    createUI(this);

    audioManager = new AudioManager(this);
    audioManager.playAmbientMusic();

    initializeGame(this);
    this.gameScene = this;

    // Initialize parallax tracking AFTER player is created
    initParallaxTracking(player.x);

    setupWrapCamera(this);
}

function update(time, delta) {
    if (gameState.gameOver) {
        if (Phaser.Input.Keyboard.JustDown(rKey)) {
            resetGameState();
            this.scene.restart();
        }
        return;
    }
    if (gameState.paused) {
        if (Phaser.Input.Keyboard.JustDown(pKey)) togglePause(this);
        return;
    }
    if (window.missionPlanner) {
        missionPlanner.tickDistricts(delta / 1000);
    }
    if (gameState.mode === 'survival') {
        gameState.timeRemaining -= delta;
        if (gameState.timeRemaining <= 0) winGame(this);
    }

    updatePlayer(this, time);

    if (particleManager) {
        particleManager.update(delta);
    }

    // Wrap player
    if (player.x < 0) {
        player.x += CONFIG.worldWidth;
    } else if (player.x >= CONFIG.worldWidth) {
        player.x -= CONFIG.worldWidth;
    }

    // Camera positioning
    const mainCam = this.cameras.main;
    mainCam.scrollX = player.x - mainCam.width / 2;

    // Update parallax backgrounds
    updateParallax(player.x);

    updateWrapCamera(this);

    updateEnemies(this, time, delta);
    updateProjectiles(this);
    updatePowerUps(this);
    updatePowerUpMagnet(this);
    updateDrones(this, time);
    updateHumans(this);
    updateBosses(this, time, delta);
    checkSurvivalBosses(this);
    updatePowerUpTimers(delta);

    if (gameState.mode === 'survival') {
        let spawnChance = 0.001 + gameState.difficulty * 0.001;
        const progress = 1 - (gameState.timeRemaining / gameState.totalSurvivalDuration);
        spawnChance *= 1 + progress * 2;
        spawnChance *= gameState.spawnMultiplier || 1;
        if (humans.countActive(true) < 12 && Math.random() < 0.002) {
            spawnHuman(this, Math.random() * (CONFIG.worldWidth - 200) + 100);
        }
        if (Math.random() < spawnChance) spawnRandomEnemy(this);
    }

    updateRadar(this);
    updateUI();

    if (!gameState.gameOver && typeof gameState.nextExtraLife === 'number') {
        while (gameState.score >= gameState.nextExtraLife) {
            gameState.lives++;
            gameState.nextExtraLife = gameState.nextExtraLife * 2 + 10000;
        }
    }
}


// ------------------------
// Phaser game setup
// ------------------------

const dimensions = getResponsiveScale();

const mainSceneConfig = { key: SCENE_KEYS.game, active: false, preload, create, update };

const config = {
    type: Phaser.AUTO,
    width: dimensions.width,
    height: dimensions.height,
    parent: 'game-container',
    backgroundColor: '#0a0a2e',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: CONFIG.width,
        height: CONFIG.height
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [MainMenuScene, BuildScene, mainSceneConfig]
};

const game = new Phaser.Game(config);
// Expose the Phaser game instance for UI helpers (startGame, enterMainMenu, etc.)
window.game = game;
applyResponsiveResize();

window.addEventListener('resize', () => {
    applyResponsiveResize();
});
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        applyResponsiveResize();
    }, 100);
});

function applyResponsiveResize() {
    if (!game || !game.scale) return;
    if (!game.canvas) {
        // The canvas may not be ready immediately after game creation.
        setTimeout(applyResponsiveResize, 50);
        return;
    }
    const { width, height } = getResponsiveScale();
    game.scale.resize(width, height);
    game.canvas.style.width = `${width}px`;
    game.canvas.style.height = `${height}px`;
    game.scale.refresh();
}

// ------------------------
// Touch controls wiring
// ------------------------

(function setupTouchControls() {
    const buttons = document.querySelectorAll('#touch-controls .tc-btn');
    function setFlag(btn, isDown) {
        const dir = btn.getAttribute('data-dir');
        const action = btn.getAttribute('data-action');
        if (dir) {
            window.virtualInput[dir] = isDown;
        } else if (action === 'fire') {
            window.virtualInput.fire = isDown;
        } else if (action === 'bomb' && isDown) {
            const scene = game.scene.getScene(SCENE_KEYS.game);
            if (scene && scene.scene.isActive()) useSmartBomb(scene);
        }
    }
    buttons.forEach(btn => {
        ['pointerdown','touchstart','mousedown'].forEach(ev => {
            btn.addEventListener(ev, e => { e.preventDefault(); setFlag(btn, true); });
        });
        ['pointerup','pointerleave','touchend','touchcancel','mouseup','mouseleave'].forEach(ev => {
            btn.addEventListener(ev, e => { e.preventDefault(); setFlag(btn, false); });
        });
    });
})();

// ------------------------
// Mute toggle wiring
// ------------------------

document.getElementById('mute-toggle').addEventListener('click', () => {
    if (!audioManager) return;
    const muted = audioManager.toggleMute();
    document.getElementById('mute-toggle').textContent = muted ? 'Unmute' : 'Mute';
});
