import { initTheme, toggleTheme } from "./modules/theme.js";
import { setupAutocomplete } from "./modules/autocomplete.js";
import { setupLinesAutocomplete } from "./modules/lines.js";
import { handleSearch } from "./modules/search.js";
import { loadLinesData } from "./services/api.js";
import { hideSuggestions } from "./utils/ui.js";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();

  const themeToggleButton = document.querySelector(".theme-toggle");
  if (themeToggleButton) {
    themeToggleButton.addEventListener("click", toggleTheme);
  }

  // 2. Setup Dropdown Autocompletes (Stations & Lines)
  const dropdownWrappers = document.querySelectorAll(".dropdown-wrapper");
  dropdownWrappers.forEach((wrapper) => {
    if (wrapper.querySelector("#lines-input")) {
      setupLinesAutocomplete(wrapper);
    } else {
      setupAutocomplete(wrapper);
    }
  });

  // 3. Preload Lines Data into Cache
  loadLinesData();

  // 4. Close Dropdowns on Outside Click
  document.addEventListener("click", (e) => {
    dropdownWrappers.forEach((wrapper) => {
      if (!wrapper.contains(e.target)) {
        const listElement = wrapper.querySelector(".dropdown-wrapper__list");
        if (listElement) {
          hideSuggestions(listElement);
        }
      }
    });
  });

  // 5. Search Button Handler
  const searchButton = document.querySelector('button[type="submit"]');
  if (searchButton) {
    searchButton.addEventListener("click", (e) => {
      e.preventDefault();
      handleSearch();
    });
  }
});
