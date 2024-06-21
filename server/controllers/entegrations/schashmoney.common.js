const { bankAccounts } = require("../../../src/consts/banks.json");
const BankAccountsController = require("../bankaccounts");
const TransactionController = require("../transactions");
const {
  websiteCodeHandler,
  getWebisteByTargetWebsite,
  sendTransactionSocket,
  isWebsiteActive
} = require("../general");
const Transactions = require("../../schemas/transactions");
const config = require("../../config");
const callbackSchema = require("../../schemas/callbacks");
const axios = require("axios");
// @ts-ignore
const logger = require("pino")();
const crypto = require("crypto");
const moment = require("moment");
const API_KEY = config.papara
  ? config.entegrations.scashmoney.sCashMoneyPaparaApiKey
  : config.entegrations.scashmoney.sCashMoneyBankApiKey;
const WEBSITE_TARGET = "scashmoney";
const ENTEGRATION_TYPES = require("../../consts/entegration-types");
const { handlePlayerTransactions } = require("../players");


const checkApiKey = (requestedApi) => {
  return API_KEY === requestedApi;
};

const checkBearerToken = (req) => {
  return req.headers?.apikey == API_KEY
}

const deposit = async (req, res) => {
  const {
    apikey,
    amount,
    fullname,
    userdata: username,
    callback_url,
    bank_id,
    hash, // SHA256 ile hashlenecek veri (apikey+transaction_id+secret)
    transaction_id,
    description,
  } = req.body;
  if (!checkApiKey(apikey)) {
    res.status(403).send({
      status: false,
      code: 400,
      message: "Invalid API Key",
    });
    return {
      error: true,
    };
  }

  if (
    !amount ||
    !fullname ||
    !username ||
    !callback_url ||
    bank_id === undefined ||
    !hash ||
    !transaction_id
  ) {
    res.status(400).send({
      status: false,
      code: 400,
      message: "Missing required fields",
    });
    return {
      error: true,
    };
  }

  const generatedHash = generateHash({
    apikey,
    transaction_id,
    amount,
  });
  if (hash !== generatedHash) {
    res.status(400).send({
      status: false,
      code: 400,
      message: "Invalid hash",
    });
    return {
      error: true,
    };
  }

  const websiteCode = await websiteCodeHandler(WEBSITE_TARGET); // website kodunu çek
  const websiteUser = await getWebisteByTargetWebsite(WEBSITE_TARGET); // website id'sini çek

  const { isBanned } = await handlePlayerTransactions({
    nameSurname: fullname,
    user_id: username,
    webSiteCode: websiteCode,
    website: websiteUser.targetWebsite,
  });

  if (isBanned) {
    res.status(500).send({
      status: false,
      code: 400,
      message: "User is banned",
    })
    return {
      error: true
    }
  }

  if (
    await userTimeOutController({ type: "deposit", user_id: username, amount }) // Kullanıcı 5 dakika içinde tekrar istek atmış mı spam önlemek için
  ) {
    logger.child({
      type: "deposit", user_id: username, amount
    }).error("User already sended deposit request");
    res.status(200).send({
      status: false,
      code: 400,
      message: "User already sended deposit request"
    })
    return {
      error: true
    }
  }

  // first find bank account
  const filter = BankAccountsController.filtergetBankHandler({
    minimumDepositLimit: Number(amount),
    maximumDepositLimit: Number(amount),
  });

  const findedBankAccount = await BankAccountsController.bankAccountHandler(
    "",
    "deposit",
    amount,
    config.papara
      ? "Papara"
      : bankAccounts[bank_id]
        ? bankAccounts[bank_id]
        : "7/24 Fast",
    filter,
    WEBSITE_TARGET
  );

  if (!findedBankAccount) {
    res.status(400).send({
      status: false,
      code: 400,
      message: "No bank account found for this amount or bank id",
    });
    return {
      error: true,
    };
  }

  if (!(await isWebsiteActive(WEBSITE_TARGET))) {
    res.status(500).send({
      status: false,
      code: 500,
      message: "Yöntem Geçerli Değil",
    });

    return {
      error: true,
    };
  }

  //   if (
  //     await userTimeOutController({ type: "deposit", user_id, firm_key: userId }) // Kullanıcı 5 dakika içinde tekrar istek atmış mı spam önlemek için
  //   )
  //     return res.status(200).send({ timeout: true });



  if (!websiteUser) {
    res.status(500).json({
      status: "fail",
      message: "Transaction başarısız.",
    });
    return {
      error: true,
    };
  }

  const generatedUniqueTransactionId = `${websiteCode}_${transaction_id}`;

  const transactionIdExist = await Transactions.findOne({
    transactionId: generatedUniqueTransactionId,
  });

  if (transactionIdExist) {
    res.status(400).json({
      status: "fail",
      message: "Transaction id already exist.",
    });
    return {
      error: true
    }
  }

  const createTransaction = new Transactions({
    hash: hash,
    validationCode: "",
    userId: websiteUser.parentAccount || websiteUser._id,
    website: WEBSITE_TARGET,
    websiteId: -1,
    amount,
    transactionId: generatedUniqueTransactionId,
    userIdInWebsite: "",
    nameSurname: fullname,
    bankAccountId: findedBankAccount._id,
    type: "deposit",
    user_id: username,
    callback: callback_url,
    transactionTime: Date.now(),
    papara: config.papara ? true : false,
    pool: findedBankAccount?.pool,
    entegration: ENTEGRATION_TYPES.SCASHMONEY,
  });

  try {
    await createTransaction.save();
    const populatedTransaction = await Transactions.findById(
      createTransaction._id
    ).lean();
    try {
      populatedTransaction.bankAccountId = findedBankAccount;
      // @ts-ignore
      populatedTransaction.websiteCodeS = websiteCode;
    } catch (e) { }
    await sendTransactionSocket(populatedTransaction);

    // sendPushNotification(
    //   selectedPoolUser ? selectedPoolUser : userId,
    //   "deposit",
    //   poolUser?.pool
    // );
  } catch (e) {
    logger.error(e);
    res.status(500).send("fail => " + e);
    return {
      error: true,
    }
  }
  return {
    createTransaction,
    findedBankAccount,
  };
};

