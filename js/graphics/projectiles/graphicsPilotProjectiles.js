// ------------------------
// Pilot Projectile Graphics - On-foot weapon projectile textures
// ------------------------

function createPilotProjectileGraphics(scene) {
    // Combat Rifle projectile
    const rifle = scene.add.graphics();
    rifle.fillStyle(0x66ccff, 0.2);
    rifle.fillEllipse(8, 4, 16, 8);
    rifle.fillStyle(0xaaddff, 1);
    rifle.fillEllipse(9, 4, 10, 4);
    rifle.fillStyle(0xffffff, 1);
    rifle.fillCircle(13, 4, 1.5);
    rifle.generateTexture('pilot_projectile_rifle', 16, 8);
    rifle.destroy();

    // Scattergun pellet
    const scatter = scene.add.graphics();
    scatter.fillStyle(0xffaa33, 0.4);
    scatter.fillCircle(5, 5, 5);
    scatter.fillStyle(0xffdd88, 1);
    scatter.fillCircle(5, 5, 3.2);
    scatter.fillStyle(0xffffff, 0.9);
    scatter.fillCircle(6, 4, 1.2);
    scatter.generateTexture('pilot_projectile_scatter', 10, 10);
    scatter.destroy();

    // Plasma launcher projectile
    const plasma = scene.add.graphics();
    plasma.fillStyle(0xcc44ff, 0.2);
    plasma.fillCircle(10, 10, 10);
    plasma.fillStyle(0xaa22ee, 0.9);
    plasma.fillCircle(10, 10, 7);
    plasma.fillStyle(0xffbbff, 0.9);
    plasma.fillCircle(10, 10, 4);
    plasma.fillStyle(0xffffff, 0.9);
    plasma.fillCircle(11, 9, 1.8);
    plasma.generateTexture('pilot_projectile_plasma', 20, 20);
    plasma.destroy();

    // Lightning bolt projectile
    const lightning = scene.add.graphics();
    lightning.fillStyle(0x55ddff, 0.25);
    lightning.fillEllipse(14, 6, 28, 12);
    lightning.fillStyle(0x99eeff, 1);
    lightning.beginPath();
    lightning.moveTo(3, 6);
    lightning.lineTo(10, 2);
    lightning.lineTo(12, 5);
    lightning.lineTo(18, 3);
    lightning.lineTo(15, 8);
    lightning.lineTo(21, 6);
    lightning.lineTo(25, 6);
    lightning.lineTo(17, 10);
    lightning.lineTo(14, 8);
    lightning.lineTo(8, 10);
    lightning.closePath();
    lightning.fillPath();
    lightning.fillStyle(0xffffff, 0.9);
    lightning.fillEllipse(21, 6, 5, 2);
    lightning.generateTexture('pilot_projectile_lightning', 28, 12);
    lightning.destroy();

    // Stinger drone pulse
    const stinger = scene.add.graphics();
    stinger.lineStyle(1, 0x88ffcc, 0.8);
    stinger.strokeCircle(7, 7, 6);
    stinger.fillStyle(0x22cc88, 0.9);
    stinger.fillCircle(7, 7, 4.2);
    stinger.fillStyle(0xb8ffe8, 0.9);
    stinger.fillCircle(7, 7, 2);
    stinger.generateTexture('pilot_projectile_stinger', 14, 14);
    stinger.destroy();
}
