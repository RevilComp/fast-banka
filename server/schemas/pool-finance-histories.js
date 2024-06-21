const mongoose = require("mongoose");



const Schema = mongoose.Schema;
const poolFinanceHistory = new Schema(
  {
    pool: { type: Schema.Types.ObjectId, required: false, ref: "pool" },
    depositAmount: { type: Number, required: true, default: 0 },
    withdrawAmount: { type: Number, required: true, default: 0 },
    finalBalance: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

poolFinanceHistory.set("toJSON", { virtuals: true });

module.exports = mongoose.model("pool-finance-history", poolFinanceHistory);
