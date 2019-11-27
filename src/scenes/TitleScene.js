import io from "socket.io-client";
import Logger from "../helpers/Logger";

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({
      key: "TitleScene",
    });

    this.logger = new Logger("TitleScene");
  }

  create() {
    this.socket = io();

    this.socket.on("denied", () => {
      // Show "Full room" message
      this.logger.warn("Connection request denied");
    });

    this.socket.once("connection-ok", () => {
      this.logger.info("🎉 Connection Success! Press space to enter game.");

      this.spacebar.once("down", event => {
        this.connectAndStartGame();
      });
    });

    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

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

  connectAndStartGame() {
    this.socket.emit("want-in");

    this.socket.once("in-ok", data => {
      this.scene.start("GameScene", {
        initialChar: data.charName,
        socket: this.socket,
        isMaster: data.isMaster,
      });
    });
  }
}
