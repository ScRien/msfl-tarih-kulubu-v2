const cloudName = "deuntxojs";
const preset = "unsigned_upload";

const coverInput = document.getElementById("coverInput");
const coverPreview = document.getElementById("coverPreview");
const coverUrl = document.getElementById("coverUrl");

coverInput.addEventListener("change", async () => {
  const file = coverInput.files[0];
  if (!file) return;

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", preset);

  const upload = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: fd,
  });

  const res = await upload.json();

  coverPreview.src = res.secure_url;
  coverUrl.value = res.secure_url;
});
