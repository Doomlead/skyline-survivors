// ------------------------
// Meta progression - Supply Drop Gacha System
// ------------------------

const META_STORAGE_KEY = 'skyline_meta_progression_v2';

// Loot tables for Supply Drops
const LOOT_TABLES = {
    standard: {
        cost: 80,
        name: 'Standard Drop',
        description: 'Basic orbital supply drop. High chance of utility items.',
        guaranteedItems: 1,
        bonusChance: 0.3, // 30% chance for extra item
        maxItems: 2,
        weights: {
            tier1: 60,  // Utility items
            tier2: 35,  // Medium powerups
            tier3: 5    // Rare powerups
        }
    },
    elite: {
        cost: 180,
        name: 'Elite Drop',
        description: 'Premium orbital supply drop. Guarantees powerful items.',
        guaranteedItems: 2,
        bonusChance: 0.5, // 50% chance for third item
        maxItems: 3,
        weights: {
            tier1: 20,  // Utility items
            tier2: 50,  // Medium powerups
            tier3: 30   // Rare powerups
        }
    }
};

// Powerup tiers for loot drops
const POWERUP_TIERS = {
    tier1: [ // Utility / Common
        { id: 'magnet', name: 'Power Magnet', duration: 10000 },
        { id: 'speed', name: 'Speed Boost', duration: 25000 },
        { id: 'bomb', name: 'Smart Bomb', quantity: 1 }
    ],
    tier2: [ // Medium / Combat
        { id: 'rapid', name: 'Rapid Fire', duration: 10000 },
        { id: 'drone', name: 'Force Drone', tier: 1 },
        { id: 'coverage', name: 'Side Shot', tier: 2 },
        { id: 'shield', name: 'Ablative Shield', quantity: 1 },
        { id: 'missile', name: 'Missile System', tier: 1 }
    ],
    tier3: [ // Rare / Powerful
        { id: 'overdrive', name: 'Overdrive Cache', duration: 7000 },
        { id: 'laser', name: 'Laser Upgrade', tier: 2 },
        { id: 'multiShot', name: 'Multi-Shot', tier: 3 },
        { id: 'double', name: 'Double Damage', duration: 8000 },
        { id: 'invincibility', name: 'Invincibility', duration: 5000 },
        { id: 'timeSlow', name: 'Time Slow', duration: 5000 }
    ]
};

const DEFAULT_META_STATE = {
    credits: 250,
    pendingDrop: null, // Items to apply on next mission start
    runHistory: [],
    lastRun: null,
    totalDropsPurchased: 0,
    lootHistory: [], // Last 5 drops for "history" display
    pilotWeapons: {
        unlocked: {
            combatRifle: true,
            scattergun: false,
            plasmaLauncher: false,
            lightningGun: false,
            stingerDrone: false
        },
        tiers: {
            combatRifle: 1,
            scattergun: 0,
            plasmaLauncher: 0,
            lightningGun: 0,
            stingerDrone: 0
        },
        startAmmo: {
            scattergun: 200,
            plasmaLauncher: 150,
            lightningGun: 25000
        }
    }
};

const PILOT_WEAPON_IDS = ['combatRifle', 'scattergun', 'plasmaLauncher', 'lightningGun', 'stingerDrone'];
const PILOT_WEAPON_AMMO_IDS = ['scattergun', 'plasmaLauncher', 'lightningGun'];
const PILOT_WEAPON_CRATE_IDS = ['scattergun', 'plasmaLauncher', 'lightningGun', 'stingerDrone'];
const PILOT_WEAPON_MAX_TIER = 3;
const PILOT_WEAPON_TEMP_AMMO_REFILL_RATIO = 0.5;
const PILOT_WEAPON_RESCUE_REFILL_RATIO = 0.12;

function getPilotWeaponProgressionApi() {
    return typeof window !== 'undefined' ? window.pilotWeaponProgression : null;
}

function createDefaultPilotWeaponProfile() {
    return {
        unlocked: { ...DEFAULT_META_STATE.pilotWeapons.unlocked },
        tiers: { ...DEFAULT_META_STATE.pilotWeapons.tiers },
        startAmmo: { ...DEFAULT_META_STATE.pilotWeapons.startAmmo }
    };
}

