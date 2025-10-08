document.addEventListener("DOMContentLoaded", () => {
  const carousels = document.querySelectorAll(".carousel-container");

  carousels.forEach((carousel) => {
    const track = carousel.querySelector(".carousel-track");
    const slides = Array.from(track.children);
    const nextBtn = carousel.querySelector(".carousel-btn.right");
    const prevBtn = carousel.querySelector(".carousel-btn.left");

    let currentIndex = 0;
    const visibleSlides = 3;

    function updateCarousel() {
      const slideWidth = slides[0].getBoundingClientRect().width;
      track.style.transition = "transform 0.3s ease";
      track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    }

    nextBtn.addEventListener("click", () => {
      if (currentIndex + visibleSlides < slides.length) {
        currentIndex++;
        updateCarousel();
      }
    });

    prevBtn.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });

    window.addEventListener("resize", updateCarousel);
    updateCarousel();
  });
});
