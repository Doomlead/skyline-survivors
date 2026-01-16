// ------------------------
// js/ui/missionPlanner.js
// ------------------------

(function() {
    const cities = [
        'Neo Seattle', 'Skyline Prime', 'Aurora City', 'Nightfall Bay', 'Nova Odessa',
        'Celestia Station', 'Obsidian Ridge', 'Atlas Spire', 'Horizon Arc', 'Lumen Harbor'
    ];

    const STORAGE_KEY = 'skyline_district_state';

    const DISTRICT_CONFIGS = [
        {
            id: 'cascadia-ward',
            name: 'Pacific Rim',
            center: { lat: 50, lon: -123 },
            timer: 110,
            color: 0x38bdf8,
            threats: ['drone', 'bomber', 'shield'],
            reward: 'sensor arrays'
        },
        {
            id: 'central-america-bridge',
            name: 'Central America Bridge',
            center: { lat: 12, lon: -86 },
            timer: 125,
            color: 0x4ade80,
            threats: ['lander', 'pod', 'swarmer'],
            reward: 'supply relays'
        },
        {
            id: 'atlantic-frontline',
            name: 'Atlantic Frontline',
            center: { lat: 40, lon: -74 },
            timer: 135,
            color: 0x60a5fa,
            threats: ['drone', 'bomber', 'turret'],
            reward: 'naval caches'
        },
        {
            id: 'carolina-guard',
            name: 'Carolina Guard',
            center: { lat: 34, lon: -78 },
            timer: 115,
            color: 0xf97316,
            threats: ['kamikaze', 'lander', 'seeker'],
            reward: 'strike plans'
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
            id: 'savanna-guardian',
            name: 'Savanna Guardian',
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

    const MOTHERSHIP_CONFIG = {
        id: 'mothership',
        name: 'Mothership',
        reward: 'campaign victory',
        threatMix: ['shield', 'spawner', 'seeker', 'kamikaze', 'bomber'],
        backgroundStyle: 'mothership_exterior'
    };

    let mission = null;
    let districtState = null;
    let battleshipState = null;
    const mapState = { nodes: {}, hasTimerData: false };

    function getDefaultDistrictState(config) {
        const roll = Math.random();
        const status = roll < 0.4 ? 'friendly' : 'occupied';
        return {
            id: config.id,
            status,
            timer: config.timer,
            lastOutcome: null,
            clearedRuns: 0
        };
    }

    function safeLoadState() {
        if (districtState) return districtState;
        let stored = null;
        if (typeof localStorage !== 'undefined') {
            try {
                stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
            } catch (err) {
                stored = null;
            }
        }

        const now = Date.now();
        const lastUpdated = stored?.lastUpdated || now;
        const elapsed = Math.max(0, (now - lastUpdated) / 1000);

        districtState = { lastUpdated: now, districts: {} };
        DISTRICT_CONFIGS.forEach(cfg => {
            const existing = stored?.districts?.[cfg.id];
            const base = existing ? { ...existing } : getDefaultDistrictState(cfg);
            if (base.status === 'threatened') {
                base.timer = Math.max(0, base.timer - elapsed);
                if (base.timer === 0) {
                    base.status = 'occupied';
                    base.lastOutcome = 'failed';
                }
            }
            if (base.status === 'occupied') {
                base.timer = 0;
            }
            districtState.districts[cfg.id] = base;
        });

        return districtState;
    }

    function persistState() {
        if (typeof localStorage === 'undefined' || !districtState) return;
        try {
            const payload = { ...districtState, lastUpdated: Date.now() };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (err) {
            // Ignore persistence errors in environments without storage
        }
    }

    function resetCampaignState() {
        districtState = null;
        battleshipState = null;
        mission = null;
        mapState.nodes = {};
        mapState.hasTimerData = false;
        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (err) {
                // Ignore persistence errors in environments without storage
            }
        }
        safeLoadState();
    }

    function randomCityMission() {
        const districtConfig = Phaser.Utils.Array.GetRandom(DISTRICT_CONFIGS);
        const district = getDistrictState(districtConfig.id);
        const center = getDistrictCenter(districtConfig);
        const longitude = Phaser.Math.Wrap(center.lon || 0, -180, 180);
        const latitude = Phaser.Math.Clamp(center.lat || 0, -85, 85);
        return {
            city: districtConfig.name,
            district: districtConfig.id,
            latitude,
            longitude,
            mode: Phaser.Utils.Array.GetRandom(['classic', 'survival']),
            seed: Phaser.Math.RND.uuid(),
            directives: buildMissionDirectives(districtConfig, district)
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
        if (mode === 'mothership') {
            return selectMothershipMission();
        }
        mission = { ...current, mode };
        const cfg = getDistrictConfigById(mission.district);
        if (cfg) mission.directives = buildMissionDirectives(cfg, getDistrictState(cfg.id), mode);
        return mission;
    }

    function getDistrictConfigById(id) {
        return DISTRICT_CONFIGS.find(d => d.id === id);
    }

    function getDistrictCenter(config) {
        if (!config) return { lat: 0, lon: 0 };
        if (config.center) return config.center;
        if (config.polygon?.length) {
            const sum = config.polygon.reduce((acc, point) => ({
                lat: acc.lat + (point.lat || 0),
                lon: acc.lon + (point.lon || 0)
            }), { lat: 0, lon: 0 });
            const count = config.polygon.length || 1;
            return { lat: sum.lat / count, lon: sum.lon / count };
        }
        return { lat: 0, lon: 0 };
    }

    function getActiveDistrictConfigs() {
        return DISTRICT_CONFIGS.filter(cfg => getDistrictState(cfg.id).status !== 'occupied');
    }

    function pickRandomDistrictId(excludeId = null) {
        const candidates = getActiveDistrictConfigs();
        const pool = candidates.length ? candidates : DISTRICT_CONFIGS;
        const options = excludeId ? pool.filter(cfg => cfg.id !== excludeId) : pool;
        const pickFrom = options.length ? options : pool;
        return Phaser.Utils.Array.GetRandom(pickFrom).id;
    }

    function ensureBattleshipState() {
        if (battleshipState) return battleshipState;
        battleshipState = Array.from({ length: BATTLESHIP_CONFIG.count }).map((_, index) => {
            const fromId = pickRandomDistrictId();
            const toId = pickRandomDistrictId(fromId);
            return {
                id: `battleship-${index + 1}`,
                active: true,
                phase: 'travel',
                fromId,
                toId,
                timer: BATTLESHIP_CONFIG.travelTime,
                lat: 0,
                lon: 0
            };
        });
        return battleshipState;
    }

    function lerpValue(start, end, t) {
        return start + (end - start) * t;
    }

    function tickBattleships(seconds = 0) {
        if (seconds <= 0) return ensureBattleshipState();
        const state = safeLoadState();
        const ships = ensureBattleshipState();
        const attackedDistrictIds = new Set();
        let mutated = false;

        ships.forEach(ship => {
            if (ship.active === false) return;
            if (ship.phase === 'travel') {
                ship.timer -= seconds;
                const progress = Phaser.Math.Clamp(1 - ship.timer / BATTLESHIP_CONFIG.travelTime, 0, 1);
                const fromConfig = getDistrictConfigById(ship.fromId);
                const toConfig = getDistrictConfigById(ship.toId);
                const fromCenter = getDistrictCenter(fromConfig);
                const toCenter = getDistrictCenter(toConfig);
                ship.lat = lerpValue(fromCenter.lat, toCenter.lat, progress);
                ship.lon = lerpValue(fromCenter.lon, toCenter.lon, progress);
                if (ship.timer <= 0) {
                    ship.phase = 'assault';
                    ship.timer = BATTLESHIP_CONFIG.assaultTime;
                    ship.fromId = ship.toId;
                }
            } else if (ship.phase === 'assault') {
                ship.timer -= seconds;
                const targetId = ship.fromId;
                const targetState = state.districts[targetId];
                const targetConfig = getDistrictConfigById(targetId);
                const targetCenter = getDistrictCenter(targetConfig);
                ship.lat = targetCenter.lat;
                ship.lon = targetCenter.lon;
                if (targetState?.status === 'occupied' || targetState?.lastOutcome === 'cleared') {
                    ship.active = false;
                    ship.timer = 0;
                    return;
                }
                attackedDistrictIds.add(targetId);

                if (targetState && targetState.status !== 'occupied') {
                    if (targetState.status === 'friendly') {
                        targetState.status = 'threatened';
                        targetState.timer = targetConfig?.timer || targetState.timer;
                    }
                    const drain = seconds * BATTLESHIP_CONFIG.assaultDrain;
                    const nextTimer = Math.max(0, targetState.timer - drain);
                    if (nextTimer !== targetState.timer) {
                        targetState.timer = nextTimer;
                        if (targetState.timer === 0) {
                            targetState.status = 'occupied';
                            targetState.lastOutcome = 'failed';
                            ship.active = false;
                            ship.timer = 0;
                        }
                        mutated = true;
                    }
                }

                if (ship.timer <= 0) {
                    ship.phase = 'travel';
                    ship.toId = pickRandomDistrictId(ship.fromId);
                    ship.timer = BATTLESHIP_CONFIG.travelTime;
                }
            }
        });

        Object.entries(state.districts).forEach(([id, entry]) => {
            const underAttack = attackedDistrictIds.has(id);
            if (entry.underAttack !== underAttack) {
                entry.underAttack = underAttack;
                mutated = true;
            }
        });

        if (mutated) {
            state.lastUpdated = Date.now();
            persistState();
        }

        return ships;
    }

    function getBattleships() {
        return ensureBattleshipState();
    }

    function retireBattleshipsForDistrict(districtId) {
        if (!districtId) return;
        const ships = ensureBattleshipState();
        ships.forEach(ship => {
            if (ship.active === false) return;
            if (ship.phase === 'assault' && ship.fromId === districtId) {
                ship.active = false;
                ship.timer = 0;
            }
        });
    }

    function selectDistrict(name, longitudeOverride = null, providedState = null) {
        const current = ensureMission();
        const config = DISTRICT_CONFIGS.find(d => d.name === name || d.id === name);
        const center = getDistrictCenter(config);
        const longitude = Phaser.Math.Wrap(
            longitudeOverride !== null ? longitudeOverride : (center.lon || 0),
            -180,
            180
        );
        const latitude = Phaser.Math.Clamp(center.lat || 0, -85, 85);
        const districtId = config?.id || name;
        const state = providedState ? updateDistrictState(districtId, providedState) : getDistrictState(districtId);
        const directives = config ? buildMissionDirectives(config, state, current.mode) : current.directives;
        mission = {
            ...current,
            city: config?.name || name,
            district: districtId,
            longitude,
            latitude,
            seed: current.seed || Phaser.Math.RND.uuid(),
            directives,
            districtState: state
        };
        return mission;
    }

    function getDistrictState(id) {
        const state = safeLoadState();
        if (!state.districts[id]) {
            const cfg = getDistrictConfigById(id);
            state.districts[id] = cfg ? getDefaultDistrictState(cfg) : { id, status: 'friendly', timer: 90 };
        }
        return state.districts[id];
    }

    function updateDistrictState(id, patch) {
        const state = safeLoadState();
        const existing = getDistrictState(id);
        state.districts[id] = { ...existing, ...patch };
        state.lastUpdated = Date.now();
        persistState();
        return state.districts[id];
    }

    function getAllDistrictStates() {
        safeLoadState();
        return DISTRICT_CONFIGS.map(cfg => ({ config: cfg, state: getDistrictState(cfg.id) }));
    }

    function areAllDistrictsFriendly() {
        const state = safeLoadState();
        return Object.values(state.districts).every(entry => entry.status === 'friendly');
    }

    function buildMissionDirectives(config, state, modeOverride = null) {
        if (!config || !state) return null;
        const timerRatio = config.timer > 0 ? Math.max(0, state.timer) / config.timer : 0;
        const urgency = state.status === 'occupied'
            ? 'occupied'
            : state.status === 'friendly'
                ? 'stable'
                : timerRatio < 0.35 ? 'critical' : 'threatened';
        const rewardMultiplier = urgency === 'occupied' ? 1.5 : urgency === 'critical' ? 1.25 : 1;
        const spawnMultiplier = urgency === 'occupied' ? 1.35 : urgency === 'critical' ? 1.15 : 1;
        const humans = urgency === 'occupied' ? 10 : urgency === 'critical' ? 18 : 15;
        const focusedTypes = [...config.threats];
        if (urgency !== 'threatened' && urgency !== 'stable') {
            focusedTypes.push('bomber', 'kamikaze');
        }
        if (urgency === 'occupied') {
            focusedTypes.push('shield', 'spawner');
        }

        const threatMix = focusedTypes.map(type => ({ type, weight: 2 }));
        threatMix.push({ type: 'lander', weight: 1 });
        threatMix.push({ type: 'mutant', weight: 1 });

        return {
            districtId: config.id,
            districtName: config.name,
            reward: config.reward,
            urgency,
            rewardMultiplier,
            spawnMultiplier,
            humans,
            timer: state.timer,
            status: state.status,
            mode: modeOverride,
            districtState: { ...state },
            threatMix
        };
    }

    function buildMothershipDirectives() {
        const threatMix = MOTHERSHIP_CONFIG.threatMix.map(type => ({ type, weight: 2 }));
        return {
            districtId: MOTHERSHIP_CONFIG.id,
            districtName: MOTHERSHIP_CONFIG.name,
            reward: MOTHERSHIP_CONFIG.reward,
            urgency: 'final',
            rewardMultiplier: 2.5,
            spawnMultiplier: 1.4,
            humans: 0,
            timer: null,
            status: 'core breached',
            mode: 'mothership',
            missionType: 'mothership',
            bossKey: 'mothershipCore',
            backgroundStyle: MOTHERSHIP_CONFIG.backgroundStyle,
            threatMix
        };
    }

    function tickDistricts(seconds = 0) {
        const state = safeLoadState();
        let mutated = false;
        Object.values(state.districts).forEach((entry) => {
            if (entry.status !== 'threatened') return;
            if (entry.timer > 0 && seconds > 0) {
                entry.timer = Math.max(0, entry.timer - seconds);
                mutated = true;
            }
            if (entry.timer === 0 && entry.status !== 'occupied') {
                entry.status = 'occupied';
                mutated = true;
            }
        });
        if (mutated) {
            state.lastUpdated = Date.now();
            persistState();
        }
    }

    function recordMissionOutcome(success) {
        const currentMission = mission;
        if (!currentMission?.district) return;
        const cfg = getDistrictConfigById(currentMission.district);
        const state = getDistrictState(currentMission.district);
        if (!cfg) return;

        if (success) {
            state.status = 'friendly';
            state.timer = cfg.timer + 60;
            state.clearedRuns = (state.clearedRuns || 0) + 1;
            state.lastOutcome = 'cleared';
            retireBattleshipsForDistrict(currentMission.district);
        } else {
            state.lastOutcome = 'failed';
            state.status = 'occupied';
            state.timer = 0;
            retireBattleshipsForDistrict(currentMission.district);
        }

        districtState.lastUpdated = Date.now();
        persistState();
        mission = {
            ...currentMission,
            directives: buildMissionDirectives(cfg, state, currentMission.mode),
            districtState: { ...state }
        };
    }

    function prepareLaunchPayload(mode) {
        if (mode === 'mothership' || mission?.district === 'mothership') {
            const mothershipMission = selectMothershipMission();
            return {
                ...mothershipMission,
                mode: 'mothership',
                directives: mothershipMission.directives,
                districtState: null,
                mapState
            };
        }
        const requestedMode = mode || ensureMission().mode || 'classic';
        const current = setMode(requestedMode);
        const cfg = getDistrictConfigById(current.district);
        const state = cfg ? getDistrictState(cfg.id) : null;
        const effectiveMode = state?.status === 'occupied' ? 'assault' : current.mode;
        return {
            ...current,
            mode: effectiveMode,
            directives: cfg ? buildMissionDirectives(cfg, state, effectiveMode) : current.directives,
            districtState: state ? { ...state } : null,
            mapState
        };
    }

    function selectMothershipMission() {
        mission = {
            city: MOTHERSHIP_CONFIG.name,
            district: MOTHERSHIP_CONFIG.id,
            longitude: 0,
            latitude: 0,
            mode: 'mothership',
            seed: Phaser.Math.RND.uuid(),
            directives: buildMothershipDirectives(),
            districtState: null
        };
        return mission;
    }

    function ensureMapNodeState(config) {
        const existing = mapState.nodes[config.id];
        if (existing) return existing;
        const status = config.timer > 0 ? 'threatened' : 'stable';
        mapState.nodes[config.id] = {
            id: config.id,
            label: config.label,
            timer: config.timer || 0,
            status,
            rewardModifier: config.rewardModifier || 1,
            spawnModifier: config.spawnModifier || 1,
            lastUpdated: Date.now()
        };
        return mapState.nodes[config.id];
    }

    function setMapTimerDataAvailable(hasTimerData) {
        mapState.hasTimerData = !!hasTimerData;
        return mapState.hasTimerData;
    }

    function updateMapNodeState(id, patch = {}) {
        const node = mapState.nodes[id];
        if (!node) return null;
        mapState.nodes[id] = { ...node, ...patch, lastUpdated: Date.now() };
        return mapState.nodes[id];
    }

    function getMapNodeState(id) {
        return mapState.nodes[id] || null;
    }

    function getMapState() {
        return mapState;
    }

    function hasMapTimerData() {
        return !!mapState.hasTimerData;
    }

    window.missionPlanner = {
        ensureMission,
        getMission,
        rerollCity,
        setMode,
        selectDistrict,
        selectMothershipMission,
        getDistrictConfigs: () => DISTRICT_CONFIGS,
        getAllDistrictStates,
        areAllDistrictsFriendly,
        getDistrictState,
        updateDistrictState,
        buildMissionDirectives,
        resetCampaignState,
        recordMissionOutcome,
        prepareLaunchPayload,
        tickDistricts,
        ensureMapNodeState,
        updateMapNodeState,
        getMapNodeState,
        getMapState,
        hasMapTimerData,
        setMapTimerDataAvailable,
        tickBattleships,
        getBattleships
    };
})();
