import Projectile from "./Projectile";

export default class IceBall extends Projectile {
  constructor(scene) {
    super(scene, "iceball");

    // this.light = this.scene.lights.addLight(this.x, this.y, 100, 0xed6ecef, 2);
  }
}
