import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URL, {
  dbName: "tarihKulubu",
});

console.log("✅ DB bağlı, TÜM COVER’LAR migrate ediliyor...");

const users = await User.find();
console.log("Toplam user:", users.length);

let updated = 0;

for (const user of users) {
  let finalCoverUrl = "";
  let finalFileId = "";

  // 1️⃣ coverPhoto varsa onu kullan
  if (typeof user.coverPhoto === "string" && user.coverPhoto.trim() !== "") {
    finalCoverUrl = user.coverPhoto;
    finalFileId = user.coverPublicId || "";
  }

  // 2️⃣ coverPhoto yoksa ama coverImage varsa
  else if (user.coverImage?.url) {
    finalCoverUrl = user.coverImage.url;
    finalFileId = user.coverImage.fileId || "";
  }

  // 3️⃣ HİÇBİRİ yoksa default
  else {
    finalCoverUrl = "/img/default-cover.jpg";
    finalFileId = "";
  }

  user.coverImage = {
    url: finalCoverUrl,
    fileId: finalFileId,
    provider: "imagekit",
  };

  // 🧹 ESKİLERİ SİL
  user.coverPhoto = undefined;
  user.coverPublicId = undefined;

  await user.save({ validateBeforeSave: false });
  updated++;
}

console.log(`✅ Migration finished. Güncellenen user: ${updated}`);
process.exit();
