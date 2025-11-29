/* ======================================================
   HESAP – TAM PROFESYONEL SÜRÜM
   - API tabanlı
   - ImageKit uyumlu
   - CSRF yok (API)
====================================================== */

import { uploadProfileImage } from "./uploadClient.js";

/* ======================================================
   ELEMENTLER
====================================================== */
const sidebarItems = document.querySelectorAll(".sidebar-item");
const contentBoxes = document.querySelectorAll(".content-box");

const avatarInput = document.querySelector("#avatarUpload");
const coverInput = document.querySelector("#coverUpload");

const avatarPreview = document.querySelector("#avatarPreview");
const coverPreview = document.querySelector("#coverPreview");

const globalLoader = document.querySelector("#globalLoader");

/* ======================================================
   SIDEBAR GEÇİŞLERİ
====================================================== */
sidebarItems.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.classList.contains("disabled")) return;

    sidebarItems.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    contentBoxes.forEach((box) => (box.style.display = "none"));

    const target = btn.dataset.target;
    const box = document.getElementById(target);
    if (box) box.style.display = "block";
  });
});

/* ======================================================
   GLOBAL LOADER
====================================================== */
function showLoader() {
  if (globalLoader) globalLoader.style.display = "flex";
}

function hideLoader() {
  if (globalLoader) globalLoader.style.display = "none";
}

/* ======================================================
   AVATAR & COVER UPLOAD
====================================================== */
async function handleProfileUpload(file, type) {
  try {
    showLoader();

    // 1️⃣ ImageKit upload
    const { url, fileId } = await uploadProfileImage(file, type);

    // 2️⃣ Backend'e bildir
    const res = await fetch("/api/profile-media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        type,     // avatar | cover
        url,
        fileId,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Medya kaydedilemedi");
    }

    const data = await res.json();
    if (!data.success) throw new Error("Sunucu hatası");

    // 3️⃣ Önizleme güncelle
    if (type === "avatar") avatarPreview.src = url;
    if (type === "cover") coverPreview.src = url;
  } catch (err) {
    alert("❌ Yükleme başarısız:\n" + err.message);
    console.error(err);
  } finally {
    hideLoader();
  }
}

/* ======================================================
   INPUT EVENTLERİ
====================================================== */
if (avatarInput) {
  avatarInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) handleProfileUpload(file, "avatar");
  });
}

if (coverInput) {
  coverInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) handleProfileUpload(file, "cover");
  });
}

/* ======================================================
   HESAP SİLME MODAL
====================================================== */
window.openDeleteModal = () => {
  document.getElementById("deleteModal").style.display = "flex";
};

window.closeDeleteModal = () => {
  document.getElementById("deleteModal").style.display = "none";
};

window.confirmDelete = async () => {
  const input = document.getElementById("confirmC");
  const pass = document.getElementById("deletePassword");

  if (!input || !pass) return;

  if (input.value !== "C") {
    document.getElementById("modalError").innerText =
      "Onay için C harfini yazmalısınız";
    return;
  }

  if (!pass.value) {
    document.getElementById("modalError").innerText =
      "Şifre boş olamaz";
    return;
  }

  document.getElementById("deleteForm").submit();
};
