// Cloudinary Config
const cloudName = "deuntxojs";
const uploadPreset = "unsigned_upload";

// Elementler
const editFileInput = document.getElementById("newImages");
const editPreviewBox = document.getElementById("editPreviewBox");
const newImagesInput = document.getElementById("newImagesJson");

let newUploadedImages = []; // JSON listesi

// DEĞİŞTİR — CLIENT UPLOAD
editFileInput.addEventListener("change", async () => {
  const files = editFileInput.files;
  newUploadedImages = [];
  editPreviewBox.innerHTML = "<p>Yükleniyor...</p>";

  for (const file of files) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", uploadPreset);

    const upload = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: fd }
    );

    const result = await upload.json();

    newUploadedImages.push({
      url: result.secure_url,
      public_id: result.public_id,
    });
  }

  // Önizleme
  editPreviewBox.innerHTML = newUploadedImages
    .map(
      (img) => `
      <div class="preview-item">
        <img src="${img.url}" class="preview-img" />
      </div>
    `
    )
    .join("");

  // JSON Gizli Input
  newImagesInput.value = JSON.stringify(newUploadedImages);
});
