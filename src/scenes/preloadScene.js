import tiles from "../assets/map/spritesheet.png";
import map from "../assets/map/map.json";
import playerSprites from "../assets/players.png";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload() {
    this.load.image('tiles', tiles);
    // map in json format
    this.load.tilemapTiledJSON('map', map);
    // our two characters
    this.load.spritesheet('player', playerSprites, {
      frameWidth: 16,
      frameHeight: 16
    });
  }

  create() {
    this.scene.start('MainScene')
  }
}
