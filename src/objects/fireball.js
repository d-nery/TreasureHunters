export default class Fireball extends Phaser.GameObjects.Image {
  constructor(scene) {
    super(scene);
    Phaser.GameObjects.Image.call(this, scene, 0, 0, "fireball");

    this.speed = Phaser.Math.GetSpeed(200, 1);
    this.direction = 0;
    this.lifespan = 5000;
  }

  fire(x, y, d, t) {
    this.setPosition(x, y - 8);
    this.direction = d;
    this.spawned = t;

    if (this.direction === 0) {
      this.angle = -90;
    } else if (this.direction === 1) {
      this.angle = 0;
    } else if (this.direction === 2) {
      this.angle = 90;
    } else if (this.direction === 3) {
      this.angle = 180;
    }

    this.setActive(true);
    this.setVisible(true);
  }

  kill() {
    this.setActive(true);
    this.setVisible(true);
  }

  update(time, delta) {
    if (this.direction === 0) {
      this.y -= this.speed * delta;
    } else if (this.direction === 1) {
      this.x += this.speed * delta;
    } else if (this.direction === 2) {
      this.y += this.speed * delta;
    } else if (this.direction === 3) {
      this.x -= this.speed * delta;
    }

    if (this.y < -16 || this.x < -16 || time - this.spawned > this.lifespan) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}
