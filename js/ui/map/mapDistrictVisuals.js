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


    function drawPilotIntelRibbon({ graphics, district, projected, radius }) {
        if (!graphics || !district?.state || !projected?.visible) return;
        const intel = Math.max(0, Number(district.state.pilotIntel || 0));
        const intelModule = window.pilotIntelRibbon || {};
        const profile = window.metaProgression?.getPilotWeaponProfile?.();
        const summary = intelModule.getRibbonSummary
            ? intelModule.getRibbonSummary({
                intel,
                claimedMilestones: district.state.pilotIntelMilestonesClaimed || [],
                pilotProfile: profile
            })
            : null;
        const nextMilestone = Number(summary?.nextMilestone?.threshold || district.state.pilotIntelNextMilestone || 0);
        const toNext = Math.max(0, Number(summary?.nextMilestone?.remaining || district.state.pilotIntelToNext || 0));
        let progress = Number(summary?.nextMilestone?.progress ?? district.state.pilotIntelRibbonProgress);
        if (!Number.isFinite(progress)) {
            if (nextMilestone > 0) {
                const prev = Math.max(0, nextMilestone - Math.max(1, toNext + Math.round(intel)));
                const span = Math.max(1, nextMilestone - prev);
                progress = Math.max(0, Math.min(1, (intel - prev) / span));
            } else {
                progress = 1;
            }
        }

        const width = radius * 4.2;
        const height = 4;
        const x = projected.x - width / 2;
        const y = projected.y + radius + 5;

        const status = district.state.status;
        const fillColor = status === 'critical'
            ? 0xfb923c
            : status === 'occupied'
                ? 0xf87171
                : status === 'threatened'
                    ? 0xfacc15
                    : 0x38bdf8;

        graphics.fillStyle(0x020617, 0.8);
        graphics.fillRoundedRect(x - 1, y - 1, width + 2, height + 2, 2);
        graphics.fillStyle(0x1e293b, 0.95);
        graphics.fillRoundedRect(x, y, width, height, 2);
        graphics.fillStyle(fillColor, 0.95);
        graphics.fillRoundedRect(x, y, Math.max(1, width * Math.max(0, Math.min(1, progress))), height, 2);

        const pips = [0.2, 0.4, 0.6, 0.8];
        graphics.lineStyle(1, 0xe2e8f0, 0.35);
        pips.forEach((ratio) => {
            const px = x + width * ratio;
            graphics.lineBetween(px, y, px, y + height);
        });
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
        drawProsperitySignals,
        drawPilotIntelRibbon
    };
})();
