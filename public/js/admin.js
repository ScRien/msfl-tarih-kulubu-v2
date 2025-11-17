function openModal(title, text, action, fields = [], mode = "edit") {
  document.getElementById("modal").style.display = "flex";
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalText").innerText = text;

  const form = document.getElementById("modalForm");
  form.action = action;

  const fieldsDiv = document.getElementById("modalFields");
  fieldsDiv.innerHTML = "";

  fields.forEach(f => {
    fieldsDiv.innerHTML += `
      <input type="${f.type}"
             name="${f.name}"
             value="${f.value || ""}"
             placeholder="${f.placeholder}"
             required />
    `;
  });

  // Modlara göre buton görünürlüğü
  document.getElementById("modalSave").style.display =
    mode === "edit" ? "inline-block" : "none";

  document.getElementById("modalDelete").style.display =
    mode === "delete" ? "inline-block" : "none";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function openEdit(id) {
  openModal("Blog Düzenle", "", `/admin/blog/${id}/duzenle`, [
    {type:"text", name:"title", placeholder:"Başlık"},
    {type:"text", name:"content", placeholder:"İçerik"}
  ], "edit");
}

function openDelete(id) {
  openModal("Blog Sil", "Bu işlem geri alınamaz!", `/admin/blog/${id}/sil`, [], "delete");
}


function openUserEdit(id) {
  openModal("Kullanıcı Düzenle", "", `/admin/kullanici/${id}/duzenle`, [
    {type:"text", name:"name", placeholder:"Ad"},
    {type:"text", name:"surname", placeholder:"Soyad"},
    {type:"email", name:"email", placeholder:"Email"},
  ], "edit");
}

function openUserDelete(id) {
  openModal("Kullanıcı Sil", "Tüm içerikleriyle birlikte silinecek!", 
    `/admin/kullanici/${id}/sil`, [], "delete");
}


function openCommentEdit(id) {
  openModal("Yorum Düzenle", "", `/admin/yorum/${id}/duzenle`, [
    {type:"text", name:"content", placeholder:"Yorum"}
  ], "edit");
}

function openCommentDelete(id) {
  openModal("Yorum Sil", "Bu işlem geri alınamaz!", `/admin/yorum/${id}/sil`, [], "delete");
}
