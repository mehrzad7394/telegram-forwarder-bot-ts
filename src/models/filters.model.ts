import mongoose from "mongoose";

const { Schema } = mongoose;

const filterSchema = new Schema(
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
export default mongoose.model("Filter", filterSchema);