function normalizePilotWeaponProfile(profile) {
    const normalized = createDefaultPilotWeaponProfile();
    if (!profile || typeof profile !== 'object') return normalized;

    PILOT_WEAPON_IDS.forEach((weaponId) => {
        if (weaponId === 'combatRifle') {
            normalized.unlocked.combatRifle = true;
            normalized.tiers.combatRifle = Math.max(1, Math.round(profile?.tiers?.combatRifle || 1));
            return;
        }

        normalized.unlocked[weaponId] = Boolean(profile?.unlocked?.[weaponId]);
        const rawTier = Number.isFinite(profile?.tiers?.[weaponId]) ? Math.round(profile.tiers[weaponId]) : 0;
        normalized.tiers[weaponId] = Math.max(0, rawTier);
    });

    PILOT_WEAPON_AMMO_IDS.forEach((weaponId) => {
        const rawAmmo = Number.isFinite(profile?.startAmmo?.[weaponId])
            ? Math.round(profile.startAmmo[weaponId])
            : normalized.startAmmo[weaponId];
        normalized.startAmmo[weaponId] = Math.max(0, rawAmmo);
    });

    return normalized;
}

let metaState = null;

// Loads and initializes persistent meta-progression state from local storage.
function loadMetaProgression() {
    if (metaState) return metaState;

    metaState = { ...DEFAULT_META_STATE };
    if (typeof localStorage === 'undefined') return metaState;

    try {
        const stored = JSON.parse(localStorage.getItem(META_STORAGE_KEY));
        if (stored && typeof stored === 'object') {
            metaState = {
                ...metaState,
                ...stored,
                pendingDrop: stored.pendingDrop || null,
                runHistory: Array.isArray(stored.runHistory) ? stored.runHistory.slice(-8) : [],
                lootHistory: Array.isArray(stored.lootHistory) ? stored.lootHistory.slice(-5) : [],
                pilotWeapons: normalizePilotWeaponProfile(stored.pilotWeapons)
            };
        }
    } catch (err) {
        metaState = { ...DEFAULT_META_STATE };
    }
    return metaState;
}

// Saves the current meta-progression state to local storage when available.
function persistMetaProgression() {
    if (typeof localStorage === 'undefined' || !metaState) return;
    try {
        localStorage.setItem(META_STORAGE_KEY, JSON.stringify(metaState));
    } catch (err) {
        // Ignore storage failures
    }
}

// Returns a defensive copy of meta-progression state for external consumers.
function getMetaState() {
    const state = loadMetaProgression();
    const pilotWeapons = normalizePilotWeaponProfile(state.pilotWeapons);
    return {
        ...state,
        pendingDrop: state.pendingDrop ? { ...state.pendingDrop } : null,
        runHistory: [...state.runHistory],
        lootHistory: [...state.lootHistory],
        pilotWeapons
    };
}

// Returns a defensive copy of persistent pilot weapon unlock/tier/ammo progression.
function getPilotWeaponProfile() {
    const state = loadMetaProgression();
    state.pilotWeapons = normalizePilotWeaponProfile(state.pilotWeapons);
    return normalizePilotWeaponProfile(state.pilotWeapons);
}

// Permanently unlocks a pilot weapon in meta progression.
function purchasePilotWeapon(weaponId) {
    if (!PILOT_WEAPON_IDS.includes(weaponId) || weaponId === 'combatRifle') {
        return { success: false, reason: 'invalid_weapon' };
    }

    const state = loadMetaProgression();
    const profile = normalizePilotWeaponProfile(state.pilotWeapons);
    if (profile.unlocked[weaponId]) {
        state.pilotWeapons = profile;
        persistMetaProgression();
        return { success: true, alreadyOwned: true, profile: normalizePilotWeaponProfile(profile) };
    }

    const progression = getPilotWeaponProgressionApi();
    if (progression?.unlockWeapon) {
        progression.unlockWeapon(profile, weaponId);
    } else {
        profile.unlocked[weaponId] = true;
        profile.tiers[weaponId] = Math.max(1, profile.tiers[weaponId] || 0);
    }
    state.pilotWeapons = profile;
    persistMetaProgression();
    return { success: true, profile: normalizePilotWeaponProfile(profile) };
}

