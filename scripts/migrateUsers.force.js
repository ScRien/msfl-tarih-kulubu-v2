import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URL, {
  dbName: "tarihKulubu",
});

console.log("🔥 FORCE COVER MIGRATION BAŞLADI");

/**
 * DİREKT FILTER:
 * coverPhoto alanı EXIST olan herkesi al
 */
const users = await User.find({
  coverPhoto: { $exists: true },
});

console.log("Bulunan user:", users.length);

let updated = 0;

for (const user of users) {
  // coverPhoto string mi?
  if (typeof user.coverPhoto !== "string") continue;

  const isHttp = user.coverPhoto.startsWith("http");

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        coverImage: {
          url: user.coverPhoto,
          fileId: user.coverPublicId || "",
          provider: isHttp ? "imagekit" : "local",
        },
      },
      $unset: {
        coverPhoto: "",
        coverPublicId: "",
      },
    }
  );

  updated++;
  console.log(`✅ FIXED → ${user.username}`);
}

console.log(`✅ BİTTİ. Güncellenen: ${updated}`);
process.exit();
