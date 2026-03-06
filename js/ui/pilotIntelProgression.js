// ------------------------
// File: js/ui/pilotIntelProgression.js
// ------------------------

(function(root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    }
    if (typeof root !== 'undefined') {
        root.pilotIntelProgression = factory();
    }
})(typeof window !== 'undefined' ? window : globalThis, function() {
    const PILOT_WEAPON_ORDER = ['scattergun', 'plasmaLauncher', 'lightningGun', 'stingerDrone'];
    const MILESTONE_INTERVAL = 100;

    const BASE_AWARD = {
        success: {
            stable: 20,
            threatened: 26,
            critical: 30,
            occupied: 34
        },
        failed: {
            stable: 0,
            threatened: 0,
            critical: 0,
            occupied: 0
        }
    };

    function normalizeDistrictIntelState(state) {
        if (!state || typeof state !== 'object') return state;
        state.pilotIntel = Math.max(0, Math.floor(Number(state.pilotIntel) || 0));
        state.pilotIntelMilestoneIndex = Math.max(0, Math.floor(Number(state.pilotIntelMilestoneIndex) || 0));
        state.pilotIntelLastReward = state.pilotIntelLastReward || null;
        state.pilotIntelLastAwardMissionId = state.pilotIntelLastAwardMissionId || null;
        state.pilotIntelLastProcessedMissionId = state.pilotIntelLastProcessedMissionId || null;
        return state;
    }

    function getUrgencyLabel(state, directives) {
        if (directives?.urgency) return String(directives.urgency).toLowerCase();
        if (!state) return 'stable';
        if (state.status === 'occupied') return 'occupied';
        if (state.status === 'critical') return 'critical';
        if (state.status === 'threatened') return 'threatened';
        return 'stable';
    }

    function getBaseIntelAward({ success, urgency }) {
        const outcomeKey = success ? 'success' : 'failed';
        const urgencyKey = BASE_AWARD[outcomeKey][urgency] !== undefined ? urgency : 'stable';
        return BASE_AWARD[outcomeKey][urgencyKey] || 0;
    }

    function computeIntelAward(params = {}) {
        const urgency = getUrgencyLabel(params.preMissionState, params.directives);
        const baseIntel = getBaseIntelAward({ success: !!params.success, urgency });
        const criticalBonusMultiplier = urgency === 'critical' ? 1.5 : 1;
        const occupiedSuppressed = params.preMissionState?.status === 'occupied';
        const awardIntel = occupiedSuppressed ? 0 : Math.round(baseIntel * criticalBonusMultiplier);
        return {
            urgency,
            baseIntel,
            criticalBonusMultiplier,
            occupiedSuppressed,
            awardIntel
        };
    }

    function getCurrentMilestoneTarget(state) {
        const milestoneIndex = Math.max(0, Number(state?.pilotIntelMilestoneIndex) || 0);
        return (milestoneIndex + 1) * MILESTONE_INTERVAL;
    }

    function getIntelProgressSnapshot(state) {
        const currentIntel = Math.max(0, Math.floor(Number(state?.pilotIntel) || 0));
        const target = getCurrentMilestoneTarget(state);
        const previousTarget = target - MILESTONE_INTERVAL;
        const inBand = Math.max(0, currentIntel - previousTarget);
        const progressRatio = typeof Phaser !== 'undefined' && Phaser?.Math?.Clamp
            ? Phaser.Math.Clamp(inBand / MILESTONE_INTERVAL, 0, 1)
            : Math.max(0, Math.min(1, inBand / MILESTONE_INTERVAL));
        return {
            currentIntel,
            milestoneTarget: target,
            progressRatio
        };
    }

    function resolveMilestoneReward({ profile }) {
        const safeProfile = profile || { unlocked: {}, tiers: {} };
        const unlocked = safeProfile.unlocked || {};
        const tiers = safeProfile.tiers || {};

        const missingWeapon = PILOT_WEAPON_ORDER.find((weapon) => !unlocked[weapon]);
        if (missingWeapon) {
            return { type: 'unlock', weapon: missingWeapon };
        }

        const tierCandidate = PILOT_WEAPON_ORDER.find((weapon) => Boolean(unlocked[weapon]) && (tiers[weapon] || 0) < 3);
        if (tierCandidate) {
            return { type: 'tier_token', weapon: tierCandidate };
        }

        return { type: 'ammo_cap_bonus', amount: 1 };
    }

    function applyIntelAwardToState(state, awardIntel) {
        normalizeDistrictIntelState(state);
        state.pilotIntel = Math.max(0, (state.pilotIntel || 0) + Math.max(0, Math.floor(awardIntel || 0)));
        return state.pilotIntel;
    }

    function processMilestones(state, resolveRewardFn) {
        normalizeDistrictIntelState(state);
        const rewards = [];
        while (state.pilotIntel >= getCurrentMilestoneTarget(state)) {
            state.pilotIntelMilestoneIndex = (state.pilotIntelMilestoneIndex || 0) + 1;
            const reward = typeof resolveRewardFn === 'function' ? resolveRewardFn() : null;
            if (reward) {
                state.pilotIntelLastReward = reward;
                rewards.push(reward);
            }
        }
        return rewards;
    }

    function describeNextReward(profile) {
        const reward = resolveMilestoneReward({ profile });
        if (reward.type === 'unlock') return `Unlock ${reward.weapon}`;
        if (reward.type === 'tier_token') return `${reward.weapon} tier token`;
        return 'Next-deployment ammo-cap bonus';
    }

    return {
        PILOT_WEAPON_ORDER,
        MILESTONE_INTERVAL,
        normalizeDistrictIntelState,
        getUrgencyLabel,
        computeIntelAward,
        getCurrentMilestoneTarget,
        getIntelProgressSnapshot,
        resolveMilestoneReward,
        applyIntelAwardToState,
        processMilestones,
        describeNextReward
    };
});
