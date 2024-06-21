const logger = require("pino")();
const WebsiteUserHandler = require("../controllers/website.cache.class");
const RabbitMqManager = require("../listener/rabbit.manager");
const config = require("../config");
const ENTEGRATION_TYPES = require("../consts/entegration-types");
const ScashmoneyController = require("../controllers/entegrations/schashmoney.common");
const TransactionVerifyRejectPublisher = RabbitMqManager.createPublisher({
  // Enable publish confirmations, similar to consumer acknowledgements
  confirm: true,
  // Enable retries
  maxAttempts: 2,
  // Optionally ensure the existence of an exchange before we use it
  exchanges: [{ exchange: "transaction", type: "topic" }],
});

const { filtergetBankHandler } = require("./bankaccounts");
// @ts-ignore
const {
  findWebsite,
  checkLogin,
  checkAdmin,
  checkSuperAdmin,
  sendCallBack,
  saveWebsite,
  getWebsiteById,
  sendTransactionSocket,
  sendTransactionSocketForwardWithdraw,
  updateTransactionSocket,
  sendPushNotification,
  DateHandler,
  websiteCodeHandler,
  selectUserForPool,
  checkGodAdmin,
  isWebsiteActive,
} = require("./general");
// @ts-ignore
const Transactions = require("../schemas/transactions");
const BankAccounts = require("../schemas/bankaccounts");
const Users = require("../schemas/users");
const BannedIps = require("../schemas/bannedips");
const { handlePlayerTransactions } = require("./players");
const moment = require("moment");
var crypto = require("crypto");
const ExcelJS = require("exceljs");
const { checkDepositControl } = require("./papara-bot");
const cron = require("node-cron");
const PaparaTransactions = require("../schemas/paparatransactions");
// @ts-ignore
const Pool = require("../schemas/pool");
// @ts-ignore
const mongoose = require("mongoose");
const TransactionEncription = require("../schemas/transaction-encription");

const initCronJob = async () => {
  cron.schedule(config.paparaBotConfigs.cronjob, async () => {
    const findAllUnsuccessfullPaparaTransactions =
      await PaparaTransactions.find({ isLocked: false });
    logger.info(
      "Papara Bot Cronjob " +
        findAllUnsuccessfullPaparaTransactions.length +
        " adet işlem kontrol edilecek"
    );
    for await (const paparaTransaction of findAllUnsuccessfullPaparaTransactions) {
      await PaparaTransactions.findByIdAndUpdate(paparaTransaction._id, {
        isLocked: true,
      });
      const findTransaction = await Transactions.findById(
        paparaTransaction.transactionId
      );
      if (!findTransaction) continue;

      checkDepositControl(findTransaction)
        .then(async (param) => {
          if (param === true) {
            // @ts-ignore
            await handleVerifyRejectTransaction({
              _id: findTransaction._id,
              status: 1,
              validationCode: "BOT",
              byBot: true,
            });
            logger.info("Bot Onaylanana İşlem " + findTransaction._id);
            await PaparaTransactions.findByIdAndUpdate(paparaTransaction?._id, {
              isLocked: false,
            });
          } else {
            if (olderThanExceedetTime(paparaTransaction.createdAt)) {
              // @ts-ignore
              logger.info(
                "Bot Reddedilen Süreyi Aşmış İşlem " + findTransaction._id
              );
              await handleVerifyRejectTransaction({
                _id: findTransaction._id,
                status: 2,
                validationCode: "BOT",
                byBot: true,
              });
              await PaparaTransactions.findByIdAndDelete(paparaTransaction._id);
            } else {
              await PaparaTransactions.findByIdAndUpdate(
                paparaTransaction?._id,
                {
                  isLocked: false,
                }
              );
            }
          }
        })
        .catch(async (e) => {
          await PaparaTransactions.findByIdAndUpdate(paparaTransaction._id, {
            isLocked: false,
          });
        });
    }

    const oldTransactions = moment().subtract(60, "minutes").toDate();

    await PaparaTransactions.deleteMany({
      createdAt: { $lte: oldTransactions },
      isLocked: true,
    });
  });
};

const olderThanExceedetTime = (createdAt) => {
  const createdAtDate = moment(createdAt);
  var now = moment(); // Şu anki tarih ve saat
  var diffMinutes = now.diff(createdAtDate, "minutes"); // "createdAt" ile "şu an" arasındaki dakika farkı
  return diffMinutes > config.paparaBotConfigs.exceededMinute;
};
const recheckPaparaDeposit = async (req, res) => {
  const transaction = await Transactions.findById(req.body._id);
  // @ts-ignore
  const user = await checkLogin(req, res);
  // if (!transaction) return res.status(500).send("fail");
  if (!transaction)
    return res.status(500).json({
      status: "fail",
      message: "Transaction bulunamadı.",
    });

  checkDepositControl(transaction).then(async (param) => {
    if (param === true) {
      // @ts-ignore
      await handleVerifyRejectTransaction({
        _id: transaction._id,
        status: 1,
        validationCode: "BOT",
        byBot: true,
      });
      const paparaTransaction = await PaparaTransactions.findOne({
        transactionId: transaction._id,
      });
      await PaparaTransactions.findByIdAndDelete(paparaTransaction?._id);
    }
  });

  // return res.status(200).send({ status: "success", message: "İşlem Başarılı" });
  return res.status(200).json({ status: "success", message: "İşlem Başarılı" });
};

const transactionFilterByWebsiteId = async (websiteId, res) => {
  const website = await Users.findById(websiteId);
  if (!website)
    return res
      .status(500)
      .send({ status: "fail", message: "Website bulunamadı" });

  return {
    website: {
      $regex: website.targetWebsite,
    },
  };
};

