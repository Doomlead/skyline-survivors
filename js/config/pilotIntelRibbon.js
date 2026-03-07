const PILOT_INTEL_CONFIG = Object.freeze({
    baseIntelByMode: Object.freeze({
        classic: Object.freeze({ success: 20, failure: 6 }),
        survival: Object.freeze({ success: 24, failure: 8 }),
        assault: Object.freeze({ success: 30, failure: 0 })
    }),
    criticalMultiplier: 1.5,
    milestoneThresholds: Object.freeze([100, 250, 450, 700, 1000, 1350]),
    milestoneWeaponOrder: Object.freeze(['scattergun', 'plasmaLauncher', 'lightningGun', 'stingerDrone']),
    ammoCapBonusByWeapon: Object.freeze({
        scattergun: 25,
        plasmaLauncher: 25,
        lightningGun: 2500,
        stingerDrone: 0
    })
});

function normalizeDistrictIntelState(entry = {}) {
    const next = entry;
    next.pilotIntel = Math.max(0, Math.round(Number(next.pilotIntel) || 0));
    const claimed = Array.isArray(next.pilotIntelMilestonesClaimed) ? next.pilotIntelMilestonesClaimed : [];
    next.pilotIntelMilestonesClaimed = [...new Set(claimed.filter((value) => Number.isFinite(value) && value > 0))].sort((a, b) => a - b);
    next.lastIntelAward = Number.isFinite(next.lastIntelAward) ? next.lastIntelAward : 0;
    next.lastIntelAwardBreakdown = next.lastIntelAwardBreakdown && typeof next.lastIntelAwardBreakdown === 'object'
        ? { ...next.lastIntelAwardBreakdown }
        : null;
    next.lastIntelRewards = Array.isArray(next.lastIntelRewards) ? [...next.lastIntelRewards] : [];
    return next;
}

function shouldSuppressIntelGain({ statusBefore, success, missionMode } = {}) {
    if (statusBefore !== 'occupied') return false;
    return !(success && missionMode === 'assault');
}

function getBaseIntelForOutcome({ success, missionMode } = {}) {
    const modeKey = PILOT_INTEL_CONFIG.baseIntelByMode[missionMode] ? missionMode : 'classic';
    const table = PILOT_INTEL_CONFIG.baseIntelByMode[modeKey];
    return success ? table.success : table.failure;
}

function computeIntelAward({ success = false, missionMode = 'classic', statusBefore = 'friendly', criticalAtLaunch = false } = {}) {
    const suppressed = shouldSuppressIntelGain({ statusBefore, success, missionMode });
    const baseIntel = suppressed ? 0 : getBaseIntelForOutcome({ success, missionMode });
    const criticalApplied = Boolean(criticalAtLaunch && baseIntel > 0);
    const multiplier = criticalApplied ? PILOT_INTEL_CONFIG.criticalMultiplier : 1;
    const finalIntel = Math.max(0, Math.round(baseIntel * multiplier));
    return {
        baseIntel,
        finalIntel,
        multiplier,
        criticalApplied,
        suppressed,
        statusBefore,
        missionMode,
        success
    };
}

function getCrossedMilestones(previousIntel = 0, currentIntel = 0, claimedMilestones = [], thresholds = PILOT_INTEL_CONFIG.milestoneThresholds) {
    const prev = Math.max(0, Math.round(previousIntel || 0));
    const current = Math.max(prev, Math.round(currentIntel || 0));
    const claimed = new Set(Array.isArray(claimedMilestones) ? claimedMilestones : []);
    return thresholds.filter((threshold) => prev < threshold && current >= threshold && !claimed.has(threshold));
}

function getNextMilestone(currentIntel = 0, thresholds = PILOT_INTEL_CONFIG.milestoneThresholds) {
    const current = Math.max(0, Math.round(currentIntel || 0));
    const threshold = thresholds.find((value) => current < value) || null;
    if (!threshold) {
        return {
            threshold: null,
            remaining: 0,
            progress: 1,
            previousThreshold: thresholds[thresholds.length - 1] || 0
        };
    }
    const previousThreshold = thresholds.filter((value) => value < threshold).slice(-1)[0] || 0;
    const span = Math.max(1, threshold - previousThreshold);
    const progress = Math.max(0, Math.min(1, (current - previousThreshold) / span));
    return {
        threshold,
        remaining: Math.max(0, threshold - current),
        progress,
        previousThreshold
    };
}

function getMilestoneWeapon(threshold, thresholds = PILOT_INTEL_CONFIG.milestoneThresholds) {
    const idx = Math.max(0, thresholds.indexOf(threshold));
    return PILOT_INTEL_CONFIG.milestoneWeaponOrder[idx % PILOT_INTEL_CONFIG.milestoneWeaponOrder.length] || 'scattergun';
}

function buildMilestoneReward({ threshold, pilotProfile } = {}) {
    const weaponId = getMilestoneWeapon(threshold);
    const profile = pilotProfile && typeof pilotProfile === 'object' ? pilotProfile : { unlocked: {}, tiers: {} };
    const unlocked = Boolean(profile.unlocked?.[weaponId]);
    const tier = Number(profile.tiers?.[weaponId] || 0);

    if (!unlocked) {
        return {
            type: 'unlock',
            weaponId,
            threshold,
            label: `Unlock ${weaponId}`
        };
    }

    if (tier < 3) {
        return {
            type: 'tier_token',
            weaponId,
            amount: 1,
            threshold,
            label: `${weaponId} Tier +1`
        };
    }

    const ammoBonus = PILOT_INTEL_CONFIG.ammoCapBonusByWeapon[weaponId] || 20;
    return {
        type: 'ammo_cap_bonus',
        weaponId,
        amount: ammoBonus,
        threshold,
        label: `${weaponId} ammo cap +${ammoBonus} (next deployment)`
    };
}

function getRibbonSummary({ intel = 0, claimedMilestones = [], pilotProfile } = {}) {
    const next = getNextMilestone(intel);
    const nextReward = next.threshold ? buildMilestoneReward({ threshold: next.threshold, pilotProfile }) : null;
    return {
        intel: Math.max(0, Math.round(intel || 0)),
        nextMilestone: next,
        nextReward,
        claimedCount: Array.isArray(claimedMilestones) ? claimedMilestones.length : 0
    };
}

const exported = {
    PILOT_INTEL_CONFIG,
    normalizeDistrictIntelState,
    shouldSuppressIntelGain,
    computeIntelAward,
    getCrossedMilestones,
    getNextMilestone,
    buildMilestoneReward,
    getRibbonSummary
};

if (typeof module !== 'undefined') {
    module.exports = exported;
}

if (typeof window !== 'undefined') {
    window.pilotIntelRibbon = exported;
}
