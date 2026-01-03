// ========================
// GameScene.js
// Main Phaser game scene
// ========================

// Create global instances
const gameManager = new GameManager();
const wrapSystem = new WrapSystem(CONFIG.worldWidth);
const playerCamera = new PlayerCamera(CONFIG.worldWidth);

// Phaser Scene Configuration
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENE_KEYS.game, active: false });
        this.wrapSystem = wrapSystem;
        this.playerCamera = playerCamera;
        this.gameManager = gameManager;
    }

    preload() {
        createGraphics(this);
    }

    create() {
        if (window.DistrictLayoutManager) {
            DistrictLayoutManager.switchToGameLayout();
        }
        
        // Hide BuildScene if active
        if (this.scene.isActive(SCENE_KEYS.build)) {
            this.scene.setVisible(false, SCENE_KEYS.build);
        }
        
        // Mark scene as initialized
        this.gameManager.gameSceneInitialized = true;
        
        // World bounds - disable left/right for wrapping
        this.physics.world.setBounds(0, 0, CONFIG.worldWidth, CONFIG.worldHeight, false, false, true, true);
        this.cameras.main.setScroll(0, 0);
        this.cameras.main.setZoom(1);
        this.cameras.main.setBounds(0, 0, CONFIG.worldWidth + this.cameras.main.width, CONFIG.worldHeight);
        
        // Generate backgrounds
        createBackground(this);

        // Create Veritech
        this.veritech = this.physics.add.sprite(100, 300, 'veritech_fighter');
        this.veritech.setCollideWorldBounds(false);
        this.veritech.setScale(1.25);
        this.veritech.body.setSize(28, 12);
        this.veritech.setDepth(FG_DEPTH_BASE + 10);

        // Create Pilot
        this.pilot = this.physics.add.sprite(100, 300, 'pilot');
        this.pilot.setCollideWorldBounds(false);
        this.pilot.setScale(1.25);
        this.pilot.body.setSize(12, 18);
        this.pilot.setDepth(FG_DEPTH_BASE + 9);
        this.pilot.setActive(false).setVisible(false);

        // Maintain legacy player reference
        this.player = this.veritech;

        // Create game object groups
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

        // Particle manager
        this.particleManager = new ParticleManager(this, CONFIG.worldWidth, CONFIG.worldHeight);

        // Setup input
        this.setupInput();

        // Setup physics overlaps
        this.setupCollisions();

        // Create UI
        createUI(this);

        // Audio manager
        this.audioManager = new AudioManager(this);
        this.audioManager.playAmbientMusic();

        // Initialize game
        this.gameManager.initializeGame(this);
        this.gameScene = this;

        // Initialize parallax
        const mainCam = this.cameras.main;
        initParallaxTracking(mainCam ? mainCam.scrollX : 0);
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.bKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

        // Restart handler
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
        
        // Cleanup on shutdown
        this.events.once('shutdown', () => {
            this.gameManager.gameSceneInitialized = false;
            
            if (this._restartHandler) {
                this.input.keyboard.off('keydown-R', this._restartHandler);
                this._restartHandler = null;
            }
            if (this.particleManager) {
                this.particleManager.destroy();
                this.particleManager = null;
            }
            this.wrapSystem.destroyAllGhosts();
            destroyParallax();
        });
    }

    setupCollisions() {
        // Projectile overlaps
        this.physics.add.overlap(this.projectiles, this.enemies, hitEnemy, null, this);
        this.physics.add.overlap(this.projectiles, this.garrisonDefenders, hitGarrisonDefender, null, this);
        this.physics.add.overlap(this.projectiles, this.bosses, hitBoss, null, this);
        this.physics.add.overlap(this.projectiles, this.battleships, hitBattleship, null, this);
        this.physics.add.overlap(this.projectiles, this.assaultTargets, hitAssaultTarget, null, this);

        // Veritech overlaps
        this.physics.add.overlap(this.veritech, this.enemies, playerHitEnemy, null, this);
        this.physics.add.overlap(this.veritech, this.garrisonDefenders, playerHitGarrisonDefender, null, this);
        this.physics.add.overlap(this.veritech, this.bosses, playerHitBoss, null, this);
        this.physics.add.overlap(this.veritech, this.battleships, playerHitBattleship, null, this);
        this.physics.add.overlap(this.veritech, this.enemyProjectiles, playerHitProjectile, null, this);
        this.physics.add.overlap(this.veritech, this.powerUps, collectPowerUp, null, this);
        this.physics.add.overlap(this.veritech, this.humans, rescueHuman, null, this);

        // Pilot overlaps
        this.physics.add.overlap(this.pilot, this.enemies, playerHitEnemy, null, this);
        this.physics.add.overlap(this.pilot, this.garrisonDefenders, playerHitGarrisonDefender, null, this);
        this.physics.add.overlap(this.pilot, this.bosses, playerHitBoss, null, this);
        this.physics.add.overlap(this.pilot, this.battleships, playerHitBattleship, null, this);
        this.physics.add.overlap(this.pilot, this.enemyProjectiles, playerHitProjectile, null, this);
        this.physics.add.overlap(this.pilot, this.powerUps, collectPowerUp, null, this);
        this.physics.add.overlap(this.pilot, this.humans, rescueHuman, null, this);
    }

    update(time, delta) {
        const { particleManager } = this;
        const player = getActivePlayer(this);
        
        if (!player || !this.enemies) return;

        const mainCam = this.cameras.main;
        
        // Ensure proper camera settings
        if (mainCam && mainCam.zoom !== 1) mainCam.setZoom(1);
        if (mainCam && mainCam.scrollY !== 0) {
            mainCam.scrollY = 0;
        }
        
        // Handle game over
        if (gameState.gameOver) {
            if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
                resetGameState();
                this.scene.restart();
            }
            return;
        }

        // Handle pause
        if (gameState.paused) {
            if (Phaser.Input.Keyboard.JustDown(this.pKey)) togglePause(this);
            return;
        }

        // Update mission planner
        if (window.missionPlanner) {
            missionPlanner.tickDistricts(delta / 1000);
        }

        // Update mode-specific logic
        if (gameState.mode === 'survival') {
            gameState.timeRemaining -= delta;
            if (gameState.timeRemaining <= 0) winGame(this);
        }
        if (gameState.mode === 'assault') {
            updateAssaultObjective(this, delta);
        }

        // Update game systems
        updatePlayer(this, time, delta);
        this.gameManager.updateRebuildObjective(this, delta);

        if (particleManager) {
            particleManager.update(delta);
        }

        const activePlayer = getActivePlayer(this);

        // Wrap player positions
        if (this.veritech && this.veritech.active) {
            this.veritech.x = this.wrapSystem.wrapValue(this.veritech.x);
        }
        if (this.pilot && this.pilot.active) {
            this.pilot.x = this.wrapSystem.wrapValue(this.pilot.x);
        }

        // Update camera with wrapping
        this.playerCamera.update(mainCam, activePlayer);
        if (mainCam && mainCam.scrollY !== 0) {
            mainCam.scrollY = 0;
        }

        // Update entity wrapping
        this.wrapSystem.updateEntityWrapping(this);

        // Update parallax
        updateParallax(mainCam.scrollX);

        // Update game entities
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

        // Survival mode spawning
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

        // Update UI
        updateRadar(this);
        updateUI(this);

        // Extra life check
        if (!gameState.gameOver && typeof gameState.nextExtraLife === 'number') {
            while (gameState.score >= gameState.nextExtraLife) {
                gameState.lives++;
                gameState.nextExtraLife = gameState.nextExtraLife * 2 + 10000;
            }
        }
    }
}

// ========================
// Phaser Game Configuration
// ========================

const dimensions = getResponsiveScale();

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
    scene: [MainMenuScene, BuildScene, GameScene]
};

const game = new Phaser.Game(config);
window.game = game;

// ========================
// Initialize Systems
// ========================

// Setup responsive resize
const applyResponsiveResize = gameManager.setupResponsiveResize();
window.applyResponsiveResize = applyResponsiveResize;

// Setup controls
gameManager.setupTouchControls();
gameManager.wireAccessibilityPanel();
gameManager.setupMuteButton();

// Export helper functions for backwards compatibility
window.getActiveAudioManager = () => gameManager.getActiveAudioManager();
window.addAlienTechToRebuildObjective = (amount) => gameManager.addAlienTechToRebuildObjective(amount);
