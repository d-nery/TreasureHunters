import Projectile from "./Projectile";

export default class FireBall extends Projectile {
  constructor(scene) {
    super(scene, "fireball");

    // this.light = this.scene.lights.addLight(this.x, this.y, 100, 0xe25822, 2);
  }
}
