const mongoose = require("mongoose");



const Schema = mongoose.Schema;
const adminSchema = new Schema(
  {
    userId: { type: String, required: true },
    website: { type: String, required: true },
    user_name_surname: { type: String, required: true },
    user_id: { type: String, required: true },
    callback: { type: String, required: true },
    transaction_id: { type: String, required: true },
    hash: { type: String, required: true },
    papara: { type: Boolean, required: true },
  },
  {
    timestamps: true,
    expires: 1200, // 20 dk
  }
);

// @ts-ignore
adminSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("transaction-encription", adminSchema);
