document.addEventListener("DOMContentLoaded", () => {
  const alerts = document.querySelectorAll("[data-alert]");
  if (!alerts.length) return;

  // 🔁 Aynı anda sadece 1 alert
  if (alerts.length > 1) {
    alerts.forEach((alert, i) => {
      if (i !== alerts.length - 1) alert.remove();
    });
  }

  const alert = alerts[alerts.length - 1];
  const closeBtn = alert.querySelector(".close");

  closeBtn?.addEventListener("click", () => closeAlert(alert));

  setTimeout(() => {
    closeAlert(alert);
  }, 4000);

  function closeAlert(el) {
    if (!el || el.classList.contains("hide")) return;

    el.classList.add("hide");

    setTimeout(() => {
      el.remove();
      cleanUrl(); // 🧹 URL temizle
    }, 350);
  }

  // ================================
  // 🧹 URL CLEANER
  // ================================
  function cleanUrl() {
    const url = new URL(window.location.href);

    // sadece alert parametrelerini sil
    url.searchParams.delete("error");
    url.searchParams.delete("success");

    window.history.replaceState({}, document.title, url.pathname + url.search);
  }
});
