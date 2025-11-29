import mongoose from "mongoose";

const migrationScript = async () => {
  try {
    console.log("Migration başlatılıyor...");
    console.log("MongoDB bağlantı durumu:", mongoose.connection.readyState);
    console.log("Bağlı olduğu DB:", mongoose.connection.name);

    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error("Veritabanı bağlantısı başarısız!");
    }

    // Collection isimlerini kontrol et
    const collections = await db.listCollections().toArray();
    console.log("Mevcut collections:", collections.map(c => c.name));

    // Users collection bulunup bulunmadığını kontrol et
    const usersCollection = db.collection("users");
    const count = await usersCollection.countDocuments();
    console.log(`Collection'da ${count} dokuman bulundu.`);

    if (count === 0) {
      console.log("⚠️  Users collection boş!");
      process.exit(0);
    }

    const users = await usersCollection.find({}).toArray();
    console.log(`${users.length} kullanıcı bulundu.`);

    const bulkOps = [];

    users.forEach((user) => {
      const updateDoc = {
        $set: {
          username: user.username,
          email: user.email,
          password: user.password,
          name: user.name || "",
          surname: user.surname || "",
          role: user.role || "user",
          date: user.date || new Date(),
          bio: user.bio || "",
          analyticsCookies: user.analyticsCookies || false,
          personalizationCookies: user.personalizationCookies || false,
          serviceDataUsage: user.serviceDataUsage || false,
          personalizedContent: user.personalizedContent || false,
          resetCode: user.resetCode || null,
          resetCodeExpires: user.resetCodeExpires || null,

          "avatar.url": user.avatar?.url || "",
          "avatar.fileId": user.avatar?.fileId || "",
          "avatar.provider": user.avatar?.provider || "imagekit",

          "coverImage.url": user.coverPhoto || user.coverImage?.url || "",
          "coverImage.fileId": user.coverImage?.fileId || "",
          "coverImage.provider": user.coverImage?.provider || "imagekit",

          "social.instagram": user.social?.instagram || "",
          "social.x": user.social?.x || "",
          "social.github": user.social?.github || "",
          "social.youtube": user.social?.youtube || "",
          "social.website": user.social?.website || "",
        },

        $unset: {
          coverPhoto: "",
          avatarPublicId: "",
          coverPublicId: "",
        },
      };

      bulkOps.push({
        updateOne: {
          filter: { _id: user._id },
          update: updateDoc,
        },
      });
    });

    if (bulkOps.length > 0) {
      const result = await usersCollection.bulkWrite(bulkOps);
      console.log(`✓ ${result.modifiedCount} kullanıcı güncellendi.`);
      console.log(`✓ ${result.matchedCount} kullanıcı eşleştirildi.`);
    }

    console.log("✓ Migration başarıyla tamamlandı!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration hatası:", error.message);
    console.error(error);
    process.exit(1);
  }
};

export default migrationScript;