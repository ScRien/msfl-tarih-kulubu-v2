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

    // Varsayılan olarak "Profil" açılsın
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
      if (file) avatarPreview.src = URL.createObjectURL(file);
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
      if (file) coverPreview.src = URL.createObjectURL(file);
    });
  }

  /* ===========================================================
     ŞİFRE SIFIRLAMA — UI KONTROL
  ============================================================ */
  const verifyBox = document.getElementById("verifyBox");
  const newPasswordBox = document.getElementById("newPasswordBox");
  const urlParams = new URLSearchParams(window.location.search);

  // showVerify=1 → doğrulama kodu kutusu aç
  if (urlParams.get("showVerify") === "1" && verifyBox) {
    document.querySelector('.sidebar-item[data-target="password"]')?.click();

    verifyBox.style.display = "block";
    if (newPasswordBox) newPasswordBox.style.display = "none";
  }

  // /hesap/sifre-yeni → Yeni şifre kutusunu aç + tabı aktive et
  if (window.location.pathname.includes("sifre-yeni") && newPasswordBox) {
    document.querySelector('.sidebar-item[data-target="password"]')?.click();

    newPasswordBox.style.display = "block";
    if (verifyBox) verifyBox.style.display = "none";
  }
});

/* ===========================================================
   HESAP SİLME MODAL (FORM SUBMIT)
=========================================================== */
function openDeleteModal() {
  document.getElementById("deleteModal").style.display = "flex";
}

function closeDeleteModal() {
  document.getElementById("deleteModal").style.display = "none";
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

  if (c !== "C") {
    errorBox.textContent = "Onay için C harfini girin.";
    return;
  }

  if (!password) {
    errorBox.textContent = "Şifreyi girmelisin.";
    return;
  }

  // Formu gönder
  form.submit();
}
