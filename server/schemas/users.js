const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const adminSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    hash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    // type: {
    //   type: String,
    //   enum: ["admin", "user", "super_admin", "website", "god"],
    //   default: "user",
    //   required: true,
    // }, // "admin","user","super_admin", "website", "god"
    type: {
      type: String,
      enum: {
        type: String,
        values: ["admin", "user", "super_admin", "website", "god"],
        message: "User type is not supported",
      },
      default: "user",
      required: [true, "User type is required."],
      trim: true,
    },
    parentAccount: { type: String, required: false, default: null },
    permissions: { type: Object, required: false, default: [] },
    commissionRate: { type: Number, required: false, default: 0 },
    balance: { type: Number, required: false, default: 0 },
    balancePapara: { type: Number, required: false, default: 0 },
    website: { type: String, required: false, default: "" },
    targetWebsite: { type: String, required: false, default: "" },
    notificationToken: { type: Object, required: false, default: null },
    pool: { type: Schema.Types.ObjectId, required: false, ref: "pool" },
    lastDepositDate: { type: Date, required: false },
    lastWithdrawDate: { type: Date, required: false },
    secret: { type: String, required: false, default: null },
    shortName: { type: String, required: false, default: null },
    isWebsiteActive: {type: Boolean, required: false, default: false },
    lastLoginDate: {type: Date, required: false, default: null },
  },
  { timestamps: true }
);

// @ts-ignore
adminSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("users", adminSchema);
