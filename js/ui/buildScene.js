class BuildScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENE_KEYS.build, active: false, visible: false });
        this.selectedDistrict = null;
        this.mission = null;
        this.selectedMode = 'classic';
        this.mapModule = new BuildMapView(this);
        this._lastMetaRefresh = 0;
    }

    preload() {
        this.mapModule.preload();
    }

    create() {
        console.log('=== BuildScene.create() ===');
        
        // Initial build
        const width = this.scale.width;
        const height = this.scale.height;
        
        this.cameras.main.setBackgroundColor('#050912');
        this.cameras.main.setZoom(1);
        this.cameras.main.setScroll(0, 0);

        // Setup map module callbacks
        this.mapModule.onDistrictFocused = (district) => this.focusDistrict(district);
        this.mapModule.onNodeDetailsRequested = (title, body) => this.updateHTMLDetail(title, body);
        this.mapModule.onOrbitNodeSelected = (id) => this.handleOrbitNodeSelection(id);

        // Build the globe/map
        this.mapModule.build(width, height);

        // Create minimal in-scene UI
        this.createSceneOverlay(width, height);

        // Initial sync with HTML panels
        this.syncHTMLPanels();

        // Keyboard shortcuts
        this.input.keyboard.once('keydown-SPACE', () => this.launchMission());
        this.input.keyboard.on('keydown-R', () => this.rollMission());

        // Mouse interaction for globe rotation
        this.input.on('pointermove', pointer => {
            if (this.mapModule.planetContainer) {
                // Use mapModule's center instead of hardcoded width/2
                const centerX = this.mapModule.centerX;
                this.mapModule.planetContainer.rotation = Phaser.Math.DegToRad((pointer.x - centerX) * 0.015);
            }
        });

        this.input.once('pointerdown', () => {
            if (this.sound.context.state === 'suspended') {
                this.sound.context.resume();
            }
        });

        // Handle Phaser scale resize events to keep the globe centered and properly sized
        this.scale.on('resize', this.handleResize, this);
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.handleResize, this);
        });
    }

    createSceneOverlay(width, height) {
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

    handleResize(gameSize) {
        const { width, height } = gameSize;
        console.log('BuildScene Resized to:', width, height);

        this.cameras.main.setViewport(0, 0, width, height);
        this.cameras.main.setScroll(0, 0);

        if (this.hintText) this.hintText.setPosition(width / 2, height - 20);
        if (this.titleText) this.titleText.setPosition(width / 2, 20);

        this.mapModule.resize(width, height);
    }

    focusDistrict(district, skipTweens = false) {
        if (this.selectedDistrict === district) {
            return;
        }
        this.selectedDistrict = district;
        const center = this.mapModule.getDistrictCenterCoords(district.config);
        
        if (window.missionPlanner) {
            missionPlanner.updateDistrictState(district.config.id, district.state);
            this.mission = missionPlanner.selectDistrict(district.config.id, center.lon, district.state);
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

    rollMission() {
        if (window.missionPlanner) {
            this.mission = missionPlanner.rerollCity();
            this.syncHTMLPanels();
        }
    }

    launchMission() {
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
        
        const mode = this.selectedMode;
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

    selectMode(mode) {
        this.selectedMode = mode;
        if (typeof missionPlanner !== 'undefined') {
            this.mission = missionPlanner.setMode(mode);
        }
        this.syncHTMLPanels();
    }

    updateHTMLDetail(title, body) {
        if (window.DistrictLayoutManager) {
            DistrictLayoutManager.updateMissionPanel(this.mission, this.selectedDistrict);
        }
    }

    syncHTMLPanels() {
        if (!window.DistrictLayoutManager) return;
        
        DistrictLayoutManager.updateDistrictPanels();
        DistrictLayoutManager.updateMissionPanel(this.mission, this.selectedDistrict);
        
        if (this.selectedMode) {
            DistrictLayoutManager.selectMode(this.selectedMode);
        }
    }

    update(time, delta) {
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

    formatTimer(seconds) {
        const clamped = Math.max(0, Math.floor(seconds));
        const mins = String(Math.floor(clamped / 60)).padStart(2, '0');
        const secs = String(clamped % 60).padStart(2, '0');
        return `${mins}:${secs}`;
    }

    handleOrbitNodeSelection(id) {
        if (id === 'shop') {
            console.log('Shop node selected');
        }
    }
}
