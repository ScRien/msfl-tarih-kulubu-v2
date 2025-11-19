const input = document.getElementById("editImages");
const preview = document.getElementById("editPreviewContainer");
const outputField = document.getElementById("uploadedImages");

let uploaded = [];

if (input) {
  input.addEventListener("change", async (e) => {
    preview.innerHTML = "";
    const files = [...e.target.files];

    if (files.length > 5) {
      alert("En fazla 5 görsel yükleyebilirsin.");
      return;
    }

    uploaded = [];

    for (let file of files) {
      // Cloudinary upload
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", "blog_upload"); // sen ayarlayacaksın

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload",
        { method: "POST", body: form }
      );

      const data = await res.json();
      uploaded.push(data.secure_url);

      // Preview göster
      const img = document.createElement("img");
      img.src = data.secure_url;
      preview.appendChild(img);
    }

    // backend'e yollamak için:
    outputField.value = JSON.stringify(uploaded);
  });
}
