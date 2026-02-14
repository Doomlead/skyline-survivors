// ------------------------
// File: js/ui/buildScene.js
// ------------------------

class BuildScene extends Phaser.Scene {
    constructor() { // Constructor.
        super({ key: SCENE_KEYS.build, active: false, visible: false });
        this.selectedDistrict = null;
        this.mission = null;
        this.selectedMode = 'classic';
        this.mapModule = new BuildMapView(this);
        this._lastMetaRefresh = 0;
    }

    preload() { // Preload.
        this.mapModule.preload();
    }

    create() { // Create.
        console.log('=== BuildScene.create() ===');
        
        // 1. Clean up old state first
        if (this.mapModule) {
            this.mapModule.cleanup();
        }

        // 2. Tell the UI manager to move the canvas
        if (window.DistrictLayoutManager) {
            DistrictLayoutManager.switchToDistrictLayout();
        }
        
        // 3. WAIT for the browser to finish moving the canvas 
        // before we try to measure the screen and draw the globe.
        setTimeout(() => {
            // Check if scene is still active after timeout (user might have clicked away)
            if (this.sys.isActive()) {
                this.performCreate();
            }
        }, 150); 
    }
    
    performCreate() { // Perform create.
        // 1. Get dimensions
        const width = this.scale.width;
        const height = this.scale.height;
        console.log('[BuildScene] Building with final dimensions', { width, height });
        
        // 2. Scene Setup
        this.cameras.main.setBackgroundColor('#050912');
        this.cameras.main.setZoom(1);
        this.cameras.main.setScroll(0, 0);

        // 3. Map Module Setup
        this.mapModule.onDistrictFocused = (d) => this.handleDistrictFocus(d);
        this.mapModule.onNodeDetailsRequested = (n) => this.handleNodeDetails(n);
        this.mapModule.onOrbitNodeSelected = (n) => this.handleOrbitNodeSelected(n);

        // 4. Build the Globe
        if (typeof createMapIconGraphics === 'function') {
            createMapIconGraphics(this);
        }
        this.mapModule.build(width, height);
        this.syncHTMLPanels();
        this.createSceneOverlay(width, height);

        // Keyboard Controls
        this._spaceHandler = () => this.launchMission();
        this._rerollHandler = () => this.rollMission();
        this.input.keyboard.on('keydown-SPACE', this._spaceHandler);
        this.input.keyboard.on('keydown-R', this._rerollHandler);

        // Globe Rotation Logic
        this.input.on('pointermove', pointer => {
            // Check if planetContainer exists inside mapModule
            if (this.mapModule.planetContainer) {
                const centerX = this.mapModule.centerX;
                // Rotates based on distance from the center of the map
                this.mapModule.planetContainer.rotation = Phaser.Math.DegToRad((pointer.x - centerX) * 0.015);
            }
        });

        // Audio Resume (Browser Security Requirement)
        this.input.once('pointerdown', () => {
            if (this.sound.context.state === 'suspended') {
                this.sound.context.resume();
            }
        });

        // Cleanup Handler
        this.events.once('shutdown', () => {
            if (this._resizeHandler) {
                this.scale.off('resize', this._resizeHandler);
                this._resizeHandler = null;
            }
            if (this._spaceHandler) {
                this.input.keyboard.off('keydown-SPACE', this._spaceHandler);
                this._spaceHandler = null;
            }
            if (this._rerollHandler) {
                this.input.keyboard.off('keydown-R', this._rerollHandler);
                this._rerollHandler = null;
            }
            // Ensure map cleans up its own event listeners/objects
            if (this.mapModule) {
                this.mapModule.cleanup();
            }
        });

    }


