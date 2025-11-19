// public/js/hesap.js

document.addEventListener("DOMContentLoaded", () => {
  /* ===========================================================
     SOL MENÜ GEÇİŞLERİ
  ============================================================ */
  const sidebarButtons = document.querySelectorAll(".sidebar-item");
  const contentBoxes = document.querySelectorAll(".content-box");

  if (sidebarButtons.length && contentBoxes.length) {
    sidebarButtons.forEach((btn) => {
      if (btn.classList.contains("disabled")) return;

      btn.addEventListener("click", () => {
        sidebarButtons.forEach((i) => i.classList.remove("active"));
        btn.classList.add("active");

        const target = btn.dataset.target;

        contentBoxes.forEach((box) => (box.style.display = "none"));

        const open = document.getElementById(target);
        if (open) open.style.display = "block";
      });
    });

    const first = document.querySelector(
      '.sidebar-item[data-target="profile"]'
    );
    if (first) first.click();
  }

  /* ===========================================================
     AVATAR PREVIEW
  ============================================================ */
  const avatarInput = document.getElementById("avatarUpload");
  const avatarPreview = document.getElementById("avatarPreview");

  if (avatarInput && avatarPreview) {
    avatarInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        avatarPreview.src = URL.createObjectURL(file);
      }
    });
  }

  /* ===========================================================
     COVER PREVIEW
  ============================================================ */
  const coverInput = document.getElementById("coverUpload");
  const coverPreview = document.getElementById("coverPreview");

  if (coverInput && coverPreview) {
    coverInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        coverPreview.src = URL.createObjectURL(file);
      }
    });
  }

  /* ===========================================================
     ŞİFRE SIFIRLAMA — UI KONTROLÜ
  ============================================================ */
  const verifyBox = document.getElementById("verifyBox");
  const newPasswordBox = document.getElementById("newPasswordBox");
  const urlParams = new URLSearchParams(window.location.search);

  // showVerify=1 ise doğrulama kutusunu aç
  if (urlParams.get("showVerify") === "1" && verifyBox) {
    verifyBox.style.display = "block";
    if (newPasswordBox) newPasswordBox.style.display = "none";

    document.getElementById("password")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  // /hesap/sifre-yeni içindeysek yeni şifre kutusunu aç
  if (window.location.pathname.includes("sifre-yeni") && newPasswordBox) {
    newPasswordBox.style.display = "block";
  }
});

/* ===========================================================
   HESAP SİLME MODAL FONKSİYONLARI (FORM SUBMIT)
=========================================================== */
function openDeleteModal() {
  const modal = document.getElementById("deleteModal");
  if (modal) modal.style.display = "flex";
}

function closeDeleteModal() {
  const modal = document.getElementById("deleteModal");
  if (modal) modal.style.display = "none";
}

function confirmDelete() {
  const cInput = document.getElementById("confirmC");
  const pwInput = document.getElementById("deletePassword");
  const errorBox = document.getElementById("modalError");
  const form = document.getElementById("deleteForm");

  if (!form || !cInput || !pwInput || !errorBox) return;

  errorBox.textContent = "";

  const c = cInput.value.trim().toUpperCase();
  const password = pwInput.value.trim();

  // C doğrulaması
  if (c !== "C") {
    errorBox.textContent = "Onay için C harfini girin.";
    return;
  }

  // Şifre kontrolü
  if (!password) {
    errorBox.textContent = "Şifreyi girmelisin.";
    return;
  }

  // Her şey tamamsa formu gönder
  form.submit();
}
