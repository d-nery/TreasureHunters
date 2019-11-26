export default class Projectile extends Phaser.GameObjects.Sprite {
  constructor(scene, name) {
    super(scene);

    this.name = name;

    this.scene.physics.world.enable(this);

    this.body.setSize(8, 8);
    this.body.offset.set(4, 4);

    this.direction = "up";

    this.light = null;

    this.body.setCollideWorldBounds(true);
    this.scene.map.addWorldCollisionToProjectile(this);
  }

  fire(x, y, d) {
    console.log("Firing projectile", this.name, x, y, d);

    this.direction = d;

    if (this.direction === "up") {
      this.setPosition(x, y - 8);
      this.body.setVelocityY(-150);
      this.angle = -90;
    } else if (this.direction === "right") {
      this.setPosition(x + 8, y);
      this.body.setVelocityX(150);
      this.angle = 0;
    } else if (this.direction === "down") {
      this.setPosition(x, y + 8);
      this.body.setVelocityY(150);
      this.angle = 90;
    } else if (this.direction === "left") {
      this.setPosition(x - 8, y);
      this.body.setVelocityX(-150);
      this.angle = 180;
    }

    this.setActive(true);
    this.setVisible(true);

    this.anims.play(this.name, true);
  }

  update(time, delta) {
    if (!this.body.blocked.none) {
      console.log("Destroying " + this.name);
      this.destroy();
    }

    if (this.light) {
      this.light.x = this.x;
      this.light.y = this.y;
    }
  }

  destroy(fromScene) {
    if (this.light) {
      this.scene.lights.removeLight(this.light);
      this.light = null;
    }

    super.destroy(fromScene);
  }
}