// Permanently upgrades a pilot weapon tier in meta progression.
function upgradePilotWeaponTier(weaponId) {
    if (!PILOT_WEAPON_IDS.includes(weaponId)) {
        return { success: false, reason: 'invalid_weapon' };
    }

    const state = loadMetaProgression();
    const profile = normalizePilotWeaponProfile(state.pilotWeapons);
    if (weaponId !== 'combatRifle' && !profile.unlocked[weaponId]) {
        return { success: false, reason: 'weapon_locked' };
    }

    const progression = getPilotWeaponProgressionApi();
    if (progression?.upgradeTier) {
        progression.upgradeTier(profile, weaponId, PILOT_WEAPON_MAX_TIER);
    } else {
        const currentTier = Math.max(weaponId === 'combatRifle' ? 1 : 0, profile.tiers[weaponId] || 0);
        profile.tiers[weaponId] = Math.min(PILOT_WEAPON_MAX_TIER, currentTier + 1);
        if (weaponId !== 'combatRifle') profile.unlocked[weaponId] = true;
    }
    state.pilotWeapons = profile;
    persistMetaProgression();
    return { success: true, newTier: profile.tiers[weaponId], profile: normalizePilotWeaponProfile(profile) };
}

function getPilotWeaponMaxAmmo(weaponId) {
    const profile = getPilotWeaponProfile();
    const progression = getPilotWeaponProgressionApi();
    return Math.max(0, Math.round(profile.startAmmo?.[weaponId] || 0));
}

// Grants pilot ammo by flat amount or max-ammo percentage for one weapon.
function grantPilotAmmo(weaponState, weaponId, amountOrPct = 0) {
    if (!weaponState || typeof weaponState !== 'object') {
        return { applied: false, reason: 'invalid_weapon_state' };
    }
    if (!PILOT_WEAPON_AMMO_IDS.includes(weaponId)) {
        return { applied: false, reason: 'unsupported_weapon' };
    }

    const maxAmmo = getPilotWeaponMaxAmmo(weaponId);
    const stateAmmo = weaponState.ammo && typeof weaponState.ammo === 'object'
        ? weaponState.ammo
        : (weaponState.ammo = {});
    const currentAmmo = Math.max(0, Math.round(stateAmmo[weaponId] || 0));

    let grantAmount = 0;
    if (typeof amountOrPct === 'number' && amountOrPct > 0 && amountOrPct <= 1) {
        grantAmount = Math.round(maxAmmo * amountOrPct);
    } else if (Number.isFinite(amountOrPct)) {
        grantAmount = Math.round(amountOrPct);
    }

    if (grantAmount <= 0 || maxAmmo <= 0) {
        return { applied: false, reason: 'no_grant', ammo: currentAmmo, maxAmmo };
    }

    const nextAmmo = Math.min(maxAmmo, currentAmmo + grantAmount);
    stateAmmo[weaponId] = nextAmmo;
    return {
        applied: nextAmmo !== currentAmmo,
        weaponId,
        granted: Math.max(0, nextAmmo - currentAmmo),
        ammo: nextAmmo,
        maxAmmo
    };
}

// Refills currently selected pilot weapon ammo using rescue/hangar bonus rules.
function refillCurrentPilotWeaponByRescueBonus(weaponState) {
    if (!weaponState || typeof weaponState !== 'object') {
        return { applied: false, reason: 'invalid_weapon_state' };
    }
    const selected = weaponState.selected || 'combatRifle';
    if (!PILOT_WEAPON_AMMO_IDS.includes(selected)) {
        return { applied: false, reason: 'current_weapon_not_limited', weaponId: selected };
    }
    return grantPilotAmmo(weaponState, selected, PILOT_WEAPON_RESCUE_REFILL_RATIO);
}

