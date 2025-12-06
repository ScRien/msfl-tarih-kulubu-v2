/* ======================================================
   HESAP – MODÜL UYUMLU / MODAL FIX ✅
====================================================== */

import { uploadProfileImage } from "./uploadClient.js";

/* ======================================================
   GENEL ELEMENTLER
====================================================== */
const sidebarItems = document.querySelectorAll(".sidebar-item");
const contentBoxes = document.querySelectorAll(".content-box");

const avatarInput = document.getElementById("avatarUpload");
const coverInput = document.getElementById("coverUpload");

const avatarPreview = document.getElementById("avatarPreview");
const coverPreview = document.getElementById("coverPreview");

/* ======================================================
   SIDEBAR GEÇİŞLERİ
====================================================== */
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
   AVATAR / COVER UPLOAD
====================================================== */
async function handleProfileUpload(file, type) {
  try {
    const { url, fileId } = await uploadProfileImage(file, type);

    const res = await fetch("/profile-media", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, url, fileId }),
    });

    if (!res.ok) throw new Error("Medya kaydedilemedi");

    if (type === "avatar" && avatarPreview) avatarPreview.src = url;
    if (type === "cover" && coverPreview) coverPreview.src = url;
  } catch (err) {
    alert("❌ Yükleme başarısız");
    console.error(err);
  }
}

avatarInput?.addEventListener("change", (e) => {
  if (e.target.files[0]) handleProfileUpload(e.target.files[0], "avatar");
});

coverInput?.addEventListener("change", (e) => {
  if (e.target.files[0]) handleProfileUpload(e.target.files[0], "cover");
});

/* ======================================================
   HESAP SİLME MODALI — ASIL MESELE BURASI ✅
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
  modalError.innerText = "";

  if (confirmC.value !== "sil") {
    modalError.innerText = "Onay için sil yazmalısınız";
    return;
  }

  if (!deletePassword.value) {
    modalError.innerText = "Şifre boş bırakılamaz";
    return;
  }

  deleteForm.submit();
});

/* ======================================================
   ŞİFRE DOĞRULAMA GÖSTER
====================================================== */
const verifyBox = document.getElementById("verifyBox");
if (verifyBox && verifyBox.dataset.show) {
  verifyBox.style.display = "block";
}
