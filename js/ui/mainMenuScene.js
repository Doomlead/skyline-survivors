class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENE_KEYS.menu, active: true });
        this.mission = null;
        this.mapMarker = null;
        this.mapImage = null;
        this.mapPing = null;
    }

    preload() {
        this.load.image('ui-earth', 'assets/Art/U.I/Earth.png');
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#050912');

        this.createBackdrop(width, height);
        this.createTitle(width);

        this.layoutFrame(width, height);

        this.mission = this.generateMission();
        this.createWorldMap(width, height * 0.46);
        this.createLowerPanels(width, height);
        this.updateMissionUi();

        this.input.keyboard.once('keydown-SPACE', () => {
            this.launchMission();
        });

        this.input.keyboard.on('keydown-R', () => this.rollMission());
    }

    createBackdrop(width, height) {
        const g = this.add.graphics();
        g.lineStyle(1, 0x0f1f3a, 0.35);
        for (let x = 0; x < width; x += 50) {
            g.lineBetween(x, 0, x, height);
        }
        for (let y = 0; y < height; y += 50) {
            g.lineBetween(0, y, width, y);
        }

        const glow = this.add.rectangle(width / 2, height / 2, width * 0.6, height * 0.4, 0x0b2a3b, 0.45);
        glow.setBlendMode(Phaser.BlendModes.ADD);
    }

    createTitle(width) {
        const title = this.add.text(width / 2, 80, 'Skyline Survivors', {
            fontFamily: 'Orbitron',
            fontSize: '28px',
            color: '#8bf1ff',
            align: 'center'
        }).setOrigin(0.5);
        title.setShadow(0, 0, '#1fb6ff', 10, true, true);

        this.add.text(width / 2, 120, 'Command Deck', {
            fontFamily: 'Orbitron',
            fontSize: '14px',
            color: '#c7e3ff',
            align: 'center'
        }).setOrigin(0.5);
    }

    layoutFrame(width, height) {
        const outer = this.add.rectangle(width / 2, height / 2, width * 0.92, height * 0.86, 0x041021, 0.8);
        outer.setStrokeStyle(4, 0x3ba7ff, 0.8);
        outer.setDepth(1);

        const inner = this.add.rectangle(width / 2, height / 2, width * 0.88, height * 0.8, 0x07162b, 0.8);
        inner.setStrokeStyle(3, 0x1b4f8f, 0.7);
        inner.setDepth(1);
    }

    createWorldMap(width, mapHeight) {
        const panelWidth = width * 0.88;
        const panelHeight = mapHeight;
        const panelY = mapHeight * 0.55;

        const panel = this.createPanel(width / 2, panelY, panelWidth, panelHeight, 0x0c1e34, 0x33c0ff);
        panel.container.setDepth(2);

        this.mapImage = this.add.image(width / 2, panelY, 'ui-earth');
        this.mapImage.setDisplaySize(panelWidth - 40, panelHeight - 40);
        this.mapImage.setBlendMode(Phaser.BlendModes.NORMAL);
        this.mapImage.setDepth(3);

        this.mapMarker = this.add.circle(width / 2, panelY, 5, 0xff4d6d, 1);
        this.mapMarker.setStrokeStyle(2, 0xffffff, 0.8);
        this.mapMarker.setDepth(4);

        this.mapPing = this.add.circle(width / 2, panelY, 8, 0xff8fab, 0.3);
        this.mapPing.setDepth(3);
        this.tweens.add({
            targets: this.mapPing,
            scale: { from: 1, to: 2 },
            alpha: { from: 0.5, to: 0 },
            duration: 900,
            repeat: -1
        });
    }

    createLowerPanels(width, height) {
        const panelWidth = width * 0.28;
        const panelHeight = height * 0.24;
        const bottomY = height - panelHeight / 2 - 32;

        this.cityPanel = this.createPanel(width * 0.2, bottomY, panelWidth, panelHeight, 0x0a1a2f, 0x4ade80);
        this.modePanel = this.createPanel(width * 0.8, bottomY, panelWidth, panelHeight, 0x0a1a2f, 0xa78bfa);

        this.summaryPanel = this.createPanel(width / 2, bottomY, width * 0.32, panelHeight, 0x0f172a, 0x22d3ee);

        this.cityTitle = this.add.text(this.cityPanel.container.x, this.cityPanel.container.y - panelHeight * 0.35, 'City', {
            fontFamily: 'Orbitron', fontSize: '13px', color: '#c7e3ff'
        }).setOrigin(0.5).setDepth(4);
        this.cityBody = this.add.text(this.cityPanel.container.x, this.cityPanel.container.y, '', {
            fontFamily: 'Orbitron', fontSize: '12px', color: '#9fb8d1', align: 'center',
            wordWrap: { width: panelWidth - 30 }
        }).setOrigin(0.5).setDepth(4);

        this.modeTitle = this.add.text(this.modePanel.container.x, this.modePanel.container.y - panelHeight * 0.35, 'Mode', {
            fontFamily: 'Orbitron', fontSize: '13px', color: '#c7e3ff'
        }).setOrigin(0.5).setDepth(4);
        this.modeBody = this.add.text(this.modePanel.container.x, this.modePanel.container.y, '', {
            fontFamily: 'Orbitron', fontSize: '12px', color: '#dceefb', align: 'center',
            wordWrap: { width: panelWidth - 30 }
        }).setOrigin(0.5).setDepth(4);
        this.modePanel.container.setInteractive({ useHandCursor: true });
        this.modePanel.container.on('pointerdown', () => this.toggleMode());

        const summaryTop = this.summaryPanel.container.y - panelHeight * 0.35;
        this.add.text(this.summaryPanel.container.x, summaryTop, 'Deployment Console', {
            fontFamily: 'Orbitron', fontSize: '13px', color: '#c7e3ff'
        }).setOrigin(0.5).setDepth(4);

        const launchY = this.summaryPanel.container.y - 6;
        this.launchButton = this.createMenuButton(this.summaryPanel.container.x, launchY, 'Launch Deployment (Space)', '#22d3ee', () => this.launchMission());
        const rerollY = this.summaryPanel.container.y + 36;
        this.rollButton = this.createMenuButton(this.summaryPanel.container.x, rerollY, 'Reroute to New City (R)', '#f97316', () => this.rollMission());

        this.add.text(width / 2, height - 36, 'Wave Mode: escalating waves · Survival Mode: timed endurance · Map marker shows battle hotspot', {
            fontFamily: 'Orbitron', fontSize: '11px', color: '#9fb8d1', align: 'center',
            wordWrap: { width: width - 100 }
        }).setOrigin(0.5).setDepth(4);
    }

    createPanel(x, y, w, h, fill, stroke) {
        const panel = this.add.rectangle(x, y, w, h, fill, 0.85);
        panel.setStrokeStyle(3, stroke, 0.8);
        panel.setDepth(2);

        const inner = this.add.rectangle(x, y, w - 12, h - 12, 0x0b1b30, 0.9);
        inner.setStrokeStyle(2, 0x0a85ff, 0.2);
        inner.setDepth(2);

        const indicators = this.add.rectangle(x, y - h / 2 + 14, w - 22, 10, 0x132742, 0.9);
        indicators.setStrokeStyle(1, stroke, 0.5);
        indicators.setDepth(2);

        return { container: panel, inner, indicators };
    }

    createMenuButton(x, y, label, strokeColor, handler) {
        const button = this.add.rectangle(x, y, 260, 44, 0x0f172a, 0.9)
            .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(strokeColor).color, 0.8)
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
        button.on('pointerdown', () => {
            handler();
        });

        return { button, text };
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
            mode: Phaser.Utils.Array.GetRandom(['classic', 'survival']),
            seed: Phaser.Math.RND.uuid()
        };
    }

    rollMission() {
        this.mission = this.generateMission();
        this.updateMissionUi();
    }

    toggleMode() {
        if (!this.mission) return;
        this.mission.mode = this.mission.mode === 'survival' ? 'classic' : 'survival';
        this.updateMissionUi();
    }

    launchMission() {
        if (window.startGame) startGame(this.mission.mode);
    }

    updateMissionUi() {
        if (!this.mission || !this.mapImage) return;

        this.positionMarkerOnMap();

        const { city, latitude, longitude, seed } = this.mission;
        this.cityTitle.setText('Target City');
        this.cityBody.setText(`${city}\nLat ${latitude.toFixed(1)} · Lon ${longitude.toFixed(1)}\nMap Seed ${seed.slice(0, 5)}`);

        const modeLabel = this.mission.mode === 'survival' ? 'Survival' : 'Wave';
        const headline = `${modeLabel} Deployment`;
        const detail = this.mission.mode === 'survival'
            ? 'Timed endurance · Evac as many civilians as possible while timer drains.'
            : 'Escalating enemy waves · Clear the zone to advance and fight bosses.';
        this.modeTitle.setText(`${modeLabel} Mode`);
        this.modeBody.setText(`${headline}\n${detail}`);

        const launchLabel = this.mission.mode === 'survival' ? 'Launch Survival Run (Space)' : 'Launch Wave Run (Space)';
        if (this.launchButton?.text) {
            this.launchButton.text.setText(launchLabel);
        }
    }

    positionMarkerOnMap() {
        const map = this.mapImage;
        const { longitude, latitude } = this.mission;
        const displayW = map.displayWidth;
        const displayH = map.displayHeight;

        const x = map.x - displayW / 2 + ((longitude + 180) / 360) * displayW;
        const y = map.y - displayH / 2 + ((90 - latitude) / 180) * displayH;

        this.mapMarker.setPosition(x, y);
        this.mapPing.setPosition(x, y);
    }
}
