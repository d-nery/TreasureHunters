import Character from "../sprites/Character";
import FireBall from "../sprites/FireBall";
import IceBall from "../sprites/IceBall";
import Arrow from "../sprites/Arrow";
import Skeleton from "../sprites/Skeleton";
import Boss from "../sprites/Boss";
import Map from "../map/Map";
import Logger from "../helpers/Logger";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });

    this.logger = new Logger("GameScene", "🎮");
  }

  init(data) {
    this.logger.info("Initializing");

    this.socket = data.socket;
    this.isMaster = data.isMaster;
    this.charName = data.initialChar;
  }

  create() {
    this.logger.info("Creating");

    this.createMap();
    this.initCamera();
    this.initInput();
    this.createProjectiles();
    this.createCharacters();

    if (this.isMaster) {
      // Creates all enemies and send their information to the server
      this.createEnemies();
    } else {
      this.registerEnemyUpdate();
    }

    this.addAllEnemyCollisions();

    this.scene.launch("HUDScene");
    this.hud = this.scene.get("HUDScene");

    this.hud.events.on("create", () => {
      this.hud.showDialog(this.currentCharacter.name);
      this.hud.placeThumbnails(this.currentCharacter.name);
    });

    this.socket.on("allCharacters", characters => {
      this.logger.debug("Received allCharacters event");

      this.firegirl.takenBy = characters["firegirl"].takenBy;
      this.wizard.takenBy = characters["wizard"].takenBy;
      this.archer.takenBy = characters["archer"].takenBy;
      this.ninja.takenBy = characters["ninja"].takenBy;

      this.firegirl.setPosition(characters["firegirl"].x, characters["firegirl"].y);
      this.wizard.setPosition(characters["wizard"].x, characters["wizard"].y);
      this.archer.setPosition(characters["archer"].x, characters["archer"].y);
      this.ninja.setPosition(characters["ninja"].x, characters["ninja"].y);
    });

    this.socket.on("takenUpdate", characters => {
      this.logger.debug("Someone changed characters");

      this.firegirl.takenBy = characters["firegirl"].takenBy;
      this.wizard.takenBy = characters["wizard"].takenBy;
      this.archer.takenBy = characters["archer"].takenBy;
      this.ninja.takenBy = characters["ninja"].takenBy;

      this.hud.placeThumbnails(this.currentCharacter.name);
    });

    this.socket.on("newCharacter", char => {
      this.logger.debug("Got a newCharacter event:", char);
      this.currentCharacter.takenBy = null;

      if (char === "firegirl") {
        this.currentCharacter = this.firegirl;
      } else if (char === "wizard") {
        this.currentCharacter = this.wizard;
      } else if (char === "ninja") {
        this.currentCharacter = this.ninja;
      } else if (char === "archer") {
        this.currentCharacter = this.archer;
      }

      this.tweens.add({
        targets: this.cam,
        scrollX: this.currentCharacter.getCenter().x - 627,
        scrollY: this.currentCharacter.getCenter().y - 471,
        ease: "Quad.EaseInOut",
        duration: 300,
        repeat: 0,
        yoyo: false,
        onStart: () => this.cam.stopFollow(),
        onComplete: () => this.cam.startFollow(this.currentCharacter, true, 0.2, 0.2),
      });

      this.currentCharacter.takenBy = this.socket.id;

      this.hud.placeThumbnails(this.currentCharacter.name);
    });

    this.socket.on("playerMoved", char => {
      if (char.takenBy == this.socket.id) {
        return;
      }

      this.updateOtherChar(char);
    });

    this.socket.on("playerFired", fireData => {
      this.logger.debug(`${fireData.who} has fired at (${fireData.x}, ${fireData.y})!`);

      let projectiles = null;
      if (fireData.who === "firegirl") {
        projectiles = this.fireballs;
      } else if (fireData.who === "wizard") {
        projectiles = this.iceballs;
      } else if (fireData.who === "archer") {
        projectiles = this.arrows;
      }

      if (!projectiles) {
        return;
      }

      let proj = projectiles.get();

      if (proj) {
        proj.fire(fireData.x, fireData.y, fireData.direction);
      }
    });

    this.socket.emit("game-ready");
    this.sfx = this.sound.addAudioSprite("sfx");

    this.bgMusic = this.sound.addAudioSprite("sfx");
    this.bgMusic.play("bg_loop2", { loop: true });

    this.lights.enable().setAmbientColor(0xaaaaaa);
  }

  createMap() {
    this.logger.debug("Creating Map");
    this.map = new Map(this, "map");
  }

  createProjectiles() {
    this.logger.debug("Creating Projectiles");

    this.fireballs = this.add.group({
      classType: FireBall,
      maxSize: 5,
      runChildUpdate: false,
    });

    this.fireballs.name = "fireballs";

    this.iceballs = this.add.group({
      classType: IceBall,
      maxSize: 5,
      runChildUpdate: false,
    });

    this.iceballs.name = "iceballs";

    this.arrows = this.add.group({
      classType: Arrow,
      maxSize: 5,
      runChildUpdate: false,
    });

    this.arrows.name = "arrows";

    this.projectiles = this.add.group([this.fireballs, this.iceballs, this.arrows]);

    this.map.addWorldCollisionToProjectile(this.fireballs);
    this.map.addWorldCollisionToProjectile(this.iceballs);
    this.map.addWorldCollisionToProjectile(this.arrows);
  }

  createCharacters() {
    this.logger.debug("Creating Characters");

    this.firegirl = new Character({
      scene: this,
      key: "firegirl",
      x: 209,
      y: 456,
      suffix: "-fg",
      projectiles: this.fireballs,
      //   lightsource: this.lights
      //     .addLight(209, 456, 120)
      //     .setColor(0xe25822)
      //     .setIntensity(5),
    });

    this.wizard = new Character({
      scene: this,
      key: "wizard",
      x: 235,
      y: 456,
      suffix: "-wiz",
      projectiles: this.iceballs,
      speed: 50,
      //   lightsource: this.lights
      //     .addLight(235, 456, 120)
      //     .setColor(0xed6ecef)
      //     .setIntensity(3),
    });

    this.archer = new Character({
      scene: this,
      key: "archer",
      x: 183,
      y: 456,
      suffix: "-arch",
      projectiles: this.arrows,
    });

    this.ninja = new Character({
      scene: this,
      key: "ninja",
      x: 262,
      y: 456,
      suffix: "-nj",
      projectiles: null,
      speed: 120,
      size: 13,
    });

    this.characters = this.add.group([this.firegirl, this.wizard, this.archer, this.ninja]);

    if (this.charName === "firegirl") {
      this.currentCharacter = this.firegirl;
    } else if (this.charName === "wizard") {
      this.currentCharacter = this.wizard;
    } else if (this.charName === "ninja") {
      this.currentCharacter = this.ninja;
    } else if (this.charName === "archer") {
      this.currentCharacter = this.archer;
    }

    this.map.addWorldCollisionToCharacter(this.firegirl);
    this.map.addWorldCollisionToCharacter(this.wizard);
    this.map.addWorldCollisionToCharacter(this.archer);
    this.map.addWorldCollisionToCharacter(this.ninja);

    this.tweens.add({
      targets: this.cam,
      scrollX: this.currentCharacter.getCenter().x - 627,
      scrollY: this.currentCharacter.getCenter().y - 471,
      ease: "Quad.EaseInOut",
      duration: 300,
      repeat: 0,
      yoyo: false,
      onStart: () => this.cam.stopFollow(),
      onComplete: () => this.cam.startFollow(this.currentCharacter, true, 0.2, 0.2),
    });

    this.currentCharacter.takenBy = this.socket.id;
  }

  createEnemies() {
    this.logger.debug("Creating Enemies");

    this.boss = new Boss({
      scene: this,
      key: "king",
      x: 432,
      y: 77,
      suffix: "-kg",
      speed: 40,
      size: 55,
    });

    this.enemies = this.add.group({
      classType: Skeleton,
      maxSize: 20,
      runChildUpdate: false,
    });

    let spawnArea = this.map.spawnArea;
    let rect = Phaser.Geom.Polygon.GetAABB(spawnArea);

    let minX = rect.x;
    let maxX = rect.x + rect.width;
    let minY = rect.y;
    let maxY = rect.y + rect.height;
    let enemies = [];

    let newEnemy = this.enemies.get();
    while (newEnemy) {
      let newX = Phaser.Math.Between(minX, maxX);
      let newY = Phaser.Math.Between(minY, maxY);

      while (!spawnArea.contains(newX, newY)) {
        newX = Phaser.Math.Between(minX, maxX);
        newY = Phaser.Math.Between(minY, maxY);
      }

      newEnemy.setPosition(newX, newY);
      enemies.push([newX, newY]);
      newEnemy = this.enemies.get();
    }

    this.logger.debug("Sending enemy data to server");
    this.socket.emit("enemies", {
      boss: {
        x: 432,
        y: 77,
      },
      enemies: enemies,
    });

    this.map.addWorldCollisionToEnemy(this.boss);
    this.map.addWorldCollisionToEnemy(this.enemies);

    this.enemyMoveTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        for (let enemy of this.enemies.children.entries) {
          enemy.moveRandom();
        }
      },
      callbackScope: this,
      loop: true,
    });

    this.spawnNewEnemyTimer = this.time.addEvent({
      delay: 3000,
      callback: () => {
        let spawnArea = this.map.spawnArea;
        let rect = Phaser.Geom.Polygon.GetAABB(spawnArea);

        let minX = rect.x;
        let maxX = rect.x + rect.width;
        let minY = rect.y;
        let maxY = rect.y + rect.height;

        let newEnemy = this.enemies.get();

        if (newEnemy) {
          let newX = Phaser.Math.Between(minX, maxX);
          let newY = Phaser.Math.Between(minY, maxY);

          while (!spawnArea.contains(newX, newY)) {
            newX = Phaser.Math.Between(minX, maxX);
            newY = Phaser.Math.Between(minY, maxY);
          }

          newEnemy.setPosition(newX, newY);
          this.tweens.add({
            targets: newEnemy,
            alpha: { from: 1, to: 0 },
            yoyo: true,
            duration: 50,
            repeat: 3,
          });
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  registerEnemyUpdate() {
    this.logger.debug("Creating Enemies");

    this.boss = new Boss({
      scene: this,
      key: "king",
      x: 432,
      y: 77,
      suffix: "-kg",
      speed: 40,
      size: 55,
    });

    this.enemies = this.add.group({
      classType: Skeleton,
      maxSize: 20,
      runChildUpdate: false,
    });
  }

  addAllEnemyCollisions() {
    this.logger.debug("Adding enemy collision");

    const onMeetEnemy = (player, enemy) => {
      if (!player.alive) {
        return;
      }

      this.logger.debug(`${player.name} hit ${enemy.name}`);

      if (this.currentCharacter.name != player.name) {
        return;
      }

      this.currentCharacter.reset();
    };

    this.physics.add.overlap(this.characters, this.boss, onMeetEnemy, null, this);
    this.physics.add.overlap(this.characters, this.enemies, onMeetEnemy, null, this);

    const onProj = (enemy, proj) => {
      this.logger.debug("Hit enemy!", enemy.name, proj.name);
      this.sfx.play("hit");

      if (proj.name === "iceball") {
        enemy.freeze();
        proj.destroy();
      } else if (proj.name === "fireball") {
        enemy.kill();
        proj.destroy();
      } else if (proj.name === "arrow") {
        if (enemy.name === "skeleton") {
          proj.destroy();
        } else if (enemy.name === "boss") {
          enemy.kill();
          proj.destroy();
        }
      }
    };

    this.projectiles.children.each(projs => {
      this.physics.add.overlap(this.boss, projs, onProj, null, this);
      this.physics.add.overlap(this.enemies, projs, onProj, null, this);
    });
  }

  initInput() {
    this.logger.debug("Initializing input");

    this.tab = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);

    this.keys = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      fire: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      action: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
    };
  }

  initCamera() {
    this.logger.debug("Initializing camera");

    this.cam = this.cameras.main;
    this.cam.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    let targetWidth = 320;
    let currentWidth = this.scale.width;

    this.cam.setZoom(currentWidth / targetWidth);
    this.cam.roundPixels = true;
  }

  updateOtherChar(char) {
    let character = null;
    if (char.id === "firegirl") {
      character = this.firegirl;
    } else if (char.id === "wizard") {
      character = this.wizard;
    } else if (char.id === "ninja") {
      character = this.ninja;
    } else if (char.id === "archer") {
      character = this.archer;
    }

    if (!character) {
      return;
    }

    character.takenBy = char.takenBy;
    character.stopped = char.stopped;
    character.facing = char.direction;
    character.setPosition(char.x, char.y);
    character.animate();
  }

  update(time, delta) {
    if (this.currentCharacter == null) {
      return;
    }

    for (let fb of this.fireballs.children.entries) {
      fb.update(time, delta);
    }

    for (let ib of this.iceballs.children.entries) {
      ib.update(time, delta);
    }

    for (let arrow of this.arrows.children.entries) {
      arrow.update(time, delta);
    }

    for (let enemy of this.enemies.children.entries) {
      enemy.update(time, delta);
    }

    if (Phaser.Input.Keyboard.JustDown(this.tab)) {
      this.currentCharacter.stop();
      this.currentCharacter.takenBy = null;
      this.socket.emit("playerMovement", this.currentCharacter.getMovementData());
      this.socket.emit("playerSwitch");

      return;
    }

    this.currentCharacter.update(this.keys, time, delta);
    this.socket.emit("playerMovement", this.currentCharacter.getMovementData());

    if (this.currentCharacter.fired) {
      this.socket.emit("fired", this.currentCharacter.getLastFireData());
    }
  }
}
