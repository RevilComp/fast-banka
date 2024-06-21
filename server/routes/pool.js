const express = require("express");
const route = express.Router();
const {
  getPools,
  createPool,
  deletePool,
  clonePool,
  updatePool,
  transferPoolTransaction,
  deleteUserPool,
  getMutabakatController,
  getPoolByUser,
} = require("../controllers/pool");

route.get("/", async (req, res) => {
  await getPools(req, res);
});

route.get("/byuser", async (req, res) => {
  await getPoolByUser(req, res);
});

route.get("/get-mutabakat-pool", async (req, res) => {
  await getMutabakatController(req, res);
});

route.post("/create", async (req, res) => {
  await createPool(req, res);
});

route.post("/delete", async (req, res) => {
  await deletePool(req, res);
});

route.post("/clone", async (req, res) => {
  await clonePool(req, res);
});

route.post("/delete-user", async (req, res) => {
  await deleteUserPool(req, res);
});
route.post("/update", async (req, res) => {
  await updatePool(req, res);
});

route.post("/transfer", async (req, res) => {
  await transferPoolTransaction(req, res);
});

module.exports = route;
