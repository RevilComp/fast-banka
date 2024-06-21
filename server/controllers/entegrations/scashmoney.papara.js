const CommonController = require("./schashmoney.common");
const Queue = require("bull");
const config = require("../../config");
const BotCheckQueue = new Queue("papara-scashmoney-bot-queue", config.redisUrl);
// @ts-ignore
const logger = require("pino")();
const { checkDepositControl } = require("../papara-bot");
const TransactionController = require("../transactions");

const list = async (req, res) => {

  if(!CommonController.checkBearerToken(req)){
    return res.status(403).send({
      status: false,
      code: 400,
      message: "Invalid api key",
    });
  }

  return res.send({
    bank_id: 0,
    bank_name: "Papara",
  });
};

const deposit = async (req, res) => {
  const { createTransaction, findedBankAccount, error } =
    await CommonController.deposit(req, res);

  if (error) {
    return;
  }

  await BotCheckQueue.add(
    {
      createTransaction,
    },
    {
      attempts: 1,
      removeOnComplete: true,
      removeOnFail: true,
      delay: 40000,
    }
  );

  return res.status(200).json({
    status: true,
    code: 200,
    account_name: findedBankAccount.nameSurname,
    account_iban:
      findedBankAccount.iban.length > 3
        ? findedBankAccount.iban
        : findedBankAccount.accountNumber,
    fast: findedBankAccount.bankName === "7/24 Fast" ? true : false,
    id: createTransaction._id,
    message: "istek başarılı",
  });
};

BotCheckQueue.process(async (job, done) => {
  try {
    const { createTransaction } = job.data;
    checkDepositControl(createTransaction).then(async (param) => {
      if (param === true) {
        // @ts-ignore
        await TransactionController.handleVerifyRejectTransaction({
          _id: createTransaction._id,
          status: 1,
          validationCode: "BOT",
          byBot: true,
        });
      }
    });
  } catch (err) {
    logger.error(err);
  }

  done();
});

module.exports = {
  list,
  deposit,
};
