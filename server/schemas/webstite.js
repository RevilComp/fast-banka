const mongoose = require("mongoose");



const Schema = mongoose.Schema;
const adminSchema = new Schema(
  {
    website: { type: String, required: true, unique: true },
    index: { type: Number, required: true, unique: true, default: 1 },
  },
  { timestamps: true }
);

adminSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("website", adminSchema);