const getTransactionSummary = async (req, res = false) => {
  let papara = config.papara;

  const startDate = req?.body?.getAll
    ? new Date("2014-05-23")
    : req?.body?.startDate
    ? DateHandler(req.body.startDate, true)
    : DateHandler(moment().startOf("day").format("YYYY-MM-DD"), true);

  const endDate = req?.body?.endDate
    ? DateHandler(req?.body?.endDate)
    : DateHandler(moment().endOf("day").format("YYYY-MM-DD"));

  const hamUser = await checkLogin(req?.body?.req);
  let user = req?.user ? req?.user : await checkLogin(req);
  const type = req?.body?.type || "deposit";

  if (!user)
    res.status(500).json({
      status: "fail",
      message: "Kullanıcı bulunumadı.",
    });

  const mainUser = req?.user ? req?.user : await checkLogin(req);

  let queryObject = {
    // ...(papara ? { papara: true } : { papara: { $ne: true } }),
    status: Number(req.body?.status) || 0,
    type: type,
    updatedAt: {
      $gte: startDate,
      $lt: endDate,
    },
    ...(req.body?.websiteId
      ? await transactionFilterByWebsiteId(req.body?.websiteId, res)
      : undefined),
  };

  if (user.type === "website") {
    // @ts-ignore
    queryObject.website = {
      $regex: user.targetWebsite,
    };
  } else if (req?.body?.ltd) {
    queryObject = {
      ...queryObject,
      // @ts-ignore
      "history.doneBy": req.body.ltd,
    };
  } else if (mainUser?.pool) {
    queryObject["$or"] = [{ pool: new mongoose.Types.ObjectId(mainUser.pool) }];
  } else if (req.body?.pool && mainUser?.type === "god") {
    queryObject.pool = new mongoose.Types.ObjectId(req.body?.pool);
  } else if (user !== "all" && user.type !== "god") {
    // @ts-ignore
    queryObject.pool = new mongoose.Types.ObjectId(mainUser.pool);
  }

  if (req.body?.pool && hamUser?.type === "god") {
    console.log("isteyen kalır");
    queryObject.pool = new mongoose.Types.ObjectId(req.body?.pool);
  }

  // if(req.body.websiteId && hamUser?.type === "god") {
  //   queryObject.website = req.body.websiteId; // TODO : websiteId mi yoksa website mi olacak?
  // }
  // console.log("queryObject", queryObject)
  const ret = await Transactions.aggregate([
    {
      $match: queryObject,
    },
    { $group: { _id: null, amount: { $sum: "$amount" } } },
  ]);

  try {
    ret[0]["number"] = await Transactions.countDocuments(queryObject);
  } catch (e) {
    // @ts-ignore
    if (res) return res?.send(ret);
    return null;
  }

  // @ts-ignore
  if (res) return res?.send(ret[0]);

  return ret[0];
};

const get = async (req, res) => {
  const startDate = req.body.startDate
    ? DateHandler(req.body.startDate, true)
    : DateHandler(moment().startOf("day").format("YYYY-MM-DD"), true);
  const endDate = req.body.endDate
    ? DateHandler(req.body.endDate)
    : DateHandler(moment().endOf("day").format("YYYY-MM-DD"));
  const skip = isNaN(Number(req?.body?.skip)) ? 0 : Number(req?.body?.skip);
  const limit = isNaN(Number(req?.body?.limit)) ? 20 : Number(req?.body?.limit);
  // @ts-ignore
  const user = await checkLogin(req, res);

  if (!user) {
    return res.status(500).json({
      status: "fail",
      message: "Bir hata ile karşılaşıldı.",
    });
  }
  const {
    type = "deposit",
    pool,
    ltd,
    search,
    status,
    papara,
    websiteId,
  } = req.body;

  let queryObject = {
    // ...(config.papara
    //   ? { papara: true }
    //   : { papara: { $ne: true } }),

    ...(user.type === "god" && pool
      ? { pool: new mongoose.Types.ObjectId(pool) }
      : undefined),
    ...(user.type === "website"
      ? { website: { $regex: user.targetWebsite } }
      : undefined),
    ...(ltd
      ? {
          "history.doneBy": req.body.ltd,
        }
      : undefined),
    ...(search
      ? { nameSurname: { $regex: req.body.search, $options: "i" } }
      : undefined),
    type,
    ...(user.type === "super_admin" ||
    user.type === "admin" ||
    user.type === "user"
      ? { pool: new mongoose.Types.ObjectId(user.pool) }
      : undefined),
    ...(status ? { status: Number(req.body.status) } : undefined),
    updatedAt: {
      $gte: startDate,
      $lte: endDate,
    },
    ...(websiteId
      ? await transactionFilterByWebsiteId(websiteId, res)
      : undefined),
  };

  let getTransactions = await Transactions.find(queryObject)
    .sort({ updatedAt: -1 })
    .skip(skip || 0)
    .limit(limit)
    .lean();

  for (let i = 0; i < getTransactions.length; i++) {
    try {
      getTransactions[i].websiteCodeS = await websiteCodeHandler(
        getTransactions[i].website
      );
      getTransactions[i].bankAccountId = await BankAccounts.findById(
        getTransactions[i].bankAccountId
      );
    } catch (e) {
      logger.info(
        "Yanlış Banka Bilgisi" +
          getTransactions[i]._id +
          "Bank Id" +
          getTransactions[i].bankAccountId
      );
    }
  }

  return res.send(getTransactions);
};

