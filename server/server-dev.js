import path from "path";
import express from "express";
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";
import config from "../webpack/webpack.dev.config.js";
import http from "http";
import sio from "socket.io";

import { characters } from "./characters.js";
import { enemies } from "./enemies.js";

const MAX_PLAYERS = 3;

const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

const app = express(),
  DIST_DIR = __dirname,
  HTML_FILE = path.join(DIST_DIR, "index.html"),
  compiler = webpack(config);

const server = http.Server(app);
const io = sio.listen(server);

const players = {};

io.on("connection", socket => {
  const log = (...args) => {
    console.log.apply(console, [`[${socket.id}]`, ...args]);
  };

  log("Trying to connect");
  log("Has", Object.keys(players).length, "players");

  if (Object.keys(players).length >= 3) {
    log("Denying connection");
    socket.emit("denied");
    return;
  }

  log("Allowing connection");
  socket.emit("connection-ok");

  socket.once("want-in", async () => {
    log("Wants to join game");
    let isMaster = Object.keys(players).length === 0;

    for (let [name, char] of Object.entries(characters)) {
      if (char.takenBy == null) {
        char.takenBy = socket.id;
        players[socket.id] = {
          char: name,
          master: isMaster,
        };

        log(`Join OK, Character: ${name}, Master: ${isMaster}`);
        socket.emit("in-ok", {
          charName: name,
          isMaster: isMaster,
        });

        break;
      }
    }

    // Allow some time for scene creation
    await sleep(100);

    log("Sending all characters and updating players of new player");
    socket.emit("allCharacters", characters);

    socket.broadcast.emit("newPlayer", {
      id: socket.id,
      char: characters[players[socket.id].char],
    });

    socket.broadcast.emit("takenUpdate", characters);

    socket.on("playerMovement", movementData => {
      const player = players[socket.id];

      if (!player) {
        return;
      }

      const char = characters[player.char];

      char.x = movementData.x;
      char.y = movementData.y;
      char.direction = movementData.direction;
      char.stopped = movementData.stopped;

      socket.broadcast.emit("playerMoved", char);
    });

    socket.on("playerSwitch", () => {
      log("Received player switch request");

      const cycleOrder = Object.keys(characters);
      const idx = cycleOrder.indexOf(players[socket.id].char);

      let new_idx = (idx + 1) % cycleOrder.length;
      while (new_idx != idx) {
        let c = cycleOrder[new_idx];

        if (characters[c].takenBy == null) {
          console.debug("Found non-taken character: ", c);
          characters[cycleOrder[idx]].takenBy = null;

          characters[c].takenBy = socket.id;
          players[socket.id].char = c;

          socket.emit("newCharacter", c);
          socket.broadcast.emit("takenUpdate", characters);

          break;
        }

        new_idx = (new_idx + 1) % cycleOrder.length;
      }
    });

    socket.on("fired", fireData => {
      log("A player just fired!", fireData);

      socket.broadcast.emit("playerFired", fireData);
    });
  });

  // when a player disconnects, remove them from our players object
  socket.on("disconnect", () => {
    log("Disconnected");

    let player = players[socket.id];
    if (!player) {
      return;
    }

    characters[player.char].takenBy = null;
    delete players[socket.id];

    io.emit("disconnect", {
      id: socket.id,
      char: player.char,
    });
  });

  socket.on("destroyDoor", () => {
    log("Destroyed door");
    // emit a message to all players to remove this player
    socket.broadcast.emit("destroyDoor");
  });
});

app.use(
  webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
  })
);

app.use(webpackHotMiddleware(compiler));

app.get("*", (req, res, next) => {
  compiler.outputFileSystem.readFile(HTML_FILE, (err, result) => {
    if (err) {
      return next(err);
    }

    res.set("content-type", "text/html");
    res.send(result);
    res.end();
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`App listening on ${require("ip").address()}:${PORT}...`);
  console.log("Press Ctrl+C to quit.");
});
