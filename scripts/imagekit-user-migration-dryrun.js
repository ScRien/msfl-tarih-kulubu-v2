import mongoose from "mongoose";
import User from "../models/User.js";
import "dotenv/config";

const isCloudinary = (url) =>
  typeof url === "string" && url.includes("res.cloudinary.com");

const isDefault = (url) =>
  !url || url.startsWith("/img/");

(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    dbName: "tarihKulubu",
  });

  console.log("🔍 USER IMAGE MIGRATION DRY-RUN...\n");

  const users = await User.find();

  let avatarCount = 0;
  let coverCount = 0;

  for (const u of users) {
    const avatarUrl = u.avatar;
    const coverUrl = u.coverPhoto;

    let hit = false;

    if (isCloudinary(avatarUrl) && !isDefault(avatarUrl)) {
      avatarCount++;
      hit = true;
    }

    if (isCloudinary(coverUrl) && !isDefault(coverUrl)) {
      coverCount++;
      hit = true;
    }

    if (hit) {
      console.log(`👤 ${u.username}`);
    }
  }

  console.log("\n======== ÖZET ========");
  console.log("👥 Toplam kullanıcı:", users.length);
  console.log("🖼 Avatar taşınacak:", avatarCount);
  console.log("🖼 Kapak taşınacak :", coverCount);
  console.log("======================");

  process.exit();
})();
