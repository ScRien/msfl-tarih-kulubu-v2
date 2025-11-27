import express from "express";
import authApi from "../middlewares/authApi.js";
import imagekit from "../helpers/imagekit.js";

const uploadRoutes = express.Router();

/* ============================================================
   IMAGE UPLOAD
============================================================ */
uploadRoutes.post("/", authApi, async (req, res) => {
  try {
    const { fileBase64, fileName, folder } = req.body;

    if (!fileBase64 || !fileName) {
      return res.status(400).json({ error: "Eksik veri" });
    }

    const result = await imagekit.upload({
      file: fileBase64,
      fileName,
      folder: folder || "/uploads",
    });

    return res.json({
      url: result.url,
      fileId: result.fileId,
    });
  } catch (err) {
    console.error("IMAGEKIT UPLOAD ERROR:", err);
    return res.status(500).json({ error: "Upload başarısız" });
  }
});

/* ============================================================
   ✅ IMAGE DELETE (fileId ile)
============================================================ */
uploadRoutes.post("/delete", authApi, async (req, res) => {
  try {
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: "fileId gerekli" });
    }

    await imagekit.deleteFile(fileId);

    return res.json({ success: true });
  } catch (err) {
    console.error("IMAGEKIT DELETE ERROR:", err);
    return res.status(500).json({ error: "Silme başarısız" });
  }
});

export default uploadRoutes;
