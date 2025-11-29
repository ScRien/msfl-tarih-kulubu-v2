/* ==========================================================
   IMAGEKIT UPLOAD CLIENT (GLOBAL)
   ✅ ES MODULE
   ✅ Blog + Hesap uyumlu
========================================================== */

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

/* ===============================
   VALIDATION
================================ */
function validateImage(file) {
  if (!file) {
    throw new Error("Dosya yok");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Sadece görsel dosyalar yüklenebilir");
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`Maksimum dosya boyutu ${MAX_SIZE_MB}MB`);
  }
}

/* ===============================
   BASE64 UPLOAD
================================ */
async function uploadBase64(file, folder) {
  validateImage(file);

  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        const csrf =
          document.querySelector('input[name="_csrf"]')?.value || null;

        const res = await fetch("/upload", {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            ...(csrf && { "csrf-token": csrf }),
          },
          body: JSON.stringify({
            fileBase64: reader.result,
            fileName: file.name,
            folder,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Upload failed");
        }

        const data = await res.json();

        if (!data.url || !data.fileId) {
          throw new Error("Geçersiz upload cevabı");
        }

        resolve({
          url: data.url,
          fileId: data.fileId,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () =>
      reject(new Error("Dosya okunamadı"));

    reader.readAsDataURL(file);
  });
}

/* ==========================================================
   ✅ EXPORTS
========================================================== */

/* BLOG */
export async function uploadBlogImage(file) {
  return uploadBase64(file, "blogs");
}

/* PROFILE */
export async function uploadProfileImage(file, type) {
  const folder =
    type === "avatar"
      ? "users/avatar"
      : "users/cover";

  return uploadBase64(file, folder);
}
