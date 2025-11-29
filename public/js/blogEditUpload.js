// public/js/blogEditUpload.js
import { uploadBlogImage } from "./uploadClient.js";

document.addEventListener("DOMContentLoaded", () => {
  const deleteInput = document.getElementById("deleteImages");
  const deleteCheckboxes = document.querySelectorAll(".deleteImageCheck");

  const input = document.getElementById("newImages");
  const preview = document.getElementById("editPreviewBox");
  const hiddenNew = document.getElementById("newImagesJson");
  const openBtn = document.getElementById("openEditImagePicker");
  const loader = document.getElementById("blogEditLoading");

  /* 📂 Dosya penceresini aç */
  openBtn?.addEventListener("click", () => {
    input?.click();
  });

  /* 🗑️ Mevcut görsel silme */
  deleteCheckboxes.forEach((chk) => {
    chk.addEventListener("change", () => {
      const selected = Array.from(deleteCheckboxes)
        .filter((c) => c.checked)
        .map((c) => c.dataset.fileid)
        .filter(Boolean); // undefined olanları at

      deleteInput.value = JSON.stringify(selected);
    });
  });

  /* 🆕 Yeni görsel yükleme */
  input?.addEventListener("change", async () => {
    preview.innerHTML = "";
    hiddenNew.value = "[]";

    const files = Array.from(input.files || []);
    if (!files.length) return;

    if (files.length > 5) {
      alert("En fazla 5 görsel yükleyebilirsiniz.");
      input.value = "";
      return;
    }

    const uploads = [];
    if (loader) loader.style.display = "flex";

    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          alert(`'${file.name}' görsel değil, atlandı.`);
          continue;
        }

        // 🔹 Backend limiti ile aynı: 2MB
        if (file.size > 2 * 1024 * 1024) {
          alert(`'${file.name}' 2MB sınırını aşıyor, yüklenmedi.`);
          continue;
        }

        // 🔹 ImageKit'e upload (folder: blogs)
        const img = await uploadBlogImage(file, "blogs");
        uploads.push(img);

        const div = document.createElement("div");
        div.className = "preview-item";
        div.innerHTML = `<img src="${img.url}" class="preview-img" />`;
        preview.appendChild(div);
      }

      hiddenNew.value = JSON.stringify(uploads);
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      hiddenNew.value = "[]";
      alert("Görseller yüklenirken bir hata oluştu.");
    } finally {
      if (loader) loader.style.display = "none";
    }
  });
});
