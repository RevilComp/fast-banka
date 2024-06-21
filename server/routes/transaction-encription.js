const express = require("express");
const route = express.Router();
const TransactionEncriptionController = require("../controllers/transaction-encription");
const TransactionEncription = require("../schemas/transaction-encription");

route.get("/", async (req, res) => {
  const { hashed } = req.query;
  if (!hashed)
    return res
      .status(404)
      .json({ error: true, message: "Hashed is not valid" });
  // @ts-ignore
  const transactionEncription = await TransactionEncription.findById(hashed);
  if (!transactionEncription)
    return res
      .status(404)
      .json({ error: true, message: "Hashed is not valid" });
  res.send(transactionEncription);
});
route.get("/get-bank", async (req, res) => {
  await TransactionEncriptionController.decodeTransactionForBankAccount(
    req,
    res
  );
});

module.exports = route;
