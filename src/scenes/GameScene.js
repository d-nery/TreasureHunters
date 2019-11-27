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

    // if (this.isMaster) {
    //   // Creates all enemies and send their information to the server
    //   this.createEnemies();
    // } else {
    //   this.registerEnemyUpdate();
    // }

    // this.addAllEnemyCollisions();

    this.scene.launch("HUDScene");
    this.hud = this.scene.get("HUDScene");

    this.hud.events.on("create", () => {
      this.hud.showDialog(this.currentCharacter.name);
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

    this.iceballs = this.add.group({
      classType: IceBall,
      maxSize: 5,
      runChildUpdate: false,
    });

    this.arrows = this.add.group({
      classType: Arrow,
      maxSize: 5,
      runChildUpdate: false,
    });

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
      x: 262,
      y: 406,
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

    // this.physics.add.overlap(this.firegirl, this.boss, this.onMeetEnemy, false, this);
    // this.physics.add.overlap(this.firegirl, this.enemy1, this.onMeetEnemy, false, this);
    // this.physics.add.overlap(this.wizard, this.boss, this.onMeetEnemy, false, this);
    // this.physics.add.overlap(this.wizard, this.enemy1, this.onMeetEnemy, false, this);
    // this.physics.add.overlap(this.archer, this.boss, this.onMeetEnemy, false, this);
    // this.physics.add.overlap(this.archer, this.enemy1, this.onMeetEnemy, false, this);
    // this.physics.add.overlap(this.ninja, this.boss, this.onMeetEnemy, false, this);
    // this.physics.add.overlap(this.ninja, this.enemy1, this.onMeetEnemy, false, this);
    // this.physics.add.overlap(this.boss, this.iceballs, this.onFreezeEnemy, false, this);
    // this.physics.add.overlap(this.boss, this.fireballs, this.onHitBoss, false, this);
    // this.physics.add.overlap(this.boss, this.arrows, this.onHitBoss, false, this);
    // this.physics.add.overlap(this.enemy1, this.fireballs, this.onHitEnemy, false, this);
    // this.physics.add.overlap(this.enemy1, this.iceballs, this.onFreezeEnemy, false, this);
    // this.physics.add.overlap(this.enemy1, this.arrows, this.onHitEnemy, false, this);
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

  onMeetEnemy(player, enemy) {
    if (this.currentCharacter.name == "firegirl") {
      this.logger.debug("The firegirl has died!");
      this.currentCharacter.setPosition(200, 504);
      this.currentCharacter.stopped = true;
      this.currentCharacter.facing = "up";
    } else if (this.currentCharacter.name == "wizard") {
      this.logger.debug("The wizard has died!");
      this.currentCharacter.setPosition(232, 504);
      this.currentCharacter.stopped = true;
      this.currentCharacter.facing = "up";
    } else if (this.currentCharacter.name == "ninja") {
      this.logger.debug("The ninja has died!");
      this.currentCharacter.setPosition(248, 504);
      this.currentCharacter.stopped = true;
      this.currentCharacter.facing = "up";
    } else if (this.currentCharacter.name == "archer") {
      this.logger.debug("The archer has died!");
      this.currentCharacter.setPosition(216, 504);
      this.currentCharacter.stopped = true;
      this.currentCharacter.facing = "up";
    }
  }

  onHitEnemy(enemy, projectile) {
    this.logger.debug("The enemy has been slain!");
    //this.socket.emit("enemyHit", enemy);
  }

  onFreezeEnemy(enemy, projectile) {
    this.logger.debug("The boss is frozen solid!");
    enemy.freeze = true;
    //this.socket.emit("freezeEnemy", boss);
  }

  onHitBoss(boss, projectile) {
    this.logger.debug("Not very effective!");
  }

  updateEnemies(enem) {
    let enemy = null;
    if (enem.name === "skeleton1") {
      enemy = this.enemy1;
    } else if (enem.name === "skeleton2") {
    } else if (enem.name === "skeleton3") {
    }

    if (!enemy) {
      return;
    }
    enemy.facing = enem.direction;
    enemy.setVelocityX(enem.velx);
    enemy.setVelocityY(enem.vely);
    enemy.animate();
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