const islemListesi = async (req, res) => {
  const startDate = req.body.getAll
    ? new Date("2014-05-23")
    : req.body.startDate
    ? DateHandler(req.body.startDate, true)
    : DateHandler(moment().add(-1, "days").format("YYYY-MM-DD"), true);

  const endDate = req.body.endDate
    ? DateHandler(req.body.endDate)
    : DateHandler(moment().add(1, "day").format("YYYY-MM-DD"));

  // @ts-ignore
  const user = await checkLogin(req, res);
  const skip = isNaN(Number(req?.body?.skip)) ? 0 : Number(req?.body?.skip);
  const limit = isNaN(Number(req?.body?.limit))
    ? 100000000
    : Number(req?.body?.limit);

  const {
    type = "all",
    status,
    nameSurname,
    user_id,
    price_min,
    price_max,
    website,
    papara,
  } = req.body;
  // if (!user) { return res.status(500).send("fail") }

  if (!user)
    return res.status(500).json({
      status: "fail",
      message: "Kullanıcı bulunamadı.",
    });

  if (user.type !== "god" && user?.type !== "super_admin")
    return res.status(500).json({
      status: "fail",
      message: "Kullanıcı bulunamadı.",
    });

  let queryObject = {
    // @ts-ignore
    ...(user.type === "website"
      ? { website: { $regex: user.targetWebsite } }
      : {}),
    // userId: user.parentAccount || user._id,
    updatedAt: {
      $gte: startDate,
      $lte: endDate,
    },
  };

  if (website) queryObject.website = { $regex: website };

  // @ts-ignore
  if (type !== "all") queryObject.type = type;
  // @ts-ignore
  if (status !== "all") queryObject.status = status;
  // @ts-ignore
  if (nameSurname) queryObject.nameSurname = { $regex: nameSurname };
  // @ts-ignore
  if (user_id) queryObject.user_id = { $regex: user_id };
  // @ts-ignore
  if (price_min || price_max) queryObject.amount = {};
  // @ts-ignore
  if (price_min)
    queryObject.amount = { ...queryObject.amount, $gte: price_min };
  // @ts-ignore
  if (price_max)
    queryObject.amount = { ...queryObject.amount, $lte: price_max };

  let getTransactions = await Transactions.find(queryObject)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  for (let i = 0; i < getTransactions.length; i++) {
    try {
      getTransactions[i].bankAccountId = await BankAccounts.findById(
        getTransactions[i].bankAccountId
      );
      getTransactions[i].user = await Users.findById(getTransactions[i].userId);

      getTransactions[i].websiteCodeS = await websiteCodeHandler(
        getTransactions[i].website
      );
    } catch (e) {}
  }

  res.send(getTransactions);
};

const forwardWithdraw = async (req, res) => {
  const user = await checkLogin(req);

  // if (!user) {
  //   return res.status(500).send("fail");
  // }

  if (!user)
    return res.status(500).json({
      status: "fail",
      message: "Kullanıcı bulunamadı.",
    });

  const { transactionId } = req.body;
  const transaction = await Transactions.findById(transactionId);

  // if (!transaction) {
  //   return res.status(500).send("fail");
  // }

  if (!transaction)
    return res.status(500).json({
      status: "fail",
      message: "Transaction bulunamadı.",
    });

  const isGodAdmin = user.type === "god" || user.type === "super_admin";

  // if (!isGodAdmin && user?.pool !== transaction.pool) {
  //   return res.status(500).send({
  //     status: "fail",
  //     message: "Bu işlemi yapmaya yetkiniz yok",
  //   });
  // }

  if (!isGodAdmin && user?.pool !== transaction.pool)
    return res.status(500).json({
      status: "fail",
      message: "Bu işlemi yapmaya yetkiniz yok.",
    });
    
  const website = await findWebsite(transaction.website);
  const pools = await Pool.find({
    $expr: { $lt: ["$currentWithdraw", "$withdrawLimit"] },
    targetWebsites: { $in: [website._id] },
    enabled: true,
  }).sort({ lastWithdrawDate: 1 });
  const getBanks = await BankAccounts.find({
    ...filtergetBankHandler({
      minimumWithdrawLimit: Number(transaction.amount),
      maximumWithdrawLimit: Number(transaction.amount),
      active: true,
    }),

    pool: { $in: pools.map((pool) => pool._id) },
  });

  let selectedBankAccount = null;

  for (let i = 0; i < getBanks.length; i++) {
    if (getBanks[i].pool.toString() !== transaction.pool.toString()) {
      selectedBankAccount = getBanks[i];
      break;
    }
  }
  if (!selectedBankAccount)
    return res.status(500).json({
      status: "fail",
      message: "Güncel başka bir banka hesabı bulunamadı.",
    });

  const pool = selectedBankAccount?.pool;

  await Transactions.findByIdAndUpdate(transactionId, {
    bankAccountId: selectedBankAccount._id,
    pool: pool,
    userId: user?.parentAccount || user._id,
  });

  await sendTransactionSocketForwardWithdraw(transaction);

  // return res.send({
  //   status: "success",
  //   message: "İşlem başarılı",
  // });

  return res.status(500).json({
    status: "success",
    message: "İşlem başarılı.",
  });
};

const getOne = async (req, res) => {
  // @ts-ignore
  const user = await checkLogin(req, res);
  const _id = req.body._id;

  // if (!user || !_id) {
  //   return res.status(500).send({ status: "fail", message: "Parametre eksik" });
  // }

  if (!user || !_id)
    res.status(500).json({
      status: "fail",
      message: "Parametre eksik.",
    });

  const getTransaction = await Transactions.findById(_id).lean();

  // if (!getTransaction) {
  //   return res.status(500).send({ status: "fail", message: "İşlem bulunamdı" });
  // }

  if (!getTransaction)
    res.status(500).json({
      status: "fail",
      message: "İşlem bulunumadı.",
    });

  getTransaction.websiteCodeS = await websiteCodeHandler(
    getTransaction.website
  );

  const bankAccount = await BankAccounts.findById(getTransaction.bankAccountId);

  res.send({
    status: "success",
    ...getTransaction,
    selectedBankAccount: bankAccount,
  });
};

const transactionControl = async ({
  amountParam,
  bankAccountId,
  type = "deposit",
  papara = false,
}) => {
  let amount = isNaN(Number(amountParam)) ? 0 : Number(amountParam);
  let updateObj = {
    lastTransactionDate: Date.now(),
    ...(type === "deposit"
      ? {
          $inc: { depositNumber: 1, balance: amount, depositAmount: amount },
        }
      : {
          $inc: { withdrawNumber: 1, balance: -amount, withdrawAmount: amount },
        }),
  };

  try {
    const bank = await BankAccounts.findByIdAndUpdate(
      bankAccountId,
      updateObj,
      {
        new: true,
      }
    );

    const isDepositGreaterThanTransactionLimit =
      bank?.depositNumber >= bank?.accountDepositLimitTransactionNumber;
    const isWithdrawGreaterThanTransactionLimit =
      bank?.withdrawNumber >= bank?.accountWithdrawLimitTransactionNumber;
    const isAmountGreaterThanSingularDeposit =
      (amount || 0) >= bank?.singularDepositForAccountPassive;

    if (
      isDepositGreaterThanTransactionLimit ||
      isWithdrawGreaterThanTransactionLimit ||
      isAmountGreaterThanSingularDeposit
    ) {
      await BankAccounts.findByIdAndUpdate(bankAccountId, { active: false });
    }
  } catch (e) {
    logger.error("Bank account update error", e);
  }
};

