const createAnimations = scene => {
  scene.anims.create({
    key: "fireball",
    frames: scene.anims.generateFrameNames("spriteAtlas", {
      start: 1,
      end: 2,
      zeroPad: 2,
      prefix: "fireball/",
      suffix: ".png",
    }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "iceball",
    frames: scene.anims.generateFrameNames("spriteAtlas", {
      start: 1,
      end: 2,
      zeroPad: 2,
      prefix: "iceball/",
      suffix: ".png",
    }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "arrow",
    frames: scene.anims.generateFrameNames("spriteAtlas", {
      start: 1,
      end: 2,
      zeroPad: 2,
      prefix: "arrow/",
      suffix: ".png",
    }),
    frameRate: 10,
    repeat: -1,
  });

  for (let char of [
    ["-fg", "firegirl", 10],
    ["-wiz", "wizard", 5],
    ["-arch", "archer", 10],
    ["-nj", "ninja", 12],
    ["-sk", "skeleton", 6],
  ]) {
    scene.anims.create({
      key: "standing" + char[0],
      frames: scene.anims.generateFrameNames("spriteAtlas", {
        start: 2,
        end: 2,
        zeroPad: 2,
        prefix: `${char[1]}/down/`,
        suffix: ".png",
      }),
      frameRate: char[2],
      repeat: -1,
    });

    scene.anims.create({
      key: "freeze" + char[0],
      frames: scene.anims.generateFrameNames("spriteAtlas", {
        start: 1,
        end: 1,
        zeroPad: 2,
        prefix: `${char[1]}/frozen/`,
        suffix: ".png",
      }),
      frameRate: char[2],
      repeat: -1,
    });

    scene.anims.create({
      key: "left" + char[0],
      frames: scene.anims.generateFrameNames("spriteAtlas", {
        start: 1,
        end: 4,
        zeroPad: 2,
        prefix: `${char[1]}/left/`,
        suffix: ".png",
      }),
      frameRate: char[2],
      repeat: -1,
    });

    scene.anims.create({
      key: "right" + char[0],
      frames: scene.anims.generateFrameNames("spriteAtlas", {
        start: 1,
        end: 4,
        zeroPad: 2,
        prefix: `${char[1]}/right/`,
        suffix: ".png",
      }),
      frameRate: char[2],
      repeat: -1,
    });

    scene.anims.create({
      key: "up" + char[0],
      frames: scene.anims.generateFrameNames("spriteAtlas", {
        start: 1,
        end: 4,
        zeroPad: 2,
        prefix: `${char[1]}/up/`,
        suffix: ".png",
      }),
      frameRate: char[2],
      repeat: -1,
    });

    scene.anims.create({
      key: "down" + char[0],
      frames: scene.anims.generateFrameNames("spriteAtlas", {
        start: 1,
        end: 4,
        zeroPad: 2,
        prefix: `${char[1]}/down/`,
        suffix: ".png",
      }),
      frameRate: char[2],
      repeat: -1,
    });
  }

  scene.anims.create({
    key: "skeleton-freeze",
    frames: scene.anims.generateFrameNames("spriteAtlas", {
      start: 1,
      end: 1,
      zeroPad: 2,
      prefix: `skeleton/frozen/`,
      suffix: ".png",
    }),
    frameRate: 8,
    repeat: -1,
  });

  scene.anims.create({
    key: "firefont",
    frames: scene.anims.generateFrameNames("spriteAtlas", {
      start: 1,
      end: 3,
      zeroPad: 2,
      prefix: `firefont/`,
      suffix: ".png",
    }),
    frameRate: 8,
    repeat: -1,
  });

  scene.anims.create({
    key: "king-standing",
    frames: scene.anims.generateFrameNames("spriteAtlas", {
      start: 2,
      end: 2,
      zeroPad: 2,
      prefix: `king/down/`,
      suffix: ".png",
    }),
    frameRate: 6,
    repeat: -1,
  });

  scene.anims.create({
    key: "king-up",
    frames: scene.anims.generateFrameNames("spriteAtlas", {
      start: 1,
      end: 4,
      zeroPad: 2,
      prefix: `king/up/`,
      suffix: ".png",
    }),
    frameRate: 6,
    repeat: -1,
  });

  scene.anims.create({
    key: "king-down",
    frames: scene.anims.generateFrameNames("spriteAtlas", {
      start: 1,
      end: 4,
      zeroPad: 2,
      prefix: `king/down/`,
      suffix: ".png",
    }),
    frameRate: 6,
    repeat: -1,
  });

  scene.anims.create({
    key: "king-freeze",
    frames: scene.anims.generateFrameNames("spriteAtlas", {
      start: 1,
      end: 1,
      zeroPad: 2,
      prefix: `king/frozen/`,
      suffix: ".png",
    }),
    frameRate: 6,
    repeat: -1,
  });

  scene.anims.create({
    key: "river",
    frames: scene.anims.generateFrameNames("spriteAtlas", {
      start: 1,
      end: 3,
      zeroPad: 2,
      prefix: `water/river/`,
      suffix: ".png",
    }),
    frameRate: 6,
    repeat: -1,
  });

  scene.anims.create({
    key: "riverfont",
    frames: scene.anims.generateFrameNames("spriteAtlas", {
      start: 1,
      end: 3,
      zeroPad: 2,
      prefix: `water/fontriver/`,
      suffix: ".png",
    }),
    frameRate: 8,
    repeat: -1,
  });

  scene.anims.create({
    key: "waterfont",
    frames: scene.anims.generateFrameNames("spriteAtlas", {
      start: 1,
      end: 3,
      zeroPad: 2,
      prefix: `water/font/`,
      suffix: ".png",
    }),
    frameRate: 8,
    repeat: -1,
  });
};

export default createAnimations;
