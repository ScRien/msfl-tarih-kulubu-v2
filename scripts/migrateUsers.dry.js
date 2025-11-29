import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URL, {
  dbName: "tarihKulubu",
});

console.log("🧪 DRY RUN BAŞLADI (DB DEĞİŞMEYECEK)");

const users = await User.find();
console.log("Toplam user:", users.length);

for (const user of users) {
  const report = {
    username: user.username,
    avatar_before: user.avatar,
    coverImage_before: user.coverImage,
    coverPhoto_exists: !!user.coverPhoto,
  };

  /* AVATAR */
  if (user.avatar?.provider === "local" && user.avatar.url.startsWith("http")) {
    report.avatar_fix = "provider local → imagekit";
  }

  /* COVER */
  if (user.coverPhoto) {
    report.cover_fix = "coverPhoto → coverImage";
  }

  if (
    user.coverImage?.url === "/img/default-cover.jpg" &&
    user.coverPublicId
  ) {
    report.cover_fix = "default → imagekit url gerekir";
  }

  console.log("────────────");
  console.log(report);
}

console.log("✅ DRY RUN TAMAMLANDI");
process.exit();
