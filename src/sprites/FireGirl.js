export default class FireGirl extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, config.key);
    config.scene.physics.world.enable(this);
    config.scene.add.existing(this);

    this.animSuffix = "-fg";
    this.fireCooldown = 0;
    this.alive = true;
    this.stopped = true;
    this.facing = "up";
  }

  update(keys, time, delta) {
    if (!this.alive) {
      return;
    }

    this.fireCooldown -= delta;

    let input = {
      left: keys.left.isDown,
      right: keys.right.isDown,
      down: keys.down.isDown,
      up: keys.up.isDown,
      fire: keys.fire.isDown,
    };

    if (input.fire && this.fireCoolDown < 0) {
      let fireball = this.scene.fireballs.get(this);
      if (fireball) {
        fireball.fire(this.x, this.y, this.flipX);
        this.fireCoolDown = 300;
      }
    }

    this.body.setVelocity(0);

    if (input.left) {
      this.body.setVelocityX(-80);
    } else if (input.right) {
      this.body.setVelocityX(80);
    }

    if (input.up) {
      this.body.setVelocityY(-80);
    } else if (input.down) {
      this.body.setVelocityY(80);
    }

    this.stopped = false;

    if (input.left) {
      this.facing = "left";
    } else if (this.cursors.right.isDown) {
      this.facing = "right";
    } else if (this.cursors.up.isDown) {
      this.facing = "up";
    } else if (this.cursors.down.isDown) {
      this.facing = "down";
    } else {
      this.stopped = true;
    }

    if (this.stopped) {
      this.anims.stop();
    } else {
      let anim = this.facing + this.animSuffix;
      this.anims.play(anim, true);
    }
  }
}
