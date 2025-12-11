class BuildMapView {
    constructor(scene) {
        this.scene = scene;
        this.districts = [];
        this.mapNodes = [];
        this.selectedDistrict = null;
        this.mapMarker = null;
        this.mapPing = null;
        this.planetContainer = null;
        this.onDistrictFocused = null;
        this.onNodeDetailsRequested = null;
        this._persistAccumulator = 0;

        // 3D Globe state
        this.rotationX = 0.3;
        this.rotationY = 0;
        this.globeRadius = 140;
        this.isDragging = false;
        this.lastPointer = { x: 0, y: 0 };
        this.autoRotate = true;
        this.autoRotateSpeed = 0.002;
        this.centerX = 0;
        this.centerY = 0;

        // Graphics layers for globe
        this.oceanGraphics = null;
        this.landGraphics = null;
        this.borderGraphics = null;
        this.gridGraphics = null;
        this.atmosphereGraphics = null;
        this.districtGraphics = null;
        this.markerGraphics = null;
    }

    preload() {
        // No texture needed for 3D globe - it's all procedural
    }

    build(width, height) {
        this.centerX = width * 0.35;
        this.centerY = height / 2 + 10;

        this.createStars();
        this.createBackdrop(width, height);

        // Create planet container at globe center
        this.planetContainer = this.scene.add.container(this.centerX, this.centerY);

        // Create graphics layers for globe rendering
        this.atmosphereGraphics = this.scene.add.graphics();
        this.oceanGraphics = this.scene.add.graphics();
        this.gridGraphics = this.scene.add.graphics();
        this.landGraphics = this.scene.add.graphics();
        this.borderGraphics = this.scene.add.graphics();
        this.districtGraphics = this.scene.add.graphics();
        this.markerGraphics = this.scene.add.graphics();

        // Add graphics to container (order matters for layering)
        this.planetContainer.add([
            this.atmosphereGraphics,
            this.oceanGraphics,
            this.gridGraphics,
            this.landGraphics,
            this.borderGraphics,
            this.districtGraphics,
            this.markerGraphics
        ]);

        // Create district data (but don't render yet - that happens in renderGlobe)
        this.initializeDistricts();
        this.createMapMarkers();
        this.createOrbitNodes(width, height, this.centerX, this.centerY);

        // Set up input handlers for globe rotation
        this.setupGlobeInput();

        // Initial render
        this.renderGlobe();
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

    setupGlobeInput() {
        // Drag to rotate
        this.scene.input.on('pointerdown', (pointer) => {
            const dist = Phaser.Math.Distance.Between(
                pointer.x, pointer.y,
                this.centerX, this.centerY
            );
            if (dist < this.globeRadius + 50) {
                this.isDragging = true;
                this.autoRotate = false;
                this.lastPointer = { x: pointer.x, y: pointer.y };
            }
        });

        this.scene.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                const deltaX = pointer.x - this.lastPointer.x;
                const deltaY = pointer.y - this.lastPointer.y;

                this.rotationY += deltaX * 0.005;
                this.rotationX -= deltaY * 0.005;
                this.rotationX = Phaser.Math.Clamp(this.rotationX, -Math.PI / 2, Math.PI / 2);

                this.lastPointer = { x: pointer.x, y: pointer.y };
            }
        });

        this.scene.input.on('pointerup', () => {
            this.isDragging = false;
        });

        // Scroll to zoom
        this.scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            const dist = Phaser.Math.Distance.Between(
                pointer.x, pointer.y,
                this.centerX, this.centerY
            );
            if (dist < this.globeRadius + 100) {
                this.globeRadius -= deltaY * 0.1;
                this.globeRadius = Phaser.Math.Clamp(this.globeRadius, 100, 200);
            }
        });

        // Keyboard controls
        this.scene.input.keyboard.on('keydown-SPACE', () => {
            // Don't toggle auto-rotate on space if it's used for launching
        });
    }

    // 3D projection: lat/lon to screen coordinates
    project3D(lat, lon) {
        const latRad = lat * Math.PI / 180;
        const lonRad = lon * Math.PI / 180;

        let x = Math.cos(latRad) * Math.sin(lonRad);
        let y = Math.sin(latRad);
        let z = Math.cos(latRad) * Math.cos(lonRad);

        // Rotate around Y axis
        const cosY = Math.cos(this.rotationY);
        const sinY = Math.sin(this.rotationY);
        let newX = x * cosY - z * sinY;
        let newZ = x * sinY + z * cosY;
        x = newX;
        z = newZ;

        // Rotate around X axis
        const cosX = Math.cos(this.rotationX);
        const sinX = Math.sin(this.rotationX);
        const newY = y * cosX - z * sinX;
        const finalZ = y * sinX + z * cosX;
        y = newY;
        z = finalZ;

        return {
            x: x * this.globeRadius,
            y: -y * this.globeRadius,
            z: z,
            visible: z > 0
        };
    }

    renderGlobe() {
        // Clear all graphics
        this.atmosphereGraphics.clear();
        this.oceanGraphics.clear();
        this.gridGraphics.clear();
        this.landGraphics.clear();
        this.borderGraphics.clear();
        this.districtGraphics.clear();
        this.markerGraphics.clear();

        this.drawAtmosphere();
        this.drawOcean();
        this.drawGrid();
        this.drawAllLand();
        this.drawDistricts();
        this.drawMarkers();
        this.drawGlobeRim();
    }

    drawAtmosphere() {
        for (let i = 5; i > 0; i--) {
            this.atmosphereGraphics.lineStyle(3, 0x4ade80, 0.03 * i);
            this.atmosphereGraphics.strokeCircle(0, 0, this.globeRadius + i * 4);
        }
    }

    drawOcean() {
        // Main ocean
        this.oceanGraphics.fillStyle(0x0a3d62, 1);
        this.oceanGraphics.fillCircle(0, 0, this.globeRadius);

        // Light reflection
        this.oceanGraphics.fillStyle(0x1a5276, 0.5);
        this.oceanGraphics.fillCircle(-this.globeRadius * 0.2, -this.globeRadius * 0.2, this.globeRadius * 0.7);

        this.oceanGraphics.fillStyle(0x2874a6, 0.3);
        this.oceanGraphics.fillCircle(-this.globeRadius * 0.3, -this.globeRadius * 0.3, this.globeRadius * 0.4);
    }

    drawGrid() {
        this.gridGraphics.lineStyle(0.5, 0x3498db, 0.12);

        // Latitude lines
        for (let lat = -80; lat <= 80; lat += 20) {
            this.drawLatLine(lat);
        }

        // Longitude lines
        for (let lon = -180; lon < 180; lon += 20) {
            this.drawLonLine(lon);
        }

        // Equator
        this.gridGraphics.lineStyle(1, 0x22d3ee, 0.25);
        this.drawLatLine(0);
    }

    drawLatLine(lat) {
        const points = [];
        for (let lon = -180; lon <= 180; lon += 5) {
            const p = this.project3D(lat, lon);
            if (p.visible) {
                points.push(p);
            } else if (points.length > 1) {
                this.strokePoints(points, this.gridGraphics);
                points.length = 0;
            } else {
                points.length = 0;
            }
        }
        if (points.length > 1) this.strokePoints(points, this.gridGraphics);
    }

    drawLonLine(lon) {
        const points = [];
        for (let lat = -90; lat <= 90; lat += 5) {
            const p = this.project3D(lat, lon);
            if (p.visible) {
                points.push(p);
            } else if (points.length > 1) {
                this.strokePoints(points, this.gridGraphics);
                points.length = 0;
            } else {
                points.length = 0;
            }
        }
        if (points.length > 1) this.strokePoints(points, this.gridGraphics);
    }

    strokePoints(points, graphics) {
        if (points.length < 2) return;
        graphics.beginPath();
        graphics.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            graphics.lineTo(points[i].x, points[i].y);
        }
        graphics.strokePath();
    }

    drawAllLand() {
        // Sort landmasses by average Z for proper depth ordering
        const landMasses = Object.entries(WORLD_DATA).map(([name, coords]) => {
            const projected = coords.map(([lat, lon]) => this.project3D(lat, lon));
            const avgZ = projected.reduce((sum, p) => sum + p.z, 0) / projected.length;
            return { name, coords, projected, avgZ };
        }).sort((a, b) => a.avgZ - b.avgZ);

        for (const { name, projected } of landMasses) {
            const colors = LAND_COLORS[name] || { fill: 0x2d5a27, stroke: 0x1e3d1a };
            this.drawLandMass(projected, colors);
        }
    }

    drawLandMass(projectedPoints, colors) {
        const visiblePoints = projectedPoints.filter(p => p.visible);
        if (visiblePoints.length < 3) return;

        // Find continuous visible segments
        const segments = [];
        let current = [];

        for (let i = 0; i < projectedPoints.length; i++) {
            const p = projectedPoints[i];
            if (p.visible) {
                current.push(p);
            } else {
                if (current.length > 0) {
                    segments.push([...current]);
                    current = [];
                }
            }
        }
        if (current.length > 0) segments.push(current);

        // Connect first and last segments if both end visible
        if (segments.length > 1 &&
            projectedPoints[0].visible &&
            projectedPoints[projectedPoints.length - 1].visible) {
            const first = segments.shift();
            const last = segments[segments.length - 1];
            segments[segments.length - 1] = [...last, ...first];
        }

        for (const segment of segments) {
            if (segment.length < 3) continue;

            // Fill
            this.landGraphics.fillStyle(colors.fill, 0.9);
            this.landGraphics.beginPath();
            this.landGraphics.moveTo(segment[0].x, segment[0].y);
            for (let i = 1; i < segment.length; i++) {
                this.landGraphics.lineTo(segment[i].x, segment[i].y);
            }
            this.landGraphics.closePath();
            this.landGraphics.fillPath();

            // Border
            this.borderGraphics.lineStyle(1.2, colors.stroke, 0.9);
            this.borderGraphics.beginPath();
            this.borderGraphics.moveTo(segment[0].x, segment[0].y);
            for (let i = 1; i < segment.length; i++) {
                this.borderGraphics.lineTo(segment[i].x, segment[i].y);
            }
            this.borderGraphics.closePath();
            this.borderGraphics.strokePath();
        }
    }

    drawGlobeRim() {
        this.atmosphereGraphics.lineStyle(2, 0x0ea5e9, 0.6);
        this.atmosphereGraphics.strokeCircle(0, 0, this.globeRadius);
    }

    // District management
    initializeDistricts() {
        if (typeof missionPlanner === 'undefined') return;

        const sectorConfigs = missionPlanner.getDistrictConfigs();
        this.districtStates = missionPlanner.getAllDistrictStates();

        sectorConfigs.forEach(config => {
            const state = missionPlanner.getDistrictState(config.id);
            this.districts.push({ config, state });
        });
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

    drawDistricts() {
        if (!this.districts.length) return;

        this.districts.forEach(district => {
            const center = this.getDistrictCenterCoords(district.config);
            const projected = this.project3D(center.lat, center.lon);

            if (!projected.visible) return;

            const state = district.state;
            const isSelected = this.selectedDistrict === district;
            const isDestroyed = state.status === 'destroyed';

            // District marker circle
            const baseRadius = 8;
            const radius = isSelected ? baseRadius * 1.3 : baseRadius;
            const alpha = isDestroyed ? 0.4 : 0.8;

            // Glow
            this.districtGraphics.fillStyle(district.config.color, alpha * 0.3);
            this.districtGraphics.fillCircle(projected.x, projected.y, radius * 2);

            // Main circle
            this.districtGraphics.fillStyle(district.config.color, alpha);
            this.districtGraphics.fillCircle(projected.x, projected.y, radius);

            // Border
            this.districtGraphics.lineStyle(isSelected ? 2.5 : 1.5, 0xffffff, alpha * 0.8);
            this.districtGraphics.strokeCircle(projected.x, projected.y, radius);

            // Store projected position for hit testing
            district.projectedX = projected.x;
            district.projectedY = projected.y;
            district.projectedRadius = radius * 2; // Hit area
        });

        // Set up click detection for districts
        this.setupDistrictInteraction();
    }

    setupDistrictInteraction() {
        // Remove previous listener if exists
        if (this._districtClickHandler) {
            this.scene.input.off('pointerdown', this._districtClickHandler);
        }

        this._districtClickHandler = (pointer) => {
            // Convert pointer to container-local coordinates
            const localX = pointer.x - this.centerX;
            const localY = pointer.y - this.centerY;

            // Check if we clicked on a district
            for (const district of this.districts) {
                if (district.projectedX === undefined) continue;

                const dist = Phaser.Math.Distance.Between(
                    localX, localY,
                    district.projectedX, district.projectedY
                );

                if (dist < district.projectedRadius) {
                    this.focusDistrict(district);
                    return;
                }
            }
        };

        this.scene.input.on('pointerdown', this._districtClickHandler);
    }

    drawMarkers() {
        if (!this.selectedDistrict) return;

        const center = this.getDistrictCenterCoords(this.selectedDistrict.config);
        const projected = this.project3D(center.lat, center.lon);

        if (!projected.visible) return;

        // Ping effect
        const pingRadius = 12 + Math.sin(this.scene.time.now / 200) * 4;
        this.markerGraphics.fillStyle(0xff8fab, 0.3);
        this.markerGraphics.fillCircle(projected.x, projected.y, pingRadius);

        // Main marker
        this.markerGraphics.fillStyle(0xff4d6d, 1);
        this.markerGraphics.fillCircle(projected.x, projected.y, 5);
        this.markerGraphics.lineStyle(2, 0xffffff, 0.9);
        this.markerGraphics.strokeCircle(projected.x, projected.y, 5);
    }

    createMapMarkers() {
        // Markers are now drawn in drawMarkers() as part of the render loop
    }

    focusDistrict(district, skipTweens = false) {
        if (this.selectedDistrict === district) return;

        this.selectedDistrict = district;
        this.onDistrictFocused?.(district);

        // Rotate globe to center on district
        const center = this.getDistrictCenterCoords(district.config);
        const targetRotY = -center.lon * Math.PI / 180;
        const targetRotX = center.lat * Math.PI / 180 * 0.5;

        if (!skipTweens) {
            this.scene.tweens.add({
                targets: this,
                rotationY: targetRotY,
                rotationX: targetRotX,
                duration: 600,
                ease: 'Sine.easeInOut'
            });

            this.scene.tweens.add({
                targets: this.scene.cameras.main,
                zoom: 1.08,
                duration: 300,
                yoyo: true,
                ease: 'Sine.easeOut'
            });
        }

        this.autoRotate = false;
    }

    enableDistrictInteractions(district) {
        // Handled in setupDistrictInteraction
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

        // Auto-rotate globe
        if (this.autoRotate && !this.isDragging) {
            this.rotationY += this.autoRotateSpeed;
        }

        // Re-render the globe
        this.renderGlobe();

        // Update district states
        this.districts.forEach(district => {
            const state = missionPlanner.getDistrictState(district.config.id);
            district.state = state;
        });

        if (this.selectedDistrict && mission?.district === this.selectedDistrict.config.id && this._persistAccumulator > 1) {
            const { lon } = this.getDistrictCenterCoords(this.selectedDistrict.config);
            mission = missionPlanner.selectDistrict(this.selectedDistrict.config.id, lon);
        }

        // Update orbit nodes
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
        // Markers are now positioned in drawMarkers() based on 3D projection
        if (mission && this.selectedDistrict) {
            // Update selected district if mission has a district
        }
    }
}
