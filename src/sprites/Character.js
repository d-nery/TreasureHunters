export default class Character extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, config.key);

    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);

    this.name = config.key;
    this.animSuffix = config.suffix;
    this.projectiles = config.projectiles;
    this.speed = config.speed || 80;

    this.fireCooldown = -1;
    this.alive = true;
    this.stopped = true;
    this.facing = "up";
    this.takenBy = null;

    this.fired = false;
    this.lastfire = {};

    this.anims.play("standing" + this.animSuffix);

    this.body.setCollideWorldBounds(true);
  }

  update(keys, time, delta) {
    if (!this.alive) {
      return;
    }

    if (this.takenBy == null) {
      this.stop();
      return;
    }

    this.fireCooldown -= delta;
    this.fired = false;

    let input = {
      left: keys.left.isDown,
      right: keys.right.isDown,
      down: keys.down.isDown,
      up: keys.up.isDown,
      fire: keys.fire.isDown,
    };

    if (this.projectiles && input.fire && this.fireCooldown < 0) {
      let proj = this.projectiles.get(this);

      if (proj) {
        proj.fire(this.x, this.y, this.facing);
        this.fireCooldown = 300;
        this.fired = true;
        this.lastfire = {
          who: this.name,
          x: this.x,
          y: this.y,
          direction: this.facing,
        };
      }
    }

    this.body.setVelocity(0);

    if (input.left) {
      this.body.setVelocityX(-this.speed);
    } else if (input.right) {
      this.body.setVelocityX(this.speed);
    }

    if (input.up) {
      this.body.setVelocityY(-this.speed);
    } else if (input.down) {
      this.body.setVelocityY(this.speed);
    }

    this.stopped = false;

    if (input.left) {
      this.facing = "left";
    } else if (input.right) {
      this.facing = "right";
    } else if (input.up) {
      this.facing = "up";
    } else if (input.down) {
      this.facing = "down";
    } else {
      this.stopped = true;
    }

    this.animate();
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

  getLastFireData() {
    return this.lastfire;
  }

  animate() {
    if (this.stopped) {
      this.anims.stop();
    } else {
      let anim = this.facing + this.animSuffix;
      this.anims.play(anim, true);
    }
  }
}
