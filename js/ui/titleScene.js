// ------------------------
// Title briefing scene
// ------------------------

class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENE_KEYS.title, active: true });
        this.typingEvent = null;
        this.isBriefingComplete = false;
    }

    /**
     * Handles the create routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    create() {
        const overlay = document.getElementById('title-overlay');
        if (!overlay) {
            this.scene.start(SCENE_KEYS.menu);
            return;
        }

        const textEl = overlay.querySelector('[data-briefing-text]');
        const authorizeBtn = overlay.querySelector('[data-authorize]');
        const skipBtn = overlay.querySelector('[data-skip]');
        const cursorEl = overlay.querySelector('[data-cursor]');

        overlay.style.display = 'flex';
        overlay.setAttribute('aria-hidden', 'false');

        const fullText = this.buildBriefingText();
        if (textEl) {
            textEl.textContent = '';
        }
        if (cursorEl) {
            cursorEl.style.opacity = '0';
        }
        if (authorizeBtn) {
            authorizeBtn.disabled = true;
        }

        /**
         * Handles the finishBriefing routine and encapsulates its core gameplay logic.
         * Parameters: none.
         * Returns: value defined by the surrounding game flow.
         */
        const finishBriefing = () => {
            this.isBriefingComplete = true;
            if (cursorEl) {
                cursorEl.style.opacity = '1';
            }
            if (authorizeBtn) {
                authorizeBtn.disabled = false;
            }
        };

        /**
         * Handles the revealAllText routine and encapsulates its core gameplay logic.
         * Parameters: none.
         * Returns: value defined by the surrounding game flow.
         */
        const revealAllText = () => {
            if (this.typingEvent) {
                this.typingEvent.remove(false);
                this.typingEvent = null;
            }
            if (textEl) {
                textEl.textContent = fullText;
            }
            finishBriefing();
        };

        const shouldReduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (shouldReduceMotion) {
            revealAllText();
        } else {
            let index = 0;
            this.typingEvent = this.time.addEvent({
                delay: 18,
                loop: true,
                callback: () => {
                    if (!textEl) return;
                    textEl.textContent = fullText.slice(0, index);
                    index += 1;
                    if (index > fullText.length) {
                        if (this.typingEvent) {
                            this.typingEvent.remove(false);
                            this.typingEvent = null;
                        }
                        finishBriefing();
                    }
                }
            });
        }

        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                if (!this.isBriefingComplete) {
                    revealAllText();
                }
            }, { once: true });
        }

        if (authorizeBtn) {
            authorizeBtn.addEventListener('click', () => {
                if (!this.isBriefingComplete) return;
                overlay.style.display = 'none';
                overlay.setAttribute('aria-hidden', 'true');
                this.scene.start(SCENE_KEYS.menu);
            });
        }

        this.input.keyboard.on('keydown-SPACE', () => {
            if (!this.isBriefingComplete) {
                revealAllText();
            } else if (authorizeBtn && !authorizeBtn.disabled) {
                authorizeBtn.click();
            }
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            if (!this.isBriefingComplete) {
                revealAllText();
            } else if (authorizeBtn && !authorizeBtn.disabled) {
                authorizeBtn.click();
            }
        });
    }

    /**
     * Handles the buildBriefingText routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    buildBriefingText() {
        const summary = this.getDistrictSummary();
        const occupied = summary.occupied;
        const total = summary.total;

        return [
            '┌─────────────────────────────────────────────────┐',
            '│ PLANETARY DEFENSE NETWORK - EMERGENCY PROTOCOL │',
            '│ STATUS: CRITICAL                                │',
            '└─────────────────────────────────────────────────┘',
            '',
            '> ACCESSING TACTICAL OVERVIEW...',
            '',
            'SITUATION: DIRE',
            `- ${occupied} of ${total} districts under enemy control`,
            '- Battleship fleet active and expanding',
            '- Civilian conversion rate: 73% and rising',
            '- Estimated time to total collapse: 96 hours',
            '',
            'ENEMY TACTICS:',
            '- Battleships target friendly districts',
            '- Landers abduct humans for mutation',
            '- Ground bases establish fortified positions',
            '- Each captured district strengthens their fleet',
            '',
            'YOUR MISSION:',
            '1. DEFEND threatened districts (15-wave assaults)',
            '2. ASSAULT occupied zones (destroy enemy bases)',
            '3. LIBERATE the entire planet',
            '4. DESTROY the Mothership core',
            '',
            'REMEMBER:',
            '→ Lost defenses become assault missions',
            '→ Each district matters—protect your investments',
            '→ The Mothership only reveals itself when threatened',
            '→ Failure is not an option',
            '',
            '> AWAITING DEPLOYMENT AUTHORIZATION...'
        ].join('\n');
    }

    /**
     * Handles the getDistrictSummary routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    getDistrictSummary() {
        let total = 0;
        let occupied = 0;

        if (window.missionPlanner?.getDistrictConfigs) {
            const configs = window.missionPlanner.getDistrictConfigs();
            total = configs.length;
            occupied = configs.reduce((count, cfg) => {
                const state = window.missionPlanner.getDistrictState(cfg.id);
                return count + (state?.status === 'occupied' ? 1 : 0);
            }, 0);
        }

        if (!total) {
            total = 18;
        }

        return { total, occupied };
    }
}
