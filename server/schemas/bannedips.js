const mongoose = require("mongoose");



const Schema = mongoose.Schema;
const adminSchema = new Schema(
  {
    ipaddress: { type: String, required: true }, // Ip coming from the website
  },
  { timestamps: true }
);

adminSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("bannedips", adminSchema);
