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

function showMissionDefeat(scene, metaResult) {
    const centerX = scene.cameras.main.width / 2;
    const centerY = scene.cameras.main.height / 2;
    const isAssault = gameState.mode === 'assault';
    const bannerText = isAssault ? 'ASSAULT UNSUCCESSFUL' : 'DISTRICT LOST';
    const bannerColor = isAssault ? '#f97316' : '#ef4444';
    const timePlayed = formatCampaignTime(gameState.timePlayedMs || 0);
    const metaCredits = metaResult?.earnedCredits || 0;
    const metaBank = metaProgression?.getMetaState?.().credits || 0;

    scene.add.rectangle(centerX, centerY, CONFIG.width, CONFIG.height, 0x000000, 0.7)
        .setScrollFactor(0).setDepth(990);

    scene.add.text(centerX, centerY - 140, bannerText, {
        fontSize: '60px',
        fontFamily: 'Orbitron',
        color: bannerColor,
        stroke: '#000000',
        strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const statsLines = [];
    if (!isAssault) {
        statsLines.push(`Humans Rescued: ${gameState.humansRescued}`);
    }
    statsLines.push(`Time Played: ${timePlayed}`);
    statsLines.push(`Score: ${gameState.score}`);
    statsLines.push(`Meta Credits: +${metaCredits} (Bank: ${metaBank})`);

    scene.add.text(centerX, centerY - 20, statsLines.join('\n'), {
        fontSize: '26px',
        fontFamily: 'Orbitron',
        color: '#e2e8f0',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const buttonY = centerY + 150;
    const returnButton = scene.add.text(centerX, buttonY, 'RETURN TO DISTRICT MAP', {
        fontSize: '22px',
        fontFamily: 'Orbitron',
        color: '#facc15',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });

    const handleReturn = () => {
        resetGameState();
        if (window.enterDistrictMap) {
            enterDistrictMap({ fromVictory: true });
        }
    };

    scene.input.keyboard.once('keydown-D', handleReturn);
    returnButton.on('pointerdown', handleReturn);
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
    showMissionVictory(scene, metaResult);
}

function showCampaignDefeat(scene, metaResult) {
    const centerX = scene.cameras.main.width / 2;
    const centerY = scene.cameras.main.height / 2;
    const stats = getCampaignVictoryStats();

    scene.add.rectangle(centerX, centerY, CONFIG.width, CONFIG.height, 0x000000, 0.78)
        .setScrollFactor(0).setDepth(990);

    scene.add.text(centerX, centerY - 160, 'PLANET REMAINS SUBJUGATED', {
        fontSize: '54px',
        fontFamily: 'Orbitron',
        color: '#ef4444',
        stroke: '#000000',
        strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const statsText = [
        `Districts Saved: ${stats.districtsSaved}${stats.totalDistricts ? ` / ${stats.totalDistricts}` : ''}`,
        `Time Played: ${formatCampaignTime(stats.timePlayedMs)}`,
        `Score: ${stats.score}`
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

    const returnButton = scene.add.text(centerX, buttonY, 'RETURN TO DISTRICT MAP', {
        fontSize: '22px',
        fontFamily: 'Orbitron',
        color: '#facc15',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });

    const handleReturn = () => {
        resetGameState();
        if (window.enterDistrictMap) {
            enterDistrictMap({ fromVictory: true });
        }
    };

    scene.input.keyboard.once('keydown-D', handleReturn);
    returnButton.on('pointerdown', handleReturn);
}

function showMissionVictory(scene, metaResult) {
    const centerX = scene.cameras.main.width / 2;
    const centerY = scene.cameras.main.height / 2;
    const isAssault = gameState.mode === 'assault';
    const bannerText = isAssault ? 'ASSAULT SUCCESSFUL' : 'DISTRICT DEFENDED';
    const bannerColor = isAssault ? '#38bdf8' : '#4ade80';
    const timePlayed = formatCampaignTime(gameState.timePlayedMs || 0);
    const metaCredits = metaResult?.earnedCredits || 0;
    const metaBank = metaProgression?.getMetaState?.().credits || 0;

    scene.add.rectangle(centerX, centerY, CONFIG.width, CONFIG.height, 0x000000, 0.75)
        .setScrollFactor(0).setDepth(990);

    scene.add.text(centerX, centerY - 140, bannerText, {
        fontSize: '60px',
        fontFamily: 'Orbitron',
        color: bannerColor,
        stroke: '#000000',
        strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const statsLines = [];
    if (!isAssault) {
        statsLines.push(`Humans Rescued: ${gameState.humansRescued}`);
    }
    statsLines.push(`Time Played: ${timePlayed}`);
    statsLines.push(`Score: ${gameState.score}`);
    statsLines.push(`Meta Credits: +${metaCredits} (Bank: ${metaBank})`);

    scene.add.text(centerX, centerY - 20, statsLines.join('\n'), {
        fontSize: '26px',
        fontFamily: 'Orbitron',
        color: '#e2e8f0',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const buttonY = centerY + 150;
    const returnButton = scene.add.text(centerX, buttonY, 'RETURN TO DISTRICT MAP', {
        fontSize: '22px',
        fontFamily: 'Orbitron',
        color: '#facc15',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });

    const handleReturn = () => {
        resetGameState();
        if (window.enterDistrictMap) {
            enterDistrictMap({ fromVictory: true });
        }
    };

    scene.input.keyboard.once('keydown-D', handleReturn);
    returnButton.on('pointerdown', handleReturn);
}

function showMissionVictory(scene, metaResult) {
    const centerX = scene.cameras.main.width / 2;
    const centerY = scene.cameras.main.height / 2;
    const isAssault = gameState.mode === 'assault';
    const bannerText = isAssault ? 'ASSAULT SUCCESSFUL' : 'DISTRICT DEFENDED';
    const bannerColor = isAssault ? '#38bdf8' : '#4ade80';
    const timePlayed = formatCampaignTime(gameState.timePlayedMs || 0);
    const metaCredits = metaResult?.earnedCredits || 0;
    const metaBank = metaProgression?.getMetaState?.().credits || 0;

    scene.add.rectangle(centerX, centerY, CONFIG.width, CONFIG.height, 0x000000, 0.75)
        .setScrollFactor(0).setDepth(990);

    scene.add.text(centerX, centerY - 140, bannerText, {
        fontSize: '60px',
        fontFamily: 'Orbitron',
        color: bannerColor,
        stroke: '#000000',
        strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const statsLines = [];
    if (!isAssault) {
        statsLines.push(`Humans Rescued: ${gameState.humansRescued}`);
    }
    statsLines.push(`Time Played: ${timePlayed}`);
    statsLines.push(`Score: ${gameState.score}`);
    statsLines.push(`Meta Credits: +${metaCredits} (Bank: ${metaBank})`);

    scene.add.text(centerX, centerY - 20, statsLines.join('\n'), {
        fontSize: '26px',
        fontFamily: 'Orbitron',
        color: '#e2e8f0',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const buttonY = centerY + 150;
    const returnButton = scene.add.text(centerX, buttonY, 'RETURN TO DISTRICT MAP', {
        fontSize: '22px',
        fontFamily: 'Orbitron',
        color: '#facc15',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });

    const handleReturn = () => {
        resetGameState();
        if (window.enterDistrictMap) {
            enterDistrictMap({ fromVictory: true });
        }
    };

    scene.input.keyboard.once('keydown-D', handleReturn);
    returnButton.on('pointerdown', handleReturn);
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
