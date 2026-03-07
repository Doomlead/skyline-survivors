const ASSAULT_REWARD_TABLE = Object.freeze([
    { id: 'cache-salvage', bucket: 'standard', weight: 38, rarity: 'common', payload: { type: 'meta_credits', label: 'Salvage Cache', value: 120 } },
    { id: 'cache-requisition', bucket: 'standard', weight: 24, rarity: 'common', payload: { type: 'meta_credits', label: 'Requisition Stipend', value: 170 } },
    { id: 'cache-ordnance', bucket: 'standard', weight: 16, rarity: 'uncommon', payload: { type: 'smart_bombs', label: 'Ordnance Reserve', value: 1 } },
    { id: 'mystery-weapon-tier', bucket: 'mystery', weight: 12, rarity: 'rare', payload: { type: 'pilot_weapon_tier', label: 'Prototype Armament Data', value: 1 } },
    { id: 'jackpot-credit-haul', bucket: 'jackpot', weight: 7, rarity: 'epic', payload: { type: 'meta_credits', label: 'Jackpot Credit Haul', value: 450 } },
    { id: 'jackpot-score-fusion', bucket: 'jackpot', weight: 3, rarity: 'epic', payload: { type: 'score_bonus', label: 'Jackpot Tactical Data Vault', value: 3000 } }
]);

const ASSAULT_REWARD_CONSTRAINTS = Object.freeze({
    jackpotCooldownSuccesses: 2,
    pityThreshold: 4,
    maxCreditEquivalentPerRun: 600,
    rollingWindowCount: 6,
    rollingWindowCreditCap: 1800
});

function weightedPick(entries, rng = Math.random) {
    const totalWeight = entries.reduce((sum, entry) => sum + (entry.weight || 0), 0);
    if (totalWeight <= 0) return null;
    let roll = rng() * totalWeight;
    for (const entry of entries) {
        roll -= entry.weight || 0;
        if (roll <= 0) return entry;
    }
    return entries[entries.length - 1] || null;
}

function ensureRewardState(metaState) {
    const defaults = {
        settlementByKey: {},
        pityCounter: 0,
        nonJackpotStreak: 0,
        cooldownRemaining: 0,
        rewardHistory: [],
        totalCreditEquivalent: 0,
        averageCreditEquivalent: 0,
        sampleCount: 0
    };
    const source = metaState && typeof metaState === 'object' ? metaState : {};
    return {
        ...defaults,
        ...source,
        settlementByKey: source.settlementByKey && typeof source.settlementByKey === 'object' ? source.settlementByKey : {},
        rewardHistory: Array.isArray(source.rewardHistory) ? source.rewardHistory.slice(-20) : []
    };
}

function getCreditEquivalent(payload) {
    if (!payload) return 0;
    if (payload.type === 'meta_credits') return payload.value || 0;
    if (payload.type === 'score_bonus') return Math.round((payload.value || 0) / 10);
    if (payload.type === 'smart_bombs') return 80 * (payload.value || 0);
    if (payload.type === 'pilot_weapon_tier') return 240 * (payload.value || 1);
    return 0;
}

function clampPayloadValue(payload, scale = 1) {
    const out = { ...payload };
    if (!Number.isFinite(scale) || scale >= 1) return out;
    out.value = Math.max(1, Math.round((payload.value || 0) * scale));
    return out;
}

function buildRewardPayload(reward, context = {}, rewardState = {}) {
    const districtName = context?.districtName || context?.districtId || 'Unknown District';
    const source = context?.baseVariant || 'assault_base';
    const payload = { ...reward.payload };

    const recent = Array.isArray(rewardState.rewardHistory) ? rewardState.rewardHistory.slice(-ASSAULT_REWARD_CONSTRAINTS.rollingWindowCount) : [];
    const recentCredits = recent.reduce((sum, entry) => sum + (entry.creditEquivalent || 0), 0);
    const baseCredits = getCreditEquivalent(payload);
    const overCap = Math.max(0, (recentCredits + baseCredits) - ASSAULT_REWARD_CONSTRAINTS.rollingWindowCreditCap);
    const scale = overCap > 0 && baseCredits > 0 ? Math.max(0.35, (baseCredits - overCap) / baseCredits) : 1;
    const boundedPayload = clampPayloadValue(payload, scale);
    const creditEquivalent = Math.min(getCreditEquivalent(boundedPayload), ASSAULT_REWARD_CONSTRAINTS.maxCreditEquivalentPerRun);

    return {
        schemaVersion: 1,
        rewardId: reward.id,
        rewardType: reward.bucket,
        rarity: reward.rarity,
        payload: boundedPayload,
        creditEquivalent,
        isJackpot: reward.bucket === 'jackpot',
        tags: [reward.rarity, reward.bucket, `source:${source}`, `district:${districtName}`],
        summary: `${boundedPayload.label} (${reward.bucket.toUpperCase()})`
    };
}

