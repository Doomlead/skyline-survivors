class BuildMapView {
    constructor(scene) {
        this.scene = scene;
        this.districts = [];
        this.mapNodes = [];
        this.selectedDistrict = null;
        this.mapMarker = null;
        this.mapImage = null;
        this.mapPing = null;
        this.mapMask = null;
        this.mapBitmapMask = null;
        this.planetContainer = null;
        this.onDistrictFocused = null;
        this.onNodeDetailsRequested = null;
        this._persistAccumulator = 0;
        this.earthTextureKey = 'ui-earth';
    }

    preload() {
        this.scene.load.image('ui-earth', 'assets/Art/UI/Earth.png');

        this.scene.load.on('loaderror', (file) => {
            console.error('Failed to load:', file?.key, file?.src);
            if (file?.key === 'ui-earth') {
                this.earthTextureKey = 'ui-earth-fallback';
            }
        });
    }

    build(width, height) {
        const centerX = width * 0.35;
        const centerY = height / 2 + 10;

        this.createStars();
        this.createBackdrop(width, height);

        this.planetContainer = this.scene.add.container(centerX, centerY);
        this.createPlanet();
        this.createMapGlobe();
        this.createDistricts();
        this.createMapMarkers();
        this.createOrbitNodes(width, height, centerX, centerY);
    }

    createStars() {
        const g = this.scene.add.graphics();
        g.fillStyle(0xffffff, 1);
        g.fillCircle(2, 2, 2);
        g.generateTexture('build-star', 4, 4);
        g.destroy();

        this.scene.add.particles(0, 0, 'build-star', {
            x: { min: 0, max: this.scene.scale.width },
            y: { min: 0, max: this.scene.scale.height },
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
        const grid = this.scene.add.graphics();
        grid.lineStyle(1, 0x102a3f, 0.4);
        const spacing = 60;
        for (let x = 0; x < width; x += spacing) {
            grid.lineBetween(x, 0, x, height);
        }
        for (let y = 0; y < height; y += spacing) {
            grid.lineBetween(0, y, width, y);
        }

        const centerGlow = this.scene.add.circle(width / 2, height / 2 + 20, 180, 0x0b2a3b, 0.25);
        centerGlow.setBlendMode(Phaser.BlendModes.ADD);
    }

    createPlanet() {
        const base = this.scene.add.circle(0, 0, 140, 0x0f1a3a, 1);
        const haze = this.scene.add.circle(0, 0, 158, 0x1e9bff, 0.1);
        const rim = this.scene.add.circle(0, 0, 148);
        rim.setStrokeStyle(3, 0x4ade80, 0.6);
        rim.setBlendMode(Phaser.BlendModes.ADD);

        this.planetContainer.add([haze, base, rim]);
        this.scene.tweens.add({
            targets: rim,
            angle: 360,
            duration: 8000,
            repeat: -1,
            ease: 'Linear'
        });
    }

    ensureEarthTexture(targetWidth, targetHeight) {
        const hasEarthTexture = this.scene.textures.exists('ui-earth')
            && this.scene.textures.get('ui-earth')?.getSourceImage()?.width > 1;
        if (hasEarthTexture) {
            this.earthTextureKey = 'ui-earth';
            return;
        }

        const fallbackKey = 'ui-earth-fallback';
        if (!this.scene.textures.exists(fallbackKey)) {
            const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
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

    createMapGlobe() {
        this.ensureEarthTexture(320, 320);

        const maskCircle = this.scene.add.circle(0, 0, 142, 0xffffff, 0.02);
        maskCircle.setVisible(false);
        this.mapMask = maskCircle.createGeometryMask();
        this.mapBitmapMask = maskCircle.createBitmapMask();

        const glow = this.scene.add.ellipse(0, 0, 320, 320, 0x0ea5e9, 0.08);
        glow.setBlendMode(Phaser.BlendModes.ADD);

        this.mapImage = this.scene.add.image(0, 0, this.earthTextureKey);
        this.mapImage.setDisplaySize(280, 280);
        this.mapImage.setAlpha(0.82);
        this.mapImage.setBlendMode(Phaser.BlendModes.NORMAL);
        this.mapImage.setMask(this.mapBitmapMask);

        const grid = this.scene.add.graphics({ x: -140, y: -140 });
        grid.lineStyle(1, 0x22d3ee, 0.15);
        for (let i = 0; i <= 6; i++) {
            const x = (i / 6) * 280;
            grid.lineBetween(x, 0, x, 280);
        }
        for (let j = 0; j <= 6; j++) {
            const y = (j / 6) * 280;
            grid.lineBetween(0, y, 280, y);
        }
        grid.setMask(this.mapMask);

        this.districtLayer = this.scene.add.container(0, 0);
        this.districtLayer.setMask(this.mapMask);

        const terminator = this.scene.add.graphics();
        terminator.fillStyle(0x040b1a, 0.45);
        terminator.slice(0, 0, 150, Phaser.Math.DegToRad(45), Phaser.Math.DegToRad(225), true);
        terminator.fillPath();
        terminator.setBlendMode(Phaser.BlendModes.MULTIPLY);
        terminator.setMask(this.mapMask);

        this.planetContainer.add([glow, this.mapImage, grid, this.districtLayer, terminator]);
    }

    projectLatLon(lat, lon) {
        const displayW = this.mapImage?.displayWidth || 280;
        const displayH = this.mapImage?.displayHeight || 280;
        const x = ((Phaser.Math.Wrap(lon, -180, 180) + 180) / 360) * displayW - displayW / 2;
        const y = ((90 - Phaser.Math.Clamp(lat, -90, 90)) / 180) * displayH - displayH / 2;
        return { x, y };
    }

    getDistrictCenterCoords(config) {
        if (!config) return { lat: 0, lon: 0 };
        if (config.center) return config.center;
        if (config.polygon?.length) {
            const sum = config.polygon.reduce((acc, point) => ({
                lat: acc.lat + (point.lat || 0),
                lon: acc.lon + (point.lon || 0)
            }), { lat: 0, lon: 0 });
            const count = config.polygon.length || 1;
            return { lat: sum.lat / count, lon: sum.lon / count };
        }
        return { lat: 0, lon: 0 };
    }

    buildDistrictPolygon(config) {
        const polygonPoints = (config?.polygon || []).map(point => this.projectLatLon(point.lat, point.lon));
        if (polygonPoints.length >= 3) return polygonPoints;

        const center = this.projectLatLon(this.getDistrictCenterCoords(config).lat, this.getDistrictCenterCoords(config).lon);
        const padding = 12;
        return [
            { x: center.x - padding, y: center.y - padding * 0.8 },
            { x: center.x + padding, y: center.y - padding * 0.6 },
            { x: center.x + padding, y: center.y + padding * 0.8 },
            { x: center.x - padding, y: center.y + padding * 0.6 }
        ];
    }

    getPolygonCentroid(points) {
        if (!points?.length) return { x: 0, y: 0 };
        const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
        const count = points.length || 1;
        return { x: sum.x / count, y: sum.y / count };
    }

    createDistricts() {
        if (typeof missionPlanner === 'undefined') return;

        const sectorConfigs = missionPlanner.getDistrictConfigs();
        this.districtStates = missionPlanner.getAllDistrictStates();

        sectorConfigs.forEach(config => {
            const state = missionPlanner.getDistrictState(config.id);
            const districtPoints = this.buildDistrictPolygon(config);
            const centroid = this.getPolygonCentroid(districtPoints);
            const flatPoints = districtPoints.flatMap(p => [p.x, p.y]);
            const polygonShape = new Phaser.Geom.Polygon(flatPoints);

            const sectorGraphics = this.scene.add.graphics({ x: 0, y: 0 });
            sectorGraphics.fillStyle(config.color, 0.16);
            sectorGraphics.fillPoints(districtPoints, true);
            sectorGraphics.lineStyle(2, config.color, 0.5);
            sectorGraphics.strokePoints(districtPoints, true);
            sectorGraphics.alpha = 0.65;

            const glow = this.scene.add.graphics({ x: 0, y: 0 });
            glow.fillStyle(config.color, 0.06);
            glow.fillPoints(districtPoints, true);
            glow.setBlendMode(Phaser.BlendModes.ADD);
            glow.alpha = 0.5;

            const selectionArea = this.scene.add.polygon(0, 0, flatPoints, 0xffffff, 0.01);
            selectionArea.setInteractive(polygonShape, Phaser.Geom.Polygon.Contains);
            selectionArea.setData('center', centroid);
            if (selectionArea.input) selectionArea.input.cursor = 'pointer';

            const timerLabel = state.status === 'destroyed' ? 'DESTROYED' : this.scene.formatTimer(state.timer);
            const timerColor = state.status === 'destroyed' ? '#f87171' : '#d1f6ff';
            const timerText = this.scene.add.text(
                centroid.x,
                centroid.y - 14,
                timerLabel,
                { fontFamily: 'Orbitron', fontSize: '12px', color: timerColor }
            ).setOrigin(0.5);

            const nameLabel = this.scene.add.text(
                centroid.x,
                centroid.y + 6,
                config.name,
                { fontFamily: 'Orbitron', fontSize: '11px', color: '#c3e8ff' }
            ).setOrigin(0.5);

            const district = { config, sectorGraphics, glow, selectionArea, timerText, nameLabel, state };
            (this.districtLayer || this.planetContainer).add([glow, sectorGraphics, selectionArea, timerText, nameLabel]);
            this.enableDistrictInteractions(district);
            this.districts.push(district);
        });
    }

    createMapMarkers() {
        this.mapMarker = this.scene.add.circle(0, 0, 5, 0xff4d6d, 1);
        this.mapMarker.setStrokeStyle(2, 0xffffff, 0.8);
        this.mapMarker.setDepth(4);
        if (this.mapMask) this.mapMarker.setMask(this.mapMask);

        this.mapPing = this.scene.add.circle(0, 0, 8, 0xff8fab, 0.35);
        this.mapPing.setBlendMode(Phaser.BlendModes.ADD);
        this.mapPing.setDepth(3);
        if (this.mapMask) this.mapPing.setMask(this.mapMask);
        this.scene.tweens.add({
            targets: this.mapPing,
            scale: { from: 1, to: 2 },
            alpha: { from: 0.5, to: 0 },
            duration: 900,
            repeat: -1
        });

        this.planetContainer.add([this.mapPing, this.mapMarker]);
    }

    enableDistrictInteractions(district) {
        district.selectionArea.on('pointerover', () => {
            this.scene.tweens.add({ targets: [district.sectorGraphics, district.glow], alpha: 0.9, duration: 120 });
        });
        district.selectionArea.on('pointerout', () => {
            this.scene.tweens.add({ targets: [district.sectorGraphics, district.glow], alpha: 0.5, duration: 160 });
        });
        district.selectionArea.on('pointerdown', () => this.focusDistrict(district));
    }

    focusDistrict(district, skipTweens = false) {
        if (this.selectedDistrict === district) {
            return;
        }
        this.selectedDistrict = district;
        this.onDistrictFocused?.(district);

        if (!skipTweens) {
            this.scene.tweens.add({
                targets: this.scene.cameras.main,
                zoom: 1.12,
                duration: 240,
                yoyo: true,
                ease: 'Sine.easeInOut'
            });
            this.scene.tweens.add({
                targets: this.planetContainer,
                scale: 1.05,
                duration: 200,
                yoyo: true,
                ease: 'Sine.easeOut'
            });
        }
    }

    createOrbitNodes(width, height, centerX, centerY) {
        if (typeof missionPlanner === 'undefined') return;

        const nodeConfigs = [
            { id: 'mothership', label: 'Mothership', angle: -40, radius: 230, color: 0xf472b6, timer: 65, rewardModifier: 1.15, spawnModifier: 1.15 },
            { id: 'shop', label: 'Shop', angle: 70, radius: 250, color: 0x22d3ee, timer: 0, rewardModifier: 1.05, spawnModifier: 1 },
            { id: 'relay', label: 'Relay', angle: 160, radius: 240, color: 0x93c5fd, timer: 45, rewardModifier: 1.1, spawnModifier: 1.05 },
            { id: 'distress', label: 'Distress Node', angle: 240, radius: 210, color: 0xfacc15, timer: 30, rewardModifier: 1.2, spawnModifier: 1.2 }
        ];

        const orbitLines = this.scene.add.graphics();
        orbitLines.lineStyle(1, 0x0ea5e9, 0.25);
        orbitLines.strokeCircle(centerX, centerY, 210);
        orbitLines.strokeCircle(centerX, centerY, 240);
        orbitLines.strokeCircle(centerX, centerY, 270);

        nodeConfigs.forEach(config => {
            const x = centerX + Math.cos(Phaser.Math.DegToRad(config.angle)) * config.radius;
            const y = centerY + Math.sin(Phaser.Math.DegToRad(config.angle)) * config.radius;

            const connector = this.scene.add.graphics();
            connector.lineStyle(1.5, 0x1dcaff, 0.3);
            connector.lineBetween(centerX, centerY, x, y);

            const node = this.scene.add.circle(x, y, 12, config.color, 0.9);
            node.setStrokeStyle(2, 0xffffff, 0.8);
            node.setBlendMode(Phaser.BlendModes.ADD);

            const pulse = this.scene.tweens.add({ targets: node, scale: 1.25, duration: 700, yoyo: true, repeat: -1 });

            const nodeState = missionPlanner.ensureMapNodeState(config);

            const label = this.scene.add.text(x, y - 22, config.label, {
                fontFamily: 'Orbitron',
                fontSize: '11px',
                color: '#c7e6ff',
                align: 'center'
            }).setOrigin(0.5);

            const timerLabel = nodeState.status === 'destroyed'
                ? 'DESTROYED'
                : nodeState.timer > 0
                    ? this.scene.formatTimer(nodeState.timer)
                    : 'STABLE';
            const timerColor = nodeState.status === 'destroyed' ? '#f87171' : (nodeState.timer > 0 ? '#fef08a' : '#a7f3d0');

            const timerText = this.scene.add.text(x, y + 16, timerLabel, {
                fontFamily: 'Orbitron',
                fontSize: '10px',
                color: timerColor
            }).setOrigin(0.5);

            this.mapNodes.push({ id: config.id, config, node, label, timerText, pulse, connector, state: nodeState });

            node.setInteractive({ useHandCursor: true });
            node.on('pointerdown', () => {
                const liveState = missionPlanner.getMapNodeState(config.id) || nodeState;
                this.flashConnector(connector);
                const nodeStatus = liveState.status === 'destroyed'
                    ? 'Destroyed — comms offline'
                    : liveState.timer > 0
                        ? `Threatened — event in ${this.scene.formatTimer(liveState.timer)}`
                        : 'Stable';

                this.onNodeDetailsRequested?.(
                    `${config.label} Node`,
                    `Status: ${nodeStatus}\n` +
                    'Tap a district sector to deploy, or stabilize nearby threats first.\n' +
                    `Rewards: x${(liveState.rewardModifier || 1).toFixed(2)} · Spawn: x${(liveState.spawnModifier || 1).toFixed(2)}`
                );
            });
        });
    }

    flashConnector(connector) {
        this.scene.tweens.add({
            targets: connector,
            alpha: { from: 0.35, to: 1 },
            duration: 250,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }

    update(time, delta, mission) {
        if (typeof missionPlanner === 'undefined') return mission;

        const dt = delta / 1000;
        missionPlanner.tickDistricts(dt);
        this._persistAccumulator += dt;

        this.districts.forEach(district => {
            const state = missionPlanner.getDistrictState(district.config.id);
            district.state = state;
            if (state.status === 'destroyed') {
                district.timerText.setText('DESTROYED');
                district.timerText.setColor('#f87171');
                district.nameLabel.setColor('#fca5a5');
                district.glow.alpha = 0.02;
            } else {
                district.timerText.setText(this.scene.formatTimer(state.timer));
                district.timerText.setColor(state.timer < 30 ? '#f97316' : '#d1f6ff');
                district.nameLabel.setColor(state.timer < 30 ? '#fcd34d' : '#c3e8ff');
                const pulse = 0.5 + Math.abs(Math.sin(time / 400)) * 0.4;
                district.glow.alpha = 0.05 + pulse * 0.08;
            }
        });

        if (this.selectedDistrict && mission?.district === this.selectedDistrict.config.id && this._persistAccumulator > 1) {
            const { lon } = this.getDistrictCenterCoords(this.selectedDistrict.config);
            mission = missionPlanner.selectDistrict(this.selectedDistrict.config.id, lon);
        }

        this.mapNodes.forEach(node => {
            const stored = missionPlanner.getMapNodeState(node.id) || node.state;
            node.state = stored;
            if (stored.status !== 'destroyed' && stored.timer > 0) {
                const newTimer = Math.max(0, stored.timer - dt);
                if (newTimer !== stored.timer) {
                    node.state = missionPlanner.updateMapNodeState(node.id, { timer: newTimer });
                }
            }

            if (node.state.timer === 0 && node.state.status !== 'stable' && node.state.status !== 'destroyed') {
                node.state = missionPlanner.updateMapNodeState(node.id, { status: 'destroyed' });
            }

            const labelColor = node.state.status === 'destroyed'
                ? '#fca5a5'
                : node.state.timer > 0
                    ? '#fef3c7'
                    : '#a7f3d0';
            const timerLabel = node.state.status === 'destroyed'
                ? 'DESTROYED'
                : node.state.timer > 0
                    ? this.scene.formatTimer(node.state.timer)
                    : 'STABLE';
            node.timerText.setText(timerLabel);
            node.timerText.setColor(labelColor);
            node.label.setColor(labelColor);

            if (node.state.status === 'destroyed') {
                node.node.setFillStyle(node.node.fillColor, 0.35);
                node.connector.alpha = 0.15;
            } else if (node.state.timer > 0) {
                node.node.setFillStyle(node.node.fillColor, 0.8 + Math.sin(time / 60) * 0.2);
                node.connector.alpha = 0.4;
            } else {
                node.node.setFillStyle(node.node.fillColor, 0.9);
                node.connector.alpha = 0.3;
            }
        });

        if (this._persistAccumulator > 5) {
            missionPlanner.tickDistricts(0);
            this._persistAccumulator = 0;
        }

        return mission;
    }

    positionMarkerOnMap(mission) {
        if (!this.mapImage || !mission) return;
        const map = this.mapImage;
        const { longitude, latitude } = mission;
        const displayW = map.displayWidth;
        const displayH = map.displayHeight;

        const x = map.x - displayW / 2 + ((longitude + 180) / 360) * displayW;
        const y = map.y - displayH / 2 + ((90 - latitude) / 180) * displayH;

        if (this.mapMarker) this.mapMarker.setPosition(x, y);
        if (this.mapPing) this.mapPing.setPosition(x, y);
    }
}

class BuildMissionUi {
    constructor(scene) {
        this.scene = scene;
        this.modeButtons = null;
        this.modeButtonRefs = [];
        this.modeHint = null;
        this.detailCard = null;
        this.detailTitle = null;
        this.detailBody = null;
        this.missionHeader = null;
        this.panelSummary = null;
        this.missionDetails = null;
        this.nodeStatusText = null;
        this.launchButton = null;
        this.rollButton = null;
        this.onModeSelected = null;
    }

    createOverlay(width) {
        const header = this.scene.add.text(width / 2, 28, 'District + Build Map', {
            fontFamily: 'Orbitron',
            fontSize: '18px',
            color: '#8bffff',
            align: 'center'
        }).setOrigin(0.5);
        header.setShadow(0, 0, '#0ea5e9', 8, true, true);

        this.detailCard = this.scene.add.rectangle(width / 2, 60, 420, 70, 0x0b1220, 0.7)
            .setStrokeStyle(1, 0x1d4ed8, 0.8);
        this.detailCard.setOrigin(0.5, 0);
        this.detailCard.setScrollFactor(0);

        this.detailTitle = this.scene.add.text(width / 2 - 180, 70, 'Select a district', {
            fontFamily: 'Orbitron',
            fontSize: '14px',
            color: '#c7e3ff'
        });
    }

    createModeButtons(width, selectedMode) {
        this.modeButtons = this.scene.add.container(width * 0.35, 150);
        this.modeButtonRefs = [];

        const createButton = (offsetX, label, color, mode) => {
            const rect = this.scene.add.rectangle(offsetX, 0, 150, 38, 0x0f172a, 0.85)
                .setStrokeStyle(2, color, 0.7)
                .setInteractive({ useHandCursor: true });
            const text = this.scene.add.text(offsetX, 0, label, {
                fontFamily: 'Orbitron',
                fontSize: '12px',
                color: '#d1f6ff'
            }).setOrigin(0.5);

            rect.on('pointerover', () => {
                this.scene.tweens.add({ targets: rect, alpha: 1, duration: 120 });
            });
            rect.on('pointerout', () => {
                this.scene.tweens.add({ targets: rect, alpha: 0.85, duration: 160 });
            });
            rect.on('pointerdown', () => this.onModeSelected?.(mode));

            this.modeButtonRefs.push({ rect, text, mode, color });
            this.modeButtons.add([rect, text]);
        };

        createButton(-90, 'Wave Mode', 0x7dd3fc, 'classic');
        createButton(90, 'Survival Mode', 0x22d3ee, 'survival');

        this.modeHint = this.scene.add.text(width * 0.35, 185,
            'Select a district to deploy and then choose your mode.', {
                fontFamily: 'Orbitron',
                fontSize: '11px',
                color: '#9fb8d1'
            }).setOrigin(0.5);

        this.updateModeButtonStyles(selectedMode);
    }

    createDetailBody(width, mapNodes) {
        const hasTimedNodes = (typeof missionPlanner !== 'undefined' && missionPlanner.hasMapTimerData()) && mapNodes.some(
            node => (node.state?.timer || 0) > 0);
        const overlayDescription = hasTimedNodes
            ? 'Hover or click a glowing sector to zoom in.\nNodes with active timers will destabilize—stabilize the most critical threats first.\nChoose a mode below to deploy to the selected district.'
            : 'Hover or click a glowing sector to zoom in.\nThis map is static for now—select a sector and prep a deployment when ready.\nChoose a mode below to deploy to the selected district.';

        this.detailBody = this.scene.add.text(width / 2 - 180, 90, overlayDescription, {
            fontFamily: 'Orbitron',
            fontSize: '11px',
            color: '#9fb8d1'
        });
    }

    createMissionConsole(width, height, { onLaunch, onReroute }) {
        const panelWidth = width * 0.42;
        const panelHeight = height * 0.62;
        const panelX = width * 0.78;
        const panelY = height * 0.48;

        const panel = this.scene.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x0c1e34, 0.85);
        panel.setStrokeStyle(3, 0x33c0ff, 0.8);
        const inner = this.scene.add.rectangle(panelX, panelY, panelWidth - 16, panelHeight - 16, 0x07162b, 0.9);
        inner.setStrokeStyle(2, 0x0a85ff, 0.3);

        this.missionHeader = this.scene.add.text(panelX, panelY - panelHeight / 2 + 18, 'Mission & Build Routing', {
            fontFamily: 'Orbitron',
            fontSize: '14px',
            color: '#c7e3ff'
        }).setOrigin(0.5);

        this.panelSummary = this.scene.add.text(panelX, panelY - panelHeight * 0.05, '', {
            fontFamily: 'Orbitron',
            fontSize: '11px',
            color: '#dceefb',
            align: 'center',
            wordWrap: { width: panelWidth - 30 }
        }).setOrigin(0.5);

        this.missionDetails = this.scene.add.text(panelX, panelY + panelHeight * 0.12, '', {
            fontFamily: 'Orbitron',
            fontSize: '11px',
            color: '#dceefb',
            align: 'center',
            wordWrap: { width: panelWidth - 30 }
        }).setOrigin(0.5);

        this.nodeStatusText = this.scene.add.text(panelX, panelY + panelHeight * 0.29, '', {
            fontFamily: 'Orbitron',
            fontSize: '10px',
            color: '#9fb8d1',
            align: 'center',
            lineSpacing: 2,
            wordWrap: { width: panelWidth - 40 }
        }).setOrigin(0.5);

        this.launchButton = this.createMissionButton(panelX, panelY + panelHeight * 0.43, 'Launch Deployment (Space)', 0x22d3ee, onLaunch);
        this.rollButton = this.createMissionButton(panelX, panelY + panelHeight * 0.55, 'Reroute to New City (R)', 0xf97316, onReroute);

        this.scene.add.text(panelX, height - 24, 'Select a district, pick a mode, then launch.', {
            fontFamily: 'Orbitron',
            fontSize: '11px',
            color: '#9fb8d1'
        }).setOrigin(0.5);
    }

    createMissionButton(x, y, label, strokeColor, handler) {
        const button = this.scene.add.rectangle(x, y, 240, 38, 0x0f172a, 0.9)
            .setStrokeStyle(2, strokeColor, 0.8)
            .setInteractive({ useHandCursor: true })
            .setDepth(5);
        const text = this.scene.add.text(x, y, label, {
            fontFamily: 'Orbitron',
            fontSize: '12px',
            color: '#dceefb'
        }).setOrigin(0.5).setDepth(5);

        button.on('pointerover', () => {
            this.scene.tweens.add({ targets: button, alpha: 1, duration: 120 });
        });
        button.on('pointerout', () => {
            this.scene.tweens.add({ targets: button, alpha: 0.9, duration: 120 });
        });
        if (handler) {
            button.on('pointerdown', () => handler());
        }

        return { button, text };
    }

    updateModeButtonStyles(selectedMode) {
        if (!this.modeButtonRefs) return;
        this.modeButtonRefs.forEach(({ rect, text, mode, color }) => {
            const active = mode === selectedMode;
            rect.setFillStyle(0x0f172a, active ? 1 : 0.85);
            rect.setStrokeStyle(2, color, active ? 1 : 0.6);
            rect.setScale(active ? 1.02 : 1);
            text.setColor(active ? '#e0f2fe' : '#d1f6ff');
        });
    }

    updateDetail(title, body) {
        if (this.detailTitle) this.detailTitle.setText(title);
        if (this.detailBody) this.detailBody.setText(body);
    }

    refreshNodeStatusText(mapNodes, selectedDistrict) {
        if (!this.nodeStatusText) return;
        const lines = mapNodes.map(node => {
            const statusLabel = node.state.status === 'destroyed'
                ? 'DOWN'
                : node.state.timer > 0
                    ? `T-${this.scene.formatTimer(node.state.timer)}`
                    : 'STABLE';
            return `${node.config.label}: ${statusLabel}`;
        });
        const district = selectedDistrict ? `${selectedDistrict.config.name}: ${selectedDistrict.state.status.toUpperCase()}` : 'No district selected';
        this.nodeStatusText.setText([
            'Unified Map Status',
            district,
            ...lines
        ].join('\n'));
    }

    updateMissionUi(mission, selectedMode, selectedDistrict, mapNodes) {
        if (!mission || !this.panelSummary) return;

        const modeToUse = mission.mode || selectedMode;
        const { city, latitude, longitude, seed, directives } = mission;
        const mode = mission.mode || selectedMode;
        const modeLabel = mode === 'survival' ? 'Survival' : 'Wave';
        const directiveLabel = directives?.urgency ? `${directives.urgency.toUpperCase()} THREAT` : 'Threat mix pending';
        const rewardLabel = directives?.rewardMultiplier ? `${directives.rewardMultiplier.toFixed(2)}x rewards · ${directives.reward}` : 'Standard rewards';
        const launchLabel = mode === 'survival' ? 'Launch Survival Run (Space)' : 'Launch Wave Run (Space)';

        this.panelSummary.setText(
            `${city}\nLat ${latitude.toFixed(1)} · Lon ${longitude.toFixed(1)}\nSeed ${seed.slice(0, 6)}`
        );
        this.missionDetails.setText(
            `${modeLabel} Mode — ${directiveLabel}\n${rewardLabel}`
        );
        this.refreshNodeStatusText(mapNodes, selectedDistrict);
        if (this.launchButton?.text) {
            this.launchButton.text.setText(launchLabel);
        }
        this.updateModeButtonStyles(modeToUse);
    }

    updateExternalLaunchButton(selectedDistrict, mission, selectedMode) {
        const btn = document.getElementById('build-launch');
        if (!btn) return;
        const hasSelection = !!selectedDistrict;
        const mode = mission?.mode || selectedMode;
        const labelMode = mode === 'survival' ? 'Survival' : 'Wave';
        const districtName = selectedDistrict?.config?.name || 'mission';
        btn.disabled = !hasSelection;
        btn.textContent = hasSelection
            ? `Launch ${labelMode} Run — ${districtName}`
            : 'Select a district to launch';
        btn.classList.toggle('opacity-50', !hasSelection);
        btn.classList.toggle('cursor-not-allowed', !hasSelection);
    }
}

class BuildScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENE_KEYS.build, active: false, visible: false });
        this.selectedDistrict = null;
        this.mission = null;
        this.selectedMode = 'classic';
        this.mapModule = new BuildMapView(this);
        this.uiModule = new BuildMissionUi(this);
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
        this.uiModule.onModeSelected = (mode) => this.selectMode(mode);

        this.mapModule.build(width, height);
        this.uiModule.createOverlay(width);
        this.uiModule.createModeButtons(width, this.selectedMode);
        this.uiModule.createDetailBody(width, this.mapModule.mapNodes);
        this.uiModule.createMissionConsole(width, height, {
            onLaunch: () => this.launchMission(),
            onReroute: () => this.rollMission()
        });

        this.updateMissionUi();
        this.uiModule.updateExternalLaunchButton(this.selectedDistrict, this.mission, this.selectedMode);

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
    }

    updateMissionUi() {
        if (!this.mission || !this.mapModule.mapImage || !this.uiModule.panelSummary) return;

        this.mapModule.positionMarkerOnMap(this.mission);
        if (this.selectedMode !== (this.mission.mode || this.selectedMode)) {
            this.selectedMode = this.mission.mode || this.selectedMode;
        }

        this.uiModule.updateMissionUi(this.mission, this.selectedMode, this.selectedDistrict, this.mapModule.mapNodes);
        this.uiModule.updateExternalLaunchButton(this.selectedDistrict, this.mission, this.selectedMode);
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
    }

    formatTimer(seconds) {
        const clamped = Math.max(0, Math.floor(seconds));
        const mins = String(Math.floor(clamped / 60)).padStart(2, '0');
        const secs = String(clamped % 60).padStart(2, '0');
        return `${mins}:${secs}`;
    }
}
