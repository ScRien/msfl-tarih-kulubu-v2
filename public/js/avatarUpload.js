const cloudName = "deuntxojs";
const preset = "unsigned_upload";

const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");
const avatarUrl = document.getElementById("avatarUrl");

avatarInput.addEventListener("change", async () => {
  const file = avatarInput.files[0];
  if (!file) return;

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", preset);

  const upload = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: fd,
  });

  const res = await upload.json();

  avatarPreview.src = res.secure_url;
  avatarUrl.value = res.secure_url;
});
