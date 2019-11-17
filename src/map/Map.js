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
    let tiles = this.addTilesetImage("spritesheet", "tiles", 16, 16, 0, 0);

    this.createStaticLayer("Grass", tiles, 0, 0);
    this.obstacles = this.createStaticLayer("Obstacles", tiles, 0, 0);
    this.createStaticLayer("Visual_torches", tiles, 0, 0);

    this.door = this.createDynamicLayer("Door_Alavanca", tiles, 0, 0);
    //this.door.setCollisionBetween(66, 67);

    this.obstacles.setCollisionByExclusion([-1]);
    this.door.setCollisionByExclusion([-1]);

    this.scene.physics.world.bounds.width = this.widthInPixels;
    this.scene.physics.world.bounds.height = this.heightInPixels;

    this.switch1 = true;
    this.switch2 = true;
    this.doorClosed = true;

    if (this.scene.registry.get("debug") === true) {
      this.debugGraphics = this.scene.add.graphics();

      this.obstacles.renderDebug(this.debugGraphics, {
        tileColor: null,
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 120), // Colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Colliding face edges
      });

      this.door.renderDebug(this.debugGraphics, {
        tileColor: null,
        collidingTileColor: new Phaser.Display.Color(200, 0, 0, 120), // Colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Colliding face edges
      });
    }
  }

  addCollisionToSprite(sprite) {
    console.log("Adding colliders to", sprite);

    this.scene.physics.add.collider(sprite, this.obstacles);
    this.scene.physics.add.collider(sprite, this.door);
  }

  removeDoor() {
    this.door.setVisible(false);
    this.door.setCollisionByExclusion([0]);
  }
}
