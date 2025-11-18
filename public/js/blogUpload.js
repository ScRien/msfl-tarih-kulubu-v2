const cloudName = "deuntxojs";
const uploadPreset = "unsigned_upload";

const fileInput = document.getElementById("blogImages");
const previewBox = document.getElementById("previewBox");
const imageUrlsInput = document.getElementById("imageUrls");

let uploadedUrls = [];

fileInput.addEventListener("change", async () => {
  const files = fileInput.files;
  uploadedUrls = [];

  previewBox.innerHTML = "<p>Yükleniyor...</p>";

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const upload = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const result = await upload.json();
    uploadedUrls.push({
      url: result.secure_url,
      public_id: result.public_id,
    });
  }

  previewBox.innerHTML = uploadedUrls
    .map((img) => `<img src="${img.url}" width="120" />`)
    .join("");

  imageUrlsInput.value = JSON.stringify(uploadedUrls);
});
