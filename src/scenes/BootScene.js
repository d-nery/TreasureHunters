import Logger from "../helpers/Logger";

import tiles from "../assets/map/new_spritesheet.png";
import tilesN from "../assets/map/new_spritesheet_n.png";
import map from "../assets/map/map.json";
import textures from "../assets/textures/textures.json";

import logo from "../assets/ui/TreasureHunters.png";
import crew from "../assets/ui/tchurma.png";

import wizardBody from "../assets/ui/wizard.png";
import archerBody from "../assets/ui/archer.png";
import firegirlBody from "../assets/ui/firegirl.png";
import ninjaBody from "../assets/ui/ninja.png";

import ninjaThumb from "../assets/ui/ninja-thumb.png";
import wizardThumb from "../assets/ui/wizard-thumb.png";
import firegirlThumb from "../assets/ui/firegirl-thumb.png";
import archerThumb from "../assets/ui/archer-thumb.png";

import ninjaFrame from "../assets/ui/ninja-speaking-frame.png";
import wizardFrame from "../assets/ui/wizard-speaking-frame.png";
import firegirlFrame from "../assets/ui/firegirl-speaking-frame.png";
import archerFrame from "../assets/ui/archer-speaking-frame.png";

import createAnimations from "../helpers/animations";
import { DEBUG } from "../index";

class BootScene extends Phaser.Scene {
  constructor() {
    super({
      key: "BootScene",
    });

    this.logger = new Logger("Boot", "🕹");
  }

  preload() {
    this.logger.info("Starting");

    const progress = this.add.graphics();
    this.registry.set("debug", DEBUG);

    this.load.on("progress", value => {
      progress.clear();
      progress.fillStyle(0xaaaaaa, 1);
      progress.fillRect(0, this.sys.game.config.height / 2, this.sys.game.config.width * value, 30);
    });

    this.load.on("complete", () => {
      this.logger.info("Finished loading assets, creating animations");
      createAnimations(this);
      progress.destroy();
      this.logger.info("Finished Booting, going to TitleScene");
      this.scene.start("TitleScene");
    });

    this.load.image("logo", logo);
    this.load.image("crew", crew);
    this.load.image("tiles", [tiles, tilesN]);

    this.load.image("fg-body", firegirlBody);
    this.load.image("wiz-body", wizardBody);
    this.load.image("nin-body", ninjaBody);
    this.load.image("arc-body", archerBody);

    this.load.image("fg-thumb", firegirlThumb);
    this.load.image("wiz-thumb", wizardThumb);
    this.load.image("nin-thumb", ninjaThumb);
    this.load.image("arc-thumb", archerThumb);

    this.load.image("fg-frame", firegirlFrame);
    this.load.image("wiz-frame", wizardFrame);
    this.load.image("nin-frame", ninjaFrame);
    this.load.image("arc-frame", archerFrame);

    this.load.tilemapTiledJSON("map", map);

    this.load.multiatlas("spriteAtlas", "textures.json");
    this.load.audioSprite("sfx", "gamesfx.json", undefined, {
      instances: 5,
    });
  }
}

export default BootScene;
