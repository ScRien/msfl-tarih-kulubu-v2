// Modal açma
function openModal(id) {
  document.getElementById(id).style.display = "flex";
}

// Modal kapatma
function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

// Edit modal açma
document.querySelectorAll(".edit-user-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.getElementById("editUserId").value = btn.dataset.id;
    document.getElementById("editName").value = btn.dataset.name;
    document.getElementById("editSurname").value = btn.dataset.surname;
    document.getElementById("editEmail").value = btn.dataset.email;

    openModal("editUserModal");
  });
});

// Delete modal açma
document.querySelectorAll(".delete-user-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.getElementById("deleteUserId").value = btn.dataset.id;
    openModal("deleteUserModal");
  });
});

// Kapatma butonları
document.querySelectorAll(".modal-close").forEach((btn) => {
  btn.addEventListener("click", () => {
    closeModal(btn.dataset.close);
  });
});
