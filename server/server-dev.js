import path from "path";
import express from "express";
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";
import config from "../webpack/webpack.dev.config.js";
import http from "http";
import sio from "socket.io";

import { characters } from "./characters.js";

const app = express(),
  DIST_DIR = __dirname,
  HTML_FILE = path.join(DIST_DIR, "index.html"),
  compiler = webpack(config);

const server = http.Server(app);
const io = sio.listen(server);

const players = {};

io.on("connection", socket => {
  console.log("a user connected: ", socket.id);
  // create a new player and add it to our players object
  for (let [i, char] of characters.entries()) {
    if (char.takenBy == null) {
      console.debug("Found non-taken character: ", char);

      char.takenBy = socket.id;
      players[socket.id] = {
        char: i,
      };

      socket.emit("character", i);
      break;
    }
  }

  // send the players object to the new player
  socket.emit("allCharacters", characters);

  // update all other players of the new player
  socket.broadcast.emit("newPlayer", characters[players[socket.id].char]);

  // when a player disconnects, remove them from our players object
  socket.on("disconnect", () => {
    console.log("user disconnected: ", socket.id);
    characters[players[socket.id].char].takenBy = null;
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit("disconnect", socket.id);
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

    socket.broadcast.emit("playerMoved", char);
  });

  socket.on("playerSwitch", () => {
    console.log("Received player switch request");

    const idx = players[socket.id].char;

    let new_idx = (idx + 1) % characters.length;
    while (new_idx != idx) {
      if (characters[new_idx].takenBy == null) {
        console.debug("Found non-taken character: ", new_idx);
        characters[idx].takenBy = null;

        characters[new_idx].takenBy = socket.id;
        players[socket.id] = {
          char: new_idx,
        };

        socket.emit("updateCharacter", new_idx);
        break;
      }

      new_idx = (new_idx + 1) % characters.length;
    }
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
  console.log(`App listening on ${require("ip").address()}:${PORT}....`);
  console.log("Press Ctrl+C to quit.");
});
