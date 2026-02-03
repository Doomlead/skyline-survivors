// ------------------------
// Hangar Behavior - Beacon Pulse
// ------------------------

const HANGAR_DROP_OFF_CONFIG = {
    xRange: 80,
    yRange: 70,
    botSpawnOffset: 70
};

const BASIC_SHOOTER_BOT_CONFIG = {
    texture: 'garrisonDefenderRifle',
    scale: 1.7,
    fireCooldown: 900,
    range: 420,
    projectileSpeed: 420,
    projectileType: 'normal',
    damage: 1
};

function spawnBasicShooterBot(scene, x, y) {
    const { friendlies, audioManager } = scene;
    if (!friendlies) return null;

    const bot = friendlies.create(x, y, BASIC_SHOOTER_BOT_CONFIG.texture);
    bot.setDepth(FG_DEPTH_BASE + 2);
    bot.setScale(BASIC_SHOOTER_BOT_CONFIG.scale);
    bot.setImmovable(true);
    if (bot.body) {
        bot.body.setAllowGravity(false);
        bot.body.setVelocity(0, 0);
    }
    bot.isBasicShooterBot = true;
    bot.lastShot = 0;
    bot.blinkOffset = Math.random() * Math.PI * 2;
    bot.homeX = x;
    bot.homeY = y;
    bot.fireCooldown = Phaser.Math.Between(
        BASIC_SHOOTER_BOT_CONFIG.fireCooldown - 150,
        BASIC_SHOOTER_BOT_CONFIG.fireCooldown + 150
    );

    createSpawnEffect(scene, x, y, 'drone');
    if (audioManager) audioManager.playSound('enemySpawn');

    return bot;
}

function isPlayerOverHangar(scene, hangar) {
    const player = getActivePlayer(scene);
    if (!player || !hangar) return false;
    const dx = typeof wrappedDistance === 'function'
        ? wrappedDistance(hangar.x, player.x, CONFIG.worldWidth)
        : (player.x - hangar.x);
    const dropOffY = hangar.y - 32;
    const dy = player.y - dropOffY;
    return Math.abs(dx) <= HANGAR_DROP_OFF_CONFIG.xRange
        && Math.abs(dy) <= HANGAR_DROP_OFF_CONFIG.yRange;
}

function dropOffCargo(scene, hangar) {
    const cargoCount = window.ShipController?.cargo ?? 0;
    if (cargoCount <= 0) return;
    if (!isPlayerOverHangar(scene, hangar)) return;

    window.ShipController?.resetCargo();

    for (let i = 0; i < cargoCount; i++) {
        const offsetX = Phaser.Math.Between(-HANGAR_DROP_OFF_CONFIG.botSpawnOffset, HANGAR_DROP_OFF_CONFIG.botSpawnOffset);
        const spawnX = wrapValue(hangar.x + offsetX, CONFIG.worldWidth);
        const spawnY = hangar.y - 26 + Phaser.Math.Between(-8, 8);
        spawnBasicShooterBot(scene, spawnX, spawnY);
    }
}

function findNearestEnemy(scene, origin) {
    const { enemies, bosses, battleships } = scene;
    const candidates = [];
    if (enemies) candidates.push(...enemies.children.entries);
    if (bosses) candidates.push(...bosses.children.entries);
    if (battleships) candidates.push(...battleships.children.entries);

    let nearest = null;
    let nearestDist = Infinity;
    candidates.forEach((target) => {
        if (!target || !target.active) return;
        const dx = typeof wrappedDistance === 'function'
            ? wrappedDistance(origin.x, target.x, CONFIG.worldWidth)
            : (target.x - origin.x);
        const dy = target.y - origin.y;
        const dist = Math.hypot(dx, dy);
        if (dist < nearestDist) {
            nearestDist = dist;
            nearest = target;
        }
    });

    return { target: nearest, distance: nearestDist };
}

function updateBasicShooterBots(scene, time) {
    const { friendlies } = scene;
    if (!friendlies || !friendlies.children) return;

    friendlies.children.entries.forEach((bot) => {
        if (!bot || !bot.active || !bot.isBasicShooterBot) return;
        const bob = Math.sin(time * 0.003 + bot.blinkOffset) * 4;
        bot.y = bot.homeY + bob;

        if (time < bot.lastShot + bot.fireCooldown) return;
        const { target, distance } = findNearestEnemy(scene, bot);
        if (!target || distance > BASIC_SHOOTER_BOT_CONFIG.range) return;

        const angle = Phaser.Math.Angle.Between(bot.x, bot.y, target.x, target.y);
        createProjectile(
            scene,
            bot.x,
            bot.y,
            Math.cos(angle) * BASIC_SHOOTER_BOT_CONFIG.projectileSpeed,
            Math.sin(angle) * BASIC_SHOOTER_BOT_CONFIG.projectileSpeed,
            BASIC_SHOOTER_BOT_CONFIG.projectileType,
            BASIC_SHOOTER_BOT_CONFIG.damage
        );
        bot.lastShot = time;
    });
}

function updateHangars(scene, time) {
    const { friendlies } = scene;
    if (!friendlies || !friendlies.children) return;

    friendlies.children.entries.forEach((friendly) => {
        if (!friendly || !friendly.active || !friendly.isHangar) return;
        const pulse = 0.65 + Math.sin(time * 0.004 + friendly.blinkOffset) * 0.25;
        const tintColor = Phaser.Display.Color.Interpolate.ColorWithColor(
            { r: 34, g: 197, b: 94 },
            { r: 14, g: 165, b: 233 },
            100,
            Math.floor(pulse * 100)
        );
        friendly.setTint(Phaser.Display.Color.GetColor(tintColor.r, tintColor.g, tintColor.b));
        friendly.y = friendly.baseY + Math.sin(time * 0.002 + friendly.blinkOffset) * 1.5;
        dropOffCargo(scene, friendly);
    });

    updateBasicShooterBots(scene, time);
}
