const express = require("express");
const route = express.Router();
const { login, logOut } = require("../controllers/auth");

route.post("/login", async (req, res) => {
  await login(req, res);
});
route.get("/logout", async (req, res) => {
  await logOut(req, res);
});

module.exports = route;
