// models/Backup.js
import mongoose from "mongoose";

const BackupSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  username: String,
  email: String,
  deletedAt: { type: Date, default: Date.now },

  ipHistory: { type: [String], default: [] },
  loginHistory: { type: [Object], default: [] },
  deviceInfo: { type: [Object], default: [] },

  userData: {
    profile: Object, // User modelinin TAMAMINI burada tutuyor
    posts: Array,
    comments: Array,
  },
});

export default mongoose.model("Backup", BackupSchema);
