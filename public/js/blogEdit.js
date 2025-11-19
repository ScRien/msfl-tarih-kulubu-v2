document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("newImages");
  const previewArea = document.getElementById("previewArea");

  input.addEventListener("change", (e) => {
    previewArea.innerHTML = "";

    Array.from(e.target.files).forEach((file) => {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.classList.add("preview-img");
      previewArea.appendChild(img);
    });
  });
});

