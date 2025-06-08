import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    telegramID: {
      type: Number,
      required: true,
      unique: true,
    },
    token: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
