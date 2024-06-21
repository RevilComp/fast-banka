const mongoose = require("mongoose");



const Schema = mongoose.Schema;
const adminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    type: { type: String, required: true },
    pool: { type: Schema.Types.ObjectId, required: false, ref: "pool" },
    connected: { type: String, default: "false" },
  },
  { timestamps: true }
);

adminSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("paparamail", adminSchema);
