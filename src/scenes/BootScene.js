import tiles from "../assets/map/spritesheet.png";
import map from "../assets/map/map.json";
import ninjaSprites from "../assets/ninja.png";
import fireGirlSprites from "../assets/firegirl.png";
import wizardSprites from "../assets/wizard.png";
import archerSprites from "../assets/archer.png";
import fireball from "../assets/fireball.png";
import iceball from "../assets/iceball.png";
import arrow from "../assets/arrow.png";
import logo from "../assets/img/TreasureHunters.png";
import crew from "../assets/img/tchurma.png";

import createAnimations from "../helpers/animations";
import { DEBUG } from "../index";

class BootScene extends Phaser.Scene {
  constructor() {
    super({
      key: "BootScene",
    });
  }

  preload() {
    const progress = this.add.graphics();
    this.registry.set("debug", DEBUG);

    this.load.on("progress", value => {
      progress.clear();
      progress.fillStyle(0xaaaaaa, 1);
      progress.fillRect(0, this.sys.game.config.height / 2, this.sys.game.config.width * value, 30);
    });

    this.load.on("complete", () => {
      createAnimations(this);
      progress.destroy();
      console.log("Finish Booting");
      this.scene.start("TitleScene");
    });

    this.load.image("logo", logo);
    this.load.image("crew", crew);
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

    this.load.spritesheet("firegirl", fireGirlSprites, {
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
}

export default BootScene;
