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

const app = express(),
  DIST_DIR = __dirname,
  HTML_FILE = path.join(DIST_DIR, "index.html"),
  compiler = webpack(config);

const server = http.Server(app);
const io = sio.listen(server);

const players = {};

io.on("connection", socket => {
  console.log("a user connected: ", socket.id);

  socket.emit("allCharacters", characters);

  for (let [name, char] of Object.entries(characters)) {
    if (char.takenBy == null) {
      console.debug("Found non-taken character: ", char);

      char.takenBy = socket.id;
      players[socket.id] = {
        char: name,
      };

      socket.emit("newCharacter", name);
      break;
    }
  }
  // update all other players of the new player
  socket.broadcast.emit("newPlayer", {
    id: socket.id,
    char: characters[players[socket.id].char],
  });
  socket.broadcast.emit("takenUpdate", characters);

  for (let [id, enem] of Object.entries(enemies)) {
    if (enem.alive == true) {
      const randX = Math.floor((Math.random() * 80));
      const randY = Math.floor((Math.random() * 80));

      enem.velx = randX;
      enem.vely = randY;

      if (randX < 0) {
        enem.direction = "left";
      } else if (randX > 0) {
        enem.direction = "right";
      } 
      
      if (randY < 0) {
        enem.direction = "up";
      } else if (randY > 0) {
        enem.direction = "down";
      }
    
      socket.broadcast.emit("EnemyMovement", enem);
    }
  }

  // when a player disconnects, remove them from our players object
  socket.on("disconnect", () => {
    console.log("user disconnected: ", socket.id);

    let char = players[socket.id].char;
    characters[char].takenBy = null;
    delete players[socket.id];

    io.emit("disconnect", {
      id: socket.id,
      char: char,
    });
  });

  // when a player moves, update the player data
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

  socket.on("destroyDoor", () => {
    console.log("user destroyed door: ");
    // emit a message to all players to remove this player
    socket.broadcast.emit("destroyDoor");
  });

  socket.on("playerSwitch", () => {
    console.log("Received player switch request");

    const cycleOrder = Object.keys(characters);
    const idx = cycleOrder.indexOf(players[socket.id].char);

    let new_idx = (idx + 1) % cycleOrder.length;
    while (new_idx != idx) {
      let c = cycleOrder[new_idx];

      if (characters[c].takenBy == null) {
        console.debug("Found non-taken character: ", c);
        characters[cycleOrder[idx]].takenBy = null;

        characters[c].takenBy = socket.id;
        players[socket.id] = {
          char: c,
        };

        socket.emit("newCharacter", c);
        socket.broadcast.emit("takenUpdate", characters);

        break;
      }

      new_idx = (new_idx + 1) % cycleOrder.length;
    }
  });

  socket.on("fired", fireData => {
    console.log("A player just fired!", fireData);

    socket.broadcast.emit("playerFired", fireData);
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
