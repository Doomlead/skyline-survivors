const test = require('node:test');
const assert = require('node:assert');

const { cyclePilotWeapon } = require('../js/entities/player/playerWeapons');

test('checklist: TAB cycles only usable weapons (unlocked or temporary)', () => {
    global.pilotState = {
        weaponState: {
            selected: 'combatRifle',
            unlocked: {
                combatRifle: true,
                scattergun: true,
                plasmaLauncher: false,
                lightningGun: false,
                stingerDrone: false
            },
            temporaryUnlocks: {
                scattergun: false,
                plasmaLauncher: false,
                lightningGun: false,
                stingerDrone: true
            },
            tiers: {
                combatRifle: 1,
                scattergun: 1,
                plasmaLauncher: 0,
                lightningGun: 0,
                stingerDrone: 1
            },
            ammo: {
                scattergun: 200,
                plasmaLauncher: 0,
                lightningGun: 0
            }
        }
    };

    cyclePilotWeapon();
    assert.equal(global.pilotState.weaponState.selected, 'scattergun');
    cyclePilotWeapon();
    assert.equal(global.pilotState.weaponState.selected, 'stingerDrone');
    cyclePilotWeapon();
    assert.equal(global.pilotState.weaponState.selected, 'combatRifle');

    delete global.pilotState;
});
