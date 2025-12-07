/* ==========================================================
   IMAGEKIT UPLOAD CLIENT (GLOBAL)
   ✅ ES MODULE
========================================================== */

// Vercel Limit Hesabı:
// Vercel Max Body: 4.5 MB
// Base64 Overhead: ~1.33x
// Güvenli Dosya Limiti: 3 MB (3 * 1.33 = ~4 MB)
const MAX_SIZE_MB = 3;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

/* ===============================
   VALIDATION
================================ */
function validateImage(file) {
  if (!file) return { ok: false, message: "Dosya seçilmedi" };

  if (!file.type.startsWith("image/")) {
    return { ok: false, message: "Sadece görsel dosyalar yüklenebilir" };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return {
      ok: false,
      message: `Vercel sınırı nedeniyle görsel en fazla ${MAX_SIZE_MB}MB olabilir.`,
    };
  }

  return { ok: true };
}

/* ===============================
   BASE64 UPLOAD
================================ */
async function uploadBase64(file, folder) {
  const validation = validateImage(file);

  if (!validation.ok) {
    throw new Error(validation.message);
  }

  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        const res = await fetch("/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileBase64: reader.result,
            fileName: file.name,
            folder,
          }),
        });

        // Sunucu HTML veya düz yazı dönerse (örn: 413, 500, Hazırlanıyor)
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          // 413 Hatası genelde HTML döner, bunu yakalayalım
          if (res.status === 413) {
            throw new Error("Dosya boyutu çok büyük (Sağlayıcımız bu dosya boyutunu kabul etmiyor). Hata Kodu: 413");
          }
          const text = await res.text();
          throw new Error(text || "Sunucu hatası (Sunumcu geçerli veri döndürmüyor). Hata kodu: " + res.status);
        }

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Görsel yüklenemedi");
        }

        if (!data.url || !data.fileId) {
          throw new Error("Upload sonucu geçersiz");
        }

        resolve({ url: data.url, fileId: data.fileId });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("Dosya okunamadı"));
    reader.readAsDataURL(file);
  });
}

/* ==========================================================
   EXPORTS
========================================================== */
export async function uploadBlogImage(file) {
  return uploadBase64(file, "blogs");
}

export async function uploadProfileImage(file, type) {
  const folder = type === "avatar" ? "users/avatar" : "users/cover";
  return uploadBase64(file, folder);
}
