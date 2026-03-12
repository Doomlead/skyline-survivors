// ------------------------
// File: js/ui/map/mapViewUtils.js
// ------------------------

(function() {
    const GLOBE_LAYOUT = {
        centerXRatio: 0.5,
        centerYRatio: 0.5,
        radiusScale: 0.36,
        minRadius: 140,
        maxRadius: 420
    };

    function calculateGlobeDimensions(width, height, layout = GLOBE_LAYOUT) {
        const safeWidth = width || window.innerWidth;
        const safeHeight = height || window.innerHeight;
        const centerX = safeWidth * layout.centerXRatio;
        const centerY = safeHeight * layout.centerYRatio;
        const constrainingDimension = Math.min(safeWidth, safeHeight);
        const baseRadius = constrainingDimension * layout.radiusScale;
        const globeRadius = Phaser.Math.Clamp(baseRadius, layout.minRadius, layout.maxRadius);

        return {
            safeWidth,
            safeHeight,
            centerX,
            centerY,
            globeRadius
        };
    }

    function projectPointOnGlobe(lat, lon, rotationX, rotationY, globeRadius) {
        const latRad = lat * Math.PI / 180;
        const lonRad = lon * Math.PI / 180;

        let x = Math.cos(latRad) * Math.sin(lonRad);
        let y = Math.sin(latRad);
        let z = Math.cos(latRad) * Math.cos(lonRad);

        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const newX = x * cosY - z * sinY;
        const newZ = x * sinY + z * cosY;
        x = newX;
        z = newZ;

        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const newY = y * cosX - z * sinX;
        const finalZ = y * sinX + z * cosX;
        y = newY;
        z = finalZ;

        return {
            x: x * globeRadius,
            y: -y * globeRadius,
            z,
            visible: z > 0
        };
    }

    function getDistrictCenterCoords(config) {
        if (!config) return { lat: 0, lon: 0 };
        if (config.center) return config.center;
        if (!Array.isArray(config.polygon) || !config.polygon.length) return { lat: 0, lon: 0 };

        const sum = config.polygon.reduce((acc, point) => ({
            lat: acc.lat + (point.lat || 0),
            lon: acc.lon + (point.lon || 0)
        }), { lat: 0, lon: 0 });
        return {
            lat: sum.lat / config.polygon.length,
            lon: sum.lon / config.polygon.length
        };
    }

    function getDistrictStatusColor(status) {
        switch (status) {
            case 'occupied':
                return 0xef4444;
            case 'critical':
                return 0xf97316;
            case 'threatened':
                return 0xfacc15;
            case 'friendly':
            default:
                return 0x22c55e;
        }
    }

    window.mapViewUtils = {
        GLOBE_LAYOUT,
        calculateGlobeDimensions,
        projectPointOnGlobe,
        getDistrictCenterCoords,
        getDistrictStatusColor
    };
})();
