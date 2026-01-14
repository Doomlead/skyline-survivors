// ------------------------
// File: js/ui/map/buildMapView.js
// ------------------------

const GLOBE_LAYOUT = {
    centerXRatio: .75,
    centerYRatio: 0.75,
    radiusScale: 0.15,
    minRadius: 100,
    maxRadius: 200
};

class BuildMapView {
    constructor(scene) {
        this.scene = scene;
        this.districts = [];
        this.mapNodes = [];
        this.selectedDistrict = null;
        this.planetContainer = null;
        this.onDistrictFocused = null;
        this.onNodeDetailsRequested = null;
        this.onOrbitNodeSelected = null;
        this._persistAccumulator = 0;

        // 3D Globe state
        this.rotationX = 0.3;
        this.rotationY = 0;
        this.globeRadius = 250; 
        this.isDragging = false;
        this.lastPointer = { x: 0, y: 0 };
        this.autoRotate = true;
        this.autoRotateSpeed = 0.002;
        this.centerX = 0;
        this.centerY = 0;
        
        // Store Orbit configurations to rebuild them on resize
        this.nodeConfigs = []; 

        // Graphics layers for globe
        this.oceanGraphics = null;
        this.landGraphics = null;
        this.borderGraphics = null;
        this.gridGraphics = null;
        this.atmosphereGraphics = null;
        this.districtGraphics = null;
        this.markerGraphics = null;
        this.battleshipMarkers = [];
        
        this._isBuilt = false;
    }

    preload() { 
        // Ensure we are clean before we start
        this.cleanup();
    }

    build(width, height) {
        console.log('[BuildMapView.build] Called with dimensions:', { width, height, _isBuilt: this._isBuilt });
        
        // Clean up any existing objects to prevent duplicate logic/graphics
        this.cleanup();

        // Calculate dimensions immediately
        this.calculateDimensions(width, height);

        this.createStars();
        this.createBackdrop(width, height);

        // Create planet container at globe center
        this.planetContainer = this.scene.add.container(this.centerX, this.centerY);
        console.log('[BuildMapView] Globe spawned', {
            centerX: this.centerX,
            centerY: this.centerY,
            globeRadius: this.globeRadius
        });

        // Create graphics layers
        this.atmosphereGraphics = this.scene.add.graphics();
        this.oceanGraphics = this.scene.add.graphics();
        this.gridGraphics = this.scene.add.graphics();
        this.landGraphics = this.scene.add.graphics();
        this.borderGraphics = this.scene.add.graphics();
        this.districtGraphics = this.scene.add.graphics();
        this.markerGraphics = this.scene.add.graphics();

        this.planetContainer.add([
            this.atmosphereGraphics,
            this.oceanGraphics,
            this.gridGraphics,
            this.landGraphics,
            this.borderGraphics,
            this.districtGraphics,
            this.markerGraphics
        ]);

        this.initializeDistricts();
        this.createBattleshipMarkers();
        this.createOrbitNodes(); 
        this.setupGlobeInput();
        this.renderGlobe();
        
        // SET FLAG TO TRUE
        this._isBuilt = true;
    }

    resize(width, height) {
        if (!this._isBuilt) return;

        this.calculateDimensions(width, height);

        if (this.planetContainer) {
            this.planetContainer.setPosition(this.centerX, this.centerY);
        }

        this.refreshBackdrop(width, height);
        this.updateOrbitNodesPositions();
        this.renderGlobe();
    }

    cleanup() {
        this._isBuilt = false; // Stop updates immediately

        this.mapNodes.forEach(node => {
            if (node.pulse) node.pulse.stop();
            if (node.node) node.node.destroy();
            if (node.label) node.label.destroy();
            if (node.timerText) node.timerText.destroy();
            if (node.connector) node.connector.destroy();
        });
        this.mapNodes = [];
        this.districts = [];
        this.selectedDistrict = null;
        
        this.battleshipMarkers.forEach(marker => marker.destroy());
        this.battleshipMarkers = [];
        
        if (this.planetContainer) {
            this.planetContainer.destroy(true); // true = destroy children
            this.planetContainer = null;
        }
        if (this.backdropGrid) this.backdropGrid.destroy();
        if (this.backdropGlow) this.backdropGlow.destroy();
        
        // Graphics refs (destroyed by container usually, but null them out)
        this.atmosphereGraphics = null;
        this.oceanGraphics = null;
    }
	
