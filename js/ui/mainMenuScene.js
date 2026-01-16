// ------------------------
// Main menu
// ------------------------

class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENE_KEYS.menu, active: true });
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#050912');

        this.createBackdrop(width, height);
        this.createTitle(width);
        this.createIntroPanel(width, height);

        this.input.keyboard.once('keydown-SPACE', () => {
            if (window.enterDistrictMap) {
                enterDistrictMap(true);
            }
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

    createIntroPanel(width, height) {
        const frame = this.add.rectangle(width / 2, height / 2, width * 0.7, height * 0.5, 0x0b1220, 0.8);
        frame.setStrokeStyle(3, 0x1b4f8f, 0.7);

        this.add.text(width / 2, height / 2 - 60, 'Welcome to Skyline Survivors', {
            fontFamily: 'Orbitron',
            fontSize: '16px',
            color: '#c7e3ff',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 - 20, 'Press SPACE to enter the District Map\nor use the buttons below.', {
            fontFamily: 'Orbitron',
            fontSize: '12px',
            color: '#9fb8d1',
            align: 'center',
            lineSpacing: 6
        }).setOrigin(0.5);

        this.createMenuButton(width / 2, height / 2 + 40, 'Enter District Map', '#34d399', () => {
            if (window.enterDistrictMap) {
                enterDistrictMap(true);
            }
        });
        
        this.createMenuButton(width / 2, height / 2 + 90, 'Open Settings', '#22d3ee', () => {
            if (window.openSettingsMenu) {
                openSettingsMenu();
            }
        });
    }

    createMenuButton(x, y, label, strokeColor, handler) {
        const button = this.add.rectangle(x, y, 220, 40, 0x0f172a, 0.9)
            .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(strokeColor).color, 0.8)
            .setInteractive({ useHandCursor: true })
            .setDepth(5);
        const text = this.add.text(x, y, label, {
            fontFamily: 'Orbitron',
            fontSize: '12px',
            color: '#dceefb'
        }).setOrigin(0.5).setDepth(5);

        button.on('pointerover', () => {
            this.tweens.add({ targets: button, alpha: 1, scaleX: 1.02, scaleY: 1.02, duration: 100 });
        });
        button.on('pointerout', () => {
            this.tweens.add({ targets: button, alpha: 0.9, scaleX: 1, scaleY: 1, duration: 100 });
        });
        button.on('pointerdown', () => {
            handler();
        });

        return { button, text };
    }
}