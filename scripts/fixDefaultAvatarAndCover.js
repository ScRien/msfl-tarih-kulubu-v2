import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js"; // Gerekirse path'i düzelt

dotenv.config();

async function run() {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL .env içinde tanımlı değil");
    }

    await mongoose.connect(process.env.MONGO_URL, {
      dbName: "tarihKulubu",
    });

    /* ==========================
       AVATAR FIX
    ========================== */
    const avatarResult = await User.updateMany(
      {
        $or: [
          { "avatar.url": "" },
          { "avatar.url": { $exists: false } },
          { avatar: { $exists: false } },
        ],
      },
      {
        $set: {
          "avatar.url": "/img/default-avatar.png",
          "avatar.provider": "local",
        },
      }
    );

    /* ==========================
       COVER FIX
    ========================== */
    const coverResult = await User.updateMany(
      {
        $or: [
          { "coverImage.url": "" },
          { "coverImage.url": { $exists: false } },
          { coverImage: { $exists: false } },
        ],
      },
      {
        $set: {
          "coverImage.url": "/img/default-cover.png",
          "coverImage.provider": "local",
        },
      }
    );

    console.log("✅ Avatar güncellenen:", avatarResult.modifiedCount);
    console.log("✅ Cover güncellenen:", coverResult.modifiedCount);
  } catch (err) {
    console.error("❌ Hata:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
