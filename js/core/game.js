// ------------------------
// Main game scene and initialization
// ------------------------

// Flag to track if GameScene has been properly initialized
let gameSceneInitialized = false;

// Store canonical positions separately from render positions
// This is the key to making wrap-around work properly

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
    updateUI(scene);
}

function preload() {
    createGraphics(this);
}

// ------------------------
// Wrap-around rendering system
// ------------------------

// Ghost sprites for entities that need to appear on both sides of the wrap boundary
function getGhostSprites(scene) {
    if (!scene.ghostSprites) {
        scene.ghostSprites = new Map();
    }
    return scene.ghostSprites;
}

function wrapValue(x, worldWidth) {
    x = x % worldWidth;
    if (x < 0) x += worldWidth;
    return x;
}

// Calculate shortest distance between two points in a wrapped world
function wrappedDistance(x1, x2, worldWidth) {
    const direct = x2 - x1;
    const wrapped = direct > 0 ? direct - worldWidth : direct + worldWidth;
    return Math.abs(direct) < Math.abs(wrapped) ? direct : wrapped;
}

// Get the render X position for an entity relative to camera
function getRenderX(entityX, cameraX, worldWidth) {
    // entityX should be canonical (0 to worldWidth)
    // cameraX is the camera scrollX
    const camCenter = cameraX + CONFIG.width / 2;
    
    // Find the position closest to camera center
    let renderX = entityX;
    const dist = wrappedDistance(camCenter, entityX, worldWidth);
    
    if (dist > 0) {
        // Entity is to the right (in wrapped terms)
        renderX = camCenter + dist;
    } else {
        // Entity is to the left (in wrapped terms)
        renderX = camCenter + dist;
    }
    
    return renderX;
}

// Create or update a ghost sprite for an entity near the boundary
function updateGhostSprite(scene, entity, ghostX) {
    const ghostSprites = getGhostSprites(scene);
    let ghost = ghostSprites.get(entity);
    
    if (!ghost) {
        // Create ghost sprite matching the original
        ghost = scene.add.sprite(ghostX, entity.y, entity.texture.key);
        ghost.setScale(entity.scaleX, entity.scaleY);
        ghost.setDepth(entity.depth);
        ghost.setAlpha(entity.alpha);
        ghost.setTint(entity.tintTopLeft);
        ghost.isGhost = true;
        ghostSprites.set(entity, ghost);
    }
    
    // Update ghost position and properties
    ghost.setPosition(ghostX, entity.y);
    ghost.setScale(entity.scaleX, entity.scaleY);
    ghost.setFlipX(entity.flipX);
    ghost.setFlipY(entity.flipY);
    ghost.setVisible(entity.visible && entity.active);
    ghost.setAlpha(entity.alpha);
    
    if (entity.anims && entity.anims.currentAnim) {
        ghost.anims.play(entity.anims.currentAnim.key, true);
        ghost.anims.setCurrentFrame(entity.anims.currentFrame);
    }
}

function removeGhostSprite(scene, entity) {
    const ghostSprites = getGhostSprites(scene);
    const ghost = ghostSprites.get(entity);
    if (ghost) {
        ghost.destroy();
        ghostSprites.delete(entity);
    }
}

