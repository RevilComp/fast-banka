const {
  checkLogin,
  checkAdmin,
  checkPermission,
  getRemoteTokenUser,
  checkSuperAdmin,
  DateHandler,
  checkGodAdmin,
} = require("./general");
const bcrypt = require("bcryptjs");
const config = require("../config");
var jwt = require("jsonwebtoken");
const Users = require("../schemas/users");
const { PERMISSIONS } = require("../consts/Permissions");
const Pool = require("../schemas/pool");
const moment = require("moment");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const logger = require("pino")();
const WebsiteUserHandler = require("../controllers/website.cache.class");

const createJWT = (user) => {
  var JWT = jwt.sign(
    {
      _id: user._id,
      username: user.username,
      type: user.type,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    config.privateKey
  );
  return JWT;
};

const Transactions = require("../schemas/transactions");
const { getTransactionSummary } = require("./transactions");
const mongoose = require("mongoose");

const getUserBalance = async (req, res) => {
  if (!(await checkLogin(req))) {
    return res.status(500).send({ status: "fail", message: "Giriş yapınız" });
  }

  let user = await checkLogin(req);
  if (user.parentAccount) {
    user = await Users.findById(user.parentAccount);
  }
  try {
    if (!user) {
      return res
        .status(404)
        .send({ status: "fail", message: "Kullanıcı bulunamadı" });
    }
    return res.status(200).send({
      balance:
        config.papara
          ? user.balancePapara
          : user.balance || 0,
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const getSuperAdminMutabakat = async (req, res) => {
  if (!(await checkSuperAdmin(req))) {
    return res.status(500).send("fail");
  }
  const { startDate, endDate, selectedUser, websiteId } = req.body;
  let papara =
    config.papara ? true : false;
  let user =
    selectedUser === "all" ? "all" : await Users.findById(selectedUser);

  const mainUser = await checkLogin(req);

  const getTransactionSumDeposit = await getTransactionSummary(
    {
      body: {
        type: "deposit",
        startDate,
        endDate,
        papara,
        loggedUser: mainUser,
        status: 1,
        websiteId,
      },
      user,
    },
    false
  );
  const getTransactionSumDepositAll = await getTransactionSummary(
    {
      body: {
        type: "deposit",
        getAll: true,
        startDate,
        endDate,
        papara,
        loggedUser: mainUser,
        status: 1,
        websiteId,
      },
      user,
    },
    false
  );
  const getTransactionSumWithdraw = await getTransactionSummary(
    {
      body: {
        type: "withdraw",
        papara,
        startDate,
        endDate,
        loggedUser: mainUser,
        status: 1,
        websiteId,
      },
      user,
    },
    false
  );
  const getTransactionSumWithdrawAll = await getTransactionSummary(
    {
      body: {
        type: "withdraw",
        getAll: true,
        startDate,
        endDate,
        papara,
        loggedUser: mainUser,
        status: 1,
        websiteId,
      },
      user,
    },
    false
  );

  const findUsers = user === "all" ? await Users.find({}) : [user];
  const balance = findUsers.reduce((a, b) => a + (b.balance || 0), 0);
  const balancePapara = findUsers.reduce(
    (a, b) => a + (b?.balancePapara || 0),
    0
  );
  const commissionRate = user.commissionRate || 0;

  let transactionCountQueryObject = {
    // ...(papara ? { papara: true } : { papara: { $ne: true } }),
  };

  if (user !== "all") {
    if (user?.pool) {
      // @ts-ignore
      transactionCountQueryObject.pool = new mongoose.Types.ObjectId(user.pool);
    }
    // @ts-ignore
    else transactionCountQueryObject.userId = user._id?.toString();
  }
  const WithdrawAmount = await Transactions.find({
    type: "withdraw",
    status: 0,
    ...transactionCountQueryObject,
  });
  const DepositAmount = await Transactions.find({
    type: "deposit",
    status: 0,
    ...transactionCountQueryObject,
  });
  return res.send({
    getTransactionSumDeposit,
    getTransactionSumWithdraw,
    getTransactionSumDepositAll,
    getTransactionSumWithdrawAll,
    balance,
    balancePapara,
    commissionRate,
    waitingWithdraw: WithdrawAmount?.length,
    // WithdrawAmount.reduce((a, b) => a + (b.amount || 0), 0),
    waitingDeposit: DepositAmount?.length,
    // DepositAmount.reduce((a, b) => a + (b.amount || 0), 0),
  });
};

const getMutabakat = async (req, res) => {
  if (!(await checkLogin(req))) {
    return res.status(500).send({ status: "fail", message: "Giriş yapınız" });
  }
  const mainUser = await checkLogin(req);
  const { startDate, endDate, selectedUser, websiteId } = req.body;
  if (!selectedUser || selectedUser == "undefined")
    return res
      .status(500)
      .send({ status: "fail", message: "Kullanıcı seçiniz" });

  let user =
    selectedUser === "all" ? mainUser : await Users.findById(selectedUser);

  let papara =
    config.papara ? true : false;

  const poolId =
    mainUser.type === "god" && req.body.pool ? req.body.pool : mainUser?.pool;

  const getTransactionSumDeposit = await getTransactionSummary(
    {
      body: {
        type: "deposit",
        startDate,
        endDate,
        status: 1,
        papara,
        loggedUser: mainUser,
        pool: poolId,
        req: req,
        websiteId,
      },
      user,
    },
    false
  );
  const getTransactionSumDepositAll = false;

  const getTransactionSumWithdraw = await getTransactionSummary(
    {
      body: {
        type: "withdraw",
        status: 1,
        papara,
        startDate,
        endDate,
        loggedUser: mainUser,
        pool: poolId,
        req: req,
        websiteId,
      },
      user,
    },
    false
  );
  const getTransactionSumWithdrawAll = false;

  const waitingQuery = {
    status: 0,
    papara:
      config.papara
        ? true
        : { $ne: true },
  };

  const pool = await Pool.findById(poolId);
  const balance = pool?.finalBalance || 0;
  const balancePapara = pool?.balancePapara || 0;
  const commissionRate = pool?.commissionRate || 0;

  waitingQuery.pool = poolId;

  return res.send({
    status: "success",
    getTransactionSumDeposit,
    getTransactionSumWithdraw,
    getTransactionSumDepositAll,
    getTransactionSumWithdrawAll,
    balance,
    balancePapara,
    commissionRate,
    waitingWithdraw: await Transactions.countDocuments({
      type: "withdraw",
      ...waitingQuery,
    }),
    waitingDeposit: await Transactions.countDocuments({
      type: "deposit",
      ...waitingQuery,
    }),
  });
};

const getWebsiteMutabakat = async (req, res) => {
  if (!(await checkLogin(req))) {
    return res.status(500).send({ status: "fail", message: "Giriş yapınız" });
  }
  const { startDate, endDate } = req.body;
  if (!startDate || !endDate) {
    return res
      .status(500)
      .send({ status: "fail", message: "Tarih aralığı geçersiz" });
  }
  const user = await checkLogin(req);
  if (user.type != "website") {
    return res
      .status(500)
      .send({ status: "fail", message: "Website kontrol hesabı değil" });
  }
  let papara =
    config.papara ? true : false;
  const getTransactionSumDeposit = await getTransactionSummary(
    {
      body: {
        type: "deposit",
        startDate,
        endDate,
        papara,
        user,
        status: 1,
      },
      user,
    },
    false
  );
  // const getTransactionSumDepositAll = await getTransactionSummary(
  //   { body: { type: "deposit", getAll: true, papara }, user },
  //   false
  // );
  const getTransactionSumWithdraw = await getTransactionSummary(
    {
      body: {
        type: "withdraw",
        startDate,
        endDate,
        papara,
        user,
        status: 1,
      },
      user,
    },
    false
  );
  // const getTransactionSumWithdrawAll = await getTransactionSummary(
  //   { body: { type: "withdraw", getAll: true, papara }, user },
  //   false
  // );

  const balance = 0;
  const balancePapara = user?.balancePapara || 0;
  const commissionRate = user.commissionRate || 0;
  return res.send({
    status: "success",
    getTransactionSumDeposit,
    getTransactionSumWithdraw,
    // getTransactionSumDepositAll,
    // getTransactionSumWithdrawAll,
    balance,
    balancePapara,
    commissionRate,
    waitingWithdraw: await Transactions.countDocuments({
      type: "withdraw",
      status: 0,
      website: { $regex: user.targetWebsite },
    }),
    waitingDeposit: await Transactions.countDocuments({
      type: "deposit",
      status: 0,
      website: { $regex: user.targetWebsite },
    }),
  });
};

const getUsers = async (req, res) => {
  let getUser = null;
  const { remoteToken, pool } = req.body;
  if (remoteToken) {
    getUser = await getRemoteTokenUser(req.body?.remoteToken);
  } else {
    getUser = await checkLogin(req);
  }

  if (
    !(await checkGodAdmin(req)) &&
    !(await checkSuperAdmin(req)) &&
    !(await checkAdmin(req))
  ) {
    return res.status(500).send({ status: "fail", message: "Yetkiniz yok" });
  }
  const { filter = {} } = req.body;
  const isGodAdmin = await checkGodAdmin(req);
  const users = await Users.find({
    ...filter,
    $and: [{ type: { $ne: "website" } }, { type: { $ne: "website_admin" } }],

    ...(!isGodAdmin
      ? {
          pool: getUser?.pool,
        }
      : undefined),
    ...(isGodAdmin && pool ? { pool } : undefined),
  })
    .sort({ type: -1 })
    .sort({ createdAt: 1 })
    .populate("pool");
  return res.send(users);
};

const websiteUsers = async (req, res) => {
  const user = await checkLogin(req);
  if (!user)
    return res.status(500).send({ status: "fail", message: "Giriş yapınız" });

  if (user.type === "website") {
    return res.send([await Users.findById(user._id)]);
  }
  const users = await Users.find({
    type: "website",
  })
    .sort({ type: 1 })
    .sort({ createdAt: 1 });
  return res.send(users);
};

const connectRemote = async (req, res) => {
  const userId = req.body.userId;
  if (!userId)
    return res
      .status(500)
      .send({ status: "fail", message: "Kullanıcı bulunamadı" });
  if (!(await checkGodAdmin(req)) && !(await checkAdmin(req)))
    return res.status(500).send({ status: "fail", message: "Yetkiniz yok" });
  const user = await Users.findById(userId);
  const token = createJWT(user);
  res.send({ token: token, profile: user });
};

const getProfile = async (req, res) => {
  const user = await checkLogin(req);
  if (user) {
    delete user.hash;
    res.send({ profile: user });
  }

  return res
    .status(500)
    .send({ status: "fail", message: "Kullanıcı bulunamadı" });
};

const addUser = async (req, res) => {
  const user = await checkLogin(req);
  const isGodAdmin = user?.type === "god";
  const isSuperAdmin = user?.type === "super_admin";

  if (!isGodAdmin && !isSuperAdmin)
    return res.status(500).send({
      status: "fail",
      message: "Yetkiniz yok",
    });

  const {
    firstName,
    lastName,
    username,
    password,
    type,
    pool = null,
  } = req.body;

  if (!type)
    return res
      .status(500)
      .send({ status: "fail", message: "type is required" });

  const isExist = await Users.findOne({
    username,
  });

  if (isExist)
    return res.status(500).send({
      status: "fail",
      message: "Kullanıcı adı zaten var",
    });

  const hash = await bcrypt.hash(password, 12);

  const newUser = await new Users({
    parentAccount:
      user.type === "super_admin"
        ? "6675a5153858d3634cc262e9"
        : user.parentAccount || "6675a5153858d3634cc262e9",
    balance: 0,
    balancePapara: 0,
    website: "",
    targetWebsite: "",
    secret: null,
    hash,
    firstName: firstName,
    lastName: lastName,
    username: username,
    type,
    permissions: {
      BANK_ACCOUNT_MANAGEMENT:
        type === "admin" || type === "super_admin" || type === "god",
      BANK_ACCOUNT_VIEW: true,
    },
    pool: !isGodAdmin ? user?.pool : pool || null,
  }).save();

  res.send({
    status: "success",
    message: "User added successfully!",
    data: { newUser },
  });
};

const deleteUser = async (req, res) => {
  const user = await checkLogin(req);
  const isAdmin = user?.type === "super_admin" || user?.type === "god";
  if (!isAdmin)
    return res.status(500).send({ status: "fail", message: "Yetkiniz yok" });

  const { _id } = req.body;
  if(_id === "6675a5153858d3634cc262e9") return res.status(500).send({ status: "fail", message: "Bu kullanıcı silinemez" });
  const findUser = await Users.findById(_id);
  if(user.type != "god" && findUser.pool.toString() !== user.pool.toString()) return res.status(500).send({ status: "fail", message: "Yetkiniz yok" });
  await Users.findByIdAndDelete(_id);
  res.send({ message: "Kullanıcı başarıyla silindi", status: "success" });
};

const updateAdmin = async (req, res) => {
  const user = await checkLogin(req);
  if (user.type === "super_admin" || user.type === "god") {
    const { commissionRate, _id } = req.body;
    await Users.findByIdAndUpdate(_id, { commissionRate: commissionRate });
    res.send({ status: "success", message: "Kullanıcı başarıyla güncellendi" });
  } else
    return res.status(500).send({ status: "fail", message: "Yetkiniz yok" });
};

const setNotification = async (req, res) => {
  const user = await checkLogin(req);

  try {
    const notificationToken = JSON.parse(req.body.notificationToken);
    if (user) {
      const updated = await Users.findByIdAndUpdate(user._id, {
        notificationToken: notificationToken,
      });
    }

    res.send("ok");
  } catch (e) {
    return res.status(500).send("fail");
  }
};

const validatePermissionByPool = (requestedUser, user) => {
  if (requestedUser.type === "super_admin") return true;
  if (
    requestedUser.type === "admin" &&
    requestedUser?.pool?.toString() === user.pool?.toString()
  )
    return true;
  return false;
};

const set2fa = async (req, res) => {
  const requestedUser = await checkLogin(req);
  if (!requestedUser) return res.status(500).send("fail 1");
  const userId = req.body.userId;
  if (!userId) return res.status(500).send("fail 2");
  const user = await Users.findById(userId);
  const isGod = await checkGodAdmin(req);
  const isPermissonValidated =
    validatePermissionByPool(requestedUser, user) || isGod;
  if (!isPermissonValidated) return res.status(500).send("permission diened");

  const { base32, otpauth_url } = speakeasy.generateSecret({
    length: 20,
    name: user.username,
  });
  await Users.findByIdAndUpdate(userId, { secret: base32 });
  QRCode.toDataURL(otpauth_url, (err, data_url) => {
    if (err) {
      console.error("QR Kod Oluşturma Hatası:", err);
    } else {
      console.log(
        "QR Kod Oluşturuldu. Kullanıcının cihazına taraması için:",
        data_url
      );
      res.send({
        status: "success",
        base32,
        otpauth_url,
        data_url,
        username: user.username,
      });
    }
  });
};

const remove2fa = async (req, res) => {
  const requestedUser = await checkLogin(req);
  if (!requestedUser)
    return res
      .status(500)
      .send({ status: "fail", message: "Lütfen giriş yapınız" });
  const userId = req.body.userId;
  const user = await Users.findById(userId);

  const isPermissonValidated = validatePermissionByPool(requestedUser, user);
  if (!isPermissonValidated)
    return res.status(500).send({ status: "fail", message: "Yetki hatası" });

  await Users.findByIdAndUpdate(userId, { secret: null });
  res.send({
    status: "success",
    message: "İki aşamalı doğrulama faktörü pasif edildi",
  });
};

const listUsersByPool = async (req, res) => {
  const user = await checkLogin(req);
  if (!user) return res.status(500).send("fail");
  const users =
    user.type === "god"
      ? await Users.find({
          ...(req.body.pool ? { pool: req.body.pool } : {}),
          type: { $ne: "website" },
        })
      : await Users.find({ pool: user.pool, type: { $ne: "website" } });
  res.send(users);
};

const getUserTransactions = async (req, res) => {
  const user = await checkLogin(req);
  if (!user)
    return res.status(500).send({ status: "fail", message: "Giriş yapınız" });
  let { userId } = req.body;
  if (!req.body.startDate || !req.body.endDate)
    return res
      .status(500)
      .send({ status: "fail", message: "Tarih aralığı geçersiz" });
  const toUser = await Users.findById(userId);
  if (!toUser)
    return res.status(500).send({ status: "fail", message: "user not found" });
  const isPermissonValidated = validatePermissionByPool(user, toUser);
  if (!isPermissonValidated)
    return res.status(500).send({ status: "fail", message: "Yetki hatası" });
  const startDate = DateHandler(req.body.startDate, true);
  const endDate = DateHandler(req.body.endDate);
  const transactions = await Transactions.find({
    "history.doneBy": userId,
    updatedAt: {
      $gte: startDate,
      $lte: endDate,
    },
  });
  res.send(transactions);
};

const searchUsers = async (req, res) => {
  try {
    // const user = await checkLogin(req);

    // if (!user)
    //   return res.status(500).send({ status: "fail", message: "Giriş yapınız" });

    if (!req.params.username)
      return res
        .status(500)
        .send({ status: "fail", message: "Bir kullanıcı adı belirtin." });

    const { username } = req.params;

    const users = await Users.find({
      username: { $regex: username, $options: "i" },
    });

    res.status(200).json({
      status: "success",
      data: {
        users,
      },
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const changeWebsiteActive = async (req, res) => {
  const isGod = await checkGodAdmin(req);
  if (!isGod)
    return res.send({
      status: "fail",
      message: "Yetkiniz Yok",
    });

  const { websiteId, isWebsiteActive } = req.body;

  if (!(isWebsiteActive !== true || isWebsiteActive !== false)) {
    return res.send({
      status: "fail",
      message: "Yanlış parametre",
    });
  }

  const updatedWebsite = await Users.findByIdAndUpdate(
    websiteId,
    {
      isWebsiteActive,
    },
    { new: true }
  );

  await WebsiteUserHandler.refreshWebsiteUsers(); // cacheleri tekrar çek ki yenilensin

  return res.send({
    status: "success",
    message: "Başarılı bir şekilde değişti",
    data: updatedWebsite,
  });
};

const createWebsiteUser = async (req, res) => {
  const user = await checkGodAdmin(req);
  if (!user) {
    logger.child({ req }).error("Süperadmin Unauthorized");
    return res.status(401).json({ status: "fail", message: "Unauthorized" });
  }
  const { firstName, password, targetWebsite, username, shortName } = req.body;
  if (!firstName || !password || !targetWebsite || !username || !shortName) {
    return res.status(400).json({ status: "fail", message: "Boş alanlar var" });
  }
  // if user exists
  const isExist = await Users.findOne({
    $or: [{ username }, { targetWebsite }],
  });
  if (isExist) {
    return res.status(400).json({
      status: "fail",
      message: "User or target website already exists",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = new Users({
    firstName,
    lastName: "SITESI",
    username,
    hash: hashedPassword,
    type: "website",
    targetWebsite,
    commissionRate: 5,
    shortName,
  });
  await newUser.save();
  await WebsiteUserHandler.refreshWebsiteUsers();
  return res.send({
    status: "success",
    message: "Website başarıyla oluşturuldu",
  });
};

const deleteWebsiteUser = async (req, res) => {
  const user = await checkGodAdmin(req);
  if (!user) {
    logger.child({ req }).error("Süperadmin Unauthorized");
    return res.status(401).json({ status: "fail", message: "Unauthorized" });
  }
  const { websiteId } = req.body;
  if (!websiteId) {
    return res.status(400).json({ status: "fail", message: "Boş alanlar var" });
  }
  // if user exists
  const isExist = await Users.findById(websiteId);
  if (!isExist) {
    return res
      .status(400)
      .json({ status: "fail", message: "User website not exists" });
  }
  if (isExist.type !== "website") {
    return res
      .status(400)
      .json({ status: "fail", message: "User is not website" });
  }
  await Users.findByIdAndDelete(websiteId);
  await WebsiteUserHandler.refreshWebsiteUsers();
  return res.send({ status: "success", message: "Website başarıyla silindi" });
};

const editWebsiteUser = async (req, res) => {
  const user = await checkGodAdmin(req);
  if (!user) {
    logger.child({ req }).error("Süperadmin Unauthorized");
    return res.status(401).json({ status: "fail", message: "Unauthorized" });
  }
  const { websiteId, firstName, password, targetWebsite, username, shortName } =
    req.body;
  // if user exists
  const isExist = await Users.findById(websiteId);
  if (!isExist) {
    return res
      .status(400)
      .json({ status: "fail", message: "User website not exists" });
  }
  if (isExist.type !== "website") {
    return res
      .status(400)
      .json({ status: "fail", message: "User is not website" });
  }
  const hashedPassword = password ? await bcrypt.hash(password, 12) : null;
  await Users.findByIdAndUpdate(websiteId, {
    ...(firstName && { firstName }),
    ...(hashedPassword && { hash: hashedPassword }),
    ...(username && { username }),
    ...(targetWebsite && { targetWebsite }),
    ...(shortName && { shortName }),
  });
  await WebsiteUserHandler.refreshWebsiteUsers();
  return res.send({
    status: "success",
    message: "Website başarıyla güncellendi",
  });
};

module.exports = {
  getUsers,
  getProfile,
  addUser,
  deleteUser,
  connectRemote,
  updateAdmin,
  getUserBalance,
  getMutabakat,
  getSuperAdminMutabakat,
  getWebsiteMutabakat,
  setNotification,
  websiteUsers,
  set2fa,
  remove2fa,
  listUsersByPool,
  getUserTransactions,
  searchUsers,
  changeWebsiteActive,
  createWebsiteUser,
  deleteWebsiteUser,
  editWebsiteUser,
};
