// --------------------------------
// js/config/userSettingsConfig.js
// --------------------------------

const DEFAULT_KEY_BINDINGS = {
    moveLeft: 'LEFT',
    moveRight: 'RIGHT',
    moveUp: 'UP',
    moveDown: 'DOWN',
    fire: 'SPACE',
    transform: 'SHIFT',
    jump: 'CTRL',
    bomb: 'B',
    eject: 'E',
    enter: 'R',
    hyperspace: 'Q',
    pause: 'P',
    switchPrimary: 'TAB',
    restart: 'R'
};

const SETTINGS_STORAGE_KEY = 'last_bastion_user_settings_v1';
const userSettings = {
    musicVolume: 0.6,
    sfxVolume: 0.7,
    reduceFlashes: false,
    muted: false,
    keyBindings: { ...DEFAULT_KEY_BINDINGS }
};

function sanitizeKeyBindings(bindings) {
    const sanitized = { ...DEFAULT_KEY_BINDINGS };
    if (!bindings || typeof bindings !== 'object') return sanitized;
    Object.keys(DEFAULT_KEY_BINDINGS).forEach((action) => {
        const value = bindings[action];
        if (typeof value === 'string') {
            const keyName = value.toUpperCase();
            if (Phaser?.Input?.Keyboard?.KeyCodes?.[keyName]) {
                sanitized[action] = keyName;
            }
        }
    });
    return sanitized;
}

function loadUserSettings() {
    if (typeof localStorage === 'undefined') return;
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) return;

    try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
            if (typeof parsed.musicVolume === 'number') userSettings.musicVolume = Phaser.Math.Clamp(parsed.musicVolume, 0, 1);
            if (typeof parsed.sfxVolume === 'number') userSettings.sfxVolume = Phaser.Math.Clamp(parsed.sfxVolume, 0, 1);
            if (typeof parsed.reduceFlashes === 'boolean') userSettings.reduceFlashes = parsed.reduceFlashes;
            if (typeof parsed.muted === 'boolean') userSettings.muted = parsed.muted;
            if (parsed.keyBindings) userSettings.keyBindings = sanitizeKeyBindings(parsed.keyBindings);
        }
    } catch (err) {
        // Ignore malformed storage
    }
}

function persistUserSettings() {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(userSettings));
}

function isFlashReductionEnabled() {
    return !!userSettings.reduceFlashes;
}

loadUserSettings();
