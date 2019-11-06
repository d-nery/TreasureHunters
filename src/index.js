import "phaser";
import "@babel/polyfill";
import "./assets/css/style.css";

import MainScene from "./scenes/mainScene";
import PreloadScene from "./scenes/preloadScene";

const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 240;

const config = {
  backgroundColor: "#ffffff",
  scale: {
    parent: "game",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  },
  scene: [PreloadScene, MainScene],
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
      gravity: { y: 0 },
    },
  },
};

window.addEventListener("load", () => {
  console.log("%cWelcome to TreasureHunters!", ["background:brown", "color:white"].join(";"));
  let game = new Phaser.Game(config);
});
