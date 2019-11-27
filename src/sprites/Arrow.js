import Projectile from "./Projectile";

export default class Arrow extends Projectile {
  constructor(scene) {
    super(scene, "arrow");
    this.music = new Audio('https://freesound.org/people/LiamG_SFX/sounds/322224/download/322224__liamg-sfx__arrow-nock.wav');
  
  }
}
