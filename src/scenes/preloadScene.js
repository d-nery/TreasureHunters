import tiles from "../assets/map/spritesheet.png";
import map from "../assets/map/map.json";
import ninjaSprites from "../assets/ninja.png";
import fireGirlSprites from "../assets/firegirl.png";
import wizardSprites from "../assets/wizard.png";
import archerSprites from "../assets/archer.png";
import fireball from "../assets/fireball.png";
import iceball from "../assets/iceball.png";
import arrow from "../assets/arrow.png";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    this.load.image("tiles", tiles);
    this.load.tilemapTiledJSON("map", map);

    this.load.spritesheet("fireball", fireball, {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("iceball", iceball, {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("arrow", arrow, {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("ninja", ninjaSprites, {
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
    this.load.spritesheet("archer", archerSprites, {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  create() {
    this.scene.start("MainScene");
  }
}