	calculateDimensions(width, height) {
        const layout = GLOBE_LAYOUT;
        
        const safeWidth = width || window.innerWidth;
        const safeHeight = height || window.innerHeight;

        this.centerX = safeWidth * layout.centerXRatio;
        this.centerY = safeHeight * layout.centerYRatio;

        // NEW LOGIC: We calculate size primarily based on Width.
        // Even if Height is huge (doubled), we ignore the extra height for radius calculation.
        // This ensures the container grows, but the globe does not.
        const constrainingDimension = Math.min(safeWidth, safeHeight * 0.6); 

        const baseRadius = constrainingDimension * layout.radiusScale; // Uses the scale 0.18
        
        this.globeRadius = Phaser.Math.Clamp(
            baseRadius, 
            layout.minRadius, 
            layout.maxRadius
        );

        console.log(`[BuildMapView] Resizing: ${safeWidth}x${safeHeight} -> Radius: ${this.globeRadius}`);
    }

    createStars() {
        if (!this.scene.textures.exists('build-star')) {
            const g = this.scene.add.graphics();
            g.fillStyle(0xffffff, 1);
            g.fillCircle(2, 2, 2);
            g.generateTexture('build-star', 4, 4);
            g.destroy();
        }

        this.scene.add.particles(0, 0, 'build-star', {
            x: { min: 0, max: this.scene.scale.width },
            y: { min: 0, max: this.scene.scale.height },
            quantity: 2,
            speedY: 6,
            lifespan: 6000,
            alpha: { start: 0.7, end: 0 },
            scale: { start: 0.8, end: 0.4 },
            blendMode: 'ADD'
        });
    }

    createBackdrop(width, height) {
        this.backdropGrid = this.scene.add.graphics();
        this.backdropGrid.lineStyle(1, 0x102a3f, 0.4);
        const spacing = 60;
        for (let x = 0; x < width * 2; x += spacing) { 
            this.backdropGrid.lineBetween(x, 0, x, height * 2);
        }
        for (let y = 0; y < height * 2; y += spacing) {
            this.backdropGrid.lineBetween(0, y, width * 2, y);
        }

        this.backdropGlow = this.scene.add.circle(width / 2, height / 2 + 20, 180, 0x0b2a3b, 0.25);
        this.backdropGlow.setBlendMode(Phaser.BlendModes.ADD);
    }

    refreshBackdrop(width, height) {
        if (this.backdropGrid) this.backdropGrid.destroy();
        if (this.backdropGlow) this.backdropGlow.destroy();
        this.createBackdrop(width, height);
    }

