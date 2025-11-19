// public/js/avatarCoverUpload.js
document.addEventListener("DOMContentLoaded", () => {
  const cloudName = "deuntxojs";
  const uploadPreset = "unsigned_upload";

  async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    return await res.json();
  }

  /* ===========================
      AVATAR
  =========================== */
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

      // Cloudinary
      const result = await uploadToCloudinary(file);

      if (result.secure_url && result.public_id) {
        document.getElementById("avatarValue").value = result.secure_url;
        document.getElementById("avatarPid").value = result.public_id;

        console.log("Avatar yüklendi:", result);
      } else {
        alert("Avatar yüklenemedi!");
        console.error(result);
      }
    });
  }

  /* ===========================
      COVER
  =========================== */
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

      // Cloudinary
      const result = await uploadToCloudinary(file);

      if (result.secure_url && result.public_id) {
        document.getElementById("coverValue").value = result.secure_url;
        document.getElementById("coverPid").value = result.public_id;

        console.log("Kapak yüklendi:", result);
      } else {
        alert("Kapak yüklenemedi!");
        console.error(result);
      }
    });
  }
});
