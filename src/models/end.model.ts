import mongoose from "mongoose";
const { Schema } = mongoose;

const endSchema = new Schema(
  {
    value: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("End", endSchema);
