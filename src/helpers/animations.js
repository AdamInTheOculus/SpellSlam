export default function makeAnimations(scene) {
    // TONS of animations. Everything animation-related is ugly and stupid below.
    // TODO:  maybe use JSON to load animations
    let config = {
        key: 'brickTile',
        frames: scene.anims.generateFrameNumbers('tiles', {
            start: 14,
            end: 14,
            first: 14
        })
    };
    scene.anims.create(config);
    config = {
        key: 'blockTile',
        frames: scene.anims.generateFrameNumbers('tiles', {
            start: 43,
            end: 43,
            first: 43
        })
    };
    scene.anims.create(config);

    // Mage Animations /////////////////////////////
    config = {
        key: 'mage-run',
        frames: scene.anims.generateFrameNames('mage-sprite', {
            prefix: 'mage/walk',
            start: 1,
            end: 4
        }),
        frameRate: 10,
        repeat: -1,
        repeatDelay: 0
    };
    scene.anims.create(config);

    config = {
        key: 'mage-stand',
        frames: [{
            key: 'mage-sprite',
            frame: 'mage/stand'
        }]
    };
    scene.anims.create(config);

    config = {
        key: 'mage-jump',
        frames: scene.anims.generateFrameNames('mage-sprite', {
            prefix: 'mage/jump',
            start: 1,
            end: 3
        }),
        frameRate: 3,
        repeat: -1,
        repeatDelay: 0
    };
    scene.anims.create(config);

    config = {
      key: 'mage-bend',
      frames: [{
          key: 'mage-sprite',
          frame: 'mage/bend4'
      }]
    };
    scene.anims.create(config);

    config = {
        key: 'mage-turn',
        frames: [{
            key: 'mage-sprite',
            frame: 'mage/turn'
        }]
    };
    scene.anims.create(config);

    config = {
        key: 'mage-attk',
        frames: scene.anims.generateFrameNames('mage-sprite', {
            prefix: 'mage/attk',
            start: 1,
            end: 7
        }),
        frameRate: 7,
        repeat: -1,
        repeatDelay: 0
    };
    scene.anims.create(config);
    /////////////////////////////////////////

    // Mario animations: One without suffix, super after mushroom and fire after flower
    ['', 'Super', 'Fire'].forEach((suffix) => {
        // Jump, Stand and Turn: one frame each
        ['turn'].forEach(
            (anim) => {

                config.key = anim + suffix;
                config.frames = [{
                    frame: 'mario/' + anim + suffix,
                    key: 'mario-sprites'
                }];
                scene.anims.create(config);
            }
        );

        // Climb
        config.key = 'climb' + suffix;
        config.frames = scene.anims.generateFrameNames('mario-sprites', {
            prefix: 'mario/climb' + suffix,
            start: 1,
            end: 2
        });
        scene.anims.create(config);

        // Swim
        config.key = 'swim' + suffix;
        config.frames = scene.anims.generateFrameNames('mario-sprites', {
            prefix: 'mario/swim' + suffix,
            start: 1,
            end: 6
        });
        scene.anims.create(config);
    });

    config.key = 'death';
    config.frames = scene.anims.generateFrameNumbers('mario', {
        start: 22,
        end: 22
    });
    scene.anims.create(config);

    // Didn't find a good way to create an animation with frame names without a pattern.
    let frames = [];
    (['mario/half', 'mario/stand', 'mario/half', 'mario/standSuper', 'mario/half', 'mario/standSuper']).forEach(
        frame => {
            frames.push({
                frame,
                key: 'mario-sprites'
            });
        }
    );
    config = {
        key: 'grow',
        frames: frames,
        frameRate: 10,
        repeat: 0,
        repeatDelay: 0
    };
    scene.anims.create(config);
    config = {
        key: 'shrink',
        frames: frames.reverse(),
        frameRate: 10,
        repeat: 0,
        repeatDelay: 0
    };
    scene.anims.create(config);

    // ALL MARIO ANIMATIONS DONE
    config = {
        key: 'skelegon',
        frames: scene.anims.generateFrameNames('skelegon-walk', {
            prefix: 'skelegon/walk',
            start: 1,
            end: 5
        }),
        frameRate: 5,
        repeat: -1,
        repeatDelay: 0
    };
    scene.anims.create(config);
    config = {
        key: 'skelegonDead',
        frames: scene.anims.generateFrameNames('skelegon-dead', {
            prefix: 'skelegon/dead',
            start: 1,
            end: 8
        }),
        frameRate: 4,
        repeat: -1,
        repeatDelay: 0
    };
    scene.anims.create(config);
    config = {
        key: 'skeleton',
        frames: scene.anims.generateFrameNames('skeleton-walk', {
            prefix: 'skeleton/walk',
            start: 1,
            end: 13
        }),
        frameRate: 5,
        repeat: -1,
        repeatDelay: 0
    };
    scene.anims.create(config);
    config = {
        key: 'skeletonDead',
        frames: scene.anims.generateFrameNames('skeleton-dead', {
            prefix: 'skeleton/dead',
            start: 1,
            end: 16
        }),
        frameRate: 4,
        repeat: -1,
        repeatDelay: 0
    };
    scene.anims.create(config);
    config = {
        key: 'goomba',
        frames: scene.anims.generateFrameNames('mario-sprites', {
            prefix: 'goomba/walk',
            start: 1,
            end: 2
        }),
        frameRate: 5,
        repeat: -1,
        repeatDelay: 0
    };
    scene.anims.create(config);
    config = {
        key: 'goombaFlat',
        frames: [{
            key: 'mario-sprites',
            frame: 'goomba/flat'
        }]
    };
    scene.anims.create(config);
    config = {
        key: 'mario/climb',
        frames: scene.anims.generateFrameNames('mario-sprites', {
            prefix: 'mario/climb',
            end: 1
        }),
        frameRate: 5,
        repeat: -1,
        repeatDelay: 0
    };
    scene.anims.create(config);
    config = {
        key: 'mario/climbSuper',
        frames: scene.anims.generateFrameNames('mario-sprites', {
            prefix: 'mario/climbSuper',
            end: 1
        }),
        frameRate: 5,
        repeat: -1,
        repeatDelay: 0
    };
    scene.anims.create(config);
    config = {
        key: 'flag',
        frames: [{
            key: 'mario-sprites',
            frame: 'flag'
        }],
        repeat: -1
    };
    scene.anims.create(config);
    config = {
        key: 'mushroom',
        frames: [{
            frame: 'powerup/super',
            key: 'mario-sprites'
        }]
    };
    scene.anims.create(config);
    config = {
        key: 'coin',
        frames: scene.anims.generateFrameNames('mario-sprites', {
            prefix: 'coin/spin',
            start: 1,
            end: 4
        }),
        frameRate: 30,
        repeat: -1,
        repeatDelay: 0
    };
    scene.anims.create(config);

    config = {
        key: '1up',
        frames: [{
            frame: 'powerup/1up',
            key: 'mario-sprites'
        }]
    };
    scene.anims.create(config);

    config = {
        key: 'flower',
        frames: scene.anims.generateFrameNames('mario-sprites', {
            prefix: 'powerup/flower',
            start: 1,
            end: 4
        }),
        frameRate: 30,
        repeat: -1,
        repeatDelay: 0
    };
    scene.anims.create(config);

    config = {
        key: 'star',
        frames: scene.anims.generateFrameNames('mario-sprites', {
            prefix: 'powerup/star',
            start: 1,
            end: 4
        }),
        frameRate: 30,
        repeat: -1,
        repeatDelay: 0
    };
    scene.anims.create(config);
    config = {
        key: 'dpad',
        frames: [{
            frame: 'controller/dpad',
            key: 'mario-sprites'
        }]
    };
    scene.anims.create(config);
    config = {
        key: 'button',
        frames: [{
            frame: 'controller/button',
            key: 'mario-sprites'
        }]
    };
    scene.anims.create(config);

    config = {
        key: 'potionGreen',
        frames: [{
            frame: 'potion/green',
            key: 'potion-sprites'
        }]
    };
    scene.anims.create(config);

    config = {
        key: 'iceSpell',
        frames: scene.anims.generateFrameNames('ice-spell', {
            prefix: 'ice/projectile',
            start: 1,
            end: 3
        }),
        frameRate: 3,
        repeat: -1,
        repeatDelay: 0
    };
    scene.anims.create(config);

    config = {
        key: 'fireFly',
        frames: scene.anims.generateFrameNames('mario-sprites', {
            prefix: 'fire/fly',
            start: 1,
            end: 4
        }),
        frameRate: 4,
        repeat: -1,
        repeatDelay: 0
    };
    scene.anims.create(config);

    config = {
        key: 'fireExplode',
        frames: scene.anims.generateFrameNames('mario-sprites', {
            prefix: 'fire/explode',
            start: 1,
            end: 3
        }),
        frameRate: 30,
        repeat: 0,
        repeatDelay: 0
    };

    scene.anims.create(config);
}
