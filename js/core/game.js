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
    if (gameState.mode !== 'mothership' && (!gameState.bossQueue || gameState.bossQueue.length === 0)) {
        initializeBossQueue();
    }
    if (gameState.mode === 'assault') {
        setupAssaultObjective(scene);
    } else if (gameState.mode === 'mothership') {
        setupMothershipEncounter(scene);
    } else if (gameState.mode === 'survival') {
        gameState.timeRemaining = gameState.timeRemaining || gameState.totalSurvivalDuration;
    } else {
        gameState.wave = gameState.wave || 1;
        const spawnScale = gameState.spawnMultiplier || 1;
        gameState.enemiesToKillThisWave = Math.max(5, Math.round((20 + (gameState.wave - 1) * 5) * spawnScale));
    }
    setupDefenseHangar(scene);
    if (gameState.mode === 'classic') {
        spawnEnemyWave(scene);
    }
    updateUI(scene);
}

function applyKeyBindings(scene) {
    const bindings = userSettings.keyBindings || DEFAULT_KEY_BINDINGS;
    const keyCodes = Phaser.Input.Keyboard.KeyCodes;
    const resolveKeyCode = (action) => keyCodes[bindings[action] || DEFAULT_KEY_BINDINGS[action]];

    if (scene.boundKeys) {
        Object.values(scene.boundKeys).forEach((key) => {
            if (key) scene.input.keyboard.removeKey(key);
        });
    }

    const boundKeys = {
        left: scene.input.keyboard.addKey(resolveKeyCode('moveLeft')),
        right: scene.input.keyboard.addKey(resolveKeyCode('moveRight')),
        up: scene.input.keyboard.addKey(resolveKeyCode('moveUp')),
        down: scene.input.keyboard.addKey(resolveKeyCode('moveDown')),
        fire: scene.input.keyboard.addKey(resolveKeyCode('fire')),
        transform: scene.input.keyboard.addKey(resolveKeyCode('transform')),
        jump: scene.input.keyboard.addKey(resolveKeyCode('jump')),
        bomb: scene.input.keyboard.addKey(resolveKeyCode('bomb')),
        eject: scene.input.keyboard.addKey(resolveKeyCode('eject')),
        enter: scene.input.keyboard.addKey(resolveKeyCode('enter')),
        hyperspace: scene.input.keyboard.addKey(resolveKeyCode('hyperspace')),
        pause: scene.input.keyboard.addKey(resolveKeyCode('pause')),
        switchPrimary: scene.input.keyboard.addKey(resolveKeyCode('switchPrimary'))
    };

    scene.boundKeys = boundKeys;
    scene.leftKey = boundKeys.left;
    scene.rightKey = boundKeys.right;
    scene.upKey = boundKeys.up;
    scene.downKey = boundKeys.down;
    scene.fireKey = boundKeys.fire;
    scene.transformKey = boundKeys.transform;
    scene.jumpKey = boundKeys.jump;
    scene.bombKey = boundKeys.bomb;
    scene.ejectKey = boundKeys.eject;
    scene.enterKey = boundKeys.enter;
    scene.hyperspaceKey = boundKeys.hyperspace;
    scene.pauseKey = boundKeys.pause;
    scene.switchPrimaryKey = boundKeys.switchPrimary;
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
    this.friendlies = this.physics.add.group();

    this.particleManager = new ParticleManager(this, CONFIG.worldWidth, CONFIG.worldHeight);

    // Input
    applyKeyBindings(this);
    this.refreshKeyBindings = () => applyKeyBindings(this);
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    if (this._restartHandler) {
        this.input.keyboard.off('keydown-R', this._restartHandler);
    }
    this._restartHandler = () => {
        if (gameState.gameOver) {
            resetGameState();
            if (window.enterMainMenu) {
                enterMainMenu();
            }
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
        if (this.rKey) {
            this.input.keyboard.removeKey(this.rKey);
            this.rKey = null;
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

    this.physics.add.overlap(this.drones, this.enemies, droneHitEnemy, null, this);
    this.physics.add.overlap(this.drones, this.enemyProjectiles, droneHitProjectile, null, this);

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
        if (this.rKey && Phaser.Input.Keyboard.JustDown(this.rKey)) {
            resetGameState();
            this.scene.restart();
        }
        return;
    }
    if (gameState.paused) {
        if (!this.isRebindingKey && Phaser.Input.Keyboard.JustDown(this.pauseKey)) togglePause(this);
        return;
    }
    gameState.timePlayedMs = (gameState.timePlayedMs || 0) + delta;
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
    if (gameState.mode === 'mothership') {
        updateMothershipEncounter(this, delta);
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
    updateHangars(this, time);
    updateGarrisonDefenders(this, time, delta);
    updateBosses(this, time, delta);
    updateMothershipBosses(this, time, delta);
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
    scene: [TitleScene, MainMenuScene, BuildScene, mainSceneConfig]
};

const game = new Phaser.Game(config);
// Expose the Phaser game instance for UI helpers (startGame, enterMainMenu, etc.)
window.game = game;
