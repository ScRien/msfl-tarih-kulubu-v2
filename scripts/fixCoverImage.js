import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

try {
  console.log("🔗 MongoDB'ye bağlanılıyor...");
  
  await mongoose.connect(process.env.MONGO_URL, {
    dbName: "tarihKulubu",
  });

  console.log("✅ Bağlantı başarılı!\n");

  const users = mongoose.connection.db.collection("users");

  console.log("🔧 COVER IMAGE FIX BAŞLADI\n");

  // ImageKit URL'si olan tüm user'ları bul
  const cursor = users.find({
    "coverImage.url": { $regex: "^https://ik\\.imagekit\\.io" }
  });

  let fixed = 0;
  let errors = 0;

  for await (const u of cursor) {
    try {
      const result = await users.updateOne(
        { _id: u._id },
        {
          $set: {
            "coverImage.provider": "imagekit",
            "coverImage.fileId": u.coverPublicId || "",
          },
          $unset: {
            coverPublicId: "",
          },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ DÜZELTİLDİ → ${u.username}`);
        fixed++;
      }
    } catch (err) {
      console.error(`❌ HATA → ${u.username}:`, err.message);
      errors++;
    }
  }

  console.log(`\n📊 SONUÇ:`);
  console.log(`   ✅ Düzeltilen: ${fixed}`);
  console.log(`   ❌ Hata: ${errors}`);
  console.log(`\n🎯 FIX TESLİM ALINDI!`);

  await mongoose.connection.close();
  process.exit(0);
} catch (error) {
  console.error("❌ KRITIK HATA:", error.message);
  process.exit(1);
}