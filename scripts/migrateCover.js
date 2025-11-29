import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URL, {
  dbName: "tarihKulubu",
});

console.log("🚀 COVER PHOTO → COVER IMAGE MIGRATION BAŞLADI");

const users = await User.find();

let updated = 0;

for (const user of users) {
  // ✅ coverPhoto VARSA ve STRING ise
  if (typeof user.coverPhoto === "string") {
    user.coverImage = {
      url: user.coverPhoto,
      fileId: user.coverPublicId || "",
      provider: "imagekit",
    };

    // ❌ eski alanları temizle
    user.coverPhoto = undefined;
    user.coverPublicId = undefined;

    await user.save({ validateBeforeSave: false });
    updated++;

    console.log("✅ GÜNCELLENDİ →", user.username);
  }
}

console.log("🎯 BİTTİ | Güncellenen kullanıcı:", updated);
process.exit();
