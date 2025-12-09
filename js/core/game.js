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
        gameState.enemiesToKillThisWave = 20 + (gameState.wave - 1) * 5;
    }
    if (gameState.mode === 'classic') {
        spawnEnemyWave(scene);
    }
    updateUI();
}

function preload() {
    createGraphics(this);
}


function create() {
    this.physics.world.setBounds(0, 0, CONFIG.worldWidth, CONFIG.worldHeight);
    createBackground(this);

    player = this.physics.add.sprite(100, 300, 'player');
    player.setCollideWorldBounds(false);
    player.setScale(1.25);
    player.body.setSize(25, 10);

    // Secondary "Wrap Camera" to show the other side of the world seamlessly
    this.wrapCamera = this.cameras.add(0, 0, CONFIG.width, CONFIG.height);
    this.wrapCamera.setVisible(false);

    enemies = this.physics.add.group();
    projectiles = this.physics.add.group();
    enemyProjectiles = this.physics.add.group();
    powerUps = this.physics.add.group();
    humans = this.physics.add.group();
    drones = this.physics.add.group();
    explosions = this.add.group();
    bosses = this.physics.add.group();

    particleManager = new ParticleManager(this, CONFIG.worldWidth, CONFIG.worldHeight);

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
    });

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
    if (gameState.mode === 'survival') {
        gameState.timeRemaining -= delta;
        if (gameState.timeRemaining <= 0) winGame(this);
    }

    updatePlayer(this, time);

    if (particleManager) {
        particleManager.update(delta);
    }
    
    // -- Seamless Infinite Loop Logic --
    
    // 1. Wrap Player Physics
    if (player.x < 0) {
        player.x += CONFIG.worldWidth;
    } else if (player.x >= CONFIG.worldWidth) {
        player.x -= CONFIG.worldWidth;
    }

    // 2. Manual Camera Positioning (Rigid Lock to match retro feel)
    const mainCam = this.cameras.main;
    mainCam.scrollX = player.x - mainCam.width / 2;

    // 3. Visual Seam Wrapping (Dual Camera)
    const wrapCam = this.wrapCamera;
    if (wrapCam) {
        const scrollX = mainCam.scrollX;
        const camW = mainCam.width;
        
        // Add 2px safety buffer to prevent sub-pixel gaps
        if (scrollX < 0) {
            // Viewing Left Void -> Render World End
            wrapCam.setVisible(true);
            const gap = Math.abs(scrollX) + 2;
            wrapCam.setViewport(0, 0, Math.min(gap, camW), mainCam.height);
            wrapCam.scrollX = CONFIG.worldWidth + scrollX - 2;
        } else if (scrollX + camW > CONFIG.worldWidth) {
            // Viewing Right Void -> Render World Start
            wrapCam.setVisible(true);
            const overshot = (scrollX + camW) - CONFIG.worldWidth + 2;
            wrapCam.setViewport(camW - overshot, 0, Math.min(overshot, camW), mainCam.height);
            wrapCam.scrollX = -2;
        } else {
            wrapCam.setVisible(false);
        }
    }

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
        if (humans.countActive(true) < 12 && Math.random() < 0.002) {
            spawnHuman(this, Math.random() * (CONFIG.worldWidth - 200) + 100);
        }
        if (Math.random() < spawnChance) spawnRandomEnemy(this);
    }

    updateRadar(this);
    updateUI();

    if (!gameState.gameOver && typeof gameState.nextExtraLife === 'number') {
        // Extra life thresholds: 10k, 30k, 70k, 150k, ...
        // Recurrence: next = next * 2 + 10000
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
