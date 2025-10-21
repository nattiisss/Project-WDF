document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("loginModal");
  const imagesContainer = document.querySelector(".images-container");

  if (!modal || !imagesContainer) return; /* this part chat gpt helped with */

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
  const reader = new FileReader(); /* this part chat gpt helped with */
  reader.onload = (e) => {
    preview.innerHTML = `
      <img src="${e.target.result}" alt="Preview Image">
      <button type="button" class="remove-btn">X</button>
    `;

    // remove functionality
    const removeBtn = preview.querySelector(".remove-btn");
    removeBtn.addEventListener("click", () => {
      imageInput.value = "";
      preview.innerHTML = "";
      label.classList.remove("hidden");
    });
  };
  reader.readAsDataURL(file);
});
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("image");
  const filenameInput = document.getElementById("filename");
  const previewContainer = document.getElementById("preview");

  // Save the original filename
  const originalFilename = filenameInput.value;

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      filenameInput.value = file.name;

      const reader = new FileReader();
      reader.onload = (e) => {
        previewContainer.innerHTML = `
          <img src="${e.target.result}" alt="Preview">
          <button type="button" class="remove-btn">Remove</button>
        `;
        document.querySelector(".custom-file-label").classList.add("hidden");
      };
      reader.readAsDataURL(file);
    }
  });

  // Reset to original when button is clicked
  previewContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove-btn")) {
      previewContainer.innerHTML = "";
      fileInput.value = "";
      filenameInput.value = originalFilename;
      document.querySelector(".custom-file-label").classList.remove("hidden");
    }
  });
});