const transactionSkipList = {}; // Önceden tanımlanmış bir nesne

const handleVerifyRejectTransaction = async ({
  _id,
  status,
  selectedBankAccount,
  rejectReason,
  validationCode,
  description,
  user,
  byBot = false,
}) => {
  await TransactionVerifyRejectPublisher.send("transactionVerifyReject", {
    _id,
    status,
    selectedBankAccount,
    rejectReason,
    validationCode,
    byBot,
    user,
    description,
  });
  logger
    .child({
      _id,
      status,
      selectedBankAccount,
      rejectReason,
      validationCode,
      byBot,
      description,
    })
    .info("İşlem onayı veya reddi başarılı bir şekilde gönderildi.");
};

const verifyRejectDeposit = async (req, res) => {
  // @ts-ignore
  const user = await checkLogin(req, res);

  // if (!user) {
  //   return res.status(500).send({ status: "fail", message: "Giriş yapınız" });
  // }

  if (!user)
    return res.status(500).json({
      status: "fail",
      message: "Giriş yapınız.",
    });

  const {
    _id,
    status,
    selectedBankAccount,
    rejectReason,
    validationCode,
    type,
    description,
  } = req.body;

  if (!_id || !status || !type)
    return res.status(500).json({
      status: "fail",
      message: "Parametreler eksik 1.",
    });

  if (type === "withdraw" && status == 1 && !selectedBankAccount)
    return res.status(500).json({
      status: "fail",
      message: "Parametreler eksik 2.",
    });

  await handleVerifyRejectTransaction({
    _id,
    status,
    selectedBankAccount,
    rejectReason,
    validationCode,
    user,
    description,
  });

  res.send({ status: "success", message: "ok" });
  // res.json({ status: "success", message: "ok" });
};

const transcationMovementInfo = async (req, res) => {
  const { _id } = req.body;

  const user = await checkLogin(req);
  if (!user)
    return res
      .status(500)
      .json({ status: "fail", message: "Kullanıcı bulunamadı." });
  const transaction = await Transactions.findById(_id);
  if (!transaction)
    return res
      .status(500)
      .json({ status: "fail", message: "Transaction bulunamadı." });
  if (
    transaction.pool.toString() !== user.pool?.toString() &&
    user.type !== "god"
  )
    return res.status(500).json({
      status: "fail",
      message: "Transaction'un pool'u ile kullanıcının pool'u uyuşmuyor.",
    });

  res.send({
    sender: await Users.findById(transaction?.userId),
    senderBank: await BankAccounts.findById(transaction.bankAccountId),
    userList: await Users.find({}),
  });
};

const manuelDeposit = async (req, res) => {
  const {
    website,
    amount,
    transactionId,
    userIdInWebsite,
    nameSurname,
    bankAccountId,
    transactionTime,
    papara,
  } = req.body;
  // if (!courseCode || !courseName) { return res.status(500).send("parameter missing") }
  // @ts-ignore
  if (!(await checkLogin(req, res))) {
    return res.status(500).send({ status: "fail", message: "Giriş yapınız" });
  }

  // @ts-ignore
  const user = await checkLogin(req, res);
  const createTransaction = new Transactions({
    userId: user._id,
    website,
    amount,
    validationCode: "",
    transactionId,
    userIdInWebsite,
    nameSurname,
    bankAccountId,
    type: "deposit",
    transactionTime,
    papara: config.papara ? true : false,
    pool: user?.pool,
  });
  try {
    await createTransaction.save();

    res.json({ status: "success", message: "ok" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "fail", message: e });
  }
};
const validateHash = (userId, hash) => {
  return true;
  const createHashHash = crypto
    .createHash("sha256")
    .update(userId + "_as-pays.com") // `+` operatörü ile string birleştirilmesi
    .digest("hex");
  const hashWithSecret = crypto
    .createHmac("sha256", "_as-pays.com")
    .update(userId)
    .digest("hex");
  return createHashHash === hash || hashWithSecret === hash; // `==` yerine `===` kullanıldı ve return yer değiştirildi
};

const controlTransaction_id = async (transaction_id, website) => {
  try {
    const websiteCode = await websiteCodeHandler(website);
    const transaction = await Transactions.find({
      transactionId: transaction_id,
    });
    for (let i = 0; i < transaction.length; i++) {
      const getWebsite = await websiteCodeHandler(transaction[i].website);
      if (getWebsite === websiteCode) {
        logger.error("Transaction id exist" + transaction_id + website);
        return false;
      }
    }
    return true;
  } catch (e) {
    return true;
  }
};

const validateIp = async (ipaddress) => {
  if (!ipaddress) return true;
  const findBannedIp = await BannedIps.findOne({ ipaddress: ipaddress });
  if (findBannedIp) return false;
  return true;
};

const userTimeOutController = async ({ type, user_id, firm_key }) => {
  const startOf5MinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  // if last transaction less than 5 minutes return false
  const isExist = await Transactions.findOne({
    userId: firm_key,
    user_id,
    type,
    $or: [{ status: 0 }],
    createdAt: { $gte: startOf5MinutesAgo },
  }).lean();
  if (isExist) return true;
  return false;
};

