# Skyline Survivors – Gap Check

This repo contains a single Phaser 3 scene with two selectable modes (classic waves and timed survival), external HUD, and basic power-ups/enemy waves. The following high-level elements from the Skyline Survivors concept doc are not present in the current codebase:

1. **System/Meta Layer**
   - No system map or multi-node district selection; gameplay starts directly in the side-scrolling scene.
   - No mothership timers, district destruction state, or weapons satellite/shop layer.

2. **Co-op & Ship Forms**
   - Only one player ship is spawned and controlled (no second player, linked turret mode, or form switching between fighter/turret roles).
   - No revive/pilot-pod flow or shared resource pools between players.

3. **Rescue/Comrade Depth**
   - Humans can be rescued for score, but there are no armed comrades, escort/extraction zones, or mutation/reconversion loops.

4. **Weapon & Upgrade Depth**
   - Power-ups cover lasers, drones, shields, missiles, magnet, speed, overdrive, and fire-rate buffs, but there are no branching upgrade paths, satellite positioning, or shop-based build crafting.

5. **Missions, Boss Structure, and Progression**
   - Core loop is a single endless map; there are no district variations (Downtown/Industrial/etc.), challenge missions, boss rush, or endgame enemy-base assault.

6. **UI/UX & Meta Tracking**
   - HUD omits system-layer indicators (flashing threatened nodes, destroyed districts), and there is no meta persistence or cosmetic unlock scaffolding.

These gaps highlight where new systems would need to be introduced to align the prototype with the full design vision.
