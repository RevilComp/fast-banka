const BankAccountsController = require("./bankaccounts");
const Transactions = require("../schemas/transaction-encription");
const { isWebsiteActive, findWebsite } = require("../controllers/general");
const decodeTransactionForBankAccount = async (req, res) => {
  const { hashed } = req.body;
  if (!hashed)
    return res
      .status(404)
      .json({ error: true, message: "Hashed is not valid" });
  const transactionEncription = await Transactions.findById(hashed);
  if (!transactionEncription)
    return res
      .status(404)
      .json({ error: true, status: "fail", message: "Hashed is not valid" });

  if (!(await isWebsiteActive(transactionEncription?.website))) {
    // websitenin aktif olup olmadığı kontrolü
    return res.status(500).send({
      status: "fail",
      message: "Website geçerli değil",
    });
  }

  await BankAccountsController.getBankAccount(
    {
      body: {
        bankName: req.body.bankName,
        amount: req.body.amount,
        type: "deposit",
        userId: transactionEncription.userId,
        website: transactionEncription.website,
      },
    },
    res
  );
};

module.exports = { decodeTransactionForBankAccount };
