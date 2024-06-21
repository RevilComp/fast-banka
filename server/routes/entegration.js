const express = require("express");
const route = express.Router();
const Users = require("../schemas/users");
const Transaction = require("../schemas/transactions");
const Connections = require("../schemas/connections");
const TransactionEncription = require("../schemas/transaction-encription");
const config = require("../config");

// TODO:
// tüm yatırımları external common'a yönlendir
// eğer papara dan gelkiyorsa defaut papara açılabilir.
// eğer avele geliyorsa havele açılabilir
//bot health status yap

const controlTransaction_id = async (transaction_id, website) => {
  try {
    const transaction = await Transaction.findOne({
      transactionId: transaction_id,
      website,
    });
    if (transaction) {
      return false;
    }
    return true;
  } catch (e) {
    return true;
  }
};

const handleTransactionLink = async (req, res) => {
  try {
    const {
      firm_key,
      website,
      user_name_surname,
      user_id,
      callback,
      transaction_id,
      hash,
    } = req.body;
    const papara = config.papara;
    const findUser = await Users.findOne({ _id: firm_key });
    if (!findUser)
      return res
        .status(404)
        .json({ error: true, message: "Firm Key is not valid" });
    if (!(await controlTransaction_id(transaction_id, website)))
      return res.send({ status: 0, message: "Transaction id already exists" });

    const encryptedTransaction = new TransactionEncription({
      userId: firm_key,
      website,
      user_name_surname,
      user_id,
      callback,
      transaction_id,
      hash,
      papara,
    });
    const createdTransactionEncription = await encryptedTransaction.save();
    res.send({
      link: `${config.entegration}/${
        papara ? "external-common-papara" : "external-common"
      }?hashed=${createdTransactionEncription._id}`,
    });
  } catch (err) {
    // console.log(err)
    return res.status(404).json({
      error: true,
      message: "Firm Key is not valid",
      errorMessage: err,
    });
  }
};

route.get("/transaction-encription", async (req, res) => {
  const { hashed } = req.query;
  if (!hashed)
    return res
      .status(404)
      .json({ error: true, message: "Hashed is not valid" });
  const transactionEncription = await TransactionEncription.findById(hashed);
  if (!transactionEncription)
    return res
      .status(404)
      .json({ error: true, message: "Hashed is not valid" });
  res.send(transactionEncription);
});

route.post("/createdeposit", async (req, res) => {
  handleTransactionLink(req, res);
});

route.post("/createdeposit-papara", async (req, res) => {
  handleTransactionLink({ ...req, body: { ...req.body, papara: true } }, res);
});

route.get("/transaction", async (req, res) => {
  try {
    const { transactionUid, transaction_id, hashed } = req.query;
    try {
      let transaction = null;
      if (transactionUid) {
        transaction = await Transaction.findById(transactionUid);
      } else if (transaction_id) {
        transaction = await Transaction.findOne({
          transactionId: transaction_id,
        });
        if (!transaction) {
          transaction = await Connections.findOne({
            transactionId: transaction_id,
          });
        }
      }
      else if(hashed){
          const transactionEncription = await TransactionEncription.findById(hashed);
          if(transactionEncription){
            transaction = await Transaction.findOne({
              transactionId: transactionEncription.transaction_id,
            });
            if(transaction){
              return res.send({
                transactionId: transaction._id,
                status:
                  transaction.status === 0
                    ? "pending"
                    : transaction.status === 1
                    ? "success"
                    : transaction.status === 2
                    ? "fail"
                    : transaction.status,
                amount: transaction.amount,
                transaction_id: transaction.transactionId,
              })
            }
          }
      }

 if (!transaction)
          return res
            .status(404)
            .json({ error: true, message: "Transaction not found" });
      res.send({
        transactionId: transaction._id,
        website: transaction.website,
        user_name_surname: transaction.user_name_surname,
        user_id: transaction.user_id,
        status:
          transaction.status === 0
            ? "pending"
            : transaction.status === 1
            ? "success"
            : transaction.status === 2
            ? "fail"
            : transaction.status,
        amount: transaction.amount,
        transactionTime: transaction.transactionTime,
        transaction_id: transaction.transactionId,
        hash: transaction.hash,
      });
    } catch (err) {
      return res
        .status(404)
        .send({ message: "Transaction id could not found" });
    }
  } catch (err) {
    return res.status(404).json({
      error: true,
      message: "Firm Key is not valid",
      errorMessage: err,
    });
  }
});

module.exports = route;
