import Projectile from "./projectile";

export default class Fireball extends Projectile {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame, "fireball");
  }
}
