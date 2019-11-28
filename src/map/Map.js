import Parse from "phaser/src/tilemaps/parsers/Parse";
import Logger from "../helpers/Logger";

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
    this.logger = new Logger("Map", "🗺");

    // Custom code
    this.initialize();
  }

  initialize() {
    this.logger.info("Initializing");

    this.hud = this.scene.scene.get("HUDScene");
    this.hasKey = "";
    let tiles = this.addTilesetImage("sprites", "tiles", 16, 16, 0, 0);

    this.createDynamicLayer("Floor", tiles, 0, 0).setPipeline("Light2D");
    this.river = this.createDynamicLayer("Rio", tiles, 0, 0).setPipeline("Light2D");
    this.createDynamicLayer("RioNC", tiles, 0, 0).setPipeline("Light2D");
    this.walls = this.createDynamicLayer("Walls", tiles, 0, 0).setPipeline("Light2D");
    this.createDynamicLayer("Torches", tiles, 0, 0).setPipeline("Light2D");
    this.createDynamicLayer("AbovePlayer", tiles, 0, 0)
      .setDepth(10)
      .setPipeline("Light2D");

    this.hole = this.createDynamicLayer("WallHole", tiles, 0, 0);
    this.wallHole = this.createFromObjects(
      "Interactive",
      "WallBarrie",
      { key: "spriteAtlas", frame: "hole/01.png" },
      this.scene
    )[0];
    this.scene.physics.world.enable(this.wallHole);
    this.wallHole.setPipeline("Light2D");

    this.levers = this.createFromObjects(
      "Interactive",
      "lever",
      { key: "spriteAtlas", frame: "lever/01.png" },
      this.scene
    );

    this.scene.physics.world.enable(this.levers);

    for (let lever of this.levers) {
      lever.setPipeline("Light2D");
      lever.ok = false;
    }

    this.torches = this.filterObjects("Lights", obj => obj.name === "torch");

    for (let torch of this.torches) {
      torch.light = this.scene.lights.addLight(torch.x, torch.y, 100, 0xe25822, 4);
      this.scene.tweens.add({
        targets: torch.light,
        radius: { from: 100, to: 103 },
        ease: "Linear",
        duration: Phaser.Math.Between(1000, 2000),
        repeat: -1,
        yoyo: true,
        delay: Phaser.Math.Between(300, 1000),
      });
    }

    this.candles = this.filterObjects("Lights", obj => obj.name === "candle");

    for (let candle of this.candles) {
      candle.light = this.scene.lights.addLight(candle.x, candle.y, 100, 0xe25822, 3);
    }

    this.bridge = this.createFromObjects(
      "Interactive",
      "bridge",
      { key: "spriteAtlas", frame: "bridge/02.png" },
      this.scene
    )[0];
    this.scene.physics.world.enable(this.bridge);
    this.bridge.body.setImmovable();
    this.bridge.body.moves = false;

    this.button = this.createFromObjects(
      "Interactive",
      "button",
      { key: "spriteAtlas", frame: "button/01.png" },
      this.scene
    )[0];
    this.scene.physics.world.enable(this.button);
    this.button.body.setImmovable();
    this.button.body.moves = false;
    this.button.setPipeline("Light2D");

    this.key = this.createFromObjects("Interactive", "key", { key: "spriteAtlas", frame: "key/01.png" }, this.scene)[0];
    this.scene.physics.world.enable(this.key);

    this.chest = this.createFromObjects(
      "Interactive",
      "chest",
      { key: "spriteAtlas", frame: "chest/01.png" },
      this.scene
    )[0];
    this.scene.physics.world.enable(this.chest);

    this.firefonts = this.createFromObjects(
      "Interactive",
      "firefont",
      { key: "spriteAtlas", frame: "firefont/01.png" },
      this.scene
    );

    for (let font of this.firefonts) {
      font.anims.play("firefont");
      font.setPipeline("Light2D");
    }

    this.riverfonts = this.createFromObjects(
      "Interactive",
      "rivertop",
      { key: "spriteAtlas", frame: "water/fontriver/01.png" },
      this.scene
    );

    for (let font of this.riverfonts) {
      font.anims.play("riverfont");
      font.setPipeline("Light2D");
    }

    this.fog = this.createStaticLayer("Fog", tiles, 0, 0);
    this.fogTreasure = this.createStaticLayer("FogTreasure", tiles, 0, 0);
    this.fog50 = this.createDynamicLayer("Fog_50", tiles, 0, 0);
    this.fog50.setAlpha(0.9);

    this.door = this.createFromObjects(
      "Interactive",
      "door",
      { key: "spriteAtlas", frame: "door/close.png" },
      this.scene
    )[0];

    this.door.setDepth(10);
    this.scene.physics.world.enable(this.door);
    this.door.body.setImmovable();
    this.door.body.moves = false;

    let spawn = this.findObject("EnemySpawn", obj => obj.name == "sk-spawn");
    let polygon = spawn.polygon.map(point => {
      return { x: point.x + spawn.x, y: point.y + spawn.y };
    });

    this.spawnArea = new Phaser.Geom.Polygon(polygon);

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
        collidingTileColor: null, // Colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Colliding face edges
      });

      this.river.renderDebug(this.debugGraphics, {
        tileColor: null,
        collidingTileColor: null, // Colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Colliding face edges
      });
    }
  }

  addWorldCollisionToCharacter(char) {
    this.logger.debug(`Adding colliders to ${char.name}`);

    char._wallCollider = this.scene.physics.add.collider(char, this.walls);
    char._riverCollider = this.scene.physics.add.collider(char, this.river);
    char._doorCollider = this.scene.physics.add.collider(char, this.door, this.doorFala, null, this);
    char._bridgeCollider = this.scene.physics.add.collider(char, this.bridge, this.bridgeFala, null, this);

    char._chestCollider = this.scene.physics.add.overlap(char, this.chest, this.openChest, null, this);
    char._leversCollider = this.scene.physics.add.overlap(char, this.levers, this.removeDoor, null, this);
    char._keyCollider = this.scene.physics.add.overlap(char, this.key, this.getKey, null, this);

    if (char.name != "ninja") {
      char._wallHoleCollider = this.scene.physics.add.collider(char, this.hole, this.buracoFala, null, this);
    } else {
      char._fogHoleCollider = this.scene.physics.add.overlap(char, this.wallHole, this.openFog, null, this);
    }

    char._chestCollider = this.scene.physics.add.OVER;
  }

  addWorldCollisionToEnemy(enemy) {
    enemy._doorCollider = this.scene.physics.add.collider(enemy, this.door);
    enemy._wallCollider = this.scene.physics.add.collider(enemy, this.walls);
    enemy._riverCollider = this.scene.physics.add.collider(enemy, this.river);
    enemy._bridgeCollider = this.scene.physics.add.collider(enemy, this.bridge);
  }

  addWorldCollisionToProjectile(proj) {
    this.logger.debug(`Adding colliders to`, proj.name);

    const destroyProj = (p, _) => {
      p.destroy();
    };

    proj._wallCollider = this.scene.physics.add.collider(proj, this.walls, destroyProj, null, this);
    proj._doorCollider = this.scene.physics.add.collider(proj, this.door, destroyProj, null, this);

    if (proj.name === "arrows") {
      proj._buttonCollider = this.scene.physics.add.collider(proj, this.button, this.buttonPressed, null, this);
    }
  }

  removeDoor(char, lever) {
    if (Phaser.Input.Keyboard.JustDown(this.scene.keys.action)) {
      lever.setFrame("lever/02.png", false, false);

      if (!this.levers[0].ok && !this.levers[1].ok) {
        this.hud.showInfoDialog(char.name, "Ativei a alavanca, mas nada aconteceu...");
      }

      lever.ok = true;

      //   if ((!this.levers[0].ok && this.levers[1].ok) || (this.levers[0].ok && !this.levers[1].ok)) {
      //     this.hud.showInfoDialog(char.name, "Uma alavanca foi ativada mas nada aconteceu.");
      //   }

      if (this.levers[0].ok && this.levers[1].ok) {
        this.scene.physics.world.disable(this.door);
        this.door.setFrame("door/open.png", false, false);
        this.fogTreasure.setVisible(0);
        this.hud.showInfoDialog("ninja", "Ouvi o barulho de uma porta abrindo.");
      }

      //     let obj = {char: char, lever: levernum};
      //   this.socket.emit("doorOpen", obj);
    }
  }

  getKey(char) {
    if (this.hasKey == "" && this.scene.keys.action.isDown) {
      this.getKey_actions(char);
      this.socket.emit("pickKey", char);
    }
  }

  getKey_actions(char) {
    this.hasKey = char.name;
    this.key.setVisible(0);
    this.hud.showInfoDialog(char.name, "Peguei a chave!");
  }

  openChest(char) {
    this.logger.debug("try open");
    if (this.scene.keys.action.isDown) {
      console.debug(char.name, this.hasKey);
      if (char.name != this.hasKey) {
        console.debug("nokey");
        this.hud.showInfoDialog(char.name, "Precisamos de uma chave");
      } else {
        this.chest.setFrame("chest/03.png", false, false);
        this.hud.showInfoDialog(char.name, "O baú abriu!!");
        this.socket.emit("chest", char);
      }
    }
  }

  buttonPressed(char) {
    this.socket.emit("pressButton", char);

    this.scene.physics.world.disable(this.bridge);
    this.scene.physics.world.disable(this.button);
    this.bridge.setFrame("bridge/01.png", false, false);
    this.button.setFrame("button/02.png", false, false);
    this.hud.showInfoDialog("archer", "Agora podemos atravessar pela ponte");
    proj.destroy();
  }

  openFog(char) {
    this.openFog_actions();
    this.socket.emit("fog");
  }

  openFog_actions() {
    this.fog.setVisible(0);
    this.fog50.setVisible(0);
    this.hud.showInfoDialog("ninja", "Achei algo aqui!");
  }

  bridgeFala(char) {
    if (this.scene.keys.action.isDown) {
      this.hud.showInfoDialog(char.name, "A ponte está elevada. Precisamos achar o mecanismo para descê-la");
    }
  }

  doorFala(char) {
    if (this.scene.keys.action.isDown) {
      this.hud.showInfoDialog(char.name, "Está trancada! Será que essa alavanca funciona?");
    }
  }

  buracoFala(char) {
    if (this.scene.keys.action.isDown) {
      this.hud.showInfoDialog("ninja", "Esse buraco parece do meu tamanho...");
    }
  }

  setSocket(socket) {
    this.socket = socket;
  }
}