const makeWithdrawtRequest = async (req, res) => {
  let {
    userId,
    firm_key,
    amount,
    bankAccount,
    nameSurname,
    webSite,
    website,
    transactionTime = Date.now(),
    user_id,
    transaction_id,
    hash,
    callback,
    ipaddress,
  } = req.body;
  // ------
  logger.child({ body: req.body }).info("makeWithdrawtRequest");
  if (website && !webSite) webSite = website;
  // if(await userTimeOutController({type: "withdraw", user_id, firm_key: userId})) return res.status(200).send({timeout:true});
  if (callback.includes("AsPaysPG")) {
    callback = callback.replace("AsPaysPG", "PrPaysPG");
  }

  if (!(await isWebsiteActive(webSite)))
    // websitenin aktif olup olmadığı kontrolü
    return res.status(500).send({
      status: "fail",
      message: "Website geçerli değil",
    });

  const websiteCode = await websiteCodeHandler(webSite);
  const playerObj = {
    nameSurname,
    user_id,
    webSiteCode: websiteCode,
    website: webSite,
  };
  const { isBanned } = await handlePlayerTransactions(playerObj);
  if (isBanned)
    res.status(500).json({ status: "fail", message: "Oyuncu banlanmış" });

  const validIp = await validateIp(ipaddress);
  if (!validIp)
    return res
      .status(500)
      .json({ status: "fail", message: "Geçersiz IP adresi" + ipaddress });

  if (!userId || firm_key) userId = firm_key;
  let user = null;
  try {
    user = await Users.findById(userId);
  } catch (err) {
    // console.log(err)
    return res.status(404).json({
      status: "fail",
      error: true,
      message: "Firm Key is not valid",
      errorMessage: err,
    });
  }
  if (!(await controlTransaction_id(transaction_id, webSite)))
    return res.send({ status: 0, message: "Transaction id already exists" });
  if (!amount)
    return res
      .status(404)
      .json({ status: "fail", error: true, message: "Amount is not valid" });
  if (!validateHash(userId, hash))
    return res
      .status(500)
      .json({ status: "fail", message: "hash couldn't validate" });
  if (!user) {
    return res
      .status(500)
      .json({ status: "fail", message: "transaction failed" });
  }
  // await saveWebsite(webSite); // gereksiz artık

  const targetWebsite = await findWebsite(webSite); // for example targetWebsite = betcio
  if (!targetWebsite) {
    logger.error("ERR102: Website bulunamadı" + webSite + " " + targetWebsite);
    return res.status(500).send({
      status: "fail",
      message: "Website not found",
      website: webSite,
      targetWebsite: targetWebsite,
    });
  }
  const pools = await Pool.find({
    targetWebsites: { $in: [targetWebsite._id] },
    enabled: true,
  }).sort({ lastWithdrawDate: 1 });
  if (pools.length === 0) {
    return res.status(500).send({
      status: "fail",
      message: "No pool is active for this website",
      website: webSite,
    });
  }
  const getBanks = await BankAccounts.find({
    ...filtergetBankHandler({
      minimumWithdrawLimit: Number(amount),
      maximumWithdrawLimit: Number(amount),
      active: true,
      // ...(config.papara ? { bankName: "Papara"} : {})
    }),
    pool: { $in: pools.map((pool) => pool._id) },
  });

  const pool = getBanks[0]?.pool;

  const transactionDoc = {
    userId: user.parentAccount || user._id,
    website: webSite,
    validationCode: "",
    webSiteId: await getWebsiteById(webSite),
    amount,
    hash,
    userIdInWebsite: "",
    nameSurname,
    callback,
    bankAccount: bankAccount,
    type: "withdraw",
    transactionId: transaction_id,
    user_id: user_id,
    transactionTime: new Date(transactionTime),
    ipaddress,
    papara: config.papara,
    pool: pool,
  };

  const createTransaction = new Transactions(transactionDoc);
  try {
    await createTransaction.save();

    const populatedTransaction = await Transactions.findById(
      createTransaction._id
    ).lean();
    try {
      populatedTransaction.websiteCodeS = await websiteCodeHandler(webSite);
    } catch (e) {}

    await sendTransactionSocket(populatedTransaction);
    // sendPushNotification(
    //   selectedPoolUser ? selectedPoolUser._id : userId,
    //   "withdraw",
    //   selectedPoolUser ? selectedPoolUser?.pool : null
    // );

    if(callback.includes("betconstruct")){
      res.send("ok")
    }
    else{
      res.send({ status: "success", message: "İşlem başarılı" });
    }
  } catch (e) {
    logger.error(e);
    res.status(500).send({ status: "fail", message: e });
  }
};

const makeDepositRequest = async (req, res) => {
  const { hashed, amount, bankAccountId, ipaddress } = req.body;

  const transactionEncription = await TransactionEncription.findById(hashed);
  if (!transactionEncription)
    return res.status(500).send("Transaction not found");
  const {
    userId,
    user_name_surname: nameSurname,
    user_id,
    website: webSite,
    transaction_id,
    hash,
    callback,
  } = transactionEncription;

  const transactionTime = Date.now();

  if (!(await isWebsiteActive(webSite)))
    // websitenin aktif olup olmadığı kontrolü
    return res.status(500).send({
      status: "fail",
      message: "Website geçerli değil",
    });

  if (
    await userTimeOutController({ type: "deposit", user_id, firm_key: userId }) // Kullanıcı 5 dakika içinde tekrar istek atmış mı spam önlemek için
  )
    return res.status(200).send({ timeout: true });

  const getWebsiteCode = await websiteCodeHandler(webSite); // website kodunu çek

  const playerObj = {
    nameSurname,
    user_id,
    webSiteCode: getWebsiteCode,
    website: webSite,
  };

  const { isBanned } = await handlePlayerTransactions(playerObj);

  if (isBanned) return res.status(500).send("Player is banned");
  const validIp = await validateIp(ipaddress);

  // if (!validIp)
  // return res.status(500).send("ip address is not valid" + ipaddress);

  if (!validIp)
    return res.status(500).json({
      status: "fail",
      message: `Ip address geçerli değil: ${ipaddress}`,
    });

  // if (!(await controlTransaction_id(transaction_id, webSite)))
  //   return res.send({ status: 0, message: "Transaction id already exists" });

  const websiteUser = await Users.findById(userId);

  // if (!validateHash(userId, hash))
  //   return res.status(500).send("hash couldn't validate");

  if (!validateHash(userId, hash))
    return res.status(500).json({
      status: "fail",
      message: "Hash doğrulanamadı.",
    });

  // if (!websiteUser) {
  //   return res.status(500).send("transaction failed");
  // }

  if (!websiteUser)
    return res.status(500).json({
      status: "fail",
      message: "Transaction başarısız.",
    });

  await saveWebsite(webSite);

  const getBankAccount = await BankAccounts.findById(bankAccountId);
  if (!getBankAccount)
    return res.send({
      status: "fail",
      message: "Banka hesabı bulunamadı, yeni silinmiş olabilir.",
    });

  const createTransaction = new Transactions({
    hash: hash,
    validationCode: "",
    userId: websiteUser.parentAccount || websiteUser._id,
    website: webSite,
    websiteId: await getWebsiteById(webSite),
    amount,
    transactionId: transaction_id,
    userIdInWebsite: "",
    nameSurname,
    bankAccountId,
    type: "deposit",
    user_id: user_id,
    callback: callback,
    transactionTime: new Date(transactionTime),
    ipaddress,
    papara: config.papara ? true : false,
    pool: getBankAccount?.pool,
  });

  try {
    await createTransaction.save({ lean: true });
    const populatedTransaction = await Transactions.findById(
      createTransaction._id
    ).lean();
    try {
      populatedTransaction.bankAccountId = await BankAccounts.findById(
        bankAccountId
      ).lean();
      populatedTransaction.websiteCodeS = await websiteCodeHandler(webSite);
    } catch (e) {}
    await sendTransactionSocket(populatedTransaction);
    // sendPushNotification(
    //   selectedPoolUser ? selectedPoolUser : userId,
    //   "deposit",
    //   poolUser?.pool
    // );
    res.send("ok");

    if (config.papara) {
      checkDepositControl(createTransaction).then(async (param) => {
        if (param === true) {
          // @ts-ignore
          await handleVerifyRejectTransaction({
            _id: createTransaction._id,
            status: 1,
            validationCode: "BOT",
            byBot: true,
          });
        }
      });
    }
  } catch (e) {
    logger.error(e);
    res.status(500).send("fail => " + e);
  }
};

