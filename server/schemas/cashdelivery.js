const mongoose = require("mongoose");





const Schema = mongoose.Schema;

const adminSchema = new Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: true,
  },

  withdrawalAmount: {
    type: Number,
  },

  comissionAmount: {
    type: Number,
  },

  cash: {
    type: Number,
  },

  date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  pool : {
    type: mongoose.Types.ObjectId,
    ref: "pool",
    required: true,
  },
  cashDeliveryAddress: {
    type: String,
  },
});

adminSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("cashdelivery", adminSchema);
