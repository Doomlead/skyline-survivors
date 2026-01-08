// ------------------------
// File: js/ui/map/buildMapView.js
// ------------------------

const globeBackdrop = window.GlobeBackdrop || {};
const globeDistricts = window.GlobeDistricts || {};
const globeOrbitNodes = window.GlobeOrbitNodes || {};
const globeRendering = window.GlobeRendering || {};

const GLOBE_LAYOUT = {
    centerXRatio: .75,
    centerYRatio: 0.75,
    radiusScale: 0.23,
    minRadius: 100,
    maxRadius: 280
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
        globeBackdrop.createStars(this.scene);
    }

    createBackdrop(width, height) {
        const { backdropGrid, backdropGlow } = globeBackdrop.createBackdrop(this.scene, width, height);
        this.backdropGrid = backdropGrid;
        this.backdropGlow = backdropGlow;
    }

    refreshBackdrop(width, height) {
        const { backdropGrid, backdropGlow } = globeBackdrop.refreshBackdrop(
            this.scene,
            width,
            height,
            this.backdropGrid,
            this.backdropGlow
        );
        this.backdropGrid = backdropGrid;
        this.backdropGlow = backdropGlow;
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
        globeRendering.renderGlobe(this);
    }

    initializeDistricts() {
        globeDistricts.initializeDistricts(this);
    }

    createBattleshipMarkers() {
        globeDistricts.createBattleshipMarkers(this);
    }

    getDistrictCenterCoords(config) {
        return globeDistricts.getDistrictCenterCoords(config);
    }

    drawDistricts() {
        globeDistricts.drawDistricts(this);
    }

    drawDistrictThreatPulse(district, projected, radius) {
        globeDistricts.drawDistrictThreatPulse(this, district, projected, radius);
    }

    setupDistrictInteraction() {
        globeDistricts.setupDistrictInteraction(this);
    }

    drawMarkers() {
        globeDistricts.drawMarkers(this);
    }

    focusDistrict(district, skipTweens = false) {
        globeDistricts.focusDistrict(this, district, skipTweens);
    }

    createOrbitNodes() {
        globeOrbitNodes.createOrbitNodes(this);
    }

    updateOrbitNodesPositions() {
        globeOrbitNodes.updateOrbitNodesPositions(this);
    }

    flashConnector(connector) {
        globeOrbitNodes.flashConnector(this, connector);
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
