import { uploadBlogImage } from "./uploadClient.js";

const input = document.getElementById("blogImages");
const preview = document.getElementById("previewBox");
const hidden = document.getElementById("imageUrls");
const fileCount = document.getElementById("fileCount");
const loader = document.getElementById("blogUploadLoading");
const openBtn = document.getElementById("openImagePicker");

let images = [];

openBtn?.addEventListener("click", () => input?.click());

input?.addEventListener("change", async () => {
  preview.innerHTML = "";
  images = [];

  const files = Array.from(input.files || []);
  if (!files.length) return;

  if (files.length > 5) {
    alert("En fazla 5 görsel seçebilirsiniz.");
    return;
  }

  fileCount.textContent = `${files.length} görsel seçildi`;
  loader.style.display = "flex";

  try {
    for (const file of files) {
      const img = await await uploadBlogImage(file);
      images.push(img);

      preview.innerHTML += `
        <div class="preview-item">
          <img src="${img.url}" class="preview-img"/>
        </div>
      `;
    }

    hidden.value = JSON.stringify(images);
  } catch {
    alert("Görseller yüklenirken hata oluştu");
    hidden.value = "[]";
  } finally {
    loader.style.display = "none";
  }
});