    createSceneOverlay(width, height) { // Create scene overlay.
        if (this.hintText) this.hintText.destroy();
        if (this.titleText) this.titleText.destroy();

        this.hintText = this.add.text(width / 2, height - 20, 'Click a glowing district to select · Press SPACE to launch', {
            fontFamily: 'Orbitron',
            fontSize: '11px',
            color: '#64748b',
            align: 'center'
        }).setOrigin(0.5);
        
        this.titleText = this.add.text(width / 2, 20, 'DISTRICT GLOBE', {
            fontFamily: 'Orbitron',
            fontSize: '14px',
            color: '#4a9eff',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0.7);
    }

    handleResize(gameSize) { // Handle resize.
        const width = gameSize.width;
        const height = gameSize.height;
        this.mapModule.resize(width, height);
        this.updateSceneOverlay(width, height);
    }

    updateSceneOverlay(width, height) { // Update scene overlay.
        if (this.hintText) {
            this.hintText.setPosition(width / 2, height - 20);
        }
        if (this.titleText) {
            this.titleText.setPosition(width / 2, 20);
        }
    }

    focusDistrict(district, skipTweens = false) { // Focus district.
        if (this.selectedDistrict === district) {
            return;
        }
        this.selectedDistrict = district;
        const center = this.mapModule.getDistrictCenterCoords(district.config);
        
        if (window.missionPlanner) {
            missionPlanner.updateDistrictState(district.config.id, district.state);
            this.mission = missionPlanner.selectDistrict(district.config.id, center.lon, district.state);
        }

        if (district?.state?.status === 'occupied') {
            this.selectedMode = 'assault';
            if (window.missionPlanner) {
                this.mission = missionPlanner.setMode('assault');
            }
        } else if (this.selectedMode === 'assault') {
            this.selectedMode = 'classic';
            if (window.missionPlanner) {
                this.mission = missionPlanner.setMode('classic');
            }
        }
        
        this.syncHTMLPanels();

        if (!skipTweens) {
            this.tweens.add({
                targets: this.cameras.main,
                zoom: 1.05,
                duration: 150,
                yoyo: true,
                ease: 'Sine.easeInOut'
            });
            
            if (this.mapModule.planetContainer) {
                this.tweens.add({
                    targets: this.mapModule.planetContainer,
                    scale: 1.02,
                    duration: 120,
                    yoyo: true,
                    ease: 'Sine.easeOut'
                });
            }
        }
    }

    handleDistrictFocus(district) { // Handle district focus.
        this.focusDistrict(district);
    }

    handleNodeDetails(node) { // Handle node details.
        if (!node) return;
        console.log('[BuildScene] Node details requested', node);
    }

    handleOrbitNodeSelected(nodeId) { // Handle orbit node selected.
        this.handleOrbitNodeSelection(nodeId);
    }

    rollMission() { // Roll mission.
        if (window.missionPlanner) {
            this.mission = missionPlanner.rerollCity();
            this.syncHTMLPanels();
        }
    }

    launchMission() { // Launch mission.
        if (!this.selectedDistrict) {
            this.tweens.add({
                targets: this.hintText,
                alpha: { from: 1, to: 0.3 },
                duration: 100,
                yoyo: true,
                repeat: 2
            });
            return;
        }
        
        const mode = this.selectedDistrict?.state?.status === 'occupied' ? 'assault' : this.selectedMode;
        if (window.missionPlanner) {
            missionPlanner.selectDistrict(
                this.selectedDistrict.config.id,
                this.mapModule.getDistrictCenterCoords(this.selectedDistrict.config).lon,
                this.selectedDistrict.state
            );
            missionPlanner.setMode(mode);
        }
        
        if (window.startGame) {
            startGame(mode);
        }
        this.scene.stop();
    }

    selectMode(mode) { // Select mode.
        if (this.selectedDistrict?.state?.status === 'occupied' && mode !== 'assault') {
            this.selectedMode = 'assault';
        } else {
            this.selectedMode = mode;
        }
        if (typeof missionPlanner !== 'undefined') {
            this.mission = missionPlanner.setMode(this.selectedMode);
        }
        this.syncHTMLPanels();
    }

    updateHTMLDetail(title, body) { // Update htmldetail.
        if (window.DistrictLayoutManager) {
            DistrictLayoutManager.updateMissionPanel(this.mission, this.selectedDistrict);
        }
    }

    syncHTMLPanels() { // Sync htmlpanels.
        if (!window.DistrictLayoutManager) return;
        
        DistrictLayoutManager.updateDistrictPanels();
        DistrictLayoutManager.updateMissionPanel(this.mission, this.selectedDistrict);
        
        if (this.selectedMode) {
            DistrictLayoutManager.selectMode(this.selectedMode);
        }
    }

    update(time, delta) { // Update.
        if (typeof missionPlanner === 'undefined') return;
        
        const updatedMission = this.mapModule.update(time, delta, this.mission);
        if (updatedMission !== this.mission) {
            this.mission = updatedMission;
            this.syncHTMLPanels();
        }
        
        this._lastMetaRefresh += delta;
        if (this._lastMetaRefresh > 500) {
            if (window.DistrictLayoutManager) {
                DistrictLayoutManager.updateDistrictPanels();
            }
            this._lastMetaRefresh = 0;
        }
    }

    formatTimer(seconds) { // Format timer.
        const clamped = Math.max(0, Math.floor(seconds));
        const mins = String(Math.floor(clamped / 60)).padStart(2, '0');
        const secs = String(clamped % 60).padStart(2, '0');
        return `${mins}:${secs}`;
    }

    handleOrbitNodeSelection(id) { // Handle orbit node selection.
        if (id === 'shop') {
            console.log('Shop node selected');
        }
        if (id === 'mothership') {
            const ready = window.missionPlanner?.areAllDistrictsFriendly?.();
            if (!ready) {
                if (this.hintText) {
                    this.hintText.setText('Mothership locked: secure every district to unlock final assault.');
                    this.tweens.add({
                        targets: this.hintText,
                        alpha: { from: 1, to: 0.4 },
                        duration: 200,
                        yoyo: true,
                        repeat: 2
                    });
                }
                return;
            }
            if (this.hintText) {
                this.hintText.setText('Mothership coordinates acquired. Launching final assault.');
            }
            if (window.missionPlanner?.selectMothershipMission) {
                this.mission = missionPlanner.selectMothershipMission();
            }
            if (window.startGame) {
                startGame('mothership');
            }
        }
    }
}
