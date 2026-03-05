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
    { id: 'switchPrimary', label: 'Switch Primary' },
    { id: 'restart', label: 'Restart Run' }
];

/**
 * Handles the formatKeyLabel routine and encapsulates its core gameplay logic.
 * Parameters: keyName.
 * Returns: value defined by the surrounding game flow.
 */
function formatKeyLabel(keyName) {
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

/**
 * Handles the normalizeKeyName routine and encapsulates its core gameplay logic.
 * Parameters: event.
 * Returns: value defined by the surrounding game flow.
 */
function normalizeKeyName(event) {
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

/**
 * Handles the formatMetaTimer routine and encapsulates its core gameplay logic.
 * Parameters: seconds.
 * Returns: value defined by the surrounding game flow.
 */
function formatMetaTimer(seconds) {
    const clamped = Math.max(0, Math.floor(seconds));
    const mins = String(Math.floor(clamped / 60)).padStart(2, '0');
    const secs = String(clamped % 60).padStart(2, '0');
    return `${mins}:${secs}`;
}


function getBoundKeyLabel(actionId) {
    const fallback = DEFAULT_KEY_BINDINGS?.[actionId];
    const keyName = userSettings?.keyBindings?.[actionId] || fallback;
    return formatKeyLabel(keyName);
}

function refreshGameplayKeybindingText() {
    const controlsEl = document.getElementById('controls-text');
    if (controlsEl) {
        const left = getBoundKeyLabel('moveLeft');
        const right = getBoundKeyLabel('moveRight');
        const up = getBoundKeyLabel('moveUp');
        const down = getBoundKeyLabel('moveDown');
        const fire = getBoundKeyLabel('fire');
        const transform = getBoundKeyLabel('transform');
        const jump = getBoundKeyLabel('jump');
        const bomb = getBoundKeyLabel('bomb');
        const eject = getBoundKeyLabel('eject');
        const enter = getBoundKeyLabel('enter');
        const hyperspace = getBoundKeyLabel('hyperspace');
        const switchPrimary = getBoundKeyLabel('switchPrimary');
        const pause = getBoundKeyLabel('pause');
        controlsEl.innerHTML = `Desktop Controls: <span class="text-cyan-300">${left}/${right}/${up}/${down}</span> = Move/Aim (Bulwark; diagonals supported), <span class="text-cyan-300">${jump}</span> = Jump/Aim Up, <span class="text-cyan-300">${down}</span> = Aim Down (airborne), <span class="text-cyan-300">${fire}</span> = Fire (move + shoot), <span class="text-cyan-300">${transform}</span> = Transform, <span class="text-cyan-300">${bomb}</span> = Bomb, <span class="text-cyan-300">${eject}</span> = Eject, <span class="text-cyan-300">${enter}</span> = Enter Mech, <span class="text-cyan-300">${hyperspace}</span> = Hyperspace, <span class="text-cyan-300">${switchPrimary}</span> = Switch Primary, <span class="text-cyan-300">${pause}</span> = Pause.`;
    }

    const restartHintKeyEl = document.getElementById('restart-hint-key');
    if (restartHintKeyEl) {
        restartHintKeyEl.textContent = getBoundKeyLabel('restart').toUpperCase();
    }
}

refreshGameplayKeybindingText();
