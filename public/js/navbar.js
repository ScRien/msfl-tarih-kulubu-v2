document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navRight = document.querySelector(".nav-right");

  hamburger.addEventListener("click", (e) => {
    e.stopPropagation(); // Tıklama kabarcıklanmasın
    navRight.classList.toggle("active");
  });

  // Menü dışına tıklayınca kapat
  document.addEventListener("click", (e) => {
    if (!navRight.contains(e.target)) {
      navRight.classList.remove("active");
    }
  });
});
