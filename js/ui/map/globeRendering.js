(function registerGlobeRendering(global) {
    function renderGlobe(view) {
        if (!view.atmosphereGraphics) return;

        view.atmosphereGraphics.clear();
        view.oceanGraphics.clear();
        view.gridGraphics.clear();
        view.landGraphics.clear();
        view.borderGraphics.clear();
        view.districtGraphics.clear();
        view.markerGraphics.clear();

        drawAtmosphere(view);
        drawOcean(view);
        drawGrid(view);
        drawAllLand(view);

        if (global.GlobeDistricts) {
            global.GlobeDistricts.drawDistricts(view);
            global.GlobeDistricts.drawMarkers(view);
        }

        drawGlobeRim(view);
    }

    function drawAtmosphere(view) {
        for (let i = 5; i > 0; i--) {
            view.atmosphereGraphics.lineStyle(3, 0x4ade80, 0.03 * i);
            view.atmosphereGraphics.strokeCircle(0, 0, view.globeRadius + i * 4);
        }
    }

    function drawOcean(view) {
        view.oceanGraphics.fillStyle(0x0a3d62, 1);
        view.oceanGraphics.fillCircle(0, 0, view.globeRadius);
        view.oceanGraphics.fillStyle(0x1a5276, 0.5);
        view.oceanGraphics.fillCircle(-view.globeRadius * 0.2, -view.globeRadius * 0.2, view.globeRadius * 0.7);
    }

    function drawGrid(view) {
        view.gridGraphics.lineStyle(0.5, 0x3498db, 0.12);
        for (let lat = -80; lat <= 80; lat += 20) drawLatLine(view, lat);
        for (let lon = -180; lon < 180; lon += 20) drawLonLine(view, lon);
        view.gridGraphics.lineStyle(1, 0x22d3ee, 0.25);
        drawLatLine(view, 0);
    }

    function drawLatLine(view, lat) {
        const points = [];
        for (let lon = -180; lon <= 180; lon += 5) {
            const p = view.project3D(lat, lon);
            if (p.visible) points.push(p);
            else if (points.length > 1) {
                strokePoints(points, view.gridGraphics);
                points.length = 0;
            } else {
                points.length = 0;
            }
        }
        if (points.length > 1) strokePoints(points, view.gridGraphics);
    }

    function drawLonLine(view, lon) {
        const points = [];
        for (let lat = -90; lat <= 90; lat += 5) {
            const p = view.project3D(lat, lon);
            if (p.visible) points.push(p);
            else if (points.length > 1) {
                strokePoints(points, view.gridGraphics);
                points.length = 0;
            } else {
                points.length = 0;
            }
        }
        if (points.length > 1) strokePoints(points, view.gridGraphics);
    }

    function strokePoints(points, graphics) {
        if (points.length < 2) return;
        graphics.beginPath();
        graphics.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) graphics.lineTo(points[i].x, points[i].y);
        graphics.strokePath();
    }

    function drawAllLand(view) {
        if (typeof WORLD_DATA === 'undefined') {
            console.warn('WORLD_DATA missing - cannot draw land');
            return;
        }

        const landMasses = Object.entries(WORLD_DATA).map(([name, coords]) => {
            const projected = coords.map(([lat, lon]) => view.project3D(lat, lon));
            const avgZ = projected.reduce((sum, p) => sum + p.z, 0) / projected.length;
            return { name, coords, projected, avgZ };
        }).sort((a, b) => a.avgZ - b.avgZ);

        for (const { name, projected } of landMasses) {
            const colors = (typeof LAND_COLORS !== 'undefined' ? LAND_COLORS[name] : null) || { fill: 0x2d5a27, stroke: 0x1e3d1a };
            drawLandMass(view, projected, colors);
        }
    }

    function drawLandMass(view, projectedPoints, colors) {
        const visiblePoints = projectedPoints.filter(p => p.visible);
        if (visiblePoints.length < 3) return;

        const segments = [];
        let current = [];
        for (let i = 0; i < projectedPoints.length; i++) {
            const p = projectedPoints[i];
            if (p.visible) current.push(p);
            else if (current.length > 0) {
                segments.push([...current]);
                current = [];
            }
        }
        if (current.length > 0) segments.push(current);

        if (segments.length > 1 && projectedPoints[0].visible && projectedPoints[projectedPoints.length - 1].visible) {
            const first = segments.shift();
            const last = segments[segments.length - 1];
            segments[segments.length - 1] = [...last, ...first];
        }

        for (const segment of segments) {
            if (segment.length < 3) continue;
            view.landGraphics.fillStyle(colors.fill, 0.9);
            view.landGraphics.beginPath();
            view.landGraphics.moveTo(segment[0].x, segment[0].y);
            for (let i = 1; i < segment.length; i++) view.landGraphics.lineTo(segment[i].x, segment[i].y);
            view.landGraphics.closePath();
            view.landGraphics.fillPath();

            view.borderGraphics.lineStyle(1.2, colors.stroke, 0.9);
            view.borderGraphics.beginPath();
            view.borderGraphics.moveTo(segment[0].x, segment[0].y);
            for (let i = 1; i < segment.length; i++) view.borderGraphics.lineTo(segment[i].x, segment[i].y);
            view.borderGraphics.closePath();
            view.borderGraphics.strokePath();
        }
    }

    function drawGlobeRim(view) {
        view.atmosphereGraphics.lineStyle(2, 0x0ea5e9, 0.6);
        view.atmosphereGraphics.strokeCircle(0, 0, view.globeRadius);
    }

    global.GlobeRendering = {
        renderGlobe
    };
})(window);
