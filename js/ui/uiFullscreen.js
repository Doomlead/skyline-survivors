// ------------------------
// File: js/ui/uiFullscreen.js
// ------------------------

const FullscreenController = (function() {
    let radarContainer;
    let radarOriginalParent;
    let radarOriginalNextSibling;
    let radarSlot;
    let hudContainer;
    let hudOriginalParent;
    let hudOriginalNextSibling;
    let fullscreenTarget;
    let toggleButtons;

    /**
     * Handles the init routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function init() {
        radarContainer = document.getElementById('radar-container');
        radarSlot = document.getElementById('gameplay-radar-slot');
        hudContainer = document.getElementById('hud-container');
        fullscreenTarget = document.getElementById('gameplay-shell');
        toggleButtons = [
            document.getElementById('fullscreen-toggle'),
            document.getElementById('fullscreen-overlay-toggle')
        ].filter(Boolean);

        if (!fullscreenTarget || toggleButtons.length === 0) {
            return;
        }

        if (!document.fullscreenEnabled) {
            toggleButtons.forEach((button) => {
                button.disabled = true;
                button.textContent = 'Fullscreen Unavailable';
            });
            return;
        }

        toggleButtons.forEach((button) => {
            button.addEventListener('click', handleToggle);
        });

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        handleFullscreenChange();
    }

    /**
     * Handles the isGameLayoutActive routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function isGameLayoutActive() {
        // Check if we're in district layout mode
        if (typeof DistrictLayoutManager !== 'undefined') {
            const currentLayout = DistrictLayoutManager.getCurrentLayout();
            if (currentLayout === 'district') {
                return false;
            }
        }
        
        // Additional check: ensure game-layout is visible
        const gameLayout = document.getElementById('game-layout');
        if (gameLayout && gameLayout.style.display === 'none') {
            return false;
        }
        
        return true;
    }

    /**
     * Handles the handleToggle routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function handleToggle() {
        // Prevent fullscreen operations when in district layout
        if (!isGameLayoutActive()) {
            console.warn('[Fullscreen] Cannot toggle fullscreen while in district layout');
            return;
        }
        
        if (document.fullscreenElement) {
            exitFullscreen();
        } else {
            enterFullscreen();
        }
    }

    /**
     * Handles the enterFullscreen routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function enterFullscreen() {
        // Double-check we're in game layout before entering fullscreen
        if (!isGameLayoutActive()) {
            console.warn('[Fullscreen] Cannot enter fullscreen while in district layout');
            return;
        }
        
        if (!fullscreenTarget?.requestFullscreen) return;
        fullscreenTarget.requestFullscreen();
    }

    /**
     * Handles the exitFullscreen routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function exitFullscreen() {
        if (!document.exitFullscreen) return;
        document.exitFullscreen();
    }

    /**
     * Handles the handleFullscreenChange routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function handleFullscreenChange() {
        const isActive = document.fullscreenElement === fullscreenTarget;
        
        // If we're exiting fullscreen OR if we're in district layout, ensure fullscreen class is removed
        if (!isActive || !isGameLayoutActive()) {
            const wasFullscreen = document.body.classList.contains('fullscreen-active');
            document.body.classList.remove('fullscreen-active');
            updateToggleButtons(false);
            updateRadarPlacement(false);
            updateHudPlacement(false);
            
            // When exiting fullscreen, wait for DOM to settle then force resize
            if (wasFullscreen) {
                setTimeout(() => {
                    scheduleResize();
                }, 100);
            } else {
                scheduleResize();
            }
            
            // If somehow we ended up in fullscreen while in district mode, exit it
            if (isActive && !isGameLayoutActive() && document.fullscreenElement) {
                console.warn('[Fullscreen] Exiting fullscreen due to district layout active');
                exitFullscreen();
            }
            return;
        }
        
        // Only apply fullscreen styles when in game layout
        document.body.classList.toggle('fullscreen-active', isActive);
        updateToggleButtons(isActive);
        updateRadarPlacement(isActive);
        updateHudPlacement(isActive);
        
        // When entering fullscreen, also wait a moment for DOM to settle
        setTimeout(() => {
            scheduleResize();
        }, 100);
    }

    /**
     * Handles the updateToggleButtons routine and encapsulates its core gameplay logic.
     * Parameters: isActive.
     * Returns: value defined by the surrounding game flow.
     */
    function updateToggleButtons(isActive) {
        toggleButtons.forEach((button) => {
            button.textContent = isActive ? 'Exit Fullscreen' : 'Fullscreen';
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            
            // Disable buttons when in district layout
            if (!isGameLayoutActive()) {
                button.disabled = true;
                button.style.opacity = '0.5';
            } else {
                button.disabled = false;
                button.style.opacity = '';
            }
        });
    }

    /**
     * Handles the updateRadarPlacement routine and encapsulates its core gameplay logic.
     * Parameters: isActive.
     * Returns: value defined by the surrounding game flow.
     */
    function updateRadarPlacement(isActive) {
        if (!radarContainer || !radarSlot) return;
        
        // Don't move radar if we're not in game layout
        if (!isGameLayoutActive()) return;

        if (isActive) {
            if (!radarOriginalParent) {
                radarOriginalParent = radarContainer.parentElement;
                radarOriginalNextSibling = radarContainer.nextElementSibling;
            }
            radarSlot.appendChild(radarContainer);
        } else if (radarOriginalParent) {
            if (radarOriginalNextSibling && radarOriginalParent.contains(radarOriginalNextSibling)) {
                radarOriginalParent.insertBefore(radarContainer, radarOriginalNextSibling);
            } else {
                radarOriginalParent.appendChild(radarContainer);
            }
        }
    }

    /**
     * Handles the updateHudPlacement routine and encapsulates its core gameplay logic.
     * Parameters: isActive.
     * Returns: value defined by the surrounding game flow.
     */
    function updateHudPlacement(isActive) {
        if (!hudContainer || !fullscreenTarget) return;

        if (!isGameLayoutActive()) return;

        if (isActive) {
            if (!hudOriginalParent) {
                hudOriginalParent = hudContainer.parentElement;
                hudOriginalNextSibling = hudContainer.nextElementSibling;
            }
            if (radarSlot && radarSlot.parentElement) {
                radarSlot.parentElement.insertBefore(hudContainer, radarSlot);
            } else if (fullscreenTarget.firstChild) {
                fullscreenTarget.insertBefore(hudContainer, fullscreenTarget.firstChild);
            } else {
                fullscreenTarget.appendChild(hudContainer);
            }
        } else if (hudOriginalParent) {
            if (hudOriginalNextSibling && hudOriginalParent.contains(hudOriginalNextSibling)) {
                hudOriginalParent.insertBefore(hudContainer, hudOriginalNextSibling);
            } else {
                hudOriginalParent.appendChild(hudContainer);
            }
        }
    }

    /**
     * Handles the scheduleResize routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function scheduleResize() {
        if (typeof applyResponsiveResize !== 'function') return;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                applyResponsiveResize({ force: true });
            });
        });
    }
    
    // Public method to force exit fullscreen (called when switching to district layout)
    function forceExitFullscreen() {
        if (document.fullscreenElement) {
            console.log('[Fullscreen] Force exiting fullscreen for layout switch');
            exitFullscreen();
        }
        // Ensure fullscreen class is removed
        document.body.classList.remove('fullscreen-active');
        updateToggleButtons(false);
        updateRadarPlacement(false);
        updateHudPlacement(false);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { 
        init,
        forceExitFullscreen
    };
})();
