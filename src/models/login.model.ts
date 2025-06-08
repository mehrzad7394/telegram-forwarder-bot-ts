const mongoose = require("mongoose");
const { Schema } = mongoose;

const loginSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Login", loginSchema);
