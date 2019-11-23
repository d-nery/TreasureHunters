export default class HUDScene extends Phaser.Scene {
  constructor() {
    super({ key: "HUDScene" });
  }

  preload() {}

  loadImages() {
    this.wizBody = this.add.image(0, 0, "wiz-body");

    this.thumbs = {
      wizard: this.add.image(0, 0, "wiz-thumb"),
      firegirl: this.add.image(0, 0, "fg-thumb"),
      ninja: this.add.image(0, 0, "nin-thumb"),
      archer: this.add.image(0, 0, "arc-thumb"),
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

    let yPos = [
      (h * scales[0]) / 2 + 10,
      h * scales[0] + 20 + (h * scales[1]) / 2,
      h * scales[0] + 30 + h * scales[1] + (h * scales[2]) / 2,
      h * scales[0] + 40 + h * scales[1] + h * scales[2] + (h * scales[3]) / 2,
    ];

    finalThumbnails.forEach((thumb, i) => {
      thumb.setScale(scales[i]);
      thumb.setPosition((w * scales[i]) / 2 + 10, yPos[i]);
      thumb.setActive(true);
    });
  }

  create() {
    console.log("Starting HUD");
    this.scene.bringToTop();
    this.loadImages();

    let h = this.wizBody.height;
    let w = this.wizBody.width;
    let scale = (this.sys.game.config.height * 0.3) / h;
    this.wizBody.setScale(scale);

    this.wizBody.setPosition((w * scale) / 2 + 20, this.sys.game.config.height - (h * scale) / 2 - 20);
    this.wizBody.setActive(true);

    this.gameScene = this.scene.get("GameScene");

    // this.placeThumbnails("firegirl");
  }
}
