// public/js/avatarCoverUpload.js
document.addEventListener("DOMContentLoaded", () => {

  const cloudName = "deuntxojs";
  const uploadPreset = "unsigned_upload";

  // ===============================
  // GENEL CLOUDINARY UPLOAD FONKSİYONU
  // ===============================
  async function uploadToCloudinary(file) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      console.log("Cloudinary Response:", data);
      return data;

    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      return null;
    }
  }

  // ===============================
  // INPUT'A URL YAZMA — SAFARI FIX
  // ===============================
  function safeSetValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return;

    // Safari bazen ilk denemede yazmıyor
    el.value = value;
    setTimeout(() => {
      el.value = value;
    }, 50);
  }

  // ===============================
  // AVATAR UPLOAD
  // ===============================
  const avatarInput = document.getElementById("avatarUpload");
  const avatarPreview = document.getElementById("avatarPreview");

  if (avatarInput && avatarPreview) {
    avatarInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Önizleme
      const reader = new FileReader();
      reader.onload = (ev) => (avatarPreview.src = ev.target.result);
      reader.readAsDataURL(file);

      // Upload
      const result = await uploadToCloudinary(file);

      if (!result) {
        alert("⚠ Avatar yüklenemedi! (network)");
        return;
      }

      const finalUrl = result.secure_url || result.url;

      if (finalUrl && result.public_id) {
        safeSetValue("avatarValue", finalUrl);
        safeSetValue("avatarPid", result.public_id);

        console.log("✔ Avatar hazır →", finalUrl);
      } else {
        console.error("Cloudinary Hatalı Response:", result);
        alert("⚠ Avatar yüklenemedi! (API Response)");
      }
    });
  }

  // ===============================
  // COVER UPLOAD
  // ===============================
  const coverInput = document.getElementById("coverUpload");
  const coverPreview = document.getElementById("coverPreview");

  if (coverInput && coverPreview) {
    coverInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Önizleme
      const reader = new FileReader();
      reader.onload = (ev) => (coverPreview.src = ev.target.result);
      reader.readAsDataURL(file);

      // Upload
      const result = await uploadToCloudinary(file);

      if (!result) {
        alert("⚠ Kapak yüklenemedi! (network)");
        return;
      }

      const finalUrl = result.secure_url || result.url;

      if (finalUrl && result.public_id) {
        safeSetValue("coverValue", finalUrl);
        safeSetValue("coverPid", result.public_id);

        console.log("✔ Kapak hazır →", finalUrl);
      } else {
        console.error("Cloudinary Hatalı Response:", result);
        alert("⚠ Kapak yüklenemedi! (API Response)");
      }
    });
  }

});
