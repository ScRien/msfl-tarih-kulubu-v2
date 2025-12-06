import express from "express";
import imagekit from "../helpers/imagekit.js";
import csrf from "csurf";
const csrfProtection = csrf({ cookie: true });

const uploadRoutes = express.Router();

/* ============================================================
   IMAGE UPLOAD (BLOG / AVATAR / COVER)
============================================================ */
uploadRoutes.post("/", async (req, res) => {
  try {
    const { fileBase64, fileName, folder } = req.body;

    if (!fileBase64 || !fileName) {
      return res.status(400).json({ error: "Eksik veri" });
    }

    if (!fileBase64.startsWith("data:image/")) {
      return res.status(400).json({ error: "Sadece görsel dosyalar" });
    }

    /* ✅ BASE64 BOYUT HESABI */
    const sizeInBytes =
      (fileBase64.length * 3) / 4 -
      (fileBase64.endsWith("==") ? 2 : 1);

    const MAX_SIZE = 6 * 1024 * 1024; // ✅ 6 MB (ImageKit safe)

    if (sizeInBytes > MAX_SIZE) {
      return res.status(400).json({
        error: "Görsel boyutu 5MB sınırını aşıyor",
      });
    }

    const result = await imagekit.upload({
      file: fileBase64,
      fileName,
      folder: folder || "uploads",
      useUniqueFileName: true,
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
   IMAGE DELETE (fileId)
============================================================ */
uploadRoutes.post("/delete", async (req, res) => {
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
