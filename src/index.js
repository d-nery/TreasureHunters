import "phaser";
import "@babel/polyfill";
import "./assets/css/style.css";

import MainScene from "./scenes/mainScene";
import PreloadScene from "./scenes/preloadScene";
import BootScene from "./scenes/BootScene";
import TitleScene from "./scenes/TitleScene";

const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 240;

window.addEventListener("load", () => {
  console.log("%cWelcome to TreasureHunters!", ["background:brown", "color:white"].join(";"));
  let game = new Phaser.Game({
    backgroundColor: "#ffffff",
    type: Phaser.WEBGL,
    pixelArt: true,
    parent: "game",
    roundPixels: true,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    scene: [BootScene, TitleScene, PreloadScene, MainScene],
    physics: {
      default: "arcade",
      arcade: {
        debug: true,
        gravity: { y: 0 },
      },
    },
  });
});
