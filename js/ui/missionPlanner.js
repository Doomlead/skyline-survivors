// ------------------------
// mission planner
// ------------------------

(function() {
    const cities = [
        'Neo Seattle', 'Skyline Prime', 'Aurora City', 'Nightfall Bay', 'Nova Odessa',
        'Celestia Station', 'Obsidian Ridge', 'Atlas Spire', 'Horizon Arc', 'Lumen Harbor'
    ];

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
        }
    ];

    const BATTLESHIP_CONFIG = {
        count: 2,
        travelTime: 26,
        assaultTime: 18,
        assaultDrain: 1.6
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
        } else {
            state.lastOutcome = 'failed';
            state.status = 'occupied';
            state.timer = 0;
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
        getDistrictConfigs: () => DISTRICT_CONFIGS,
        getAllDistrictStates,
        areAllDistrictsFriendly,
        getDistrictState,
        updateDistrictState,
        buildMissionDirectives,
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