// Main function to handle entity visibility across wrap boundaries
function updateEntityWrapping(scene) {
    const {
        player,
        enemies,
        projectiles,
        enemyProjectiles,
        powerUps,
        humans,
        drones,
        bosses,
        explosions
    } = scene;
    const mainCam = scene.cameras.main;
    const scrollX = mainCam.scrollX;
    const camWidth = mainCam.width;
    const worldWidth = CONFIG.worldWidth;
    
    // Boundary threshold - how close to edge before we need a ghost
    const boundaryThreshold = camWidth;
    
    const processEntity = (entity) => {
        if (!entity || !entity.active) {
            removeGhostSprite(scene, entity);
            return;
        }
        
        // Get canonical position
        const canonicalX = wrapValue(entity.x, worldWidth);
        
        // Check if entity is near a boundary AND camera can see across that boundary
        const nearLeftEdge = canonicalX < boundaryThreshold;
        const nearRightEdge = canonicalX > worldWidth - boundaryThreshold;
        
        const cameraSeesLeftEdge = scrollX < boundaryThreshold;
        const cameraSeesRightEdge = scrollX + camWidth > worldWidth - boundaryThreshold;
        
        let needsGhost = false;
        let ghostX = canonicalX;
        
        if (nearRightEdge && cameraSeesLeftEdge) {
            // Entity is on right side, camera sees left side - ghost on left
            needsGhost = true;
            ghostX = canonicalX - worldWidth;
        } else if (nearLeftEdge && cameraSeesRightEdge) {
            // Entity is on left side, camera sees right side - ghost on right
            needsGhost = true;
            ghostX = canonicalX + worldWidth;
        }
        
        if (needsGhost) {
            updateGhostSprite(scene, entity, ghostX);
        } else {
            removeGhostSprite(scene, entity);
        }
        
        // Keep entity at canonical position
        entity.x = canonicalX;
    };
    
    const processGroup = (group) => {
        if (!group || !group.children || !group.children.entries) return;
        group.children.entries.forEach(processEntity);
    };
    
    // IMPORTANT: Process the player first (standalone sprite, not in a group)
    if (player && player.active) {
        processEntity(player);
    }
    
    // Process all entity groups
    processGroup(enemies);
    processGroup(projectiles);
    processGroup(enemyProjectiles);
    processGroup(powerUps);
    processGroup(humans);
    processGroup(drones);
    processGroup(bosses);
    
    if (explosions && explosions.children) {
        explosions.children.entries.forEach(processEntity);
    }
    
    // Clean up ghosts for destroyed entities
    const ghostSprites = getGhostSprites(scene);
    ghostSprites.forEach((ghost, entity) => {
        if (!entity.active) {
            ghost.destroy();
            ghostSprites.delete(entity);
        }
    });
}

// Clean up all ghost sprites
function destroyAllGhosts(scene) {
    const ghostSprites = getGhostSprites(scene);
    ghostSprites.forEach((ghost) => {
        if (ghost) ghost.destroy();
    });
    ghostSprites.clear();
}

function create() {
    if (window.DistrictLayoutManager) {
        DistrictLayoutManager.switchToGameLayout();
    }
    
    // Hide the BuildScene if it's active
    if (this.scene.isActive(SCENE_KEYS.build)) {
        this.scene.setVisible(false, SCENE_KEYS.build);
    }
    
    // Mark that the game scene has been properly initialized
    gameSceneInitialized = true;
    
    // World bounds - disable left/right for wrapping
    this.physics.world.setBounds(0, 0, CONFIG.worldWidth, CONFIG.worldHeight, false, false, true, true);
    
    // Generate backgrounds FIRST
    createBackground(this);

    // Player
    this.player = this.physics.add.sprite(100, 300, 'player');
    this.player.setCollideWorldBounds(false);
    this.player.setScale(1.25);
    this.player.body.setSize(25, 10);
    this.player.setDepth(FG_DEPTH_BASE + 10);

    // Game object groups
    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    this.enemyProjectiles = this.physics.add.group();
    this.powerUps = this.physics.add.group();
    this.humans = this.physics.add.group();
    this.drones = this.physics.add.group();
    this.explosions = this.add.group();
    this.bosses = this.physics.add.group();

    this.particleManager = new ParticleManager(this, CONFIG.worldWidth, CONFIG.worldHeight);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

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
        // Reset the initialization flag when scene shuts down
        gameSceneInitialized = false;
        
        if (this._restartHandler) {
            this.input.keyboard.off('keydown-R', this._restartHandler);
            this._restartHandler = null;
        }
        if (this.particleManager) {
            this.particleManager.destroy();
            this.particleManager = null;
        }
        destroyAllGhosts(this);
        destroyParallax();
    });

    // Physics overlaps
    this.physics.add.overlap(this.projectiles, this.enemies, hitEnemy, null, this);
    this.physics.add.overlap(this.projectiles, this.bosses, hitBoss, null, this);
    this.physics.add.overlap(this.player, this.enemies, playerHitEnemy, null, this);
    this.physics.add.overlap(this.player, this.bosses, playerHitBoss, null, this);
    this.physics.add.overlap(this.player, this.enemyProjectiles, playerHitProjectile, null, this);
    this.physics.add.overlap(this.player, this.powerUps, collectPowerUp, null, this);
    this.physics.add.overlap(this.player, this.humans, rescueHuman, null, this);

    createUI(this);

    this.audioManager = new AudioManager(this);
    this.audioManager.playAmbientMusic();

    initializeGame(this);
    this.gameScene = this;

    initParallaxTracking();
}

