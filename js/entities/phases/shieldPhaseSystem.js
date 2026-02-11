// ------------------------
// Shared Shield/HP Phase System (Upgraded)
// ------------------------

function initializeShieldPhaseState(entity, options = {}) {
    if (!entity) return;

    const shieldBaseHp = Math.max(1, options.shieldBaseHp || Math.ceil((entity.maxHP || entity.maxHp || 100) * 0.25));

    entity.phaseState = {
        shieldMax: shieldBaseHp,
        damageWindowMs: options.damageWindowMs || 4000,
        regenDelayMs: options.intermissionMs || 1000,

        active: true,
        mode: 'SHIELD',
        shieldHp: shieldBaseHp,
        timer: 0,

        phasesCleared: 0,
        totalPhases: Math.max(1, options.shieldStages || 3),
        label: options.label || 'Phase'
    };
}

function getShieldPhaseState(entity) {
    return entity?.phaseState || null;
}

function canDamagePhaseHp(entity) {
    const state = getShieldPhaseState(entity);
    if (!state) return true;
    return state.mode === 'VULNERABLE' || state.mode === 'EXPOSED';
}

function getPhasedInterval(entity, baseInterval, stepDown = 140, minInterval = 280) {
    const phase = getEncounterPhase(entity);
    return Math.max(minInterval, baseInterval - phase * stepDown);
}

function createFloatingText(scene, x, y, message, color = '#ffffff') {
    if (!scene || !scene.add || !scene.tweens) return;
    const parsedColor = typeof color === 'number'
        ? `#${color.toString(16).padStart(6, '0')}`
        : color;
    const text = scene.add.text(x, y, message, {
        fontSize: '14px',
        fontFamily: 'Orbitron',
        color: parsedColor,
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5).setDepth(300);

    scene.tweens.add({
        targets: text,
        y: y - 30,
        alpha: 0,
        duration: 800,
        onComplete: () => text.destroy()
    });
}

function tickShieldPhaseState(entity, time = 0, delta = 0) {
    const state = entity?.phaseState;
    if (!state || !state.active) return;

    if (entity.hp <= 0 || state.phasesCleared >= state.totalPhases) {
        state.mode = 'EXPOSED';
        return;
    }

    if (state.mode === 'VULNERABLE') {
        state.timer -= delta;

        if (entity.active) {
            if (Math.floor(time / 200) % 2 === 0) entity.setTint(0xffffff);
            else entity.clearTint();
        }

        if (state.timer <= 0) {
            state.mode = 'REGENERATING';
            state.timer = state.regenDelayMs;
            if (entity.active) entity.clearTint();

            if (entity.scene) {
                createFloatingText(entity.scene, entity.x, entity.y - 40, 'SHIELDS RESTORING', '#38bdf8');
            }
        }
    } else if (state.mode === 'REGENERATING') {
        state.timer -= delta;
        if (state.timer <= 0) {
            state.mode = 'SHIELD';
            state.shieldMax = Math.max(1, Math.floor(state.shieldMax * 1.1));
            state.shieldHp = state.shieldMax;

            if (entity.active) entity.setTint(0x38bdf8);
            if (entity.scene) {
                createExplosion(entity.scene, entity.x, entity.y, 0x38bdf8, 0.5);
                entity.scene.time.delayedCall(200, () => {
                    if (entity && entity.active) entity.clearTint();
                });
            }
        }
    }
}

function applyShieldStageDamage(entity, damage, now = 0) {
    const state = entity?.phaseState;
    if (!state) return { appliedToShield: false, shieldBroken: false, phaseAdvanced: false };

    if (state.mode === 'VULNERABLE' || state.mode === 'EXPOSED') {
        return { appliedToShield: false, shieldBroken: false, phaseAdvanced: false };
    }

    if (state.mode === 'REGENERATING') {
        return { appliedToShield: true, shieldBroken: false, phaseAdvanced: false, immune: true };
    }

    if (state.mode === 'SHIELD') {
        state.shieldHp -= Math.max(0, damage || 0);

        if (entity.active) entity.setTint(0x00ffff);
        if (entity.scene) {
            entity.scene.time.delayedCall(50, () => {
                if (entity && entity.active) entity.clearTint();
            });
        }

        if (state.shieldHp <= 0) {
            state.shieldHp = 0;
            state.mode = 'VULNERABLE';
            state.timer = state.damageWindowMs;
            state.phasesCleared += 1;
            return { appliedToShield: true, shieldBroken: true, phaseAdvanced: true };
        }

        return { appliedToShield: true, shieldBroken: false, phaseAdvanced: false };
    }

    return { appliedToShield: false, shieldBroken: false, phaseAdvanced: false };
}

function getPhaseHudStatus(entity) {
    const state = entity?.phaseState;
    if (!state) return { phaseText: '', gateText: '', gateColor: '#ffffff', percent: 1, windowRemainingMs: 0 };

    const phaseDisplay = `Phase ${Math.min(state.totalPhases, state.phasesCleared + 1)}/${state.totalPhases}`;
    let gateText = '';
    let color = '#ffffff';
    let percent = 0;

    if (state.mode === 'SHIELD') {
        gateText = `SHIELD: ${Math.ceil(state.shieldHp)} / ${Math.ceil(state.shieldMax)}`;
        color = '#38bdf8';
        percent = state.shieldMax > 0 ? Math.max(0, Math.min(1, state.shieldHp / state.shieldMax)) : 0;
    } else if (state.mode === 'VULNERABLE') {
        const secs = Math.max(0, state.timer / 1000).toFixed(1);
        gateText = `>>> VULNERABLE: ${secs}s <<<`;
        color = '#ff4444';
        percent = state.damageWindowMs > 0 ? Math.max(0, Math.min(1, state.timer / state.damageWindowMs)) : 0;
    } else if (state.mode === 'REGENERATING') {
        gateText = 'SYSTEM REBOOTING...';
        color = '#fbbf24';
        percent = 1;
    } else if (state.mode === 'EXPOSED') {
        gateText = 'CORE EXPOSED';
        color = '#ff0000';
        percent = 0;
    }

    return {
        phaseText: phaseDisplay,
        gateText,
        gateColor: color,
        percent,
        windowRemainingMs: state.mode === 'VULNERABLE' ? Math.max(0, state.timer) : 0
    };
}

function getEncounterPhase(entity) {
    if (!entity?.phaseState) return 0;
    return Math.min(2, entity.phaseState.phasesCleared || 0);
}
