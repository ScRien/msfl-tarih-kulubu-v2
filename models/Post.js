// models/Post.js
import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  username: { type: String },

  title: {
    type: String,
    required: true,
  },

  content: {
    type: String,
    required: true,
  },

  images: [
    {
      url: {
        type: String,
        required: true,
      },

      provider: {
        type: String,
        enum: ["cloudinary", "imagekit"], // ✅ DOĞRU YOL
        required: true,
      },

      fileId: {
        type: String, // cloudinary: public_id | imagekit: fileId
        required: true,
      },
    },
  ],

  date: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model("Post", PostSchema);
export default Post;
