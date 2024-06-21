const logger = require("pino")();
const mongoose = require("mongoose");
const { checkLogin, checkAdmin, checkPermission, findWebsite } = require("./general");
const BankAccounts = require("../schemas/bankaccounts");
const PaparaMail = require("../schemas/paparamail");
const { PERMISSIONS } = require("../consts/Permissions");
const { paparaLoginAccount } = require("../controllers/papara-bot");
const Users = require("../schemas/users");
const Pool = require("../schemas/pool");
const config = require("../config");

const filterHandler = (body) => {
  let filter = body ? { ...body } : {};
  delete filter.papara;
  delete filter.pool;
  if (filter.minimumDepositLimit) {
    filter.minimumDepositLimit = { $gte: filter.minimumDepositLimit };
  }

  if (filter.maximumDepositLimit) {
    filter.maximumDepositLimit = { $lte: filter.maximumDepositLimit };
  }

  if (filter.minimumWithdrawLimit) {
    filter.minimumWithdrawLimit = { $gte: filter.minimumWithdrawLimit };
  }

  if (filter.maximumWithdrawLimit) {
    filter.maximumWithdrawLimit = { $lte: filter.maximumWithdrawLimit };
  }
  delete filter.token;

  return filter;
};
const filtergetBankHandler = (body) => {
  let filter = body || {};
  if (filter.minimumDepositLimit) {
    filter.minimumDepositLimit = { $lte: filter.minimumDepositLimit };
  }

  if (filter.maximumDepositLimit) {
    filter.maximumDepositLimit = { $gte: filter.maximumDepositLimit };
  }

  if (filter.minimumWithdrawLimit) {
    filter.minimumWithdrawLimit = { $lte: filter.minimumWithdrawLimit };
  }

  if (filter.maximumWithdrawLimit) {
    filter.maximumWithdrawLimit = { $gte: filter.maximumWithdrawLimit };
  }
  delete filter.token;

  return filter;
};

const getByUser = async (req, res) => {
  const user = await checkLogin(req);

  if (!user)
    return res.status(500).json({
      status: "fail",
      message: "Yetkiniz yok.",
    });

  res.send(await BankAccounts.find({ pool: user?.pool }));
};

const get = async (req, res) => {
  // if (!await checkAdmin(req)) { return res.status(500).send("fail") }
  const filter = filterHandler(req.body);
  const user = await checkLogin(req);

  const bankAccounts = await BankAccounts.find({
    ...filter,
    pool: user?.pool,
    // ...(config.papara ? { bankName: "Papara" } : {}),
  })
    .populate("paparaMail")
    .lean();

  res.send(bankAccounts);
};

const getBankById = async (req, res) => {
  const _id = req.body._id;
  const bankAccount = await BankAccounts.findById(_id)
    .populate("paparaMail")
    .lean();

  if (_id) {
    res.send(bankAccount);
  } else
    res
      .status(500)
      .send({ status: "fail", message: "failed parameter _id not exist" });
};

const getBankAccountFilter = async (user, pool) => {
  let filter = {};
  switch (user.type) {
    case "god":
      if (pool) filter = { pool: new mongoose.Types.ObjectId(pool) };
      break;
    case "website":
      break;
    default:
      filter = { pool: user?.pool };
      break;
  }
  return filter;
};

const getAvaibleBankAccounts = async (req, res) => {
  if (!(await checkLogin(req)))
    return res.status(500).json({
      status: "fail",
      message: "Yetkiniz yok.",
    });

  const user = await checkLogin(req);

  if (user?.type === "website" || user?.type === "website_admin")
    return res.status(500).json({
      status: "fail",
      message: "Yetkiniz yok.",
    });

  const ownershipFilter = await getBankAccountFilter(user, req.body?.pool);

  let bankAccounts = [];
  const allBanks = req?.body?.allBanks;

  if (allBanks) {
    bankAccounts = await BankAccounts.find({
      ...ownershipFilter,
    });
  } else {
    const filter = filterHandler(req.body);
    bankAccounts = await BankAccounts.find({
      ...filter,
      active: true,
      ...ownershipFilter,
    })
      .populate("paparaMail")
      .lean();
  }

  res.send(bankAccounts);
};

