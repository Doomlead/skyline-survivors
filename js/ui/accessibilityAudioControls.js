// ------------------------
// File: js/ui/accessibilityAudioControls.js
// ------------------------

function getActiveAudioManager() { // Get active audio manager.
    const scene = game?.scene?.getScene ? game.scene.getScene(SCENE_KEYS.game) : null;
    return scene?.audioManager || null;
}

// ------------------------
// Mute toggle wiring
// ------------------------

const muteButton = document.getElementById('mute-toggle');
if (muteButton) {
    muteButton.textContent = userSettings.muted ? 'Unmute' : 'Mute';
    muteButton.addEventListener('click', () => {
        const audioManager = getActiveAudioManager();
        if (!audioManager) return;
        const muted = audioManager.toggleMute();
        muteButton.textContent = muted ? 'Unmute' : 'Mute';
    });
}

// ------------------------
// Accessibility + volume wiring (main menu panel)
// ------------------------

function wireAccessibilityPanel() { // Wire accessibility panel.
    const musicSlider = document.getElementById('music-volume-slider');
    const sfxSlider = document.getElementById('sfx-volume-slider');
    const flashToggle = document.getElementById('reduce-flash-toggle');
    const musicLabel = document.getElementById('music-volume-value');
    const sfxLabel = document.getElementById('sfx-volume-value');
    const flashLabel = document.getElementById('reduce-flash-label');

    if (musicSlider && musicLabel) {
        const applyMusic = (value) => { // Apply music.
            musicLabel.textContent = `${Math.round(value * 100)}%`;
            const audioManager = getActiveAudioManager();
            if (audioManager) audioManager.setMusicVolume(value);
            else {
                userSettings.musicVolume = value;
                persistUserSettings();
            }
        };
        musicSlider.value = Math.round(userSettings.musicVolume * 100);
        applyMusic(userSettings.musicVolume);
        musicSlider.addEventListener('input', (e) => {
            const normalized = Phaser.Math.Clamp(Number(e.target.value) / 100, 0, 1);
            applyMusic(normalized);
        });
    }

    if (sfxSlider && sfxLabel) {
        const applySfx = (value) => { // Apply sfx.
            sfxLabel.textContent = `${Math.round(value * 100)}%`;
            const audioManager = getActiveAudioManager();
            if (audioManager) audioManager.setSFXVolume(value);
            else {
                userSettings.sfxVolume = value;
                persistUserSettings();
            }
        };
        sfxSlider.value = Math.round(userSettings.sfxVolume * 100);
        applySfx(userSettings.sfxVolume);
        sfxSlider.addEventListener('input', (e) => {
            const normalized = Phaser.Math.Clamp(Number(e.target.value) / 100, 0, 1);
            applySfx(normalized);
        });
    }

    if (flashToggle && flashLabel) {
        flashToggle.checked = !!userSettings.reduceFlashes;
        flashLabel.textContent = userSettings.reduceFlashes ? 'On' : 'Off';
        flashToggle.addEventListener('change', () => {
            userSettings.reduceFlashes = !!flashToggle.checked;
            flashLabel.textContent = userSettings.reduceFlashes ? 'On' : 'Off';
            persistUserSettings();
        });
    }
}

wireAccessibilityPanel();
