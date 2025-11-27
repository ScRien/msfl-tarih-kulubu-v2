// public/js/blogEditUpload.js
import { uploadImage } from "./uploadClient.js";

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("blogEditForm");
  const deleteInput = document.getElementById("deleteImages");

  const deleteCheckboxes = document.querySelectorAll(".deleteImageCheck");

  const input = document.getElementById("newImages");
  const preview = document.getElementById("editPreviewBox");
  const hiddenNew = document.getElementById("newImagesJson");

  const openBtn = document.getElementById("openEditImagePicker");
  const loader = document.getElementById("blogEditLoading");

  /* =====================================
     📌 DOSYA PENCERESİ AÇ
  ===================================== */
  if (openBtn && input) {
    openBtn.addEventListener("click", () => input.click());
  }

  /* =====================================
     🗑️ MEVCUT GÖRSEL SİLME - CHANGE EVENT
  ===================================== */
  deleteCheckboxes.forEach((chk) => {
    chk.addEventListener("change", () => {
      const selected = Array.from(deleteCheckboxes)
        .filter(c => c.checked)
        .map(c => c.value);

      deleteInput.value = JSON.stringify(selected);
    });
  });

  /* =====================================
     🆕 YENİ GÖRSEL YÜKLEME
  ===================================== */
  let newImages = [];

  input?.addEventListener("change", async () => {
    preview.innerHTML = "";
    newImages = [];

    const files = Array.from(input.files);

    if (files.length > 5) {
      alert("En fazla 5 görsel yükleyebilirsiniz.");
      input.value = "";
      return;
    }

    loader.style.display = "flex";

    try {
      for (const file of files) {
        const img = await uploadImage(file, "/blogs");
        newImages.push(img);

        preview.innerHTML += `
          <div class="preview-item">
            <img src="${img.url}" class="preview-img" />
          </div>
        `;
      }

      hiddenNew.value = JSON.stringify(newImages);

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      hiddenNew.value = "[]";
      alert("Görsel yüklenirken hata oluştu.");
    } finally {
      loader.style.display = "none";
    }
  });

});
