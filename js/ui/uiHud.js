// ------------------------
// file js/ui/uiHud.js UI HUD handling
// ------------------------

function createUI(scene) {
    scoreEl = document.getElementById('score-el');
    cargoEl = document.getElementById('cargo-el');
    operativesEl = document.getElementById('operatives-el');
    waveEl = document.getElementById('wave-el');
    timerEl = document.getElementById('timer-el');
    bombsEl = document.getElementById('bombs-el');
    livesEl = document.getElementById('lives-el');
    powerupsEl = document.getElementById('powerups-el');
    districtEl = document.getElementById('district-el');
    threatEl = document.getElementById('threat-el');
    rewardEl = document.getElementById('reward-el');
    comboEl = document.getElementById('combo-el');
    comboFillEl = document.getElementById('combo-fill');
    comboFlowEl = document.getElementById('combo-flow');
    assaultHudEl = document.getElementById('assault-hud');
    assaultCoreFillEl = document.getElementById('assault-core-fill');
    assaultCoreLabelEl = document.getElementById('assault-core-label');
    assaultShieldLabelEl = document.getElementById('assault-shield-label');
    bossHudEl = document.getElementById('boss-hud');
    bossHpFillEl = document.getElementById('boss-hp-fill');
    bossHpLabelEl = document.getElementById('boss-hp-label');
    bossNameLabelEl = document.getElementById('boss-name-label');
    mothershipHudEl = document.getElementById('mothership-hud');
    mothershipCoreFillEl = document.getElementById('mothership-core-fill');
    mothershipCoreLabelEl = document.getElementById('mothership-core-label');
    mothershipPhaseLabelEl = document.getElementById('mothership-phase-label');
    decayHudEl = document.getElementById('decay-hud');
    decayPrimaryFillEl = document.getElementById('decay-primary-fill');
    decayPrimaryLabelEl = document.getElementById('decay-primary-label');
    decayPrimaryTierEl = document.getElementById('decay-primary-tier');
    decayCoverageFillEl = document.getElementById('decay-coverage-fill');
    decayCoverageLabelEl = document.getElementById('decay-coverage-label');
    decayMissileFillEl = document.getElementById('decay-missile-fill');
    decayMissileLabelEl = document.getElementById('decay-missile-label');
    decayOverdriveFillEl = document.getElementById('decay-overdrive-fill');
    decayOverdriveLabelEl = document.getElementById('decay-overdrive-label');
    decayStatusStripEl = document.getElementById('decay-status-strip');

    radarCanvas = document.getElementById('radar-canvas');
    if (radarCanvas) {
        radarCtx = radarCanvas.getContext('2d');
    }
}

