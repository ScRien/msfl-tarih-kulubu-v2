import mongoose from "mongoose";

const SupportMessageSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true },
    topic: { type: String, default: "Diğer" },
    message: { type: String, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, default: "new" },
  },
  { timestamps: true }
);

export default mongoose.model("SupportMessage", SupportMessageSchema);
