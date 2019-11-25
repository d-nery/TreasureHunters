export default class Boss extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, config.key);

    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);

    this.name = config.key;
    this.animSuffix = config.suffix;
    this.projectiles = config.projectiles;
    this.speed = config.speed || 80;
    this.frozen = false;
    this.alive = true;
    this.stopped = true;
    this.facing = "up";


    this.anims.play("standing" + this.animSuffix);

    this.body.setCollideWorldBounds(true);
  }

  update(keys, time, delta) {
    if (!this.alive) {
      return;
    }

    let input = {
      left: keys.left.isDown || keys.a.isDown,
      right: keys.right.isDown || keys.d.isDown,
      down: keys.down.isDown || keys.s.isDown,
      up: keys.up.isDown || keys.w.isDown,
      fire: keys.fire.isDown,
    };

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

  animate() {
    if (this.stopped) {
      this.anims.stop();
    } else {
      let anim = this.facing + this.animSuffix;
      this.anims.play(anim, true);
    }
  }
}
