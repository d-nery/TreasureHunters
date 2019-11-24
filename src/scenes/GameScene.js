import io from "socket.io-client";

import Character from "../sprites/Character";
import FireBall from "../sprites/FireBall";
import IceBall from "../sprites/IceBall";
import Arrow from "../sprites/Arrow";
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

    this.map.addCollisionToSprite(this.firegirl);
    this.map.addCollisionToSprite(this.wizard);
    this.map.addCollisionToSprite(this.archer);
    this.map.addCollisionToSprite(this.ninja);

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

    this.socket.on("playerMoved", char => {
      if (char.takenBy == this.socket.id) {
        return;
      }

      this.updateOtherChar(char);
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
