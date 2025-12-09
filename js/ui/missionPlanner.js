(function() {
    const cities = [
        'Neo Seattle', 'Skyline Prime', 'Aurora City', 'Nightfall Bay', 'Nova Odessa',
        'Celestia Station', 'Obsidian Ridge', 'Atlas Spire', 'Horizon Arc', 'Lumen Harbor'
    ];

    let mission = null;

    function randomCityMission() {
        return {
            city: Phaser.Utils.Array.GetRandom(cities),
            latitude: Phaser.Math.FloatBetween(-70, 70),
            longitude: Phaser.Math.FloatBetween(-170, 170),
            mode: Phaser.Utils.Array.GetRandom(['classic', 'survival']),
            seed: Phaser.Math.RND.uuid(),
            district: null
        };
    }

    function ensureMission() {
        if (!mission) {
            mission = randomCityMission();
        }
        return mission;
    }

    function getMission() {
        return ensureMission();
    }

    function rerollCity() {
        const current = ensureMission();
        const newMission = randomCityMission();
        newMission.mode = current.mode;
        mission = newMission;
        return mission;
    }

    function setMode(mode) {
        const current = ensureMission();
        mission = { ...current, mode };
        return mission;
    }

    function selectDistrict(name, angleDegrees = null) {
        const current = ensureMission();
        const angle = angleDegrees !== null ? angleDegrees : Phaser.Math.FloatBetween(-180, 180);
        // Map the angular position to rough lat/long coordinates for flavor.
        const longitude = Phaser.Math.Wrap(angle, -180, 180);
        const latitude = Phaser.Math.Clamp(Math.sin(Phaser.Math.DegToRad(angle)) * 80, -80, 80);
        mission = {
            ...current,
            city: name,
            district: name,
            longitude,
            latitude,
            seed: current.seed || Phaser.Math.RND.uuid()
        };
        return mission;
    }

    window.missionPlanner = {
        ensureMission,
        getMission,
        rerollCity,
        setMode,
        selectDistrict
    };
})();
