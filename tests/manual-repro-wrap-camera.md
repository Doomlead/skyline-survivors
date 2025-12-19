## Camera wrap regression manual repro

Purpose: verify the camera recenters on the player when crossing world edges so the ship stays on-screen after world renormalization.

### Steps
1. Launch the game normally (`npm test` is not required for this manual check).
2. Fly the player ship to the far right edge of the world until it wraps to the left.
3. Observe that the camera recenters immediately and the ship stays visible rather than jumping off-screen.
4. Repeat by flying to the far left edge to wrap to the right and confirm the camera recenters the same way.

Expected: After either edge wrap, the camera keeps the player on-screen without leaving `scrollX` unchanged at the old world position.
