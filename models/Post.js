import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true },
});

const PostSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: { type: String },
  title: { type: String, required: true },
  content: { type: String, required: true },

  // Artık string değil — nesne tutuyoruz
  images: { type: [ImageSchema], default: [] },

  date: { type: Date, default: Date.now },
});

const Post = mongoose.model("Post", PostSchema);
export default Post;
