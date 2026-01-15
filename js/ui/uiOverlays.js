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

    if (gameState.mode === 'mothership') {
        showCampaignVictory(scene, metaResult);
        return;
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

function showCampaignVictory(scene, metaResult) {
    const centerX = scene.cameras.main.width / 2;
    const centerY = scene.cameras.main.height / 2;
    const stats = getCampaignVictoryStats();

    scene.add.rectangle(centerX, centerY, CONFIG.width, CONFIG.height, 0x000000, 0.78)
        .setScrollFactor(0).setDepth(990);

    scene.add.text(centerX, centerY - 160, 'PLANET LIBERATED', {
        fontSize: '64px',
        fontFamily: 'Orbitron',
        color: '#facc15',
        stroke: '#000000',
        strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const statsText = [
        `Districts Saved: ${stats.districtsSaved}${stats.totalDistricts ? ` / ${stats.totalDistricts}` : ''}`,
        `Time Played: ${formatCampaignTime(stats.timePlayedMs)}`,
        `Score: ${stats.score}`,
        `Meta Credits: +${metaResult?.earnedCredits || 0} (Bank: ${metaProgression?.getMetaState?.().credits || 0})`
    ].join('\n');

    scene.add.text(centerX, centerY - 10, statsText, {
        fontSize: '26px',
        fontFamily: 'Orbitron',
        color: '#e2e8f0',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const buttonY = centerY + 140;

    const newCampaignButton = scene.add.text(centerX - 170, buttonY, 'NEW CAMPAIGN', {
        fontSize: '22px',
        fontFamily: 'Orbitron',
        color: '#22c55e',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });

    const menuButton = scene.add.text(centerX + 170, buttonY, 'RETURN TO MENU', {
        fontSize: '22px',
        fontFamily: 'Orbitron',
        color: '#38bdf8',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });

    newCampaignButton.on('pointerdown', () => {
        resetGameState();
        if (window.missionPlanner?.resetCampaignState) {
            missionPlanner.resetCampaignState();
        }
        if (window.enterDistrictMap) {
            enterDistrictMap({ fromVictory: true });
        }
    });

    menuButton.on('pointerdown', () => returnToMainMenu(scene));
}

function getCampaignVictoryStats() {
    const allDistricts = window.missionPlanner?.getAllDistrictStates?.() || [];
    const districtsSaved = allDistricts.filter(entry => entry.state?.status === 'friendly').length;
    return {
        districtsSaved,
        totalDistricts: allDistricts.length,
        timePlayedMs: gameState.timePlayedMs || 0,
        score: gameState.score
    };
}

function formatCampaignTime(ms = 0) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
