// models/Comment.js
import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const Comment = mongoose.model("Comment", CommentSchema);
export default Comment;
