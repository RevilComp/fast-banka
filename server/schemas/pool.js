const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const poolSchema = new Schema(
  {
    title: { type: String, required: false, default: "İsimsiz Havuz" },
    currentDeposit: { type: Number, required: true, default: 0 },
    currentWithdraw: { type: Number, required: true, default: 0 },
    depositLimit: { type: Number, required: true },
    withdrawLimit: { type: Number, required: true },
    enabled: { type: Boolean, required: true, default: true },
    skipDate: { type: Date, required: true },
    lastDepositDate: { type: Date, required: true, default: Date.now() },
    lastWithdrawDate: { type: Date, required: true, default: Date.now() },
    targetWebsites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    finalBalance: { type: Number, required: true, default: 0 },
    commissionRate: { type: Number, required: true, default: 0 },
    bots: [
      {
        type: Schema.Types.ObjectId,
        ref: "bots",
        required: false,
        default: [],
      },
    ],
  },
  { timestamps: true }
);

poolSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("pool", poolSchema);
