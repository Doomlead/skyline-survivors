(function registerGlobeDistricts(global) {
    function initializeDistricts(view) {
        if (typeof missionPlanner === 'undefined') return;
        const sectorConfigs = missionPlanner.getDistrictConfigs();
        view.districts = [];
        sectorConfigs.forEach(config => {
            const state = missionPlanner.getDistrictState(config.id);
            view.districts.push({ config, state });
        });
    }

    function createBattleshipMarkers(view) {
        if (typeof missionPlanner === 'undefined' || !view.planetContainer) return;
        view.battleshipMarkers.forEach(marker => marker.destroy());
        view.battleshipMarkers = [];
        const ships = missionPlanner.getBattleships();
        ships.forEach(() => {
            const hull = view.scene.add.triangle(0, 0, 0, -12, -10, 10, 10, 10, 0xf43f5e, 0.95);
            hull.setStrokeStyle(2, 0xffffff, 0.9);
            hull.setBlendMode(Phaser.BlendModes.ADD);
            hull.setDepth(6);
            view.planetContainer.add(hull);
            view.scene.tweens.add({
                targets: hull,
                scale: 1.15,
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            view.battleshipMarkers.push(hull);
        });
    }

    function getDistrictCenterCoords(config) {
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

    function drawDistricts(view) {
        if (!view.districts.length) return;
        view.districts.forEach(district => {
            const center = getDistrictCenterCoords(district.config);
            const projected = view.project3D(center.lat, center.lon);
            if (!projected.visible) return;

            const isSelected = view.selectedDistrict === district;
            const isOccupied = district.state.status === 'occupied';
            const baseRadius = 8;
            const radius = isSelected ? baseRadius * 1.3 : baseRadius;
            const alpha = isOccupied ? 0.5 : 0.8;

            drawDistrictThreatPulse(view, district, projected, radius);
            if (district.state.underAttack && !isOccupied) {
                const attackPulse = (Math.sin(view.scene.time.now / 200) + 1) / 2;
                const attackRadius = radius * (2.1 + attackPulse * 0.6);
                view.districtGraphics.lineStyle(2.5, 0xef4444, 0.7);
                view.districtGraphics.strokeCircle(projected.x, projected.y, attackRadius);
            }

            view.districtGraphics.fillStyle(district.config.color, alpha * 0.3);
            view.districtGraphics.fillCircle(projected.x, projected.y, radius * 2);
            view.districtGraphics.fillStyle(district.config.color, alpha);
            view.districtGraphics.fillCircle(projected.x, projected.y, radius);
            view.districtGraphics.lineStyle(isSelected ? 2.5 : 1.5, 0xffffff, alpha * 0.8);
            view.districtGraphics.strokeCircle(projected.x, projected.y, radius);

            district.projectedX = projected.x;
            district.projectedY = projected.y;
            district.projectedRadius = radius * 2;
        });
        setupDistrictInteraction(view);
    }

    function drawDistrictThreatPulse(view, district, projected, radius) {
        if (!district?.state || district.state.status !== 'threatened') return;
        const maxTimer = district.config?.timer || 1;
        if (maxTimer <= 0) return;
        const remaining = Math.max(0, district.state.timer ?? 0);
        const urgency = Phaser.Math.Clamp(1 - remaining / maxTimer, 0, 1);
        const pulseSpeed = Phaser.Math.Linear(0.002, 0.006, urgency);
        const pulse = (Math.sin(view.scene.time.now * pulseSpeed) + 1) / 2;
        const pulseRadius = radius * (1.6 + pulse * 0.6);
        const pulseAlpha = Phaser.Math.Linear(0.15, 0.55, pulse) * Phaser.Math.Linear(0.7, 1, urgency);
        const pulseColor = urgency > 0.65 ? 0xf87171 : urgency > 0.35 ? 0xfbbf24 : 0xfef08a;

        view.districtGraphics.lineStyle(2, pulseColor, pulseAlpha);
        view.districtGraphics.strokeCircle(projected.x, projected.y, pulseRadius);
    }

    function setupDistrictInteraction(view) {
        if (view._districtClickHandler) view.scene.input.off('pointerdown', view._districtClickHandler);
        view._districtClickHandler = (pointer) => {
            const localX = pointer.x - view.centerX;
            const localY = pointer.y - view.centerY;
            for (const district of view.districts) {
                if (district.projectedX === undefined) continue;
                const dist = Phaser.Math.Distance.Between(localX, localY, district.projectedX, district.projectedY);
                if (dist < district.projectedRadius) {
                    focusDistrict(view, district);
                    return;
                }
            }
        };
        view.scene.input.on('pointerdown', view._districtClickHandler);
    }

    function drawMarkers(view) {
        if (!view.selectedDistrict) return;
        const center = getDistrictCenterCoords(view.selectedDistrict.config);
        const projected = view.project3D(center.lat, center.lon);
        if (!projected.visible) return;

        const pingRadius = 12 + Math.sin(view.scene.time.now / 200) * 4;
        view.markerGraphics.fillStyle(0xff8fab, 0.3);
        view.markerGraphics.fillCircle(projected.x, projected.y, pingRadius);
        view.markerGraphics.fillStyle(0xff4d6d, 1);
        view.markerGraphics.fillCircle(projected.x, projected.y, 5);
        view.markerGraphics.lineStyle(2, 0xffffff, 0.9);
        view.markerGraphics.strokeCircle(projected.x, projected.y, 5);
    }

    function focusDistrict(view, district, skipTweens = false) {
        if (view.selectedDistrict === district) return;
        view.selectedDistrict = district;
        view.onDistrictFocused?.(district);

        const center = getDistrictCenterCoords(district.config);
        const targetRotY = -center.lon * Math.PI / 180;
        const targetRotX = center.lat * Math.PI / 180 * 0.5;

        if (!skipTweens) {
            view.scene.tweens.add({
                targets: view,
                rotationY: targetRotY,
                rotationX: targetRotX,
                duration: 600,
                ease: 'Sine.easeInOut'
            });
            view.scene.tweens.add({
                targets: view.scene.cameras.main,
                zoom: 1.08,
                duration: 300,
                yoyo: true,
                ease: 'Sine.easeOut'
            });
        }
        view.autoRotate = false;
    }

    global.GlobeDistricts = {
        createBattleshipMarkers,
        drawDistricts,
        drawDistrictThreatPulse,
        drawMarkers,
        focusDistrict,
        getDistrictCenterCoords,
        initializeDistricts,
        setupDistrictInteraction
    };
})(window);
