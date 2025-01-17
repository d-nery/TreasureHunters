export default class Boss extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, config.key);

    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);

    let size = config.size || 16;
    this.body.setSize(size, size);
    this.body.offset.set(0, 0);

    this.name = "boss";
    this.animSuffix = config.suffix;
    this.speed = config.speed || 80;
    this.frozen = false;
    this.alive = true;
    this.stopped = true;
    this.facing = "up";
    this.freezeTime = 0;

    this.life = 1000;

    this.anims.play("king-standing");
    this.setPipeline("Light2D");

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

  freeze() {
    if (!this.isFrozen()) {
      this.anims.play("king-freeze", true);
    }

    this.freezeTime = 2500;
  }

  isFrozen() {
    return this.freezeTime > 0;
  }

  animate() {
    if (this.isFrozen()) {
      return;
    }

    if (this.stopped) {
      let anim = "king-standing";
      this.anims.play(anim, true);
    } else if (this.facing == "up") {
      let anim = "king-up";
      this.anims.play(anim, true);
    } else if (this.facing == "down") {
      let anim = "king-down";
      this.anims.play(anim, true);
    }
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

  kill(amt = 100) {
    this.life -= amt;

    if (this.life <= 0) {
      this.setActive(false);
      this.setVisible(false);
      this.scene.physics.world.disable(this);
    }
  }

  moveRandom() {
    if (!this.stopped) {
      return;
    }

    this.stopped = false;
    let time = Phaser.Math.Between(100, 1000);
    let speedY = Phaser.Math.Between(5, 15);

    setTimeout(() => {
      let goUp = Math.random() > 0.5;

      if (goUp) {
        this.body.setVelocityY(-speedY);
      } else {
        this.body.setVelocityY(speedY);
      }

      this.facing = goUp ? "up" : "down";

      setTimeout(() => {
        this.stop();
      }, 1000);
    }, time);
  }
}
