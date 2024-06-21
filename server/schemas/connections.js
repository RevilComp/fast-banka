const mongoose = require("mongoose");



const Schema = mongoose.Schema;
const adminSchema = new Schema(
  {
    userId: { type: String, required: false }, // Id coming from the website
    user_id: { type: String, required: false },
    transactionId: { type: String, required: false }, // Id coming from the website
    website: { type: String, required: false, default: "SPT-200" },
    websiteId: { type: String, required: false, default: "SPT-200" },
    hash: { type: String, required: false, default: "none" },
    nameSurname: { type: String, required: false },
    amount: { type: Number, required: false },
    status: { type: Number, required: false, default: 0 }, // 0 awaiting,-  1 Verified  - 2 Diened
    deliveredTime: { type: Date, required: false, default: Date.now() },
    transactionTime: { type: Date, required: false, default: Date.now() },
    type: { type: String, required: false }, // "deposit", "withdraw"
    reason: { type: String, required: false, default: "" },
    callback: { type: String, required: false, default: "" },
  },
  { timestamps: true }
);

adminSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("connections", adminSchema);
