const test = require('node:test');
const assert = require('node:assert');

const { fireWeapon } = require('../js/entities/player/playerWeapons');

test('fireWeapon pilot plasma launcher does not throw when projectile body is missing', () => {
    global.playerState = {
        powerUps: {
            speed: 0,
            double: 0,
            laser: 0,
            multiShot: 0,
            coverage: 0,
            missile: 0,
            overdrive: 0,
            timeSlow: 0,
            piercing: 0
        },
        direction: 'right',
        fireRate: 100,
        primaryWeapon: 'multiShot'
    };

    global.pilotState = {
        active: true,
        facing: 1,
        weaponState: {
            selected: 'plasmaLauncher',
            unlocked: { plasmaLauncher: true, combatRifle: true },
            temporaryUnlocks: {},
            ammo: { plasmaLauncher: 10 },
            tiers: { plasmaLauncher: 1 }
        }
    };
    global.aegisState = { active: false };
    global.getActivePlayer = () => ({ x: 200, y: 100 });
    global.FG_DEPTH_BASE = 10;

    const scene = {
        projectiles: {
            create: () => ({
                active: true,
                setScale: () => {},
                setDepth: () => {},
                setVelocity: () => {},
                destroy: () => {}
            })
        },
        time: {
            now: 0,
            delayedCall: () => {}
        },
        add: {
            particles: () => ({ stop: () => {}, stopFollow: () => {}, destroy: () => {} })
        }
    };

    assert.doesNotThrow(() => fireWeapon(scene));

    delete global.playerState;
    delete global.pilotState;
    delete global.aegisState;
    delete global.getActivePlayer;
    delete global.FG_DEPTH_BASE;
});
