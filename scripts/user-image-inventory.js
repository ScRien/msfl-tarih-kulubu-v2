import mongoose from "mongoose";
import User from "../models/User.js";
import "dotenv/config";

const detect = (url) => {
  if (!url) return "none";
  if (url.startsWith("/img/")) return "default";
  if (url.includes("res.cloudinary.com")) return "cloudinary";
  if (url.includes("ik.imagekit.io")) return "imagekit";
  return "other";
};

(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    dbName: "tarihKulubu",
  });

  console.log("🔎 USER IMAGE INVENTORY BAŞLADI...\n");

  const users = await User.find();

  const stats = {
    avatar: { cloudinary: 0, imagekit: 0, default: 0, other: 0, none: 0 },
    cover:  { cloudinary: 0, imagekit: 0, default: 0, other: 0, none: 0 },
  };

  for (const u of users) {
    const avatarType = detect(u.avatar);
    const coverType = detect(u.coverPhoto);

    stats.avatar[avatarType]++;
    stats.cover[coverType]++;

    console.log(`👤 ${u.username}`);
    console.log(`   Avatar → ${avatarType}`);
    console.log(`   Cover  → ${coverType}`);
  }

  console.log("\n======== ÖZET ========");
  console.log("👥 Toplam kullanıcı:", users.length);

  console.log("\nAVATAR:");
  console.table(stats.avatar);

  console.log("COVER:");
  console.table(stats.cover);

  console.log("======================");
  process.exit();
})();
