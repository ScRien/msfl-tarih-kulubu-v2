import { uploadBlogImage } from "./uploadClient.js";

document.addEventListener("DOMContentLoaded", () => {
  const deleteInput = document.getElementById("deleteImages");
  const deleteCheckboxes = document.querySelectorAll(".deleteImageCheck");

  const newInput = document.getElementById("newImages");
  const newPreview = document.getElementById("editPreviewBox");
  const hiddenNewImages = document.getElementById("newImagesJson");
  const openEditBtn = document.getElementById("openEditImagePicker");
  const loader = document.getElementById("blogEditLoading");

  /* --- 1. MEVCUT GÖRSEL SİLME MANTIĞI --- */
  // Kullanıcı "Sil" kutucuğunu işaretlerse ID'yi listeye ekleriz
  deleteCheckboxes.forEach((chk) => {
    chk.addEventListener("change", () => {
      const selectedIds = Array.from(deleteCheckboxes)
        .filter((c) => c.checked)
        .map((c) => c.dataset.fileid)
        .filter(Boolean);

      deleteInput.value = JSON.stringify(selectedIds);
    });
  });

  /* --- 2. YENİ GÖRSEL YÜKLEME --- */
  openEditBtn?.addEventListener("click", () => newInput?.click());

  newInput?.addEventListener("change", async () => {
    newPreview.innerHTML = "";
    hiddenNewImages.value = "[]";

    const files = Array.from(newInput.files || []);
    if (!files.length) return;

    if (files.length > 5) {
      alert("Tek seferde en fazla 5 yeni görsel ekleyebilirsiniz.");
      newInput.value = "";
      return;
    }

    if (loader) loader.style.display = "flex";
    const uploaded = [];

    try {
      for (const file of files) {
        try {
          const result = await uploadBlogImage(file);
          uploaded.push(result);

          // Önizleme
          const div = document.createElement("div");
          div.className = "preview-item";
          div.innerHTML = `<img src="${result.url}" class="preview-img" />`;
          newPreview.appendChild(div);
        } catch (err) {
          alert(`Hata (${file.name}): ${err.message}`);
        }
      }

      // Başarılı yüklemeleri input'a yaz
      hiddenNewImages.value = JSON.stringify(uploaded);

    } catch (err) {
      console.error(err);
    } finally {
      if (loader) loader.style.display = "none";
    }
  });
});