/* ======================================================
   HESAP – GÜNCEL VE SORUNSUZ ✅
====================================================== */

import { uploadProfileImage } from "./uploadClient.js";

document.addEventListener("DOMContentLoaded", () => {
  /* ======================================================
     1. GENEL ELEMENTLER & SIDEBAR
  ====================================================== */
  const sidebarItems = document.querySelectorAll(".sidebar-item");
  const contentBoxes = document.querySelectorAll(".content-box");

  sidebarItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      sidebarItems.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      contentBoxes.forEach((box) => (box.style.display = "none"));
      const target = btn.dataset.target;
      const box = document.getElementById(target);
      if (box) box.style.display = "block";
    });
  });

  /* ======================================================
     2. AVATAR & COVER UPLOAD (FORM SUBMIT YÖNTEMİ)
  ====================================================== */
  const avatarInput = document.getElementById("avatarUpload");
  const coverInput = document.getElementById("coverUpload");

  // Profil formunu bul
  const profileForm =
    document.querySelector("form[action='/hesap/profil']") ||
    document.getElementById("profileForm");

  // Yükleme ve Kaydetme Fonksiyonu
  async function handleFileUpload(file, type) {
    if (!profileForm) {
      alert("Profil formu bulunamadı!");
      return;
    }

    try {
      document.body.style.cursor = "wait";

      // 1. ImageKit'e Yükle
      const result = await uploadProfileImage(file, type); // { url, fileId } döner

      // 2. Dönen veriyi (URL + FileID) JSON string olarak forma ekle
      let hiddenInput = profileForm.querySelector(`input[name="${type}"]`);

      if (!hiddenInput) {
        hiddenInput = document.createElement("input");
        hiddenInput.type = "hidden";
        hiddenInput.name = type; // "avatar" veya "cover"
        profileForm.appendChild(hiddenInput);
      }

      // ✅ BURASI ÇOK ÖNEMLİ: Backend JSON bekliyor, Stringify yapıyoruz.
      hiddenInput.value = JSON.stringify({
        url: result.url,
        fileId: result.fileId,
      });

      // 3. Formu Otomatik Gönder
      profileForm.submit();
    } catch (err) {
      console.error(err);
      alert("Yükleme sırasında hata oluştu: " + err.message);
      document.body.style.cursor = "default";
    }
  }

  // Event Listener'lar
  avatarInput?.addEventListener("change", (e) => {
    if (e.target.files[0]) handleFileUpload(e.target.files[0], "avatar");
  });

  coverInput?.addEventListener("change", (e) => {
    if (e.target.files[0]) handleFileUpload(e.target.files[0], "cover");
  });

  /* ======================================================
     3. HESAP SİLME MODALI
  ====================================================== */
  const deleteModal = document.getElementById("deleteModal");
  const openDeleteBtn = document.querySelector(".danger-btn");
  const cancelBtn = deleteModal?.querySelector(".cancel-btn");
  const confirmBtn = deleteModal?.querySelector(".delete-btn");

  const confirmC = document.getElementById("confirmC");
  const deletePassword = document.getElementById("deletePassword");
  const deleteForm = document.getElementById("deleteForm");
  const modalError = document.getElementById("modalError");

  /* MODAL AÇ */
  openDeleteBtn?.addEventListener("click", () => {
    if (deleteModal) deleteModal.style.display = "flex";
  });

  /* MODAL KAPAT */
  cancelBtn?.addEventListener("click", () => {
    if (deleteModal) deleteModal.style.display = "none";
  });

  /* HESABI SİL */
  confirmBtn?.addEventListener("click", () => {
    if (modalError) modalError.innerText = "";

    if (confirmC.value !== "sil") {
      if (modalError) modalError.innerText = "Onay için sil yazmalısınız";
      return;
    }

    if (!deletePassword.value) {
      if (modalError) modalError.innerText = "Şifre boş bırakılamaz";
      return;
    }

    deleteForm.submit();
  });

  /* ======================================================
     4. ŞİFRE DOĞRULAMA KUTUSU
  ====================================================== */
  const verifyBox = document.getElementById("verifyBox");
  if (verifyBox && verifyBox.dataset.show) {
    verifyBox.style.display = "block";
  }
});
