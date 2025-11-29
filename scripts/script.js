// script.js
import mongoose from "mongoose";
import migrationScript from "./migration.js";
import "dotenv/config";

await mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "tarihKulubu",
    serverSelectionTimeoutMS: 8000,
  })
  .then(() => {
    migrationScript();
  });
