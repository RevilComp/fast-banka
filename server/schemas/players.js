const mongoose = require("mongoose");



const Schema = mongoose.Schema;
const playerSchema = new Schema(
  {
    nameSurname: { type: String, required: true },
    website: { type: String, required: true },
    user_id: { type: String, required: true },
    webSiteCode: { type: String, required: false },
  },
  { timestamps: true }
);

playerSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("players", playerSchema);
