const CashDelivery = require("../schemas/cashdelivery");
const PoolHistory = require("../schemas/pool-finance-histories");
const Pool = require("../schemas/pool");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const moment = require("moment");
const ExcelJS = require("exceljs");
const { checkLogin, DateHandler, websiteCodeHandler } = require("./general");
const mongoose = require("mongoose");
const Users = require("../schemas/users");

exports.deleteCashDelivery = async (req, res, next) => {
  const { cashDeliveryId } = req.body;
  const user = await checkLogin(req);

  if (!user)
    res.status(500).json({
      status: "fail",
      message: "Lütfen giril yapınız.",
    });

  const isPermissionValid =
    user?.type === "super_admin" || user?.type === "god";

  if (!isPermissionValid)
    res.status(500).json({
      status: "fail",
      message: "İzin reddedildi.",
    });

  if (!cashDeliveryId)
    res.status(500).json({
      status: "fail",
      message: "Geçersiz ıd.",
    });

  const cashDelivery = await CashDelivery.findById(cashDeliveryId);

  if (!cashDelivery)
    res.status(500).json({
      status: "fail",
      message: "Kasa ve teslimat işlemi bulunamadı.",
    });

  await Pool.findByIdAndUpdate(cashDelivery?.pool, {
    $inc: {
      finalBalance: cashDelivery.cash,
    },
  });

  await CashDelivery.findByIdAndDelete(cashDeliveryId);

  // res.status(200).send({ message: "success" });
  res.status(200).json({
    status: "success",
    message: "İşlem başaralı bir şekilde silindi.",
  });
};

exports.createCashDelivery = async (req, res, next) => {
  // try {
  const user = await checkLogin(req);
  if (!user) {
    return res.status(500).send({
      status: "fail",
      message: "Kullanıcı bulunamadı",
    });
  }

  const isGod = user?.type === "god";
  const isPermissionValid =
    user?.type === "super_admin" || user?.type === "god";

  if (!isPermissionValid) {
    return res.status(500).send({
      status: "fail",
      message: "Yetkisiz işlem",
    });
  }

  const { withdrawalAmount, comissionAmount, cashDeliveryAddress } = req.body;
  const poolId = isGod && req.body?.pool ? req.body?.pool : user.pool;

  if (!poolId)
    return res.status(500).send({
      status: "fail",
      message: "pool parametresi eksik",
    });

  const pool = await Pool.findById(poolId);

  if (!pool)
    return res.status(500).send({
      status: "fail",
      message: "Pool bulunamadı",
    });

  const cash = pool?.finalBalance;

  // * Checking
  if (!Number(withdrawalAmount) || !Number(comissionAmount)) {
    return res.status(403).json({
      status: "fail",
      message: "Geçersiz veya boş değerler var.",
    });
  }

  if (Number(withdrawalAmount) > Number(cash))
    return res.status(403).json({
      status: "fail",
      message: "Çekim tutarı kasa tutarından büyük olamaz.",
    });

  if (Number(withdrawalAmount) + Number(comissionAmount) > cash)
    return res.status(403).json({
      status: "fail",
      message:
        "Çekim tutarı ve teslimat tutarının toplamı kasa tutarindan büyük olamaz.",
    });
    

  const decreaseAmount = Number(withdrawalAmount) + Number(comissionAmount);

  // * Create Cash Delivery Schema
  const cashDelivery = new CashDelivery({
    userId: user._id,
    withdrawalAmount,
    comissionAmount,
    cash: decreaseAmount,
    pool: poolId,
    cashDeliveryAddress,
  });

  await cashDelivery.save();

  await Pool.findByIdAndUpdate(poolId, {
    $inc: {
      finalBalance: -decreaseAmount,
    },
  });

  // * 201: Created
  res.status(201).json({
    status: "success",
    message: "Successful!",
    data: {
      cashDelivery,
    },
  });
  // } catch (err) {
  //   console.log("er", err)
  //   return res.status(500).json({
  //     error: true,
  //     message: "Teslimat başarısız oldu.",
  //     errorMessage: err,
  //   });
  // }
};

