import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: "tarihKulubu",
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(process.env.MONGO_URL, opts)
      .then((mongoose) => {
        console.log("✅ DB Bağlantısı Başarılı");
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ DB Bağlantı Hatası:", e);
    throw e;
  }

  return cached.conn;
}
