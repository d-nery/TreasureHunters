import io from "socket.io-client";

import Character from "../sprites/Character";
import FireBall from "../sprites/FireBall";
import IceBall from "../sprites/IceBall";
import Arrow from "../sprites/Arrow";
import Enemy from "../sprites/Enemy";
import Boss from "../sprites/Boss";
import Map from "../map/Map";
import { characters } from "../../server/characters";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  MapChange_removeDoor() {
    this.map.removeDoor();
    this.socket.emit("destroyDoor");
  }

  create() {
    this.socket = io();

    this.createMap();

    this.tab = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);

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

    this.firegirl = new Character({
      scene: this,
      key: "firegirl",
      x: 209,
      y: 456,
      suffix: "-fg",
      projectiles: this.fireballs,
    });

    this.wizard = new Character({
      scene: this,
      key: "wizard",
      x: 235,
      y: 456,
      suffix: "-wiz",
      projectiles: this.iceballs,
      speed: 50,
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
    });

    this.boss = new Boss({
      scene: this,
      key: "king",
      x: 262,
      y: 406,
      suffix: "-kg",
      speed: 40,
    });

    this.enemy1 = new Enemy({
      scene: this,
      key: "skeleton",
      x: 210,
      y: 350,
      suffix: "-sk",
      speed: 50,
    });

    this.enemy2 = new Enemy({
      scene: this,
      key: "skeleton",
      x: 230,
      y: 350,
      suffix: "-sk",
      speed: 50,
    });

    this.enemy3 = new Enemy({
      scene: this,
      key: "skeleton",
      x: 250,
      y: 350,
      suffix: "-sk",
      speed: 50,
    });

    //this.createEnemies();

    this.map.addCollisionToSprite(this.firegirl);
    this.map.addCollisionToSprite(this.wizard);
    this.map.addCollisionToSprite(this.archer);
    this.map.addCollisionToSprite(this.ninja);
    this.map.addCollisionToSprite(this.boss);
    this.map.addCollisionToSprite(this.enemy1);
    this.map.addCollisionToSprite(this.enemy2);
    this.map.addCollisionToSprite(this.enemy3);

    	
    this.physics.add.overlap(this.firegirl, this.boss, this.onMeetEnemy, false, this);
    this.physics.add.overlap(this.firegirl, this.enemy1, this.onMeetEnemy, false, this);
    this.physics.add.overlap(this.firegirl, this.enemy2, this.onMeetEnemy, false, this);
    this.physics.add.overlap(this.firegirl, this.enemy3, this.onMeetEnemy, false, this);

    this.physics.add.overlap(this.wizard, this.boss, this.onMeetEnemy, false, this);
    this.physics.add.overlap(this.wizard, this.enemy1, this.onMeetEnemy, false, this);
    this.physics.add.overlap(this.wizard, this.enemy2, this.onMeetEnemy, false, this);
    this.physics.add.overlap(this.wizard, this.enemy3, this.onMeetEnemy, false, this);

    this.physics.add.overlap(this.archer, this.boss, this.onMeetEnemy, false, this);
    this.physics.add.overlap(this.archer, this.enemy1, this.onMeetEnemy, false, this);
    this.physics.add.overlap(this.archer, this.enemy2, this.onMeetEnemy, false, this);
    this.physics.add.overlap(this.archer, this.enemy3, this.onMeetEnemy, false, this);

    this.physics.add.overlap(this.ninja, this.boss, this.onMeetEnemy, false, this);
    this.physics.add.overlap(this.ninja, this.enemy1, this.onMeetEnemy, false, this);
    this.physics.add.overlap(this.ninja, this.enemy2, this.onMeetEnemy, false, this);
    this.physics.add.overlap(this.ninja, this.enemy3, this.onMeetEnemy, false, this);

    this.physics.add.overlap(this.boss  , this.iceballs, this.onFreezeEnemy, false, this);
    this.physics.add.overlap(this.boss  , this.fireballs, this.onHitBoss, false, this);
    this.physics.add.overlap(this.boss  , this.arrows, this.onHitBoss, false, this);

    this.physics.add.overlap(this.enemy1, this.fireballs, this.onHitEnemy, false, this);
    this.physics.add.overlap(this.enemy1, this.iceballs, this.onHitEnemy, false, this);
    this.physics.add.overlap(this.enemy1, this.arrows, this.onHitEnemy, false, this);

    this.physics.add.overlap(this.enemy2, this.fireballs, this.onHitEnemy, false, this);
    this.physics.add.overlap(this.enemy2, this.iceballs, this.onHitEnemy, false, this);
    this.physics.add.overlap(this.enemy2, this.arrows, this.onHitEnemy, false, this);



    this.currentCharacter = null;
    this.initCamera();

    this.scene.launch("HUDScene");
    this.hud = this.scene.get("HUDScene");

    this.socket.on("allCharacters", characters => {
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
      this.firegirl.takenBy = characters["firegirl"].takenBy;
      this.wizard.takenBy = characters["wizard"].takenBy;
      this.archer.takenBy = characters["archer"].takenBy;
      this.ninja.takenBy = characters["ninja"].takenBy;

      this.hud.placeThumbnails(this.currentCharacter.name);
    });

    this.socket.on("newCharacter", char => {
      console.log("Got a newCharacter event:", char);
      if (this.currentCharacter) {
        this.currentCharacter.takenBy = null;
      } else {
        this.hud.showDialog(char);
      }

      if (char === "firegirl") {
        this.currentCharacter = this.firegirl;
      } else if (char === "wizard") {
        this.currentCharacter = this.wizard;
      } else if (char === "ninja") {
        this.currentCharacter = this.ninja;
      } else if (char === "archer") {
        this.currentCharacter = this.archer;
      }

      this.cameras.main.startFollow(this.currentCharacter);
      this.currentCharacter.takenBy = this.socket.id;

      this.hud.placeThumbnails(this.currentCharacter.name);
    });

    this.socket.on("newEnemy", enem => {
      console.log("Got a newEnemy event:", enem);
      if (this.currentCharacter) {
        this.currentCharacter.takenBy = null;
      } else {
        this.hud.showDialog(char);
      }

      if (enem === "enemy1") {
        this.currentCharacter = this.enemy1;
      } else if (enem === "enemy2") {
        this.currentCharacter = this.enemy2;
      } else if (enem === "enemy3") {
        this.currentCharacter = this.enemy3;
      }
    });

    this.socket.on("playerMoved", char => {
      if (char.takenBy == this.socket.id) {
        return;
      }

      this.updateOtherChar(char);
    });

    this.socket.on("EnemyMovement", enem => {

      this.updateEnemies(enem);
    });

    this.socket.on("playerFired", fireData => {
      console.log("A player has fired!", fireData);

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
  }

  createMap() {
    this.map = new Map(this, "map");
  }

  initCamera() {
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    let targetWidth = 320;
    let currentWidth = this.scale.width;

    this.cameras.main.setZoom(currentWidth / targetWidth);
    this.cameras.main.roundPixels = true;
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
    if (this.currentCharacter.id = "firegirl") {
      console.log("The firegirl has died!");
      this.currentCharacter.setPosition(200, 504);
      this.currentCharacter.stopped = true;
      this.currentCharacter.facing = "up";
    } else if (this.currentCharacter.id = "wizard") {
      console.log("The wizard has died!");
      this.currentCharacter.setPosition(232, 504);
      this.currentCharacter.stopped = true;
      this.currentCharacter.facing = "up";
    } else if (this.currentCharacter.id = "ninja") {
      console.log("The ninja has died!");
      this.currentCharacter.setPosition(248, 504);
      this.currentCharacter.stopped = true;
      this.currentCharacter.facing = "up";
    } else if (this.currentCharacter.id = "archer") {
      console.log("The archer has died!");
      this.currentCharacter.setPosition(216, 504);
      this.currentCharacter.stopped = true;
      this.currentCharacter.facing = "up";
    }
  }

  onHitEnemy(enemy, projectile) {
    console.log("The enemy has been slain!");
    //this.socket.emit("enemyHit", enemy);
  }

  onFreezeEnemy(boss, projectile) {
    console.log("The boss is frozen solid!");
    //this.socket.emit("freezeEnemy", boss);
  }

  onHitBoss(boss, projectile) {
    console.log("Not very effective!");
  }

  updateEnemies(enem) {
    let enemie = null;
    if (enem.name === "skeleton1") {
      enemie = this.enemy1;
    } else if (enem.name === "skeleton2") {
      enemie = this.enemy2;
    } else if (enem.name === "skeleton3") {
      enemie = this.enemy3;
    }

    if (!enemie) {
      return;
    }
    enemie.facing = enem.direction;
    enemie.setVelocityX(enem.velx);
    enemie.setVelocityY(enem.vely);
    enemie.animate();
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

    this.currentCharacter.update(this.keys, time, delta);
    this.socket.emit("playerMovement", this.currentCharacter.getMovementData());

    if (this.currentCharacter.fired) {
      this.socket.emit("fired", this.currentCharacter.getLastFireData());
    }

    if (Phaser.Input.Keyboard.JustDown(this.tab)) {
      this.currentCharacter.stop();
      this.currentCharacter.takenBy = null;
      this.socket.emit("playerMovement", this.currentCharacter.getMovementData());
      this.socket.emit("playerSwitch");
    }
  }
}
