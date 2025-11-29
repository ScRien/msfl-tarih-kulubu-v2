import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URL, {
  dbName: "tarihKulubu",
});

console.log("🚀 USER SCHEMA MIGRATION BAŞLADI");

const users = await User.find();
let updated = 0;

for (const user of users) {
  let changed = false;

  /* ================= AVATAR ================= */
  if (user.avatar) {
    const isHttp = typeof user.avatar.url === "string" &&
                   user.avatar.url.startsWith("http");

    const correctProvider = isHttp ? "imagekit" : "local";

    if (user.avatar.provider !== correctProvider) {
      user.avatar.provider = correctProvider;
      user.avatar.fileId =
        correctProvider === "imagekit"
          ? user.avatarPublicId || ""
          : "";
      changed = true;
    }
  } else {
    user.avatar = {
      url: "/img/default-avatar.png",
      fileId: "",
      provider: "local",
    };
    changed = true;
  }

  /* ================= COVER ================= */

  // eski coverPhoto varsa → coverImage’e taşı
  if (user.coverPhoto) {
    const isHttp = user.coverPhoto.startsWith("http");

    user.coverImage = {
      url: user.coverPhoto,
      fileId: isHttp ? user.coverPublicId || "" : "",
      provider: isHttp ? "imagekit" : "local",
    };

    user.coverPhoto = undefined;
    changed = true;
  }

  // coverImage varsa provider’ı düzelt
  if (user.coverImage) {
    const isHttp =
      typeof user.coverImage.url === "string" &&
      user.coverImage.url.startsWith("http");

    const correctProvider = isHttp ? "imagekit" : "local";

    if (user.coverImage.provider !== correctProvider) {
      user.coverImage.provider = correctProvider;
      user.coverImage.fileId =
        correctProvider === "imagekit"
          ? user.coverPublicId || ""
          : "";
      changed = true;
    }
  } else {
    user.coverImage = {
      url: "/img/default-cover.jpg",
      fileId: "",
      provider: "local",
    };
    changed = true;
  }

  if (changed) {
    await user.save({ validateBeforeSave: false });
    updated++;
    console.log(`✅ Güncellendi → ${user.username}`);
  }
}

console.log(`🎯 Migration tamamlandı. Güncellenen kullanıcı: ${updated}`);
process.exit();
