const track = document.querySelector(".carousel-track");
const slides = Array.from(track.children);
let currentIndex = 0;

const updateCarousel = () => {
  const slideWidth = slides[0].getBoundingClientRect().width;
  const gap =
    parseFloat(getComputedStyle(track).gap) ||
    0; /* this part chat gpt helped with 7-9*/
  const moveAmount = currentIndex * (slideWidth + gap);
  track.style.transform = `translateX(-${moveAmount}px)`;
};

document.querySelector(".carousel-btn-left").addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    updateCarousel();
  }
});

document.querySelector(".carousel-btn-right").addEventListener("click", () => {
  if (currentIndex < slides.length - 2) {
    currentIndex++;
    updateCarousel();
  }
});

window.addEventListener("resize", updateCarousel);
