import "phaser";
import "@babel/polyfill";
import "./css/style.css";

import BootScene from "./scenes/BootScene";
import TitleScene from "./scenes/TitleScene";
import GameScene from "./scenes/GameScene";
import HUDScene from "./scenes/HUDScene";

export const DEBUG = false;

const ratio = 320 / 240;
const DEFAULT_HEIGHT = window.innerHeight;
const DEFAULT_WIDTH = window.innerHeight * ratio;

window.addEventListener("load", () => {
  console.log("%cWelcome to TreasureHunters!", ["background:brown", "color:white"].join(";"));
  let game = new Phaser.Game({
    type: Phaser.WEBGL,
    backgroundColor: "#1f0f02",
    pixelArt: true,
    parent: "game",
    roundPixels: true,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, TitleScene, GameScene, HUDScene],
    physics: {
      default: "arcade",
      arcade: {
        debug: DEBUG,
        gravity: { y: 0 },
      },
    },
  });
});
