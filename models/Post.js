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
      url: String,
      fileId: String,
      provider: {
        type: String,
        enum: ["imagekit"],
        default: "imagekit",
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
