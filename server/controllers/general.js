const logger = require("pino")();
var jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../schemas/users");
const axios = require("axios");
const Website = require("../schemas/webstite");
const Pool = require("../schemas/pool");
const webpush = require("web-push");
const moment = require("moment");
const mongoose = require("mongoose");
webpush.setVapidDetails(
  "mailto:test@gmail.com",
  "BP57YdwYeBDMvFrF9MjUKKasFZaoFSAo6iTKafNoUHxWO89bfWp3AMWAOivWe4UJGPCnEHIj7Q29kQcd9rCg-Tk",
  "S3-QjbEqfA-4Q8mrmZi6MIs5KI17it2UncOKIndmox0"
);
const callbackSchema = require("../schemas/callbacks");
const WebsiteUsers = require("./website.cache.class");

const DateHandler = (date, start = false) => {
  return start
    ? new Date(moment(date).startOf("day").toString())
    : new Date(moment(date).endOf("day").toString());
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
  try {
    const response = await axios.default.post(url, {
      type,
      user_id,
      user_name_surname,
      hash,
      transaction_id,
      amount,
      status,
      transactionUid,
      message,
      secretId: config.secretId,
      secretKey: config.secretKey,
    });
    console.log(
      "Gönderilen Callback",
      url,
      "transaction_id",
      transaction_id,
      "response",
      response.data
    );
    successStatus = true;
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
    });
    const savedData = await newData.save();
    return savedData;
  } catch (e) {
    logger.child({ error: e }).error("Callback gönderilemedi");
  }
};

