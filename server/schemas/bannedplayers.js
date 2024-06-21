const mongoose = require("mongoose");



const Schema = mongoose.Schema;
const playerSchema = new Schema(
  {
    playerId: { type: String, required: true },
    user_id: { type: String, required: false },
    nameSurname: { type: String, required: false },
    doneBy: { type: String, required: true },
  },
  { timestamps: true }
);

playerSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("bannedplayers", playerSchema);
