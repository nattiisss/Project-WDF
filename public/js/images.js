document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("loginModal");
  const imagesContainer = document.querySelector(".images-container");

  if (!modal || !imagesContainer) return;

  modal.style.display = "block";
  imagesContainer.classList.add("blur");
});
