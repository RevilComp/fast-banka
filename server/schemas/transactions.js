const mongoose = require("mongoose");
const ENTEGRATION_TYPES = require("../consts/entegration-types");
const Schema = mongoose.Schema;
const adminSchema = new Schema(
  {
    specialId: { type: String, required: false, default: "" },
    userId: { type: String, required: true }, // Id coming from the website
    user_id: { type: String, required: false },
    transactionId: { type: String, required: false }, // Id coming from the website
    websiteCode: { type: String, required: false, default: "SPT-200" },
    website: { type: String, required: false, default: "SPT-200" },
    websiteId: { type: String, required: false, default: "SPT-200" },
    hash: { type: String, required: false, default: "none" },
    nameSurname: { type: String, required: true },
    amount: { type: Number, required: true },
    userIdInWebsite: { type: String, required: false },
    bankAccountId: { type: String, required: false },
    bankAccount: {
      type: Object,
      required: false,
      default: {
        bankName: "Banka",
        accountNumber: "12345",
        nameSurname: "",
        iban: "TR800",
      },
    },
    // {
    //     "bankName",
    //     "nameSurname",
    //     "iban",
    //     "accountNumber",
    //     "branchNumber",
    // }
    status: { type: Number, required: false, default: 0 }, // 0 awaiting,-  1 Verified  - 2 Diened
    deliveredTime: { type: Date, required: false, default: Date.now() },
    transactionTime: { type: Date, required: false, default: Date.now() },
    validationCode: { type: String, required: false },
    type: { type: String, required: true }, // "deposit", "withdraw"
    rejectReason: { type: String, required: false, default: "" },
    callback: { type: String, required: false, default: "" },
    doneBy: { type: String, required: false },
    ipaddress: { type: String, required: false, default: "" },
    papara: { type: Boolean, required: false, default: false },
    history: { type: Array, required: false, default: [] },
    uid: { type: String, required: false, default: "" },
    pool: { type: mongoose.Types.ObjectId, ref: "pool", required: false },
    description: { type: String, required: false },
    entegration: {
      type: String,
      enum: [ENTEGRATION_TYPES.DEFAULT, ENTEGRATION_TYPES.SCASHMONEY],
      required: false,
      default: "default",
    },
  },
  { timestamps: true }
);

// @ts-ignore
adminSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("transactions", adminSchema);