// Applies one temporary pilot-weapon crate pickup to mission runtime weapon state.
function applyPilotWeaponCratePickup(weaponState, weaponId) {
    if (!weaponState || typeof weaponState !== 'object') {
        return { applied: false, reason: 'invalid_weapon_state' };
    }
    if (!PILOT_WEAPON_CRATE_IDS.includes(weaponId)) {
        return { applied: false, reason: 'invalid_weapon' };
    }

    const profile = getPilotWeaponProfile();
    const progression = getPilotWeaponProgressionApi();
    const stateUnlocked = weaponState.unlocked && typeof weaponState.unlocked === 'object'
        ? weaponState.unlocked
        : (weaponState.unlocked = {});
    const stateTemporary = weaponState.temporaryUnlocks && typeof weaponState.temporaryUnlocks === 'object'
        ? weaponState.temporaryUnlocks
        : (weaponState.temporaryUnlocks = {});
    const stateTiers = weaponState.tiers && typeof weaponState.tiers === 'object'
        ? weaponState.tiers
        : (weaponState.tiers = {});
    const stateAmmo = weaponState.ammo && typeof weaponState.ammo === 'object'
        ? weaponState.ammo
        : (weaponState.ammo = {});

    const permanentlyOwned = Boolean(profile.unlocked?.[weaponId]);
    const persistedTier = Math.max(0, Math.round(profile.tiers?.[weaponId] || 0));
    const existingTier = Math.max(0, Math.round(stateTiers[weaponId] || 0));

    if (permanentlyOwned) {
        if (progression?.unlockWeapon) {
            progression.unlockWeapon(weaponState, weaponId);
        } else {
            stateUnlocked[weaponId] = true;
            stateTiers[weaponId] = Math.max(1, stateTiers[weaponId] || 0);
        }
        const baseTier = Math.max(1, persistedTier, existingTier, Math.round(stateTiers[weaponId] || 0));
        stateTiers[weaponId] = Math.min(PILOT_WEAPON_MAX_TIER, baseTier + 1);
        if (progression?.setTemporaryUnlock) {
            progression.setTemporaryUnlock(weaponState, weaponId, false);
        } else {
            stateTemporary[weaponId] = false;
        }
    } else {
        if (progression?.setTemporaryUnlock) {
            progression.setTemporaryUnlock(weaponState, weaponId, true);
        } else {
            stateTemporary[weaponId] = true;
        }
        stateTiers[weaponId] = Math.max(1, existingTier);
    }

    if (PILOT_WEAPON_AMMO_IDS.includes(weaponId)) {
        const maxAmmo = getPilotWeaponMaxAmmo(weaponId);
        const refillAmount = permanentlyOwned
            ? maxAmmo
            : Math.max(1, Math.round(maxAmmo * PILOT_WEAPON_TEMP_AMMO_REFILL_RATIO));
        stateAmmo[weaponId] = Math.min(maxAmmo, Math.max(0, Math.round(stateAmmo[weaponId] || 0)) + refillAmount);
    }

    if (!weaponState.selected || weaponState.selected === 'combatRifle') {
        weaponState.selected = weaponId;
    }

    return {
        applied: true,
        weaponId,
        permanentlyOwned,
        tier: stateTiers[weaponId] || 1,
        ammo: PILOT_WEAPON_AMMO_IDS.includes(weaponId) ? (stateAmmo[weaponId] || 0) : null,
        temporaryUnlock: !permanentlyOwned
    };
}

// Clears mission-scoped temporary pilot-weapon effects and restores persistent baseline tiers.
function clearTemporaryPilotWeaponState(weaponState) {
    if (!weaponState || typeof weaponState !== 'object') return weaponState;

    const profile = getPilotWeaponProfile();
    const stateUnlocked = weaponState.unlocked && typeof weaponState.unlocked === 'object'
        ? weaponState.unlocked
        : (weaponState.unlocked = {});
    const stateTemporary = weaponState.temporaryUnlocks && typeof weaponState.temporaryUnlocks === 'object'
        ? weaponState.temporaryUnlocks
        : (weaponState.temporaryUnlocks = {});
    const stateTiers = weaponState.tiers && typeof weaponState.tiers === 'object'
        ? weaponState.tiers
        : (weaponState.tiers = {});
    const progression = getPilotWeaponProgressionApi();

    PILOT_WEAPON_IDS.forEach((weaponId) => {
        if (weaponId === 'combatRifle') {
            stateUnlocked.combatRifle = true;
            stateTiers.combatRifle = Math.max(1, Math.round(profile.tiers?.combatRifle || 1));
            return;
        }
        if (progression?.setTemporaryUnlock) {
            progression.setTemporaryUnlock(weaponState, weaponId, false);
        } else {
            stateTemporary[weaponId] = false;
        }
        stateUnlocked[weaponId] = Boolean(profile.unlocked?.[weaponId]);
        const persistentTier = Math.max(0, Math.round(profile.tiers?.[weaponId] || 0));
        stateTiers[weaponId] = stateUnlocked[weaponId] ? Math.max(1, persistentTier) : persistentTier;
    });

    if (progression?.normalizeSelection) {
        progression.normalizeSelection(weaponState, PILOT_WEAPON_IDS);
    } else {
        const selected = weaponState.selected;
        if (!selected || (!stateUnlocked[selected] && selected !== 'combatRifle')) {
            weaponState.selected = 'combatRifle';
        }
    }

    return weaponState;
}


