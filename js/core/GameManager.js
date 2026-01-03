// ========================
// GameManager.js
// Handles game initialization, objectives, and system management
// ========================

class GameManager {
    constructor() {
        this.gameSceneInitialized = false;
    }

    /**
     * Initialize game with entities and objectives
     */
    initializeGame(scene) {
        // Spawn humans
        for (let i = 0; i < gameState.humans; i++) {
            spawnHuman(scene, Math.random() * (CONFIG.worldWidth - 200) + 100);
        }

        // Initialize boss queue
        if (!gameState.bossQueue || gameState.bossQueue.length === 0) {
            initializeBossQueue();
        }

        // Setup mode-specific objectives
        if (gameState.mode === 'assault') {
            setupAssaultObjective(scene);
        } else if (gameState.mode === 'survival') {
            gameState.timeRemaining = gameState.timeRemaining || gameState.totalSurvivalDuration;
        } else {
            // Classic mode
            gameState.wave = gameState.wave || 1;
            const spawnScale = gameState.spawnMultiplier || 1;
            gameState.enemiesToKillThisWave = Math.max(5, Math.round((20 + (gameState.wave - 1) * 5) * spawnScale));
        }

        if (gameState.mode === 'classic') {
            spawnEnemyWave(scene);
        }

        updateUI(scene);
    }

    /**
     * Show rebuild objective banner message
     */
    showRebuildObjectiveBanner(scene, message, color = '#66ccff') {
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

    /**
     * Spawn extraction dropship for rebuild objective
     */
    spawnExtractionDropship(scene, objective) {
        const spawnOffset = Math.random() < 0.5 ? -260 : 260;
        const spawnX = scene.wrapSystem.wrapValue(objective.extractionX + spawnOffset);
        const spawnY = CONFIG.height * 0.35;
        const dropShip = spawnEnemy(scene, 'spawner', spawnX, spawnY, false);
        
        if (!dropShip) return null;

        dropShip.isExtractionTarget = true;
        dropShip.hp = Math.round(dropShip.hp * 2.5);
        dropShip.setScale(dropShip.scaleX * 1.4, dropShip.scaleY * 1.4);
        dropShip.setDepth(FG_DEPTH_BASE + 5);

        this.showRebuildObjectiveBanner(scene, 'Extraction dropship inbound');
        return dropShip;
    }

    /**
     * Rebuild veritech at extraction point
     */
    rebuildVeritechAtExtraction(scene, objective) {
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
        this.showRebuildObjectiveBanner(scene, 'Veritech rebuilt - return to battle', '#66ff88');
    }

    /**
     * Add alien tech to rebuild objective
     */
    addAlienTechToRebuildObjective(amount = 1) {
        const objective = gameState.rebuildObjective;
        if (!objective || !objective.active || objective.branch !== 'station') return;
        objective.collectedAlienTech += amount;
    }

    /**
     * Update rebuild objective state
     */
    updateRebuildObjective(scene, delta) {
        const objective = gameState.rebuildObjective;
        if (!objective || !objective.active) return;

        objective.timer += delta;

        if (objective.stage === 'secure_extraction') {
            if (!objective.encounterSpawned && objective.branch !== 'station') {
                this.spawnExtractionDropship(scene, objective);
                objective.encounterSpawned = true;
            }
            if (objective.branch === 'station' && objective.requiredAlienTech > 0
                && objective.collectedAlienTech >= objective.requiredAlienTech) {
                objective.stage = 'return_ship';
                objective.timer = 0;
            }
        } else if (objective.stage === 'return_ship') {
            if (!objective.shipReturned) {
                this.rebuildVeritechAtExtraction(scene, objective);
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

    /**
     * Get active audio manager from scene
     */
    getActiveAudioManager() {
        const scene = game?.scene?.getScene ? game.scene.getScene(SCENE_KEYS.game) : null;
        return scene?.audioManager || null;
    }

    /**
     * Setup responsive resize handling
     */
    setupResponsiveResize() {
        const applyResize = (options = {}) => {
            const { force = false } = options;
            
            if (!game || !game.scale || !game.canvas) return;

            // Don't resize in district mode unless forced
            if (!force && window.DistrictLayoutManager && 
                window.DistrictLayoutManager.getCurrentLayout && 
                window.DistrictLayoutManager.getCurrentLayout() === 'district') {
                return;
            }

            // Don't resize active initialized game unless forced
            const gameScene = game.scene.getScene(SCENE_KEYS.game);
            if (!force && gameScene && gameScene.scene.isActive() && this.gameSceneInitialized) {
                console.log('[ResponsiveResize] Blocked: GameScene already initialized');
                return;
            }

            const { width, height } = getResponsiveScale();
            
            if (width > 0 && height > 0) {
                console.log(`[ResponsiveResize] Updating game size to: ${width}x${height}`);
                game.scale.resize(width, height);
                game.canvas.style.width = `${width}px`;
                game.canvas.style.height = `${height}px`;
                game.scale.refresh();
            }
        };

        window.addEventListener('resize', () => applyResize());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => applyResize(), 100);
        });

        // Initial resize
        applyResize();

        return applyResize;
    }

    /**
     * Setup touch controls
     */
    setupTouchControls() {
        const buttons = document.querySelectorAll('#touch-controls .tc-btn');
        
        const setFlag = (btn, isDown) => {
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
        };

        buttons.forEach(btn => {
            ['pointerdown', 'touchstart', 'mousedown'].forEach(ev => {
                btn.addEventListener(ev, e => { e.preventDefault(); setFlag(btn, true); });
            });
            ['pointerup', 'pointerleave', 'touchend', 'touchcancel', 'mouseup', 'mouseleave'].forEach(ev => {
                btn.addEventListener(ev, e => { e.preventDefault(); setFlag(btn, false); });
            });
        });
    }

    /**
     * Wire accessibility panel controls
     */
    wireAccessibilityPanel() {
        const musicSlider = document.getElementById('music-volume-slider');
        const sfxSlider = document.getElementById('sfx-volume-slider');
        const flashToggle = document.getElementById('reduce-flash-toggle');
        const musicLabel = document.getElementById('music-volume-value');
        const sfxLabel = document.getElementById('sfx-volume-value');
        const flashLabel = document.getElementById('reduce-flash-label');

        if (musicSlider && musicLabel) {
            const applyMusic = (value) => {
                musicLabel.textContent = `${Math.round(value * 100)}%`;
                const audioManager = this.getActiveAudioManager();
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
                const audioManager = this.getActiveAudioManager();
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

    /**
     * Setup mute button
     */
    setupMuteButton() {
        const muteButton = document.getElementById('mute-toggle');
        if (muteButton) {
            muteButton.textContent = userSettings.muted ? 'Unmute' : 'Mute';
            muteButton.addEventListener('click', () => {
                const audioManager = this.getActiveAudioManager();
                if (!audioManager) return;
                const muted = audioManager.toggleMute();
                muteButton.textContent = muted ? 'Unmute' : 'Mute';
            });
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameManager;
}