// ------------------------
// Main game scene and initialization
// ------------------------

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
    updateUI();
}

function preload() {
    createGraphics(this);
}

// ------------------------
// Wrap-around rendering system
// ------------------------

// Ghost sprites for entities that need to appear on both sides of the wrap boundary
let ghostSprites = new Map();

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

function removeGhostSprite(entity) {
    const ghost = ghostSprites.get(entity);
    if (ghost) {
        ghost.destroy();
        ghostSprites.delete(entity);
    }
}

// Main function to handle entity visibility across wrap boundaries
function updateEntityWrapping(scene) {
    const mainCam = scene.cameras.main;
    const scrollX = mainCam.scrollX;
    const camWidth = mainCam.width;
    const worldWidth = CONFIG.worldWidth;
    
    // Boundary threshold - how close to edge before we need a ghost
    const boundaryThreshold = camWidth;
    
    const processEntity = (entity) => {
        if (!entity || !entity.active) {
            removeGhostSprite(entity);
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
            removeGhostSprite(entity);
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
    ghostSprites.forEach((ghost, entity) => {
        if (!entity.active) {
            ghost.destroy();
            ghostSprites.delete(entity);
        }
    });
}

// Clean up all ghost sprites
function destroyAllGhosts() {
    ghostSprites.forEach((ghost) => {
        if (ghost) ghost.destroy();
    });
    ghostSprites.clear();
}

function create() {
    // World bounds - disable left/right for wrapping
    this.physics.world.setBounds(0, 0, CONFIG.worldWidth, CONFIG.worldHeight, false, false, true, true);
    
    // Generate backgrounds FIRST
    createBackground(this);

    // Player
    player = this.physics.add.sprite(100, 300, 'player');
    player.setCollideWorldBounds(false);
    player.setScale(1.25);
    player.body.setSize(25, 10);
    player.setDepth(FG_DEPTH_BASE + 10);

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
        destroyAllGhosts();
        destroyParallax();
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

    initParallaxTracking();
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
