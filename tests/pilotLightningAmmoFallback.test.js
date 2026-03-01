const test = require('node:test');
const assert = require('node:assert');

const { fireWeapon } = require('../js/entities/player/playerWeapons');

test('firePilotWeapon lightningGun consumes fallback ammo cost when player fireRate is missing', () => {
    global.getActivePlayer = (scene) => scene.player;
    global.playerState = {
        direction: 'right',
        powerUps: {
            speed: 0,
            double: 0,
            laser: 0,
            multiShot: 0,
            piercing: 0,
            coverage: 0,
            missile: 0,
            overdrive: 0,
            timeSlow: 0
        }
    };
    global.pilotState = {
        active: true,
        facing: 1,
        weaponState: {
            selected: 'lightningGun',
            unlocked: { lightningGun: true, combatRifle: true },
            temporaryUnlocks: {},
            tiers: { lightningGun: 1 },
            ammo: { lightningGun: 3 }
        }
    };
    global.aegisState = { active: false };
    global.FG_DEPTH_BASE = 0;

    const created = [];
    const scene = {
        player: { x: 100, y: 100, active: true },
        projectiles: {
            create: (x, y, texture) => {
                const proj = {
                    active: true,
                    x,
                    y,
                    texture,
                    body: { velocity: { x: 0, y: 0 } },
                    setScale: () => proj,
                    setDepth: () => proj,
                    setVelocity: (vx, vy) => {
                        proj.body.velocity.x = vx;
                        proj.body.velocity.y = vy;
                        return proj;
                    },
                    destroy: () => {}
                };
                created.push(proj);
                return proj;
            }
        },
        add: { particles: () => ({ stop: () => {}, stopFollow: () => {}, destroy: () => {} }) },
        time: { now: 0, delayedCall: () => {} }
    };

    fireWeapon(scene);

    assert.equal(created.length, 1);
    assert.equal(pilotState.weaponState.ammo.lightningGun, 2);

    delete global.getActivePlayer;
    delete global.playerState;
    delete global.pilotState;
    delete global.aegisState;
    delete global.FG_DEPTH_BASE;
});
