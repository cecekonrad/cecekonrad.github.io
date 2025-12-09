document.addEventListener("DOMContentLoaded", function () {
  const body = document.body;
  const toggle = document.querySelector(".theme-toggle");

  const savedTheme = localStorage.getItem("theme");
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  let currentTheme = savedTheme || (prefersDark ? "dark" : "light");

  function setTheme(theme) {
    if (theme === "dark") {
      body.classList.add("theme-dark");
      if (toggle) {
        toggle.textContent = "light mode";
        toggle.setAttribute("aria-pressed", "true");
      }
    } else {
      body.classList.remove("theme-dark");
      if (toggle) {
        toggle.textContent = "dark mode";
        toggle.setAttribute("aria-pressed", "false");
      }
    }
  }

  setTheme(currentTheme);

  if (toggle) {
    toggle.addEventListener("click", function () {
      currentTheme = currentTheme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", currentTheme);
      setTheme(currentTheme);
    });
  }

  const navLinks = document.querySelectorAll(".site-nav a.nav-link[href]");
  const currentPath = window.location.pathname.split("/").pop() || "wa15home.html";

  navLinks.forEach((link) => {
    const linkPath = link.getAttribute("href");
    if (linkPath === currentPath) {
      link.classList.add("is-active");
    } else {
      link.classList.remove("is-active");
    }
  });
});