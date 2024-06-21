const mongoose = require("mongoose");
const config = require("../config.json");

const connectDB = async () => {
  await mongoose.connect(config.DBuri, {
    dbName: "adminPanel",
  });
  console.log("db connected..!");
};

module.exports = connectDB;
