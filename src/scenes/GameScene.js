import Mage from '../sprites/Mage';
import Skeleton from '../sprites/Skeleton';
import Skelegon from '../sprites/Skelegon';
import PowerUp from '../sprites/PowerUp';
import SMBTileSprite from '../sprites/SMBTileSprite';
import AnimatedTiles from 'phaser-animated-tiles/dist/AnimatedTiles.min.js';
import BasicAttack from '../sprites/BasicAttack';

class GameScene extends Phaser.Scene {
    constructor(test) {
        super({
            key: 'GameScene'
        });
    }

    preload() {
        this.load.scenePlugin('animatedTiles', AnimatedTiles, 'animatedTiles', 'animatedTiles');
    }

    create() {
        // This scene is either called to run in attract mode in the background of the title screen
        // or for actual gameplay. Attract mode is based on a JSON-recording.


        // Places to warp to (from pipes). These coordinates is used also to define current room (see below)
        this.destinations = {};

        // Array of rooms to keep bounds within to avoid the need of multiple tilemaps per level.
        // It might be a singe screen room like when going down a pipe or a sidescrolling level.
        // It's defined as objects in Tiled.
        this.rooms = [];

        // Running in 8-bit mode (16-bit mode is avaliable for the tiles, but I haven't done any work on sprites etc)
        this.eightBit = true;

        // Add and play the music
        this.music = this.sound.add('overworld');
        this.music.play({
            loop: true
        });

        // Add the map + bind the tileset
        this.map = this.make.tilemap({
            key: 'map'
        });
        this.tileset = this.map.addTilesetImage('SuperMarioBros-World1-1', 'tiles');

        // Dynamic layer because we want breakable and animated tiles
        this.groundLayer = this.map.createDynamicLayer('world', this.tileset, 0, 0);

        // We got the map. Tell animated tiles plugin to loop through the tileset properties and get ready.
        // We don't need to do anything beyond this point for animated tiles to work.
        this.sys.animatedTiles.init(this.map);

        // Probably not the correct way of doing this:
        this.physics.world.bounds.width = this.groundLayer.width;

        // Add the background as an tilesprite.
        this.add.tileSprite(0, 0, this.groundLayer.width, 500, 'background-clouds');

        // Set collision by property
        this.groundLayer.setCollisionByProperty({
            collide: true
        });

        // This group contains all enemies for collision and calling update-methods
        this.enemyGroup = this.add.group();

        // A group powerUps to update
        this.powerUps = this.add.group();

        // Populate enemyGroup, powerUps, pipes and destinations from object layers
        this.parseObjectLayers();

        // activate gamepad
        //pad1 = this.input.gamepad.pad1;
        //pad1.addCallbacks(this, { onConnect: addButtons });

        // this.controls will contain all we need to control Mario.
        // Any key could just replace the default (like this.key.jump)

        this.controls = {
            jump: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            jump2: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            fire: this.input.activePointer,
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
        };

        // An emitter for bricks when blocks are destroyed.
        this.blockEmitter = this.add.particles('mario-sprites');

        this.blockEmitter.createEmitter({
            frame: {
                frames: ['brick'],
                cycle: true
            },
            gravityY: 1000,
            lifespan: 2000,
            speed: 400,
            angle: {
                min: -90 - 25,
                max: -45 - 25
            },
            frequency: -1
        });

        // Used when hitting a tile from below that should bounce up.
        this.bounceTile = new SMBTileSprite({
            scene: this
        });

        this.createHUD();


        // Touch controls is really just a quick hack to try out performance on mobiles,
        // It's not itended as a suggestion on how to do it in a real game.
        let jumpButton = this.add.sprite(350, 180);
        jumpButton.play('button');
        let dpad = this.add.sprite(20, 170);
        dpad.play('dpad');
        this.touchControls = {
            dpad: dpad,
            abutton: jumpButton,
            left: false,
            right: false,
            down: false,
            jump: false,
            visible: false
        };
        jumpButton.setScrollFactor(0, 0);
        jumpButton.alpha = 0;
        jumpButton.setInteractive();
        jumpButton.on('pointerdown', (pointer) => {
            this.touchControls.jump = true;
        });
        jumpButton.on('pointerup', (pointer) => {
            this.touchControls.jump = false;
        });
        dpad.setScrollFactor(0, 0);
        dpad.alpha = 0;
        dpad.setInteractive();
        dpad.on('pointerdown', (pointer) => {
            let x = dpad.x + dpad.width - pointer.x;
            let y = dpad.y + dpad.height - pointer.y;
            console.log(x, y);
            if (y > 0 || Math.abs(x) > -y) {
                if (x > 0) {
                    console.log('going left');
                    this.touchControls.left = true;
                } else {
                    console.log('going right');
                    this.touchControls.right = true;
                }
            } else {
                this.touchControls.down = true;
            }
        });
        dpad.on('pointerup', (pointer) => {
            this.touchControls.left = false;
            this.touchControls.right = false;
            this.touchControls.down = false;
        });
        window.toggleTouch = this.toggleTouch.bind(this);

        // If the game ended while physics was disabled
        this.physics.world.resume();

        // CREATE MARIO!!!
        this.mario = new Mage({
            scene: this,
            key: 'mario',
            x: 16 * 6,
            y: this.sys.game.config.height - 96
        });

        // Set bounds for current room
        this.mario.setRoomBounds(this.rooms);

        // The camera should follow Mario
        this.cameras.main.startFollow(this.mario);

        this.cameras.main.roundPixels = true;

        this.potions = this.add.group({
            classType: BasicAttack,
            maxSize: 10,
            runChildUpdate: false // Due to https://github.com/photonstorm/phaser/issues/3724
        });

        // ADD SKELEGON TILES TO MAP
    }

