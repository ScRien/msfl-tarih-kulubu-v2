// public/js/blogEditUpload.js
document.addEventListener("DOMContentLoaded", () => {

  const cloudName = "deuntxojs";
  const uploadPreset = "tarihkulubu_unsigned";

  const newImagesInput = document.getElementById("newImages");
  const previewBox = document.getElementById("editPreviewBox");
  const newImagesJson = document.getElementById("newImagesJson");
  const deleteImagesInput = document.getElementById("deleteImages");
  const deleteCheckboxes = document.querySelectorAll(".deleteImageCheck");

  // === TAM EKRAN LOADER ===
  const loader = document.getElementById("blogEditLoading");

  function showLoader() {
    if (loader) loader.style.display = "flex";
  }

  function hideLoader() {
    if (loader) loader.style.display = "none";
  }

  // MEVCUT GÖRSELLER SİLME
  deleteCheckboxes.forEach((chk) => {
    chk.addEventListener("change", () => {
      const checked = Array.from(deleteCheckboxes)
        .filter((c) => c.checked)
        .map((c) => c.value);

      deleteImagesInput.value = JSON.stringify(checked);
    });
  });

  // YENİ GÖRSELLER (UPLOAD)
  if (!newImagesInput || !previewBox || !newImagesJson) return;

  newImagesInput.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (files.length > 5) {
      alert("En fazla 5 yeni görsel ekleyebilirsiniz!");
      return;
    }

    // === LOADER AÇ ===
    showLoader();

    previewBox.innerHTML = "<p style='padding:20px; text-align:center;'>Yükleniyor...</p>";

    const uploadPromises = files.map(async (file) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData }
        );

        const result = await res.json();

        if (result.secure_url && result.public_id) {
          return {
            url: result.secure_url,
            public_id: result.public_id,
          };
        } else {
          throw new Error("Cloudinary hatalı yanıt verdi");
        }
      } catch (err) {
        console.error("Upload error:", err);
        throw err;
      }
    });

    try {
      const results = await Promise.allSettled(uploadPromises);

      const successful = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);

      if (!successful.length) {
        previewBox.innerHTML =
          "<p style='color:red; padding:20px; text-align:center;'>Yükleme başarısız.</p>";
        newImagesJson.value = "[]";
        hideLoader();
        return;
      }

      newImagesJson.value = JSON.stringify(successful);

      const html = successful
        .map(
          (item) => `
          <div class="preview-item">
            <img src="${item.url}" alt="Preview" class="preview-img">
          </div>
        `
        )
        .join("");

      previewBox.innerHTML = html;

    } catch (err) {
      console.error(err);
      previewBox.innerHTML =
        "<p style='color:red; padding:20px; text-align:center;'>Yükleme sırasında bir hata oluştu.</p>";
      newImagesJson.value = "[]";
    }

    // === LOADER KAPAT ===
    hideLoader();
  });
});
