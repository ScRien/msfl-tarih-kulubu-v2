// models/Post.js
import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: { type: String },
  title: { type: String, required: true },
  content: { type: String, required: true },
  // Sadece string URL tutuyoruz
  images: [
    {
      url: String,
      provider: "cloudinary" | "imagekit",
      fileId: String // cloudinary: public_id, imagekit: fileId
    }
  ],
  date: { type: Date, default: Date.now },
});

const Post = mongoose.model("Post", PostSchema);
export default Post;
