import mongoose from "mongoose";
import User from "../models/User.js";
import imagekit from "../helpers/imagekit.js";
import fetch from "node-fetch";
import "dotenv/config";

const isCloudinary = (url) =>
  typeof url === "string" && url.includes("res.cloudinary.com");

const isDefault = (url) =>
  !url || url.startsWith("/img/");

async function uploadToImageKit({ url, username, type }) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();

  const upload = await imagekit.upload({
    file: Buffer.from(buffer),
    fileName: `${type}_${username}_${Date.now()}`,
    folder: `/users/${type}`,
  });

  return {
    url: upload.url,
    fileId: upload.fileId,
  };
}

(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    dbName: "tarihKulubu",
  });

  console.log("🚀 USER IMAGE MIGRATION BAŞLADI...\n");

  const users = await User.find();

  for (const user of users) {
    let changed = false;

    /* ========= AVATAR ========= */
    if (isCloudinary(user.avatar) && !isDefault(user.avatar)) {
      console.log(`⬆️ Avatar upload → ${user.username}`);

      const avatar = await uploadToImageKit({
        url: user.avatar,
        username: user.username,
        type: "avatar",
      });

      user.avatar = avatar.url;
      user.avatarPublicId = avatar.fileId;
      changed = true;
    }

    /* ========= COVER ========= */
    if (isCloudinary(user.coverPhoto) && !isDefault(user.coverPhoto)) {
      console.log(`⬆️ Kapak upload → ${user.username}`);

      const cover = await uploadToImageKit({
        url: user.coverPhoto,
        username: user.username,
        type: "cover",
      });

      user.coverPhoto = cover.url;
      user.coverPublicId = cover.fileId;
      changed = true;
    }

    if (changed) {
      await user.save();
    }
  }

  console.log("\n🎉 USER IMAGE MIGRATION TAMAMLANDI");
  process.exit();
})();
