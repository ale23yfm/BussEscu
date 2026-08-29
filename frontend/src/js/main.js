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

const endpoint = CONFIG.API_BASE_URL;

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
  const initialTheme = savedTheme || "dark";

  document.documentElement.setAttribute("data-theme", initialTheme);
  updateThemeIcon(initialTheme);
}

// Theme toggle
function toggleTheme() {
  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "dark";
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

/**
 * Show loading spinner inside dropdown list
 * @param {HTMLElement} listElement
 */
function showDropdownLoader(listElement) {
  listElement.replaceChildren();

  const item = document.createElement("li");
  item.className = "dropdown-wrapper__item dropdown-wrapper__item--loader";
  item.style.textAlign = "center";
  item.style.padding = "1.2rem";

  const loader = document.createElement("span");
  loader.className = "loader loader--small";

  item.appendChild(loader);
  listElement.appendChild(item);
  listElement.classList.remove("hidden");
}

/**
 * Show loading spinner inside route results wrapper
 * @param {HTMLElement} resultsWrapper
 */
function showResultsLoader(resultsWrapper) {
  resultsWrapper.replaceChildren();

  const container = document.createElement("div");
  container.className = "results-loader-container";
  container.style.display = "flex";
  container.style.justifyContent = "center";
  container.style.padding = "2.4rem";

  const loader = document.createElement("span");
  loader.className = "loader";

  container.appendChild(loader);
  resultsWrapper.appendChild(container);
}

let apiStationsCache = [];

async function fetchSuggestions(query, listElement, inputElement) {
  showDropdownLoader(listElement);

  try {
    if (apiStationsCache.length === 0) {
      const response = await fetch(`${endpoint}/v1/stations/`);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      apiStationsCache = data.map((station) => station.name);
    }

    const filtered = apiStationsCache.filter((stationName) =>
      stationName.toLowerCase().includes(query.toLowerCase()),
    );

    renderSuggestions(filtered, listElement, inputElement);
  } catch (error) {
    console.error("Error fetching stations: ", error);
    hideSuggestions(listElement);
  }
}

/**
 * Render suggestions
 * @param {Array<string>} stations
 * @param {HTMLElement} listElement
 * @param {HTMLInputElement} inputElement
 */

function renderSuggestions(stations, listElement, inputElement) {
  listElement.replaceChildren();

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
  listElement.replaceChildren();
}

function handleSearch() {
  const searchInputs = document.querySelectorAll(".search-input");
  const resultsHeading = document.querySelector(".results__heading");
  const resultsTitle = document.querySelector(".results__title");
  const resultsIcon = document.querySelector(".results__icon");
  const resultsWrapper = document.querySelector(".results__wrapper");

  if (!resultsWrapper || !resultsHeading || !resultsTitle) return;

  // Show heading section and loader upon search trigger
  resultsHeading.classList.remove("hidden");
  showResultsLoader(resultsWrapper);

  const startStation = searchInputs[0] ? searchInputs[0].value.trim() : "";
  const endStation = searchInputs[1] ? searchInputs[1].value.trim() : "";

  setTimeout(() => {
    resultsWrapper.replaceChildren();

    // 1. Both stations must be selected
    if (!startStation || !endStation) {
      resultsTitle.textContent = "Selectează stațiile de plecare și sosire";
      if (resultsIcon) resultsIcon.style.display = "none";
      return;
    }

    const isSameStation =
      startStation.toLowerCase() === endStation.toLowerCase();
    const connection = findConnection(startStation, endStation);

    // 2. Same station or no direct line connection found
    if (
      isSameStation ||
      !connection ||
      !connection.lines ||
      connection.lines.length === 0
    ) {
      resultsTitle.textContent = "Nicio linie validă";
      if (resultsIcon) resultsIcon.style.display = "none";
      return;
    }

    // 3. Valid lines!
    resultsTitle.textContent = "Linii valide";
    if (resultsIcon) resultsIcon.style.display = "block";

    connection.lines.forEach((lineNo) => {
      const details = mockRouteDetails[lineNo] || {
        start: startStation,
        end: endStation,
      };

      const card = document.createElement("div");
      card.classList.add("results__wrapper__card");

      const badge = document.createElement("span");
      badge.className = "badge line-number";
      badge.textContent = lineNo;

      const lineDetails = document.createElement("div");
      lineDetails.classList.add("line-details");

      const lineStart = document.createElement("h3");
      lineStart.classList.add("line-start");
      lineStart.textContent = details.start;

      const lineEndWrapper = document.createElement("div");
      lineEndWrapper.classList.add("line-end-wrapper");

      const lineEndIcon = document.createElement("span");
      lineEndIcon.classList.add("line-end-icon");

      const lineEnd = document.createElement("h3");
      lineEnd.classList.add("line-end");
      lineEnd.textContent = details.end;

      lineEndWrapper.append(lineEndIcon, lineEnd);
      lineDetails.append(lineStart, lineEndWrapper);
      card.append(badge, lineDetails);

      resultsWrapper.append(card);
    });
  }, 400);
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
