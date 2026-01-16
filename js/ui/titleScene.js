// ------------------------
// Title screen briefing
// ------------------------

class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENE_KEYS.title, active: true });
        this.isComplete = false;
        this.typewriterIndex = 0;
        this.typewriterTimer = null;
        this.fullBriefingText = '';
    }

    create() {
        const sawBriefing = typeof localStorage !== 'undefined'
            ? localStorage.getItem('sawBriefing')
            : null;

        if (sawBriefing) {
            this.scene.start(SCENE_KEYS.menu);
            return;
        }

        this.overlay = document.getElementById('title-overlay');
        this.briefingEl = document.getElementById('title-briefing-text');
        this.cursorEl = document.getElementById('title-cursor');
        this.skipButton = document.getElementById('title-skip');
        this.authorizeButton = document.getElementById('title-authorize');
        const menuOverlay = document.getElementById('menu-overlay');

        if (menuOverlay) menuOverlay.style.display = 'none';
        if (this.overlay) this.overlay.style.display = 'flex';
        if (this.briefingEl) this.briefingEl.textContent = '';
        if (this.cursorEl) this.cursorEl.classList.remove('active');
        if (this.authorizeButton) this.authorizeButton.disabled = true;

        this.fullBriefingText = [
            '┌─────────────────────────────────────────────────┐',
            '│ PLANETARY DEFENSE NETWORK - EMERGENCY PROTOCOL  │',
            '│ STATUS: CRITICAL                                 │',
            '└─────────────────────────────────────────────────┘',
            '',
            '> ACCESSING TACTICAL OVERVIEW...',
            '',
            'SITUATION: DIRE',
            '- 18 of 25 districts under enemy control',
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

        this.skipHandler = () => this.skipBriefing();
        this.authorizeHandler = () => this.authorizeLaunch();
        this.advanceHandler = () => this.handleAdvance();

        if (this.skipButton) this.skipButton.addEventListener('click', this.skipHandler);
        if (this.authorizeButton) this.authorizeButton.addEventListener('click', this.authorizeHandler);

        this.input.keyboard.on('keydown-SPACE', this.advanceHandler);
        this.input.keyboard.on('keydown-ENTER', this.advanceHandler);

        this.typewriterTimer = this.time.addEvent({
            delay: 18,
            callback: this.advanceTypewriter,
            callbackScope: this,
            loop: true
        });

        this.events.once('shutdown', () => this.cleanup());
    }

    advanceTypewriter() {
        if (this.isComplete || !this.briefingEl) return;
        const nextChar = this.fullBriefingText.charAt(this.typewriterIndex);
        this.typewriterIndex += 1;
        this.briefingEl.textContent += nextChar;

        if (this.typewriterIndex >= this.fullBriefingText.length) {
            this.finishBriefing();
        }
    }

    finishBriefing() {
        if (this.typewriterTimer) {
            this.typewriterTimer.remove(false);
            this.typewriterTimer = null;
        }
        this.isComplete = true;
        if (this.briefingEl) this.briefingEl.textContent = this.fullBriefingText;
        if (this.cursorEl) this.cursorEl.classList.add('active');
        if (this.authorizeButton) this.authorizeButton.disabled = false;
        if (this.skipButton) {
            this.skipButton.disabled = true;
            this.skipButton.textContent = 'Briefing Ready';
        }
    }

    skipBriefing() {
        if (this.isComplete) return;
        this.finishBriefing();
    }

    handleAdvance() {
        if (this.isComplete) {
            this.authorizeLaunch();
        } else {
            this.skipBriefing();
        }
    }

    authorizeLaunch() {
        if (!this.isComplete) return;
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('sawBriefing', 'true');
        }
        if (this.overlay) this.overlay.style.display = 'none';
        this.scene.start(SCENE_KEYS.menu);
    }

    cleanup() {
        if (this.typewriterTimer) {
            this.typewriterTimer.remove(false);
            this.typewriterTimer = null;
        }
        if (this.skipButton && this.skipHandler) {
            this.skipButton.removeEventListener('click', this.skipHandler);
        }
        if (this.authorizeButton && this.authorizeHandler) {
            this.authorizeButton.removeEventListener('click', this.authorizeHandler);
        }
        if (this.input?.keyboard) {
            this.input.keyboard.off('keydown-SPACE', this.advanceHandler);
            this.input.keyboard.off('keydown-ENTER', this.advanceHandler);
        }
    }
}
