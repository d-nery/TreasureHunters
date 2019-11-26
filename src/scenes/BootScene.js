import tiles from "../assets/map/new_spritesheet.png";
import tilesN from "../assets/map/new_spritesheet_n.png";
import map from "../assets/map/map.json";
import textures from "../assets/textures/textures.json";

// import ninjaSprites from "../assets/characters/ninja.png";
// import fireGirlSprites from "../assets/characters/firegirl.png";
// import wizardSprites from "../assets/characters/wizard.png";
// import archerSprites from "../assets/characters/archer.png";

// import emptySprite from "../assets/props/emptySprite.png";
// import leverSprites from "../assets/props/lever.png";
// import leverSpritesN from "../assets/props/lever_n.png";
// import keySprites from "../assets/props/key.png";
// import chestSprites from "../assets/props/chest.png";
// import fireFontSprites from "../assets/props/firefont.png";
// import doorSprites from "../assets/props/door.png";

// import fireball from "../assets/projectiles/fireball.png";
// import iceball from "../assets/projectiles/iceball.png";
// import arrow from "../assets/projectiles/arrow.png";

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

// import skeletonSprites from "../assets/enemies/skeleton.png";
// import kingSprites from "../assets/enemies/king.png";

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

    // this.load.spritesheet("fireball", fireball, {
    //   frameWidth: 16,
    //   frameHeight: 16,
    // });

    // this.load.spritesheet("iceball", iceball, {
    //   frameWidth: 16,
    //   frameHeight: 16,
    // });

    // this.load.spritesheet("arrow", arrow, {
    //   frameWidth: 16,
    //   frameHeight: 16,
    // });

    // this.load.spritesheet("ninja", ninjaSprites, {
    //   frameWidth: 16,
    //   frameHeight: 16,
    // });

    // this.load.spritesheet("firegirl", fireGirlSprites, {
    //   frameWidth: 16,
    //   frameHeight: 16,
    // });

    // this.load.spritesheet("wizard", wizardSprites, {
    //   frameWidth: 16,
    //   frameHeight: 16,
    // });

    // this.load.spritesheet("archer", archerSprites, {
    //   frameWidth: 16,
    //   frameHeight: 16,
    // });

    // this.load.spritesheet("lever", [leverSprites, leverSpritesN], {
    //   frameWidth: 16,
    //   frameHeight: 16,
    // });

    // this.load.spritesheet("empty", emptySprite, {
    //   frameWidth: 16,
    //   frameHeight: 16,
    // });

    // this.load.spritesheet("key", keySprites, {
    //   frameWidth: 16,
    //   frameHeight: 16,
    // });

    // this.load.spritesheet("chest", chestSprites, {
    //   frameWidth: 16,
    //   frameHeight: 16,
    // });

    // this.load.spritesheet("firefont", fireFontSprites, {
    //   frameWidth: 16,
    //   frameHeight: 16,
    // });

    // this.load.spritesheet("skeleton", skeletonSprites, {
    //   frameWidth: 16,
    //   frameHeight: 16,
    // });

    // this.load.spritesheet("king", kingSprites, {
    //   frameWidth: 55,
    //   frameHeight: 55,
    // });

    // this.load.spritesheet("door", doorSprites, {
    //   frameWidth: 32,
    //   frameHeight: 32,
    // });
  }
}

export default BootScene;
