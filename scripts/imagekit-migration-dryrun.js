import mongoose from "mongoose";
import Post from "../models/Post.js";
import "dotenv/config";

const CLOUDINARY_HOST = "res.cloudinary.com";

async function run() {
  console.log("🔍 Image Migration DRY-RUN başladı...\n");

  await mongoose.connect(process.env.MONGO_URL, {
    dbName: "tarihKulubu",
  });

  const posts = await Post.find({});
  let totalImages = 0;
  let cloudinaryImages = 0;
  let imagekitImages = 0;

  for (const post of posts) {
    if (!Array.isArray(post.images)) continue;

    const cld = post.images.filter(img =>
      typeof img.url === "string" && img.url.includes(CLOUDINARY_HOST)
    );

    const ik = post.images.filter(img =>
      img.provider === "imagekit"
    );

    totalImages += post.images.length;
    cloudinaryImages += cld.length;
    imagekitImages += ik.length;

    if (cld.length > 0) {
      console.log(`📌 Post: ${post.title}`);
      console.log(`   - Cloudinary: ${cld.length}`);
      console.log(`   - ImageKit: ${ik.length}\n`);
    }
  }

  console.log("======== ÖZET ========");
  console.log(`📝 Toplam Post: ${posts.length}`);
  console.log(`🖼️ Toplam Görsel: ${totalImages}`);
  console.log(`☁️ Cloudinary Görselleri: ${cloudinaryImages}`);
  console.log(`🟣 ImageKit Görselleri: ${imagekitImages}`);
  console.log("======================");

  await mongoose.disconnect();
}

run().catch(err => {
  console.error("❌ DRY-RUN ERROR:", err);
  process.exit(1);
});
