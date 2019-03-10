class MenuScene extends Phaser.Scene {
    constructor(test) {
        super({
            key: 'MenuScene'
        });
    }
    preload() {
        this.load.atlas('mario-sprites', 'assets/mario-sprites.png', 'assets/mario-sprites.json');
    }
    create() {
        this.scene.bringToTop();

        this.registry.set('restartScene', false);

        let sh = window.screen.availHeight;
        let sw = window.screen.availWidth;

        // let ch = 0;
        // let cw = 0;
        let multiplier = 1;
        if (sh / sw > 0.6) {
            // Portrait, fit width
            multiplier = sw / 400;
        } else {
            multiplier = sh / 240;
        }
        multiplier = Math.floor(multiplier);
        let el = document.getElementsByTagName('canvas')[0];
        el.style.width = 400 * multiplier + 'px';
        el.style.height = 240 * multiplier + 'px';

        this.pressSTART = this.add.bitmapText(16 * 9, 16 * 6.5, 'font', 'PRESS TO START', 8);
        this.blink = 1000;

        this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

        this.input.on('pointerdown', () => {
            this.startGame();
        });
      }

    update(time, delta) {
        if (this.registry.get('restartScene')) {
            this.restartScene();
        }
        this.blink -= delta;
        if (this.blink < 0) {
            this.pressSTART.alpha = this.pressSTART.alpha === 1 ? 0 : 1;
            this.blink = 500;
        }

        if (this.startKey.isDown) {
            this.startGame();
        }
    }

    startGame() {
        this.scene.start('GameScene');
    }

    restartScene() {
        this.scene.stop('GameScene');
        this.scene.launch('GameScene');
        this.scene.bringToTop();

        this.registry.set('restartScene', false);
    }
}

export default MenuScene;
