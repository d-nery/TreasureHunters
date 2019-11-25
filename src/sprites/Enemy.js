export default class Enemy extends Phaser.GameObjects.Sprite {
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
    return {
      x: this.setVe,
      y: c.y,
      direction: this.facing,
    };
  }

  animate() {
    if (this.stopped) {
      let anim = this.freeze + this.animSuffix;
      this.anims.play(anim, true);
    } else if (this.stopped) {
      this.anims.stop();
    } else {
      let anim = this.facing + this.animSuffix;
      this.anims.play(anim, true);
    }
  }
}
