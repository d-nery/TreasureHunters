export default class Boss extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, config.key);

    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);

    this.name = config.key;
    this.animSuffix = config.suffix;
    this.speed = config.speed || 80;
    this.frozen = false;
    this.alive = true;
    this.stopped = true;
    this.facing = "up";


    this.anims.play("standing" + this.animSuffix);

    this.body.setCollideWorldBounds(true);
  }

  stop() {
    this.body.setVelocity(0);
    this.stopped = true;
    this.anims.stop();
  }

  getMovementData() {
    let c = this.getCenter();

    return {
      x: c.x,
      y: c.y,
      direction: this.facing,
      stopped: this.stopped,
    };
  }

  animate() {
    if (this.freeze) {
      let anim = "king-freeze";
      this.anims.play(anim, true);
    } else if (this.stopped) {
      let anim = "king-standing";
      this.anims.play(anim, true);
    } else if (this.facing == "up"){
      let anim = "king-up";
      this.anims.play(anim, true);
    } else if (this.facing == "down"){
      let anim = "king-down";
      this.anims.play(anim, true);
    }
  }
}
