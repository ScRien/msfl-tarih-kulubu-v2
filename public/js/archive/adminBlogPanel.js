// ------------ DÜZENLE MODAL ----------------
function openBlogEditModal(id, title, content, published) {
  document.getElementById("blogEditModal").style.display = "flex";
  document.getElementById("editBlogTitle").value = title;
  document.getElementById("editBlogContent").value = content;
  document.getElementById("editBlogPublished").checked = (published === "true" || published === true);

  document.getElementById("blogEditForm").action = `/admin/blog/${id}/duzenle`;
}

function closeBlogEditModal() {
  document.getElementById("blogEditModal").style.display = "none";
}

// ------------ SİL MODAL ----------------
function openBlogDeleteModal(id) {
  document.getElementById("blogDeleteModal").style.display = "flex";
  document.getElementById("blogDeleteForm").action = `/admin/blog/${id}/sil`;
}

function closeBlogDeleteModal() {
  document.getElementById("blogDeleteModal").style.display = "none";
}
