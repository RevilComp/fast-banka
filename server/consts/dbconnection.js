const logger = require("pino")();
const mongoose = require("mongoose");
const config = require("../config");

const connectDB = async () => {
  const dbConfig = {
    dbName:
      process.env.NODE_ENV === "production" ? "adminPanel" : "adminPanel-dev",
  };
  await mongoose.connect(config.DB_URL, dbConfig);
  logger.info("db connected..! db: " + dbConfig.dbName);
};

module.exports = connectDB;
