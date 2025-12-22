// ------------------------
// Meta progression and between-mission loadouts
// ------------------------

const META_STORAGE_KEY = 'skyline_meta_progression_v1';

const SHOP_ITEMS = [
    {
        id: 'drone_contract',
        name: 'Escort Drone Contracts',
        cost: 140,
        description: 'Unlocks an offensive loadout that deploys a drone escort and side-shot casings at mission start.',
        grantsLoadout: 'drone-contract'
    },
    {
        id: 'overdrive_cache',
        name: 'Overdrive Cache',
        cost: 150,
        description: 'Unlocks an offensive loadout that begins with stored overdrive charge and magnetized pickups.',
        grantsLoadout: 'overdrive-cache'
    },
    {
        id: 'bomb_bay',
        name: 'Bomb Bay Expansion',
        cost: 120,
        description: 'Unlocks a defensive loadout that adds an extra smart bomb for each deployment.',
        grantsLoadout: 'bomb-bay'
    },
    {
        id: 'shield_cache',
        name: 'Shield Cache',
        cost: 150,
        description: 'Unlocks a defensive loadout that boots up with ablative shields online.',
        grantsLoadout: 'shield-cache'
    },
    {
        id: 'hardened_hull',
        name: 'Hardened Hull Plating',
        cost: 180,
        description: 'Unlocks a defensive loadout that grants an extra life and earlier extra-life thresholds.',
        grantsLoadout: 'hardened-hull'
    }
];

const LOADOUT_LIBRARY = {
    offense: [
        {
            id: 'standard-offense',
            name: 'Standard Arsenal',
            description: 'Vanilla deployment. No meta modifiers applied.',
            apply: () => ['Standard kit']
        },
        {
            id: 'drone-contract',
            name: 'Escort Fabricators',
            unlockKey: 'drone_contract',
            description: 'Start with a combat drone escort and lateral fire support.',
            apply: (gameState, playerState) => {
                playerState.powerUps.drone = Math.max(playerState.powerUps.drone, 1);
                playerState.powerUps.sideShot = Math.max(playerState.powerUps.sideShot, 1);
                return ['Drone escort online', 'Side-shot casings loaded'];
            }
        },
        {
            id: 'overdrive-cache',
            name: 'Overdrive Cache',
            unlockKey: 'overdrive_cache',
            description: 'Begin with charged overdrive and magnetized pickups.',
            apply: (gameState, playerState) => {
                playerState.powerUps.overdrive = Math.max(playerState.powerUps.overdrive, 4000);
                playerState.powerUps.magnet = Math.max(playerState.powerUps.magnet, 8000);
                return ['Overdrive buffer primed', 'Magnetic pickup field active'];
            }
        }
    ],
    defense: [
        {
            id: 'standard-defense',
            name: 'Standard Shielding',
            description: 'Baseline lives and bomb stock.',
            apply: () => ['Standard durability']
        },
        {
            id: 'bomb-bay',
            name: 'Bombardier Bay',
            unlockKey: 'bomb_bay',
            description: 'Launch with an extra smart bomb and a slight reward bump.',
            apply: (gameState) => {
                gameState.smartBombs += 1;
                gameState.rewardMultiplier = (gameState.rewardMultiplier || 1) + 0.05;
                return ['+1 smart bomb', 'Reward uplink boost'];
            }
        },
        {
            id: 'shield-cache',
            name: 'Ablative Cache',
            unlockKey: 'shield_cache',
            description: 'Start with ablative shields active.',
            apply: (gameState, playerState) => {
                playerState.powerUps.shield = Math.max(playerState.powerUps.shield, 1);
                return ['Ablative shields armed'];
            }
        },
        {
            id: 'hardened-hull',
            name: 'Hardened Hull',
            unlockKey: 'hardened_hull',
            description: 'Gain an extra life and earlier extra-life thresholds.',
            apply: (gameState) => {
                gameState.lives += 1;
                gameState.nextExtraLife = Math.max(5000, Math.floor(gameState.nextExtraLife * 0.9));
                return ['+1 life', 'Extra-life threshold reduced'];
            }
        }
    ]
};

const DEFAULT_META_STATE = {
    credits: 250,
    unlocks: {},
    equippedLoadout: {
        offense: 'standard-offense',
        defense: 'standard-defense'
    },
    runHistory: [],
    lastRun: null
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
                unlocks: stored.unlocks || {},
                equippedLoadout: stored.equippedLoadout || DEFAULT_META_STATE.equippedLoadout,
                runHistory: Array.isArray(stored.runHistory) ? stored.runHistory.slice(-8) : []
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
        unlocks: { ...state.unlocks },
        equippedLoadout: { ...state.equippedLoadout },
        runHistory: [...state.runHistory]
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
    persistMetaProgression();
    return runEntry;
}

function getShopInventory() {
    const state = loadMetaProgression();
    return SHOP_ITEMS.map(item => ({
        ...item,
        owned: !!state.unlocks[item.id],
        affordable: (state.credits || 0) >= item.cost
    }));
}

function purchaseShopItem(itemId) {
    const state = loadMetaProgression();
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return { success: false, reason: 'missing_item' };
    if (state.unlocks[item.id]) return { success: false, reason: 'already_owned' };
    if (!spendCredits(item.cost)) return { success: false, reason: 'insufficient_funds' };

    state.unlocks[item.id] = true;
    persistMetaProgression();
    return { success: true, item };
}

function getLoadoutOptions() {
    const state = loadMetaProgression();
    const withMeta = (slot) => LOADOUT_LIBRARY[slot].map(option => ({
        ...option,
        unlocked: !option.unlockKey || !!state.unlocks[option.unlockKey],
        equipped: state.equippedLoadout?.[slot] === option.id
    }));

    return {
        offense: withMeta('offense'),
        defense: withMeta('defense')
    };
}

function setEquippedLoadout(slot, optionId) {
    const state = loadMetaProgression();
    const options = LOADOUT_LIBRARY[slot];
    if (!options) return false;
    const chosen = options.find(opt => opt.id === optionId);
    if (!chosen) return false;
    if (chosen.unlockKey && !state.unlocks[chosen.unlockKey]) return false;
    state.equippedLoadout = {
        ...(state.equippedLoadout || DEFAULT_META_STATE.equippedLoadout),
        [slot]: optionId
    };
    persistMetaProgression();
    return true;
}

function applyLoadoutEffects(gameState, playerState) {
    const state = loadMetaProgression();
    const summary = { offense: null, defense: null, bonuses: [] };
    const applyForSlot = (slot) => {
        const options = LOADOUT_LIBRARY[slot];
        const equippedId = state.equippedLoadout?.[slot] || options[0].id;
        let option = options.find(opt => opt.id === equippedId);
        if (option?.unlockKey && !state.unlocks[option.unlockKey]) {
            option = options.find(opt => !opt.unlockKey) || options[0];
        }
        if (!option) return;
        const result = option.apply?.(gameState, playerState) || [];
        summary[slot] = option.name;
        summary.bonuses.push(...result);
    };

    applyForSlot('offense');
    applyForSlot('defense');
    persistMetaProgression();
    return summary;
}

function getLastRunSummary() {
    const state = loadMetaProgression();
    return state.lastRun;
}

window.metaProgression = {
    getMetaState,
    addCredits,
    purchaseShopItem,
    getShopInventory,
    getLoadoutOptions,
    setEquippedLoadout,
    applyLoadoutEffects,
    recordRunOutcome,
    getLastRunSummary
};
