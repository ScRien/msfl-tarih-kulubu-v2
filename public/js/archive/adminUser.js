function openUserEditModal(id, name, surname, email) {
  document.getElementById("userEditModal").style.display = "flex";
  document.getElementById("editUserName").value = name;
  document.getElementById("editUserSurname").value = surname;
  document.getElementById("editUserEmail").value = email;

  document.getElementById("userEditForm").action = `/admin/kullanici/${id}/duzenle`;
}

function closeUserEditModal() {
  document.getElementById("userEditModal").style.display = "none";
}

function openUserDeleteModal(id) {
  document.getElementById("userDeleteModal").style.display = "flex";
  document.getElementById("userDeleteForm").action = `/admin/kullanici/${id}/sil`;
}

function closeUserDeleteModal() {
  document.getElementById("userDeleteModal").style.display = "none";
}
