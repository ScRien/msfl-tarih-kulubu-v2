// === Cloudinary Ayarları ===
const cloudName = "deuntxojs";
const uploadPreset = "unsigned_upload";

// === Avatar Upload ===
const avatarInput = document.getElementById("avatarUpload");
const avatarPreview = document.getElementById("avatarPreview");
const avatarUrlInput = document.getElementById("avatarUrl");

if (avatarInput) {
  avatarInput.addEventListener("change", async () => {
    const file = avatarInput.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", uploadPreset);

    avatarPreview.src = "/img/loading.gif";

    const upload = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: fd,
      }
    );

    const result = await upload.json();
    avatarPreview.src = result.secure_url;
    avatarUrlInput.value = result.secure_url;
  });
}

// === Kapak Upload ===
const coverInput = document.getElementById("coverUpload");
const coverPreview = document.getElementById("coverPreview");
const coverUrlInput = document.getElementById("coverUrl");

if (coverInput) {
  coverInput.addEventListener("change", async () => {
    const file = coverInput.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", uploadPreset);

    coverPreview.src = "/img/loading.gif";

    const upload = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: fd }
    );

    const result = await upload.json();
    coverPreview.src = result.secure_url;
    coverUrlInput.value = result.secure_url;
  });
}
