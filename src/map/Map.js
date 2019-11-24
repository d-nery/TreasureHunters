import Parse from "phaser/src/tilemaps/parsers/Parse";

export default class Map extends Phaser.Tilemaps.Tilemap {
  constructor(scene, key, tileWidth, tileHeight, width, height, data, insertNull) {
    // Initial code adapted from phaser/src/tilemaps/ParseToTilemap.js
    // used on this.make.tilemap

    tileWidth = tileWidth || 32;
    tileHeight = tileHeight || 32;
    width = width || 10;
    height = height || 10;
    insertNull = insertNull || false;

    let mapData = null;

    if (Array.isArray(data)) {
      var name = key !== undefined ? key : "map";
      mapData = Parse(name, Formats.ARRAY_2D, data, tileWidth, tileHeight, insertNull);
    } else if (key !== undefined) {
      var tilemapData = scene.cache.tilemap.get(key);

      if (!tilemapData) {
        console.warn("No map data found for key " + key);
      } else {
        mapData = Parse(key, tilemapData.format, tilemapData.data, tileWidth, tileHeight, insertNull);
      }
    }

    if (mapData === null) {
      mapData = new MapData({
        tileWidth: tileWidth,
        tileHeight: tileHeight,
        width: width,
        height: height,
      });
    }

    super(scene, mapData);

    // Custom code
    this.initialize();
  }

  initialize() {
    let tiles = this.addTilesetImage("sprites", "tiles", 16, 16, 0, 0);

    this.createStaticLayer("Floor", tiles, 0, 0);
    this.river = this.createStaticLayer("Rio", tiles, 0, 0);
    this.walls = this.createStaticLayer("Walls", tiles, 0, 0);
    this.createStaticLayer("Torches", tiles, 0, 0);
    this.createStaticLayer("AbovePlayer", tiles, 0, 0).setDepth(10);

    this.levers = this.createFromObjects("Interactive", "lever", { key: "lever", frame: 0 }, this.scene);
    this.scene.physics.world.enable(this.levers);

    this.key = this.createFromObjects("Interactive", "key", { key: "key", frame: 0 }, this.scene)[0];
    this.scene.physics.world.enable(this.key);

    this.chest = this.createFromObjects("Interactive", "chest", { key: "chest", frame: 0 }, this.scene)[0];
    this.scene.physics.world.enable(this.chest);

    this.firefonts = this.createFromObjects("Interactive", "firefont", { key: "firefont", frame: 0 }, this.scene);

    for (let font of this.firefonts) {
      if (font.data.values[0].value == "up") {
        font.anims.play("firefont-up");
      } else {
        font.anims.play("firefont-down");
      }
    }

    this.fog = this.createStaticLayer("Fog", tiles, 0, 0);
    this.fog50 = this.createStaticLayer("Fog_50", tiles, 0, 0);

    this.door = this.createFromObjects("Interactive", "door", { key: "door", frame: 0 }, this.scene)[0];
    this.scene.physics.world.enable(this.door);
    this.door.setDepth(10);
    this.door.body.setImmovable();
    this.door.body.moves = false;

    this.river.setCollisionByExclusion([-1]);
    this.walls.setCollisionByExclusion([-1]);

    this.scene.physics.world.bounds.width = this.widthInPixels;
    this.scene.physics.world.bounds.height = this.heightInPixels;

    this.switch1 = true;
    this.switch2 = true;
    this.doorClosed = true;

    if (this.scene.registry.get("debug") === true) {
      this.debugGraphics = this.scene.add.graphics();

      this.walls.renderDebug(this.debugGraphics, {
        tileColor: null,
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 120), // Colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Colliding face edges
      });

      this.river.renderDebug(this.debugGraphics, {
        tileColor: null,
        collidingTileColor: new Phaser.Display.Color(200, 0, 0, 120), // Colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Colliding face edges
      });
    }
  }

  addCollisionToSprite(sprite) {
    console.log("Adding colliders to", sprite);

    sprite._wallCollider = this.scene.physics.add.collider(sprite, this.walls);
    sprite._riverCollider = this.scene.physics.add.collider(sprite, this.river);
    sprite._doorCollider = this.scene.physics.add.collider(sprite, this.door);
  }

  removeRiverCollisionFromSprite(sprite) {
    sprite._riverCollider && sprite._riverCollider.destroy();
    delete sprite._riverCollider;
  }

  removeDoor() {
    this.scene.physics.world.disable(this.door);
    this.door.setFrame(1, false, false);
  }
}
