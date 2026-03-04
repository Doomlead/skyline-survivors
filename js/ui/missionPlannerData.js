// ----------------------------
// js/ui/missionPlannerData.js
// ----------------------------

(function() {
    const STORAGE_KEY = 'skyline_district_state';

    const DISTRICT_CONFIGS = [
        {
            id: 'pacific-rim-bastion',
            name: 'Pacific Rim Bastion',
            center: { lat: 38, lon: -134 },
            polygon: [
                { lat: 62, lon: -155 },
                { lat: 45, lon: -160 },
                { lat: 32, lon: -140 },
                { lat: 18, lon: -125 },
                { lat: 28, lon: -105 },
                { lat: 50, lon: -115 }
            ],
            timer: 120,
            color: 0x22e0ff,
            threats: ['lander', 'mutant', 'drone'],
            reward: 'tech caches'
        },
        {
            id: 'cascadia-ward',
            name: 'Cascadia Ward',
            center: { lat: 50, lon: -123 },
            timer: 110,
            color: 0x38bdf8,
            threats: ['drone', 'bomber', 'shield'],
            reward: 'sensor arrays'
        },
        {
            id: 'sonoran-crescent',
            name: 'Sonoran Crescent',
            center: { lat: 31, lon: -111 },
            timer: 130,
            color: 0xf97316,
            threats: ['kamikaze', 'lander', 'pod'],
            reward: 'reactor coolant'
        },
        {
            id: 'andes-ward',
            name: 'Andes Ward',
            center: { lat: -15, lon: -72 },
            timer: 160,
            color: 0x22d3ee,
            threats: ['mutant', 'baiter', 'seeker'],
            reward: 'recon uplinks'
        },
        {
            id: 'amazonium-belt',
            name: 'Amazonium Belt',
            center: { lat: -4, lon: -60 },
            timer: 140,
            color: 0x4ade80,
            threats: ['lander', 'swarmer', 'pod'],
            reward: 'bio samples'
        },
        {
            id: 'nordic-fjordwall',
            name: 'Nordic Fjordwall',
            center: { lat: 62, lon: 10 },
            timer: 150,
            color: 0x818cf8,
            threats: ['turret', 'drone', 'shielder'],
            reward: 'cryogenic cores'
        },
        {
            id: 'atlantic-arc',
            name: 'Atlantic Arc',
            center: { lat: 48, lon: -5 },
            polygon: [
                { lat: 65, lon: -30 },
                { lat: 55, lon: -15 },
                { lat: 48, lon: 10 },
                { lat: 35, lon: -5 },
                { lat: 42, lon: -40 }
            ],
            timer: 150,
            color: 0x7c3aed,
            threats: ['lander', 'bomber', 'turret'],
            reward: 'energy cells'
        },
        {
            id: 'mediterranean-bastion',
            name: 'Mediterranean Bastion',
            center: { lat: 38, lon: 14 },
            timer: 120,
            color: 0x14b8a6,
            threats: ['drone', 'shield', 'kamikaze'],
            reward: 'orbital relays'
        },
        {
            id: 'balkan-vanguard',
            name: 'Balkan Vanguard',
            center: { lat: 44, lon: 21 },
            timer: 95,
            color: 0xf59e0b,
            threats: ['lander', 'mutant', 'turret'],
            reward: 'ballistics'
        },
        {
            id: 'sahara-gate',
            name: 'Sahara Gate',
            center: { lat: 18, lon: 15 },
            polygon: [
                { lat: 28, lon: -10 },
                { lat: 25, lon: 20 },
                { lat: 10, lon: 25 },
                { lat: 5, lon: -5 },
                { lat: 20, lon: -30 }
            ],
            timer: 180,
            color: 0x10b981,
            threats: ['lander', 'shield', 'shielder'],
            reward: 'defense cores'
        },
        {
            id: 'nile-sentinel',
            name: 'Nile Sentinel',
            center: { lat: 26, lon: 31 },
            timer: 115,
            color: 0xeab308,
            threats: ['bomber', 'seeker', 'kamikaze'],
            reward: 'shield batteries'
        },
        {
            id: 'congo-ring',
            name: 'Congo Ring',
            center: { lat: -2, lon: 23 },
            timer: 150,
            color: 0x10b981,
            threats: ['swarmer', 'baiter', 'pod'],
            reward: 'supply caches'
        },
        {
            id: 'savanna-bulwark',
            name: 'Savanna Bulwark',
            center: { lat: -10, lon: 35 },
            timer: 135,
            color: 0x22c55e,
            threats: ['lander', 'drone', 'kamikaze'],
            reward: 'drone optics'
        },
        {
            id: 'indus-line',
            name: 'Indus Line',
            center: { lat: 22, lon: 80 },
            polygon: [
                { lat: 35, lon: 60 },
                { lat: 32, lon: 90 },
                { lat: 15, lon: 105 },
                { lat: 5, lon: 75 },
                { lat: 20, lon: 55 }
            ],
            timer: 90,
            color: 0xfbbf24,
            threats: ['drone', 'kamikaze', 'seeker'],
            reward: 'forge alloys'
        },
        {
            id: 'himalayan-veil',
            name: 'Himalayan Veil',
            center: { lat: 30, lon: 90 },
            timer: 125,
            color: 0x60a5fa,
            threats: ['shielder', 'turret', 'seeker'],
            reward: 'reactive armor'
        },
        {
            id: 'mekong-front',
            name: 'Mekong Front',
            center: { lat: 14, lon: 105 },
            timer: 105,
            color: 0x34d399,
            threats: ['drone', 'lander', 'pod'],
            reward: 'nano repair kits'
        },
        {
            id: 'siberian-watch',
            name: 'Siberian Watch',
            center: { lat: 60, lon: 100 },
            timer: 170,
            color: 0xa3e635,
            threats: ['bomber', 'turret', 'mutant'],
            reward: 'thermal cores'
        },
        {
            id: 'archipelago-guard',
            name: 'Archipelago Guard',
            center: { lat: -3, lon: 120 },
            timer: 155,
            color: 0x2dd4bf,
            threats: ['baiter', 'swarmer', 'pod'],
            reward: 'navigation chips'
        },
        {
            id: 'austral-shield',
            name: 'Austral Shield',
            center: { lat: -22, lon: 135 },
            polygon: [
                { lat: -10, lon: 110 },
                { lat: -35, lon: 115 },
                { lat: -40, lon: 150 },
                { lat: -15, lon: 160 },
                { lat: -5, lon: 135 }
            ],
            timer: 200,
            color: 0xef4444,
            threats: ['pod', 'swarmer', 'baiter'],
            reward: 'stealth intel'
        },
        {
            id: 'tasman-echo',
            name: 'Tasman Echo',
            center: { lat: -42, lon: 147 },
            timer: 145,
            color: 0xfb7185,
            threats: ['drone', 'bomber', 'shield'],
            reward: 'signal boosters'
        },
        {
            id: 'new-zealot-reef',
            name: 'New Zealot Reef',
            center: { lat: -41, lon: 174 },
            timer: 125,
            color: 0x38bdf8,
            threats: ['pod', 'kamikaze', 'seeker'],
            reward: 'plasma conduits'
        },
        {
            id: 'southern-cross',
            name: 'Southern Cross',
            center: { lat: -34, lon: 20 },
            timer: 165,
            color: 0x4f46e5,
            threats: ['lander', 'mutant', 'shielder'],
            reward: 'gravity anchors'
        }
    ];

    const BATTLESHIP_CONFIG = {
        count: 2,
        travelTime: 26,
        assaultTime: 18,
        assaultDrain: 1.6
    };
    const CRITICAL_WINDOW_SECONDS = 30;
    const PROSPERITY_CONFIG = {
        maxLevel: 6,
        gainPerSecond: 0.02,
        bonusPerLevel: 0.06,
        lossFlashSeconds: 14
    };

    const MOTHERSHIP_CONFIG = {
        id: 'mothership',
        name: 'Mothership',
        reward: 'campaign victory',
        threatMix: ['shield', 'spawner', 'seeker', 'kamikaze', 'bomber'],
        backgroundStyle: 'mothership_exterior'
    };

    window.missionPlannerData = {
        STORAGE_KEY,
        DISTRICT_CONFIGS,
        BATTLESHIP_CONFIG,
        CRITICAL_WINDOW_SECONDS,
        PROSPERITY_CONFIG,
        MOTHERSHIP_CONFIG
    };
})();
