document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("loginModal");
  const imagesContainer = document.querySelector(".images-container");

  if (!modal || !imagesContainer) return;

  modal.style.display = "block";
  imagesContainer.classList.add("blur");
});
const imageInput = document.getElementById("image");
const preview = document.getElementById("preview");
const label = document.querySelector(".custom-file-label");

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  // Hide label
  label.classList.add("hidden");

  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.innerHTML = `
      <img src="${e.target.result}" alt="Preview Image">
      <button type="button" class="remove-btn">X</button>
    `;

    // Add remove functionality
    const removeBtn = preview.querySelector(".remove-btn");
    removeBtn.addEventListener("click", () => {
      imageInput.value = ""; // Clear file input
      preview.innerHTML = ""; // Remove preview
      label.classList.remove("hidden"); // Show label again
    });
  };
  reader.readAsDataURL(file);
});
