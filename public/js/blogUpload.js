import { uploadImage } from "./uploadClient.js";

const input = document.getElementById("blogImages");
const preview = document.getElementById("previewBox");
const hidden = document.getElementById("imageUrls");
const fileCount = document.getElementById("fileCount");
const loader = document.getElementById("blogUploadLoading");

const openBtn = document.getElementById("openImagePicker");
const fileInput = document.getElementById("blogImages");

if (openBtn && fileInput) {
  openBtn.addEventListener("click", () => fileInput.click());
}

let images = [];

input?.addEventListener("change", async () => {
  preview.innerHTML = "";
  images = [];

  const files = Array.from(input.files);

  if (files.length === 0) return;

  if (files.length > 5) {
    alert("En fazla 5 görsel seçebilirsiniz.");
    input.value = "";
    fileCount.textContent = "Seçili dosya yok";
    return;
  }

  fileCount.textContent = `${files.length} görsel seçildi`;

  // ✅ LOADER AÇ
  if (loader) loader.style.display = "flex";

  try {
    for (const file of files) {
      const img = await uploadImage(file, "/blogs");
      images.push(img);

      preview.innerHTML += `
        <div class="preview-item">
          <img src="${img.url}" class="preview-img" />
        </div>
      `;
    }

    hidden.value = JSON.stringify(images);
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    alert("Görseller yüklenirken bir hata oluştu.");
    preview.innerHTML = "";
    hidden.value = "[]";
    input.value = "";
    fileCount.textContent = "Seçili dosya yok";
  } finally {
    // ✅ LOADER KAPAT
    if (loader) loader.style.display = "none";
  }
});
