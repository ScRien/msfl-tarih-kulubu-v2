// -------- Düzenleme Modalı --------
function openCommentEditModal(id, content) {
  document.getElementById("commentEditModal").style.display = "flex";
  document.getElementById("editCommentContent").value = content;
  document.getElementById("commentEditForm").action = `/admin/yorum/${id}/duzenle`;
}

function closeCommentEditModal() {
  document.getElementById("commentEditModal").style.display = "none";
}

// -------- Silme Modalı --------
function openCommentDeleteModal(id) {
  document.getElementById("commentDeleteModal").style.display = "flex";
  document.getElementById("commentDeleteForm").action = `/admin/yorum/${id}/sil`;
}

function closeCommentDeleteModal() {
  document.getElementById("commentDeleteModal").style.display = "none";
}
