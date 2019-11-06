import io from "socket.io-client";

import Fireball from "../objects/fireball";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  create() {
    this.socket = io();

    this.createMap();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.tab = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);

    this.socket.on("character", charIdx => {
      console.log("Received my character index: ", charIdx);

      this.charIdx = charIdx;
    });

    this.socket.on("allCharacters", chars => {
      console.log("Received allCharacters event: ", chars);

      this.allCharacters = chars;
      this.createCharacters();
      this.createAnimations();
      this.updateCamera();

      this.physics.add.collider(this.containers[this.charIdx], this.obstacles);
    });

    this.socket.on("updateCharacter", charIdx => {
      console.log("Received my character index: ", charIdx);

      this.charIdx = charIdx;
      this.updateCamera();
    });

    this.socket.on("newPlayer", playerChar => {
      console.log("New player connected ", playerChar);
    });

    this.socket.on("playerMoved", char => {
      if (char.takenBy == this.socket.id) {
        return;
      }

      this.updateOtherChar(char);
    });

    this.fireballs = this.add.group({
      classType: Fireball,
      maxSize: 10,
      runChildUpdate: true,
    });

    this.lastFired = 0;
  }

  createMap() {
    this.map = this.make.tilemap({
      key: "map",
    });

    let tiles = this.map.addTilesetImage("spritesheet", "tiles", 16, 16, 0, 0);

    this.map.createStaticLayer("Grass", tiles, 0, 0);
    this.obstacles = this.map.createStaticLayer("Obstacles", tiles, 0, 0);
    this.map.createStaticLayer("Visual_torches", tiles, 0, 0);
    this.map.createStaticLayer("Door_Alavanca", tiles, 0, 0);

    this.obstacles.setCollisionByExclusion([-1]);

    this.physics.world.bounds.width = this.map.widthInPixels;
    this.physics.world.bounds.height = this.map.heightInPixels;
  }

  createAnimations() {
    console.log("createAnimations() start");

    const char = this.allCharacters[this.charIdx];
    console.log("createAnimations() creating for ", char);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers(char.spritename, {
        frames: char.leftFrames,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers(char.spritename, {
        frames: char.rightFrames,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers(char.spritename, {
        frames: char.upFrames,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers(char.spritename, {
        frames: char.downFrames,
      }),
      frameRate: 10,
      repeat: -1,
    });

    console.log("createAnimations() done");
  }

  createCharacters() {
    console.log("createCharacters() start");

    this.characterSprites = [];
    this.containers = [];

    for (let char of this.allCharacters) {
      const _char = this.add.sprite(0, 0, char.spritename, char.idlespriteidx);
      const container = this.add.container(char.x, char.y);
      container.setSize(16, 16);
      container.direction = 0

      this.physics.world.enable(container);
      container.add(_char);

      // don't go out of the map
      container.body.setCollideWorldBounds(true);

      this.characterSprites.push(_char);
      this.containers.push(container);
    }

    console.log("createCharacters() done");
  }

  createPlayer(playerInfo) {
    // our player sprite created through the physics system
    this.player = this.add.sprite(0, 0, "player", playerInfo.idlespriteidx);

    this.container = this.add.container(playerInfo.x, playerInfo.y);
    this.container.setSize(16, 16);
    this.physics.world.enable(this.container);
    this.container.add(this.player);

    // update camera
    this.updateCamera();

    // don't go out of the map
    this.container.body.setCollideWorldBounds(true);
  }

  addOtherPlayers(playerInfo) {
    const otherPlayer = this.add.sprite(
      playerInfo.x,
      playerInfo.y,
      "player",
      playerInfo.idlespriteidx
    );
    otherPlayer.playerId = playerInfo.takenBy;
    this.otherPlayers.add(otherPlayer);
  }

  updateCamera() {
    // limit camera to map
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.containers[this.charIdx]);
    this.cameras.main.roundPixels = true; // avoid tile bleed
  }

  updateOtherChar(char) {
    this.allCharacters[char.idx] = char;
    this.containers[char.idx].setPosition(char.x, char.y);
    this.characterSprites[char.idx].flipX = char.flipX;
  }

  createEnemies() {
    // where the enemies will be
    this.spawns = this.physics.add.group({
      classType: Phaser.GameObjects.Zone,
    });
    for (var i = 0; i < 30; i++) {
      var x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
      var y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
      // parameters are x, y, width, height
      this.spawns.create(x, y, 20, 20);
    }
  }

  update(time) {
    if (this.charIdx === undefined) {
      return;
    }

    const container = this.containers[this.charIdx];
    const charSprite = this.characterSprites[this.charIdx];


    container.body.setVelocity(0);

    // Horizontal movement
    if (this.cursors.left.isDown) {
      container.body.setVelocityX(-80);
    } else if (this.cursors.right.isDown) {
      container.body.setVelocityX(80);
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      container.body.setVelocityY(-80);
    } else if (this.cursors.down.isDown) {
      container.body.setVelocityY(80);
    }

    // Update the animation last and give left/right animations precedence over up/down animations
    if (this.cursors.left.isDown) {
      charSprite.anims.play("left", true);
      container.direction = 3;
    } else if (this.cursors.right.isDown) {
      charSprite.anims.play("right", true);
      container.direction = 1;
    } else if (this.cursors.up.isDown) {
      charSprite.anims.play("up", true);
      container.direction = 0;
    } else if (this.cursors.down.isDown) {
      charSprite.anims.play("down", true);
      container.direction = 2;
    } else {
      charSprite.anims.stop();
    }

    // TODO ver o lado que está apontando para atirar
    if (Phaser.Input.Keyboard.JustDown(this.spacebar) && time > this.lastFired) {
      let fb = this.fireballs.get();
      if (fb) {
        fb.fire(container.x, container.y, container.direction, time);

        this.socket.emit("shoot", {
          x: container.x,
          y: container.y,
          direction: container.direction,
        });

        this.lastFired = time + 200;
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.tab)) {
      container.body.setVelocity(0);
      charSprite.anims.stop();
      this.socket.emit("playerSwitch");
    }

    this.socket.emit("playerMovement", {
      x: container.x,
      y: container.y,
      flipX: charSprite.flipX,
    });
  }
}
