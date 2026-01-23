// ------------------------
// File: js/ui/uiFullscreen.js
// ------------------------

const FullscreenController = (function() {
    let radarContainer;
    let radarOriginalParent;
    let radarOriginalNextSibling;
    let radarSlot;
    let fullscreenTarget;
    let toggleButtons;

    function init() {
        radarContainer = document.getElementById('radar-container');
        radarSlot = document.getElementById('gameplay-radar-slot');
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

    function handleToggle() {
        if (document.fullscreenElement) {
            exitFullscreen();
        } else {
            enterFullscreen();
        }
    }

    function enterFullscreen() {
        if (!fullscreenTarget?.requestFullscreen) return;
        fullscreenTarget.requestFullscreen();
    }

    function exitFullscreen() {
        if (!document.exitFullscreen) return;
        document.exitFullscreen();
    }

    function handleFullscreenChange() {
        const isActive = document.fullscreenElement === fullscreenTarget;
        document.body.classList.toggle('fullscreen-active', isActive);
        updateToggleButtons(isActive);
        updateRadarPlacement(isActive);
        scheduleResize();
    }

    function updateToggleButtons(isActive) {
        toggleButtons.forEach((button) => {
            button.textContent = isActive ? 'Exit Fullscreen' : 'Fullscreen';
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }

    function updateRadarPlacement(isActive) {
        if (!radarContainer || !radarSlot) return;

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

    function scheduleResize() {
        if (typeof applyResponsiveResize !== 'function') return;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                applyResponsiveResize({ force: true });
            });
        });
        setTimeout(() => {
            applyResponsiveResize({ force: true });
        }, 150);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { init };
})();
