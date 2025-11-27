// public/js/avatarCoverUpload.js
document.addEventListener("DOMContentLoaded", () => {

  const cloudName = "deuntxojs";
  const uploadPreset = "unsigned_upload";

  // Global overlay loader
  const loader = document.getElementById("mediaLoading");

  function showLoader() {
    if (loader) loader.style.display = "flex";
  }

  function hideLoader() {
    if (loader) loader.style.display = "none";
  }

  // ===============================
  // CLOUDINARY UPLOAD
  // ===============================
  async function uploadToCloudinary(file) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: fd }
      );
      return await res.json();
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      return null;
    }
  }

  function safeSetValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return;

    el.value = value;
    setTimeout(() => (el.value = value), 50);
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

      showLoader();

      const reader = new FileReader();
      reader.onload = ev => (avatarPreview.src = ev.target.result);
      reader.readAsDataURL(file);

      const result = await uploadToCloudinary(file);

      hideLoader();

      if (!result) {
        alert("⚠ Avatar yuklenemedi! (network)");
        return;
      }

      const finalUrl = result.secure_url || result.url;

      if (finalUrl && result.public_id) {
        safeSetValue("avatarValue", finalUrl);
        safeSetValue("avatarPid", result.public_id);
      } else {
        alert("⚠ Avatar yuklenemedi!");
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

      showLoader();

      const reader = new FileReader();
      reader.onload = ev => (coverPreview.src = ev.target.result);
      reader.readAsDataURL(file);

      const result = await uploadToCloudinary(file);

      hideLoader();

      if (!result) {
        alert("⚠ Kapak yuklenemedi! (network)");
        return;
      }

      const finalUrl = result.secure_url || result.url;

      if (finalUrl && result.public_id) {
        safeSetValue("coverValue", finalUrl);
        safeSetValue("coverPid", result.public_id);
      } else {
        alert("⚠ Kapak yuklenemedi!");
      }
    });
  }

});
