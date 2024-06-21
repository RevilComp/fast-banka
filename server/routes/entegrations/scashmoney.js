const express = require("express");
const config = require("../../config");
const route = express.Router();
const routePrefix = config.papara ? "/papara" : "/bank";
const { list, deposit } = require(config.papara
  ? "../../controllers/entegrations/scashmoney.papara"
  : "../../controllers/entegrations/scashmoney.banka");

route.get(routePrefix + "/list", async (req, res) => {
  await list(req, res);
});

route.post(routePrefix + "/deposit", async (req, res) => {
  await deposit(req, res);
});

module.exports = route;
