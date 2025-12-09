class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENE_KEYS.menu, active: true });
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#050912');

        this.createBackdrop(width, height);
        this.createTitle(width);
        this.createButtons(width, height);
        this.createHints(width, height);

        this.input.keyboard.once('keydown-SPACE', () => {
            if (window.enterDistrictMap) enterDistrictMap(true);
        });
    }

    createBackdrop(width, height) {
        const g = this.add.graphics();
        g.lineStyle(1, 0x0f1f3a, 0.35);
        for (let x = 0; x < width; x += 50) {
            g.lineBetween(x, 0, x, height);
        }
        for (let y = 0; y < height; y += 50) {
            g.lineBetween(0, y, width, y);
        }

        const glow = this.add.rectangle(width / 2, height / 2, width * 0.6, height * 0.4, 0x0b2a3b, 0.45);
        glow.setBlendMode(Phaser.BlendModes.ADD);
    }

    createTitle(width) {
        const title = this.add.text(width / 2, 80, 'Skyline Survivors', {
            fontFamily: 'Orbitron',
            fontSize: '28px',
            color: '#8bf1ff',
            align: 'center'
        }).setOrigin(0.5);
        title.setShadow(0, 0, '#1fb6ff', 10, true, true);

        this.add.text(width / 2, 120, 'Command Deck', {
            fontFamily: 'Orbitron',
            fontSize: '14px',
            color: '#c7e3ff',
            align: 'center'
        }).setOrigin(0.5);
    }

    createButtons(width, height) {
        const centerY = height / 2 + 30;
        this.createMenuButton(width / 2, centerY - 10, 'Open District Map', '#22d3ee', () => {
            if (window.enterDistrictMap) enterDistrictMap(true);
        });

        this.createMenuButton(width / 2, centerY + 40, 'View Survival / Wave Briefing', '#a78bfa', () => {
            if (window.enterDistrictMap) enterDistrictMap(true);
        });
    }

    createMenuButton(x, y, label, strokeColor, handler) {
        const button = this.add.rectangle(x, y, 260, 44, 0x0f172a, 0.9)
            .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(strokeColor).color, 0.8)
            .setInteractive({ useHandCursor: true });
        const text = this.add.text(x, y, label, {
            fontFamily: 'Orbitron',
            fontSize: '13px',
            color: '#dceefb'
        }).setOrigin(0.5);

        button.on('pointerover', () => {
            this.tweens.add({ targets: button, alpha: 1, duration: 120 });
        });
        button.on('pointerout', () => {
            this.tweens.add({ targets: button, alpha: 0.9, duration: 120 });
        });
        button.on('pointerdown', () => {
            handler();
        });

        return { button, text };
    }

    createHints(width, height) {
        this.add.text(width / 2, height - 120, 'Select a district to deploy and choose your mode once inside the map.', {
            fontFamily: 'Orbitron',
            fontSize: '11px',
            color: '#9fb8d1',
            align: 'center',
            wordWrap: { width: width - 80 }
        }).setOrigin(0.5);

        this.add.text(width / 2, height - 90, 'Wave Mode: escalating waves.  Survival Mode: timed endurance.', {
            fontFamily: 'Orbitron',
            fontSize: '11px',
            color: '#c7e3ff',
            align: 'center',
            wordWrap: { width: width - 60 }
        }).setOrigin(0.5);
    }
}
