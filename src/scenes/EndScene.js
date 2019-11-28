import io from "socket.io-client";
import Logger from "../helpers/Logger";

export default class EndScene extends Phaser.Scene {
  constructor() {
    super({
      key: "EndScene",
    });

    this.logger = new Logger("EndScene");
  }

  create() {
    this.title = this.add.image(this.sys.game.config.width / 2, this.sys.game.config.height * 0.15, "logo");
    let w = this.title.width;
    let scale = (this.sys.game.config.width * 0.5) / w;

    this.title.setScale(scale);
    this.title.setVisible(true);

    this.crew = this.add.image(this.sys.game.config.width / 2, this.sys.game.config.height * 0.6, "crew");
    w = this.crew.width;
    scale = (this.sys.game.config.width * 0.5) / w;

    this.crew.setScale(scale);
    this.crew.setVisible(true);
  }
}
