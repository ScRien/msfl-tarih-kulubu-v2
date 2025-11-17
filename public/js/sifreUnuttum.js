document.addEventListener("DOMContentLoaded", () => {
  const verifyForm = document.getElementById("verifyForm");
  const newPassForm = document.getElementById("newPassForm");

  if (verifyForm && verifyForm.style.display === "block") {
    verifyForm.scrollIntoView({ behavior: "smooth" });
  }

  if (newPassForm && newPassForm.style.display === "block") {
    newPassForm.scrollIntoView({ behavior: "smooth" });
  }
});
