// ------------------------
// File: js/core/game.js
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
    if (gameState.mode === 'assault') {
        setupAssaultObjective(scene);
    } else if (gameState.mode === 'survival') {
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

function showRebuildObjectiveBanner(scene, message, color = '#66ccff') {
    if (!scene) return;
    const banner = scene.add.text(
        CONFIG.width / 2,
        CONFIG.height / 2 - 120,
        message,
        {
            fontSize: '26px',
            fontFamily: 'Orbitron',
            color,
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(210);

    scene.tweens.add({
        targets: banner,
        alpha: 0,
        y: banner.y - 40,
        duration: 2200,
        onComplete: () => banner.destroy()
    });
}

function spawnExtractionDropship(scene, objective) {
    const spawnOffset = Math.random() < 0.5 ? -260 : 260;
    const spawnX = wrapValue(objective.extractionX + spawnOffset, CONFIG.worldWidth);
    const spawnY = CONFIG.height * 0.35;
    const dropShip = spawnEnemy(scene, 'spawner', spawnX, spawnY, false);
    if (!dropShip) return null;

    dropShip.isExtractionTarget = true;
    dropShip.hp = Math.round(dropShip.hp * 2.5);
    dropShip.setScale(dropShip.scaleX * 1.4, dropShip.scaleY * 1.4);
    dropShip.setDepth(FG_DEPTH_BASE + 5);

    showRebuildObjectiveBanner(scene, 'Extraction dropship inbound');
    return dropShip;
}

function rebuildVeritechAtExtraction(scene, objective) {
    if (!scene.veritech || !scene.pilot) return;
    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    const terrainVariation = Math.sin(objective.extractionX / 200) * 30;
    const spawnY = Math.max(40, groundLevel - terrainVariation - 30);

    setVeritechMode(scene, 'fighter');
    veritechState.destroyed = false;
    veritechState.active = true;
    veritechState.vx = 0;
    veritechState.vy = 0;

    scene.veritech.setPosition(objective.extractionX, spawnY);
    scene.veritech.setActive(true).setVisible(true);
    scene.veritech.body.enable = true;

    pilotState.active = false;
    scene.pilot.setActive(false).setVisible(false);
    scene.pilot.body.enable = false;
    syncActivePlayer(scene);

    playerState.powerUps.invincibility = 2000;
    showRebuildObjectiveBanner(scene, 'Veritech rebuilt - return to battle', '#66ff88');
}

function addAlienTechToRebuildObjective(amount = 1) {
    const objective = gameState.rebuildObjective;
    if (!objective || !objective.active || objective.branch !== 'station') return;
    objective.collectedAlienTech += amount;
}

function updateRebuildObjective(scene, delta) {
    const objective = gameState.rebuildObjective;
    if (!objective || !objective.active) return;

    objective.timer += delta;

    if (objective.stage === 'secure_extraction') {
        if (!objective.encounterSpawned && objective.branch !== 'station') {
            spawnExtractionDropship(scene, objective);
            objective.encounterSpawned = true;
        }
        if (objective.branch === 'station' && objective.requiredAlienTech > 0
            && objective.collectedAlienTech >= objective.requiredAlienTech) {
            objective.stage = 'return_ship';
            objective.timer = 0;
        }
    } else if (objective.stage === 'return_ship') {
        if (!objective.shipReturned) {
            rebuildVeritechAtExtraction(scene, objective);
            objective.shipReturned = true;
        }
        if (objective.timer > 800) {
            objective.active = false;
            objective.stage = null;
            objective.timer = 0;
            objective.shipReturned = false;
        }
    }
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
            veritech,
            pilot,
            enemies,
            projectiles,
            enemyProjectiles,
            powerUps,
            humans,
            drones,
            garrisonDefenders,
            bosses,
            battleships,
            explosions,
            assaultTargets
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
    
    // IMPORTANT: Process the active player first (standalone sprite, not in a group)
    if (player && player.active) {
        processEntity(player);
    }
    if (veritech && veritech.active && veritech !== player) {
        processEntity(veritech);
    }
    if (pilot && pilot.active && pilot !== player) {
        processEntity(pilot);
    }
    
    // Process all entity groups
    processGroup(enemies);
    processGroup(garrisonDefenders);
    processGroup(projectiles);
    processGroup(enemyProjectiles);
    processGroup(powerUps);
    processGroup(humans);
    processGroup(drones);
    processGroup(bosses);
    processGroup(battleships);
    processGroup(assaultTargets);
    
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
        this.scene.sleep(SCENE_KEYS.build); // Ensure it stops updating
    }
    
    // Mark that the game scene has been properly initialized
    gameSceneInitialized = true;
    
    // World bounds - disable left/right for wrapping
    this.physics.world.setBounds(0, 0, CONFIG.worldWidth, CONFIG.worldHeight, false, false, true, true);
    this.cameras.main.setScroll(0, 0);
    
    // Generate backgrounds FIRST
    createBackground(this);

    // Veritech + Pilot
    this.veritech = this.physics.add.sprite(100, 300, 'veritech_fighter');
    this.veritech.setCollideWorldBounds(false);
    this.veritech.setScale(1.25);
    this.veritech.body.setSize(28, 12);
    this.veritech.setDepth(FG_DEPTH_BASE + 10);

    this.pilot = this.physics.add.sprite(100, 300, 'pilot');
    this.pilot.setCollideWorldBounds(false);
    this.pilot.setScale(1.25);
    this.pilot.body.setSize(12, 18);
    this.pilot.setDepth(FG_DEPTH_BASE + 9);
    this.pilot.setActive(false).setVisible(false);

    // Maintain legacy scene.player reference for shared systems
    this.player = this.veritech;
	
	// Position camera vertically to show the player from the start
	const initialScrollY = Math.max(0, Math.min(
		this.veritech.y - CONFIG.height / 2,
		Math.max(0, CONFIG.worldHeight - CONFIG.height)
		));
	this.cameras.main.scrollY = initialScrollY;

    // Game object groups
    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    this.enemyProjectiles = this.physics.add.group();
    this.powerUps = this.physics.add.group();
    this.humans = this.physics.add.group();
    this.drones = this.physics.add.group();
    this.explosions = this.add.group();
    this.bosses = this.physics.add.group();
    this.battleships = this.physics.add.group();
    this.assaultTargets = this.physics.add.group();
    this.garrisonDefenders = this.physics.add.group();

    this.particleManager = new ParticleManager(this, CONFIG.worldWidth, CONFIG.worldHeight);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.ctrlKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
    this.bKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
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
    this.physics.add.overlap(this.projectiles, this.garrisonDefenders, hitGarrisonDefender, null, this);
    this.physics.add.overlap(this.projectiles, this.bosses, hitBoss, null, this);
    this.physics.add.overlap(this.projectiles, this.battleships, hitBattleship, null, this);
    this.physics.add.overlap(this.projectiles, this.assaultTargets, hitAssaultTarget, null, this);
    this.physics.add.overlap(this.veritech, this.enemies, playerHitEnemy, null, this);
    this.physics.add.overlap(this.veritech, this.garrisonDefenders, playerHitGarrisonDefender, null, this);
    this.physics.add.overlap(this.veritech, this.bosses, playerHitBoss, null, this);
    this.physics.add.overlap(this.veritech, this.battleships, playerHitBattleship, null, this);
    this.physics.add.overlap(this.veritech, this.enemyProjectiles, playerHitProjectile, null, this);
    this.physics.add.overlap(this.veritech, this.powerUps, collectPowerUp, null, this);
    this.physics.add.overlap(this.veritech, this.humans, rescueHuman, null, this);

    this.physics.add.overlap(this.pilot, this.enemies, playerHitEnemy, null, this);
    this.physics.add.overlap(this.pilot, this.garrisonDefenders, playerHitGarrisonDefender, null, this);
    this.physics.add.overlap(this.pilot, this.bosses, playerHitBoss, null, this);
    this.physics.add.overlap(this.pilot, this.battleships, playerHitBattleship, null, this);
    this.physics.add.overlap(this.pilot, this.enemyProjectiles, playerHitProjectile, null, this);
    this.physics.add.overlap(this.pilot, this.powerUps, collectPowerUp, null, this);
    this.physics.add.overlap(this.pilot, this.humans, rescueHuman, null, this);

    createUI(this);

    this.audioManager = new AudioManager(this);
    this.audioManager.playAmbientMusic();

    initializeGame(this);
    this.gameScene = this;

    const mainCam = this.cameras.main;
    initParallaxTracking(mainCam ? mainCam.scrollX : 0, mainCam ? mainCam.scrollY : 0);
}

function update(time, delta) {
    const { particleManager } = this;
    const player = getActivePlayer(this);
    
    // Don't update if scene isn't fully initialized
    if (!player || !this.enemies) return;

    const mainCam = this.cameras.main;
    
    // Ensure zoom is always 1
    if (mainCam && mainCam.zoom !== 1) {
        mainCam.setZoom(1);
    }
    
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
    if (gameState.mode === 'assault') {
        updateAssaultObjective(this, delta);
    }

    updatePlayer(this, time, delta);
    updateRebuildObjective(this, delta);

    if (particleManager) {
        particleManager.update(delta);
    }

    const activePlayer = getActivePlayer(this);

    // Wrap veritech + pilot to canonical positions
    if (this.veritech && this.veritech.active) {
        this.veritech.x = wrapValue(this.veritech.x, CONFIG.worldWidth);
    }
    if (this.pilot && this.pilot.active) {
        this.pilot.x = wrapValue(this.pilot.x, CONFIG.worldWidth);
    }

    // === CAMERA X POSITIONING (horizontal with wrap-around) ===
    let desiredScrollX = activePlayer.x - mainCam.width / 2;
    
    const maxScrollX = CONFIG.worldWidth - mainCam.width;
    
    // Handle wrap-around camera positioning
    if (desiredScrollX < 0) {
        desiredScrollX = CONFIG.worldWidth + desiredScrollX;
    } else if (desiredScrollX > maxScrollX) {
        desiredScrollX = desiredScrollX - CONFIG.worldWidth;
    }
    
    mainCam.scrollX = desiredScrollX;

    // === CAMERA Y POSITIONING (vertical following) ===
    let desiredScrollY = activePlayer.y - mainCam.height / 2;
    
    // Clamp to world bounds (no wrap-around for Y)
    const maxScrollY = Math.max(0, CONFIG.worldHeight - mainCam.height);
    if (maxScrollY <= 0) {
        // World height equals or is less than camera height - center vertically
        desiredScrollY = (CONFIG.worldHeight - mainCam.height) / 2;
    } else {
        // Clamp scroll to valid range so we don't show outside world
        desiredScrollY = Math.max(0, Math.min(desiredScrollY, maxScrollY));
    }
    
    mainCam.scrollY = desiredScrollY;

    // Wrap all entities and create ghosts for boundary visibility
    updateEntityWrapping(this);

    // Update parallax backgrounds
    updateParallax(mainCam.scrollX, mainCam.scrollY);

    updateEnemies(this, time, delta);
    updateProjectiles(this);
    updatePowerUps(this);
    updatePowerUpMagnet(this);
    updateDrones(this, time);
    updateHumans(this);
    updateGarrisonDefenders(this, time, delta);
    updateBosses(this, time, delta);
    updateBattleships(this, time, delta);
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
function applyResponsiveResize(options = {}) {
    const { force = false } = options;
    
    // 1. Safety check
    if (!game || !game.scale || !game.canvas) return;

    // 2. District Mode Logic:
    // If we are in District Mode, simply force the canvas to fill the container.
    // This allows the globe to use the full resolution of your new larger container.
    if (window.DistrictLayoutManager && 
        window.DistrictLayoutManager.getCurrentLayout && 
        window.DistrictLayoutManager.getCurrentLayout() === 'district') {
        
        const container = document.getElementById('district-game-container');
        if (container && container.clientWidth > 0 && container.clientHeight > 0) {
            // Resize Phaser to match the container exactly
            game.scale.resize(container.clientWidth, container.clientHeight);
            game.scale.refresh();
        }
        return; 
    }

    // 3. Normal Game Mode Logic:
    const { width, height } = getResponsiveScale();
    
    // Only resize if the dimensions are valid
    if (width > 0 && height > 0) {
        console.log(`[ResponsiveResize] Updating game size to: ${width}x${height}`);
        
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