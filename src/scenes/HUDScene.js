import { mapCanvasValueToGameScale } from "../helpers/scale.js";

export default class HUDScene extends Phaser.Scene {
  constructor() {
    super({ key: "HUDScene" });
  }

  create() {
    console.log("Starting HUD");
    this.scene.bringToTop();
    this.loadImages();
    this.gameScene = this.scene.get("GameScene");
  }

  loadImages() {
    let centerX = this.sys.game.config.width / 2;
    let centerY = this.sys.game.config.height / 2;

    this.frames = {
      wizard: this.add.image(centerX, centerY, "wiz-frame"),
      firegirl: this.add.image(centerX, centerY, "fg-frame"),
      ninja: this.add.image(centerX, centerY, "nin-frame"),
      archer: this.add.image(centerX, centerY, "arc-frame"),
    };

    let w = this.frames["wizard"].width;
    let scale = this.sys.game.config.width / w;

    for (let frame of Object.values(this.frames)) {
      frame
        .setActive(false)
        .setVisible(false)
        .setScale(scale);
    }

    this.thumbs = {
      wizard: this.add.image(0, 0, "wiz-thumb").setVisible(false),
      firegirl: this.add.image(0, 0, "fg-thumb").setVisible(false),
      ninja: this.add.image(0, 0, "nin-thumb").setVisible(false),
      archer: this.add.image(0, 0, "arc-thumb").setVisible(false),
    };
  }

  placeThumbnails(key) {
    console.log("Changing thumbnails, main:", key);

    let h = this.thumbs["wizard"].height;
    let w = this.thumbs["wizard"].width;
    let scale = (this.sys.game.config.height * 0.1) / h;

    let mainThumb = this.thumbs[key];
    mainThumb._thumbScale = scale;

    let takenThumbs = [];
    let availableThumbs = [];

    for (let [k, v] of Object.entries(this.thumbs)) {
      if (k === key) {
        continue;
      }

      if (this.gameScene[k].takenBy != null) {
        v._thumbScale = scale * 0.6;
        takenThumbs.push(v);
      } else {
        v._thumbScale = scale * 0.4;
        availableThumbs.push(v);
      }
    }

    let finalThumbnails = [mainThumb, ...takenThumbs, ...availableThumbs];

    let scales = finalThumbnails.map(t => t._thumbScale);

    let margin = mapCanvasValueToGameScale(this, 10);

    let yPos = [
      (h * scales[0]) / 2 + margin,
      h * scales[0] + margin * 2 + (h * scales[1]) / 2,
      h * scales[0] + margin * 3 + h * scales[1] + (h * scales[2]) / 2,
      h * scales[0] + margin * 4 + h * scales[1] + h * scales[2] + (h * scales[3]) / 2,
    ];

    finalThumbnails.forEach((thumb, i) => {
      this.tweens.add({
        targets: thumb,
        x: (w * scales[i]) / 2 + margin,
        y: yPos[i],
        scale: scales[i],
        ease: "Linear",
        duration: 200,
        repeat: 0,
        yoyo: false,
        onStart: () => thumb.setVisible(true),
      });
    });
  }

  hideDialogs() {
    for (let frame of Object.values(this.frames)) {
      frame.setAlpha(0);
    }
  }

  showDialog(char) {
    let textX = mapCanvasValueToGameScale(this, 16 * 8);
    let textY = mapCanvasValueToGameScale(this, 16 * 45);
    let textSize = mapCanvasValueToGameScale(this, 26) + "px";

    this.tweens.add({
      targets: this.frames[char],
      alpha: { from: 0, to: 1 },
      ease: "Linear",
      duration: 100,
      repeat: 0,
      yoyo: false,
      onStart: () => this.frames[char].setActive(true).setVisible(true),
      onComplete: () => {
        this.renderedText = this.add
          .text(textX, textY, "Hello World", {
            fontFamily: "Dungeon",
            fontSize: textSize,
          })
          .setOrigin(0);
      },
    });

    setTimeout(() => {
      this.tweens.add({
        targets: this.frames[char],
        alpha: { from: 1, to: 0 },
        ease: "Linear",
        duration: 100,
        repeat: 0,
        yoyo: false,
        onStart: () => {
          this.renderedText.destroy();
        },
        onComplete: () => {
          this.frames[char].setActive(false).setVisible(false);
        },
      });
    }, 5000);
  }


  showInfoDialog(char,text) {
    let textX = mapCanvasValueToGameScale(this, 16 * 8);
    let textY = mapCanvasValueToGameScale(this, 16 * 45);
    let textSize = mapCanvasValueToGameScale(this, 26) + "px";

    this.tweens.add({
      targets: this.frames[char],
      alpha: { from: 0, to: 1 },
      ease: "Linear",
      duration: 100,
      repeat: 0,
      yoyo: false,
      onStart: () => this.frames[char].setActive(true).setVisible(true),
      onComplete: () => {
        this.renderedText = this.add
          .text(textX, textY, text, {
            fontFamily: "Dungeon",
            fontSize: textSize,
          })
          .setOrigin(0);
      },
    });

    setTimeout(() => {
      this.tweens.add({
        targets: this.frames[char],
        alpha: { from: 1, to: 0 },
        ease: "Linear",
        duration: 100,
        repeat: 0,
        yoyo: false,
        onStart: () => {
          this.renderedText.destroy();
        },
        onComplete: () => {
          this.frames[char].setActive(false).setVisible(false);

        },
      });
    }, 5000);
  }
}
