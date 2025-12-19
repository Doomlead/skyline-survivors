# Skyline Survivors – Design Gap Analysis

Scope: Differences between the playable prototype and the core goals outlined in `DesignDocument.txt` (system map + Defender-style loop, co-op turret play, meta progression, branching upgrades, accessibility).

1. **System/Meta Layer & District Stakes**
   - A live district/state pipeline exists (missionPlanner + build scene) with timers, urgency-based directives, and localStorage persistence, but the system map still lacks mothership movement, branching threat routes, or consequences beyond static timers/destroyed status.
   - District selection already seeds mission directives and rewards based on urgency, yet there is no longer-range escalation loop (roaming threats, node-to-node incursions) or unlock path toward the enemy base assault.
   - The build layer provides mission prep and orbit-node callouts, but there is no shop/meta economy or persistence of resources and fallout across districts.

2. **Co-op, Ship Forms, and Survival Loops**
   - Only single-ship play exists; there is no two-player flow, shared resources, or revive/pilot-pod mechanics.
   - Turret form, linked turret behavior, and fighter↔turret switching are missing.
   - No co-op-specific UI hooks (dual HUD, radar clarity, silhouettes) mentioned in the design goals.

3. **Rescue/Comrade Systems**
   - Rescues only grant score; comrades do not fight alongside the player, hang from the ship, or require escort/extraction loops.
   - No mutation/reconversion mechanics or district-based rescue stakes that influence system outcomes.

4. **Weapons, Upgrades, and Build Crafting**
   - Power-ups are linear and temporary; there are no branching upgrade paths, satellite positioning, or shop-driven builds tied to the build screen.
   - Weapon tuning levers from the design (capsule vs surface pickups, satellite shop) are not represented.

5. **Missions, Bosses, and Progression Flow**
   - Only a single endless side-scrolling map exists; district-biome variations, challenge missions, boss rush, and the enemy base assault are missing.
   - Clearing thresholds that unlock the base assault and difficulty scaling from destroyed districts are not implemented.

6. **UI/UX & Meta Feedback**
   - HUD lacks system-layer indicators (flashing threatened nodes, destroyed districts) and post-mission summaries.
   - No persistence scaffolding for unlocks, cosmetics, or difficulty modifiers tied to system performance.

7. **Options & Accessibility**
   - Prototype has no volume sliders, key remapping, screen-flash reduction, or color-blind options described in the design document.

These gaps remain the highest-impact areas to build toward the full Strike Force–inspired design vision.
