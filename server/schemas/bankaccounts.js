const mongoose = require("mongoose");



const Schema = mongoose.Schema;
const adminSchema = new Schema(
  {
    userId: { type: String, required: true },
    bankName: { type: String, required: true },
    bankName2: { type: String, required: false, default: "" },
    nameSurname: { type: String, required: true },
    accountNumber: { type: String, required: false, default: "" },
    branchCode: { type: String, required: false, default: "" },
    iban: { type: String, required: false, default: "" },
    investmentType: { type: String, required: false, default: "" },
    additionalDescription: { type: String, required: false, default: "" },
    description: { type: String, required: false, default: "" },
    accountDepositLimitTransactionNumber: {
      type: Number,
      required: false,
      default: 0,
    }, // Yatırılabilir Adet
    accountWithdrawLimitTransactionNumber: {
      type: Number,
      required: false,
      default: 0,
    }, // Çekilebilir Adet
    description2: { type: String, required: false, default: 0 },
    minimumDepositLimit: { type: Number, required: false, default: 0 }, // Yatırım Alt limit
    maximumDepositLimit: { type: Number, required: false, default: 0 }, // Yatırım Üst limit
    minimumWithdrawLimit: { type: Number, required: false, default: 0 }, // Ödeme Alt Limit
    maximumWithdrawLimit: { type: Number, required: false, default: 0 }, // Ödeme Üst limit
    singularDepositForAccountPassive: {
      type: Number,
      required: false,
      default: 0,
    }, // Teki Yatırım Limiti
    institutional: { type: Boolean, required: false, default: false }, // Kurumsal mı
    active: { type: Boolean, required: true, default: true }, // Aktif Hesap mı
    lastTransactionDate: { type: Date, required: false, default: Date.now() }, // En son işlem tarihi
    depositNumber: { type: Number, required: false, default: 0 }, // Yatırım Adeti
    withdrawNumber: { type: Number, required: false, default: 0 }, // Ödenen Adeti
    balance: { type: Number, required: false, default: 0 }, // Bakiye
    withdrawAmount: { type: Number, required: false, default: 0 }, // Toplam Ödenen Miktar
    depositAmount: { type: Number, required: false, default: 0 }, // Toplam Yatırım Miktarı
    paparaMail: { type: Schema.Types.ObjectId, ref:'paparamail', required: false, }, // Papara Mail Hesabu
    parentAccount: { type: Schema.Types.ObjectId, required: false, ref: "bankaccounts" }, // Bağlı olduğu hesap
    pool: { type: Schema.Types.ObjectId, required: false, ref: "pool" }, // pool'a göre bankalar ayrışım yapacak
  },
  { timestamps: true }
);

// @ts-ignore
adminSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("bankaccounts", adminSchema);