const remove = async (req, res) => {
  const { _id } = req.body;

  const user = await checkLogin(req);
  if (!user)
    return res
      .status(500)
      .json({ status: "fail", message: "Kullanıcı bulunamadı." });
  const transaction = await Transactions.findById(_id);
  if (!transaction)
    return res
      .status(500)
      .json({ status: "fail", message: "Transaction bulunamadı." });
  if (
    transaction.pool.toString() !== user.pool?.toString() &&
    user.type !== "god"
  )
    return res.status(500).json({
      status: "fail",
      message: "Transaction'un pool'u ile kullanıcının pool'u uyuşmuyor.",
    });

  const deleted = await Transactions.findByIdAndDelete(_id);
  await PaparaTransactions.deleteMany({ transactionId: _id });

  res.send({
    status: "success",
    message: "İşlem başarılı",
    transaction: {
      _id,
    },
  });
};

// @ts-ignore
const getWithDrawInfo = async (req, res) => {
  const { _id } = req.body;
  // @ts-ignore
  const user = await checkLogin(req, res);

  // if (!user || !_id) {
  //   return res.status(500).send("fail");
  // }

  if (!user || !_id)
    return res.status(500).json({
      status: "fail",
      message: "User veya id bulunamadı.",
    });

  const getTransaction = await Transactions.findById(_id);

  if (getTransaction.userId === user._id) {
    // @ts-ignore
    // @ts-ignore
    const get5TransactionOfUser = await Transactions.find({ userId: user._id })
      .limit(5)
      .sort({ createdAt: -1 });

    res.send({ ...getTransaction });
  } else {
    return res.status(500).json({
      status: "fail",
      message:
        "Transaction'un kullanici id'si ile guncel kullanıcı'ın id'si uyuşmuyor.",
    });
  }
};

const editTransacion = async (req, res) => {
  const {
    _id,
    website,
    amount,
    transactionId,
    userIdInWebsite,
    nameSurname,
    bankAccountId,
    transactionTime,
  } = req.body;

  const user = await checkLogin(req);

  if (!user)
    return res
      .status(500)
      .json({ status: "fail", message: "Kullanıcı bulunamadı." });
  const transaction = await Transactions.findById(_id).lean();
  if (!transaction)
    return res
      .status(500)
      .json({ status: "fail", message: "Transaction bulunamadı." });
  if (
    transaction.pool.toString() !== user.pool?.toString() &&
    user.type !== "god"
  )
    return res.status(500).json({
      status: "fail",
      message: "Transaction'un pool'u ile kullanıcının pool'u uyuşmuyor.",
    });

  let updateObj = {
    ...transaction,
    _id,
    // website,
    amount,
    transactionId,
    // userIdInWebsite,
    nameSurname,
    // bankAccountId,
    // transactionTime,
    // updatedAt: moment(transaction.updatedAt).toISOString(),
    // createdAt: moment(transaction.createdAt).toISOString(),
  };

  // if (!transactionTime) delete updateObj.transactionTime;

  if (!transaction)
    return res.status(500).json({
      status: "fail",
      message: "Transaction bulunamadı.",
    });

  const updatedTransaction = await Transactions.findByIdAndUpdate(
    _id,
    updateObj,
    { new: true, overwrite: true }
  );
  // console.log("updateObj",updateObj)

  res.send({ status: "success", transaction: updatedTransaction });
};

const banIp = async (req, res) => {
  const { _id } = req.body;

  const user = await checkLogin(req);
  if (!user)
    return res
      .status(500)
      .json({ status: "fail", message: "Kullanıcı bulunamadı." });
  const transaction = await Transactions.findById(_id);
  if (!transaction)
    return res
      .status(500)
      .json({ status: "fail", message: "Transaction bulunamadı." });
  if (
    transaction.pool.toString() !== user.pool?.toString() &&
    user.type !== "god"
  )
    return res.status(500).json({
      status: "fail",
      message: "Transaction'un pool'u ile kullanıcının pool'u uyuşmuyor.",
    });

  // if (!findTransaction) return res.status(500).send("fail");
  if (!transaction)
    return res.status(500).json({
      status: "fail",
      message: "Transaction bulunumadı.",
    });

  // if (!findTransaction.ipaddress) return res.status(500).send("fail");
  if (!transaction.ipadress)
    return res.status(500).json({
      status: "fail",
      message: "Transaction'a ait ip adress bulunumadı.",
    });

  const isExist = await BannedIps.findOne({
    ipaddress: transaction.ipaddress,
  });

  if (!isExist) return res.send("ok");

  const newBan = new BannedIps({
    ipaddress: transaction.ipaddress,
  });

  await newBan.save();

  res.send("ok");
};