const getSuspendedBankAccounts = async (req, res) => {
  if (!(await checkLogin(req))) {
    return res.status(500).send("fail");
  }
  const user = await checkLogin(req);
  if (user?.type === "website" || user?.type === "website_admin") {
    return res.status(500).send({
      status: "fail",
      message: "Yetkiniz Yok",
    });
  }
  const ownershipFilter = await getBankAccountFilter(user, req.body?.pool);
  let paparaFilter = {};
  if (config.papara) {
    paparaFilter.bankName = "Papara";
  }

  const filter = filterHandler(req.body);
  const bankAccounts = await BankAccounts.find({
    ...filter,
    pool: user?.pool,
    active: false,
    ...ownershipFilter,
    // ...(config.papara ? { bankName: "Papara" } : {}),
  })
    .populate("paparaMail")
    .lean();

  res.send(bankAccounts);
};

const getTransactionLimitExceedAccounts = async (req, res) => {
  if (!(await checkLogin(req))) {
    return res
      .status(500)
      .send({ status: "fail", message: "Lütfen giriş yapınız" });
  }
  const user = await checkLogin(req);
  if (user?.type === "website" || user?.type === "website_admin") {
    return res.status(500).send({
      status: "fail",
      message: "Yetkiniz Yok",
    });
  }
  const ownershipFilter = await getBankAccountFilter(user, req.body?.pool);
  const filter = filterHandler(req.body);
  let paparaFilter = {};
  if (config.papara) {
    paparaFilter.bankName = "Papara";
  }

  const bankAccounts = await BankAccounts.find({
    ...filter,
    pool: user?.pool,
    // ...(config.papara ? { bankName: "Papara" } : {}),
    $and: [{ ...ownershipFilter }],
    $or: [
      {
        $expr: {
          $gt: ["$depositNumber", "$accountDepositLimitTransactionNumber"],
        },
      },
      {
        $expr: {
          $gt: ["$withdrawNumber", "$accountWithdrawLimitTransactionNumber"],
        },
      },
    ],
  })
    .populate("paparaMail")
    .lean();

  res.send(bankAccounts);
};

const create = async (req, res) => {
  const {
    bankName,
    bankName2,
    nameSurname,
    accountNumber,
    branchCode,
    iban,
    investmentType,
    additionalDescription,
    description,
    accountDepositLimitTransactionNumber,
    accountWithdrawLimitTransactionNumber,
    description2,
    minimumDepositLimit,
    maximumDepositLimit,
    minimumWithdrawLimit,
    maximumWithdrawLimit,
    singularDepositForAccountPassive,
    institutional,
    paparaMail,
    paparaMailPassword,
    mailHost,
    pool: godAdminSelectedPool,
  } = req.body;
  if (
    !(await checkLogin(req)) ||
    !(await checkPermission(
      req,
      false,
      PERMISSIONS.BANK_ACCOUNT_MANAGEMENT.key
    ))
  ) {
    return res.status(500).send({ status: "fail", message: "Yetkiniz Yok" });
  }
  const user = await checkLogin(req);
  if (!user?.pool && user?.type !== "god")
    return res.status(500).send({ status: "fail", message: "Giriş yapınız" });

  if(config.papara && paparaMail){
    const isExist = await  PaparaMail.findOne({ email: paparaMail });
    if(isExist){
      return res.status(500).send({ status: "fail", message: "Bu mail zaten kayıtlı. Lütfen eskisini silin" });
    }
  }

  const pool =
    godAdminSelectedPool && user.type === "god"
      ? godAdminSelectedPool
      : user?.pool;
  const createAccount = new BankAccounts({
    userId: user?.pool ? user._id : user.parentAccount || user._id,
    bankName,
    bankName2,
    nameSurname,
    accountNumber,
    branchCode,
    iban,
    investmentType,
    additionalDescription,
    description,
    accountDepositLimitTransactionNumber:
      accountDepositLimitTransactionNumber || 999999999,
    accountWithdrawLimitTransactionNumber:
      accountWithdrawLimitTransactionNumber || 999999999,
    description2,
    minimumDepositLimit: minimumDepositLimit || 50,
    maximumDepositLimit: maximumDepositLimit || 999999999,
    minimumWithdrawLimit: minimumWithdrawLimit || 50,
    maximumWithdrawLimit: maximumWithdrawLimit || 999999999,
    singularDepositForAccountPassive:
      singularDepositForAccountPassive || 999999,
    institutional,
    parentAccount: user?.parentAccount || user._id,
    active: false,
    pool,
  });
  try {
    await createAccount.save();
    res.send({
      status: "success",
      message: "Hesap başarılı bir şekilde eklendi",
    });

    if (config.papara && bankName === "Papara" && paparaMail && paparaMailPassword && mailHost) {
      const newpaparaMail = new PaparaMail({
        email: paparaMail,
        password: paparaMailPassword,
        type: mailHost,
        connected: "awaiting",
        pool,
      });
      await newpaparaMail.save();

      await BankAccounts.findByIdAndUpdate(createAccount._id, {
        paparaMail: newpaparaMail._id,
      });
      const isPaparaLoggedIn = paparaLoginAccount({
        email: paparaMail,
        password: paparaMailPassword,
        type: mailHost,
      }).then(async (isLoggedIn) => {
          await PaparaMail.findByIdAndUpdate(newpaparaMail._id, {
            connected: isLoggedIn ? "connected" : "false"
          });
      })
      .catch(async (e)=>{
        await PaparaMail.findByIdAndUpdate(newpaparaMail._id, {
          connected: "false",
        });
      })
    }
  } catch (e) {
    logger.error(e);
    res.status(500).send({ status: "fail", message: e });
  }
};

