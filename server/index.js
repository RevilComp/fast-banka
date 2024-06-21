require("newrelic");
const express = require("express");
const Port = 3001;
const connectDB = require("./consts/dbconnection");
const app = express();
const config = require("./config");
var jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
const server = require("http").Server(app);
const axios = require("axios");
app.use(cookieParser());
connectDB();
const RabbitMqManager = require("./listener/rabbit.manager");
RabbitMqManager.connect();
app.use(express.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
const path = require("path");
const { initCronJob } = require("./controllers/transactions");
const { schedulePoolTask } = require("./controllers/pool");
const entegrationGuard = require("./middlewares/entegration.guard");

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
// ---------------------------------------- //

app.use((req, res, next) => {
  req.body = { ...req.body, ...req.query };
  if (req.body.token) {
    req.cookies.token = req.body.token;
  }
  next();
});

// Express-Pino-Logger middleware ile logger'ı ayarlayın
const expressPino = require("express-pino-logger");
// @ts-ignore
const logger = require("pino")();
// app.use(expressPino({ logger }));

// // Middleware oluşturun ve her HTTP isteği için kullanın
// if(config.enableLogs){
app.use((req, res, next) => {

//   // HTTP metodu, isteğin path'i ve req.body'yi logla
  logger.child({body: req.body, middleware: true, logger:true}).info(
    `${req.method} isteği alındı - Path: ${req.path}`
  );
  next(); // Middleware'den çık
});
// }

global.SOCKET_STATE = null; // diğer dosyalardan socket'e ulaşmak için
global.connections = [];
global.transactionSkipList = {};

// put middleware every endpoint
app.use((req, res, next) => {
  req.body = handleFakeIdMap(req.body);
  next();
});

app.use(express.static("./"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/bankaccounts", require("./routes/bankaccounts"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/transaction", require("./routes/transactions"));
app.use("/api/entegration", require("./routes/entegration"));
app.use(
  "/api/transaction-encription",
  require("./routes/transaction-encription")
);
app.use("/api/players", require("./routes/players"));
app.use("/api/pool", require("./routes/pool"));
app.use("/api/cashdelivery", require("./routes/cash-delivery"));



// ENTEGRATIONS

app.use("/api/entegrations/scashmoney",
(req,res,next)=> entegrationGuard(req, res, next, config.entegrations.scashmoney.sCashMoneyEnabled),
require("./routes/entegrations/scashmoney"));

//  ---- CACHE WEBSITE USERS ---- //
const WebsiteUsers = require("./controllers/website.cache.class");
WebsiteUsers.refreshWebsiteUsers()
  .then((users) => {
    logger.info("Website Users initialized total users: " + users.length);
    if (users.length == 0) {
      logger.child({ users }).error("Website Users not found ");
    }
  })
  .catch((e) => {
    logger.error("Website Users Refresh Error", e);
  });
//  ---- CACHE WEBSITE USERS ---- //

// SOCKET EMBEDDING //

// SOCKET EMBEDDING //

const socketInit = require("./socket/index.js");
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/socket/html/index.html");
});
socketInit(server);

server.listen(Port, () => logger.info("Server started"));

const process = require("process");
const fs = require("fs");
const moment = require("moment");
const { handleFakeIdMap } = require("./controllers/general");
const handleErrorLogs = (err) => {
  console.log("Error");
  const errorUid =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  fs.appendFile(
    "logs/" + moment().format("DD-MM-YYYY"),
    `${moment().format(
      "DD/MM/YYYY HH:mm"
    )} - {${errorUid}} ${err?.toString()}\n`,
    (err) => {
      if (err) throw err;
    }
  );
  console.error("Error occoured at : " + errorUid);
  if (process.env.NODE_ENV === "dev") {
    console.log(err);
  }
};

process.on("uncaughtException", (err) => {
  // handleErrorLogs(err)
  logger.error(err);
});

process.on("unhandledRejection", (reason, p) => {
  // handleErrorLogs(reason)
  logger.error(reason, p);
});

if (config.papara) {
  initCronJob();
}

schedulePoolTask();