export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({
      key: "TitleScene",
    });
  }

  preload() {}

  create() {
    let container = document.getElementsByClassName("container")[0];
    let sh = container.offsetHeight;
    let sw = container.offsetWidth;

    let multiplier = 1;
    if (sh > sw) {
      multiplier = sw / 320;
    } else {
      multiplier = sh / 240;
    }

    let el = document.getElementsByTagName("canvas")[0];
    el.style.width = 320 * multiplier - 4 + "px";
    el.style.height = 240 * multiplier - 4 + "px";

    this.title = this.add.image(this.sys.game.config.width / 2, 50, "logo");
    let w = this.title.width;
    let h = this.title.height;
    let scale = (this.sys.game.config.width * 0.5) / w;

    this.title.setDisplaySize(w * scale, h * scale);
    this.title.setVisible(true);

    this.input.on("pointerdown", () => {
      this.scene.start("MainScene");
    });
  }

  update(time, delta) {}
}
