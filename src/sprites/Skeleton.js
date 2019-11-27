export default class Skeleton extends Phaser.GameObjects.Sprite {
  constructor(scene) {
    super(scene);

    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);

    this.body.setSize(16, 16);
    this.body.offset.set(0, 0);

    this.name = "skeleton";
    this.speed = 10;
    this.frozen = false;
    this.alive = true;
    this.stopped = true;
    this.facing = "up";
    this.freezeTime = 0;

    this.anims.play("standing-sk");
    this.setPipeline("Light2D");

    this.body.setCollideWorldBounds(true);
  }

  stop() {
    this.body.setVelocity(0);
    this.stopped = true;
    this.anims.stop();
  }

  isFrozen() {
    return this.freezeTime > 0;
  }

  getMovementData() {
    return {
      x: this.setVe,
      y: c.y,
      direction: this.facing,
    };
  }

  update(time, delta) {
    this.freezeTime -= delta;

    if (this.isFrozen()) {
      this.body.setImmovable(true);
      this.body.moves = false;
      return;
    }

    this.body.setImmovable(false);
    this.body.moves = true;

    this.animate();
  }

  freeze() {
    if (!this.isFrozen()) {
      this.anims.play("skeleton-freeze", true);
    }

    this.freezeTime = 1500;
  }

  moveRandom() {
    if (!this.stopped) {
      return;
    }

    this.stopped = false;
    let time = Phaser.Math.Between(100, 1000);
    let speedX = Phaser.Math.Between(10, 30);
    let speedY = Phaser.Math.Between(10, 30);

    setTimeout(() => {
      let goLeft = Math.random() > 0.5;
      let goUp = Math.random() > 0.5;

      if (goLeft) {
        this.body.setVelocityX(-speedX);
      } else {
        this.body.setVelocityX(speedX);
      }

      if (goUp) {
        this.body.setVelocityY(-speedY);
      } else {
        this.body.setVelocityY(speedY);
      }

      if (speedX > speedY) {
        this.facing = goLeft ? "left" : "right";
      } else {
        this.facing = goUp ? "up" : "down";
      }

      setTimeout(() => {
        this.stop();
      }, 500);
    }, time);
  }

  animate() {
    if (this.isFrozen()) {
      return;
    }

    if (this.stopped) {
      this.anims.stop();
    } else {
      let anim = this.facing + "-sk";
      this.anims.play(anim, true);
    }
  }

  kill() {
    this.setActive(false);

    this.destroy();
  }
}
