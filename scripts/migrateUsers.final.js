import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URL, {
  dbName: "tarihKulubu",
});

console.log("🚨 FINAL COVER MIGRATION BAŞLADI");

const users = await User.find();
let updated = 0;

for (const user of users) {
  let set = {};
  let unset = {};
  let changed = false;

  /* ================= COVER PHOTO → COVER IMAGE ================= */

  if (user.coverPhoto) {
    const isHttp = user.coverPhoto.startsWith("http");

    set.coverImage = {
      url: user.coverPhoto,
      fileId: isHttp ? user.coverPublicId || "" : "",
      provider: isHttp ? "imagekit" : "local",
    };

    unset.coverPhoto = "";
    changed = true;
  }

  /* ================= COVER IMAGE PROVIDER FIX ================= */

  if (user.coverImage?.url) {
    const isHttp = user.coverImage.url.startsWith("http");
    const correctProvider = isHttp ? "imagekit" : "local";

    if (user.coverImage.provider !== correctProvider) {
      set.coverImage = {
        url: user.coverImage.url,
        fileId: isHttp ? user.coverPublicId || "" : "",
        provider: correctProvider,
      };
      changed = true;
    }
  }

  /* ================= FALLBACK ================= */

  if (!user.coverImage?.url) {
    set.coverImage = {
      url: "/img/default-cover.jpg",
      fileId: "",
      provider: "local",
    };
    changed = true;
  }

  if (changed) {
    await User.updateOne(
      { _id: user._id },
      {
        ...(Object.keys(set).length && { $set: set }),
        ...(Object.keys(unset).length && { $unset: unset }),
      }
    );

    updated++;
    console.log(`✅ Cover fix → ${user.username}`);
  }
}

console.log(`🏁 FINAL migration bitti. Güncellenen: ${updated}`);
process.exit();