function update(time, delta) {
    const { player, particleManager } = this;
    
    // Don't update if scene isn't fully initialized
    if (!player || !this.enemies) return;
    
    if (gameState.gameOver) {
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            resetGameState();
            this.scene.restart();
        }
        return;
    }
    if (gameState.paused) {
        if (Phaser.Input.Keyboard.JustDown(this.pKey)) togglePause(this);
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

    // Wrap player to canonical position
    player.x = wrapValue(player.x, CONFIG.worldWidth);

    // Camera positioning - clamp scrollX to prevent negative values
    // This keeps the camera within valid world coordinates
    const mainCam = this.cameras.main;
    let desiredScrollX = player.x - mainCam.width / 2;
    
    // Clamp camera to world bounds (this is key!)
    // We allow some overflow for smooth transitions at boundaries
    const maxScroll = CONFIG.worldWidth - mainCam.width;
    
    // Handle wrap-around camera positioning
    if (desiredScrollX < 0) {
        // Player is near left edge - camera would go negative
        // Shift camera to equivalent position on right side
        desiredScrollX = CONFIG.worldWidth + desiredScrollX;
    } else if (desiredScrollX > maxScroll) {
        // Player is near right edge - camera exceeds world
        // Shift camera to equivalent position on left side  
        desiredScrollX = desiredScrollX - CONFIG.worldWidth;
    }
    
    mainCam.scrollX = desiredScrollX;

    // Wrap all entities and create ghosts for boundary visibility
    updateEntityWrapping(this);

    // Update parallax backgrounds
    updateParallax(mainCam.scrollX);

    updateEnemies(this, time, delta);
    updateProjectiles(this);
    updatePowerUps(this);
    updatePowerUpMagnet(this);
    updateDrones(this, time);
    updateHumans(this);
    updateBosses(this, time, delta);
    checkSurvivalBosses(this);
    updatePowerUpTimers(this, delta);

    if (gameState.mode === 'survival') {
        let spawnChance = 0.001 + gameState.difficulty * 0.001;
        const progress = 1 - (gameState.timeRemaining / gameState.totalSurvivalDuration);
        spawnChance *= 1 + progress * 2;
        spawnChance *= gameState.spawnMultiplier || 1;
        if (this.humans.countActive(true) < 12 && Math.random() < 0.002) {
            spawnHuman(this, Math.random() * (CONFIG.worldWidth - 200) + 100);
        }
        if (Math.random() < spawnChance) spawnRandomEnemy(this);
    }

    updateRadar(this);
    updateUI(this);

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

// Trigger initial resize
applyResponsiveResize();

// Event listeners
window.addEventListener('resize', () => {
    applyResponsiveResize();
});
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        applyResponsiveResize();
    }, 100);
});

