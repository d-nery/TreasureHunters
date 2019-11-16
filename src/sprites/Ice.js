export default class Projectile extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, config.texture, config.frame);

    console.log(`Creating projectile with name ${config.name}`);

    this.name = "iceball";
    // Phaser.GameObjects.Sprite.call(this, scene, 0, 0, this.name);

    this.body.setSize(8, 8);
    this.body.offset.set(12, 12);

    this.speed = Phaser.Math.GetSpeed(200, 1);
    this.direction = "up";
    this.lifespan = 5000;
  }

  fire(x, y, d, t) {
    console.log(`Firing projectile ${this.name}`);

    this.setPosition(x, y - 8);
    this.direction = d;
    this.spawned = t;

    if (this.direction === "up") {
      this.setPosition(x, y - 8);
      this.angle = -90;
    } else if (this.direction === "right") {
      this.setPosition(x + 8, y);
      this.angle = 0;
    } else if (this.direction === "down") {
      this.setPosition(x, y + 8);
      this.angle = 90;
    } else if (this.direction === "left") {
      this.setPosition(x - 8, y);
      this.angle = 180;
    }

    this.setActive(true);
    this.setVisible(true);

    this.anims.play("iceball", true);
  }

  destroy() {
    this.anims.stop();
    this.setActive(false);
    this.setVisible(false);
  }

  update(time, delta) {
    if (this.direction === "up") {
      this.y -= this.speed * delta;
    } else if (this.direction === "right") {
      this.x += this.speed * delta;
    } else if (this.direction === "down") {
      this.y += this.speed * delta;
    } else if (this.direction === "left") {
      this.x -= this.speed * delta;
    }

    if (this.y < -16 || this.x < -16 || time - this.spawned > this.lifespan) {
      this.destroy();
    }
  }
}
