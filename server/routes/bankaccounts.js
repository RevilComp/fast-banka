const express = require("express");
const route = express.Router();
const {
  create,
  remove,
  update,
  get,
  getAvaibleBankAccounts,
  getTransactionLimitExceedAccounts,
  getSuspendedBankAccounts,
  getBankById,
  getBankAccount,
  suspendAndActiveAccount,
  getByUser,
  getUsedAccounts,
  retryPaparaMail,
} = require("../controllers/bankaccounts");

route.get("/", async (req, res) => {
  await get(req, res);
});

route.get("/getbankaccount", async (req, res) => {
  await getBankAccount(req, res);
});

route.get("/bank_account", async (req, res) => {
  await getBankAccount(req, res, true);
});

route.get("/getbankbyid", async (req, res) => {
  await getBankById(req, res);
});

route.get("/getavaiblebankaccounts", async (req, res) => {
  await getAvaibleBankAccounts(req, res);
});

route.get("/gettransactionlimitexceedaccounts", async (req, res) => {
  await getTransactionLimitExceedAccounts(req, res);
});

route.get("/getsuspendedbankaccounts", async (req, res) => {
  await getSuspendedBankAccounts(req, res);
});
route.get("/usedaccounts", async (req, res) => {
  await getUsedAccounts(req, res);
});

route.get("/getbyuser", async (req, res) => {
  await getByUser(req, res);
});

route.post("/retry-papara-mail", async (req, res) => {
  await retryPaparaMail(req, res);
});

route.post("/create", async (req, res) => {
  await create(req, res);
});

route.post("/remove", async (req, res) => {
  await remove(req, res);
});

route.post("/update", async (req, res) => {
  await update(req, res);
});

route.post("/suspendandactiveaccount", async (req, res) => {
  await suspendAndActiveAccount(req, res);
});

module.exports = route;
