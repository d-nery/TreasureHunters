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

  for (let char of scene.allCharacters) {
    scene.anims.create({
      key: `left-${char.name}`,
      frames: scene.anims.generateFrameNumbers(char.spritename, {
        frames: char.leftFrames,
      }),
      frameRate: 10,
      repeat: -1,
    });

    scene.anims.create({
      key: `right-${char.name}`,
      frames: scene.anims.generateFrameNumbers(char.spritename, {
        frames: char.rightFrames,
      }),
      frameRate: 10,
      repeat: -1,
    });

    scene.anims.create({
      key: `up-${char.name}`,
      frames: scene.anims.generateFrameNumbers(char.spritename, {
        frames: char.upFrames,
      }),
      frameRate: 10,
      repeat: -1,
    });

    scene.anims.create({
      key: `down-${char.name}`,
      frames: scene.anims.generateFrameNumbers(char.spritename, {
        frames: char.downFrames,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  console.log("[createAnimations] Done.");
};

export default createAnimations;
