// Mock route details (line start and end endpoints)
const mockRouteDetails = {
  4: { start: "Aurel Vlaicu", end: "Gara" },
  5: { start: "Aurel Vlaicu", end: "Piața Gării" },
  6: { start: "Bucium", end: "Aurel Vlaicu" },
  7: { start: "Decebal", end: "Izlazului" },
  "24b": { start: "Vivo", end: "Univerisitate" },
  25: { start: "Bucium", end: "Univerisitate" },
  30: { start: "Aurel Vlaicu", end: "Cart. Grigorescu" },
  "39b": { start: "Piața Gării", end: "Chinteni" },
  "46b": { start: "Zorilor", end: "Aurel Vlaicu" },
  48: { start: "Aurel Vlaicu", end: "Bulevardul Muncii" },
};

// Mock connections between stations
const mockConnections = [
  {
    from: "Aurel Vlaicu",
    to: "Memorandumului Nord",
    lines: ["6", "30"],
  },
  {
    from: "Arte Plastice",
    to: "Memorandumului Nord",
    lines: ["24b", "6", "30"],
  },
  {
    from: "Aurel Vlaicu",
    to: "Arte Plastice",
    lines: ["4", "5", "6", "30", "46b"],
  },
  {
    from: "Aurel Vlaicu",
    to: "Avram Iancu",
    lines: ["6", "25", "39b"],
  },
];

document.addEventListener("DOMContentLoaded", () => {
  initTheme();

  const themeToggleButton = document.querySelector(".theme-toggle");
  if (themeToggleButton) {
    themeToggleButton.addEventListener("click", toggleTheme);
  }

  const dropdownWrappers = document.querySelectorAll(".dropdown-wrapper");
  dropdownWrappers.forEach((wrapper) => {
    setupAutocomplete(wrapper);
  });

  // Close dropdown on outside click
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

  // Search button handler
  const searchButton = document.querySelector('button[type="submit"]');
  if (searchButton) {
    searchButton.addEventListener("click", (e) => {
      e.preventDefault();
      handleSearch();
    });
  }
});

// Theme initialization
function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
  const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

  document.documentElement.setAttribute("data-theme", initialTheme);
  updateThemeIcon(initialTheme);
}

// Theme toggle
function toggleTheme() {
  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "light";
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeIcon(newTheme);
}

/**
 * Update theme toggle button icon based on active theme
 * @param {string} theme
 */

function updateThemeIcon(theme) {
  const themeToggleButton = document.querySelector(".theme-toggle");
  if (!themeToggleButton) return;

  if (theme === "dark") {
    themeToggleButton.innerHTML = '<i class="ri-sun-line"></i>';
  } else {
    themeToggleButton.innerHTML = '<i class="ri-moon-line"></i>';
  }
}

/**
 * Init autocomplete logic for single dropdown wrapper
 * @param {HTMLElement} wrapperElement
 */

function setupAutocomplete(wrapperElement) {
  const input = wrapperElement.querySelector(".search-input");
  const suggestionsList = wrapperElement.querySelector(
    ".dropdown-wrapper__list",
  );

  if (!input || !suggestionsList) return;

  let debounceTimer = null;

  input.addEventListener("input", (e) => {
    const query = e.target.value.trim();

    clearTimeout(debounceTimer);

    if (query.length < 2) {
      hideSuggestions(suggestionsList);
      return;
    }

    // Call fetchSuggestions after a debounce delay
    debounceTimer = setTimeout(() => {
      fetchSuggestions(query, suggestionsList, input);
    }, 500);
  });

  input.addEventListener("focus", () => {
    const query = input.value.trim();

    if (query.length >= 2) {
      fetchSuggestions(query, suggestionsList, input);
    }
  });
}

/**
 * Temporary Mock Data
 * @param {string} query
 * @param {HTMLElement} listElement
 * @param {HTMLInputElement} inputElement
 */