const remove = async (req, res) => {
  const { _id } = req.body;
  const user = await checkLogin(req);

  const getBank = await BankAccounts.findById(_id);
  if (!getBank) {
    return res
      .status(500)
      .send({ status: "fail", message: "Banka Hesabı bulunamadı" });
  }
  if (
    !(
      user.type === "god" ||
      user?.type === "admin" ||
      user?.type === "super_admin"
    )
  ) {
    return res.status(500).send({ status: "fail", message: "Yetkiniz yok" });
  }

  if (user.type !== "god" && getBank.pool.toString() !== user.pool.toString()) {
    return res
      .status(500)
      .send({ status: "fail", message: "Bir hata ile karşılaşıldı" });
  }

  if (getBank?.paparaMail) {
    await PaparaMail.findByIdAndDelete(getBank?.paparaMail);
  }

  await BankAccounts.findByIdAndDelete(_id);
  res.send({ status: "success", message: "Banka hesabı başarıyla silindi" });
};

const suspendAndActiveAccount = async (req, res) => {
  const { _id } = req.body;
  const isAdmin = await checkPermission(
    req,
    false,
    PERMISSIONS.BANK_ACCOUNT_MANAGEMENT.key
  );
  const user = await checkLogin(req);
  const getBank = await BankAccounts.findById(_id);
  if (!getBank) {
    return res
      .status(500)
      .send({ status: "fail", message: "Banka hesabı bulunamadı" });
  }
  if (getBank.userId === user._id || isAdmin) {
    if (typeof req.body.active == "boolean") {
      await BankAccounts.findByIdAndUpdate(_id, { active: req.body.active });
      res.send({
        status: "success",
        message: "Banka hesabı başarıyla güncellendi",
      });
    } else {
      return res
        .status(500)
        .send({ status: "fail", message: "Bir hata ile karşılaşıldı" });
    }
  } else {
    return res
      .status(500)
      .send({ status: "fail", message: "Bir hata ile karşılaşıldı" });
  }
};

