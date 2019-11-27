import Projectile from "./Projectile";

export default class FireBall extends Projectile {
  constructor(scene) {
    super(scene, "fireball");
    this.music = new Audio('https://freesound.org/people/InspectorJ/sounds/484266/download/484266__inspectorj__party-pack-match-ignite-01-01.wav');
  
    // this.light = this.scene.lights.addLight(this.x, this.y, 100, 0xe25822, 2);
  }
}