const checkLogin = async (req) => {
  try {
    const token = req.cookies.token;

    if (token) {
      var result = jwt.verify(token, config.privateKey);
      // @ts-ignore
      const user = await User.findById(result._id);

      if (user) {
        return user;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};
const NotificationType = {
  deposit: {
    title: "Yeni para yatırma",
    body: "Yeni bir para yatırma talebi geldi",
  },
  withdraw: {
    title: "Yeni para çekme",
    body: "Yeni bir para çekme talebi geldi",
  },
};
const sendPushNotification = async (userId, type, pool) => {
  try {
    const users = await User.find({
      $or: [{ _id: userId }, { parentAccount: userId }, { pool }],
    });
    for await (const user of users) {
      if (user.notificationToken) {
        try {
          webpush
            .sendNotification(
              user.notificationToken,
              JSON.stringify({
                title: NotificationType[type].title,
                body: NotificationType[type].body,
                // icon: "i-loud.png",
                // image: "i-zap.png"
              })
            )
            .catch((err) => {
              console.log("Error occoured during push notification", err);
            });
        } catch (e) {
          console.log("Error occoured during push notification", e);
        }
      }
    }
  } catch (e) {
    console.log("Error occoured during push notification", e);
  }
};
const getRemoteTokenUser = async (remoteToken) => {
  try {
    const token = remoteToken;

    if (token) {
      var result = jwt.verify(token, config.privateKey);
      // @ts-ignore
      const user = await User.findById(result._id);

      if (user) {
        return user;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};

const checkAdmin = async (req) => {
  const user = await checkLogin(req);
  if (!user) return false;
  return user.type === "admin" || user.type === "super_admin";
};

const checkSuperAdmin = async (req) => {
  const user = await checkLogin(req);
  if (!user) return false;
  return user.type === "super_admin";
};

const checkGodAdmin = async (req) => {
  const user = await checkLogin(req);
  if (!user) return false;
  return user.type === "god";
};

const checkPermission = async (req, userPermissions, requiredPermissionKey) => {
  let user_permissions = userPermissions;
  if (req) {
    const user = await checkLogin(req);
    if (!user) return false;
    if (user.type === "super_admin") return true;
    if (user.type === "god") return true;

    user_permissions = user.permissions;
  }
  return Object(user_permissions).hasOwnProperty(requiredPermissionKey);
};
const getWebsiteById = async (website) => {
  const findWebsite = await Website.findOne({ website });
  if (!findWebsite) return -1;
  return findWebsite?.index;
};
const saveWebsite = async (website) => {
  const findWebsite = await Website.findOne({ website });
  if (!findWebsite) {
    const findLastWebsite = await Website.findOne({}).sort({ index: -1 });
    const newWebsite = new Website({
      website,
      index: findLastWebsite ? findLastWebsite?.index + 1 : 1,
    });
    await newWebsite.save();
  }
};

const sendTransactionSocket = async (transaction) => {
  if (global.SOCKET_STATE) {
    if (transaction.pool) {
      global.SOCKET_STATE.to(transaction.pool.toString()).emit(
        transaction?.type === "deposit"
          ? "transaction:deposit"
          : "transaction:withdraw",
        transaction
      );
      global.SOCKET_STATE.to("god").emit(
        transaction?.type === "deposit"
          ? "transaction:deposit"
          : "transaction:withdraw",
        transaction
      );
    }
  } else {
    console.log("Socket yok", transaction?.userId);
  }
};

const updateTransactionSocket = async (transaction) => {
  if (global.SOCKET_STATE) {
    if (transaction.pool) {
      global.SOCKET_STATE.to(transaction.pool.toString()).emit(
        transaction?.type === "deposit"
          ? "transaction:deposit:update"
          : "transaction:withdraw:update",
        transaction
      );
      global.SOCKET_STATE.to("god").emit(
        transaction?.type === "deposit"
          ? "transaction:deposit:update"
          : "transaction:withdraw:update",
        transaction
      );
    }
  } else {
    console.log("Socket yok", transaction?.userId);
  }
};

const sendTransactionSocketForwardWithdraw = async (transaction) => {
  if (transaction?.type !== "withdraw") return;
  if (global.SOCKET_STATE) {
    if (transaction.pool) {
      global.SOCKET_STATE.to(transaction.pool.toString()).emit(
        "transaction:withdraw:forward",
        transaction
      );
      global.SOCKET_STATE.to("god").emit(
        "transaction:withdraw:forward",
        transaction
      );
    }
  } else {
    console.log("Socket yok", transaction?.userId);
  }
};

const findTargetWebsite = async (url) => {
  const websiteUsers = WebsiteUsers.getUsers();
  const findWebsite = websiteUsers.find((ws) =>
    url?.includes(ws.targetWebsite)
  );
  if (findWebsite) return findWebsite.targetWebsite;
  return "";
};
const getWebisteByTargetWebsite = async (url) => {
  const websiteUsers = WebsiteUsers.getUsers();
  const findWebsite = websiteUsers.find((ws) =>
    url?.includes(ws.targetWebsite)
  );
  if (findWebsite) return findWebsite;
  return false;
};

const websiteCodeHandler = async (url) => {
  const websiteUsers = WebsiteUsers.getUsers();
  const findWebsite = websiteUsers.find((ws) =>
    url?.includes(ws.targetWebsite)
  );
  if (findWebsite) return findWebsite.shortName;
  return "-";
};

const findWebsite = async (url) => {
  const websiteUsers = WebsiteUsers.getUsers();
  const findWebsite = websiteUsers.find((ws) =>
    url?.includes(ws.targetWebsite)
  );

  if (findWebsite) return findWebsite;
  return false;
};

const isWebsiteActive = async (url) => {
  const websiteUsers = WebsiteUsers.getUsers();
  const findWebsite = websiteUsers.find((ws) =>
    url?.includes(ws.targetWebsite)
  );
  if (findWebsite) return findWebsite?.isWebsiteActive;
  return false;
};

const fakeIdMap = require("./fakeIdMap.json");
const handleFakeIdMap = (body) => {
  const oldUserId = body?.userId || body?.firm_key;
  if (oldUserId && fakeIdMap[oldUserId]) {
    if (body.userId) body.userId = fakeIdMap[oldUserId];
    if (body.firm_key) body.firm_key = fakeIdMap[oldUserId];
  }
  return body;
};

const selectUserForPool = async (users) => {
  if (users.length > 0) {
    return users[0]; // Örnek olarak ilk kullanıcıyı seçiyoruz.
  }
  return null; // Eğer seçilecek kullanıcı yoksa null dönebilirsiniz.
};

const getLastDate = (item, transactionType) => {
  if (item?.pool) {
    return transactionType === "deposit"
      ? item.pool?.lastDepositDate
      : item.pool.lastWithdrawDate;
  } else {
    return transactionType === "deposit"
      ? item?.lastDepositDate || Date.now()
      : item?.lastWithdrawDate || Date.now();
  }
};

module.exports = {
  findTargetWebsite,
  selectUserForPool,
  handleFakeIdMap,
  DateHandler,
  updateTransactionSocket,
  checkLogin,
  sendPushNotification,
  checkAdmin,
  checkSuperAdmin,
  checkPermission,
  getRemoteTokenUser,
  sendCallBack,
  saveWebsite,
  getWebsiteById,
  sendTransactionSocket,
  websiteCodeHandler,
  checkGodAdmin,
  sendTransactionSocketForwardWithdraw,
  isWebsiteActive,
  findWebsite,
  getWebisteByTargetWebsite,
};
