// ------------------------
// Hangar Behavior - Friendly Idle + Beacon Pulse
// ------------------------

function updateHangars(scene, delta) {
    const { friendlies } = scene;
    if (!friendlies || !friendlies.children || !friendlies.children.entries) return;

    friendlies.children.entries.forEach((friendly) => {
        if (!friendly.active || friendly.friendlyType !== 'hangar') return;
        const groundY = getHangarGroundY(scene, friendly.x);
        friendly.y = groundY;
        friendly.setVelocity(0, 0);

        if (typeof friendly.beaconTimer === 'number') {
            friendly.beaconTimer += delta;
            const pulse = 0.8 + 0.2 * Math.sin(friendly.beaconTimer / 350);
            friendly.setAlpha(pulse);
        }
    });
}
