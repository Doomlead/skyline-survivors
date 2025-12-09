class BuildScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENE_KEYS.build, active: false, visible: false });
        this.districts = [];
        this.mapNodes = [];
        this.selectedDistrict = null;
        this.mission = null;
        this.mapMarker = null;
        this.mapImage = null;
        this.mapPing = null;
        this.earthTextureKey = 'ui-earth';
        this.selectedMode = 'classic';
    }

    preload() {
        this.load.image('ui-earth', 'assets/Art/UI/Earth.png');

        this.load.on('loaderror', (file) => {
            console.error('Failed to load:', file?.key, file?.src);
            if (file?.key === 'ui-earth') {
                this.earthTextureKey = 'ui-earth-fallback';
            }
        });
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#050912');
        this.cameras.main.setZoom(1);

        this.createStars();
        this.createBackdrop(width, height);

        const centerX = width * 0.35;
        const centerY = height / 2 + 10;
        this.planetContainer = this.add.container(centerX, centerY);
        this.createPlanet();
        this.createDistricts();
        this.createOrbitNodes(width, height, centerX, centerY);
        this.createUiOverlay(width);
        this.createModeButtons(width);

        this.mission = this.generateMission();
        this.createMissionConsole(width, height);
        this.updateMissionUi();

        this.input.keyboard.once('keydown-SPACE', () => this.launchMission());
        this.input.keyboard.on('keydown-R', () => this.rollMission());

        this.input.on('pointermove', pointer => {
            this.planetContainer.rotation = Phaser.Math.DegToRad((pointer.x - centerX) * 0.01);
        });
    }

    createStars() {
        const g = this.add.graphics();
        g.fillStyle(0xffffff, 1);
        g.fillCircle(2, 2, 2);
        g.generateTexture('build-star', 4, 4);
        g.destroy();

        const particles = this.add.particles('build-star');
        particles.createEmitter({
            x: { min: 0, max: this.scale.width },
            y: { min: 0, max: this.scale.height },
            quantity: 2,
            speedY: 6,
            speedX: 0,
            lifespan: 6000,
            alpha: { start: 0.7, end: 0 },
            scale: { start: 0.8, end: 0.4 },
            blendMode: 'ADD'
        });
    }

    createBackdrop(width, height) {
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x102a3f, 0.4);
        const spacing = 60;
        for (let x = 0; x < width; x += spacing) {
            grid.lineBetween(x, 0, x, height);
        }
        for (let y = 0; y < height; y += spacing) {
            grid.lineBetween(0, y, width, y);
        }

        const centerGlow = this.add.circle(width / 2, height / 2 + 20, 180, 0x0b2a3b, 0.25);
        centerGlow.setBlendMode(Phaser.BlendModes.ADD);
    }

    createPlanet() {
        const base = this.add.circle(0, 0, 140, 0x0f1a3a, 1);
        const haze = this.add.circle(0, 0, 158, 0x1e9bff, 0.1);
        const rim = this.add.circle(0, 0, 148);
        rim.setStrokeStyle(3, 0x4ade80, 0.6);
        rim.setBlendMode(Phaser.BlendModes.ADD);

        this.planetContainer.add([haze, base, rim]);
        this.tweens.add({
            targets: rim,
            angle: 360,
            duration: 8000,
            repeat: -1,
            ease: 'Linear'
        });
    }

    createDistricts() {
        const sectorConfigs = [
            { name: 'North Spire', start: -100, end: -20, color: 0x22e0ff, timer: 120 },
            { name: 'Eastern Reach', start: -10, end: 70, color: 0x7c3aed, timer: 150 },
            { name: 'Sunward Forge', start: 80, end: 140, color: 0xfbbf24, timer: 90 },
            { name: 'Southern Bastion', start: 150, end: 220, color: 0x10b981, timer: 180 },
            { name: 'Shadow Belt', start: 230, end: 320, color: 0xef4444, timer: 200 }
        ];

        sectorConfigs.forEach(config => {
            const sectorGraphics = this.add.graphics({ x: 0, y: 0 });
            sectorGraphics.fillStyle(config.color, 0.16);
            sectorGraphics.slice(0, 0, 138, Phaser.Math.DegToRad(config.start), Phaser.Math.DegToRad(config.end), false);
            sectorGraphics.fillPath();
            sectorGraphics.lineStyle(2, config.color, 0.5);
            sectorGraphics.beginPath();
            sectorGraphics.arc(0, 0, 141, Phaser.Math.DegToRad(config.start), Phaser.Math.DegToRad(config.end), false);
            sectorGraphics.strokePath();

            const glow = this.add.graphics({ x: 0, y: 0 });
            glow.fillStyle(config.color, 0.05);
            glow.slice(0, 0, 150, Phaser.Math.DegToRad(config.start - 4), Phaser.Math.DegToRad(config.end + 4), false);
            glow.fillPath();
            glow.setBlendMode(Phaser.BlendModes.ADD);

            const selectionArc = this.add.arc(0, 0, 142, Phaser.Math.DegToRad(config.start), Phaser.Math.DegToRad(config.end), false, 0xffffff, 0.01);
            selectionArc.setInteractive({ useHandCursor: true });

            const timerText = this.add.text(
                Math.cos(Phaser.Math.DegToRad((config.start + config.end) / 2)) * 95,
                Math.sin(Phaser.Math.DegToRad((config.start + config.end) / 2)) * 95,
                this.formatTimer(config.timer),
                { fontFamily: 'Orbitron', fontSize: '12px', color: '#d1f6ff' }
            ).setOrigin(0.5);

            const nameLabel = this.add.text(
                Math.cos(Phaser.Math.DegToRad((config.start + config.end) / 2)) * 70,
                Math.sin(Phaser.Math.DegToRad((config.start + config.end) / 2)) * 70,
                config.name,
                { fontFamily: 'Orbitron', fontSize: '11px', color: '#c3e8ff' }
            ).setOrigin(0.5);

            const district = { config, sectorGraphics, glow, selectionArc, timer: config.timer, timerText, nameLabel };
            this.planetContainer.add([glow, sectorGraphics, selectionArc, timerText, nameLabel]);
            this.enableDistrictInteractions(district);
            this.districts.push(district);
        });
    }

    enableDistrictInteractions(district) {
        district.selectionArc.on('pointerover', () => {
            this.tweens.add({ targets: [district.sectorGraphics, district.glow], alpha: 0.9, duration: 120 });
        });
        district.selectionArc.on('pointerout', () => {
            this.tweens.add({ targets: [district.sectorGraphics, district.glow], alpha: 0.5, duration: 160 });
        });
        district.selectionArc.on('pointerdown', () => this.focusDistrict(district));
    }

    focusDistrict(district) {
        if (this.selectedDistrict === district) {
            return;
        }
        this.selectedDistrict = district;
        if (this.mission) {
            this.mission.city = district.config.name;
            this.updateMissionUi();
        }
        this.children.bringToTop(this.detailCard);

        this.tweens.add({
            targets: this.cameras.main,
            zoom: 1.12,
            duration: 240,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
        this.tweens.add({
            targets: this.planetContainer,
            scale: 1.05,
            duration: 200,
            yoyo: true,
            ease: 'Sine.easeOut'
        });

        this.detailTitle.setText(`${district.config.name}`);
        this.detailBody.setText(
            `Status: ${this.formatTimer(district.timer)} until destabilization\n` +
            'View: 2D top-down telemetry with sector overlays\n' +
            'Action: Prep builds, reinforce nodes, shop for upgrades.'
        );
    }

    createOrbitNodes(width, height, centerX, centerY) {
        const nodeConfigs = [
            { label: 'Mothership', angle: -40, radius: 230, color: 0xf472b6, timer: 65 },
            { label: 'Shop', angle: 70, radius: 250, color: 0x22d3ee, timer: 0 },
            { label: 'Relay', angle: 160, radius: 240, color: 0x93c5fd, timer: 45 },
            { label: 'Distress Node', angle: 240, radius: 210, color: 0xfacc15, timer: 30 }
        ];

        const orbitLines = this.add.graphics();
        orbitLines.lineStyle(1, 0x0ea5e9, 0.25);
        orbitLines.strokeCircle(centerX, centerY, 210);
        orbitLines.strokeCircle(centerX, centerY, 240);
        orbitLines.strokeCircle(centerX, centerY, 270);

        nodeConfigs.forEach(config => {
            const x = centerX + Math.cos(Phaser.Math.DegToRad(config.angle)) * config.radius;
            const y = centerY + Math.sin(Phaser.Math.DegToRad(config.angle)) * config.radius;

            const connector = this.add.graphics();
            connector.lineStyle(1.5, 0x1dcaff, 0.3);
            connector.lineBetween(centerX, centerY, x, y);

            const node = this.add.circle(x, y, 12, config.color, 0.9);
            node.setStrokeStyle(2, 0xffffff, 0.8);
            node.setBlendMode(Phaser.BlendModes.ADD);

            const pulse = this.tweens.add({ targets: node, scale: 1.25, duration: 700, yoyo: true, repeat: -1 });

            const label = this.add.text(x, y - 22, config.label, {
                fontFamily: 'Orbitron',
                fontSize: '11px',
                color: '#c7e6ff',
                align: 'center'
            }).setOrigin(0.5);

            const timerText = this.add.text(x, y + 16, config.timer > 0 ? this.formatTimer(config.timer) : 'STABLE', {
                fontFamily: 'Orbitron',
                fontSize: '10px',
                color: '#fef08a'
            }).setOrigin(0.5);

            this.mapNodes.push({ node, label, timer: config.timer, timerText, pulse, connector });

            node.setInteractive({ useHandCursor: true });
            node.on('pointerdown', () => {
                this.flashConnector(connector);
                this.focusDistrict({
                    config: { name: `${config.label} Sector` },
                    timer: config.timer
                });
            });
        });
    }

    createUiOverlay(width) {
        const header = this.add.text(width / 2, 28, 'System Map & Meta Layer', {
            fontFamily: 'Orbitron',
            fontSize: '18px',
            color: '#8bffff',
            align: 'center'
        }).setOrigin(0.5);
        header.setShadow(0, 0, '#0ea5e9', 8, true, true);

        this.detailCard = this.add.rectangle(width / 2, 60, 420, 70, 0x0b1220, 0.7)
            .setStrokeStyle(1, 0x1d4ed8, 0.8);
        this.detailCard.setOrigin(0.5, 0);
        this.detailCard.setScrollFactor(0);

        this.detailTitle = this.add.text(width / 2 - 180, 70, 'Select a district', {
            fontFamily: 'Orbitron',
            fontSize: '14px',
            color: '#c7e3ff'
        });
        this.detailBody = this.add.text(width / 2 - 180, 90,
            'Hover or click a glowing sector to zoom in.\nNodes carry timers—stabilize the most critical threats first.\nChoose a mode below to deploy to the selected district.', {
                fontFamily: 'Orbitron',
                fontSize: '11px',
                color: '#9fb8d1'
            });
    }

    createModeButtons(width) {
        this.modeButtons = this.add.container(width * 0.35, 150);
        this.modeButtonRefs = [];

        const createButton = (offsetX, label, color, mode) => {
            const rect = this.add.rectangle(offsetX, 0, 150, 38, 0x0f172a, 0.85)
                .setStrokeStyle(2, color, 0.7)
                .setInteractive({ useHandCursor: true });
            const text = this.add.text(offsetX, 0, label, {
                fontFamily: 'Orbitron',
                fontSize: '12px',
                color: '#d1f6ff'
            }).setOrigin(0.5);

            rect.on('pointerover', () => {
                this.tweens.add({ targets: rect, alpha: 1, duration: 120 });
            });
            rect.on('pointerout', () => {
                this.tweens.add({ targets: rect, alpha: 0.85, duration: 160 });
            });
            rect.on('pointerdown', () => this.selectMode(mode));

            this.modeButtonRefs.push({ rect, text, mode, color });
            this.modeButtons.add([rect, text]);
        };

        createButton(-90, 'Wave Mode', 0x7dd3fc, 'classic');
        createButton(90, 'Survival Mode', 0x22d3ee, 'survival');

        this.modeHint = this.add.text(width * 0.35, 185,
            'Select a district to deploy and then choose your mode.', {
                fontFamily: 'Orbitron',
                fontSize: '11px',
                color: '#9fb8d1'
            }).setOrigin(0.5);

        this.selectMode(this.selectedMode);
    }

    selectMode(mode) {
        this.selectedMode = mode;
        if (this.mission) {
            this.mission.mode = mode;
        }
        this.updateModeButtonStyles();
        this.updateMissionUi();
    }

    updateModeButtonStyles() {
        if (!this.modeButtonRefs) return;
        this.modeButtonRefs.forEach(({ rect, text, mode, color }) => {
            const active = mode === this.selectedMode;
            rect.setFillStyle(0x0f172a, active ? 1 : 0.85);
            rect.setStrokeStyle(2, color, active ? 1 : 0.6);
            rect.setScale(active ? 1.02 : 1);
            text.setColor(active ? '#e0f2fe' : '#d1f6ff');
        });
    }

    createMissionConsole(width, height) {
        const panelWidth = width * 0.42;
        const panelHeight = height * 0.62;
        const panelX = width * 0.78;
        const panelY = height * 0.48;

        const panel = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x0c1e34, 0.85);
        panel.setStrokeStyle(3, 0x33c0ff, 0.8);
        const inner = this.add.rectangle(panelX, panelY, panelWidth - 16, panelHeight - 16, 0x07162b, 0.9);
        inner.setStrokeStyle(2, 0x0a85ff, 0.3);

        this.missionHeader = this.add.text(panelX, panelY - panelHeight / 2 + 18, 'Mission Routing', {
            fontFamily: 'Orbitron',
            fontSize: '14px',
            color: '#c7e3ff'
        }).setOrigin(0.5);

        this.ensureEarthTexture(panelWidth - 30, panelHeight - 120);
        this.mapImage = this.add.image(panelX, panelY - 10, this.earthTextureKey);
        this.mapImage.setDisplaySize(panelWidth - 30, panelHeight - 120);
        this.mapImage.setDepth(3);

        this.mapMarker = this.add.circle(panelX, panelY - 10, 5, 0xff4d6d, 1);
        this.mapMarker.setStrokeStyle(2, 0xffffff, 0.8);
        this.mapMarker.setDepth(4);

        this.mapPing = this.add.circle(panelX, panelY - 10, 8, 0xff8fab, 0.3);
        this.mapPing.setDepth(3);
        this.tweens.add({
            targets: this.mapPing,
            scale: { from: 1, to: 2 },
            alpha: { from: 0.5, to: 0 },
            duration: 900,
            repeat: -1
        });

        this.missionDetails = this.add.text(panelX, panelY + panelHeight * 0.28, '', {
            fontFamily: 'Orbitron',
            fontSize: '11px',
            color: '#dceefb',
            align: 'center',
            wordWrap: { width: panelWidth - 30 }
        }).setOrigin(0.5);

        this.launchButton = this.createMissionButton(panelX, panelY + panelHeight * 0.43, 'Launch Deployment (Space)', 0x22d3ee, () => this.launchMission());
        this.rollButton = this.createMissionButton(panelX, panelY + panelHeight * 0.55, 'Reroute to New City (R)', 0xf97316, () => this.rollMission());

        this.add.text(panelX, height - 24, 'Select a district, pick a mode, then launch.', {
            fontFamily: 'Orbitron',
            fontSize: '11px',
            color: '#9fb8d1'
        }).setOrigin(0.5);
    }

    createMissionButton(x, y, label, strokeColor, handler) {
        const button = this.add.rectangle(x, y, 240, 38, 0x0f172a, 0.9)
            .setStrokeStyle(2, strokeColor, 0.8)
            .setInteractive({ useHandCursor: true })
            .setDepth(5);
        const text = this.add.text(x, y, label, {
            fontFamily: 'Orbitron',
            fontSize: '12px',
            color: '#dceefb'
        }).setOrigin(0.5).setDepth(5);

        button.on('pointerover', () => {
            this.tweens.add({ targets: button, alpha: 1, duration: 120 });
        });
        button.on('pointerout', () => {
            this.tweens.add({ targets: button, alpha: 0.9, duration: 120 });
        });
        button.on('pointerdown', () => handler());

        return { button, text };
    }

    ensureEarthTexture(targetWidth, targetHeight) {
        if (this.textures.exists('ui-earth')) {
            this.earthTextureKey = 'ui-earth';
            return;
        }

        const fallbackKey = 'ui-earth-fallback';
        if (!this.textures.exists(fallbackKey)) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x0c1e34, 1);
            g.fillRect(0, 0, targetWidth, targetHeight);

            g.fillStyle(0x163b64, 0.9);
            g.fillEllipse(targetWidth / 2, targetHeight / 2, targetWidth * 0.9, targetHeight * 0.9);
            g.fillStyle(0x1b7fcc, 0.45);
            g.fillEllipse(targetWidth / 2 - 10, targetHeight / 2 - 8, targetWidth * 0.7, targetHeight * 0.65);
            g.lineStyle(3, 0x33c0ff, 0.6);
            g.strokeEllipse(targetWidth / 2, targetHeight / 2, targetWidth * 0.92, targetHeight * 0.92);

            g.generateTexture(fallbackKey, targetWidth, targetHeight);
            g.destroy();
        }

        this.earthTextureKey = fallbackKey;
    }

    generateMission() {
        const cities = [
            'Neo Seattle', 'Skyline Prime', 'Aurora City', 'Nightfall Bay', 'Nova Odessa',
            'Celestia Station', 'Obsidian Ridge', 'Atlas Spire', 'Horizon Arc', 'Lumen Harbor'
        ];

        return {
            city: Phaser.Utils.Array.GetRandom(cities),
            latitude: Phaser.Math.FloatBetween(-70, 70),
            longitude: Phaser.Math.FloatBetween(-170, 170),
            mode: this.selectedMode,
            seed: Phaser.Math.RND.uuid()
        };
    }

    rollMission() {
        this.mission = this.generateMission();
        this.updateMissionUi();
    }

    launchMission() {
        if (!this.selectedDistrict) {
            this.tweens.add({
                targets: this.detailCard,
                alpha: { from: 0.7, to: 1 },
                duration: 140,
                yoyo: true
            });
            return;
        }
        const mode = this.mission?.mode || this.selectedMode;
        if (window.startGame) {
            startGame(mode);
        }
        this.scene.stop();
    }

    updateMissionUi() {
        if (!this.mission || !this.mapImage) return;

        this.positionMarkerOnMap();
        const modeToUse = this.mission.mode || this.selectedMode;
        if (this.selectedMode !== modeToUse) {
            this.selectedMode = modeToUse;
        }
        this.updateModeButtonStyles();

        const { city, latitude, longitude, seed } = this.mission;
        const mode = this.mission.mode || this.selectedMode;
        const modeLabel = mode === 'survival' ? 'Survival' : 'Wave';
        const detail = mode === 'survival'
            ? 'Timed endurance · Evac civilians before the timer drains.'
            : 'Escalating enemy waves · Clear the zone to advance and face bosses.';
        const launchLabel = mode === 'survival' ? 'Launch Survival Run (Space)' : 'Launch Wave Run (Space)';

        this.missionDetails.setText(
            `${city}\nLat ${latitude.toFixed(1)} · Lon ${longitude.toFixed(1)}\nSeed ${seed.slice(0, 6)}\n${modeLabel} Mode — ${detail}`
        );
        if (this.launchButton?.text) {
            this.launchButton.text.setText(launchLabel);
        }
    }

    positionMarkerOnMap() {
        if (!this.mapImage || !this.mission) return;
        const map = this.mapImage;
        const { longitude, latitude } = this.mission;
        const displayW = map.displayWidth;
        const displayH = map.displayHeight;

        const x = map.x - displayW / 2 + ((longitude + 180) / 360) * displayW;
        const y = map.y - displayH / 2 + ((90 - latitude) / 180) * displayH;

        this.mapMarker.setPosition(x, y);
        this.mapPing.setPosition(x, y);
    }

    flashConnector(connector) {
        this.tweens.add({
            targets: connector,
            alpha: { from: 0.35, to: 1 },
            duration: 250,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }

    update(time, delta) {
        const dt = delta / 1000;
        this.districts.forEach(district => {
            if (district.timer > 0) {
                district.timer = Math.max(0, district.timer - dt);
                district.timerText.setText(this.formatTimer(district.timer));
            }
            const pulse = 0.5 + Math.abs(Math.sin(time / 400)) * 0.4;
            district.glow.alpha = 0.05 + pulse * 0.08;
        });

        this.mapNodes.forEach(node => {
            if (node.timer > 0) {
                node.timer = Math.max(0, node.timer - dt);
                node.timerText.setText(this.formatTimer(node.timer));
                node.timerText.setColor(node.timer < 20 ? '#f97316' : '#fef08a');
                if (node.timer < 15) {
                    node.node.setFillStyle(node.node.fillColor, 0.8 + Math.sin(time / 60) * 0.2);
                }
            }
        });
    }

    formatTimer(seconds) {
        const clamped = Math.max(0, Math.floor(seconds));
        const mins = String(Math.floor(clamped / 60)).padStart(2, '0');
        const secs = String(clamped % 60).padStart(2, '0');
        return `${mins}:${secs}`;
    }
}