    update(time, delta) {
        if (!this.attractMode) {
            this.record(delta);
        }

        Array.from(this.potions.children.entries).forEach(
            (fireball) => {
                fireball.update(time, delta);
            });

        if (this.physics.world.isPaused) {
            return;
        }

        this.levelTimer.time += 1;
        this.levelTimer.displayedTime = Math.round(this.levelTimer.time / 100);
        this.levelTimer.textObject.setText(('' + this.levelTimer.displayedTime).padStart(3, '0'));


        // Run the update method of Mario
        this.mario.update(this.controls, time, delta);

        // Run the update method of all enemies
        this.enemyGroup.children.entries.forEach(
            (sprite) => {
                sprite.update(time, delta);
            }
        );

        // Run the update method of non-enemy sprites
        this.powerUps.children.entries.forEach(
            (sprite) => {
                sprite.update(time, delta);
            }
        );
    }

    tileCollision(sprite, tile) {
        // If it's Mario and the body isn't blocked up it can't hit question marks or break bricks
        // Otherwise Mario will break bricks he touch from the side while moving up.
        if (sprite.type === 'mario' && !sprite.body.blocked.up) {
            return;
        }

        // If the tile has a callback, lets fire it
        if (tile.properties.callback) {
            switch (tile.properties.callback) {
                case 'questionMark':
                    // Shift to a metallic block
                    tile.index = 44;

                    // Bounce it a bit
                    sprite.scene.bounceTile.restart(tile);

                    // The questionmark is no more
                    tile.properties.callback = null;

                    // Invincible blocks are only collidable from above, but everywhere once revealed
                    tile.setCollision(true);

                    // Check powerUp for what to do, make a coin if not defined
                    let powerUp = tile.powerUp ? tile.powerUp : 'coin';

                    // Make powerUp (including a coin)
                    (() => new PowerUp({
                        scene: sprite.scene,
                        key: 'sprites16',
                        x: tile.x * 16 + 8,
                        y: tile.y * 16 - 8,
                        type: powerUp
                    }))();

                    break;
                case 'breakable':
                    if (sprite.type === 'mario' && sprite.animSuffix === '') {
                        // Can't break it anyway. Bounce it a bit.
                        sprite.scene.bounceTile.restart(tile);
                        sprite.scene.sound.playAudioSprite('sfx', 'smb_bump');
                    } else {
                        // get points
                        sprite.scene.updateScore(50);
                        sprite.scene.map.removeTileAt(tile.x, tile.y, true, true, this.groundLayer);
                        sprite.scene.sound.playAudioSprite('sfx', 'smb_breakblock');
                        sprite.scene.blockEmitter.emitParticle(6, tile.x * 16, tile.y * 16);
                    }
                    break;
                case 'toggle16bit':
                    sprite.scene.eightBit = !sprite.scene.eightBit;
                    if (sprite.scene.eightBit) {
                        sprite.scene.tileset.setImage(sprite.scene.sys.textures.get('tiles'));
                    } else {
                        sprite.scene.tileset.setImage(sprite.scene.sys.textures.get('tiles-16bit'));
                    }
                    break;
                default:
                    sprite.scene.sound.playAudioSprite('sfx', 'smb_bump');
                    break;
            }
        } else {
            sprite.scene.sound.playAudioSprite('sfx', 'smb_bump');
        }
    }

    updateScore(score) {
        this.score.pts += score;
        this.score.textObject.setText(('' + this.score.pts).padStart(6, '0'));
    }

    toggleTouch() {
        this.touchControls.visible = !this.touchControls.visible;
        if (this.touchControls.visible) {
            this.touchControls.dpad.alpha = 0;
            this.touchControls.abutton.alpha = 0;
        } else {
            this.touchControls.dpad.alpha = 0.5;
            this.touchControls.abutton.alpha = 0.5;
        }
    }

    record(delta) {
        let update = false;
        let keys = {
            jump: this.controls.jump.isDown || this.controls.jump2.isDown,
            left: this.controls.left.isDown,
            right: this.controls.right.isDown,
            down: this.controls.down.isDown,
            fire: this.controls.fire.isDown
        };
        if (typeof (recording) === 'undefined') {
            console.log('DEFINE');
            window.recording = [];
            window.time = 0;
            this.recordedKeys = {};
            update = true;
        } else {
            update = (time - recording[recording.length - 1].time) > 200; // update at least 5 times per second
        }
        time += delta;
        if (!update) {
            // update if keys changed
            ['jump', 'left', 'right', 'down', 'fire'].forEach((dir) => {
                if (keys[dir] !== this.recordedKeys[dir]) {
                    update = true;
                }
            });
        }
        if (update) {
            recording.push({
                time,
                keys,
                x: this.mario.x,
                y: this.mario.y,
                vx: this.mario.body.velocity.x,
                vy: this.mario.body.velocity.y
            });
        }
        this.recordedKeys = keys;
    }

