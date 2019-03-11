export default class Mage extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.acceleration = 150;
        this.body.maxVelocity.x = 200;
        this.body.maxVelocity.y = 500;

        //this.crouching = false;
        //this.wasHurt = -1;
        //this.flashToggle = false;
        /*this.star = {
            active: false,
            timer: -1,
            step: 0
        };*/

        // STATE variables
        this.hp = 100;
        this.state = 'idle'
        this.alive = true;
        this.type = 'mario';

        // TIMERS
        this.jumpTimer = 0;
        this.runTimer = 0;
        this.attackTimer = 0;

        this.spells = new Array(2);

        this.spells[0] = 'fire'
        this.fireCoolDown = 0;

        this.on('animationcomplete', () => {
            if (this.anims.currentAnim.key === 'mage-attk' || this.anims.currentAnim.key === 'mage-jump') {
                this.scene.physics.world.resume();
            }
        }, this);
    }

    update(keys, time, delta) {
        if (this.y > 2040) {
            // Really superdead, has been falling for a while.
            this.scene.scene.stop('GameScene');
            this.scene.scene.start('MenuScene');
        } //else if (this.y > 240 && this.alive) {
            //this.die();
        //}

        // Don't do updates while entering the pipe or being dead
        if (!this.alive) {
            return;
        }

        // UPDATE TIMERS
        this.fireCoolDown -= delta;
        this.jumpCoolDown -= delta;
        this.runCoolDown -= delta;
        this.crouching = false;
        ////////////////

        // Just run callbacks when hitting something from below or trying to enter it
        if (this.body.velocity.y < 0 || this.bending) {
            this.scene.physics.world.collide(this, this.scene.groundLayer, this.scene.tileCollision);
        } else {
            this.scene.physics.world.collide(this, this.scene.groundLayer);
        }
        /*
        if (this.wasHurt > 0) {
            this.wasHurt -= delta;
            this.flashToggle = !this.flashToggle;
            this.alpha = this.flashToggle ? 0.2 : 1;
            if (this.wasHurt <= 0) {
                this.alpha = 1;
            }
        }
        */
        let input = {
            left: keys.left.isDown || this.scene.touchControls.left,
            right: keys.right.isDown || this.scene.touchControls.right,
            down: keys.down.isDown || this.scene.touchControls.down,
            jump: keys.jump.isDown || keys.jump2.isDown || this.scene.touchControls.jump,
            fire: keys.fire.isDown
        };

        if(input.fire && this.spells.includes('fire') && this.fireCoolDown < 0) {
          this.fireCoolDown = 700;
        }

        if(this.fireCoolDown<=100&&this.state==='ATTACKING'){
          let fireball = this.scene.fireballs.get(this);
          if (fireball) {
            fireball.fire(this.x, this.y, keys.fire.x, keys.fire.y);
          }
        }

        if (this.body.velocity.y > 0) {
            this.hasFalled = true;
        }

        // MAGE CONTROLLER
        if (input.left) {
            if (this.body.velocity.y === 0) {
                this.run(-this.acceleration);
            } else {  // jumping
                this.run(-this.acceleration/2);
            }
            this.flipX = true;
        } else if (input.right) {
            if (this.body.velocity.y === 0) {
                this.run(this.acceleration);
            } else {  // jumping
                this.run(this.acceleration/2);
            }
            this.flipX = false;
        } else if (this.body.blocked.down) {
            if (Math.abs(this.body.velocity.x) < 10) {
                this.body.setVelocityX(0);
                this.run(0);
            } else {
                this.run(((this.body.velocity.x > 0) ? -1 : 1) * this.acceleration * 4);
            }
        } else if (!this.body.blocked.down) {
            this.run(0);
        }

        if (input.jump && (!(this.state==='JUMPING') || this.jumpCoolDown > 0)) {
            this.jump();
        } else if (!input.jump) {
            this.jumpCoolDown = -1; // Don't resume jump if button is released, prevents mini double-jumps
            if (this.body.blocked.down) {
                this.state = 'IDLE';
            }
        }

        // ANIMATION STATE MACHINE
        if (this.body.velocity.x !== 0) {
            this.state = 'RUNNING';
        }
        if (input.jump && this.body.velocity.y !== 0) {
            this.state = 'JUMPING'
        }
        if (input.down) {
            this.state = 'BENDING';
        }

        if(input.fire||this.fireCoolDown>0){
          this.state = 'ATTACKING';
        }else if(this.body.velocity.y===0&&this.body.velocity.x===0){ // not moving
          if(!input.down&&!input.jump&&!input.fire&&!(this.state==='ATTACKING')&&!(this.state==='JUMPING')){ // not jumping or attacking
            this.state = 'IDLE';
          }
        }

        this.animationStateMachine(this.state);

        this.physicsCheck = true;
    }

    run(vel) {
        this.body.setAccelerationX(vel);
        if (!(this.state==='RUNNING')) { // set jump cooldown
            this.runCoolDown = 300;
        }
    }

    jump() {
        if (!(this.state==='JUMPING')) {
            if (this.animSuffix === '') {
                this.scene.sound.playAudioSprite('sfx', 'smb_jump-small');
            } else {
                this.scene.sound.playAudioSprite('sfx', 'smb_jump-super');
            }
        }
        if (this.body.velocity.y < 0 || this.body.blocked.down) {
            this.body.setVelocityY(-200);
        }
        if (!(this.state==='JUMPING')) { // set jump cooldown
            this.jumpCoolDown = 300;
        }
    }

    enemyBounce(enemy) {
        // Force Mario y-position up a bit (on top of the enemy) to avoid getting killed
        // by neigbouring enemy before being able to bounce
        this.body.y = enemy.body.y - this.body.height;
        // TODO: if jump-key is down, add a boost value to jump-velocity to use and init jump for controls to handle.
        this.body.setVelocityY(-150);
    }

    hurtBy(enemy) {
        if (!this.alive) {
            return;
        }
        if (this.wasHurt < 1) { // Mage was hurt by enemy
          this.hp -= 10;
          console.log(this.hp)
        }
    }

    die() {
        /*this.scene.music.pause();
        this.play('death');
        this.scene.sound.playAudioSprite('sfx', 'smb_mariodie');
        this.body.setAcceleration(0);
        this.body.setVelocity(0, -300);
        this.alive = false;*/
    }

    animationStateMachine(state) {
      switch(state) {
        case 'ATTACKING':
          if(this.fireCoolDown===700)
            this.anims.play('mage-attk');
            break;
        case 'RUNNING':
          if(this.runCoolDown===300)
            this.anims.play('mage-run');
            break;
        case 'JUMPING':
          if(this.jumpCoolDown===300)
            this.anims.play('mage-jump');
            break;
        case 'BENDING':
          this.anims.play('mage-bend');
          break;
        case 'IDLE':
          this.anims.play('mage-stand');
      }
    }

    setRoomBounds(rooms) {
        rooms.forEach(
            (room) => {
                if (this.x >= room.x && this.x <= (room.x + room.width)) {
                    if (this.x >= room.x && this.x <= (room.x + room.width)) {

                    }
                    let cam = this.scene.cameras.main;
                    let layer = this.scene.groundLayer;
                    cam.setBounds(room.x, 0, room.width * layer.scaleX, layer.height * layer.scaleY);
                    this.scene.cameras.main.setBackgroundColor(room.sky);
                }
            }
        );
    }
}
