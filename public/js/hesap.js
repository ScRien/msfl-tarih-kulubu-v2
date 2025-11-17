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
      if (!file) return;
      avatarPreview.src = URL.createObjectURL(file);
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
      if (!file) return;
      coverPreview.src = URL.createObjectURL(file);
    });
  }

  /* ===========================================================
     ŞİFRE SIFIRLAMA — FORM TABANLI
  ============================================================ */

  const sendCodeForm = document.querySelector(
    "#password form[action='/hesap/sifre-kod']"
  );
  const verifyBox = document.getElementById("verifyBox");
  const newPasswordBox = document.getElementById("newPasswordBox");

  // Kod gönderme
  if (sendCodeForm) {
    sendCodeForm.addEventListener("submit", () => {
      verifyBox.style.display = "block";
      newPasswordBox.style.display = "none";
    });
  }

  // Eğer URL'de showVerify=1 varsa otomatik aç
  if (window.location.search.includes("showVerify=1")) {
    verifyBox.style.display = "block";
    newPasswordBox.style.display = "none";
    document.getElementById("password").scrollIntoView({ behavior: "smooth" });
  }
});