function rollAssaultReward(context = {}, rewardState = {}, rng = Math.random) {
    const state = ensureRewardState(rewardState);
    const eligible = ASSAULT_REWARD_TABLE.filter((entry) => {
        if (entry.bucket !== 'jackpot') return true;
        if ((state.cooldownRemaining || 0) > 0) return false;
        return true;
    });

    let selected;
    if ((state.nonJackpotStreak || 0) >= ASSAULT_REWARD_CONSTRAINTS.pityThreshold && (state.cooldownRemaining || 0) <= 0) {
        const jackpotOnly = eligible.filter((entry) => entry.bucket === 'jackpot');
        selected = weightedPick(jackpotOnly, rng) || weightedPick(eligible, rng);
    } else {
        selected = weightedPick(eligible, rng);
    }
    if (!selected) selected = ASSAULT_REWARD_TABLE[0];

    const payload = buildRewardPayload(selected, context, state);
    return payload;
}

function applyAssaultRewardEffects(result, runtime = {}) {
    const payload = result?.payload;
    if (!payload) return;
    if (payload.type === 'meta_credits' && runtime.metaProgression?.addCredits) {
        runtime.metaProgression.addCredits(payload.value);
    } else if (payload.type === 'score_bonus' && runtime.gameState) {
        runtime.gameState.score += payload.value;
    } else if (payload.type === 'smart_bombs' && runtime.gameState) {
        runtime.gameState.smartBombs = Math.min(9, (runtime.gameState.smartBombs || 0) + (payload.value || 0));
    } else if (payload.type === 'pilot_weapon_tier' && runtime.metaProgression?.upgradePilotWeaponTier) {
        const priorities = ['stingerDrone', 'lightningGun', 'plasmaLauncher', 'scattergun'];
        const profile = runtime.metaProgression.getPilotWeaponProfile?.();
        const target = priorities.find((weapon) => profile?.unlocked?.[weapon]) || 'combatRifle';
        runtime.metaProgression.upgradePilotWeaponTier(target);
        result.payload.weaponId = target;
    }
}

function settleAssaultReward({
    settlementKey,
    success,
    context = {},
    metaState,
    rng = Math.random,
    runtime = {}
} = {}) {
    const state = ensureRewardState(metaState);
    if (!success || !settlementKey) {
        return { settled: false, reason: 'not_eligible', rewardState: state };
    }
    if (state.settlementByKey[settlementKey]) {
        return {
            settled: false,
            duplicate: true,
            reason: 'duplicate_settlement',
            reward: state.settlementByKey[settlementKey],
            rewardState: state
        };
    }

    const reward = rollAssaultReward(context, state, rng);
    applyAssaultRewardEffects(reward, runtime);

    if (reward.isJackpot) {
        state.nonJackpotStreak = 0;
        state.cooldownRemaining = ASSAULT_REWARD_CONSTRAINTS.jackpotCooldownSuccesses;
    } else {
        state.nonJackpotStreak = (state.nonJackpotStreak || 0) + 1;
        if (state.cooldownRemaining > 0) state.cooldownRemaining -= 1;
    }

    const entry = {
        ...reward,
        settlementKey,
        settledAt: Date.now(),
        context: {
            districtId: context?.districtId || null,
            districtName: context?.districtName || null,
            mode: context?.mode || 'assault'
        }
    };

    state.settlementByKey[settlementKey] = entry;
    state.rewardHistory = [...(state.rewardHistory || []), entry].slice(-20);
    state.sampleCount = (state.sampleCount || 0) + 1;
    state.totalCreditEquivalent = (state.totalCreditEquivalent || 0) + (entry.creditEquivalent || 0);
    state.averageCreditEquivalent = Math.round((state.totalCreditEquivalent / state.sampleCount) * 100) / 100;

    return { settled: true, reward: entry, rewardState: state };
}

const assaultJackpotRewardsExport = {
    ASSAULT_REWARD_TABLE,
    ASSAULT_REWARD_CONSTRAINTS,
    ensureRewardState,
    rollAssaultReward,
    settleAssaultReward,
    getCreditEquivalent
};

if (typeof module !== 'undefined') {
    module.exports = assaultJackpotRewardsExport;
}

if (typeof window !== 'undefined') {
    window.assaultJackpotRewards = assaultJackpotRewardsExport;
}
