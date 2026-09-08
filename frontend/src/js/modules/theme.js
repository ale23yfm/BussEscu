/**
 * Theme management module
 */

/**
 * Update theme toggle button icon and tooltip based on active theme
 * @param {string} theme
 */
export function updateThemeIcon(theme) {
  const themeToggleButton = document.querySelector(".theme-toggle");
  if (!themeToggleButton) return;

  if (theme === "dark") {
    themeToggleButton.innerHTML = '<i class="ri-sun-line"></i>';
    themeToggleButton.setAttribute("data-tooltip", "Temă luminoasă");
  } else {
    themeToggleButton.innerHTML = '<i class="ri-moon-line"></i>';
    themeToggleButton.setAttribute("data-tooltip", "Temă întunecată");
  }
}

/**
 * Initialize saved or default theme
 */
export function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  const initialTheme = savedTheme || "dark";

  document.documentElement.setAttribute("data-theme", initialTheme);
  updateThemeIcon(initialTheme);
}

/**
 * Toggle between dark and light theme
 */
export function toggleTheme() {
  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "dark";
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeIcon(newTheme);
}
