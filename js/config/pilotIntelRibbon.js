const PILOT_INTEL_RULES = Object.freeze({
    baseIntelByMode: Object.freeze({
        classic: 10,
        survival: 14,
        assault: 18
    }),
    criticalMultiplier: 1.5,
    occupiedSuppression: true
});

const PILOT_RIBBON_MILESTONES = Object.freeze([
    Object.freeze({ threshold: 20, reward: { type: 'unlock', weaponId: 'scattergun', label: 'Unlock Scattergun' } }),
    Object.freeze({ threshold: 45, reward: { type: 'tier', weaponId: 'combatRifle', amount: 1, label: 'Combat Rifle Tier +1' } }),
    Object.freeze({ threshold: 75, reward: { type: 'ammo_cap_bonus', weaponId: 'scattergun', amount: 80, label: '+80 Scattergun ammo next deployment' } }),
    Object.freeze({ threshold: 110, reward: { type: 'unlock', weaponId: 'plasmaLauncher', label: 'Unlock Plasma Launcher' } }),
    Object.freeze({ threshold: 150, reward: { type: 'tier', weaponId: 'plasmaLauncher', amount: 1, label: 'Plasma Launcher Tier +1' } })
]);

function normalizeMode(mode) {
    return Object.prototype.hasOwnProperty.call(PILOT_INTEL_RULES.baseIntelByMode, mode) ? mode : 'classic';
}

function computePilotIntelAward({
    success,
    missionMode,
    wasCritical,
    preMissionStatus,
    districtStatusAfter
} = {}) {
    const out = {
        amount: 0,
        eligible: false,
        reason: 'not_eligible',
        tags: []
    };
    if (!success) {
        out.reason = 'mission_failed';
        return out;
    }

    const statusBefore = preMissionStatus || null;
    const statusAfter = districtStatusAfter || null;
    if (PILOT_INTEL_RULES.occupiedSuppression && statusBefore === 'occupied' && statusAfter !== 'friendly') {
        out.reason = 'occupied_suppressed';
        return out;
    }

    const mode = normalizeMode(missionMode);
    let amount = PILOT_INTEL_RULES.baseIntelByMode[mode] || PILOT_INTEL_RULES.baseIntelByMode.classic;
    out.tags.push(statusBefore === 'occupied' ? 'liberation' : 'defense_clear');

    if (wasCritical) {
        amount = Math.round(amount * PILOT_INTEL_RULES.criticalMultiplier);
        out.tags.push('critical_bonus');
    }

    out.amount = Math.max(0, Math.round(amount));
    out.eligible = out.amount > 0;
    out.reason = out.eligible ? 'awarded' : 'zero_award';
    return out;
}

function getMilestonesCrossed(previousIntel = 0, nextIntel = 0) {
    const from = Math.max(0, Number.isFinite(previousIntel) ? previousIntel : 0);
    const to = Math.max(0, Number.isFinite(nextIntel) ? nextIntel : 0);
    if (to <= from) return [];
    return PILOT_RIBBON_MILESTONES.filter((entry) => entry.threshold > from && entry.threshold <= to);
}

function getNextRibbonMilestone(intel = 0) {
    const current = Math.max(0, Number.isFinite(intel) ? intel : 0);
    return PILOT_RIBBON_MILESTONES.find((entry) => entry.threshold > current) || null;
}

function getWeaponDisplayName(weaponId) {
    const labels = {
        combatRifle: 'Combat Rifle',
        scattergun: 'Scattergun',
        plasmaLauncher: 'Plasma Launcher',
        lightningGun: 'Lightning Gun',
        stingerDrone: 'Stinger Drone'
    };
    return labels[weaponId] || weaponId || 'Unknown Weapon';
}

function describeReward(reward) {
    if (!reward) return 'Unknown reward';
    if (reward.label) return reward.label;
    if (reward.type === 'unlock') return `Unlock ${getWeaponDisplayName(reward.weaponId)}`;
    if (reward.type === 'tier') return `${getWeaponDisplayName(reward.weaponId)} Tier +${reward.amount || 1}`;
    if (reward.type === 'ammo_cap_bonus') return `+${reward.amount || 0} ${getWeaponDisplayName(reward.weaponId)} ammo next deployment`;
    return reward.type || 'reward';
}

function resolveRibbonReward({ metaState, milestone, districtId } = {}) {
    if (!milestone || !milestone.reward) {
        return { applied: false, reason: 'invalid_milestone' };
    }
    const reward = milestone.reward;
    return {
        applied: true,
        districtId: districtId || null,
        threshold: milestone.threshold,
        rewardType: reward.type,
        summary: describeReward(reward),
        rewardPayload: {
            ...reward,
            source: 'pilot_intel_ribbon',
            sourceDistrict: districtId || null,
            threshold: milestone.threshold,
            contextMeta: metaState || null
        }
    };
}

const exported = {
    PILOT_INTEL_RULES,
    PILOT_RIBBON_MILESTONES,
    computePilotIntelAward,
    getMilestonesCrossed,
    getNextRibbonMilestone,
    resolveRibbonReward,
    describeReward,
    getWeaponDisplayName
};

if (typeof module !== 'undefined') {
    module.exports = exported;
}

if (typeof window !== 'undefined') {
    window.pilotIntelRibbon = exported;
}
