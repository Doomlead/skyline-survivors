const test = require('node:test');
const assert = require('node:assert');

const progression = require('../js/entities/player/pilotWeaponProgression');

test('pilotWeaponProgression unlock/temporary/tier/selection rules are centralized', () => {
    const state = {
        selected: 'scattergun',
        unlocked: { combatRifle: true, scattergun: false },
        temporaryUnlocks: { scattergun: false },
        tiers: { combatRifle: 1, scattergun: 0 },
        ammo: { scattergun: 10 }
    };

    progression.normalizeSelection(state);
    assert.equal(state.selected, 'combatRifle');

    progression.setTemporaryUnlock(state, 'scattergun', true);
    assert.equal(progression.isWeaponUsable(state, 'scattergun'), true);
    assert.equal(state.tiers.scattergun, 1);

    const tier = progression.upgradeTier(state, 'scattergun', 3);
    assert.equal(tier, 2);

    progression.consumeAmmo(state, 'scattergun', 4);
    assert.equal(state.ammo.scattergun, 6);

    progression.unlockWeapon(state, 'scattergun');
    progression.setTemporaryUnlock(state, 'scattergun', false);
    progression.normalizeSelection(state);
    assert.equal(progression.getAvailableWeapons(state).includes('scattergun'), true);
});
