import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URL, {
  dbName: "tarihKulubu",
});

console.log("✅ DB bağlı. COVER FIX başlıyor...");

const users = await User.find();
console.log("Toplam user:", users.length);

let updated = 0;

for (const user of users) {
  let coverUrl = null;
  let coverFileId = "";

  // ✅ EN ÖNCE: coverPhoto varsa onu al (asıl gerçek veri)
  if (typeof user.coverPhoto === "string" && user.coverPhoto.startsWith("http")) {
    coverUrl = user.coverPhoto;
    coverFileId = user.coverPublicId || "";
  }

  // ✅ Eğer zaten düzgün coverImage varsa ve imagekit ise
  else if (
    user.coverImage?.url &&
    user.coverImage.url.startsWith("http")
  ) {
    coverUrl = user.coverImage.url;
    coverFileId = user.coverImage.fileId || "";
  }

  // ✅ HİÇBİRİ YOKSA default
  else {
    coverUrl = "/img/default-cover.jpg";
    coverFileId = "";
  }

  // ✅ TEK FORMAT
  user.coverImage = {
    url: coverUrl,
    fileId: coverFileId,
    provider: "imagekit",
  };

  // 🔥 ESKİLERİ SİL
  user.coverPhoto = undefined;
  user.coverPublicId = undefined;

  await user.save({ validateBeforeSave: false });
  updated++;
}

console.log(`✅ Cover migration tamamlandı. Güncellenen user: ${updated}`);
process.exit();
