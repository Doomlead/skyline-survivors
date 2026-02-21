const test = require('node:test');
const assert = require('node:assert');

const { fireWeapon } = require('../js/entities/player/playerWeapons');

test('fireWeapon ignores null/inactive drone entries and still fires valid drone shots', () => {
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
        primaryWeapon: 'multiShot'
    };
    global.getActivePlayer = () => ({ x: 200, y: 100 });
    global.getLaserConfig = () => ({ type: 'normal', piercing: false });
    global.getPrimaryShotPattern = () => ({ mode: 'single', angles: [0] });
    global.getCoverageShotPattern = () => ({ mode: 'single', angles: [0] });
    global.getCoverageConfig = () => ({ type: 'normal', piercing: false });
    global.getFireOrigin = () => ({ fireX: 220, fireY: 100 });
    global.createProjectile = () => {};
    global.fireShotPattern = () => {};
    global.FG_DEPTH_BASE = 10;

    const createdDroneProjectiles = [];
    const makeDroneProjectile = () => ({
        active: true,
        setScale: () => {},
        setDepth: () => {},
        setVelocity: () => {},
        destroy: () => {}
    });

    const scene = {
        projectiles: {
            create: (x, y, key) => {
                createdDroneProjectiles.push({ x, y, key });
                return makeDroneProjectile();
            }
        },
        drones: {
            children: {
                entries: [
                    null,
                    { active: false, x: 50, y: 50 },
                    { active: true, x: 300, y: 150 }
                ]
            }
        },
        time: { delayedCall: () => {} }
    };

    assert.doesNotThrow(() => fireWeapon(scene));
    const droneShots = createdDroneProjectiles.filter((entry) => entry.key === 'projectile_drone');
    assert.strictEqual(droneShots.length, 1);
    assert.deepStrictEqual(droneShots[0], { x: 300, y: 150, key: 'projectile_drone' });

    delete global.playerState;
    delete global.getActivePlayer;
    delete global.getLaserConfig;
    delete global.getPrimaryShotPattern;
    delete global.getCoverageShotPattern;
    delete global.getCoverageConfig;
    delete global.getFireOrigin;
    delete global.createProjectile;
    delete global.fireShotPattern;
    delete global.FG_DEPTH_BASE;
});
