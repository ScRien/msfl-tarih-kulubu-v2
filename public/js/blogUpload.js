// public/js/blogUpload.js
document.addEventListener("DOMContentLoaded", () => {
  const cloudName = "deuntxojs";
  const uploadPreset = "tarihkulubu_unsigned";

  const fileInput = document.getElementById("blogImages");
  const previewBox = document.getElementById("previewBox");
  const imageUrlsInput = document.getElementById("imageUrls");
  const fileCount = document.getElementById("fileCount");

  // 🔥 TAM EKRAN LOADER
  const loader = document.getElementById("blogUploadLoading");

  function showLoader() {
    if (loader) loader.style.display = "flex";
  }

  function hideLoader() {
    if (loader) loader.style.display = "none";
  }

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

    if (files.length > 5) {
      alert("En fazla 5 görsel yükleyebilirsiniz!");
      fileInput.value = "";
      return;
    }

    // === LOADING BAŞLA ===
    showLoader();

    uploadedUrls = [];
    previewBox.innerHTML =
      "<p style='text-align:center; padding:20px;'>Yükleniyor...</p>";
    if (fileCount) fileCount.textContent = `Yükleniyor: ${files.length} dosya`;

    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();

        if (result.secure_url && result.public_id) {
          return {
            url: result.secure_url,
            public_id: result.public_id,
          };
        } else {
          console.error("Cloudinary upload hatası:", result);
          throw new Error(`Görsel yüklenemedi: ${file.name}`);
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

      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed > 0) {
        alert(`${failed} görsel yüklenemedi. Lütfen tekrar deneyin.`);
      }

      if (successful.length === 0) {
        previewBox.innerHTML =
          "<p style='color:red; text-align:center; padding:20px;'>Hiçbir görsel yüklenemedi.</p>";
        imageUrlsInput.value = "[]";
        if (fileCount) fileCount.textContent = "Seçili dosya yok";
        hideLoader();
        return;
      }

      uploadedUrls = successful;

      const previews = successful
        .map(
          (item) => `
            <div class="preview-item">
              <img src="${item.url}" class="preview-img" alt="Preview" />
            </div>
          `
        )
        .join("");

      previewBox.innerHTML = previews;
      imageUrlsInput.value = JSON.stringify(uploadedUrls);

      if (fileCount) {
        fileCount.textContent = `${successful.length} dosya yüklendi`;
      }
    } catch (err) {
      console.error("Upload process error:", err);
      previewBox.innerHTML =
        "<p style='color:red; text-align:center; padding:20px;'>Yükleme sırasında hata oluştu.</p>";
      imageUrlsInput.value = "[]";
    }

    // === LOADING BİTİR ===
    hideLoader();
  });
});
