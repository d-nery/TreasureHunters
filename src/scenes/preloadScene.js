import tiles from "../assets/map/spritesheet.png";
import map from "../assets/map/map.json";
import playerSprites from "../assets/players.png";
import fireGirlSprites from "../assets/firegirl.png";
import wizardSprites from "../assets/wizard.png";
import fireball from "../assets/fireball.png";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    this.load.image("tiles", tiles);
    this.load.image("fireball", fireball);
    this.load.tilemapTiledJSON("map", map);
    this.load.spritesheet("player", playerSprites, {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("fireGirl", fireGirlSprites, {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("wizard", wizardSprites, {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  create() {
    this.scene.start("MainScene");
  }
}
