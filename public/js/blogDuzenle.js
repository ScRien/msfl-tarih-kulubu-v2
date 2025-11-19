// Cloudinary unsigned preset kullanıyorsan BURAYA ekle
const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/<CLOUD_NAME>/image/upload";
const UPLOAD_PRESET = "<UPLOAD_PRESET>";

const newImagesInput = document.getElementById("newImages");
const preview = document.getElementById("newPreview");
const urlContainer = document.getElementById("urlContainer");

newImagesInput.addEventListener("change", async (e) => {
  preview.innerHTML = "";
  urlContainer.innerHTML = "";

  const files = Array.from(e.target.files);

  for (const file of files) {
    const img = document.createElement("img");
    img.className = "preview-img";
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);

    // Upload Cloudinary
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: data,
    });

    const json = await res.json();

    // input hidden
    const urlInput = document.createElement("input");
    urlInput.type = "hidden";
    urlInput.name = "newImageUrls";
    urlInput.value = json.secure_url;
    urlContainer.appendChild(urlInput);
  }
});