// Merges persistent pilot profile into a runtime pilot weapon-state object for mission start.
function hydratePilotWeaponState(weaponState) {
    if (!weaponState || typeof weaponState !== 'object') return weaponState;

    const profile = getPilotWeaponProfile();
    const stateUnlocked = weaponState.unlocked && typeof weaponState.unlocked === 'object'
        ? weaponState.unlocked
        : (weaponState.unlocked = {});
    const stateTiers = weaponState.tiers && typeof weaponState.tiers === 'object'
        ? weaponState.tiers
        : (weaponState.tiers = {});
    const stateAmmo = weaponState.ammo && typeof weaponState.ammo === 'object'
        ? weaponState.ammo
        : (weaponState.ammo = {});

    PILOT_WEAPON_IDS.forEach((weaponId) => {
        if (weaponId === 'combatRifle') {
            stateUnlocked.combatRifle = true;
            stateTiers.combatRifle = Math.max(1, Math.round(stateTiers.combatRifle || 0), profile.tiers.combatRifle || 1);
            return;
        }

        const ownedPersistently = Boolean(profile.unlocked?.[weaponId]);
        stateUnlocked[weaponId] = Boolean(stateUnlocked[weaponId] || ownedPersistently);
        const persistedTier = Math.max(0, Math.round(profile.tiers?.[weaponId] || 0));
        const existingTier = Math.max(0, Math.round(stateTiers[weaponId] || 0));
        const mergedTier = Math.max(existingTier, persistedTier);
        stateTiers[weaponId] = stateUnlocked[weaponId] ? Math.max(1, mergedTier) : mergedTier;
    });

    PILOT_WEAPON_AMMO_IDS.forEach((weaponId) => {
        const fullAmmo = Math.max(0, Math.round(profile.startAmmo?.[weaponId] || 0));
        stateAmmo[weaponId] = fullAmmo;
    });

    const progression = getPilotWeaponProgressionApi();
    if (progression?.normalizeSelection) {
        progression.normalizeSelection(weaponState, PILOT_WEAPON_IDS);
    } else {
        const selected = weaponState.selected;
        if (!selected || (!stateUnlocked[selected] && selected !== 'combatRifle')) {
            weaponState.selected = 'combatRifle';
        }
    }

    return weaponState;
}

// Adds (or subtracts) credits with clamping and returns the updated credit total.
function addCredits(amount) {
    const state = loadMetaProgression();
    const delta = Number.isFinite(amount) ? amount : 0;
    state.credits = Math.max(0, Math.round((state.credits || 0) + delta));
    persistMetaProgression();
    return state.credits;
}

// Attempts to spend credits and returns whether the transaction succeeded.
function spendCredits(cost) {
    const state = loadMetaProgression();
    const amount = Number.isFinite(cost) ? cost : 0;
    if (amount <= 0) return true;
    if ((state.credits || 0) < amount) return false;
    state.credits = Math.max(0, Math.round(state.credits - amount));
    persistMetaProgression();
    return true;
}

// Computes end-of-run credit rewards from score, rescues, directives, and mission success.
function calculateRunCredits(outcome) {
    const baseScore = Math.max(50, Math.round((outcome.score || 0) / 750));
    const rescueBonus = Math.round((outcome.humansRescued || 0) * 6);
    const urgencyBonus = outcome.directives?.urgency === 'critical'
        ? 30
        : outcome.directives?.urgency === 'collapse'
            ? 45
            : 15;
    const clutchBonus = outcome.directives?.clutchDefenseBonus ? 20 : 0;
    const successBonus = outcome.success ? 80 : 35;
    const rewardScale = outcome.directives?.rewardMultiplier || 1;
    return Math.max(25, Math.round((baseScore + rescueBonus + successBonus + urgencyBonus + clutchBonus) * rewardScale));
}

