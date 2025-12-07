import { uploadBlogImage } from "./uploadClient.js";

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("blogImages");
  const openBtn = document.getElementById("openImagePicker");
  const previewBox = document.getElementById("previewBox");
  const hiddenInput = document.getElementById("imageUrls");
  const loader = document.getElementById("blogUploadLoading");
  const fileCountSpan = document.getElementById("fileCount");

  // Butona basınca dosya seçiciyi aç
  openBtn?.addEventListener("click", () => fileInput?.click());

  // Dosya seçilince çalışır
  fileInput?.addEventListener("change", async () => {
    const files = Array.from(fileInput.files || []);
    
    // Temizlik
    previewBox.innerHTML = "";
    hiddenInput.value = "[]";
    fileCountSpan.textContent = files.length > 0 ? `${files.length} dosya seçildi` : "Seçili dosya yok";

    if (files.length === 0) return;

    if (files.length > 5) {
      alert("En fazla 5 görsel yükleyebilirsiniz.");
      fileInput.value = "";
      fileCountSpan.textContent = "Seçili dosya yok";
      return;
    }

    // Loader Göster
    if (loader) loader.style.display = "flex";

    const uploadedImages = [];

    try {
      for (const file of files) {
        try {
          // Upload işlemi
          const result = await uploadBlogImage(file);
          uploadedImages.push(result);

          // Önizleme Ekle
          const imgDiv = document.createElement("div");
          imgDiv.className = "preview-item";
          imgDiv.innerHTML = `<img src="${result.url}" alt="Önizleme" />`;
          previewBox.appendChild(imgDiv);

        } catch (err) {
          console.error(err);
          alert(`Hata: ${file.name} yüklenemedi. ${err.message}`);
        }
      }

      // Sonuçları gizli inputa yaz (Backend bunu okuyacak)
      hiddenInput.value = JSON.stringify(uploadedImages);

    } catch (generalErr) {
      alert("Yükleme işlemi sırasında bir hata oluştu.");
    } finally {
      // Loader Gizle
      if (loader) loader.style.display = "none";
    }
  });
});