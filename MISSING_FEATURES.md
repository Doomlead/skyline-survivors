# Skyline Survivors – Gap Check

This repo now includes a menu scene and a system-map/build scene (district selector) in addition to the side-scrolling combat scene, plus an external HUD and the classic/survival mode toggle. The following high-level elements from the Skyline Survivors concept doc are still missing or only partially represented:

1. **System/Meta Layer**
   - The district map UI is present but purely cosmetic: district timers do not drive threats, nodes do not unlock or persist, and selecting a district does not seed mission parameters or rewards.
   - No mothership timers, district destruction state, or build/shop layer that carries over between runs.

2. **Co-op & Ship Forms**
   - Gameplay remains single-ship; there is no second player, no linked turret form, and no fighter/turret role switching.
   - No revive/pilot-pod flow, shared resource pools, or co-op-specific UI hooks.

3. **Rescue/Comrade Depth**
   - Humans can be rescued for score, but there are no armed comrades, escort/extraction zones, or mutation/reconversion loops tied to districts or missions.

4. **Weapon & Upgrade Depth**
   - Power-ups cover lasers, drones, shields, missiles, magnet, speed, overdrive, and fire-rate buffs, but there are no branching upgrade paths, satellite positioning, or shop-based build crafting tied to the build screen.

5. **Missions, Boss Structure, and Progression**
   - Core loop is a single endless map regardless of district choice; there are no district variations (Downtown/Industrial/etc.), challenge missions, boss rush, or endgame enemy-base assault tied to the system map.

6. **UI/UX & Meta Tracking**
   - HUD omits system-layer indicators (flashing threatened nodes, destroyed districts), and there is no meta persistence, unlock scaffolding, or summary of district outcomes after missions.

7. **Options & Accessibility**
   - There are no volume sliders, key remapping, screen-flash reduction, or color-blind accessibility options to tailor the experience for different players.

These gaps highlight where new systems would need to be introduced to align the prototype with the full design vision.
