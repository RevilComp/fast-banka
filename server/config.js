const dotenv = require("dotenv");

if (process.env.NODE_ENV === "production") {
  console.log("Production");
  dotenv.config({ path: ".env.prod" });
} else {
  console.log("Development");
  dotenv.config({ path: ".env.dev" });
}

const config = {
  DB_URL: process.env.DB_URL || "",
  privateKey: process.env.privateKey || "",
  secretKey: process.env.secretKey || "",
  secretId: process.env.secretId || "",
  entegration: process.env.entegration || "",
  paparaBotConfigs: {
    paparaBotUrl: process.env.paparaBot || "",
    paparaBotAccessKey: process.env.PAPARA_BOT_ACCESS_KEY || "",
    paparaBotEnabled: true,
    cronjob: "*/2 * * * *",
    exceededMinute: 3,
  },
  rabbitUrl: process.env.RABBIT_URL || "",
  redisUrl: process.env.REDIS_URL || "",
  enableLogs: process.env.ENABLE_LOGS == "true" || "false",
  papara: process.env.PAPARA == "true" || false,
  // papara:false,
  // papara:true,
  entegrations: {
    scashmoney: {
      scashmoneySecretKey:
        process.env.ENTEGRATION_S_CASH_MONEY_SECRET_KEY || "",
      sCashMoneyEnabled:
        process.env.ENTEGRATION_S_CASH_MONEY == "true" || false,
      sCashMoneyBankApiKey:
        process.env.ENTEGRATION_S_CASH_MONEY_BANK_API_KEY || "",
      sCashMoneyPaparaApiKey:
        process.env.ENTEGRATION_S_CASH_MONEY_PAPARA_API_KEY || "",
    },
  },
};
// check config if any contains empty line also for nested objects
const checkConfig = (obj) => {
  for (const key in obj) {
    if (typeof obj[key] === "object") {
      checkConfig(obj[key]);
    } else {
      if ((obj[key] == undefined || obj[key] == "") && obj[key] != false) {
        console.log(
          "Config file is not configured properly",
          obj,
          "key",
          key,
          "valu",
          obj[key]
        );
        //throw new Error("Config file is not configured properly")
      }
    }
  }
};

checkConfig(config);

module.exports = {
  ...config,
};
//NRAK-G39LAIBTTSE29DNV6S369541IV8
