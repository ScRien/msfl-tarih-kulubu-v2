import express from "express";
import ImageKit from "imagekit";
import auth from "../middlewares/auth.js";

const router = express.Router();

// ImageKit Yapılandırması
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

/* ============================================================
   GÖRSEL YÜKLEME (POST /upload)
============================================================ */
router.post("/", auth, async (req, res) => {
  try {
    const { fileBase64, fileName, folder } = req.body;

    // 1. Temel Veri Kontrolü
    if (!fileBase64 || !fileName) {
      return res.status(400).json({ error: "Eksik veri." });
    }

    if (!fileBase64.startsWith("data:image/")) {
      return res
        .status(400)
        .json({ error: "Sadece görsel dosyalar yüklenebilir." });
    }

    // 2. Boyut Kontrolü (Maks 6MB)
    // Base64 string uzunluğundan yaklaşık byte hesabı
    const sizeInBytes =
      (fileBase64.length * 3) / 4 - (fileBase64.endsWith("==") ? 2 : 1);
    const MAX_SIZE = 6 * 1024 * 1024;

    if (sizeInBytes > MAX_SIZE) {
      return res
        .status(400)
        .json({ error: "Görsel boyutu çok yüksek (Max 6MB)." });
    }

    // 3. Base64 Temizleme ("data:image/jpeg;base64," kısmını at)
    const cleanBase64 = fileBase64.split(";base64,").pop();

    // 4. ✅ DOSYA BÜTÜNLÜĞÜ VE İMZA KONTROLÜ (Magic Numbers)
    const buffer = Buffer.from(cleanBase64, "base64");

    // Dosya çok küçükse veya boşsa reddet
    if (buffer.length < 4) {
      return res.status(400).json({ error: "Dosya içeriği bozuk veya boş." });
    }

    // Dosyanın ilk 4-12 byte'ını oku (Hex formatında)
    const header = buffer.toString("hex", 0, 4);

    // İmzaları kontrol et
    const isJpeg = header.startsWith("ffd8ff"); // JPEG/JPG
    const isPng = header === "89504e47"; // PNG
    const isGif = header === "47494638"; // GIF

    // WebP kontrolü (RIFF ile başlar, 8. byte'ta WEBP yazar)
    let isWebP = false;
    if (header === "52494646") {
      // "RIFF"
      const type = buffer.toString("hex", 8, 12);
      if (type === "57454250") isWebP = true; // "WEBP"
    }

    // Eğer hiçbiri değilse reddet
    if (!isJpeg && !isPng && !isGif && !isWebP) {
      return res
        .status(400)
        .json({ error: "Geçersiz veya bozuk resim dosyası." });
    }

    // 5. ImageKit'e Yükle
    const result = await imagekit.upload({
      file: cleanBase64, // Saf base64 verisi
      fileName: fileName,
      folder: folder || "uploads",
      useUniqueFileName: true,
    });

    return res.json({
      success: true,
      url: result.url,
      fileId: result.fileId,
      thumbnailUrl: result.thumbnailUrl,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res
      .status(500)
      .json({ error: "Yükleme sırasında sunucu hatası oluştu." });
  }
});

/* ============================================================
   GÖRSEL SİLME (POST /upload/delete)
============================================================ */
router.post("/delete", auth, async (req, res) => {
  try {
    const { fileId } = req.body;
    if (!fileId) return res.status(400).json({ error: "fileId gerekli." });

    await imagekit.deleteFile(fileId);
    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return res.status(500).json({ error: "Silme işlemi başarısız." });
  }
});

export default router;
