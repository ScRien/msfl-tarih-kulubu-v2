// public/js/avatarCoverUpload.js
document.addEventListener("DOMContentLoaded", () => {
  const cloudName = "deuntxojs";
  const uploadPreset = "unsigned_upload";

  // Avatar Upload
  const avatarUpload = document.getElementById("avatarUpload");
  const avatarPreview = document.getElementById("avatarPreview");
  const avatarUrl = document.getElementById("avatarUrl");

  if (avatarUpload && avatarPreview && avatarUrl) {
    avatarUpload.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        // Önizleme göster
        const reader = new FileReader();
        reader.onload = (ev) => {
          avatarPreview.src = ev.target.result;
        };
        reader.readAsDataURL(file);

        // Cloudinary'ye yükle
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();

        if (result.secure_url) {
          avatarUrl.value = result.secure_url;
          console.log("Avatar yüklendi:", result.secure_url);
        } else {
          alert("Avatar yüklenemedi. Lütfen tekrar deneyin.");
          console.error("Cloudinary error:", result);
        }
      } catch (err) {
        console.error("Avatar upload error:", err);
        alert("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    });
  }

  // Cover Upload
  const coverUpload = document.getElementById("coverUpload");
  const coverPreview = document.getElementById("coverPreview");
  const coverUrl = document.getElementById("coverUrl");

  if (coverUpload && coverPreview && coverUrl) {
    coverUpload.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        // Önizleme göster
        const reader = new FileReader();
        reader.onload = (ev) => {
          coverPreview.src = ev.target.result;
        };
        reader.readAsDataURL(file);

        // Cloudinary'ye yükle
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();

        if (result.secure_url) {
          coverUrl.value = result.secure_url;
          console.log("Kapak yüklendi:", result.secure_url);
        } else {
          alert("Kapak fotoğrafı yüklenemedi. Lütfen tekrar deneyin.");
          console.error("Cloudinary error:", result);
        }
      } catch (err) {
        console.error("Cover upload error:", err);
        alert("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    });
  }
});