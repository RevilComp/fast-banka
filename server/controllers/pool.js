const mongoose = require("mongoose");
const Pool = require("../schemas/pool");
const PoolFinanceHistory = require("../schemas/pool-finance-histories");
const Users = require("../schemas/users");
const { checkLogin, checkGodAdmin, checkAdmin } = require("./general");
const schedule = require("node-schedule");
const Transactions = require("../schemas/transactions");
const config = require("../config");

const getPoolByUser = async (req, res) => {
  const user = await checkLogin(req);
  // if (!user) {
  //   return res.status(500).send({
  //     status: "fail",
  //     message: "Hata meydana geldi",
  //   });
  // }

  if (!user)
    return res.status(500).json({
      status: "fail",
      message: "Hata meydana geldi",
    });

  if (user.type !== "god" && user.type !== "super_admin")
    return res.status(500).json({
      status: "fail",
      message: "Hata meydana geldi",
    });

  const poolId = user?.pool || req.query.poolId || req.body.pool;

  if (user.type === "god" && !poolId)
    return res.status(500).json({
      status: "fail",
      message: "pool parametresi eksik",
    });

  const pool = await Pool.findById(poolId);

  if (!pool)
    return res.status(500).json({
      status: "fail",
      message: "Hata meydana geldi",
    });

  res.send(pool);
};

const getPools = async (req, res) => {
  const user = await checkLogin(req);
  if (!user) {
    return res.status(500).json({
      status: "fail",
      message: "Bir hata meydana geldi",
    });
  }

  if (!(await checkGodAdmin(req)) && !(await checkAdmin(req))) {
    return res.status(500).json({
      status: "fail",
      message: "Hata meydana geldi",
    });
  }

  const users = await Users.find({});
  let pools = [];

  if (user.type === "god")
    pools = await Pool.find({}).sort({ createdAt: -1 }).lean();
  else pools = [await Pool.findById(user.pool).lean()];

  pools.forEach((pool) => {
    const user = users.filter(
      (user) => user.pool?.toString() === pool._id.toString()
    );

    pool.users = user;
  });

  res.send(pools);
};