async function fetchSuggestions(query, listElement, inputElement) {
  try {
    const mockStations = [
      "Aurel Vlaicu",
      "Aurel Vlaicu Sud",
      "Automobilia",
      "Auchan Iris",
      "Memorandumului Nord",
      "Memorandumului Sud",
      "Mehedinți",
      "Mecanică",
      "Arte Plastice",
      "Avram Iancu",
      "Piața Gării",
      "Piața Mihai Viteazul",
      "Iulius Mall Nord",
      "Calea Florești",
      "Bucium",
      "Observatorului Sud",
    ];
    const filtered = mockStations.filter((station) =>
      station.toLowerCase().includes(query.toLowerCase()),
    );
    renderSuggestions(filtered, listElement, inputElement);
  } catch (error) {
    console.error("Error fetching stations: ", error);
  }
}

/**
 * Render suggestions
 * @param {Array<string>} stations
 * @param {HTMLElement} listElement
 * @param {HTMLInputElement} inputElement
 */

function renderSuggestions(stations, listElement, inputElement) {
  listElement.innerHTML = "";

  if (stations.length === 0) {
    hideSuggestions(listElement);
    return;
  }

  stations.forEach((station) => {
    const li = document.createElement("li");
    li.classList.add("dropdown-wrapper__item");
    li.textContent = station;

    li.addEventListener("click", () => {
      inputElement.value = station;
      hideSuggestions(listElement);
    });

    listElement.appendChild(li);
  });

  listElement.classList.remove("hidden");
}

/**
 * Empty search results handler
 * @param {HTMLElement} listElement
 */

function hideSuggestions(listElement) {
  listElement.classList.add("hidden");
  listElement.innerHTML = "";
}

/**
 * Process route search between starting and destination station
 */

function handleSearch() {
  const searchInputs = document.querySelectorAll(".search-input");
  const resultsContainer = document.querySelector(".results-wrapper__result");

  if (!resultsContainer) return;

  const startStation = searchInputs[0] ? searchInputs[0].value.trim() : "";
  const endStation = searchInputs[1] ? searchInputs[1].value.trim() : "";

  if (!startStation || !endStation) {
    resultsContainer.innerHTML = `
      <p class="results-message results-message--error">Vă rugăm să selectați ambele stații (plecare și destinație).</p>
    `;
    return;
  }

  if (startStation.toLowerCase() === endStation.toLowerCase()) {
    resultsContainer.innerHTML = `
      <p class="results-message results-message--warning">Stația de plecare și destinația trebuie să fie diferite.</p>
    `;
    return;
  }

  const connection = findConnection(startStation, endStation);

  if (connection && connection.lines.length > 0) {
    const linesHTML = connection.lines
      .map((lineNo) => {
        const details = mockRouteDetails[lineNo] || {
          start: "Început linie",
          end: "Sfârșit linie",
        };
        return `
        <div class="result-card">
          <span class="result-card__line">${lineNo}</span>
          <span class="result-card__route">${details.start} / ${details.end}</span>
        </div>
      `;
      })
      .join("");

    resultsContainer.innerHTML = `
      <div class="results-header">Linii disponibile:</div>
      <div class="results-list">${linesHTML}</div>
    `;
  } else {
    resultsContainer.innerHTML = `
      <p class="results-message">Nu s-a găsit nicio linie directă între <strong>${startStation}</strong> și <strong>${endStation}</strong>.</p>
    `;
  }
}

/**
 * Find connections between two stations
 * @param {string} fromStation
 * @param {string} toStation
 * @returns {Object|null}
 */

function findConnection(fromStation, toStation) {
  const fromLower = fromStation.toLowerCase();
  const toLower = toStation.toLowerCase();

  return (
    mockConnections.find(
      (conn) =>
        (conn.from.toLowerCase() === fromLower &&
          conn.to.toLowerCase() === toLower) ||
        (conn.from.toLowerCase() === toLower &&
          conn.to.toLowerCase() === fromLower),
    ) || null
  );
}