// @ts-ignore
const bannedList = async (req, res) => {
  const bannedList = await BannedIps.find();
  for await (const item of bannedList) {
    const ip = item.ipaddress;
    const findTransaction = await Transactions.find({ ipaddress: ip });
    item.transactions = findTransaction;
  }
  res.send(bannedList);
};

const removeBannedIp = async (req, res) => {
  const { _id } = req.body;

  const user = await checkLogin(req);
  if (!user)
    return res
      .status(500)
      .json({ status: "fail", message: "Kullanıcı bulunamadı." });
  await BannedIps.findByIdAndDelete(_id);

  res.send("ok");
};

const excelExport = async (req, res) => {
  // @ts-ignore
  const user = await checkLogin(req, res);
  const fileName2 = "data.xlsx"; // Dosya adı değişkeni

  // if (!user) return res.status(500).send("fail");
  if (!user)
    return res.status(500).json({
      status: "fail",
      message: "Kullanıcı bulunamadı.",
    });

  const filter = req.body?.filter || {};

  if (filter.website) {
    filter.website = { $regex: filter.website, $options: "i" };
  }

  const startDate = req?.body?.getAll
    ? new Date("2014-05-23")
    : req?.body?.startDate
    ? DateHandler(req.body.startDate, true)
    : DateHandler(moment().startOf("day").format("YYYY-MM-DD"), true);

  const endDate = req?.body?.endDate
    ? DateHandler(req?.body?.endDate)
    : DateHandler(moment().endOf("day").format("YYYY-MM-DD"));

  const allBankAccounts = await BankAccounts.find();

  // if (!user) {
  //   return res.status(500).send("fail");
  // }

  if (!user)
    return res.status(500).json({
      status: "fail",
      message: "Kullanıcı bulunamadı.",
    });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Transactions");

  worksheet.columns = [
    { header: "Durum", key: "status", width: 30 },
    { header: "İşlem Tipi", key: "type", width: 40 },
    { header: "Transaction Id", key: "transactionId", width: 30 },
    { header: "Miktar", key: "amount", width: 30 },
    { header: "İlk İşlem Zamanı", key: "createdAt", width: 30 },
    { header: "İşlenme Zamanı", key: "updatedAt", width: 30 },
    { header: "Adı Soyadı", key: "nameSurname", width: 30 },
    { header: "Banka Hesabı", key: "bankAccount", width: 30 },
    { header: "Website Kodu", key: "websiteS", width: 30 },
    { header: "Website", key: "website", width: 30 },
    { header: "Websitedeki User Id", key: "user_id", width: 30 },
    { header: "Transaction Time", key: "transactionTime", width: 30 },
    { header: "Ip Address", key: "ipaddress", width: 30 },
  ];

  const transactions = await Transactions.find({
    userId: user.parentAccount || user._id,
    ...(user.pool
      ? {
          pool: new mongoose.Types.ObjectId(user.pool),
        }
      : {}),
    updatedAt: {
      $gte: startDate,
      $lt: endDate,
    },
    ...filter,
    status: filter.status || { $ne: 0 },
  });

  for await (const item of transactions) {
    let bankAccount = "";
    if (item.bankAccountId) {
      const getBank = allBankAccounts.find((x) => x._id === item.bankAccountId);
      if (getBank) {
        bankAccount =
          getBank.nameSurname +
          " -  " +
          getBank.bankName +
          " -  " +
          getBank.accountNumber;
      }
    }

    const getWebsiteCodeS = await websiteCodeHandler(item.website);

    worksheet.addRow({
      status:
        item.status === 0
          ? "Beklemede"
          : item.status === 1
          ? "Onaylandı"
          : "Reddedildi",
      type: item.type === "deposit" ? "Yatırım" : "Çekim",
      transactionId: item.transactionId,
      amount: item.amount,
      createdAt: moment(item.createdAt).format("DD-MM-YYYY HH:mm:ss"),
      updatedAt: moment(item.updatedAt).format("DD-MM-YYYY HH:mm:ss"),
      nameSurname: item.nameSurname,
      bankAccount: bankAccount,
      websiteS: getWebsiteCodeS,
      website: item.website,
      user_id: item.user_id,
      transactionTime: item.transactionTime,
      ipaddress: item.ipaddress,
    });
  }

  worksheet.addRow({
    status: "",
    type: "",
  });

  worksheet.addRow({
    status: "Toplam Sayı",
    type: transactions.length + " Adet",
  });
  const totalAmountWithdraw = transactions
    .filter((e) => e.type === "withdraw")
    .reduce((acc, item) => acc + item.amount, 0);

  const totalAmountDeposit = transactions
    .filter((e) => e.type === "deposit")
    .reduce((acc, item) => acc + item.amount, 0);

  if (filter?.type === "deposit") {
    worksheet.addRow({
      status: "Toplam Yatırım",
      type: totalAmountDeposit + " TL",
    });
  } else if (filter?.type === "withdraw") {
    worksheet.addRow({
      status: "Toplam Çekim",
      type: totalAmountWithdraw + " TL",
    });
  } else {
    worksheet.addRow({
      status: "Toplam Yatırım",
      type: totalAmountDeposit + " TL",
    });

    worksheet.addRow({
      status: "Toplam Çekim",
      type: totalAmountWithdraw + " TL",
    });

    worksheet.addRow({
      status: "Fark",
      type: totalAmountDeposit - totalAmountWithdraw + " TL",
    });
  }

  const fileName = `transactions-${user._id}.xlsx`;

  await workbook.xlsx.writeFile(fileName);
  const buffer = await workbook.xlsx.writeBuffer();

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader("Content-Disposition", `attachment; filename="${fileName2}"`);
  return res.send(buffer);
};

