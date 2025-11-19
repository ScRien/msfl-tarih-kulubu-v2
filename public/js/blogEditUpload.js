document.addEventListener("DOMContentLoaded", () => {
  const cloudName = "deuntxojs";
  const uploadPreset = "tarihkulubu_unsigned";  // 🔥 Yeni preset

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
    editPreviewBox.innerHTML =
      "<p style='text-align:center; padding:20px;'>Yükleniyor...</p>";

    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", uploadPreset);   // 🔥 doğru preset
        fd.append("folder", "tarihkulubu/blogs");   // 🔥 doğru klasör

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: fd,
          }
        );

        const result = await response.json();

        if (result.secure_url && result.public_id) {
          return {
            url: result.secure_url,
            public_id: result.public_id,
          };
        } else {
          console.error("Cloudinary edit upload hatası:", result);
          throw new Error(`Görsel yüklenemedi: ${file.name}`);
        }
      } catch (err) {
        console.error("Edit upload error:", err);
        throw err;
      }
    });

    try {
      const results = await Promise.allSettled(uploadPromises);

      const successful = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);

      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed > 0) {
        alert(`${failed} görsel yüklenemedi.`);
      }

      if (successful.length === 0) {
        editPreviewBox.innerHTML =
          "<p style='color:red; text-align:center; padding:20px;'>Görsel yüklenemedi.</p>";
        newImagesInput.value = "[]";
        return;
      }

      newUploadedImages = successful;

      const previews = successful
        .map(
          (item) => `
        <div class="preview-item">
          <img src="${item.url}" class="preview-img" alt="Preview" />
        </div>`
        )
        .join("");

      editPreviewBox.innerHTML = previews;
      newImagesInput.value = JSON.stringify(newUploadedImages);
    } catch (err) {
      console.error("Edit upload process error:", err);
      editPreviewBox.innerHTML =
        "<p style='color:red; text-align:center; padding:20px;'>Yükleme hatası.</p>";
      newImagesInput.value = "[]";
    }
  });
});
