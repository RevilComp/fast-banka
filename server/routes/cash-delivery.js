const express = require("express");
const {
  createCashDelivery,
  getCashDelivery,
  downloadCashDelivery,
  deleteCashDelivery,
  excelExport
} = require("../controllers/cash-delivery");

const router = express.Router();

router.get("/download", downloadCashDelivery);
router.get("/", getCashDelivery);
router.post("/delete", deleteCashDelivery);
router.post("/", createCashDelivery);
router.post("/download-excel", excelExport)

module.exports = router;
