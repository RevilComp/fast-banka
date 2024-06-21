const express = require("express");
const route = express.Router();
const {
  getPlayers,
  getBannedPlayers,
  banPlayer,
} = require("../controllers/players");

route.get("/players", async (req, res) => {
  await getPlayers(req, res);
});

route.get("/bannedplayers", async (req, res) => {
  await getBannedPlayers(req, res);
});

route.post("/ban", async (req, res) => {
  await banPlayer(req, res);
});

module.exports = route;
