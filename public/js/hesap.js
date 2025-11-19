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
     MEDIA PREVIEW — AVATAR
  ============================================================ */
  const avatarInput = document.getElementById("avatar-input");
  const avatarPreview = document.getElementById("avatar-preview");

  if (avatarInput && avatarPreview) {
    avatarInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) avatarPreview.src = URL.createObjectURL(file);
    });
  }

  /* ===========================================================
     MEDIA PREVIEW — COVER
  ============================================================ */
  const coverInput = document.getElementById("cover-input");
  const coverPreview = document.getElementById("cover-preview");

  if (coverInput && coverPreview) {
    coverInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) coverPreview.src = URL.createObjectURL(file);
    });
  }

  /* ===========================================================
     ŞİFRE SIFIRLAMA — DB tabanlı UI kontrolü
  ============================================================ */
  const verifyBox = document.getElementById("verifyBox");
  const newPasswordBox = document.getElementById("newPasswordBox");
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get("showVerify") == "1" && verifyBox) {
    verifyBox.style.display = "block";
    if (newPasswordBox) newPasswordBox.style.display = "none";

    document.getElementById("password")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  if (window.location.pathname.includes("sifre-yeni") && newPasswordBox) {
    newPasswordBox.style.display = "block";
  }
});

/* ===========================================================
   HESAP SİLME MODAL FONKSİYONLARI
=========================================================== */
function openDeleteModal() {
  const modal = document.getElementById("deleteModal");
  if (modal) modal.style.display = "flex";
}

function closeDeleteModal() {
  const modal = document.getElementById("deleteModal");
  if (modal) modal.style.display = "none";
}

async function confirmDelete() {
  const c = document.getElementById("confirmC").value.trim().toUpperCase();
  const password = document.getElementById("deletePassword").value.trim();
  const errorBox = document.getElementById("modalError");

  // Önce hata kutusunu sıfırla
  errorBox.textContent = "";

  // C doğrulaması
  if (c !== "C") {
    errorBox.textContent = "Doğrulama harfi yanlış!";
    return;
  }

  if (!password) {
    errorBox.textContent = "Şifreyi girmelisin.";
    return;
  }

  try {
    const res = await fetch("/hesap/sil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    // Sunucu redirect ediyorsa → oraya git
    if (res.redirected) {
      window.location.href = res.url;
      return;
    }

    // Redirect yoksa hata vardır
    errorBox.textContent = "Bir hata oluştu.";
  } catch (err) {
    console.error("DELETE ERROR:", err);
    errorBox.textContent = "Sunucu hatası.";
  }
}
