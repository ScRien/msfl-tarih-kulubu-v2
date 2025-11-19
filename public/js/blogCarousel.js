document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.getElementById("blogCarousel");
  if (!carousel) return;

  const slides = Array.from(carousel.children);
  const total = slides.length;

  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");
  const dotsContainer = document.getElementById("carouselDots");

  let index = 0;

  const updateCarousel = () => {
    carousel.style.transform = `translateX(-${index * 100}%)`;

    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll(".carousel-dot");
      dots.forEach((d, i) => {
        d.classList.toggle("active", i === index);
      });
    }
  };

  // Dots click
  if (dotsContainer) {
    dotsContainer.querySelectorAll(".carousel-dot").forEach((dot, i) => {
      dot.addEventListener("click", () => {
        index = i;
        updateCarousel();
      });
    });
  }

  // Next
  nextBtn?.addEventListener("click", () => {
    index = (index + 1) % total;
    updateCarousel();
  });

  // Prev
  prevBtn?.addEventListener("click", () => {
    index = (index - 1 + total) % total;
    updateCarousel();
  });

  // Auto-play
  setInterval(() => {
    index = (index + 1) % total;
    updateCarousel();
  }, 4000);

  updateCarousel();
});
