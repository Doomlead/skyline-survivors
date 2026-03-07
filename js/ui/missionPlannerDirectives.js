// -----------------------------------
// js/ui/missionPlannerDirectives.js
// -----------------------------------

(function() {
    function buildDistrictMissionDirectives(config, state, modeOverride = null) {
        const pilotIntel = window.pilotIntelRibbon || {};
        if (!config || !state) return null;

        const urgency = state.status === 'occupied'
            ? 'occupied'
            : state.status === 'critical'
                ? 'critical'
                : state.status === 'friendly'
                    ? 'stable'
                    : 'threatened';

        const baseRewardMultiplier = urgency === 'occupied' ? 1.5 : urgency === 'critical' ? 1.25 : 1;
        const prosperityLevel = Math.max(0, state.prosperityLevel || 0);
        const prosperityMultiplier = state.prosperityMultiplier || 1;
        const clutchDefenseBonus = urgency === 'critical' ? 0.2 : 0;
        const rewardMultiplier = baseRewardMultiplier * prosperityMultiplier + clutchDefenseBonus;
        const spawnMultiplier = urgency === 'occupied' ? 1.35 : urgency === 'critical' ? 1.15 : 1;
        const humans = urgency === 'occupied' ? 10 : urgency === 'critical' ? 18 : 15;

        const focusedTypes = [...(config.threats || [])];
        if (urgency !== 'threatened' && urgency !== 'stable') {
            focusedTypes.push('bomber', 'kamikaze');
        }
        if (urgency === 'occupied') {
            focusedTypes.push('shield', 'spawner');
        }

        const threatMix = focusedTypes.map(type => ({ type, weight: 2 }));
        threatMix.push({ type: 'lander', weight: 1 });
        threatMix.push({ type: 'mutant', weight: 1 });

        const pilotProfile = window.metaProgression?.getPilotWeaponProfile?.();
        const intelSummary = pilotIntel.getRibbonSummary
            ? pilotIntel.getRibbonSummary({
                intel: state.pilotIntel || 0,
                claimedMilestones: state.pilotIntelMilestonesClaimed || [],
                pilotProfile
            })
            : null;

        return {
            districtId: config.id,
            districtName: config.name,
            reward: config.reward,
            urgency,
            rewardMultiplier,
            clutchDefenseBonus,
            prosperityLevel,
            prosperityMultiplier,
            spawnMultiplier,
            humans,
            timer: state.timer,
            criticalTimer: state.criticalTimer ?? 0,
            prosperityLossTimer: state.prosperityLossTimer ?? 0,
            lastProsperityLoss: state.lastProsperityLoss ?? 0,
            status: state.status,
            mode: modeOverride,
            districtState: { ...state },
            threatMix,
            pilotIntel: state.pilotIntel || 0,
            pilotIntelNextMilestone: intelSummary?.nextMilestone?.threshold || null,
            pilotIntelToNext: intelSummary?.nextMilestone?.remaining || 0,
            pilotIntelRibbonProgress: intelSummary?.nextMilestone?.progress ?? 0,
            pilotIntelNextRewardPreview: intelSummary?.nextReward || null,
            pilotWeaponProfile: pilotProfile
        };
    }

    function buildMothershipMissionDirectives(mothershipConfig) {
        if (!mothershipConfig) return null;

        const threatMix = (mothershipConfig.threatMix || []).map(type => ({ type, weight: 2 }));
        return {
            districtId: mothershipConfig.id,
            districtName: mothershipConfig.name,
            reward: mothershipConfig.reward,
            urgency: 'final',
            rewardMultiplier: 2.5,
            spawnMultiplier: 1.4,
            humans: 0,
            timer: null,
            status: 'core breached',
            mode: 'mothership',
            missionType: 'mothership',
            bossKey: 'mothershipCore',
            backgroundStyle: mothershipConfig.backgroundStyle,
            threatMix
        };
    }

    window.missionPlannerDirectives = {
        buildDistrictMissionDirectives,
        buildMothershipMissionDirectives
    };
})();
