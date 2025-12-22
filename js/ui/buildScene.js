class BuildScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENE_KEYS.build, active: false, visible: false });
        this.selectedDistrict = null;
        this.mission = null;
        this.selectedMode = 'classic';
        this.mapModule = new BuildMapView(this);
        this.uiModule = new BuildMissionUi(this);
        this._lastMetaRefresh = 0;
    }

    preload() {
        this.mapModule.preload();
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#050912');
        this.cameras.main.setZoom(1);

        this.mapModule.onDistrictFocused = (district) => this.focusDistrict(district);
        this.mapModule.onNodeDetailsRequested = (title, body) => this.uiModule.updateDetail(title, body);
        this.mapModule.onOrbitNodeSelected = (id) => this.handleOrbitNodeSelection(id);
        this.uiModule.onModeSelected = (mode) => this.selectMode(mode);

        this.mapModule.build(width, height);
        this.uiModule.createOverlay(width);
        this.uiModule.createModeButtons(width, this.selectedMode);
        this.uiModule.createDetailBody(width, this.mapModule.mapNodes);
        this.uiModule.createMissionConsole(width, height, {
            onLaunch: () => this.launchMission(),
            onReroute: () => this.rollMission()
        });
        this.uiModule.createBuildShopPanel(width, height);

        this.updateMissionUi();
        this.uiModule.updateExternalLaunchButton(this.selectedDistrict, this.mission, this.selectedMode);
        this.uiModule.refreshBuildShopPanel();
        this.syncOverlayLayout();

        this.input.keyboard.once('keydown-SPACE', () => this.launchMission());
        this.input.keyboard.on('keydown-R', () => this.rollMission());

        this.input.on('pointermove', pointer => {
            if (this.mapModule.planetContainer) {
                this.mapModule.planetContainer.rotation = Phaser.Math.DegToRad((pointer.x - width * 0.35) * 0.01);
            }
        });

        this.input.once('pointerdown', () => {
            if (this.sound.context.state === 'suspended') {
                this.sound.context.resume();
            }
        });
    }

    focusDistrict(district, skipTweens = false) {
        if (this.selectedDistrict === district) {
            return;
        }
        this.selectedDistrict = district;
        const center = this.mapModule.getDistrictCenterCoords(district.config);
        missionPlanner.updateDistrictState(district.config.id, district.state);
        this.mission = missionPlanner.selectDistrict(district.config.id, center.lon, district.state);
        this.children.bringToTop(this.uiModule.detailCard);

        const destabilizationStatus = `${this.formatTimer(district.state.timer)} until destabilization`;
        const statusLabel = district.state.status === 'destroyed'
            ? 'Destroyed: no civilian comms'
            : district.state.status === 'cleared'
                ? 'Stabilized after last run'
                : `Threatened — ${destabilizationStatus}`;

        this.uiModule.updateDetail(
            `${district.config.name}`,
            `Status: ${statusLabel}\n` +
            `Urgency: ${this.mission?.directives?.urgency || 'unknown'} • Reward focus: ${district.config.reward}\n` +
            'Action: Prep builds, reinforce nodes, shop for upgrades.'
        );
        this.uiModule.updateExternalLaunchButton(this.selectedDistrict, this.mission, this.selectedMode);
        this.updateMissionUi();
        this.syncOverlayLayout();

        if (!skipTweens) {
            this.tweens.add({
                targets: this.cameras.main,
                zoom: 1.12,
                duration: 240,
                yoyo: true,
                ease: 'Sine.easeInOut'
            });
            this.tweens.add({
                targets: this.mapModule.planetContainer,
                scale: 1.05,
                duration: 200,
                yoyo: true,
                ease: 'Sine.easeOut'
            });
        }
    }

    rollMission() {
        this.mission = missionPlanner.rerollCity();
        this.updateMissionUi();
    }

    launchMission() {
        if (!this.selectedDistrict) {
            if (this.uiModule.detailCard) {
                this.tweens.add({
                    targets: this.uiModule.detailCard,
                    alpha: { from: 0.7, to: 1 },
                    duration: 140,
                    yoyo: true
                });
            }
            return;
        }
        const mode = this.mission?.mode || this.selectedMode;
        missionPlanner.selectDistrict(
            this.selectedDistrict.config.id,
            this.mapModule.getDistrictCenterCoords(this.selectedDistrict.config).lon,
            this.selectedDistrict.state
        );
        missionPlanner.setMode(mode);
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
        this.uiModule.updateModeButtonStyles(this.selectedMode);
        this.updateMissionUi();
        this.syncOverlayLayout();
    }

    updateMissionUi() {
        if (!this.mission || !this.mapModule.mapImage || !this.uiModule.panelSummary) return;

        this.mapModule.positionMarkerOnMap(this.mission);
        if (this.selectedMode !== (this.mission.mode || this.selectedMode)) {
            this.selectedMode = this.mission.mode || this.selectedMode;
        }

        this.uiModule.updateMissionUi(this.mission, this.selectedMode, this.selectedDistrict, this.mapModule.mapNodes);
        this.uiModule.updateExternalLaunchButton(this.selectedDistrict, this.mission, this.selectedMode);
        this.syncOverlayLayout();
    }

    update(time, delta) {
        if (typeof missionPlanner === 'undefined') return;
        const updatedMission = this.mapModule.update(time, delta, this.mission);
        if (updatedMission !== this.mission) {
            this.mission = updatedMission;
            this.updateMissionUi();
        } else {
            this.uiModule.refreshNodeStatusText(this.mapModule.mapNodes, this.selectedDistrict);
        }
        this._lastMetaRefresh += delta;
        if (this._lastMetaRefresh > 500) {
            this.uiModule.refreshBuildShopPanel();
            this._lastMetaRefresh = 0;
        }
        if (this._lastMetaRefresh === 0) {
            this.syncOverlayLayout();
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
            this.uiModule.highlightShopPanel();
        }
    }

    syncOverlayLayout() {
        if (!window.buildOverlay?.render) return;
        const mission = this.mission || missionPlanner?.getMission?.();
        const directives = mission?.directives;
        const districtName = this.selectedDistrict?.config?.name || 'Select a district';
        const urgency = directives?.urgency || 'threatened';
        const rewardMult = directives?.rewardMultiplier ? directives.rewardMultiplier.toFixed(2) : '1.00';
        const missionBody = directives
            ? `Mode: ${(mission?.mode || this.selectedMode || 'classic').toUpperCase()} · Urgency ${urgency} · Reward ${rewardMult}x\nSeed ${mission.seed?.slice?.(0, 6) || '--'}`
            : 'Choose a district to view mission directives.';
        const shipBody = [
            `Lives ${gameState?.lives ?? '--'} · Bombs ${gameState?.smartBombs ?? '--'}`,
            `Score ${gameState?.score ?? 0} · Reward x${(gameState?.rewardMultiplier || 1).toFixed(2)}`
        ].join('\n');

        window.buildOverlay.render({
            title: 'Select a district',
            missionTitle: districtName,
            missionBody,
            shipTitle: 'Ship Status',
            shipBody,
            centerTitle: 'District Globe'
        });
    }
}
