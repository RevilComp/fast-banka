const express = require("express");
const route = express.Router();

const {
  recheckPaparaDeposit,
  excelExport,
  makeDepositRequest,
  banIp,
  bannedList,
  removeBannedIp,
  makeWithdrawtRequest,
  manuelDeposit,
  remove,
  islemListesi,
  editTransacion,
  get,
  verifyRejectDeposit,
  getTransactionSummary,
  getOne,
  transcationMovementInfo,
  forwardWithdraw,
} = require("../controllers/transactions");

route.get("/", async (req, res) => {
  await get(req, res);
});

route.post("/edittransaction", async (req, res) => {
  await editTransacion(req, res);
});

route.get("/islemlistesi", async (req, res) => {
  await islemListesi(req, res);
});

route.post("/banip", async (req, res) => {
  await banIp(req, res);
});

route.get("/bannedlist", async (req, res) => {
  await bannedList(req, res);
});

route.post("/removebannedip", async (req, res) => {
  await removeBannedIp(req, res);
});

route.get("/gettransactionsummary", async (req, res) => {
  await getTransactionSummary(req, res);
});

route.post("/forwardwithdraw", async (req, res) => {
  await forwardWithdraw(req, res);
});

route.post("/makedepositrequest", async (req, res) => {
  await makeDepositRequest(req, res);
});

route.post("/makewithdrawrequest", async (req, res) => {
  await makeWithdrawtRequest(req, res);
});

route.post("/verifyrejectdeposit", async (req, res) => {
  await verifyRejectDeposit(req, res);
});

route.post("/remove", async (req, res) => {
  await remove(req, res);
});

route.get("/getone", async (req, res) => {
  await getOne(req, res);
});

route.get("/transcationmovementinfo", async (req, res) => {
  await transcationMovementInfo(req, res);
});

route.post("/manueldeposit", async (req, res) => {
  await manuelDeposit(req, res);
});
route.post("/remove", async (req, res) => {
  await remove(req, res);
});

route.post("/excel", async (req, res) => {
  await excelExport(req, res);
});

route.post("/recheck-papara-deposit", async (req, res) => {
  await recheckPaparaDeposit(req, res);
});

module.exports = route;
