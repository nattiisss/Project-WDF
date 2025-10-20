const profileIcon = document.getElementById("profileIcon");
const menu = document.getElementById("menu");

if (profileIcon && menu) {
  profileIcon.addEventListener("click", () => {
    menu.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!profileIcon.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove("show");
    }
  });
}