// Records run results, grants calculated credits, updates history, and clears pending drops.
function recordRunOutcome(outcome) {
    const state = loadMetaProgression();
    const earned = calculateRunCredits(outcome || {});
    addCredits(earned);

    const runEntry = {
        ...outcome,
        earnedCredits: earned,
        timestamp: Date.now()
    };

    state.lastRun = runEntry;
    state.runHistory = [...(state.runHistory || []), runEntry].slice(-8);
    
    // Clear pending drop after mission completion
    state.pendingDrop = null;
    
    persistMetaProgression();
    return runEntry;
}

// Builds supply-drop shop entries and marks which options are currently affordable.
function getShopInventory() {
    const state = loadMetaProgression();
    return Object.keys(LOOT_TABLES).map(key => {
        const drop = LOOT_TABLES[key];
        return {
            id: key,
            ...drop,
            affordable: (state.credits || 0) >= drop.cost
        };
    });
}

// Weighted random selection
// Selects a random item from the requested loot tier pool.
function selectRandomItem(tier) {
    const items = POWERUP_TIERS[tier];
    if (!items || items.length === 0) return null;
    return items[Math.floor(Math.random() * items.length)];
}

// Roll loot from a supply drop
// Rolls one supply drop result using drop configuration, item counts, and tier weights.
function rollSupplyDrop(dropType) {
    const config = LOOT_TABLES[dropType];
    if (!config) return { success: false, reason: 'invalid_drop_type' };

    const items = [];
    let itemCount = config.guaranteedItems;
    
    // Check for bonus items
    for (let i = 0; i < config.maxItems - config.guaranteedItems; i++) {
        if (Math.random() < config.bonusChance) {
            itemCount++;
        }
    }

    // Roll each item based on tier weights
    for (let i = 0; i < itemCount; i++) {
        const roll = Math.random() * 100;
        let tier = 'tier1';
        
        if (roll < config.weights.tier3) {
            tier = 'tier3';
        } else if (roll < config.weights.tier3 + config.weights.tier2) {
            tier = 'tier2';
        }
        
        const item = selectRandomItem(tier);
        if (item) {
            items.push({ ...item, tier });
        }
    }

    return {
        success: true,
        items,
        dropType,
        timestamp: Date.now()
    };
}

// Purchases a supply drop, stores pending rewards, and appends a loot-history entry.
function purchaseSupplyDrop(dropType) {
    const state = loadMetaProgression();
    const dropConfig = LOOT_TABLES[dropType];
    
    if (!dropConfig) return { success: false, reason: 'invalid_drop_type' };
    if (!spendCredits(dropConfig.cost)) return { success: false, reason: 'insufficient_funds' };

    const lootResult = rollSupplyDrop(dropType);
    
    if (lootResult.success) {
        // Store items for next mission
        state.pendingDrop = {
            items: lootResult.items,
            dropType: dropType,
            purchaseTime: Date.now()
        };
        
        // Add to loot history
        state.lootHistory = [
            ...state.lootHistory,
            {
                dropType,
                items: lootResult.items.map(i => i.name),
                timestamp: Date.now()
            }
        ].slice(-5);
        
        state.totalDropsPurchased = (state.totalDropsPurchased || 0) + 1;
        persistMetaProgression();
    }

    return lootResult;
}

// Returns the currently queued supply drop rewards to apply on mission start.
function getPendingDrop() {
    const state = loadMetaProgression();
    return state.pendingDrop;
}

