// ------------------------
// file js/ui/uiPauseMenu.js Pause menu and key bindings
// ------------------------

function togglePause(scene) {
    const audioManager = scene.audioManager;
    gameState.paused = !gameState.paused;

    if (gameState.paused) {
        scene.physics.pause();
        scene.isRebindingKey = false;
        scene.pauseMenuView = 'main'; // 'main' or 'keybindings'

        createPauseMenu(scene, audioManager);
    } else {
        scene.physics.resume();
        cleanupPauseUI(scene);
    }
}

/**
 * Handles the createPauseMenu routine and encapsulates its core gameplay logic.
 * Parameters: scene, audioManager.
 * Returns: value defined by the surrounding game flow.
 */
function createPauseMenu(scene, audioManager) {
    const centerX = scene.cameras.main.width / 2;
    const centerY = scene.cameras.main.height / 2;

    // Main overlay (always visible when paused)
    const overlay = scene.add.rectangle(centerX, centerY, CONFIG.width, CONFIG.height, 0x000000, 0.85)
        .setScrollFactor(0).setDepth(998).setInteractive();

    // === MAIN PAUSE MENU ELEMENTS ===
    const mainElements = [];

    const pauseTitle = scene.add.text(centerX, 60, 'PAUSED', {
        fontSize: '48px', fontFamily: 'Orbitron', color: '#00ffff', stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);
    mainElements.push(pauseTitle);

    // Resume and Menu buttons
    const resumeText = scene.add.text(centerX - 150, 120, '[ P ] RESUME', {
        fontSize: '18px', fontFamily: 'Orbitron', color: '#00ff00', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });
    mainElements.push(resumeText);

    const menuText = scene.add.text(centerX + 150, 120, '[ M ] MAIN MENU', {
        fontSize: '18px', fontFamily: 'Orbitron', color: '#ffff00', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });
    mainElements.push(menuText);

    // Volume Controls Section
    const volumeTitle = scene.add.text(centerX, 170, 'AUDIO', {
        fontSize: '16px', fontFamily: 'Orbitron', color: '#ffffff', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);
    mainElements.push(volumeTitle);

    // Music Slider
    const musicLabel = scene.add.text(centerX - 140, 200, 'Music', {
        fontSize: '14px', fontFamily: 'Orbitron', color: '#00ffff'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(999);
    mainElements.push(musicLabel);

    const musicSlider = scene.add.rectangle(centerX + 40, 200, 150, 8, 0x444444, 1)
        .setScrollFactor(0).setDepth(999);
    mainElements.push(musicSlider);

    const musicKnob = scene.add.circle(
        centerX + 40 + (audioManager ? audioManager.musicVolume * 150 : 90) - 75,
        200, 10, 0x00ffff, 1
    ).setScrollFactor(0).setDepth(1000).setInteractive({ useHandCursor: true });
    mainElements.push(musicKnob);

    // SFX Slider
    const sfxLabel = scene.add.text(centerX - 140, 230, 'SFX', {
        fontSize: '14px', fontFamily: 'Orbitron', color: '#00ffff'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(999);
    mainElements.push(sfxLabel);

    const sfxSlider = scene.add.rectangle(centerX + 40, 230, 150, 8, 0x444444, 1)
        .setScrollFactor(0).setDepth(999);
    mainElements.push(sfxSlider);

    const sfxKnob = scene.add.circle(
        centerX + 40 + (audioManager ? audioManager.sfxVolume * 150 : 105) - 75,
        230, 10, 0x00ff00, 1
    ).setScrollFactor(0).setDepth(1000).setInteractive({ useHandCursor: true });
    mainElements.push(sfxKnob);

    // Flash reduction toggle
    const flashLabel = scene.add.text(centerX - 140, 265, 'Reduce Flashes', {
        fontSize: '14px', fontFamily: 'Orbitron', color: '#00ffff'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(999);
    mainElements.push(flashLabel);

    const flashToggle = scene.add.rectangle(centerX + 30, 265, 32, 18, 0x111827, 1)
        .setStrokeStyle(2, 0x00ffff, 0.7)
        .setScrollFactor(0)
        .setDepth(999)
        .setInteractive({ useHandCursor: true });
    mainElements.push(flashToggle);

    const flashThumb = scene.add.circle(
        centerX + 22 + (userSettings.reduceFlashes ? 14 : 0),
        265,
        7,
        userSettings.reduceFlashes ? 0x22c55e : 0x0ea5e9,
        1
    ).setScrollFactor(0).setDepth(1000).setInteractive({ useHandCursor: true });
    flashThumb._baseX = centerX + 22;
    mainElements.push(flashThumb);

    const flashText = scene.add.text(centerX + 55, 265, userSettings.reduceFlashes ? 'On' : 'Off', {
        fontSize: '12px', fontFamily: 'Orbitron', color: userSettings.reduceFlashes ? '#22c55e' : '#38bdf8'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(999);
    mainElements.push(flashText);

    // Key Bindings Button
    const keyBindingsButton = scene.add.text(centerX, 320, '[ K ] KEY BINDINGS', {
        fontSize: '18px', fontFamily: 'Orbitron', color: '#38bdf8', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });
    mainElements.push(keyBindingsButton);

    // === KEY BINDINGS VIEW ELEMENTS ===
    const keyBindingsElements = [];

    const keyBindingsTitle = scene.add.text(centerX, 50, 'KEY BINDINGS', {
        fontSize: '36px', fontFamily: 'Orbitron', color: '#38bdf8', stroke: '#000000', strokeThickness: 5
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setVisible(false);
    keyBindingsElements.push(keyBindingsTitle);

    const keyBindingsHint = scene.add.text(centerX, 90, 'Click a binding to change it. Press ESC to cancel.', {
        fontSize: '12px', fontFamily: 'Orbitron', color: '#94a3b8'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setVisible(false);
    keyBindingsElements.push(keyBindingsHint);

    const backButton = scene.add.text(centerX, CONFIG.height - 50, '[ ESC ] BACK TO PAUSE MENU', {
        fontSize: '16px', fontFamily: 'Orbitron', color: '#fbbf24', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true }).setVisible(false);
    keyBindingsElements.push(backButton);

    // Create key binding rows
    const keyMapValueTexts = [];
    const panelStartY = 130;
    const rowHeight = 32;
    const entriesPerColumn = Math.ceil(KEY_BINDING_ACTIONS.length / 2);

    KEY_BINDING_ACTIONS.forEach((action, index) => {
        const column = index < entriesPerColumn ? 0 : 1;
        const row = column === 0 ? index : index - entriesPerColumn;
        const xBase = column === 0 ? centerX - 220 : centerX + 30;
        const y = panelStartY + row * rowHeight;

        const label = scene.add.text(xBase, y, `${action.label}:`, {
            fontSize: '14px', fontFamily: 'Orbitron', color: '#e2e8f0'
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(999).setVisible(false);
        keyBindingsElements.push(label);

        const value = scene.add.text(xBase + 140, y, `[ ${formatKeyLabel(userSettings.keyBindings[action.id])} ]`, {
            fontSize: '14px', fontFamily: 'Orbitron', color: '#38bdf8'
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true }).setVisible(false);
        keyBindingsElements.push(value);

        value.on('pointerover', () => value.setColor('#7dd3fc'));
        value.on('pointerout', () => {
            if (!scene.isRebindingKey || scene.rebindingAction !== action.id) {
                value.setColor('#38bdf8');
            }
        });

        keyMapValueTexts.push({ actionId: action.id, label: action.label, text: value });
    });

    // Reset to Defaults button
    const resetButton = scene.add.text(centerX, CONFIG.height - 90, '[ RESET TO DEFAULTS ]', {
        fontSize: '14px', fontFamily: 'Orbitron', color: '#f87171', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true }).setVisible(false);
    keyBindingsElements.push(resetButton);

    // Store references
    scene.pauseUI = {
        overlay,
        mainElements,
        keyBindingsElements,
        keyMapValueTexts,
        keyBindingsHint,
        flashThumb,
        flashText,
        musicKnob,
        sfxKnob
    };

    // === EVENT HANDLERS ===

    const showMainMenu = () => {
        scene.pauseMenuView = 'main';
        mainElements.forEach(el => el.setVisible(true));
        keyBindingsElements.forEach(el => el.setVisible(false));
        keyMapValueTexts.forEach(({ text }) => text.setVisible(false));
        cancelRebind();
    };

    /**
     * Handles the showKeyBindings routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    const showKeyBindings = () => {
        scene.pauseMenuView = 'keybindings';
        mainElements.forEach(el => el.setVisible(false));
        keyBindingsElements.forEach(el => el.setVisible(true));
        keyMapValueTexts.forEach(({ text }) => text.setVisible(true));
    };

    /**
     * Handles the updateKeyMapValues routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    const updateKeyMapValues = () => {
        keyMapValueTexts.forEach(({ actionId, text }) => {
            text.setText(`[ ${formatKeyLabel(userSettings.keyBindings[actionId])} ]`);
        });
    };

    /**
     * Handles the cancelRebind routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    const cancelRebind = () => {
        scene.isRebindingKey = false;
        scene.rebindingAction = null;
        keyBindingsHint.setText('Click a binding to change it. Press ESC to cancel.').setColor('#94a3b8');
        if (scene.keyRebindHandler) {
            scene.input.keyboard.off('keydown', scene.keyRebindHandler);
            scene.keyRebindHandler = null;
        }
    };

    /**
     * Handles the startKeyRebind routine and encapsulates its core gameplay logic.
     * Parameters: actionId, actionLabel, textObj.
     * Returns: value defined by the surrounding game flow.
     */
    const startKeyRebind = (actionId, actionLabel, textObj) => {
        if (scene.keyRebindHandler) {
            scene.input.keyboard.off('keydown', scene.keyRebindHandler);
            scene.keyRebindHandler = null;
        }

        scene.isRebindingKey = true;
        scene.rebindingAction = actionId;
        keyBindingsHint.setText(`Press a key for "${actionLabel}"...`).setColor('#fbbf24');
        textObj.setColor('#fbbf24');

        scene.keyRebindHandler = (event) => {
            if (event.key === 'Escape') {
                textObj.setColor('#38bdf8');
                cancelRebind();
                return;
            }

            const normalized = normalizeKeyName(event);
            if (!normalized || !Phaser.Input.Keyboard.KeyCodes[normalized]) {
                keyBindingsHint.setText('Unsupported key. Try another.').setColor('#f87171');
                return;
            }

            const existingAction = Object.keys(userSettings.keyBindings).find(
                key => userSettings.keyBindings[key] === normalized && key !== actionId
            );
            if (existingAction) {
                const conflict = KEY_BINDING_ACTIONS.find(a => a.id === existingAction);
                keyBindingsHint.setText(`Already bound to "${conflict?.label || existingAction}".`).setColor('#f87171');
                return;
            }

            userSettings.keyBindings[actionId] = normalized;
            persistUserSettings();
            if (scene.refreshKeyBindings) scene.refreshKeyBindings();
            updateKeyMapValues();
            textObj.setColor('#38bdf8');
            cancelRebind();
        };

        scene.input.keyboard.on('keydown', scene.keyRebindHandler);
    };

    // Main menu interactions
    resumeText.on('pointerdown', () => togglePause(scene));
    menuText.on('pointerdown', () => returnToMainMenu(scene));
    keyBindingsButton.on('pointerdown', showKeyBindings);

    // Key bindings interactions
    backButton.on('pointerdown', showMainMenu);

    resetButton.on('pointerdown', () => {
        userSettings.keyBindings = { ...DEFAULT_KEY_BINDINGS };
        persistUserSettings();
        if (scene.refreshKeyBindings) scene.refreshKeyBindings();
        updateKeyMapValues();
        keyBindingsHint.setText('Key bindings reset to defaults!').setColor('#22c55e');
        scene.time.delayedCall(2000, () => {
            if (keyBindingsHint.active) {
                keyBindingsHint.setText('Click a binding to change it. Press ESC to cancel.').setColor('#94a3b8');
            }
        });
    });

    keyMapValueTexts.forEach(({ actionId, label, text }) => {
        text.on('pointerdown', () => startKeyRebind(actionId, label, text));
    });

    // Flash toggle
    const toggleFlash = () => {
        userSettings.reduceFlashes = !userSettings.reduceFlashes;
        persistUserSettings();
        const isOn = userSettings.reduceFlashes;
        flashThumb.x = flashThumb._baseX + (isOn ? 14 : 0);
        flashThumb.fillColor = isOn ? 0x22c55e : 0x0ea5e9;
        flashText.setText(isOn ? 'On' : 'Off');
        flashText.setColor(isOn ? '#22c55e' : '#38bdf8');
    };
    flashToggle.on('pointerdown', toggleFlash);
    flashThumb.on('pointerdown', toggleFlash);

    // Volume sliders
    let dragTarget = null;
    musicKnob.on('pointerdown', () => { dragTarget = 'music'; });
    sfxKnob.on('pointerdown', () => { dragTarget = 'sfx'; });

    /**
     * Handles the onPointerUp routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    const onPointerUp = () => { dragTarget = null; };
    /**
     * Handles the onPointerMove routine and encapsulates its core gameplay logic.
     * Parameters: pointer.
     * Returns: value defined by the surrounding game flow.
     */
    const onPointerMove = (pointer) => {
        if (!dragTarget || !audioManager) return;
        const sliderCenterX = centerX + 40;
        const sliderWidth = 150;
        const sliderLeft = sliderCenterX - sliderWidth / 2;
        const sliderRight = sliderCenterX + sliderWidth / 2;

        const clampedX = Phaser.Math.Clamp(pointer.x, sliderLeft, sliderRight);
        const normalized = (clampedX - sliderLeft) / sliderWidth;

        if (dragTarget === 'music') {
            audioManager.setMusicVolume(normalized);
            musicKnob.x = clampedX;
        } else {
            audioManager.setSFXVolume(normalized);
            sfxKnob.x = clampedX;
        }
    };

    scene.input.on('pointerup', onPointerUp);
    scene.input.on('pointermove', onPointerMove);
    scene.pauseHandlers = { onPointerUp, onPointerMove };

    // Keyboard shortcuts
    scene.menuKeyHandler = () => {
        if (scene.isRebindingKey) return;
        returnToMainMenu(scene);
    };
    scene.input.keyboard.on('keydown-M', scene.menuKeyHandler);

    scene.keyMapHandler = () => {
        if (scene.isRebindingKey) return;
        if (scene.pauseMenuView === 'main') {
            showKeyBindings();
        } else {
            showMainMenu();
        }
    };
    scene.input.keyboard.on('keydown-K', scene.keyMapHandler);

    scene.escHandler = () => {
        if (scene.isRebindingKey) {
            cancelRebind();
        } else if (scene.pauseMenuView === 'keybindings') {
            showMainMenu();
        }
    };
    scene.input.keyboard.on('keydown-ESC', scene.escHandler);
}

/**
 * Handles the cleanupPauseUI routine and encapsulates its core gameplay logic.
 * Parameters: scene.
 * Returns: value defined by the surrounding game flow.
 */
function cleanupPauseUI(scene) {
    if (scene.pauseUI) {
        const { overlay, mainElements, keyBindingsElements, keyMapValueTexts } = scene.pauseUI;

        if (overlay) overlay.destroy();

        if (mainElements) {
            mainElements.forEach(el => {
                if (el && el.destroy) el.destroy();
            });
        }

        if (keyBindingsElements) {
            keyBindingsElements.forEach(el => {
                if (el && el.destroy) el.destroy();
            });
        }

        if (keyMapValueTexts) {
            keyMapValueTexts.forEach(({ text }) => {
                if (text && text.destroy) text.destroy();
            });
        }

        scene.pauseUI = null;
    }

    if (scene.pauseHandlers) {
        scene.input.off('pointerup', scene.pauseHandlers.onPointerUp);
        scene.input.off('pointermove', scene.pauseHandlers.onPointerMove);
        scene.pauseHandlers = null;
    }

    if (scene.keyRebindHandler) {
        scene.input.keyboard.off('keydown', scene.keyRebindHandler);
        scene.keyRebindHandler = null;
    }

    if (scene.menuKeyHandler) {
        scene.input.keyboard.off('keydown-M', scene.menuKeyHandler);
        scene.menuKeyHandler = null;
    }

    if (scene.keyMapHandler) {
        scene.input.keyboard.off('keydown-K', scene.keyMapHandler);
        scene.keyMapHandler = null;
    }

    if (scene.escHandler) {
        scene.input.keyboard.off('keydown-ESC', scene.escHandler);
        scene.escHandler = null;
    }

    scene.isRebindingKey = false;
    scene.rebindingAction = null;
    scene.pauseMenuView = null;
}

/**
 * Handles the returnToMainMenu routine and encapsulates its core gameplay logic.
 * Parameters: scene.
 * Returns: value defined by the surrounding game flow.
 */
function returnToMainMenu(scene) {
    cleanupPauseUI(scene);
    resetGameState();

    if (window.game && game.scene) {
        if (game.scene.isActive(SCENE_KEYS.build)) {
            game.scene.stop(SCENE_KEYS.build);
        }
        if (game.scene.isActive(SCENE_KEYS.game)) {
            game.scene.stop(SCENE_KEYS.game);
        }
        if (!game.scene.isActive(SCENE_KEYS.menu)) {
            game.scene.start(SCENE_KEYS.menu);
        } else {
            game.scene.bringToTop(SCENE_KEYS.menu);
        }
    }

    const menu = document.getElementById('menu-overlay');
    if (menu) menu.style.display = 'flex';

    const toggleBtn = document.getElementById('build-toggle');
    const returnBtn = document.getElementById('build-return');
    if (toggleBtn) toggleBtn.classList.remove('hidden');
    if (returnBtn) returnBtn.classList.add('hidden');
}