    setupGlobeInput() {
        this.scene.input.on('pointerdown', (pointer) => {
            const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.centerX, this.centerY);
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

        this.scene.input.on('pointerup', () => { this.isDragging = false; });

        this.scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.centerX, this.centerY);
            if (dist < this.globeRadius + 100) {
                this.globeRadius -= deltaY * 0.1;
                this.globeRadius = Phaser.Math.Clamp(this.globeRadius, 150, 800); 
            }
        });
    }

    project3D(lat, lon) {
        const latRad = lat * Math.PI / 180;
        const lonRad = lon * Math.PI / 180;

        let x = Math.cos(latRad) * Math.sin(lonRad);
        let y = Math.sin(latRad);
        let z = Math.cos(latRad) * Math.cos(lonRad);

        const cosY = Math.cos(this.rotationY);
        const sinY = Math.sin(this.rotationY);
        let newX = x * cosY - z * sinY;
        let newZ = x * sinY + z * cosY;
        x = newX; z = newZ;

        const cosX = Math.cos(this.rotationX);
        const sinX = Math.sin(this.rotationX);
        const newY = y * cosX - z * sinX;
        const finalZ = y * sinX + z * cosX;
        y = newY; z = finalZ;

        return {
            x: x * this.globeRadius,
            y: -y * this.globeRadius,
            z: z,
            visible: z > 0
        };
    }

    renderGlobe() {
        if (!this.atmosphereGraphics) return;

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
        this.oceanGraphics.fillStyle(0x0a3d62, 1);
        this.oceanGraphics.fillCircle(0, 0, this.globeRadius);
        this.oceanGraphics.fillStyle(0x1a5276, 0.5);
        this.oceanGraphics.fillCircle(-this.globeRadius * 0.2, -this.globeRadius * 0.2, this.globeRadius * 0.7);
    }

    drawGrid() {
        this.gridGraphics.lineStyle(0.5, 0x3498db, 0.12);
        for (let lat = -80; lat <= 80; lat += 20) this.drawLatLine(lat);
        for (let lon = -180; lon < 180; lon += 20) this.drawLonLine(lon);
        this.gridGraphics.lineStyle(1, 0x22d3ee, 0.25);
        this.drawLatLine(0);
    }

    drawLatLine(lat) {
        const points = [];
        for (let lon = -180; lon <= 180; lon += 5) {
            const p = this.project3D(lat, lon);
            if (p.visible) points.push(p);
            else if (points.length > 1) { this.strokePoints(points, this.gridGraphics); points.length = 0; }
            else points.length = 0;
        }
        if (points.length > 1) this.strokePoints(points, this.gridGraphics);
    }

    drawLonLine(lon) {
        const points = [];
        for (let lat = -90; lat <= 90; lat += 5) {
            const p = this.project3D(lat, lon);
            if (p.visible) points.push(p);
            else if (points.length > 1) { this.strokePoints(points, this.gridGraphics); points.length = 0; }
            else points.length = 0;
        }
        if (points.length > 1) this.strokePoints(points, this.gridGraphics);
    }

    strokePoints(points, graphics) {
        if (points.length < 2) return;
        graphics.beginPath();
        graphics.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) graphics.lineTo(points[i].x, points[i].y);
        graphics.strokePath();
    }

    drawAllLand() {
        if (typeof WORLD_DATA === 'undefined') {
            console.warn('WORLD_DATA missing - cannot draw land');
            return;
        }
        
        const landMasses = Object.entries(WORLD_DATA).map(([name, coords]) => {
            const projected = coords.map(([lat, lon]) => this.project3D(lat, lon));
            const avgZ = projected.reduce((sum, p) => sum + p.z, 0) / projected.length;
            return { name, coords, projected, avgZ };
        }).sort((a, b) => a.avgZ - b.avgZ);

        for (const { name, projected } of landMasses) {
            const colors = (typeof LAND_COLORS !== 'undefined' ? LAND_COLORS[name] : null) || { fill: 0x2d5a27, stroke: 0x1e3d1a };
            this.drawLandMass(projected, colors);
        }
    }

    drawLandMass(projectedPoints, colors) {
        const visiblePoints = projectedPoints.filter(p => p.visible);
        if (visiblePoints.length < 3) return;

        const segments = [];
        let current = [];
        for (let i = 0; i < projectedPoints.length; i++) {
            const p = projectedPoints[i];
            if (p.visible) current.push(p);
            else if (current.length > 0) { segments.push([...current]); current = []; }
        }
        if (current.length > 0) segments.push(current);

        if (segments.length > 1 && projectedPoints[0].visible && projectedPoints[projectedPoints.length - 1].visible) {
            const first = segments.shift();
            const last = segments[segments.length - 1];
            segments[segments.length - 1] = [...last, ...first];
        }

        for (const segment of segments) {
            if (segment.length < 3) continue;
            this.landGraphics.fillStyle(colors.fill, 0.9);
            this.landGraphics.beginPath();
            this.landGraphics.moveTo(segment[0].x, segment[0].y);
            for (let i = 1; i < segment.length; i++) this.landGraphics.lineTo(segment[i].x, segment[i].y);
            this.landGraphics.closePath();
            this.landGraphics.fillPath();

            this.borderGraphics.lineStyle(1.2, colors.stroke, 0.9);
            this.borderGraphics.beginPath();
            this.borderGraphics.moveTo(segment[0].x, segment[0].y);
            for (let i = 1; i < segment.length; i++) this.borderGraphics.lineTo(segment[i].x, segment[i].y);
            this.borderGraphics.closePath();
            this.borderGraphics.strokePath();
        }
    }

    drawGlobeRim() {
        this.atmosphereGraphics.lineStyle(2, 0x0ea5e9, 0.6);
        this.atmosphereGraphics.strokeCircle(0, 0, this.globeRadius);
    }

    initializeDistricts() {
        if (typeof missionPlanner === 'undefined') return;
        const sectorConfigs = missionPlanner.getDistrictConfigs();
        this.districts = [];
        sectorConfigs.forEach(config => {
            const state = missionPlanner.getDistrictState(config.id);
            this.districts.push({ config, state });
        });
    }

    createBattleshipMarkers() {
        if (typeof missionPlanner === 'undefined' || !this.planetContainer) return;
        this.battleshipMarkers.forEach(marker => marker.destroy());
        this.battleshipMarkers = [];
        const ships = missionPlanner.getBattleships();
        ships.forEach(() => {
            const hull = this.scene.add.triangle(0, 0, 0, -12, -10, 10, 10, 10, 0xf43f5e, 0.95);
            hull.setStrokeStyle(2, 0xffffff, 0.9);
            hull.setBlendMode(Phaser.BlendModes.ADD);
            hull.setDepth(6);
            this.planetContainer.add(hull);
            this.scene.tweens.add({
                targets: hull,
                scale: 1.15,
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            this.battleshipMarkers.push(hull);
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

            const isSelected = this.selectedDistrict === district;
            const isOccupied = district.state.status === 'occupied';
            const baseRadius = 8;
            const radius = isSelected ? baseRadius * 1.3 : baseRadius;
            const alpha = isOccupied ? 0.5 : 0.8;

            this.drawDistrictThreatPulse(district, projected, radius);
            if (district.state.underAttack && !isOccupied) {
                const attackPulse = (Math.sin(this.scene.time.now / 200) + 1) / 2;
                const attackRadius = radius * (2.1 + attackPulse * 0.6);
                this.districtGraphics.lineStyle(2.5, 0xef4444, 0.7);
                this.districtGraphics.strokeCircle(projected.x, projected.y, attackRadius);
            }

            this.districtGraphics.fillStyle(district.config.color, alpha * 0.3);
            this.districtGraphics.fillCircle(projected.x, projected.y, radius * 2);
            this.districtGraphics.fillStyle(district.config.color, alpha);
            this.districtGraphics.fillCircle(projected.x, projected.y, radius);
            this.districtGraphics.lineStyle(isSelected ? 2.5 : 1.5, 0xffffff, alpha * 0.8);
            this.districtGraphics.strokeCircle(projected.x, projected.y, radius);

            district.projectedX = projected.x;
            district.projectedY = projected.y;
            district.projectedRadius = radius * 2;
        });
        this.setupDistrictInteraction();
    }

    drawDistrictThreatPulse(district, projected, radius) {
        if (!district?.state || district.state.status !== 'threatened') return;
        const maxTimer = district.config?.timer || 1;
        if (maxTimer <= 0) return;
        const remaining = Math.max(0, district.state.timer ?? 0);
        const urgency = Phaser.Math.Clamp(1 - remaining / maxTimer, 0, 1);
        const pulseSpeed = Phaser.Math.Linear(0.002, 0.006, urgency);
        const pulse = (Math.sin(this.scene.time.now * pulseSpeed) + 1) / 2;
        const pulseRadius = radius * (1.6 + pulse * 0.6);
        const pulseAlpha = Phaser.Math.Linear(0.15, 0.55, pulse) * Phaser.Math.Linear(0.7, 1, urgency);
        const pulseColor = urgency > 0.65 ? 0xf87171 : urgency > 0.35 ? 0xfbbf24 : 0xfef08a;

        this.districtGraphics.lineStyle(2, pulseColor, pulseAlpha);
        this.districtGraphics.strokeCircle(projected.x, projected.y, pulseRadius);
    }

    setupDistrictInteraction() {
        if (this._districtClickHandler) this.scene.input.off('pointerdown', this._districtClickHandler);
        this._districtClickHandler = (pointer) => {
            const localX = pointer.x - this.centerX;
            const localY = pointer.y - this.centerY;
            for (const district of this.districts) {
                if (district.projectedX === undefined) continue;
                const dist = Phaser.Math.Distance.Between(localX, localY, district.projectedX, district.projectedY);
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

        const pingRadius = 12 + Math.sin(this.scene.time.now / 200) * 4;
        this.markerGraphics.fillStyle(0xff8fab, 0.3);
        this.markerGraphics.fillCircle(projected.x, projected.y, pingRadius);
        this.markerGraphics.fillStyle(0xff4d6d, 1);
        this.markerGraphics.fillCircle(projected.x, projected.y, 5);
        this.markerGraphics.lineStyle(2, 0xffffff, 0.9);
        this.markerGraphics.strokeCircle(projected.x, projected.y, 5);
    }

    focusDistrict(district, skipTweens = false) {
        if (this.selectedDistrict === district) return;
        this.selectedDistrict = district;
        this.onDistrictFocused?.(district);

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

    createOrbitNodes() {
        if (typeof missionPlanner === 'undefined') return;

        // Configuration relative to globe size
        this.nodeConfigs = [
            { id: 'mothership', label: 'Mothership',angle: 160, distScale: 1.4, color: 0x818cf8 }
        ];

        this.nodeConfigs.forEach(config => {
            const connector = this.scene.add.graphics();
            const node = this.scene.add.circle(0, 0, 12, config.color, 0.9);
            node.setStrokeStyle(2, 0xffffff, 0.8);
            node.setBlendMode(Phaser.BlendModes.ADD);
            const pulse = this.scene.tweens.add({ targets: node, scale: 1.25, duration: 700, yoyo: true, repeat: -1 });

            const label = this.scene.add.text(0, 0, config.label, {
                fontFamily: 'Orbitron', fontSize: '12px', color: '#c7e6ff', align: 'center'
            }).setOrigin(0.5).setDepth(5);

            const timerText = this.scene.add.text(0, 0, '--', {
                fontFamily: 'Orbitron', fontSize: '11px', color: '#ffffff'
            }).setOrigin(0.5).setDepth(5);

            const nodeState = missionPlanner.ensureMapNodeState(config);

            this.mapNodes.push({ id: config.id, config, node, label, timerText, pulse, connector, state: nodeState, isEnabled: true });

            node.setInteractive({ useHandCursor: true });
            node.on('pointerdown', () => {
                this.flashConnector(connector);
                const liveState = missionPlanner.getMapNodeState(config.id) || nodeState;
                this.onOrbitNodeSelected?.(config.id, liveState);
            });
        });

        this.updateOrbitNodesPositions();
    }

    updateOrbitNodesPositions() {
        this.mapNodes.forEach(mapNode => {
            const config = mapNode.config;
            const radius = this.globeRadius * config.distScale; 
            
            const x = this.centerX + Math.cos(Phaser.Math.DegToRad(config.angle)) * radius;
            const y = this.centerY + Math.sin(Phaser.Math.DegToRad(config.angle)) * radius;

            mapNode.node.setPosition(x, y);
            mapNode.label.setPosition(x, y - 26);
            mapNode.timerText.setPosition(x, y + 18);
            
            mapNode.connector.clear();
            mapNode.connector.lineStyle(1.5, 0x1dcaff, 0.3);
            mapNode.connector.lineBetween(this.centerX, this.centerY, x, y);
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
        // Critical safety check: Don't update if we aren't fully built
        if (!this._isBuilt || typeof missionPlanner === 'undefined') return mission;
        
        const dt = delta / 1000;
        missionPlanner.tickDistricts(dt);
        missionPlanner.tickBattleships(dt);
        this._persistAccumulator += dt;

        if (this.autoRotate && !this.isDragging) {
            this.rotationY += this.autoRotateSpeed;
        }

        this.renderGlobe();

        this.districts.forEach(district => {
            district.state = missionPlanner.getDistrictState(district.config.id);
        });

        const allFriendly = missionPlanner.areAllDistrictsFriendly?.();
        this.mapNodes.forEach(node => {
            if (node.id !== 'mothership') return;
            const ready = !!allFriendly;
            node.state = { ...(node.state || {}), status: ready ? 'ready' : 'locked', timer: 0 };
            
            // Safety check for destroyed text objects
            if (node.timerText && node.timerText.active) {
                node.timerText.setText(ready ? 'READY' : 'LOCKED');
                node.timerText.setColor(ready ? '#a5f3fc' : '#94a3b8');
            }
            
            node.node.setAlpha(ready ? 1 : 0.35);
            node.label.setAlpha(ready ? 1 : 0.5);
            if (ready && !node.isEnabled) {
                node.node.setInteractive({ useHandCursor: true });
                node.isEnabled = true;
            }
            if (!ready && node.isEnabled) {
                node.node.disableInteractive();
                node.isEnabled = false;
            }
        });

        this.mapNodes.forEach(node => {
            if (node.id === 'mothership') return;
            const stored = missionPlanner.getMapNodeState(node.id) || node.state;
            node.state = stored;
            
            // Safety check for destroyed text objects
            if (node.timerText && node.timerText.active) {
                const timerLabel = node.state.status === 'destroyed' ? 'DESTROYED' : node.state.timer > 0 ? this.scene.formatTimer(node.state.timer) : 'STABLE';
                const color = node.state.status === 'destroyed' ? '#f87171' : (node.state.timer > 0 ? '#fef08a' : '#a7f3d0');
                node.timerText.setText(timerLabel);
                node.timerText.setColor(color);
            }
        });

        const battleships = missionPlanner.getBattleships();
        battleships.forEach((ship, index) => {
            const marker = this.battleshipMarkers[index];
            if (!marker) return;
            const projected = this.project3D(ship.lat, ship.lon);
            marker.setPosition(projected.x, projected.y);
            marker.setVisible(projected.visible);
        });

        return mission;
    }
}
