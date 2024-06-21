const mongoose = require("mongoose");



const Schema = mongoose.Schema;
const adminSchema = new Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    paparaMail: { type: String, required: true },
    isLocked: { type: Boolean, required: false, default: false },
  },
  { timestamps: true }
);

adminSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("paparatransactions", adminSchema);
