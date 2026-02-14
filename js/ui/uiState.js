// ------------------------
// file js/ui/uiState.js UI shared state and helpers
// ------------------------

let scoreEl, waveEl, timerEl, bombsEl, livesEl, powerupsEl, cargoEl, operativesEl;
let districtEl, threatEl, rewardEl;
let comboEl, comboFillEl, comboFlowEl;
let assaultHudEl, assaultCoreFillEl, assaultCoreLabelEl, assaultShieldLabelEl;
let mothershipHudEl, mothershipCoreFillEl, mothershipCoreLabelEl, mothershipPhaseLabelEl;
let radarCanvas, radarCtx;
let decayHudEl, decayPrimaryFillEl, decayPrimaryLabelEl, decayPrimaryTierEl;
let decayCoverageFillEl, decayCoverageLabelEl;
let decayMissileFillEl, decayMissileLabelEl;
let decayOverdriveFillEl, decayOverdriveLabelEl;
let decayStatusStripEl;

const KEY_BINDING_ACTIONS = [
    { id: 'moveLeft', label: 'Move Left' },
    { id: 'moveRight', label: 'Move Right' },
    { id: 'moveUp', label: 'Move Up' },
    { id: 'moveDown', label: 'Move Down' },
    { id: 'fire', label: 'Fire' },
    { id: 'transform', label: 'Transform' },
    { id: 'jump', label: 'Jump' },
    { id: 'bomb', label: 'Bomb' },
    { id: 'eject', label: 'Eject' },
    { id: 'enter', label: 'Enter Mech' },
    { id: 'hyperspace', label: 'Hyperspace' },
    { id: 'pause', label: 'Pause' },
    { id: 'switchPrimary', label: 'Switch Primary' }
];

function formatKeyLabel(keyName) { // Format key label.
    if (!keyName) return 'Unassigned';
    switch (keyName) {
        case 'LEFT': return 'Left Arrow';
        case 'RIGHT': return 'Right Arrow';
        case 'UP': return 'Up Arrow';
        case 'DOWN': return 'Down Arrow';
        case 'SPACE': return 'Space';
        case 'SHIFT': return 'Shift';
        case 'CTRL': return 'Ctrl';
        case 'ESC': return 'Esc';
        default: return keyName;
    }
}

function normalizeKeyName(event) { // Normalize key name.
    if (!event || !event.key) return null;
    switch (event.key) {
        case ' ': return 'SPACE';
        case 'ArrowLeft': return 'LEFT';
        case 'ArrowRight': return 'RIGHT';
        case 'ArrowUp': return 'UP';
        case 'ArrowDown': return 'DOWN';
        case 'Shift': return 'SHIFT';
        case 'Control': return 'CTRL';
        case 'Escape': return 'ESC';
        case 'Enter': return 'ENTER';
        case 'Tab': return 'TAB';
        default: break;
    }
    if (event.key.length === 1) {
        return event.key.toUpperCase();
    }
    return event.key.toUpperCase();
}

function formatMetaTimer(seconds) { // Format meta timer.
    const clamped = Math.max(0, Math.floor(seconds));
    const mins = String(Math.floor(clamped / 60)).padStart(2, '0');
    const secs = String(clamped % 60).padStart(2, '0');
    return `${mins}:${secs}`;
}
