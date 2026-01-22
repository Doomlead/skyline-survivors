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
    lootHistory: [] // Last 5 drops for "history" display
};

let metaState = null;

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
                lootHistory: Array.isArray(stored.lootHistory) ? stored.lootHistory.slice(-5) : []
            };
        }
    } catch (err) {
        metaState = { ...DEFAULT_META_STATE };
    }
    return metaState;
}

function persistMetaProgression() {
    if (typeof localStorage === 'undefined' || !metaState) return;
    try {
        localStorage.setItem(META_STORAGE_KEY, JSON.stringify(metaState));
    } catch (err) {
        // Ignore storage failures
    }
}

function getMetaState() {
    const state = loadMetaProgression();
    return {
        ...state,
        pendingDrop: state.pendingDrop ? { ...state.pendingDrop } : null,
        runHistory: [...state.runHistory],
        lootHistory: [...state.lootHistory]
    };
}

function addCredits(amount) {
    const state = loadMetaProgression();
    const delta = Number.isFinite(amount) ? amount : 0;
    state.credits = Math.max(0, Math.round((state.credits || 0) + delta));
    persistMetaProgression();
    return state.credits;
}

function spendCredits(cost) {
    const state = loadMetaProgression();
    const amount = Number.isFinite(cost) ? cost : 0;
    if (amount <= 0) return true;
    if ((state.credits || 0) < amount) return false;
    state.credits = Math.max(0, Math.round(state.credits - amount));
    persistMetaProgression();
    return true;
}

function calculateRunCredits(outcome) {
    const baseScore = Math.max(50, Math.round((outcome.score || 0) / 750));
    const rescueBonus = Math.round((outcome.humansRescued || 0) * 6);
    const urgencyBonus = outcome.directives?.urgency === 'critical'
        ? 30
        : outcome.directives?.urgency === 'collapse'
            ? 45
            : 15;
    const successBonus = outcome.success ? 80 : 35;
    const rewardScale = outcome.directives?.rewardMultiplier || 1;
    return Math.max(25, Math.round((baseScore + rescueBonus + successBonus + urgencyBonus) * rewardScale));
}

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
function selectRandomItem(tier) {
    const items = POWERUP_TIERS[tier];
    if (!items || items.length === 0) return null;
    return items[Math.floor(Math.random() * items.length)];
}

// Roll loot from a supply drop
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

function getPendingDrop() {
    const state = loadMetaProgression();
    return state.pendingDrop;
}

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

function clearPendingDrop() {
    const state = loadMetaProgression();
    state.pendingDrop = null;
    persistMetaProgression();
}

function getLastRunSummary() {
    const state = loadMetaProgression();
    return state.lastRun;
}

function getLootHistory() {
    const state = loadMetaProgression();
    return state.lootHistory || [];
}

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
    LOOT_TABLES,
    POWERUP_TIERS
};