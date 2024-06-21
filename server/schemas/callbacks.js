const mongoose = require("mongoose");



const Schema = mongoose.Schema;
const callbackSchema = new Schema(
  {
    url: { type: String, required: false },
    message: { type: String, required: false },
    type: { type: String, required: false },
    user_id: { type: String, required: false },
    user_name_surname: { type: String, required: false },
    hash: { type: String, required: false },
    transaction_id: { type: String, required: false },
    amount: { type: String, required: false },
    status: { type: String, required: false },
    success: { type: Boolean, required: false },
    transactionUid: { type: String, required: true, unique: false },
    entegration: { type: String, required: false },
    response: { type: String, required: false },
  },
  { timestamps: true }
);

// @ts-ignore
callbackSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("callbacks", callbackSchema);
