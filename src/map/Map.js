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

    this.createDynamicLayer("Floor", tiles, 0, 0).setPipeline("Light2D");
    this.river = this.createStaticLayer("Rio", tiles, 0, 0);
    this.walls = this.createDynamicLayer("Walls", tiles, 0, 0).setPipeline("Light2D");
    this.createStaticLayer("Torches", tiles, 0, 0);
    this.createStaticLayer("AbovePlayer", tiles, 0, 0).setDepth(10);

    this.bridge = this.createDynamicLayer("Bridge", tiles, 0, 0);
    this.bridge.setVisible(0);
    this.bridgeInactive = this.createDynamicLayer("BridgeInactive", tiles, 0, 0);

    this.hole = this.createDynamicLayer("WallHole", tiles, 0, 0);
    this.wallHole = this.createFromObjects("Interactive", "WallBarrie", { key: "null", frame: "" }, this.scene);
    this.scene.physics.world.enable(this.wallHole);

    this.levers = this.createFromObjects("Interactive", "lever", { key: "spriteAtlas", frame: "lever/01.png" }, this.scene)[0];
    this.scene.physics.world.enable(this.levers);
    this.levers.setPipeline("Light2D");

    this.levers2 = this.createFromObjects("Interactive", "lever2", { key: "spriteAtlas", frame: "lever/01.png" }, this.scene)[0];
    this.scene.physics.world.enable(this.levers2);
    this.levers2.setPipeline("Light2D");

    this.button = this.createFromObjects("Interactive", "button", { key: "null", frame: 0 }, this.scene)[0];
    this.scene.physics.world.enable(this.button);

    this.key = this.createFromObjects("Interactive", "key", { key: "spriteAtlas", frame:  "key/01.png" }, this.scene)[0];
    this.scene.physics.world.enable(this.key);

    this.chest = this.createFromObjects("Interactive", "chest", { key: "spriteAtlas", frame:  "chest/01.png" }, this.scene)[0];
    this.scene.physics.world.enable(this.chest);

    this.firefonts = this.createFromObjects("Interactive", "firefont", { key: "spriteAtlas", frame:  "firefont/01.png" }, this.scene);

    for (let font of this.firefonts) {
        font.anims.play("firefont");
    }

    this.fog = this.createStaticLayer("Fog", tiles, 0, 0);
    this.fogTreasure = this.createStaticLayer("FogTreasure", tiles, 0, 0);
    //this.fog50 = this.createStaticLayer("Fog_50", tiles, 0, 0);

    this.door = this.createFromObjects("Interactive", "door", { key: "spriteAtlas", frame: "door/close.png" }, this.scene)[0];

    this.door.setDepth(10);
    this.scene.physics.world.enable(this.door);
    this.door.body.setImmovable();
    this.door.body.moves = false;

    this.bridge.setCollisionByExclusion([-1]);
    this.bridgeInactive.setCollisionByExclusion([-1]);
    this.river.setCollisionByExclusion([-1]);
    this.walls.setCollisionByExclusion([-1]);
    this.hole.setCollisionByExclusion([-1]);

    this.scene.physics.world.bounds.width = this.widthInPixels;
    this.scene.physics.world.bounds.height = this.heightInPixels;

    this.switch1 = false;
    this.switch2 = false;
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

  addWorldCollisionToCharacter(char) {
    console.log("Adding colliders to", char);

    char._wallCollider = this.scene.physics.add.collider(char, this.walls);
    char._riverCollider = this.scene.physics.add.collider(char, this.river);
    char._doorCollider = this.scene.physics.add.collider(char, this.door);

    char._lever1Collider = this.scene.physics.add.overlap(char, this.levers, this.removeDoor1, null, this);
    char._lever2Collider = this.scene.physics.add.overlap(char, this.levers2, this.removeDoor2, null, this);

    char._bridgeCollider = this.scene.physics.add.collider(char, this.bridge);
    char._bridgeInactiveCollider = this.scene.physics.add.collider(char, this.bridgeInactive);

    if (char.name != "ninja") {
      console.debug(char.name);
      char._wallHoleCollider = this.scene.physics.add.collider(char, this.hole);
    } else {
      char._fogHoleCollider = this.scene.physics.add.overlap(char, this.wallHole, this.openFog, null, this);
    }
  }

  addWorldCollisionToProjectile(proj) {
    console.log("Adding colliders to", proj);

    const destroyProj = () => {
      proj.destroy();
    };

    proj._wallCollider = this.scene.physics.add.collider(proj, this.walls, destroyProj, null, this);
    proj._doorCollider = this.scene.physics.add.collider(proj, this.door, destroyProj, null, this);

    if (proj.name == "arrow") {
      proj._buttonCollider = this.scene.physics.add.collider(proj, this.button, this.buttonPressed, null, this);
    }
  }

  removeRiverCollisionFromCharacter(char) {
    char._riverCollider && char._riverCollider.destroy();
    delete char._riverCollider;
  }

  removeDoor1() {
    if (this.scene.keys.action.isDown) {
      console.debug("lever1 pressed");
      this.switch1 = true;
      this.levers.setFrame(1, false, false);
      //emmit
      if (this.switch1 && this.switch2) {
        this.scene.physics.world.disable(this.door);
        this.door.setFrame(1, false, false);
        //emmit
        this.fogTreasure.setVisible(0);
        //emmit
      }
    }
  }

  removeDoor2() {
    if (this.scene.keys.action.isDown) {
      console.debug("lever2 pressed");
      this.switch2 = true;
      this.levers2.setFrame(1, false, false);
      //emmit
      if (this.switch1 && this.switch2) {
        this.scene.physics.world.disable(this.door);
        this.door.setFrame(1, false, false);
        //emmit
        this.fogTreasure.setVisible(0);
        //emmit
      }
    }
  }

  buttonPressed() {
    this.bridgeInactive.setCollisionByExclusion([0]);
    this.bridge.setVisible(0);
    //emmit

    this.bridge.setCollisionByExclusion([0]);
    this.bridge.setVisible(1);
    //emmit
  }

  openFog() {
    this.fog.setVisible(0);
    //emmit
  }
}
