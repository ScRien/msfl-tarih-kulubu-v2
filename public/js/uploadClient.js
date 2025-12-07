/* ==========================================================
   IMAGEKIT UPLOAD CLIENT (GLOBAL)
   ✅ ES MODULE
========================================================== */

const MAX_SIZE_MB = 5; // Backend limitiyle uyumlu (6MB)
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

/* ===============================
   VALIDATION
================================ */
function validateImage(file) {
  if (!file) return { ok: false, message: "Dosya seçilmedi" };
  if (!file.type.startsWith("image/")) return { ok: false, message: "Sadece görsel dosyalar yüklenebilir" };
  if (file.size > MAX_SIZE_BYTES) return { ok: false, message: `Görsel boyutu en fazla ${MAX_SIZE_MB}MB olabilir` };
  return { ok: true };
}

/* ===============================
   BASE64 UPLOAD
================================ */
async function uploadBase64(file, folder) {
  const validation = validateImage(file);
  if (!validation.ok) throw new Error(validation.message);

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

        if (!res.ok) {
          let msg = "Görsel yüklenemedi";
          try {
            const data = await res.json();
            if (data?.error) msg = data.error;
          } catch {}
          throw new Error(msg);
        }

        const data = await res.json();
        if (!data.url || !data.fileId) throw new Error("Upload sonucu geçersiz");

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