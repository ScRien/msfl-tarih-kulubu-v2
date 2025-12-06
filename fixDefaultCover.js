import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js"; // gerekirse path'i düzelt

dotenv.config(); // ✅ BU SATIR EKSİKTİ

async function run() {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL .env içinde tanımlı değil");
    }

    await mongoose.connect(process.env.MONGO_URL, {
      dbName: "tarihKulubu",
    });

    const result = await User.updateMany(
      {
        $or: [
          { "coverImage.url": "" },
          { "coverImage.url": { $exists: false } },
          { coverImage: { $exists: false } }
        ],
      },
      {
        $set: {
          "coverImage.url": "/img/default-cover.png",
          "coverImage.provider": "local",
        },
      }
    );

    console.log("✅ Güncellenen kullanıcı sayısı:", result.modifiedCount);
  } catch (err) {
    console.error("❌ Hata:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
