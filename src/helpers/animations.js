const createAnimations = scene => {
  console.log("[createAnimations] Starting...");

  scene.anims.create({
    key: "fireball",
    frames: scene.anims.generateFrameNumbers("fireball", {
      frames: [0, 1],
    }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "iceball",
    frames: scene.anims.generateFrameNumbers("iceball", {
      frames: [0, 1],
    }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "arrow",
    frames: scene.anims.generateFrameNumbers("arrow", {
      frames: [0, 1],
    }),
    frameRate: 10,
    repeat: -1,
  });

  for (let char of [
    ["-fg", "firegirl", 10],
    ["-wiz", "wizard", 5],
    ["-arch", "archer", 10],
    ["-nj", "ninja", 12],
  ]) {
    scene.anims.create({
      key: "standing" + char[0],
      frames: scene.anims.generateFrameNumbers(char[1], {
        frames: [1],
      }),
      frameRate: char[2],
      repeat: -1,
    });

    scene.anims.create({
      key: "left" + char[0],
      frames: scene.anims.generateFrameNumbers(char[1], {
        frames: [4, 3, 4, 5],
      }),
      frameRate: char[2],
      repeat: -1,
    });

    scene.anims.create({
      key: "right" + char[0],
      frames: scene.anims.generateFrameNumbers(char[1], {
        frames: [7, 6, 7, 8],
      }),
      frameRate: char[2],
      repeat: -1,
    });

    scene.anims.create({
      key: "up" + char[0],
      frames: scene.anims.generateFrameNumbers(char[1], {
        frames: [10, 9, 10, 11],
      }),
      frameRate: char[2],
      repeat: -1,
    });

    scene.anims.create({
      key: "down" + char[0],
      frames: scene.anims.generateFrameNumbers(char[1], {
        frames: [1, 0, 1, 2],
      }),
      frameRate: char[2],
      repeat: -1,
    });
  }

  scene.anims.create({
    key: "firefont-up",
    frames: scene.anims.generateFrameNumbers("firefont", {
      frames: [0, 1, 2],
    }),
    frameRate: 8,
    repeat: -1,
  });

  scene.anims.create({
    key: "firefont-down",
    frames: scene.anims.generateFrameNumbers("firefont", {
      frames: [3, 4, 5],
    }),
    frameRate: 8,
    repeat: -1,
  });

  console.log("[createAnimations] Done.");
};

export default createAnimations;
