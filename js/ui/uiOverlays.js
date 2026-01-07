// ------------------------
// file js/ui/uiOverlays.js Game over/win overlays
// ------------------------

function gameOver(scene) {
    const audioManager = scene.audioManager;
    gameState.gameOver = true;
    if (window.missionPlanner) missionPlanner.recordMissionOutcome(false);
    const metaResult = recordMetaOutcome(false);
    scene.physics.pause();
    if (audioManager) {
        audioManager.playSound('gameOver');
        audioManager.stopMusic();
    }

    const centerX = scene.cameras.main.width / 2;
    const centerY = scene.cameras.main.height / 2;

    scene.add.rectangle(centerX, centerY, CONFIG.width, CONFIG.height, 0x000000, 0.7)
        .setScrollFactor(0).setDepth(990);

    scene.add.text(centerX, centerY - 50, 'GAME OVER', {
        fontSize: '64px', fontFamily: 'Orbitron', color: '#ff0000', stroke: '#000000', strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    scene.add.text(centerX, centerY + 30,
        `Final Score: ${gameState.score}\nHumans Rescued: ${gameState.humansRescued}\n` +
        `Meta Credits: +${metaResult?.earnedCredits || 0} (Bank: ${metaProgression?.getMetaState?.().credits || 0})`, {
        fontSize: '24px', fontFamily: 'Orbitron', color: '#00ffff', align: 'center', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const buttonY = centerY + 120;

    const restartButton = scene.add.text(centerX - 120, buttonY, '[ R ] RESTART', {
        fontSize: '20px', fontFamily: 'Orbitron', color: '#00ff00', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });

    const menuButton = scene.add.text(centerX + 120, buttonY, '[ M ] MAIN MENU', {
        fontSize: '20px', fontFamily: 'Orbitron', color: '#ffff00', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });

    scene.input.keyboard.once('keydown-R', () => {
        resetGameState();
        scene.scene.restart();
    });
    scene.input.keyboard.once('keydown-M', () => returnToMainMenu(scene));

    restartButton.on('pointerdown', () => {
        resetGameState();
        scene.scene.restart();
    });
    menuButton.on('pointerdown', () => returnToMainMenu(scene));
}

function winGame(scene) {
    const audioManager = scene.audioManager;
    gameState.gameOver = true;
    if (window.missionPlanner) missionPlanner.recordMissionOutcome(true);
    const metaResult = recordMetaOutcome(true);
    scene.physics.pause();
    if (audioManager) {
        audioManager.playSound('waveComplete');
        audioManager.stopMusic();
    }

    const centerX = scene.cameras.main.width / 2;
    const centerY = scene.cameras.main.height / 2;

    scene.add.rectangle(centerX, centerY, CONFIG.width, CONFIG.height, 0x000000, 0.7)
        .setScrollFactor(0).setDepth(990);

    scene.add.text(centerX, centerY - 50, 'MISSION COMPLETE!', {
        fontSize: '64px', fontFamily: 'Orbitron', color: '#00ff00', stroke: '#000000', strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    scene.add.text(centerX, centerY + 30,
        `Victory!\nFinal Score: ${gameState.score}\n` +
        `Meta Credits: +${metaResult?.earnedCredits || 0} (Bank: ${metaProgression?.getMetaState?.().credits || 0})`, {
        fontSize: '24px', fontFamily: 'Orbitron', color: '#00ffff', align: 'center', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const buttonY = centerY + 120;
    const restartButton = scene.add.text(centerX - 120, buttonY, '[ R ] RESTART', {
        fontSize: '20px', fontFamily: 'Orbitron', color: '#00ff00', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });

    const menuButton = scene.add.text(centerX + 120, buttonY, '[ M ] MAIN MENU', {
        fontSize: '20px', fontFamily: 'Orbitron', color: '#ffff00', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });

    scene.input.keyboard.once('keydown-R', () => {
        resetGameState();
        scene.scene.restart();
    });
    scene.input.keyboard.once('keydown-M', () => returnToMainMenu(scene));

    restartButton.on('pointerdown', () => {
        resetGameState();
        scene.scene.restart();
    });
    menuButton.on('pointerdown', () => returnToMainMenu(scene));
}

function recordMetaOutcome(success) {
    if (!window.metaProgression || gameState.metaRewardsGranted) return null;
    const outcome = {
        success,
        score: gameState.score,
        humansRescued: gameState.humansRescued,
        mode: gameState.mode,
        directives: gameState.missionDirectives,
        districtId: gameState.missionContext?.district,
        districtName: gameState.missionDirectives?.districtName || gameState.missionContext?.city
    };
    const result = metaProgression.recordRunOutcome(outcome);
    gameState.metaRewardsGranted = true;
    return result;
}