const generateHash = ({ apikey, transaction_id, amount }) => {
  const secret = config.entegrations.scashmoney.scashmoneySecretKey;
  return crypto
    .createHash("sha256")
    .update(apikey + transaction_id + secret + amount)
    .digest("hex");
};

const sendCallBack = async ({
  url,
  message,
  type = "",
  user_id = "",
  user_name_surname = "",
  hash = "",
  transaction_id = "",
  amount = 0,
  status = "",
  transactionUid = "",
}) => {
  if (!url)
    return logger
      .child({
        message: "Callback yok",
        transaction_id,
        user_name_surname,
        type,
        amount,
      })
      .error("Callback yok");

  let successStatus = null;
  let responseMessage = "";

  try {
    const response = await axios.default.post(url, {
      status: status == "success",
      // @ts-ignore
      amount: parseFloat(amount),
      hash: generateHash({
        apikey: API_KEY,
        transaction_id: transaction_id,
        // @ts-ignore
        amount: parseFloat(amount),
      }), // SHA256 ile hashlenecek veri (apikey+transaction_id+secret+amount),
      transaction_id: transaction_id, // yatırımın
      update_date: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    responseMessage = response.data.message;
    console.log(
      "Gönderilen Callback",
      url,
      "transaction_id",
      transaction_id,
      "response",
      response.data
    );
    successStatus = response.data.status == true;
  } catch (error) {
    successStatus = false;
    logger
      .child({
        message: "Failed Callback",
        url,
        transaction_id: transaction_id,
      })
      .error("Failed Callback");
  }

  try {
    const newData = new callbackSchema({
      url,
      message,
      type,
      user_id,
      user_name_surname,
      hash,
      transaction_id,
      amount,
      status,
      success: successStatus,
      transactionUid,
      entegration: "scashmoney",
      response: responseMessage,
    });
    const savedData = await newData.save();
    return savedData;
  } catch (e) {
    logger.child({ error: e }).error("Callback gönderilemedi");
  }
};

const userTimeOutController = async ({ type, user_id, amount }) => {
  const startOf5MinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  // if last transaction less than 5 minutes return false
  const isExist = await Transactions.findOne({
    amount: amount,
    entegration: ENTEGRATION_TYPES.SCASHMONEY,
    user_id,
    type,
    status: { $ne: -1 }, // tamamen index bozulmaması için
    // $or: [{ status: 0 }, { status: 1 }, { status: 2 }],
    createdAt: { $gte: startOf5MinutesAgo },
  }).lean();
  if (isExist) return true;
  return false;
};

module.exports = {
  deposit,
  sendCallBack,
  checkBearerToken
};
