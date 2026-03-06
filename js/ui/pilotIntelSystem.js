// ------------------------
// File: js/ui/pilotIntelSystem.js
// ------------------------

(function(root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    }
    if (root) {
        root.pilotIntelSystem = factory();
    }
})(typeof globalThis !== 'undefined' ? globalThis : window, function() {
    const TRACK_WEAPONS = ['scattergun', 'plasmaLauncher', 'lightningGun', 'stingerDrone'];
    const MILESTONE_TARGETS = [100, 220, 360, 520, 700, 900];

    function getDefaultIntelState() {
        return {
            intelProgress: 0,
            intelMilestoneIndex: 0,
            intelLastReward: null,
            intelSuppressed: false,
            intelLastMissionEventId: null,
            intelLastAwardAmount: 0
        };
    }

    function ensureIntelState(state) {
        const defaults = getDefaultIntelState();
        const out = { ...defaults, ...(state || {}) };
        out.intelProgress = Math.max(0, Math.round(Number(out.intelProgress) || 0));
        out.intelMilestoneIndex = Math.max(0, Math.round(Number(out.intelMilestoneIndex) || 0));
        out.intelSuppressed = Boolean(out.intelSuppressed || out.status === 'occupied');
        out.intelLastAwardAmount = Math.max(0, Math.round(Number(out.intelLastAwardAmount) || 0));
        return out;
    }

    function getUrgencyBaseIntel(urgency, success) {
        if (!success) return 12;
        switch (urgency) {
            case 'occupied':
                return 24;
            case 'critical':
                return 20;
            case 'threatened':
                return 16;
            case 'stable':
                return 12;
            default:
                return 14;
        }
    }

    function calculateIntelAward({ success, urgency, districtStatus }) {
        const occupied = districtStatus === 'occupied';
        if (occupied) {
            return { amount: 0, suppressed: true, criticalBonusApplied: false, baseAward: 0 };
        }
        const baseAward = getUrgencyBaseIntel(urgency, success);
        const criticalBonusApplied = urgency === 'critical';
        const amount = Math.round(baseAward * (criticalBonusApplied ? 1.5 : 1));
        return { amount, suppressed: false, criticalBonusApplied, baseAward };
    }

    function getNextMilestoneTarget(index) {
        if (index < MILESTONE_TARGETS.length) return MILESTONE_TARGETS[index];
        const overflowIndex = index - MILESTONE_TARGETS.length + 1;
        return MILESTONE_TARGETS[MILESTONE_TARGETS.length - 1] + overflowIndex * 220;
    }

    function getRibbonProgress(state) {
        const normalized = ensureIntelState(state);
        const currentTarget = getNextMilestoneTarget(normalized.intelMilestoneIndex);
        const previousTarget = normalized.intelMilestoneIndex > 0
            ? getNextMilestoneTarget(normalized.intelMilestoneIndex - 1)
            : 0;
        const segmentProgress = Math.max(0, normalized.intelProgress - previousTarget);
        const segmentSize = Math.max(1, currentTarget - previousTarget);
        return {
            current: normalized.intelProgress,
            previousTarget,
            nextTarget: currentTarget,
            percentToNext: Math.max(0, Math.min(1, segmentProgress / segmentSize))
        };
    }

    function getNextRewardPreview(profile) {
        const normalized = profile || {};
        const unlocked = normalized.unlocked || {};
        const tiers = normalized.tiers || {};
        const missing = TRACK_WEAPONS.find((weapon) => !unlocked[weapon]);
        if (missing) {
            return { type: 'unlock', weapon: missing, label: `Unlock ${missing}` };
        }
        const upgrade = TRACK_WEAPONS
            .filter((weapon) => unlocked[weapon] && (tiers[weapon] || 0) < 3)
            .sort((a, b) => (tiers[a] || 0) - (tiers[b] || 0) || TRACK_WEAPONS.indexOf(a) - TRACK_WEAPONS.indexOf(b))[0];
        if (upgrade) {
            return { type: 'tier_token', weapon: upgrade, label: `Tier token: ${upgrade}` };
        }
        return { type: 'ammo_cap_bonus', label: 'Next deployment ammo-cap bonus' };
    }

    return {
        TRACK_WEAPONS,
        MILESTONE_TARGETS,
        getDefaultIntelState,
        ensureIntelState,
        calculateIntelAward,
        getNextMilestoneTarget,
        getRibbonProgress,
        getNextRewardPreview
    };
});