const getMutabakatController = async (req, res) => {
  try {
    const { startDate, endDate, selectedUser } = req.params;
    const user = await Users.findOne({ username: selectedUser });

    if (!user)
      return res
        .status(500)
        .json({ status: "fail", message: "Kullanıcı bulunamadı" });

    const poolId = user.pool;

    if (!poolId)
      return res
        .status(500)
        .json({ status: "fail", message: "Kullanıcı için depo bulunamadı" });

    const transactionsDeposit = await Transactions.find({
      pool: poolId,
      type: "deposit",
      papara: config.papara,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    let getTransactionSumDeposit = 0;
    transactionsDeposit.forEach((transaction) => {
      getTransactionSumDeposit += transaction.amount;
    });

    const transactionsWithdraw = await Transactions.find({
      pool: poolId,
      type: "withdraw",
      papara: config.papara,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    let getTransactionSumWithdraw = 0;
    transactionsWithdraw.forEach((transaction) => {
      getTransactionSumWithdraw += transaction.amount;
    });

    const transactionsDepositWaiting = await Transactions.find({
      pool: poolId,
      type: "deposit",
      status: 0,
      papara: config.papara,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    let getTransactionSumDepositWaiting = 0;
    transactionsDepositWaiting.forEach((transaction) => {
      getTransactionSumDeposit += transaction.amount;
    });

    const transactionsWithdrawWaiting = await Transactions.find({
      pool: poolId,
      type: "withdraw",
      status: 0,
      papara: config.papara,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    let getTransactionSumWithdrawWaiting = 0;
    transactionsWithdrawWaiting.forEach((transaction) => {
      getTransactionSumWithdraw += transaction.amount;
    });

    const findUsers = user === "all" ? await Users.find({}) : [user];
    const balanceValue = await Users.findById(findUsers[0].parentAccount);
    const balance = config.papara
      ? balanceValue.balancePapara
      : balanceValue.balance;
    const commissionRate = balanceValue.commissionRate;

    const total = {
      getTransactionSumDeposit,
      getTransactionSumWithdraw,
      getTransactionSumDepositLength: transactionsDeposit.length,
      getTransactionSumWithdrawLength: transactionsWithdraw.length,
      getTransactionSumDepositWaiting,
      getTransactionSumWithdrawWaiting,
      balance,
      commissionRate,
    };

    return res.status(200).json({ total });
  } catch (error) {
    console.error("Error in getMutabakatController:", error);
    return res
      .status(500)
      .json({ status: "fail", message: "Bir hata ile karşılaşıldı" });
  }
};

const createPool = async (req, res) => {
  const user = await checkLogin(req);

  if (!user)
    return res
      .status(500)
      .json({ status: "fail", message: "Lütfen giriş yapınız" });

  if (!(await checkGodAdmin(req)))
    return res.status(500).json({ status: "fail", message: "Yetkiniz yok" });

  const {
    depositLimit,
    withdrawLimit,
    title = "",
    commissionRate,
    targetWebsites,
  } = req.body;

  if (!depositLimit || !withdrawLimit || isNaN(commissionRate))
    return res.status(500).json({ status: "fail", message: "Parametre eksik" });

  const newPool = await new Pool({
    title,
    currentDeposit: 0,
    currentWithdraw: 0,
    depositLimit,
    withdrawLimit,
    lastDepositDate: new Date(),
    lastWithdrawDate: new Date(),
    skipDate: new Date(),
    commissionRate,
    targetWebsites,
  }).save();

  res.send({
    newPool,
    status: "success",
    message: "Yeni havuz başarıyla oluşturuldu",
  });
};

const clonePool = async (req, res) => {
  const user = await checkLogin(req);
  if (!user) {
    return res
      .status(500)
      .json({ status: "fail", message: "Lütfen giriş yapınız" });
  }

  if (!(await checkGodAdmin(req)))
    return res.status(500).json({ status: "fail", message: "Yetkiniz yoktur" });

  const { userId, poolId } = req.body;

  const findSelectedUser = await Users.findById(userId);

  if (!findSelectedUser) {
    return res
      .status(500)
      .json({ status: "fail", message: "Kullanıcı bulunamadı" });
  }

  const newPool = await Users.findByIdAndUpdate(findSelectedUser._id, {
    pool: new mongoose.Types.ObjectId(poolId),
  });

  res.json(
    { status: "success", message: "Havuz başarıyla klonlandı" },
    newPool
  );
};

const updatePool = async (req, res) => {
  const user = await checkLogin(req);

  if (!user)
    return res.status(500).json({ status: "fail", message: "Giriş yapınız" });

  if (!(await checkGodAdmin(req)))
    return res.status(500).json({ status: "fail", message: "Yetkiniz yoktur" });

  const {
    poolId,
    withdrawLimit,
    depositLimit,
    enabled,
    title,
    commissionRate,
    targetWebsites,
  } = req.body;

  if (
    !depositLimit ||
    !withdrawLimit ||
    // enabled === undefined ||
    isNaN(commissionRate)
  )
    return res.status(500).json({ status: "fail", message: "Parametre eksik" });

  const pool = await Pool.findById(poolId);

  if (!pool)
    return res
      .status(500)
      .json({ status: "fail", message: "Havuz bulunamadı" });

  let editPool;
  if (enabled !== undefined)
    editPool = await Pool.findByIdAndUpdate(poolId, {
      enabled,
      withdrawLimit,
      depositLimit,
      title,
      commissionRate,
      targetWebsites,
    });

  res.status(200).json({
    status: "success",
    message: "İşlem başarıyla gerçekleştirildi.",
    data: editPool,
  });
};

const deletePool = async (req, res) => {
  const user = await checkLogin(req);

  if (!user) {
    return res.status(500).json({ status: "fail", message: "Giriş yapınız" });
  }

  if (!(await checkGodAdmin(req))) {
    return res.status(500).json({ status: "fail", message: "Yetkiniz yok" });
  }

  const { poolId } = req.body;

  const isUserExists = await Users.find({
    pool: new mongoose.Types.ObjectId(poolId),
  });

  if (isUserExists.length) {
    return res.status(500).send({
      status: "fail",
      message: "Bu havuzda kullanıcılar var. Önce kullanıcıları silin.",
      isUserExistInPool: true,
    });
  }

  await Pool.findByIdAndDelete(poolId);

  // res.send({ status: "success", message: "HAvuz başarıyla silindi" });
  res.status(200).json({
    status: "success",
    message: "Havuz başarıyla silindi",
  });
};

const schedulePoolTask = () => {
  schedule.scheduleJob("59 23 * * *", async () => {
    console.log("Resetting Daily Pool", new Date());

    const pool = await Pool.find({});

    for await (const item of pool) {
      const createHistory = new PoolFinanceHistory({
        pool: item._id,
        currentDeposit: item.currentDeposit,
        currentWithdraw: item.currentWithdraw,
      });
      await createHistory.save();
    }

    await Pool.updateMany(
      {},
      {
        currentDeposit: 0,
        currentWithdraw: 0,
      }
    );
  });
};

const transferPoolTransaction = async (req, res) => {
  const user = await checkLogin(req);

  // if (!user) {
  //   return res.status(500).json({ status: "fail", message: "Giriş yapınız" });
  // }

  if (!user)
    return res.status(500).json({
      status: "fail",
      message: "Giriş yapınız.",
    });

  // if (!(await checkGodAdmin(req))) {
  //   return res.status(500).json({ status: "fail", message: "Yetkiniz yok" });
  // }

  if (!(await checkGodAdmin(req)))
    return res.status(500).json({
      status: "fail",
      message: "Yetkiniz yok.",
    });

  const { poolId, transactionId } = req.body;

  const newPool = await Pool.findById(poolId);

  await Transactions.findByIdAndUpdate(transactionId, {
    pool: new mongoose.Types.ObjectId(newPool._id),
  });

  res.send({ status: "success", message: "Havuz başarıyla transfer edildi" });
};

const deleteUserPool = async (req, res) => {
  const user = await checkLogin(req);
  if (!user) {
    return res.status(500).json({ status: "fail", message: "Giriş yapınız" });
  }
  if (!(await checkGodAdmin(req))) {
    return res.status(500).json({ status: "fail", message: "Yetkiniz yok" });
  }

  const { userId } = req.body;

  const findSelectedUser = await Users.findById(userId);

  if (!findSelectedUser) {
    return res
      .status(500)
      .json({ status: "fail", message: "Kullanıcı bulunamadı" });
  }

  const newPool = await Users.findByIdAndUpdate(findSelectedUser._id, {
    pool: null,
  });

  res
    .status(500)
    .json({ status: "fail", message: "Havuzdan kullanıcı silindi" }, newPool);
};

module.exports = {
  getPools,
  createPool,
  deletePool,
  schedulePoolTask,
  clonePool,
  updatePool,
  transferPoolTransaction,
  deleteUserPool,
  getMutabakatController,
  getPoolByUser,
};
