import io from "socket.io-client";

import Fireball from "../objects/fireball";



export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  MapChange_removeDoor()
  {
    this.door.setVisible(false);
    this.door.setCollisionByExclusion([0]);
    this.socket.emit("destroyDoor", () => {
        this.socket.emit("destroyDoor");
    });
  }

  create() {
    this.socket = io();

    this.createMap();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.actionKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
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
    });

    this.socket.on("updateCharacter", charIdx => {
      console.log("Received new character: ", charIdx, this.allCharacters[charIdx].name);

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

    this.socket.on("destroyDoor", () => {
      this.door.setCollisionByExclusion([-1]);
      this.door.setVisible(false);
    });

    this.fireballs = this.add.group({
      classType: Fireball,
      maxSize: 10,
      runChildUpdate: true,
    });

    this.lastFired = 0;

    this.switch1 = true;
    this.switch2 = true;
    this.doorClosed = true;

  }

  createMap() {
    this.map = this.make.tilemap({
      key: "map",
    });

    let tiles = this.map.addTilesetImage("spritesheet", "tiles", 16, 16, 0, 0);

    this.map.createStaticLayer("Grass", tiles, 0, 0);
    this.obstacles = this.map.createStaticLayer("Obstacles", tiles, 0, 0);
    this.map.createStaticLayer("Visual_torches", tiles, 0, 0);
    
    this.door = this.map.createDynamicLayer("Door_Alavanca", tiles, 0, 0);
    //this.door.setCollisionBetween(66, 67);

    this.obstacles.setCollisionByExclusion([-1]);
    this.door.setCollisionByExclusion([-1]);

    this.physics.world.bounds.width = this.map.widthInPixels;
    this.physics.world.bounds.height = this.map.heightInPixels;
  }

  createAnimations() {
    console.log("createAnimations() start");
    
    this.anims.create({
      key: "fireball",
      frames: this.anims.generateFrameNumbers("fireball", {
        frames: [0, 1],
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "iceball",
      frames: this.anims.generateFrameNumbers("iceball", {
        frames: [0, 1],
      }),
      frameRate: 10,
      repeat: -1,
    });

    
    for (let char of this.allCharacters) {
      this.anims.create({
        key: `left-${char.name}`,
        frames: this.anims.generateFrameNumbers(char.spritename, {
          frames: char.leftFrames,
        }),
        frameRate: 10,
        repeat: -1,
      });

      this.anims.create({
        key: `right-${char.name}`,
        frames: this.anims.generateFrameNumbers(char.spritename, {
          frames: char.rightFrames,
        }),
        frameRate: 10,
        repeat: -1,
      });

      this.anims.create({
        key: `up-${char.name}`,
        frames: this.anims.generateFrameNumbers(char.spritename, {
          frames: char.upFrames,
        }),
        frameRate: 10,
        repeat: -1,
      });

      this.anims.create({
        key: `down-${char.name}`,
        frames: this.anims.generateFrameNumbers(char.spritename, {
          frames: char.downFrames,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

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

      this.physics.world.enable(container);
      container.add(_char);
      container.direction = "up";
      container.stopped = true;

      // don't go out of the map
      container.body.setCollideWorldBounds(true);
      this.physics.add.collider(container, this.obstacles);
      this.physics.add.collider(container, this.door, this.removeDoor, null, this);
      this.characterSprites.push(_char);
      this.containers.push(container);
    }

    console.log("createCharacters() done");
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
    const charSprite = this.characterSprites[char.idx];

    if (char.stopped) {
      charSprite.anims.stop();
    } else if (char.direction === "left") {
      charSprite.anims.play(`left-${char.name}`, true);
    } else if (char.direction === "right") {
      charSprite.anims.play(`right-${char.name}`, true);
    } else if (char.direction === "up") {
      charSprite.anims.play(`up-${char.name}`, true);
    } else if (char.direction === "down") {
      charSprite.anims.play(`down-${char.name}`, true);
    } else {
      charSprite.anims.stop();
    }
  }

  update(time) {
    if (this.charIdx === undefined) {
      return;
    }

    const char = this.allCharacters[this.charIdx];
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
    container.stopped = false;
    if (this.cursors.left.isDown) {
      charSprite.anims.play(`left-${char.name}`, true);
      container.direction = "left";
    } else if (this.cursors.right.isDown) {
      charSprite.anims.play(`right-${char.name}`, true);
      container.direction = "right";
    } else if (this.cursors.up.isDown) {
      charSprite.anims.play(`up-${char.name}`, true);
      container.direction = "up";
    } else if (this.cursors.down.isDown) {
      charSprite.anims.play(`down-${char.name}`, true);
      container.direction = "down";
    } else {
      charSprite.anims.stop();
      container.stopped = true;
    }

    //const container = this.add.container(char.x, char.y);
    //this.physics.collide(container, this.door, this.removeDoor, false, this);
    if (Phaser.Input.Keyboard.JustDown(this.actionKey)) {
        
      console.log(container.x,container.y);
      console.log(container);
        //curupira passa parede
        
        if (container.x > 90 && container.x < 110 && container.y > 320 && container.y < 330){
          //if (container.name == "Fire Girl"){
            container.x = 80;
            container.y = 350;
          //}
        }

        if (container.x > 82 && container.x < 88 && container.y > 355 && container.y < 365){
          //if (container.name == "Fire Girl"){
            container.x = 100;
            container.y = 280;
          //}
        }
        
        //lever1
        if (container.x > 30 && container.x < 50 && container.y > 220 && container.y < 250){
          this.switch1 = 0;
          if (this.doorClosed && !this.switch1 && !this.switch2){
            this.doorClosed = 0;
            this.MapChange_removeDoor();
          }
        }

        //lever2
        if (container.x > 30 && container.x < 60 && container.y > 400 && container.y < 430){
          this.switch2 = 0;
          if (this.doorClosed && !this.switch1 && !this.switch2){
            this.doorClosed = 0;
            this.MapChange_removeDoor();
          }
        } 
    
    }

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
      container.stopped = true;
      charSprite.anims.stop();
      this.socket.emit("playerSwitch");
    }

    this.socket.emit("playerMovement", {
      x: container.x,
      y: container.y,
      direction: container.direction,
      stopped: container.stopped,
    });
  }
}
