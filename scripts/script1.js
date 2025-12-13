import mongoose from "mongoose";

// MODELLER
import User from "../models/User.js";
import Post from "../models/Post.js";

// 🔧 AYARLA
const MONGO_URL =
  "mongodb+srv://sahfdn25_db_user:xvQQz8lsDrYcHD7I@database.redvc3o.mongodb.net/?appName=database";
const USER_ID = "69370081d92d3e802c2c8ee8";
const NEW_USERNAME = "Furkan Demir";

async function run() {
  try {
    await mongoose.connect(MONGO_URL, { dbName: "tarihKulubu" });
    console.log("✅ DB bağlı");

    // 1️⃣ USER GÜNCELLE
    const user = await User.findByIdAndUpdate(
      USER_ID,
      { $set: { username: NEW_USERNAME } },
      { new: true }
    );

    if (!user) {
      console.log("❌ User bulunamadı");
      process.exit(0);
    }

    console.log("👤 User güncellendi:", user.username);

    // 2️⃣ POSTLARI GÜNCELLE
    const result = await Post.updateMany(
      { user_id: user._id },
      { $set: { username: NEW_USERNAME } }
    );

    console.log(`📝 ${result.modifiedCount} post güncellendi`);

    console.log("🎉 İşlem tamam");
    process.exit(0);
  } catch (err) {
    console.error("❌ Hata:", err);
    process.exit(1);
  }
}

run();
