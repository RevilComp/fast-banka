const logger = require("pino")();
const config = require("../config");
const axios = require("axios");
const moment = require("moment");
const PaparaMail = require("../schemas/paparamail");
const Transactions = require("../schemas/transactions");
const PaparaTransactions = require("../schemas/paparatransactions");
const BankAccounts = require("../schemas/bankaccounts");

const paparaLoginAccount = async ({email, password, type}) => {
  try {
    const req = await axios.post(
      config.paparaBotConfigs.paparaBotUrl + "login-account",
      {
        email,
        password,
        type,
      },
      {
        headers: {
          accessKey: config.paparaBotConfigs.paparaBotAccessKey,
        },
      }
    );
    if (req?.data?.error) {
      logger.child({
        req: req?.data
      }).error("Papara Login Hata oldu")
      return false;
    } else {
      return true;
    }
  } catch (e) {
    logger.child({ response: e?.response?.data}).error("Papara Login Check Error");
    return false;
  }
};

function waitFunc(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const createPaparaTransactions = async (
  transactionId,
  paparaAccountId,
  create_again
) => {
  if (create_again) {
    const newPaparaTransaction = new PaparaTransactions({
      transactionId: transactionId,
      paparaMail: paparaAccountId,
      isLocked: false,
    });
    await newPaparaTransaction.save();
    return newPaparaTransaction;
  }
};

const checkDepositControl = async (
  transaction,
  wait = true,
  create_again = true,
  callbackPromise = async (someParam) => {}
) => {
  return new Promise(async (resolve, reject) => {
    if (wait) await waitFunc(2000);

    const getBankAccount = await BankAccounts.findById(
      transaction.bankAccountId
    ).populate("paparaMail");
    const paparaMailAccount = getBankAccount.paparaMail;
    if(!paparaMailAccount){
      logger.error("Papara Mail Account Not Found")
      return resolve(false);
    }
   
    console.log("paparaMailAccount", paparaMailAccount)
    try {
      const req = await axios.post(
        config.paparaBotConfigs.paparaBotUrl + "control-transaction",
        {
          sender_name: transaction.nameSurname,
          email: paparaMailAccount.email,
          password: paparaMailAccount.password,
          amount: transaction.amount,
          type: paparaMailAccount.type,
        },
        {
          headers: {
            accessKey: config.paparaBotConfigs.paparaBotAccessKey,
          },
        }
      );
      if(req?.data?.emailAuthError == true){
       await PaparaMail.findByIdAndUpdate(
        paparaMailAccount._id, {
            connected: "false"
          }
        );
      }
      try {
        logger.info(
          "Deposit check : transaction: " +
            transaction._id +
            " Finded : " +
            req.data?.finded +
            " mail uids: " +
            req.data?.uids ||
            [] + " - time: " + moment().format("DD.MM.YYYY HH:mm")
        );
      } catch (e) {
        logger.error("Error occoured during papara bot deposit request log", e);
      }

      if (req.data?.finded !== false) {
        const uids =
          req.data?.uids.map((e) => paparaMailAccount?.email + "_" + e) ||
          [];

        const findUidsInTransaction = await Transactions.find({
          uid: { $in: uids },
        });
        const notUsedUids = uids.filter(
          (uid) => !findUidsInTransaction.find((t) => t.uid === uid)
        );
        if (notUsedUids.length > 0) {
          await Transactions.findByIdAndUpdate(transaction._id, {
            uid: notUsedUids[0],
          }); // approve olacak mı ?
          // await PaparaTransactions.findByIdAndDelete(newPaparaTransaction._id)
          logger
            .child({
              uid: notUsedUids[0],
              transactionId: transaction,
              status: 1,
            })
            .info("Deposit verified");
          if (callbackPromise) await callbackPromise(transaction._id);
          resolve(true);
        } else {
          const checkIfFailedExist = await PaparaTransactions.findOne({
            transactionId: transaction._id,
          });
          if (!checkIfFailedExist)
            await createPaparaTransactions(
              transaction._id,
              paparaMailAccount._id,
              create_again
            );
          resolve(false);
        }
      } else {
        logger.error(
          "Deposit check : transaction: " +
            transaction._id +
            " Finded : " +
            req.data?.finded +
            " mail uids: " +
            req.data?.uids ||
            [] + " - time: " + moment().format("DD.MM.YYYY HH:mm")
        );
        const checkIfFailedExist = await PaparaTransactions.findOne({
          transactionId: transaction._id,
        });
        if (!checkIfFailedExist)
          await createPaparaTransactions(
            transaction._id,
            paparaMailAccount._id,
            create_again
          );
        resolve(false);
      }
    } catch (e) {
      console.log("Papara Login Check", e);
      resolve(false);
    }
  });
};

module.exports = { paparaLoginAccount, checkDepositControl };
