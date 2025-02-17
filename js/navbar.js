document.addEventListener("DOMContentLoaded", function () {
  fetch("/components/navbar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("navbar-container").innerHTML = data;

      // ✅ Wait until navbar is loaded, THEN add event listener
      const menuToggle = document.querySelector(".menu-toggle");
      const navLinks = document.querySelector(".nav-links");

      if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
          navLinks.style.display = navLinks.style.display === "flex" ? "none" : "flex";
        });
      } else {
        console.error("Navbar elements not found! Check if .menu-toggle and .nav-links exist.");
      }
    })
    .catch(error => console.error("Error loading navbar:", error));
});