exports.getCashDelivery = async (req, res, next) => {
  try {
    const user = await checkLogin(req);
    if (!user) {
      return res.status(500).send("fail");
    }
    const isPermissionValid =
      user?.type === "super_admin" || user?.type === "god";

    if (!isPermissionValid) {
      return res.status(500).send("fail");
    }
    const isGod = user?.type === "god";
    const poolId = isGod && req.body?.pool ? req.body?.pool : user.pool;
    const cashDelivery = await CashDelivery.find({
      pool: new mongoose.Types.ObjectId(poolId),
      date: {
        $gte: moment(req.query.startDate).startOf("day"),
        $lte: moment(req.query.endDate).endOf("day"),
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        cashDelivery,
      },
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Teslimat getirilemedi.",
      errorMessage: err,
    });
  }
};

exports.downloadCashDelivery = async (req, res, next) => {
  try {
    const user = await checkLogin(req);
    if (!user) {
      return res.status(500).send("fail");
    }
    const startDate = moment(req.query?.startDate || new Date()).startOf("day");
    const endDate = moment(req.query?.endDate || new Date()).endOf("day");
    const isGod = user?.type === "god";
    const isSuperAdmin = user?.type === "super_admin";
    const isPermissionValid = isGod || isSuperAdmin;
    if (!isPermissionValid) return res.status(500).send("fail");
    const poolId = isGod && req.body?.pool ? req.body?.pool : user.pool;
    const cashDeliveries = await CashDelivery.find({
      pool: new mongoose.Types.ObjectId(poolId),
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    // * Create a new PDF document
    const pdfDoc = new PDFDocument();
    pdfDoc.pipe(fs.createWriteStream("cash_delivery.pdf"));

    // * Write the objects to the PDF Document that created
    cashDeliveries.forEach((cashDelivery) => {
      pdfDoc.text(JSON.stringify(cashDelivery));
      pdfDoc.moveDown();
    });

    // * Finished the writing
    pdfDoc.end();

    res.status(200).json({
      status: "success",
      message: "Cash delivery data exported to PDF.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: true,
      message: "Failed to export cash delivery data to PDF.",
    });
  }
};

exports.excelExport = async (req, res) => {
  // @ts-ignore

  const user = await checkLogin(req);
  const fileName2 = "data.xlsx"; // Dosya adı değişkeni

  if (!user) return res.status(500).send("fail");
  const isGod = user?.type === "god";
  const isSuperAdmin = user?.type === "super_admin";
  const isPermissionValid = isGod || isSuperAdmin;
  if (!isPermissionValid) return res.status(500).send("fail");

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Kasa Durumu");
  worksheet.columns = [
    { header: "ID", key: "id", width: 30 },
    { header: "AD", key: "name", width: 30 },
    { header: "SOYAD", key: "surname", width: 30 },
    { header: "KULLANICI ADI", key: "username", width: 30 },
    { header: "KULLANICI TIPI", key: "type", width: 30 },
    { header: "ÇEKİM", key: "withdraw", width: 30 },
    { header: "KOMİSYON", key: "comission", width: 30 },
    { header: "KASA", key: "balance", width: 30 },
    { header: "GÜNCEL KASA", key: "updateingBalance", width: 30 },
    { header: "İŞLEM ZAMANI", key: "date", width: 30 },
  ];

  const poolId = isGod && req.body?.pool ? req.body?.pool : user.pool;
  const cashDelivery = await CashDelivery.find({
    pool: new mongoose.Types.ObjectId(poolId),
    date: {
      $gte: moment(req.query.startDate).startOf("day"),
      $lte: moment(req.query.endDate).endOf("day"),
    },
  });

  const userData = await Users.findOne({ _id: user.parentAccount || user._id });

  for await (const item of cashDelivery) {
    worksheet.addRow({
      id: userData.userId,
      name: userData.firstName,
      surname: item.firstName,
      username: item.username,
      type: item.type,
      withdraw: item.withdrawalAmount,
      comission: item.comissionAmount,
      balance: item.cash,
      updateingBalance: item,
      date: item.date,
    });
  }

  const fileName = `cashDelivery-${user._id}.xlsx`;
  await workbook.xlsx.writeFile(fileName);
  //save to files
  const buffer = await workbook.xlsx.writeBuffer();

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader("Content-Disposition", `attachment; filename="${fileName2}"`);
  return res.send(buffer);
};
