import Projectile from "./Projectile";

export default class IceBall extends Projectile {
  constructor(scene) {
    super(scene, "iceball");
    this.music = new Audio('https://freesound.org/people/Timbre/sounds/221683/download/221683__timbre__another-magic-wand-spell-tinkle.flac');
  
    // this.light = this.scene.lights.addLight(this.x, this.y, 100, 0xed6ecef, 2);
  }
}
