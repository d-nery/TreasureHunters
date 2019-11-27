export default class Skeleton extends Phaser.GameObjects.Sprite {
  constructor(scene) {
    super(scene);

    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);

    this.body.setSize(16, 16);
    this.body.offset.set(0, 0);

    this.name = "skeleton";
    this.speed = 50;
    this.frozen = false;
    this.alive = true;
    this.stopped = true;
    this.facing = "up";

    this.anims.play("standing-sk");

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
      this.anims.stop();
    } else {
      let anim = this.facing + "-sk";
      this.anims.play(anim, true);
    }
  }
}
