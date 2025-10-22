document.addEventListener("DOMContentLoaded", () => {
  const carousels = document.querySelectorAll(".carousel-container");

  carousels.forEach((carousel) => {
    const track = carousel.querySelector(".carousel-track");
    const slides = Array.from(track.children);
    const nextBtn = carousel.querySelector(".carousel-btn-right");
    const prevBtn = carousel.querySelector(".carousel-btn-left");

    let currentIndex = 0;
    const slidesPerScroll = 2;

    function updateCarousel() {
      const slideStyle = window.getComputedStyle(slides[0]);
      const slideWidth = slides[0].getBoundingClientRect().width;
      const gap = parseFloat(slideStyle.marginRight) || 0;
      const wrapperPadding = parseFloat(
        window.getComputedStyle(
          carousel.querySelector(".carousel-track-wrapper")
        ).paddingLeft
      );
      const moveAmount = (slideWidth + gap) * currentIndex - wrapperPadding;

      track.style.transform = `translateX(-${moveAmount}px)`;
    }

    nextBtn.addEventListener("click", () => {
      if (currentIndex + slidesPerScroll < slides.length) {
        currentIndex += slidesPerScroll;
      } else {
        currentIndex = slides.length - slidesPerScroll;
      }
      updateCarousel();
    });

    prevBtn.addEventListener("click", () => {
      if (currentIndex - slidesPerScroll >= 0) {
        currentIndex -= slidesPerScroll;
      } else {
        currentIndex = 0;
      }
      updateCarousel();
    });

    window.addEventListener("resize", updateCarousel);
    updateCarousel();
  });
});