// Applies pending drop rewards to game/player state and returns a summary of applied bonuses.
function applySupplyDropEffects(gameState, playerState) {
    const state = loadMetaProgression();
    const pending = state.pendingDrop;
    
    if (!pending || !pending.items || pending.items.length === 0) {
        return { applied: false, bonuses: [] };
    }

    const bonuses = [];
    
    pending.items.forEach(item => {
        switch (item.id) {
            case 'laser':
                playerState.powerUps.laser = Math.max(playerState.powerUps.laser || 0, item.tier || 1);
                bonuses.push(`Laser Upgrade T${item.tier}`);
                break;
            case 'drone':
                playerState.powerUps.drone = Math.max(playerState.powerUps.drone || 0, item.tier || 1);
                bonuses.push(`Force Drone x${item.tier}`);
                break;
            case 'shield':
                playerState.powerUps.shield = 1;
                bonuses.push('Ablative Shield');
                break;
            case 'missile':
                playerState.powerUps.missile = Math.max(playerState.powerUps.missile || 0, item.tier || 1);
                bonuses.push(`Missile System T${item.tier}`);
                break;
            case 'overdrive':
                playerState.powerUps.overdrive = item.duration || 7000;
                bonuses.push('Overdrive Cache');
                break;
            case 'coverage':
                playerState.powerUps.coverage = Math.max(playerState.powerUps.coverage || 0, item.tier || 1);
                bonuses.push('Side/Rear Shot');
                break;
            case 'rapid':
                playerState.powerUps.rapid = item.duration || 10000;
                bonuses.push('Rapid Fire');
                break;
            case 'multiShot':
                playerState.powerUps.multiShot = Math.max(playerState.powerUps.multiShot || 0, item.tier || 1);
                bonuses.push(`Multi-Shot T${item.tier}`);
                break;
            case 'speed':
                playerState.powerUps.speed = item.duration || 25000;
                bonuses.push('Speed Boost');
                break;
            case 'magnet':
                playerState.powerUps.magnet = item.duration || 10000;
                bonuses.push('Power Magnet');
                break;
            case 'bomb':
                gameState.smartBombs = Math.min(gameState.smartBombs + (item.quantity || 1), 9);
                bonuses.push(`+${item.quantity || 1} Smart Bomb`);
                break;
            case 'double':
                playerState.powerUps.double = item.duration || 8000;
                bonuses.push('Double Damage');
                break;
            case 'invincibility':
                playerState.powerUps.invincibility = item.duration || 5000;
                bonuses.push('Invincibility');
                break;
            case 'timeSlow':
                playerState.powerUps.timeSlow = item.duration || 5000;
                bonuses.push('Time Slow');
                break;
        }
    });

    return {
        applied: true,
        bonuses,
        dropType: pending.dropType
    };
}

// Clears queued supply-drop rewards after they are consumed or dismissed.
function clearPendingDrop() {
    const state = loadMetaProgression();
    state.pendingDrop = null;
    persistMetaProgression();
}

// Returns the most recently recorded run summary from meta progression.
function getLastRunSummary() {
    const state = loadMetaProgression();
    return state.lastRun;
}

// Returns recent loot drop history entries for UI display.
function getLootHistory() {
    const state = loadMetaProgression();
    return state.lootHistory || [];
}

if (typeof window !== 'undefined') {
window.metaProgression = {
    getMetaState,
    addCredits,
    purchaseSupplyDrop,
    getShopInventory,
    applySupplyDropEffects,
    getPendingDrop,
    clearPendingDrop,
    recordRunOutcome,
    getLastRunSummary,
    getLootHistory,
    getPilotWeaponProfile,
    purchasePilotWeapon,
    upgradePilotWeaponTier,
    hydratePilotWeaponState,
    applyPilotWeaponCratePickup,
    clearTemporaryPilotWeaponState,
    grantPilotAmmo,
    refillCurrentPilotWeaponByRescueBonus,
    LOOT_TABLES,
    POWERUP_TIERS
};
}


if (typeof module !== 'undefined') {
    module.exports = {
        getMetaState,
        addCredits,
        purchaseSupplyDrop,
        getShopInventory,
        applySupplyDropEffects,
        getPendingDrop,
        clearPendingDrop,
        recordRunOutcome,
        getLastRunSummary,
        getLootHistory,
        getPilotWeaponProfile,
        purchasePilotWeapon,
        upgradePilotWeaponTier,
        hydratePilotWeaponState,
        applyPilotWeaponCratePickup,
        clearTemporaryPilotWeaponState,
        grantPilotAmmo,
        refillCurrentPilotWeaponByRescueBonus,
        LOOT_TABLES,
        POWERUP_TIERS
    };
}
