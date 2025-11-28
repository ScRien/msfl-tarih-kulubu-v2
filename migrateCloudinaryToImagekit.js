import mongoose from "mongoose";
import Post from "./models/Post.js";
import imagekit from "./helpers/imagekit.js";
import "dotenv/config";

await mongoose.connect(process.env.MONGO_URL);

console.log("🚀 Migration başladı...");

const posts = await Post.find({
  images: { $elemMatch: { public_id: { $exists: true }, fileId: { $exists: false } } }
});

for (const post of posts) {
  let changed = false;

  for (const img of post.images) {
    if (!img.fileId && img.public_id && img.url) {
      try {
        const result = await imagekit.upload({
          file: img.url,
          fileName: img.public_id + ".jpg",
          folder: "/blogs-migrated"
        });

        img.fileId = result.fileId;
        img.url = result.url;

        changed = true;
        console.log("✅ Taşındı:", img.public_id);
      } catch (err) {
        console.error("❌ Hata:", img.public_id, err.message);
      }
    }
  }

  if (changed) await post.save();
}

console.log("🎉 Migration tamamlandı");
process.exit();
