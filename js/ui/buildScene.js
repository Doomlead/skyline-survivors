// World landmass data for 3D globe rendering
const WORLD_DATA = {
    northAmerica: [
        [70, -141], [72, -150], [71, -160], [68, -166], [64, -168],
        [60, -167], [57, -163], [55, -158], [54, -152], [53, -145],
        [60, -140], [60, -139], [58, -137], [57, -135], [56, -132], 
        [55, -130], [54, -130], [52, -128], [49, -125], [48, -124], 
        [46, -124], [43, -124], [40, -124], [38, -123], [36, -122], 
        [34, -120], [32, -117], [31, -116], [29, -114], [28, -112],
        [26, -112], [24, -111], [23, -110], [22, -106], [20, -106], 
        [19, -105], [18, -104], [17, -102], [16, -99], [15, -96], [15, -93],
        [14, -91], [13, -90], [13, -88], [12, -87], [11, -85], [10, -84],
        [9, -83], [9, -80], [8, -78], [8, -77], [9, -79], [10, -81], 
        [11, -83], [13, -84], [15, -84], [16, -86], [18, -88], [20, -87], 
        [21, -87], [21, -90], [23, -90], [22, -93], [21, -94], [20, -96], 
        [19, -96], [20, -97], [22, -97], [24, -98], [26, -97], [28, -97],
        [29, -95], [30, -94], [30, -92], [29, -90], [30, -88], [30, -86],
        [30, -85], [29, -83], [27, -82], [25, -81], [24, -81], [25, -80],
        [27, -80], [28, -80], [30, -81], [31, -81], [32, -80], [33, -79], 
        [35, -76], [36, -76], [37, -76], [38, -75], [39, -74], [40, -74], 
        [41, -71], [42, -70], [43, -70], [44, -67], [45, -67], [47, -68], 
        [47, -70], [46, -64], [45, -61], [44, -64], [43, -66], [44, -67], 
        [45, -64], [47, -62], [47, -59], [48, -59], [49, -58], [50, -56], 
        [51, -56], [52, -56], [53, -57], [54, -59], [55, -60], [58, -62], 
        [60, -64], [60, -65], [58, -67], [55, -68], [53, -67], [52, -66], 
        [50, -64], [49, -65], [47, -70], [52, -80], [55, -82], [58, -88], 
        [60, -90], [63, -92], [65, -90], [66, -86], [63, -82], [60, -78], 
        [58, -77], [56, -79], [55, -80], [67, -86], [68, -90], [70, -100], 
        [72, -110], [74, -120], [72, -130], [70, -141]
    ],
    eurasia: [
        [37, -9], [38, -9], [39.5, -9], [41, -8.8], [42.5, -8.5], [43, -9],
        [43.5, -3], [43, 3], [43, 5], [43, 7], [44, 9], [44, 12], [43.5, 13.5], 
        [43, 15], [42, 16], [41.5, 17.5], [41, 19], [40.5, 20.5], [40, 22], 
        [39, 23], [38, 23.5], [37, 24], [36.5, 25], [36, 26.5], [36.8, 28], 
        [38, 28.5], [39.5, 27.5], [40.5, 27], [41.5, 28], [41, 30], [41, 32],
        [40.5, 34], [40, 36], [39.5, 38], [39, 40], [38, 42], [37.5, 43.5], 
        [37, 44], [36, 36], [35, 36], [34, 36], [33, 36.5], [32, 36], 
        [31, 35.5], [30, 35], [29, 34.5], [27, 35.5], [25, 37], [23, 38.5], 
        [20, 39.5], [18, 40.5], [16, 41.5], [14, 42.5], [12, 43], [13, 45], 
        [14, 47], [15, 49], [16, 52], [17, 54], [18, 56], [20, 58], [22, 59],
        [23, 59], [25, 58], [26, 57], [25.5, 55], [25, 52], [26, 51], [28, 50], 
        [29, 49.5], [28, 48], [27, 47], [26, 47], [28, 45], [29, 47], [30.5, 48], 
        [32, 47], [33, 45], [34, 43], [35.5, 41], [36.5, 39], [37, 38],
        [36, 40], [34, 43], [32, 46], [30, 49], [29, 51], [28, 52], [29, 54], 
        [27, 56], [25, 58], [26, 60], [27, 62], [28, 63], [29, 64], [30, 66], 
        [29, 68], [27, 69], [24, 70], [22, 72], [20, 73], [18, 74], [15, 75], 
        [12, 76], [9, 77], [8, 78], [7, 80], [8, 82], [10, 80], [13, 80], 
        [16, 82], [19, 85], [21, 88], [22, 90], [23, 92], [22, 93], [20, 95], 
        [18, 97], [15, 99], [12, 99], [9, 99], [7, 100], [5, 101], [3, 103], 
        [1, 104], [2, 106], [4, 108], [6, 110], [8, 115], [10, 117], [14, 110], 
        [18, 107], [21, 107], [23, 107], [25, 119], [28, 121], [31, 122], 
        [34, 120], [37, 121], [39, 122], [40, 124], [41, 126], [42, 129], [43, 131],
        [44, 135], [46, 138], [48, 140], [50, 142], [52, 143], [54, 143], 
        [56, 140], [58, 140], [60, 143], [62, 150], [64, 160], [65, 165],
        [66, 168], [65, 170], [64, 172], [63, 174], [62, 176], [61, 178], 
        [60, 179], [60, -179], [61, -180], [62, -178], [63, -176], [64, -174], 
        [65, -174], [66, -175], [67, -176], [70, 170], [72, 160], [74, 140], 
        [76, 110], [76, 90], [74, 70], [72, 60], [70, 55], [68, 54], [66, 57],
        [65, 24], [68, 20], [70, 26], [69, 28], [67, 26], [65, 22], [63, 18], 
        [60, 18], [58, 22], [56, 20], [54, 19], [54, 15], [53, 18], [52, 20], 
        [51, 23], [50, 25], [49, 27], [48, 28.5], [47, 29], [46, 28.5], 
        [45, 28], [44, 27.5], [43, 27], [42, 27.5], [41, 28], [52, 14], 
        [51, 10], [50, 7], [51, 4], [53, 5], [54, 7], [55, 8], [56, 9], 
        [56, 10], [55, 11], [54, 10], [53, 8], [52, 4], [51, 3], [50, 3], 
        [49, 0], [48, -2], [47, -2], [46, -1], [44, -2], [43, -3], [42.5, -6], 
        [41.5, -8.5], [40, -9], [38.5, -9], [37, -9], [36.8, -7.5], [36.5, -6], 
        [36.1, -5.4], [36.7, -4.4], [37.6, -2], [38.9, -0.8], [39.5, -0.3], 
        [41.2, 1.8], [42.4, 3], [43, 5]
    ],
    southAmerica: [
        [12, -72], [12, -70], [11, -67], [10, -65], [10, -62], [8, -60], 
        [7, -58], [6, -57], [5, -54], [4, -52], [3, -51], [2, -50], [0, -50], 
        [-1, -50], [-2, -44], [-3, -39], [-5, -35], [-7, -35], [-8, -35], 
        [-10, -36], [-13, -39], [-15, -39], [-17, -39], [-20, -40], [-22, -41], 
        [-23, -43], [-24, -46], [-26, -48], [-28, -49], [-30, -51], [-33, -53], 
        [-35, -56], [-37, -57], [-38, -58], [-39, -62], [-41, -63], [-43, -65], 
        [-45, -66], [-47, -66], [-49, -68], [-51, -69], [-53, -69], [-54, -69], 
        [-55, -67], [-55, -66], [-54, -64], [-55, -65], [-56, -67], [-56, -70], 
        [-55, -72], [-54, -72], [-52, -74], [-50, -75], [-48, -75], [-46, -75], 
        [-44, -74], [-42, -73], [-40, -73], [-38, -74], [-36, -73], [-34, -72], 
        [-32, -71], [-30, -71], [-28, -71], [-26, -70], [-24, -70], [-22, -70], 
        [-20, -70], [-18, -70], [-16, -73], [-14, -76], [-12, -77], [-10, -78], 
        [-8, -79], [-6, -81], [-4, -81], [-2, -80], [0, -80], [1, -79], [2, -78], 
        [4, -77], [6, -77], [8, -77], [10, -75], [11, -74], [12, -72]
    ],
    africa: [
        [36, -6], [35, -6], [34, -7], [32, -9], [30, -10], [28, -13], [26, -15], 
        [24, -16], [22, -17], [20, -17], [18, -16], [16, -17], [14, -17], 
        [12, -17], [12, -16], [11, -15], [10, -15], [9, -14], [8, -13], 
        [7, -12], [6, -11], [5, -8], [5, -5], [5, -3], [5, 0], [6, 1], [6, 2], 
        [5, 3], [6, 5], [5, 7], [4, 9], [3, 10], [2, 10], [1, 9], [0, 9], 
        [-1, 9], [-2, 10], [-4, 11], [-5, 12], [-6, 12], [-8, 13], [-10, 14], 
        [-12, 14], [-14, 12], [-16, 12], [-17, 12], [-18, 12], [-22, 14], 
        [-25, 15], [-28, 16], [-30, 17], [-32, 18], [-34, 18], [-34, 20], 
        [-34, 22], [-34, 26], [-33, 28], [-30, 31], [-28, 32], [-26, 33], 
        [-24, 35], [-22, 35], [-20, 35], [-18, 38], [-16, 40], [-14, 41], 
        [-12, 44], [-10, 40], [-8, 40], [-6, 39], [-4, 40], [-2, 41], [0, 42], 
        [2, 42], [4, 42], [6, 43], [8, 47], [10, 51], [12, 51], [12, 48], 
        [11, 44], [10, 43], [12, 43], [13, 43], [15, 42], [16, 40], [18, 38], 
        [20, 37], [22, 37], [24, 35], [26, 34], [28, 34], [30, 32], [31, 32], 
        [31, 34], [30, 33], [29, 33], [28, 34], [30, 32], [32, 25], [33, 22], 
        [34, 20], [35, 15], [36, 11], [37, 10], [37, 9], [37, 8], [36, 6], 
        [36, 3], [36, 0], [35, -2], [36, -5], [36, -6]
    ],
    australia: [
        [-11, 131], [-12, 132], [-12, 136], [-14, 136], [-15, 130], [-14, 127], 
        [-15, 124], [-18, 122], [-20, 119], [-22, 114], [-24, 114], [-26, 113], 
        [-28, 114], [-30, 115], [-32, 116], [-34, 116], [-35, 117], [-35, 118], 
        [-34, 119], [-34, 122], [-34, 127], [-33, 132], [-35, 135], [-36, 137], 
        [-37, 140], [-39, 144], [-39, 146], [-38, 148], [-37, 150], [-35, 151], 
        [-33, 152], [-31, 153], [-29, 153], [-27, 153], [-25, 153], [-23, 151], 
        [-21, 149], [-19, 147], [-17, 146], [-15, 145], [-13, 143], [-11, 142], 
        [-10, 142], [-11, 136], [-11, 131]
    ],
    greatBritain: [
        [50, -5], [50, 0], [51, 1], [52, 2], [53, 0], [54, -1], [55, -2], 
        [56, -3], [57, -2], [58, -3], [59, -3], [58, -5], [57, -6], [56, -6], 
        [55, -5], [54, -5], [53, -4], [52, -5], [51, -5], [50, -5]
    ],
    ireland: [
        [52, -10], [53, -10], [54, -10], [55, -8], [55, -6], [54, -6], 
        [53, -6], [52, -6], [51, -9], [52, -10]
    ],
    iceland: [
        [64, -22], [65, -18], [66, -16], [66, -14], [65, -14], [64, -16], 
        [63, -18], [63, -22], [64, -24], [65, -24], [64, -22]
    ],
    japan: [
        [36, 140], [37, 141], [39, 140], [41, 141], [42, 140], [41, 139], 
        [40, 140], [38, 138], [36, 137], [35, 135], [34, 135], [33, 132], 
        [34, 131], [35, 134], [35, 137], [36, 140]
    ],
    greenland: [
        [60, -43], [62, -42], [64, -40], [66, -35], [68, -30], [70, -25], 
        [72, -20], [74, -18], [76, -20], [78, -20], [80, -25], [82, -30], 
        [83, -35], [83, -45], [82, -55], [80, -65], [78, -70], [76, -70], 
        [74, -58], [72, -55], [70, -52], [68, -52], [66, -45], [64, -42], 
        [62, -43], [60, -43]
    ],
    madagascar: [
        [-12, 49], [-14, 50], [-16, 50], [-18, 49], [-20, 48], [-22, 47], 
        [-24, 47], [-26, 45], [-24, 44], [-22, 44], [-20, 44], [-18, 44], 
        [-16, 46], [-14, 48], [-12, 49]
    ],
    newZealandNorth: [
        [-35, 173], [-36, 175], [-37, 176], [-38, 178], [-39, 177], [-41, 175], 
        [-41, 173], [-39, 174], [-37, 175], [-36, 174], [-35, 173]
    ],
    newZealandSouth: [
        [-41, 174], [-42, 172], [-44, 169], [-46, 167], [-47, 168], [-46, 170], 
        [-44, 172], [-43, 173], [-42, 174], [-41, 174]
    ]
};

// Land colors for continents
const LAND_COLORS = {
    northAmerica: { fill: 0x2d5a27, stroke: 0x1e3d1a },
    southAmerica: { fill: 0x3d7a37, stroke: 0x2d5a27 },
    eurasia: { fill: 0x4a7c3f, stroke: 0x3d6633 },
    africa: { fill: 0xc4a35a, stroke: 0xa68b4a },
    australia: { fill: 0xd4a55a, stroke: 0xb8934a },
    greatBritain: { fill: 0x4a7c3f, stroke: 0x3d6633 },
    ireland: { fill: 0x4a7c3f, stroke: 0x3d6633 },
    iceland: { fill: 0x6a8c6f, stroke: 0x5a7c5f },
    japan: { fill: 0x5a8c4f, stroke: 0x4a7c3f },
    greenland: { fill: 0xf0f8ff, stroke: 0xe0e8ef },
    madagascar: { fill: 0xb4934a, stroke: 0x9a7d3a },
    newZealandNorth: { fill: 0x3d7a37, stroke: 0x2d5a27 },
    newZealandSouth: { fill: 0x3d7a37, stroke: 0x2d5a27 }
};

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
