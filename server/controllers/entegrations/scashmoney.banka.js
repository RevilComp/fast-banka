const { bankAccounts } = require("../../../src/consts/banks.json");
const CommonController = require("./schashmoney.common");

const list = async (req, res) => {
  if(!CommonController.checkBearerToken(req)){
    return res.status(403).send({
      status: false,
      code: 400,
      message: "Invalid api key",
    });
  }
  
  return res.send(
    bankAccounts.map((bank, index) => {
      return {
        bank_id: index,
        bank_name: bank,
      };
    })
  );
};

const deposit = async (req, res) => {
  const { createTransaction, findedBankAccount, error } =
    await CommonController.deposit(req, res);

  if (error) {
    return;
  }

  if(!findedBankAccount){
    return; 
  }

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

module.exports = {
  list,
  deposit,
};
