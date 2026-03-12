# Skyline Survivors — Standalone Python Edition

This repository now includes a standalone Python application that recreates the core top-down survival gameplay loop from the original browser game:

- Player ship movement (WASD/arrow keys)
- Mouse aiming + click-to-fire projectiles
- Enemy waves with escalating pressure
- Score tracking and wave progression
- Health pickups (powerups)
- Game over state

## Run

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m python_game.main
```

## Controls

- **Move:** `WASD` or arrow keys
- **Shoot:** Left mouse button
- **Exit:** `Esc`

## Files

- `python_game/main.py`: startup entrypoint
- `python_game/game.py`: pygame runtime/rendering loop
- `python_game/entities.py`: gameplay simulation state + rules
- `python_game/config.py`: tuning constants
