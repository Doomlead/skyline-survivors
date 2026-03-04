// ------------------------
// File: js/ui/map/mapDistrictVisuals.js
// ------------------------

(function() {
    function drawDistrictThreatPulse({ graphics, district, projected, radius, now }) {
        if (!graphics || !district?.state || !['threatened', 'critical'].includes(district.state.status)) return;

        const maxTimer = district.config?.timer || 1;
        const isCritical = district.state.status === 'critical';
        const remaining = isCritical ? (district.state.criticalTimer ?? 0) : Math.max(0, district.state.timer ?? 0);
        const urgency = isCritical ? 1 : (maxTimer > 0 ? Phaser.Math.Clamp(1 - remaining / maxTimer, 0, 1) : 1);
        const pulseSpeed = isCritical ? 0.008 : Phaser.Math.Linear(0.002, 0.006, urgency);
        const pulse = (Math.sin(now * pulseSpeed) + 1) / 2;
        const pulseRadius = radius * (1.7 + pulse * (isCritical ? 0.7 : 0.6));
        const pulseAlpha = Phaser.Math.Linear(0.2, 0.7, pulse) * Phaser.Math.Linear(0.8, 1, urgency);
        const pulseColor = isCritical ? 0xf97316 : (urgency > 0.65 ? 0xf87171 : urgency > 0.35 ? 0xfbbf24 : 0xfef08a);

        graphics.lineStyle(2, pulseColor, pulseAlpha);
        graphics.strokeCircle(projected.x, projected.y, pulseRadius);

        if (isCritical) {
            const alertPulse = (Math.sin(now * 0.012) + 1) / 2;
            const alertRadius = radius * (2.4 + alertPulse * 0.9);
            const alertAlpha = Phaser.Math.Linear(0.1, 0.55, alertPulse);
            graphics.lineStyle(1.5, 0xfca5a5, alertAlpha);
            graphics.strokeCircle(projected.x, projected.y, alertRadius);
        }
    }

    function drawProsperitySignals({ graphics, district, projected, radius, now }) {
        if (!graphics || !district?.state) return;

        const prosperityMultiplier = district.state.prosperityMultiplier || 1;
        const prosperityLevel = Math.max(0, district.state.prosperityLevel || 0);
        const lossActive = district.state.prosperityLossTimer > 0 && district.state.lastProsperityLoss > 0;

        if (prosperityMultiplier > 1 && district.state.status === 'friendly') {
            const glowPulse = (Math.sin(now * 0.004) + 1) / 2;
            const glowRadius = radius * (1.9 + glowPulse * 0.5);
            const glowAlpha = Phaser.Math.Linear(0.12, 0.35, glowPulse);
            const glowColor = prosperityLevel >= 4 ? 0x34d399 : 0x22c55e;
            graphics.lineStyle(1.5, glowColor, glowAlpha);
            graphics.strokeCircle(projected.x, projected.y, glowRadius);
        }

        if (lossActive) {
            const lossPulse = (Math.sin(now * 0.015) + 1) / 2;
            const lossRadius = radius * (2.2 + lossPulse * 0.6);
            const lossAlpha = Phaser.Math.Linear(0.2, 0.6, lossPulse);
            graphics.lineStyle(2, 0xf87171, lossAlpha);
            graphics.strokeCircle(projected.x, projected.y, lossRadius);
        }
    }

    window.mapDistrictVisuals = {
        drawDistrictThreatPulse,
        drawProsperitySignals
    };
})();
