// =================================
// BLOG OLUŞTURMA FORMU
// =================================
const blogImagesInput = document.getElementById("blogImages");
const imageUrlsInput = document.getElementById("imageUrls");
let uploadedImages = [];

if (blogImagesInput) {
  blogImagesInput.addEventListener("change", async function (e) {
    const files = Array.from(e.target.files);
    uploadedImages = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "tarihkulubu");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/deuntxojs/image/upload",
        { method: "POST", body: formData }
      );

      const data = await res.json();

      uploadedImages.push({
        url: data.secure_url,
        public_id: data.public_id,
      });
    }

    imageUrlsInput.value = JSON.stringify(uploadedImages);
  });
}

// =================================
// BLOG DÜZENLEME FORMU
// =================================
const deleteImagesInput = document.getElementById("deleteImages");
const deleteChecks = document.querySelectorAll(".deleteImageCheck");

if (deleteChecks.length) {
  deleteChecks.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const selected = Array.from(deleteChecks)
        .filter((c) => c.checked)
        .map((c) => c.value);

      deleteImagesInput.value = JSON.stringify(selected);
    });
  });
}

// Yeni eklenen görseller
const newImagesInput = document.getElementById("newBlogImages");
const newImagesJson = document.getElementById("newImagesJson");

if (newImagesInput) {
  newImagesInput.addEventListener("change", async function (e) {
    const files = Array.from(e.target.files);
    let newImgs = [];

    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", "tarihkulubu");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/deuntxojs/image/upload",
        { method: "POST", body: fd }
      );

      const data = await res.json();

      newImgs.push({
        url: data.secure_url,
        public_id: data.public_id,
      });
    }

    newImagesJson.value = JSON.stringify(newImgs);
  });
}