    parseObjectLayers() {
        // The map has one object layer with enemies as stamped tiles,
        // each tile has properties containing info on what enemy it represents.
        this.map.getObjectLayer('enemies').objects.forEach(
            (enemy) => {
                let enemyObject;
                switch (this.tileset.tileProperties[enemy.gid - 1].name) {
                    case 'goomba':
                        enemyObject = new Skeleton({
                            scene: this,
                            key: 'sprites16',
                            x: enemy.x,
                            y: enemy.y
                        });
                        break;
                    case 'turtle':
                        enemyObject = new Skelegon({
                            scene: this,
                            key: 'skelegon-walk',
                            x: enemy.x,
                            y: enemy.y
                        });
                        break;
                    default:
                        console.error('Unknown:', this.tileset.tileProperties[enemy.gid - 1]); // eslint-disable-line no-console
                        break;
                }
                this.enemyGroup.add(enemyObject);
            }
        );

        // The map has an object layer with 'modifiers' that do 'stuff', see below
        this.map.getObjectLayer('modifiers').objects.forEach((modifier) => {
            let tile, properties, type;

            // Get property stuff from the tile if present or just from the object layer directly
            if (typeof modifier.gid !== 'undefined') {
                properties = this.tileset.tileProperties[modifier.gid - 1];
                type = properties.type;
                if (properties.hasOwnProperty('powerUp')) {
                    type = 'powerUp';
                }
            } else {
                type = modifier.properties.type;
            }

            switch (type) {
                case 'powerUp':
                    // Modifies a questionmark below the modifier to contain something else than the default (coin)
                    tile = this.groundLayer.getTileAt(modifier.x / 16, modifier.y / 16 - 1);
                    tile.powerUp = properties.powerUp;
                    tile.properties.callback = 'questionMark';
                    if (!tile.collides) {
                        // Hidden block without a question mark
                        tile.setCollision(false, false, false, true);
                    }
                    break;
                case 'pipe':
                    // Adds info on where to go from a pipe under the modifier
                    tile = this.groundLayer.getTileAt(modifier.x / 16, modifier.y / 16);
                    tile.properties.dest = parseInt(modifier.properties.goto);
                    break;
                case 'dest':
                    // Adds a destination so that a pipe can find it
                    this.destinations[modifier.properties.id] = {
                        x: modifier.x + modifier.width / 2,
                        top: (modifier.y < 16)
                    };
                    break;
                case 'room':
                    // Adds a 'room' that is just info on bounds so that we can add sections below pipes
                    // in an level just using one tilemap.
                    this.rooms.push({
                        x: modifier.x,
                        width: modifier.width,
                        sky: modifier.properties.sky
                    });
                    break;
            }
        });
    }

    createHUD() {
        const hud = this.add.bitmapText(5 * 8, 8, 'font', 'MAGE                           TIME', 8);
        hud.setScrollFactor(0, 0);
        this.levelTimer = {
            textObject: this.add.bitmapText(36 * 8, 16, 'font', '0000', 8),
            time: 0 * 1000,
            displayedTime: 0,
            hurry: false
        };
        this.levelTimer.textObject.setScrollFactor(0, 0);
        this.score = {
            pts: 0,
            textObject: this.add.bitmapText(5 * 8, 16, 'font', '000000', 8)
        };
        this.score.textObject.setScrollFactor(0, 0);


        // SPELL INVENTORY
    }

    cleanUp() {
        // Never called since 3.10 update (I called it from create before). If Everything is fine, I'll remove this method.
        // Scenes isn't properly destroyed yet.
        let ignore = ['sys', 'anims', 'registry', 'sound', 'textures', 'events', 'cameras', 'make', 'add', 'children', 'cameras3d', 'time', 'data', 'input', 'load', 'tweens', 'lights', 'physics'];
        let whatThisHad = ['sys', 'anims', 'cache', 'registry', 'sound', 'textures', 'events', 'cameras', 'make', 'add', 'scene', 'children', 'cameras3d', 'time', 'data', 'input', 'load', 'tweens', 'lights', 'physics', 'attractMode', 'destinations', 'rooms', 'eightBit', 'music', 'map', 'tileset', 'groundLayer', 'mario', 'enemyGroup', 'powerUps', 'keys', 'blockEmitter', 'bounceTile', 'levelTimer', 'score', 'finishLine', 'touchControls'];
        whatThisHad.forEach(key => {
            if (ignore.indexOf(key) === -1 && this[key]) {
                switch (key) {
                    case 'enemyGroup':
                    case 'music':
                    case 'map':
                        this[key].destroy();
                        break;
                }
                this[key] = null;
            }
        });
    }
}

export default GameScene;