const update = async (req, res) => {
  const isAdmin = await checkPermission(
    req,
    false,
    PERMISSIONS.BANK_ACCOUNT_MANAGEMENT.key
  );
  const user = await checkLogin(req);
  const {
    _id,
    bankName,
    bankName2,
    nameSurname,
    accountNumber,
    branchCode,
    iban,
    investmentType,
    additionalDescription,
    description,
    accountDepositLimitTransactionNumber,
    accountWithdrawLimitTransactionNumber,
    description2,
    minimumDepositLimit,
    maximumDepositLimit,
    minimumWithdrawLimit,
    maximumWithdrawLimit,
    singularDepositForAccountPassive,
    institutional,
    balance,
    paparaMail,
    paparaMailPassword,
    mailHost,
  } = req.body;

  const getBank = await BankAccounts.findById(_id).populate("paparaMail");
  if (!getBank) {
    return res
      .status(500)
      .send({ status: "fail", message: "Banka hesabı bulunamadı" });
  }
  if (getBank.userId === user._id || isAdmin) {
    await BankAccounts.findByIdAndUpdate(_id, {
      bankName,
      bankName2,
      nameSurname,
      accountNumber,
      branchCode,
      iban,
      investmentType,
      additionalDescription,
      description,
      accountDepositLimitTransactionNumber:
        accountDepositLimitTransactionNumber || 999999999,
      accountWithdrawLimitTransactionNumber:
        accountWithdrawLimitTransactionNumber || 999999999,
      description2,
      minimumDepositLimit: minimumDepositLimit || 50,
      maximumDepositLimit: maximumDepositLimit || 999999999,
      minimumWithdrawLimit: minimumWithdrawLimit || 50,
      maximumWithdrawLimit: maximumWithdrawLimit || 999999999,
      singularDepositForAccountPassive:
        singularDepositForAccountPassive || 999999999,
      institutional,
      ...(balance ? { balance } : {}),
    });
    let mailHostString = mailHost || getBank.paparaMail.type
    if (paparaMail && paparaMailPassword) {
      if (getBank.paparaMail) {
        const isPaparaLoggedIn = await paparaLoginAccount({
          email: paparaMail,
          password: paparaMailPassword,
          type: mailHostString,
        });

        await PaparaMail.findOneAndUpdate(
          { email: getBank.paparaMail.email },
          {
            email: paparaMail,
            password: paparaMailPassword,
            type: mailHostString,
            connected: isPaparaLoggedIn ? "connected" : "false",
          }
        );
      }
    }
    res.send({ status: "success", message: "Banka hesabı güncellendi" });
  } else {
    return res
      .status(500)
      .send({ status: "fail", message: "Bir hata ile karşılaşıldı" });
  }
};

const mapBankAccountsForPool = async (filter, bankName, poolIds) => {
  const bankList = await BankAccounts.find({
    $or: [{ bankName }, { bankName: "7/24 Fast" }],
    active: true,
    pool: { $in: poolIds },
    ...filter,
  })
    .sort({ lastTransactionDate: 1 })
    .lean();
  const banksByPool = [];
  bankList.forEach((bankAccount) => {
    if (banksByPool[bankAccount?.pool]) {
      banksByPool[bankAccount?.pool].push(bankAccount);
    } else {
      banksByPool[bankAccount?.pool] = [bankAccount];
    }
  });
  return banksByPool;
};
const bankAccountHandler = async (
  userId,
  type,
  amount,
  bankName,
  filter,
  webSite
) => {
  const website = await findWebsite(webSite);
  const pools = await Pool.find({
    $expr: { $lt: ["$currentDeposit", "$depositLimit"] },
    targetWebsites: { $in: [website._id] },
    enabled: true,
  })
    .sort({
      lastDepositDate: 1,
    })
    .lean();
  const poolIds = pools.map((pool) => pool._id);
  const bankAccounts = await mapBankAccountsForPool(filter, bankName, poolIds);
  for (const pool of pools) {
    const currentPoolBankAccounts = bankAccounts[pool._id.toString()] || [];
    const excludedFastAccounts = currentPoolBankAccounts.filter(
      (e) => e.bankName !== "7/24 Fast"
    );
    const includedFastAccounts = currentPoolBankAccounts.filter(
      (e) => e.bankName === "7/24 Fast"
    );
    if (excludedFastAccounts.length)
      return excludedFastAccounts[
        Math.floor(Math.random() * excludedFastAccounts.length)
      ];
    if (includedFastAccounts.length)
      return includedFastAccounts[
        Math.floor(Math.random() * includedFastAccounts.length)
      ];
  }

  return false;
};

const getSkipNumber = (userId, bankName) => {
  let skipNumber = 0;
  // eslint-disable-next-line no-undef
  // @ts-ignore
  // eslint-disable-next-line no-undef
  if (transactionSkipList[userId]) {
    // eslint-disable-next-line no-undef
    // @ts-ignore
    // eslint-disable-next-line no-undef
    if (transactionSkipList[userId][bankName]) {
      // eslint-disable-next-line no-undef
      // @ts-ignore
      // eslint-disable-next-line no-undef
      skipNumber = transactionSkipList[userId][bankName];
    }
  }
  return skipNumber;
};

