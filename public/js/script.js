/* =======================
   1) GÖRSEL ÖNİZLEME
======================= */
const fileInput = document.getElementById("images");
const previewContainer = document.getElementById("preview-container");
let selectedFiles = [];

if (fileInput && previewContainer) {
  fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgWrapper = document.createElement("div");
        imgWrapper.classList.add("preview-item");

        const img = document.createElement("img");
        img.src = event.target.result;
        img.classList.add("preview-img");

        const removeBtn = document.createElement("button");
        removeBtn.innerHTML = "−";
        removeBtn.classList.add("remove-btn");
        removeBtn.addEventListener("click", () => {
          selectedFiles = selectedFiles.filter((f) => f !== file);
          imgWrapper.remove();
          updateFileInput();
        });

        imgWrapper.appendChild(img);
        imgWrapper.appendChild(removeBtn);
        previewContainer.appendChild(imgWrapper);
      };

      reader.readAsDataURL(file);
      selectedFiles.push(file);
    });

    updateFileInput();
  });

  function updateFileInput() {
    const dt = new DataTransfer();
    selectedFiles.forEach((f) => dt.items.add(f));
    fileInput.files = dt.files;
  }
}

/* =======================
   2) YORUM EKLE MODAL
======================= */
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("comment-modal");
  const addBtn = document.querySelector(".add-comment-btn");
  const closeBtn = document.getElementById("close-modal");

  if (!modal || !addBtn || !closeBtn) return; // ← hesap sayfasında durdurur

  addBtn.addEventListener("click", () => modal.classList.add("active"));
  closeBtn.addEventListener("click", () => modal.classList.remove("active"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
  });
});

/* =======================
   3) YORUM DÜZENLEME MODAL
======================= */
document.addEventListener("DOMContentLoaded", () => {
  const editModal = document.getElementById("comment-edit-modal");
  const editForm = document.getElementById("edit-comment-form");
  const editTextarea = document.getElementById("edit-comment-textarea");
  const closeEdit = document.getElementById("close-edit-modal");
  const editButtons = document.querySelectorAll(".edit-comment-btn");

  // Eğer bu elemanlar yoksa o sayfada bu özellik yok → Stop
  if (!editModal || !editForm || !editTextarea) return;

  editButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const commentId = btn.dataset.id;
      const content = btn.dataset.content;
      const postId = btn.dataset.post;

      editTextarea.value = content;
      editForm.action = `/blog/${postId}/yorum/${commentId}/duzenle`;
      editModal.classList.add("active");
    });
  });

  if (closeEdit) {
    closeEdit.addEventListener("click", () =>
      editModal.classList.remove("active")
    );
  }

  editModal.addEventListener("click", (e) => {
    if (e.target === editModal) editModal.classList.remove("active");
  });
});

// BLOG DETAY CAROUSEL IMAGE GALLERY
let currentIndex = 0;

function showSlide(index) {
  const items = document.querySelectorAll(".carousel-item");
  const indicators = document.querySelectorAll(".carousel-indicators button");

  if (!items.length) return;

  if (index >= items.length) index = 0;
  if (index < 0) index = items.length - 1;

  currentIndex = index;

  items.forEach((item, i) => {
    item.classList.remove("active");
    if (i === index) item.classList.add("active");
  });

  indicators.forEach((btn, i) => {
    btn.classList.remove("active");
    if (i === index) btn.classList.add("active");
  });
}

function nextSlide() {
  showSlide(currentIndex + 1);
}

function prevSlide() {
  showSlide(currentIndex - 1);
}

function goToSlide(i) {
  showSlide(i);
}

showSlide(0);
