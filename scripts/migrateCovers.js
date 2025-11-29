import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URL, {
  dbName: "tarihKulubu",
});

console.log("🚀 COVER MIGRATION BAŞLADI");

const users = await User.find();
console.log("Toplam user:", users.length);

let updated = 0;

for (const user of users) {
  if (typeof user.coverPhoto === "string") {
    user.coverImage = {
      url: user.coverPhoto,
      fileId: user.coverPublicId || "",
      provider: "imagekit",
    };

    // eski çöpleri sil
    user.coverPhoto = undefined;
    user.coverPublicId = undefined;

    await user.save({ validateBeforeSave: false });
    updated++;

    console.log("✅ COVER FIX →", user.username);
  }
}

console.log("🎯 BİTTİ | Güncellenen:", updated);
process.exit();
