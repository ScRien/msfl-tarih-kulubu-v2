// public/js/blogUpload.js
document.addEventListener("DOMContentLoaded", () => {
  const cloudName = "deuntxojs";
  const uploadPreset = "unsigned_upload";

  const fileInput = document.getElementById("blogImages");
  const previewBox = document.getElementById("previewBox");
  const imageUrlsInput = document.getElementById("imageUrls");
  const fileCount = document.getElementById("fileCount");

  if (!fileInput || !previewBox || !imageUrlsInput) return;

  let uploadedUrls = [];

  fileInput.addEventListener("change", async () => {
    const files = fileInput.files;

    if (!files || files.length === 0) {
      uploadedUrls = [];
      previewBox.innerHTML = "";
      imageUrlsInput.value = "[]";
      if (fileCount) fileCount.textContent = "Seçili dosya yok";
      return;
    }

    uploadedUrls = [];
    previewBox.innerHTML = "<p>Yükleniyor...</p>";
    if (fileCount) fileCount.textContent = `Seçili dosya: ${files.length}`;

    const previews = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const upload = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await upload.json();

        if (result.secure_url && result.public_id) {
          uploadedUrls.push({
            url: result.secure_url,
            public_id: result.public_id,
          });

          previews.push(`
            <div class="preview-item">
              <img src="${result.secure_url}" class="preview-img" />
            </div>
          `);
        } else {
          console.error("Cloudinary upload hatası:", result);
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    if (uploadedUrls.length === 0) {
      previewBox.innerHTML =
        "<p style='color:red'>Görsel yüklenemedi. Lütfen tekrar deneyin.</p>";
      imageUrlsInput.value = "[]";
      return;
    }

    previewBox.innerHTML = previews.join("");
    imageUrlsInput.value = JSON.stringify(uploadedUrls);
  });
});
