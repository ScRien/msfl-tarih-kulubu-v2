// public/js/blogEditUpload.js
document.addEventListener("DOMContentLoaded", () => {
  const cloudName = "deuntxojs";
  const uploadPreset = "unsigned_upload";

  const editFileInput = document.getElementById("newImages");
  const editPreviewBox = document.getElementById("editPreviewBox");
  const newImagesInput = document.getElementById("newImagesJson");

  if (!editFileInput || !editPreviewBox || !newImagesInput) return;

  let newUploadedImages = [];

  editFileInput.addEventListener("change", async () => {
    const files = editFileInput.files;

    if (!files || files.length === 0) {
      newUploadedImages = [];
      editPreviewBox.innerHTML = "";
      newImagesInput.value = "[]";
      return;
    }

    if (files.length > 5) {
      alert("En fazla 5 yeni görsel ekleyebilirsiniz!");
      editFileInput.value = "";
      return;
    }

    newUploadedImages = [];
    editPreviewBox.innerHTML = "<p style='text-align:center; padding:20px;'>Yükleniyor...</p>";

    const previews = [];

    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", uploadPreset);

        const upload = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: fd,
          }
        );

        const result = await upload.json();

        if (result.secure_url && result.public_id) {
          newUploadedImages.push({
            url: result.secure_url,
            public_id: result.public_id,
          });

          previews.push(`
            <div class="preview-item">
              <img src="${result.secure_url}" class="preview-img" alt="Preview" />
            </div>
          `);
        } else {
          console.error("Cloudinary edit upload hatası:", result);
          alert(`Görsel yüklenemedi: ${file.name}`);
        }
      } catch (err) {
        console.error("Edit upload error:", err);
        alert(`Bir hata oluştu: ${file.name}`);
      }
    }

    if (newUploadedImages.length === 0) {
      editPreviewBox.innerHTML =
        "<p style='color:red; text-align:center; padding:20px;'>Görsel yüklenemedi. Lütfen tekrar deneyin.</p>";
      newImagesInput.value = "[]";
      return;
    }

    editPreviewBox.innerHTML = previews.join("");
    newImagesInput.value = JSON.stringify(newUploadedImages);
  });
});