function updateUI(scene) {
    if (!scoreEl) return;
    const humansGroup = scene?.humans;
    const activeBoss = scene?.bosses?.children?.entries?.find(entry => entry.active && entry.bossType !== 'mothershipCore')
        || scene?.battleships?.children?.entries?.find(entry => entry.active);

    const formatBossName = (name) => {
        if (!name) return 'Boss Target';
        const spaced = name.replace(/([A-Z])/g, ' $1').replace(/[_-]+/g, ' ');
        return spaced.replace(/\s+/g, ' ').trim().replace(/\b\w/g, char => char.toUpperCase());
    };

    const updateBossHud = (boss) => {
        if (!bossHudEl) return;
        if (!boss) {
            bossHudEl.classList.add('hidden');
            return;
        }
        bossHudEl.classList.remove('hidden');
        const bossHp = boss?.hp ?? 0;
        const bossMax = boss?.maxHP ?? 0;
        if (bossHpFillEl) {
            const pct = bossMax > 0 ? Math.max(0, Math.min(1, bossHp / bossMax)) : 0;
            bossHpFillEl.style.width = `${Math.round(pct * 100)}%`;
        }
        const now = scene?.time?.now || 0;
        const phaseHud = typeof getPhaseHudStatus === 'function' ? getPhaseHudStatus(boss) : null;
        if (bossHpLabelEl) {
            const gate = phaseHud?.gateText ? ` · ${phaseHud.gateText}` : '';
            bossHpLabelEl.innerText = `HP ${Math.max(0, Math.ceil(bossHp))}/${Math.max(0, Math.ceil(bossMax))}${gate}`;
            if (phaseHud?.gateColor) bossHpLabelEl.style.color = phaseHud.gateColor;
        }
        if (bossNameLabelEl) {
            const name = gameState.currentBossName || boss?.bossType || boss?.battleshipType || 'Boss';
            const phaseText = phaseHud?.phaseText ? ` · ${phaseHud.phaseText}` : '';
            bossNameLabelEl.innerText = `${formatBossName(name)}${phaseText}`;
        }
    };

    scoreEl.innerText = gameState.score.toString().padStart(6, '0');
    if (cargoEl) {
        const cargoCount = window.ShipController?.cargo ?? 0;
        cargoEl.innerText = String(cargoCount).padStart(2, '0');
    }
    if (operativesEl) {
        const friendlies = scene?.friendlies?.children?.entries || [];
        const deployed = friendlies.filter(entry => entry.active && entry.isOperative).length;
        operativesEl.innerText = String(deployed).padStart(2, '0');
    }

    if (gameState.mode === 'survival') {
        if (assaultHudEl) assaultHudEl.classList.add('hidden');
        if (mothershipHudEl) mothershipHudEl.classList.add('hidden');
        updateBossHud(activeBoss);
        const activeHumans = humansGroup ? humansGroup.countActive(true) : gameState.humans;
        waveEl.style.display = 'block';
        waveEl.innerText = 'HUMANS: ' + String(activeHumans).padStart(3, '0');

        timerEl.style.display = 'block';
        const t = Math.max(0, gameState.timeRemaining);
        const mins = Math.floor(t / 60000).toString().padStart(2, '0');
        const secs = Math.floor((t % 60000) / 1000).toString().padStart(2, '0');
        timerEl.innerText = `TIME: ${mins}:${secs}`;
    } else if (gameState.mode === 'assault') {
        timerEl.style.display = 'none';
        waveEl.style.display = 'block';
        if (mothershipHudEl) mothershipHudEl.classList.add('hidden');
        if (bossHudEl) bossHudEl.classList.add('hidden');
        const objective = gameState.assaultObjective;
        const baseHp = objective?.baseHp ?? 0;
        const baseMax = objective?.baseHpMax ?? 0;
        waveEl.innerText = 'ASSAULT: BASE CORE TARGET';
        if (assaultHudEl) assaultHudEl.classList.remove('hidden');
        if (assaultCoreFillEl) {
            const pct = baseMax > 0 ? Math.max(0, Math.min(1, baseHp / baseMax)) : 0;
            assaultCoreFillEl.style.width = `${Math.round(pct * 100)}%`;
        }
        if (assaultCoreLabelEl) {
            assaultCoreLabelEl.innerText = `Core ${Math.max(0, Math.ceil(baseHp))}/${Math.max(0, Math.ceil(baseMax))}`;
        }
        if (assaultShieldLabelEl) {
            const shields = objective?.shieldsRemaining ?? 0;
            const stage = objective?.shieldStage || 1;
            const total = objective?.shieldStageTotal || 1;
            const now = scene?.time?.now || 0;
            const windowLeft = Math.max(0, ((objective?.damageWindowUntil || 0) - now));
            const windowTag = windowLeft > 0 ? ` · Window ${Math.ceil(windowLeft / 1000)}s` : '';
            assaultShieldLabelEl.innerText = `Stage ${stage}/${total} · Shields: ${shields}${windowTag}`;
        }
    } else if (gameState.mode === 'mothership') {
        timerEl.style.display = 'none';
        waveEl.style.display = 'block';
        if (assaultHudEl) assaultHudEl.classList.add('hidden');
        if (bossHudEl) bossHudEl.classList.add('hidden');
        waveEl.innerText = 'FINAL ASSAULT: MOTHERSHIP CORE';
        const objective = gameState.mothershipObjective;
        const bossHp = objective?.bossHp ?? 0;
        const bossMax = objective?.bossHpMax ?? 0;
        if (mothershipHudEl) mothershipHudEl.classList.remove('hidden');
        if (mothershipCoreFillEl) {
            const pct = bossMax > 0 ? Math.max(0, Math.min(1, bossHp / bossMax)) : 0;
            mothershipCoreFillEl.style.width = `${Math.round(pct * 100)}%`;
        }
        if (mothershipCoreLabelEl) {
            mothershipCoreLabelEl.innerText = `Core ${Math.max(0, Math.ceil(bossHp))}/${Math.max(0, Math.ceil(bossMax))}`;
        }
        if (mothershipPhaseLabelEl) {
            const phase = objective?.phaseLabel || `Phase ${(objective?.phase ?? 0) + 1}`;
            const gate = objective?.gateLabel ? ` · ${objective.gateLabel}` : '';
            mothershipPhaseLabelEl.innerText = `${phase}${gate}`;
            if (objective?.gateColor) mothershipPhaseLabelEl.style.color = objective.gateColor;
        }
    } else {
        timerEl.style.display = 'none';
        waveEl.style.display = 'block';
        if (assaultHudEl) assaultHudEl.classList.add('hidden');
        if (mothershipHudEl) mothershipHudEl.classList.add('hidden');
        updateBossHud(activeBoss);

        const enemiesLeft = Math.max(0, (gameState.enemiesToKillThisWave || 0) - (gameState.killsThisWave || 0));
        const waveLimit = typeof CLASSIC_WAVE_LIMIT === 'number' ? CLASSIC_WAVE_LIMIT : 15;
        waveEl.innerText = `WAVE ${gameState.wave}/${waveLimit}  ENEMIES: ${String(enemiesLeft).padStart(3, '0')}`;
    }

    bombsEl.innerText = gameState.smartBombs;
    livesEl.innerText = gameState.lives;

    let powerUpText = '';
    const p = playerState.powerUps;
    if (p.laser > 0) {
        const laserTypes = ['', 'PIERCE', 'WAVE'];
        powerUpText += `[${laserTypes[p.laser]}] `;
    }
    if (p.drone > 0) powerUpText += `[DRONES:${p.drone}] `;
    if (p.shield > 0) powerUpText += `[SHIELD] `;
    if (p.missile > 0) {
        const missileTypes = ['', 'STRAIGHT', 'HOMING', 'CLUSTER'];
        powerUpText += `[${missileTypes[p.missile]}] `;
    }
    if (p.overdrive > 0) powerUpText += `[OVERDRIVE:${Math.ceil(p.overdrive/1000)}s] `;
    if (p.rapid > 0) powerUpText += `[RAPID:${Math.ceil(p.rapid/1000)}s] `;
    if (p.multiShot > 0) {
        const shotTypes = ['', 'TWIN', 'SPREAD', 'MULTI'];
        powerUpText += `[${shotTypes[p.multiShot]}] `;
    }
    if (p.coverage > 0) powerUpText += '[REAR] ';
    if (p.coverage > 1) powerUpText += '[SIDE] ';
    if (p.piercing > 0) powerUpText += '[PIERCING] ';
    if (p.speed > 0) powerUpText += `[SPEED:${Math.ceil(p.speed/1000)}s] `;
    if (p.magnet > 0) powerUpText += `[MAGNET:${Math.ceil(p.magnet/1000)}s] `;
    if (p.double > 0) powerUpText += `[2X DMG:${Math.ceil(p.double/1000)}s] `;
    if (p.invincibility > 0) powerUpText += `[INVINCIBLE:${Math.ceil(p.invincibility/1000)}s] `;
    if (p.timeSlow > 0) powerUpText += `[SLOW:${Math.ceil(p.timeSlow/1000)}s] `;

    powerupsEl.innerText = powerUpText || '[NORMAL FIRE]';

    if (comboEl) {
        const stacks = gameState.comboStacks || 0;
        const multiplier = (gameState.comboMultiplier || 1).toFixed(2);
        comboEl.innerText = stacks > 0 ? `x${multiplier} (${stacks})` : 'x1.00';
    }
    if (comboFillEl) {
        const pct = gameState.comboStacks > 0
            ? Math.max(0, Math.min(1, (gameState.comboTimer || 0) / COMBO_CONFIG.decayMs))
            : 0;
        comboFillEl.style.width = `${Math.round(pct * 100)}%`;
        comboFillEl.classList.toggle('animate-pulse', gameState.comboFlowActive && gameState.comboStacks > 0);
    }
    if (comboFlowEl) {
        comboFlowEl.classList.toggle('hidden', !(gameState.comboFlowActive && gameState.comboStacks > 0));
    }

    if (decayHudEl) {
        const decay = playerState.powerUpDecay || {};
        const primaryWeapon = playerState.primaryWeapon || (p.laser > 0 ? 'laser' : 'multiShot');
        const primaryTier = primaryWeapon === 'laser' ? p.laser : p.multiShot;
        const primaryDuration = getDecayDurationMs(primaryWeapon, primaryTier);
        const primaryRemaining = decay[primaryWeapon] || 0;
        const primaryPct = primaryDuration > 0 ? Math.max(0, Math.min(1, primaryRemaining / primaryDuration)) : 0;
        const isPrimaryLow = primaryPct > 0 && primaryPct <= 0.25;
        const flashActive = playerState.decayFlash?.[primaryWeapon] > 0;
        const usePulse = !isFlashReductionEnabled();

        if (decayPrimaryLabelEl) {
            decayPrimaryLabelEl.innerText = primaryWeapon === 'laser' ? 'LASER' : 'MULTI-SHOT';
        }
        if (decayPrimaryTierEl) {
            decayPrimaryTierEl.innerText = primaryTier > 0 ? `T${primaryTier}` : 'T0';
        }
        if (decayPrimaryFillEl) {
            decayPrimaryFillEl.style.width = `${Math.round(primaryPct * 100)}%`;
            decayPrimaryFillEl.style.backgroundColor = isPrimaryLow ? '#f97316' : '#22d3ee';
            decayPrimaryFillEl.classList.toggle('animate-pulse', usePulse && (isPrimaryLow || flashActive));
        }

        const coverageDuration = getDecayDurationMs('coverage', p.coverage);
        const coverageRemaining = decay.coverage || 0;
        const coveragePct = coverageDuration > 0 ? Math.max(0, Math.min(1, coverageRemaining / coverageDuration)) : 0;
        if (decayCoverageFillEl) {
            decayCoverageFillEl.style.width = `${Math.round(coveragePct * 100)}%`;
            decayCoverageFillEl.style.backgroundColor = coveragePct <= 0.25 && coveragePct > 0 ? '#f97316' : '#34d399';
            decayCoverageFillEl.classList.toggle('animate-pulse', usePulse && coveragePct > 0 && coveragePct <= 0.25);
        }
        if (decayCoverageLabelEl) {
            decayCoverageLabelEl.innerText = p.coverage > 0 ? `Coverage T${p.coverage}` : 'Coverage';
        }

        const missileDuration = getDecayDurationMs('missile', p.missile);
        const missileRemaining = decay.missile || 0;
        const missilePct = missileDuration > 0 ? Math.max(0, Math.min(1, missileRemaining / missileDuration)) : 0;
        if (decayMissileFillEl) {
            decayMissileFillEl.style.width = `${Math.round(missilePct * 100)}%`;
            decayMissileFillEl.style.backgroundColor = missilePct <= 0.25 && missilePct > 0 ? '#f97316' : '#e879f9';
            decayMissileFillEl.classList.toggle('animate-pulse', usePulse && missilePct > 0 && missilePct <= 0.25);
        }
        if (decayMissileLabelEl) {
            decayMissileLabelEl.innerText = p.missile > 0 ? `Homing T${p.missile}` : 'Homing';
        }

        if (decayOverdriveFillEl) {
            const overdrivePct = p.overdrive > 0 ? Math.max(0, Math.min(1, p.overdrive / 10000)) : 0;
            decayOverdriveFillEl.style.width = `${Math.round(overdrivePct * 100)}%`;
            decayOverdriveFillEl.style.backgroundColor = overdrivePct <= 0.25 && overdrivePct > 0 ? '#f97316' : '#fb923c';
            decayOverdriveFillEl.classList.toggle('animate-pulse', usePulse && overdrivePct > 0 && overdrivePct <= 0.25);
        }
        if (decayOverdriveLabelEl) {
            decayOverdriveLabelEl.innerText = p.overdrive > 0 ? `Overdrive ${Math.ceil(p.overdrive / 1000)}s` : 'Overdrive';
        }

        if (decayStatusStripEl) {
            const statusItems = [];
            if (p.speed > 0) statusItems.push(`Speed ${Math.ceil(p.speed / 1000)}s`);
            if (p.double > 0) statusItems.push(`2x ${Math.ceil(p.double / 1000)}s`);
            if (p.invincibility > 0) statusItems.push(`Inv ${Math.ceil(p.invincibility / 1000)}s`);
            if (p.timeSlow > 0) statusItems.push(`Slow ${Math.ceil(p.timeSlow / 1000)}s`);
            if (p.magnet > 0) statusItems.push(`Magnet ${Math.ceil(p.magnet / 1000)}s`);
            decayStatusStripEl.innerText = statusItems.length ? statusItems.join(' · ') : '';
        }
    }

    if (districtEl && threatEl && rewardEl) {
        const directives = gameState.missionDirectives;
        if (directives) {
            const isCritical = directives.status === 'critical';
            const timeValue = isCritical ? directives.criticalTimer : directives.timer;
            const timerLabel = typeof timeValue === 'number'
                ? formatMetaTimer(timeValue)
                : 'N/A';
            const districtName = directives.districtName || directives.districtId || 'Unknown';
            districtEl.innerText = `DISTRICT: ${districtName} (${directives.status || 'unknown'})`;
            threatEl.innerText = `THREAT: ${directives.urgency ? directives.urgency.toUpperCase() : 'STABLE'} · T-${timerLabel}`;
            const criticalAlert = isCritical || directives.urgency === 'critical';
            threatEl.classList.toggle('animate-pulse', criticalAlert);
            threatEl.classList.toggle('text-amber-200', !criticalAlert);
            threatEl.classList.toggle('text-red-300', criticalAlert);
            const clutchTag = directives.clutchDefenseBonus ? ` · CLUTCH +${Math.round(directives.clutchDefenseBonus * 100)}%` : '';
            const prosperityTag = directives.prosperityMultiplier ? ` · PROSPERITY x${directives.prosperityMultiplier.toFixed(2)}` : '';
            const lossTag = directives.prosperityLossTimer > 0 && directives.lastProsperityLoss
                ? ` · LOSS -${directives.lastProsperityLoss}`
                : '';
            rewardEl.innerText = `REWARDS: x${(gameState.rewardMultiplier || 1).toFixed(2)} · ${directives.reward || 'Standard'}${clutchTag}${prosperityTag}${lossTag}`;
        } else {
            districtEl.innerText = 'DISTRICT: Free Patrol';
            threatEl.innerText = 'THREAT: Neutral';
            threatEl.classList.remove('animate-pulse', 'text-red-300');
            threatEl.classList.add('text-amber-200');
            rewardEl.innerText = 'REWARDS: x1.00 standard loot';
        }
    }
}
