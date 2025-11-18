document.addEventListener("DOMContentLoaded", () => {
  function setupImageLimit(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const max = parseInt(input.dataset.max || "5");

    input.addEventListener("change", () => {
      if (input.files.length > max) {
        alert(`En fazla ${max} adet fotoğraf yükleyebilirsiniz.`);
        input.value = ""; // seçimi temizle
      }
    });
  }

  setupImageLimit("blogImages");     // Blog oluşturma
  setupImageLimit("newBlogImages");  // Blog düzenleme
});