const handleVerifyRejectListener = async (msg) => {
  logger.child(msg.body).info("İşlem Consume Ediliyor");
  const parameters = msg.body;

  const {
    _id,
    status,
    selectedBankAccount,
    rejectReason,
    validationCode,
    user,
    byBot = false,
  } = parameters;
  try {
    if (!_id) {
      logger.child({ _id }).error("İd parametresi Eksik");
      return false;
    }
    const getTransaction = await Transactions.findById(_id);
    if (!getTransaction) {
      logger
        .child({ transaction: getTransaction })
        .error("Transaction Bulunamadı");
      return false;
    }
    if (getTransaction.status !== 0) {
      logger
        .child({ status: getTransaction.status })
        .error("Transaction Status 0 Değil");
      return false;
    }
    let bankAccountId = getTransaction?.bankAccountId
      ? getTransaction?.bankAccountId
      : selectedBankAccount
      ? selectedBankAccount
      : null;

    // burası sonradan değişebilir eğer red olanı onaylamak için yada onay olanı redlemek için vs..
    if (user?.type === "website") {
      logger.child({ user }).error("User Tipi Website, İşlem devam edilmiyor");
      return false;
    }
    const userPool = user?.pool ? user?.pool?.toString() : null;
    if (
      getTransaction &&
      (getTransaction?.pool?.toString() === userPool ||
        user?.type === "god" ||
        user?.type === "super_admin" ||
        byBot == true)
    ) {
      await Transactions.findByIdAndUpdate(_id, {
        status: status,
        bankAccountId: bankAccountId,
        rejectReason: byBot ? "OTOMATIK BOT" : rejectReason,
        validationCode: validationCode,
        doneBy: byBot ? null : user._id?.toString(),
        $push: {
          history: {
            doneBy: byBot ? null : user._id?.toString(),
            createdAt: new Date(),
            status: status,
          },
        },
      });
      if (status === 1) {
        if (!bankAccountId) {
          logger.child({ bankAccountId }).error("Banka Hesabı Bulunamadı");
          return false;
        }

        await transactionControl({
          user: user,
          amount: getTransaction.amount,
          bankAccountId: bankAccountId,
          type: getTransaction.type,
          papara: getTransaction.papara,
        }).catch((e) => {
          logger
            .child({
              e: e,
              user: user,
              amount: getTransaction.amount,
              bankAccountId: bankAccountId,
              type: getTransaction.type,
              papara: getTransaction.papara,
            })
            .error("Transaction control error");
        });

        await Pool.findByIdAndUpdate(
          getTransaction.pool,
          getTransaction.type === "deposit"
            ? {
                $inc: {
                  currentDeposit: getTransaction.amount,
                  finalBalance: getTransaction.amount,
                },
                lastDepositDate: Date.now(),
              }
            : {
                $inc: {
                  currentWithdraw: getTransaction.amount,
                  finalBalance: -getTransaction.amount,
                },
                lastWithdrawDate: Date.now(),
              }
        );

        await PaparaTransactions.deleteMany({
          transactionId: getTransaction._id,
        });
      } else if (status === 2) {
        await PaparaTransactions.deleteMany({
          transactionId: getTransaction._id,
        });
      }

      if (getTransaction.entegration === ENTEGRATION_TYPES.SCASHMONEY) {
        await ScashmoneyController.sendCallBack({
          hash: getTransaction.hash,
          type: getTransaction?.type,
          user_id: getTransaction?.user_id,
          user_name_surname: getTransaction?.nameSurname,
          transaction_id: getTransaction?.transactionId,
          amount: getTransaction?.amount,
          url: getTransaction?.callback,
          status: status === 1 ? "success" : status === 0 ? "pending" : "fail",
          transactionUid: getTransaction?._id,
          message:
            status === 1
              ? "Approved by Transfer Team"
              : status === 0
              ? "Waiting"
              : "Rejected by Transfer Team",
        });
      } else {
        await sendCallBack({
          hash: getTransaction.hash,
          type: getTransaction?.type,
          user_id: getTransaction?.user_id,
          user_name_surname: getTransaction?.nameSurname,
          transaction_id: getTransaction?.transactionId,
          amount: getTransaction?.amount,
          url: getTransaction?.callback,
          status: status === 1 ? "success" : status === 0 ? "pending" : "fail",
          transactionUid: getTransaction?._id,
          message:
            status === 1
              ? "Approved by Transfer Team"
              : status === 0
              ? "Waiting"
              : "Rejected by Transfer Team",
        });
      }

      const populatedTransaction = await Transactions.findById(
        getTransaction._id
      ).lean();
      try {
        populatedTransaction.websiteCodeS = await websiteCodeHandler(
          getTransaction.webSite
        );
      } catch (e) {}
      await updateTransactionSocket(populatedTransaction);

      return true;
    } else {
      logger
        .child({
          userPool,
        })
        .error("Validasyon Hatası");
      return false;
    }
  } catch (errrr) {
    logger.error(errrr);
  }
};

// Listen Verify Reject Events

RabbitMqManager.createConsumer(
  {
    queue: "transactionVerifyReject",
    queueOptions: { durable: true },
    // handle 2 messages at a time
    qos: { prefetchCount: 1 },
    // Optionally ensure an exchange exists
    exchanges: [{ exchange: "transaction", type: "topic" }],
    // With a "topic" exchange, messages matching this pattern are routed to the queue
    queueBindings: [{ exchange: "transaction", routingKey: "transactions.*" }],
  },
  handleVerifyRejectListener
);

module.exports = {
  makeWithdrawtRequest,
  makeDepositRequest,
  get,
  manuelDeposit,
  verifyRejectDeposit,
  remove,
  getOne,
  getTransactionSummary,
  transcationMovementInfo,
  editTransacion,
  islemListesi,
  banIp,
  bannedList,
  removeBannedIp,
  excelExport,
  initCronJob,
  recheckPaparaDeposit,
  forwardWithdraw,
  handleVerifyRejectTransaction,
};
