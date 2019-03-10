export default class Fire extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        super(scene);
        console.log(scene);
        // super(config.scene, config.x, config.y, config.key);
        this.hej = '!!!';

        /* switch(config.type) {
            case "shot":
            case "obstacle":

        } */

        this.scene.physics.world.enable(this);

        this.body.setSize(8, 8);
        this.body.offset.set(12, 12);
        // break;

        this.on('animationcomplete', () => {
            if (this.anims.currentAnim.key === 'fireExplode') {
                this.setActive(false);
                this.setVisible(false);
            }
        }, this);
    }

    fire(x, y, pointerX, pointerY) {
        this.setActive(true);
        this.setVisible(true);

        this.body.allowGravity = true;

        this.setPosition(x, y);
        this.angle = Phaser.Math.Angle.Between(x, y, this.scene.cameras.main.scrollX+pointerX, this.scene.cameras.main.scrollY+pointerY)
        this.body.velocity.x =  400*Math.cos(this.angle);
        this.body.velocity.y = 400*Math.sin(this.angle);
        this.play('fireFly');
        this.scene.sound.playAudioSprite('sfx', 'smb_fireball');

        console.log(this.scene.physics.world.collide);
    }

    update(time, delta) {
        if (!this.active) {
            return;
        }
        this.scene.physics.world.collide(this, this.scene.groundLayer, () => this.collided());
        this.scene.physics.world.overlap(this, this.scene.enemyGroup, (me, enemy) => {
            me.explode();
            enemy.starKilled();
        });
        //  console.log(this.scene.physics.world.collide);
    }

    collided() {
        console.log('COLLIDED');
        /*if (this.body.velocity.y === 0) { // BOUNCE
            this.body.velocity.y = -150;
        }*/
        if (this.body.velocity.x === 0 || this.body.velocity.y === 0) {
            this.scene.sound.playAudioSprite('sfx', 'smb_bump');
            this.explode();
        }
    }

    explode() {
        this.body.allowGravity = false;
        this.body.velocity.y = 0;
        this.play('fireExplode');
    }
}