// ------------------------
// Responsive Resize Helper
// ------------------------
function applyResponsiveResize() {
    // 1. Safety check: If the game or scale manager isn't ready, abort.
    if (!game || !game.scale || !game.canvas) return;

    // 2. District Mode check:
    // If we are currently looking at the District Map, we DO NOT want to resize 
    // based on the window. The DistrictLayoutManager handles the size (100% of the panel).
    if (window.DistrictLayoutManager && 
        window.DistrictLayoutManager.getCurrentLayout && 
        window.DistrictLayoutManager.getCurrentLayout() === 'district') {
        return;
    }

    // 3. NEW: Check if GameScene is active and already initialized
    // Don't resize an active game that's already been set up
    const gameScene = game.scene.getScene(SCENE_KEYS.game);
    if (gameScene && gameScene.scene.isActive() && gameSceneInitialized) {
        console.log('[ResponsiveResize] Blocked: GameScene already initialized and active');
        return;
    }

    // 4. Normal Game Mode logic:
    // Calculate the best fit for the window (e.g. 1000x500 or smaller for mobile)
    const { width, height } = getResponsiveScale();
    
    // Only resize if the dimensions are valid (prevents 0x0 errors)
    if (width > 0 && height > 0) {
        console.log(`[ResponsiveResize] Updating game size to: ${width}x${height}`);
        console.log('[ResponsiveResize] Resizing game canvas for responsive layout');
        
        // Force Phaser to use these dimensions
        game.scale.resize(width, height);
        
        // Ensure CSS matches so it renders sharply
        game.canvas.style.width = `${width}px`;
        game.canvas.style.height = `${height}px`;
        
        // Refresh the scale manager internals
        game.scale.refresh();
    }
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

function getActiveAudioManager() {
    const scene = game?.scene?.getScene ? game.scene.getScene(SCENE_KEYS.game) : null;
    return scene?.audioManager || null;
}

// ------------------------
// Mute toggle wiring
// ------------------------

const muteButton = document.getElementById('mute-toggle');
if (muteButton) {
    muteButton.textContent = userSettings.muted ? 'Unmute' : 'Mute';
    muteButton.addEventListener('click', () => {
        const audioManager = getActiveAudioManager();
        if (!audioManager) return;
        const muted = audioManager.toggleMute();
        muteButton.textContent = muted ? 'Unmute' : 'Mute';
    });
}

// ------------------------
// Accessibility + volume wiring (main menu panel)
// ------------------------

function wireAccessibilityPanel() {
    const musicSlider = document.getElementById('music-volume-slider');
    const sfxSlider = document.getElementById('sfx-volume-slider');
    const flashToggle = document.getElementById('reduce-flash-toggle');
    const musicLabel = document.getElementById('music-volume-value');
    const sfxLabel = document.getElementById('sfx-volume-value');
    const flashLabel = document.getElementById('reduce-flash-label');

    if (musicSlider && musicLabel) {
        const applyMusic = (value) => {
            musicLabel.textContent = `${Math.round(value * 100)}%`;
            const audioManager = getActiveAudioManager();
            if (audioManager) audioManager.setMusicVolume(value);
            else {
                userSettings.musicVolume = value;
                persistUserSettings();
            }
        };
        musicSlider.value = Math.round(userSettings.musicVolume * 100);
        applyMusic(userSettings.musicVolume);
        musicSlider.addEventListener('input', (e) => {
            const normalized = Phaser.Math.Clamp(Number(e.target.value) / 100, 0, 1);
            applyMusic(normalized);
        });
    }

    if (sfxSlider && sfxLabel) {
        const applySfx = (value) => {
            sfxLabel.textContent = `${Math.round(value * 100)}%`;
            const audioManager = getActiveAudioManager();
            if (audioManager) audioManager.setSFXVolume(value);
            else {
                userSettings.sfxVolume = value;
                persistUserSettings();
            }
        };
        sfxSlider.value = Math.round(userSettings.sfxVolume * 100);
        applySfx(userSettings.sfxVolume);
        sfxSlider.addEventListener('input', (e) => {
            const normalized = Phaser.Math.Clamp(Number(e.target.value) / 100, 0, 1);
            applySfx(normalized);
        });
    }

    if (flashToggle && flashLabel) {
        flashToggle.checked = !!userSettings.reduceFlashes;
        flashLabel.textContent = userSettings.reduceFlashes ? 'On' : 'Off';
        flashToggle.addEventListener('change', () => {
            userSettings.reduceFlashes = !!flashToggle.checked;
            flashLabel.textContent = userSettings.reduceFlashes ? 'On' : 'Off';
            persistUserSettings();
        });
    }
}

wireAccessibilityPanel();
