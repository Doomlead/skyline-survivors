# Skyline Survivors – Design Gap Analysis

Scope: Differences between the playable prototype and the core goals outlined in `DesignDocument.txt` (system map + Defender-style loop, co-op turret play, meta progression, branching upgrades, accessibility).

1. **System/Meta Layer & District Stakes**
   - Implemented: District globe with selectable nodes + persistent timers/states (threatened, cleared, destroyed), mission directives that feed reward/spawn multipliers + human counts + HUD labels, and a between-mission build/shop panel with credits + loadout unlocks. Orbit nodes (mothership/shop/relay/distress) are drawn and selectable.
   - Missing: Roaming mothership pressure, branching system-map progression toward a base assault, functional orbit nodes (shop/mothership/base logic), and campaign-scale escalation hooks that react to district loss beyond current reward/spawn scaling.

2. **Co-op, Ship Forms, and Survival Loops**
   - Current prototype is single-player only; no two-player flow, shared resources, revive/pilot-pod loop, or linked fighter–turret co-op play.
   - Fighter ↔ guardian form switching is implemented (slower, heavier guardian with 360° aim), but there is no distinct turret-mode weapon suite, energy system, or co-op support tied to the form change.

3. **Rescue/Comrade Systems**
   - Humans exist as abduction targets; rescues award score/power-up drops but do not add armed comrades, hanging gun pods, or escort/extraction steps.
   - Mutation/reconversion loops, comrade roles (medic/engineer/turret), and district-level rescue stakes that affect the system layer are absent.

4. **Weapons, Upgrades, and Build Crafting**
   - 16 power-up types (lasers, drones, shields, missiles, overdrive, etc.) offer temporary buffs, homing missiles, and orbiting drones via randomized drops, plus between-mission loadout unlocks and shop purchases.
   - Missing branching upgrade paths, satellite positioning/detachment mechanics, explicit combo-driven power synergies, and persistent weapon path planning beyond the current loadout toggle.

5. **Missions, Bosses, and Progression Flow**
   - Classic and survival deployments launch from the district map; directives weight enemy mixes and adjust human counts/reward multipliers, and classic mode uses a boss queue with multiple boss variants.
   - Still only one biome and mission template; no district-specific hazards, mini-boss variants tied to system-map nodes, base-assault unlocks, or daily/weekly challenge or boss-rush modes.

6. **UI/UX & Meta Feedback**
   - HUD shows district name/urgency/reward multipliers alongside radar, and pause/menu overlays expose audio + flash-reduction toggles; the district map HUD reflects timers, status, credits, and equipped loadouts.
   - Missing co-op HUD affordances, post-mission debriefs that reflect district fallout and meta progression, and in-mission indicators for destroyed/pressured nodes beyond basic timers.

7. **Options & Accessibility**
   - Volume sliders, mute, and reduce-screen-flashes toggles persist across sessions via menu and pause overlays.
   - Missing key remapping, color-blind palettes, subtitles/captions, and quick accessibility presets or scalable UI options.

These gaps remain the highest-impact areas to build toward the full Strike Force–inspired design vision.
