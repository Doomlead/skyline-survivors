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

    if (gameState.mode === 'mothership') {
        showCampaignDefeat(scene, metaResult);
        return;
    }

    showMissionDefeat(scene, metaResult);
}

/**
 * Handles the getOverlayScale routine and encapsulates its core gameplay logic.
 * Parameters: scene.
 * Returns: value defined by the surrounding game flow.
 */
function getOverlayScale(scene) {
    const cam = scene.cameras.main;
    const scale = cam && cam.height ? cam.height / 700 : 1;
    return Math.min(1, Math.max(0.7, scale));
}

/**
 * Handles the showMissionDefeat routine and encapsulates its core gameplay logic.
 * Parameters: scene, metaResult.
 * Returns: value defined by the surrounding game flow.
 */
function showMissionDefeat(scene, metaResult) {
    const cam = scene.cameras.main;
    const centerX = cam.width / 2;
    const centerY = cam.height / 2;
    const overlayScale = getOverlayScale(scene);
    const isAssault = gameState.mode === 'assault';
    const bannerText = isAssault ? 'ASSAULT UNSUCCESSFUL' : 'DISTRICT LOST';
    const bannerColor = isAssault ? '#f97316' : '#ef4444';
    const timePlayed = formatCampaignTime(gameState.timePlayedMs || 0);
    const metaCredits = metaResult?.earnedCredits || 0;
    const metaBank = metaProgression?.getMetaState?.().credits || 0;

    scene.add.rectangle(centerX, centerY, cam.width, cam.height, 0x000000, 0.7)
        .setScrollFactor(0).setDepth(990);

    scene.add.text(centerX, centerY - 140 * overlayScale, bannerText, {
        fontSize: `${Math.round(60 * overlayScale)}px`,
        fontFamily: 'Orbitron',
        color: bannerColor,
        stroke: '#000000',
        strokeThickness: Math.round(8 * overlayScale)
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const statsLines = [];
    if (!isAssault) {
        statsLines.push(`Humans Rescued: ${gameState.humansRescued}`);
    }
    statsLines.push(`Time Played: ${timePlayed}`);
    statsLines.push(`Score: ${gameState.score}`);
    statsLines.push(`Meta Credits: +${metaCredits} (Bank: ${metaBank})`);

    scene.add.text(centerX, centerY - 20 * overlayScale, statsLines.join('\n'), {
        fontSize: `${Math.round(26 * overlayScale)}px`,
        fontFamily: 'Orbitron',
        color: '#e2e8f0',
        align: 'center',
        stroke: '#000000',
        strokeThickness: Math.round(4 * overlayScale)
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const buttonY = centerY + 150 * overlayScale;
    const returnButton = scene.add.text(centerX, buttonY, 'RETURN TO DISTRICT MAP', {
        fontSize: `${Math.round(22 * overlayScale)}px`,
        fontFamily: 'Orbitron',
        color: '#facc15',
        stroke: '#000000',
        strokeThickness: Math.round(4 * overlayScale)
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });

    /**
     * Handles the handleReturn routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    const handleReturn = () => {
        resetGameState();
        if (window.enterDistrictMap) {
            enterDistrictMap({ fromVictory: true });
        }
    };

    scene.input.keyboard.once('keydown-D', handleReturn);
    returnButton.on('pointerdown', handleReturn);
}

/**
 * Handles the winGame routine and encapsulates its core gameplay logic.
 * Parameters: scene.
 * Returns: value defined by the surrounding game flow.
 */
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
    showMissionVictory(scene, metaResult);
}

/**
 * Handles the showCampaignDefeat routine and encapsulates its core gameplay logic.
 * Parameters: scene, metaResult.
 * Returns: value defined by the surrounding game flow.
 */
function showCampaignDefeat(scene, metaResult) {
    const cam = scene.cameras.main;
    const centerX = cam.width / 2;
    const centerY = cam.height / 2;
    const overlayScale = getOverlayScale(scene);
    const stats = getCampaignVictoryStats();

    scene.add.rectangle(centerX, centerY, cam.width, cam.height, 0x000000, 0.78)
        .setScrollFactor(0).setDepth(990);

    scene.add.text(centerX, centerY - 160 * overlayScale, 'PLANET REMAINS SUBJUGATED', {
        fontSize: `${Math.round(54 * overlayScale)}px`,
        fontFamily: 'Orbitron',
        color: '#ef4444',
        stroke: '#000000',
        strokeThickness: Math.round(8 * overlayScale)
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const statsText = [
        `Districts Saved: ${stats.districtsSaved}${stats.totalDistricts ? ` / ${stats.totalDistricts}` : ''}`,
        `Time Played: ${formatCampaignTime(stats.timePlayedMs)}`,
        `Score: ${stats.score}`
    ].join('\n');

    scene.add.text(centerX, centerY - 10 * overlayScale, statsText, {
        fontSize: `${Math.round(26 * overlayScale)}px`,
        fontFamily: 'Orbitron',
        color: '#e2e8f0',
        align: 'center',
        stroke: '#000000',
        strokeThickness: Math.round(4 * overlayScale)
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const buttonY = centerY + 140 * overlayScale;

    const returnButton = scene.add.text(centerX, buttonY, 'RETURN TO DISTRICT MAP', {
        fontSize: `${Math.round(22 * overlayScale)}px`,
        fontFamily: 'Orbitron',
        color: '#facc15',
        stroke: '#000000',
        strokeThickness: Math.round(4 * overlayScale)
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });

    /**
     * Handles the handleReturn routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    const handleReturn = () => {
        resetGameState();
        if (window.enterDistrictMap) {
            enterDistrictMap({ fromVictory: true });
        }
    };

    scene.input.keyboard.once('keydown-D', handleReturn);
    returnButton.on('pointerdown', handleReturn);
}

/**
 * Handles the showMissionVictory routine and encapsulates its core gameplay logic.
 * Parameters: scene, metaResult.
 * Returns: value defined by the surrounding game flow.
 */
function showMissionVictory(scene, metaResult) {
    const cam = scene.cameras.main;
    const centerX = cam.width / 2;
    const centerY = cam.height / 2;
    const overlayScale = getOverlayScale(scene);
    const isAssault = gameState.mode === 'assault';
    const bannerText = isAssault ? 'ASSAULT SUCCESSFUL' : 'DISTRICT DEFENDED';
    const bannerColor = isAssault ? '#38bdf8' : '#4ade80';
    const timePlayed = formatCampaignTime(gameState.timePlayedMs || 0);
    const metaCredits = metaResult?.earnedCredits || 0;
    const metaBank = metaProgression?.getMetaState?.().credits || 0;

    scene.add.rectangle(centerX, centerY, cam.width, cam.height, 0x000000, 0.75)
        .setScrollFactor(0).setDepth(990);

    scene.add.text(centerX, centerY - 140 * overlayScale, bannerText, {
        fontSize: `${Math.round(60 * overlayScale)}px`,
        fontFamily: 'Orbitron',
        color: bannerColor,
        stroke: '#000000',
        strokeThickness: Math.round(8 * overlayScale)
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const statsLines = [];
    if (!isAssault) {
        statsLines.push(`Humans Rescued: ${gameState.humansRescued}`);
    }
    statsLines.push(`Time Played: ${timePlayed}`);
    statsLines.push(`Score: ${gameState.score}`);
    statsLines.push(`Meta Credits: +${metaCredits} (Bank: ${metaBank})`);

    scene.add.text(centerX, centerY - 20 * overlayScale, statsLines.join('\n'), {
        fontSize: `${Math.round(26 * overlayScale)}px`,
        fontFamily: 'Orbitron',
        color: '#e2e8f0',
        align: 'center',
        stroke: '#000000',
        strokeThickness: Math.round(4 * overlayScale)
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const buttonY = centerY + 150 * overlayScale;
    const returnButton = scene.add.text(centerX, buttonY, 'RETURN TO DISTRICT MAP', {
        fontSize: `${Math.round(22 * overlayScale)}px`,
        fontFamily: 'Orbitron',
        color: '#facc15',
        stroke: '#000000',
        strokeThickness: Math.round(4 * overlayScale)
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });

    /**
     * Handles the handleReturn routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    const handleReturn = () => {
        resetGameState();
        if (window.enterDistrictMap) {
            enterDistrictMap({ fromVictory: true });
        }
    };

    scene.input.keyboard.once('keydown-D', handleReturn);
    returnButton.on('pointerdown', handleReturn);
}

/**
 * Handles the showMissionVictory routine and encapsulates its core gameplay logic.
 * Parameters: scene, metaResult.
 * Returns: value defined by the surrounding game flow.
 */
function showMissionVictory(scene, metaResult) {
    const cam = scene.cameras.main;
    const centerX = cam.width / 2;
    const centerY = cam.height / 2;
    const overlayScale = getOverlayScale(scene);
    const isAssault = gameState.mode === 'assault';
    const bannerText = isAssault ? 'ASSAULT SUCCESSFUL' : 'DISTRICT DEFENDED';
    const bannerColor = isAssault ? '#38bdf8' : '#4ade80';
    const timePlayed = formatCampaignTime(gameState.timePlayedMs || 0);
    const metaCredits = metaResult?.earnedCredits || 0;
    const metaBank = metaProgression?.getMetaState?.().credits || 0;

    scene.add.rectangle(centerX, centerY, cam.width, cam.height, 0x000000, 0.75)
        .setScrollFactor(0).setDepth(990);

    scene.add.text(centerX, centerY - 140 * overlayScale, bannerText, {
        fontSize: `${Math.round(60 * overlayScale)}px`,
        fontFamily: 'Orbitron',
        color: bannerColor,
        stroke: '#000000',
        strokeThickness: Math.round(8 * overlayScale)
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const statsLines = [];
    if (!isAssault) {
        statsLines.push(`Humans Rescued: ${gameState.humansRescued}`);
    }
    statsLines.push(`Time Played: ${timePlayed}`);
    statsLines.push(`Score: ${gameState.score}`);
    statsLines.push(`Meta Credits: +${metaCredits} (Bank: ${metaBank})`);

    scene.add.text(centerX, centerY - 20 * overlayScale, statsLines.join('\n'), {
        fontSize: `${Math.round(26 * overlayScale)}px`,
        fontFamily: 'Orbitron',
        color: '#e2e8f0',
        align: 'center',
        stroke: '#000000',
        strokeThickness: Math.round(4 * overlayScale)
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const buttonY = centerY + 150 * overlayScale;
    const returnButton = scene.add.text(centerX, buttonY, 'RETURN TO DISTRICT MAP', {
        fontSize: `${Math.round(22 * overlayScale)}px`,
        fontFamily: 'Orbitron',
        color: '#facc15',
        stroke: '#000000',
        strokeThickness: Math.round(4 * overlayScale)
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });

    /**
     * Handles the handleReturn routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    const handleReturn = () => {
        resetGameState();
        if (window.enterDistrictMap) {
            enterDistrictMap({ fromVictory: true });
        }
    };

    scene.input.keyboard.once('keydown-D', handleReturn);
    returnButton.on('pointerdown', handleReturn);
}

/**
 * Handles the getCampaignVictoryStats routine and encapsulates its core gameplay logic.
 * Parameters: none.
 * Returns: value defined by the surrounding game flow.
 */
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

/**
 * Handles the formatCampaignTime routine and encapsulates its core gameplay logic.
 * Parameters: ms.
 * Returns: value defined by the surrounding game flow.
 */
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

/**
 * Handles the showCampaignVictory routine and encapsulates its core gameplay logic.
 * Parameters: scene, metaResult.
 * Returns: value defined by the surrounding game flow.
 */
function showCampaignVictory(scene, metaResult) {
    const cam = scene.cameras.main;
    const centerX = cam.width / 2;
    const centerY = cam.height / 2;
    const overlayScale = getOverlayScale(scene);
    const stats = getCampaignVictoryStats();

    scene.add.rectangle(centerX, centerY, cam.width, cam.height, 0x000000, 0.78)
        .setScrollFactor(0).setDepth(990);

    scene.add.text(centerX, centerY - 160 * overlayScale, 'PLANET LIBERATED', {
        fontSize: `${Math.round(58 * overlayScale)}px`,
        fontFamily: 'Orbitron',
        color: '#facc15',
        stroke: '#000000',
        strokeThickness: Math.round(8 * overlayScale)
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const statsText = [
        `Districts Saved: ${stats.districtsSaved}${stats.totalDistricts ? ` / ${stats.totalDistricts}` : ''}`,
        `Time Played: ${formatCampaignTime(stats.timePlayedMs)}`,
        `Score: ${stats.score}`,
        `Meta Credits: +${metaResult?.earnedCredits || 0} (Bank: ${metaProgression?.getMetaState?.().credits || 0})`
    ].join('\n');

    scene.add.text(centerX, centerY - 10 * overlayScale, statsText, {
        fontSize: `${Math.round(26 * overlayScale)}px`,
        fontFamily: 'Orbitron',
        color: '#e2e8f0',
        align: 'center',
        stroke: '#000000',
        strokeThickness: Math.round(4 * overlayScale)
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const buttonY = centerY + 140 * overlayScale;

    const newCampaignButton = scene.add.text(centerX - 170, buttonY, 'NEW CAMPAIGN', {
        fontSize: `${Math.round(22 * overlayScale)}px`,
        fontFamily: 'Orbitron',
        color: '#22c55e',
        stroke: '#000000',
        strokeThickness: Math.round(4 * overlayScale)
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });

    const menuButton = scene.add.text(centerX + 170, buttonY, 'RETURN TO MENU', {
        fontSize: `${Math.round(22 * overlayScale)}px`,
        fontFamily: 'Orbitron',
        color: '#38bdf8',
        stroke: '#000000',
        strokeThickness: Math.round(4 * overlayScale)
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

/**
 * Handles the getCampaignVictoryStats routine and encapsulates its core gameplay logic.
 * Parameters: none.
 * Returns: value defined by the surrounding game flow.
 */
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

/**
 * Handles the formatCampaignTime routine and encapsulates its core gameplay logic.
 * Parameters: ms.
 * Returns: value defined by the surrounding game flow.
 */
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

/**
 * Handles the recordMetaOutcome routine and encapsulates its core gameplay logic.
 * Parameters: success.
 * Returns: value defined by the surrounding game flow.
 */
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
