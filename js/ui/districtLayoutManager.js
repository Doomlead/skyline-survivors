// ------------------------
// File: js/ui/districtLayoutManager.js
// ------------------------

const DistrictLayoutManager = (function() {
    let selectedMode = 'classic';
    let assaultLocked = false;

    function switchToDistrictLayout() {
        window.GameLayoutManager?.switchToDistrictLayout?.();
    }

    function switchToGameLayout() {
        window.GameLayoutManager?.switchToGameLayout?.();
    }

    function getCurrentLayout() {
        return window.GameLayoutManager?.getCurrentLayout?.() || 'game';
    }

    function init() {
        window.GameLayoutManager?.init?.();
    }

    /**
     * Handles the updateDistrictPanels routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function updateDistrictPanels() {
        updateElement('district-lives', gameState?.lives ?? 3);
        updateElement('district-bombs', gameState?.smartBombs ?? 3);
        updateElement('district-score', gameState?.score ?? 0);

        const meta = window.metaProgression?.getMetaState?.() || { credits: 0 };
        updateElement('district-credits', meta.credits);

        const loadout = window.metaProgression?.getLoadoutOptions?.() || {};
        const offenseEquipped = loadout.offense?.find(o => o.equipped)?.name || 'Standard';
        const defenseEquipped = loadout.defense?.find(o => o.equipped)?.name || 'Standard';
        updateElement('district-offense-slot', offenseEquipped);
        updateElement('district-defense-slot', defenseEquipped);

        if (window.DistrictShop?.refresh) {
            window.DistrictShop.refresh();
        }

        updateModeButtons(selectedMode);
    }

    /**
     * Handles the updateMissionPanel routine and encapsulates its core gameplay logic.
     * Parameters: mission, district.
     * Returns: value defined by the surrounding game flow.
     */
    function updateMissionPanel(mission, district) {
        if (!mission) {
            updateElement('district-mission-city', 'No district selected');
            updateElement('district-mission-details', 'Click a district on the globe to begin');
            updateElement('district-urgency', '--');
            updateElement('district-reward-mult', '1.00x');
            updateElement('district-spawn-rate', '1.00x');
            assaultLocked = false;
            updateModeButtons(selectedMode);

            const launchBtn = document.getElementById('district-launch-btn');
            if (launchBtn) {
                launchBtn.disabled = true;
                launchBtn.textContent = 'Select District to Launch';
            }
            return;
        }

        const { city, directives, latitude, longitude, seed } = mission;

        updateElement('district-mission-city', city || 'Unknown Region');
        updateElement(
            'district-mission-details',
            `Lat ${latitude?.toFixed(1) || '--'} · Lon ${longitude?.toFixed(1) || '--'}\nSeed: ${seed?.slice(0, 8) || '--'}`
        );

        updateElement('district-urgency', directives?.urgency?.toUpperCase() || 'NORMAL');
        updateElement('district-reward-mult', (directives?.rewardMultiplier || 1).toFixed(2) + 'x');
        updateElement('district-spawn-rate', (directives?.spawnMultiplier || 1).toFixed(2) + 'x');

        const isAssault = district?.state?.status === 'occupied';
        assaultLocked = isAssault;
        if (isAssault && selectedMode !== 'assault') {
            selectedMode = 'assault';
            if (typeof missionPlanner !== 'undefined') {
                missionPlanner.setMode('assault');
            }
        } else if (!isAssault && selectedMode === 'assault') {
            selectedMode = 'classic';
            if (typeof missionPlanner !== 'undefined') {
                missionPlanner.setMode('classic');
            }
        }
        updateModeButtons(selectedMode);

        const launchBtn = document.getElementById('district-launch-btn');
        if (launchBtn) {
            launchBtn.disabled = false;
            const modeLabel = getModeLabel(selectedMode);
            launchBtn.textContent = `Launch ${modeLabel} — ${district?.config?.name || city}`;
        }

        if (district) {
            updateDistrictStatus(district);
        }
    }

    /**
     * Handles the updateDistrictStatus routine and encapsulates its core gameplay logic.
     * Parameters: district.
     * Returns: value defined by the surrounding game flow.
     */
    function updateDistrictStatus(district) {
        const container = document.getElementById('district-node-status');
        if (!container) return;

        const intelModule = window.pilotIntelRibbon;
        const meta = window.metaProgression?.getMetaState?.();
        const statusLabel = district.state?.status === 'occupied'
            ? '🔴 OCCUPIED'
            : district.state?.status === 'friendly'
                ? '🟢 FRIENDLY'
                : district.state?.status === 'critical'
                    ? '🟠 CRITICAL'
                    : '🟡 THREATENED';

        const timerText = district.state?.status === 'threatened' && district.state?.timer > 0
            ? `Destabilization in: ${formatSeconds(district.state.timer)}`
            : district.state?.status === 'critical' && district.state?.criticalTimer > 0
                ? `Critical window: ${formatSeconds(district.state.criticalTimer)}`
                : 'No active timer';

        const currentIntel = Math.max(0, Math.round(district.state?.pilotIntel || 0));
        const nextMilestone = intelModule?.getNextRibbonMilestone?.(currentIntel) || null;
        const intelText = nextMilestone ? `${currentIntel} / ${nextMilestone.threshold}` : `${currentIntel} / MAX`;
        const nextReward = nextMilestone?.reward
            ? (intelModule?.describeReward?.(nextMilestone.reward) || nextMilestone.reward.type)
            : 'All ribbon rewards claimed';
        const pilotWeapons = meta?.pilotWeapons || { unlocked: {} };
        const ownership = ['scattergun', 'plasmaLauncher', 'lightningGun', 'stingerDrone']
            .map((weaponId) => `${intelModule?.getWeaponDisplayName?.(weaponId) || weaponId}: ${pilotWeapons.unlocked?.[weaponId] ? 'Owned' : 'Locked'}`)
            .join(' · ');
        const criticalBadge = district.state?.status === 'critical' ? '⚠️ CRITICAL +50% Intel if successful' : 'Intel baseline applies';

        container.innerHTML = `
            <div class="district-stat-row">
                <span class="district-stat-label">Status</span>
                <span class="district-stat-value">${statusLabel}</span>
            </div>
            <div class="district-stat-row">
                <span class="district-stat-label">Timer</span>
                <span class="district-stat-value">${timerText}</span>
            </div>
            <div class="district-stat-row">
                <span class="district-stat-label">Reward Focus</span>
                <span class="district-stat-value">${district.config?.reward || 'Standard'}</span>
            </div>
            <div class="district-stat-row">
                <span class="district-stat-label">Pilot Intel</span>
                <span class="district-stat-value">${intelText}</span>
            </div>
            <div class="district-stat-row">
                <span class="district-stat-label">Next Ribbon</span>
                <span class="district-stat-value">${nextReward}</span>
            </div>
            <div class="district-stat-row">
                <span class="district-stat-label">Weapon Ownership</span>
                <span class="district-stat-value">${ownership}</span>
            </div>
            <div class="district-stat-row">
                <span class="district-stat-label">Intel Bonus</span>
                <span class="district-stat-value">${criticalBadge}</span>
            </div>
        `;
    }

    /**
     * Handles the updateModeButtons routine and encapsulates its core gameplay logic.
     * Parameters: mode.
     * Returns: value defined by the surrounding game flow.
     */
    function updateModeButtons(mode) {
        selectedMode = mode;

        const waveBtn = document.getElementById('district-mode-wave');
        const survivalBtn = document.getElementById('district-mode-survival');
        const isAssault = mode === 'assault';

        if (waveBtn) {
            waveBtn.classList.toggle('active', mode === 'classic');
            waveBtn.disabled = isAssault || assaultLocked;
        }
        if (survivalBtn) {
            survivalBtn.classList.toggle('active', mode === 'survival');
            survivalBtn.disabled = isAssault || assaultLocked;
        }
    }

    /**
     * Handles the selectMode routine and encapsulates its core gameplay logic.
     * Parameters: mode.
     * Returns: value defined by the surrounding game flow.
     */
    function selectMode(mode) {
        if (assaultLocked && mode !== 'assault') {
            return;
        }
        selectedMode = mode;
        updateModeButtons(mode);

        if (typeof missionPlanner !== 'undefined') {
            missionPlanner.setMode(mode);
        }

        const launchBtn = document.getElementById('district-launch-btn');
        if (launchBtn && !launchBtn.disabled) {
            const currentText = launchBtn.textContent;
            const modeLabel = getModeLabel(mode);
            launchBtn.textContent = currentText.replace(/^Launch (Defense|Survival|Assault)/, `Launch ${modeLabel}`);
        }
    }

    /**
     * Handles the getModeLabel routine and encapsulates its core gameplay logic.
     * Parameters: mode.
     * Returns: value defined by the surrounding game flow.
     */
    function getModeLabel(mode) {
        return mode === 'survival' ? 'Survival' : mode === 'assault' ? 'Assault' : 'Defense';
    }

    /**
     * Handles the getSelectedMode routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function getSelectedMode() {
        return selectedMode;
    }

    /**
     * Handles the updateElement routine and encapsulates its core gameplay logic.
     * Parameters: id, value.
     * Returns: value defined by the surrounding game flow.
     */
    function updateElement(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    /**
     * Handles the formatSeconds routine and encapsulates its core gameplay logic.
     * Parameters: seconds.
     * Returns: value defined by the surrounding game flow.
     */
    function formatSeconds(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    return {
        switchToDistrictLayout,
        switchToGameLayout,
        updateDistrictPanels,
        updateMissionPanel,
        updateDistrictStatus,
        selectMode,
        getSelectedMode,
        getCurrentLayout,
        init
    };
})();

// Global functions for HTML onclick handlers
function selectDistrictMode(mode) {
    DistrictLayoutManager.selectMode(mode);

    if (window.game?.scene?.isActive?.(SCENE_KEYS.build)) {
        const buildScene = game.scene.getScene(SCENE_KEYS.build);
        if (buildScene?.selectMode) {
            buildScene.selectMode(mode);
        }
    }
}

/**
 * Handles the launchFromDistrictMap routine and encapsulates its core gameplay logic.
 * Parameters: none.
 * Returns: value defined by the surrounding game flow.
 */
function launchFromDistrictMap() {
    const mode = DistrictLayoutManager.getSelectedMode();

    if (window.game?.scene?.isActive?.(SCENE_KEYS.build)) {
        const buildScene = game.scene.getScene(SCENE_KEYS.build);
        if (buildScene?.launchMission) {
            buildScene.launchMission();
            return;
        }
    }

    if (window.startGame) {
        startGame(mode);
    }
}

/**
 * Handles the returnToGameFromDistrict routine and encapsulates its core gameplay logic.
 * Parameters: none.
 * Returns: value defined by the surrounding game flow.
 */
function returnToGameFromDistrict() {
    closeBuildView();
}

/**
 * Handles the closeSettingsToGame routine and encapsulates its core gameplay logic.
 * Parameters: none.
 * Returns: value defined by the surrounding game flow.
 */
function closeSettingsToGame() {
    const menu = document.getElementById('menu-overlay');
    if (menu) menu.style.display = 'none';

    if (window.game?.scene) {
        const mainScene = game.scene.getScene(SCENE_KEYS.game);
        if (mainScene?.scene?.isPaused()) {
            mainScene.scene.resume();
        }
    }
}

window.DistrictLayoutManager = DistrictLayoutManager;
