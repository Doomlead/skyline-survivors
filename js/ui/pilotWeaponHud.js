// ------------------------
// file: js/ui/pilotWeaponHud.js
// Pilot-only HUD presentation for weapon, ammo/time, tier, temp-tag, and switch hint.
// ------------------------

function getPilotWeaponHudInfo() {
    const state = pilotState?.weaponState;
    if (!state) return null;

    const selected = state.selected || 'combatRifle';
    const tier = Math.max(1, Math.round(state.tiers?.[selected] || 1));
    const temp = Boolean(state.temporaryUnlocks?.[selected] && !state.unlocked?.[selected]);

    const labels = {
        combatRifle: { name: 'Combat Rifle', icon: 'R' },
        scattergun: { name: 'Scattergun', icon: 'S' },
        plasmaLauncher: { name: 'Plasma Launcher', icon: 'P' },
        lightningGun: { name: 'Lightning Gun', icon: 'L' },
        stingerDrone: { name: 'Stinger Drone', icon: 'D' }
    };

    const maxAmmoFromMeta = window.metaProgression?.getPilotWeaponProfile?.()?.startAmmo || {};
    const ammoMax = Number.isFinite(maxAmmoFromMeta[selected]) ? Math.max(0, Math.round(maxAmmoFromMeta[selected])) : 0;
    const ammoCurrent = Math.max(0, Math.round(state.ammo?.[selected] || 0));
    const limitedAmmo = ['scattergun', 'plasmaLauncher', 'lightningGun'].includes(selected);

    const meterLabel = limitedAmmo
        ? `${ammoCurrent}/${ammoMax || ammoCurrent}`
        : `∞`;
    const meterValue = limitedAmmo && ammoMax > 0 ? Math.max(0, Math.min(1, ammoCurrent / ammoMax)) : 1;

    const progression = typeof window !== 'undefined' ? window.pilotWeaponProgression : null;
    const availableCount = progression?.getAvailableWeapons
        ? progression.getAvailableWeapons(state).length
        : ['combatRifle', 'scattergun', 'plasmaLauncher', 'lightningGun', 'stingerDrone'].filter((weaponId) => state.unlocked?.[weaponId] || state.temporaryUnlocks?.[weaponId]).length;

    return {
        selected,
        tier,
        temp,
        icon: labels[selected]?.icon || '?',
        name: labels[selected]?.name || selected,
        meterLabel,
        meterValue,
        droneCount: Math.max(0, Math.round(state.droneCount || 0)),
        showSwitchHint: availableCount > 1
    };
}

function updatePilotWeaponHud(scene) {
    const hud = document.getElementById('pilot-weapon-hud');
    if (!hud) return;

    const pilotOnly = Boolean(pilotState?.active && !aegisState?.active);
    if (!pilotOnly) {
        hud.classList.add('hidden');
        return;
    }

    const info = getPilotWeaponHudInfo();
    if (!info) {
        hud.classList.add('hidden');
        return;
    }

    hud.classList.remove('hidden');

    const iconEl = document.getElementById('pilot-weapon-icon');
    const nameEl = document.getElementById('pilot-weapon-name');
    const tierEl = document.getElementById('pilot-weapon-tier');
    const tempEl = document.getElementById('pilot-weapon-temp');
    const meterFillEl = document.getElementById('pilot-weapon-meter-fill');
    const meterLabelEl = document.getElementById('pilot-weapon-meter-label');
    const droneEl = document.getElementById('pilot-weapon-drone');
    const hintEl = document.getElementById('pilot-weapon-tab-hint');

    if (iconEl) iconEl.innerText = info.icon;
    if (nameEl) nameEl.innerText = info.name;
    if (tierEl) tierEl.innerText = `T${info.tier}`;
    if (tempEl) tempEl.classList.toggle('hidden', !info.temp);
    if (meterFillEl) meterFillEl.style.width = `${Math.round(info.meterValue * 100)}%`;
    if (meterLabelEl) meterLabelEl.innerText = info.meterLabel;
    if (droneEl) droneEl.innerText = `DRONES ${info.droneCount}`;
    if (hintEl) hintEl.classList.toggle('hidden', !info.showSwitchHint);
}
