document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("navMenu");
  const closeMenu = document.getElementById("closeMenu");

  // HAMBURGER AÇ
  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    navMenu.classList.add("active");
  });

  // X BUTONU → KAPAT
  closeMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    navMenu.classList.remove("active");
  });

  // MENÜ DIŞINA TIKLA → KAPAT
  document.addEventListener("click", (e) => {
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
      navMenu.classList.remove("active");
    }
  });
});
  