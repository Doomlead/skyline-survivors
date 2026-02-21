const test = require('node:test');
const assert = require('node:assert');

const { fireWeapon } = require('../js/entities/player/playerWeapons');

test('fireWeapon still fires primary shots when drones group is unavailable', () => {
    global.getActivePlayer = (scene) => scene.player;
    global.playerState = {
        direction: 'right',
        primaryWeapon: 'multiShot',
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
        drones: null,
        add: { particles: () => ({ stop: () => {}, stopFollow: () => {}, destroy: () => {} }) },
        time: { now: 0, delayedCall: () => {} }
    };

    fireWeapon(scene);

    assert.ok(created.length >= 1, 'expected at least one primary projectile to be created');

    delete global.getActivePlayer;
    delete global.playerState;
    delete global.FG_DEPTH_BASE;
});
