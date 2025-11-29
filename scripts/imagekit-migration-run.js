import mongoose from "mongoose";
import Post from "../models/Post.js";
import imagekit from "../helpers/imagekit.js";
import "dotenv/config";

const CLOUDINARY_HOST = "res.cloudinary.com";

async function run() {
  console.log("🚀 ImageKit Migration BAŞLADI...\n");

  await mongoose.connect(process.env.MONGO_URL, {
    dbName: "tarihKulubu",
  });

  const posts = await Post.find({});
  let migratedCount = 0;

  for (const post of posts) {
    let changed = false;

    const newImages = [];

    for (const img of post.images || []) {
      // Zaten ImageKit ise dokunma
      if (img.provider === "imagekit") {
        newImages.push(img);
        continue;
      }

      // Cloudinary görseli mi?
      if (img.url?.includes(CLOUDINARY_HOST)) {
        try {
          console.log(`⬆️ Uploading: ${img.url}`);

          const upload = await imagekit.upload({
            file: img.url, // URL upload 💡
            fileName: img.public_id || `migrated-${Date.now()}`,
            folder: "blogs",
          });

          newImages.push({
            url: upload.url,
            fileId: upload.fileId,
            provider: "imagekit",
          });

          changed = true;
          migratedCount++;
        } catch (err) {
          console.error("❌ Upload error, eski görsel korunuyor:", err.message);
          newImages.push(img); // geri koy
        }
      } else {
        newImages.push(img);
      }
    }

    if (changed) {
      post.images = newImages;
      await post.save();
      console.log(`✅ Post güncellendi: ${post.title}\n`);
    }
  }

  console.log("🎉 MIGRATION TAMAMLANDI");
  console.log(`✅ Toplam taşınan görsel: ${migratedCount}`);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error("❌ MIGRATION ERROR:", err);
  process.exit(1);
});