const getUsedAccounts = async (req, res) => {
  if (!(await checkLogin(req)))
    return res.status(500).json({
      status: "fail",
      message: "Yetkiniz yok.",
    });

  const user = await checkLogin(req);

  if (user?.type === "website" || user?.type === "website_admin")
    return res.status(500).json({
      status: "fail",
      message: "Yetkiniz yok.",
    });

  const ownershipFilter = await getBankAccountFilter(user, req.body?.pool);

  let bankAccounts = [];
  const allBanks = req?.body?.allBanks;

  if (allBanks) {
    bankAccounts = await BankAccounts.find({
      ...ownershipFilter,
      // ...(config.papara ? { papara: true } : { papara: { $ne: true } }),
    });
  } else {
    const filter = filterHandler(req.body);
    bankAccounts = await BankAccounts.find({
      ...filter,
      active: false,
      ...ownershipFilter,
      // ...(config.papara
      //   ? { bankName: "Papara" }
      //   : { bankName: { $ne: "Papara" } }),
    })
      .populate("paparaMail")
      .lean();
  }

  res.send(bankAccounts);
};

// get bank accounts from FE External Common YATIRIM SAYFASI
const getBankAccount = async (req, res, hide = false) => {
  const { bankName, amount, type = "deposit", userId, website } = req.body;
  
  if (!bankName || !amount || !type)
    return res
      .status(500)
      .send("please provide bankName, amount, type parameters");
  let filter = null;
  if (type === "deposit") {
    filter = filtergetBankHandler({
      minimumDepositLimit: Number(amount),
      maximumDepositLimit: Number(amount),
    });
  } else {
    filter = filtergetBankHandler({
      minimumWithdrawLimit: Number(amount),
      maximumWithdrawLimit: Number(amount),
    });
  }

  const response = await bankAccountHandler(
    userId,
    type,
    amount,
    bankName,
    filter,
    website
  );

  if (hide) {
    return res.send({
      getBank: !response
        ? null
        : {
            _id: response._id,
            bankName: response.bankName,
            nameSurname: response.nameSurname,
            iban: response.iban,
            accountNumber: response.accountNumber,
          },
    });
  }
  return res.send({ getBank: response || null });
};

const retryPaparaMail = async (req,res)=>{
  const { paparaMailId } = req.body;
  const user = await checkLogin(req);
  if (!user)
    return res.status(500).send({ status: "fail", message: "Giriş yapınız" });

  if (!paparaMailId)
    return res.status(500).send({ status: "fail", message: "Mail Id bulunamadı" });

  const bankAccount = await BankAccounts.findOne({ paparaMail: new mongoose.Types.ObjectId(paparaMailId) });

  if (!bankAccount)
    return res.status(500).send({ status: "fail", message: "Banka hesabı bulunamadı" });

  if(user.type !== "god" && user?.pool?.toString() !== bankAccount?.pool?.toString())
    return res.status(500).send({ status: "fail", message: "Yetkiniz yok" });

  const paparaMail = await PaparaMail.findById(paparaMailId);
  if(!paparaMail)
    return res.status(500).send({ status: "fail", message: "Mail bulunamadı" });

  const isPaparaLoggedIn = await paparaLoginAccount({
    email: paparaMail.email,
    password: paparaMail.password,
    type: paparaMail.type,
  });

    await PaparaMail.findByIdAndUpdate(paparaMailId, {
      connected: isPaparaLoggedIn ? "connected" : "false"
    });

  res.send({ status: "success", message: "Mail başarıyla güncellendi" });
}

module.exports = {
  getBankAccount,
  get,
  create,
  remove,
  update,
  getAvaibleBankAccounts,
  getTransactionLimitExceedAccounts,
  getSuspendedBankAccounts,
  getBankById,
  suspendAndActiveAccount,
  getByUser,
  filtergetBankHandler,
  getUsedAccounts,
  retryPaparaMail,
  bankAccountHandler
};
