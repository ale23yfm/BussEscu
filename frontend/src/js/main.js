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
    if (wrapper.querySelector("#lines-input")) {
      setupLinesAutocomplete(wrapper);
    } else {
      setupAutocomplete(wrapper);
    }
  });

  // Preload lines data from api
  loadLinesData();

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
 * Capitalizează prima literă a fiecărui cuvânt, transformă restul literelor în lowercase
 * și păstrează cuvintele de legătură (de, pe, din, în, etc.) în lowercase dacă nu sunt primul cuvânt.
 *
 * @param {string} str - Textul introdus sau denumirea stației
 * @returns {string} - Textul formatat (ex: "facultatea DE litere" -> "Facultatea de Litere")
 */
function capitalizeStationName(str) {
  if (!str || typeof str !== "string") return "";

  // Cuvinte de legătură (prepoziții / conjuncții) care rămân cu litere mici
  const stopWords = new Set([
    "de",
    "pe",
    "din",
    "in",
    "în",
    "la",
    "cu",
    "sub",
    "spre",
    "peste",
    "după",
    "dupa",
    "și",
    "si",
    "al",
    "a",
    "ai",
    "ale",
  ]);

  return str
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      const lowerWord = word.toLowerCase();

      // Primul cuvânt este întotdeauna capitalizat;
      // Cuvintele de legătură din interior rămân lowercase
      if (index > 0 && stopWords.has(lowerWord)) {
        return lowerWord;
      }

      // Gestionează și cuvintele legate prin cratimă (ex: "C-tin" sau "Sân-Mărghita")
      if (word.includes("-")) {
        return word
          .split("-")
          .map((part, pIdx) => {
            const lowerPart = part.toLowerCase();
            if (pIdx > 0 && stopWords.has(lowerPart)) {
              return lowerPart;
            }
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
          })
          .join("-");
      }

      // Prima literă mare, restul mici
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
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

    if (query.length < 3) {
      hideSuggestions(suggestionsList);
      return;
    }

    // Call fetchSuggestions after a debounce delay (300ms)
    debounceTimer = setTimeout(() => {
      fetchSuggestions(query, suggestionsList, input);
    }, 300);
  });

  input.addEventListener("focus", () => {
    const query = input.value.trim();

    if (query.length >= 3) {
      fetchSuggestions(query, suggestionsList, input);
    }
  });

  input.addEventListener("blur", () => {
    if (input.value) {
      input.value = capitalizeStationName(input.value);
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
    const formattedStation = capitalizeStationName(station);
    const li = document.createElement("li");
    li.classList.add("dropdown-wrapper__item");
    li.textContent = formattedStation;

    li.addEventListener("click", () => {
      inputElement.value = formattedStation;
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

      const lineEndWrapper = document.createElement("div");
      lineEndWrapper.classList.add("line-end-wrapper");

      const lineEndIcon = document.createElement("span");
      lineEndIcon.classList.add("line-end-icon");

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

/**
 * Global lines data cache
 */
let linesDataCache = [];

/**
 * Load lines data from local JSON asset
 * @returns {Promise<Array>}
 */
async function loadLinesData() {
  if (linesDataCache.length > 0) return linesDataCache;

  try {
    const response = await fetch(`${endpoint}/v1/lines/`);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    linesDataCache = await response.json();

    const lines = linesDataCache.lines.map((item) =>
      String(item.number).trim().toUpperCase(),
    );

    linesDataCache = lines.sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
    );

    return linesDataCache;
  } catch (error) {
    console.error("Eroare la încărcarea lines.json:", error);
    return [];
  }
}

/**
 * Setup autocomplete & search for lines selector dropdown
 * @param {HTMLElement} wrapperElement
 */
function setupLinesAutocomplete(wrapperElement) {
  const linesInput = wrapperElement.querySelector("#lines-input");
  const suggestionsList = wrapperElement.querySelector(
    ".dropdown-wrapper__list",
  );

  if (!linesInput || !suggestionsList) return;

  async function filterAndRenderLines(query = "") {
    const allLines = await loadLinesData();

    const cleanQuery = query
      .replace(/^linia\s*/i, "")
      .trim()
      .toLowerCase();

    const filtered = cleanQuery
      ? allLines.filter((lineNo) => lineNo.toLowerCase().includes(cleanQuery))
      : allLines;

    renderLineSuggestions(filtered, suggestionsList, linesInput);
  }

  linesInput.addEventListener("focus", () => {
    filterAndRenderLines("");
  });

  linesInput.addEventListener("click", () => {
    filterAndRenderLines("");
  });

  linesInput.addEventListener("input", (e) => {
    filterAndRenderLines(e.target.value.trim());
  });
}

/**
 * Render lines autocomplete suggestions list
 * @param {Array<string>} lines
 * @param {HTMLElement} listElement
 * @param {HTMLInputElement} inputElement
 */
function renderLineSuggestions(lines, listElement, inputElement) {
  listElement.replaceChildren();

  if (lines.length === 0) {
    hideSuggestions(listElement);
    return;
  }

  lines.forEach((lineNo) => {
    const li = document.createElement("li");
    li.className = "dropdown-wrapper__item";
    li.textContent = `Linia ${lineNo}`;

    li.addEventListener("click", () => {
      inputElement.value = `Linia ${lineNo}`;
      hideSuggestions(listElement);
      renderLineCircuit(lineNo);
    });

    listElement.appendChild(li);
  });

  listElement.classList.remove("hidden");
}

/**
 * Dynamically render route stations circuit for Tur and Retur
 * @param {string} lineNumber
 */
async function renderLineCircuit(lineNumber) {
  const linesWrapper = document.querySelector(".lines-wrapper");
  const lineStartEl = document.querySelector(".line-start");
  const lineEndEl = document.querySelector(".line-end");
  const returWrapper = document.querySelector(".retur-wrapper");
  const turWrapper = document.querySelector(".tur-wrapper");

  if (!linesWrapper || !returWrapper || !turWrapper) return;

  if (!lineNumber) {
    stopCircuitTracker();
    linesWrapper.classList.add("hidden");
    return;
  }

  returWrapper.replaceChildren();
  turWrapper.replaceChildren();

  const cleanLineNo = String(lineNumber)
    .replace(/^linia\s*/i, "")
    .trim()
    .toLowerCase();

  try {
    const response = await fetch(`${endpoint}/v1/route/?line=${cleanLineNo}`);
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }
    const data = await response.json();

    const turData = data.routes.find(
      (route) => route.direction.toLowerCase() === "tur",
    );
    const returData = data.routes.find(
      (route) => route.direction.toLowerCase() === "retur",
    );

    const turStations = turData ? turData.stations : [];
    const returStations = returData ? returData.stations : [];

    if (turStations.length === 0 && returStations.length === 0) {
      stopCircuitTracker();
      linesWrapper.classList.add("hidden");
      return;
    }

    returWrapper.replaceChildren();
    turWrapper.replaceChildren();
    linesWrapper.classList.remove("hidden");

    returStations.forEach((station) => {
      const article = document.createElement("article");
      article.className = "linie-retur";

      const stationText = document.createElement("span");
      stationText.className = "station-name";
      stationText.textContent = capitalizeStationName(station);
      article.appendChild(stationText);

      returWrapper.appendChild(article);
    });

    turStations.forEach((station) => {
      const article = document.createElement("article");
      article.className = "linie-tur";

      const stationText = document.createElement("span");
      stationText.className = "station-name";
      stationText.textContent = capitalizeStationName(station);
      article.appendChild(stationText);

      turWrapper.appendChild(article);
    });

    startCircuitTracker();
  } catch (error) {
    console.log(`Error downloading route line`, error);
    stopCircuitTracker();
    linesWrapper.classList.add("hidden");
  }
}

/**
 * Animated tracker dot running infinitely clockwise along the separator border
 */
let circuitAnimFrameId = null;

function startCircuitTracker() {
  const separator = document.querySelector(".separator");
  const dot = document.querySelector(".circuit-tracker-dot");
  if (!separator || !dot) return;

  const topTerminal = separator.querySelector(".circuit-terminal--top");
  const bottomTerminal = separator.querySelector(".circuit-terminal--bottom");
  if (!topTerminal || !bottomTerminal) return;

  if (circuitAnimFrameId) {
    cancelAnimationFrame(circuitAnimFrameId);
    circuitAnimFrameId = null;
  }

  dot.classList.add("circuit-tracker-dot--active");

  let lastTimestamp = null;
  let distance = 0;
  const speed = 120; // Speed

  function animate(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    const termW = topTerminal.offsetWidth;
    const termH = topTerminal.offsetHeight;

    if (termW > 0 && termH > 0) {
      // Coordinates of the centers of the two terminal circles
      const centerX = topTerminal.offsetLeft + termW / 2;
      const topCenterY = topTerminal.offsetTop + termH / 2;
      const bottomCenterY =
        bottomTerminal.offsetTop + bottomTerminal.offsetHeight / 2;

      // Radius to the middle of the 2px border
      const radius = termW / 2 - 1;
      const straightLength = Math.max(0, bottomCenterY - topCenterY);
      const arcLength = Math.PI * radius;
      const perimeter = 2 * straightLength + 2 * arcLength;

      if (perimeter > 0) {
        distance = (distance + speed * delta) % perimeter;

        let x = 0;
        let y = 0;
        let angleDeg = 90;

        // 1. Descending on the right rail (Tur - clockwise)
        if (distance < straightLength) {
          x = centerX + radius;
          y = topCenterY + distance;
          angleDeg = 90;
        }
        // 2. Bottom loop (clockwise semicircle: right -> left)
        else if (distance < straightLength + arcLength) {
          const s = distance - straightLength;
          const phi = s / radius;
          x = centerX + radius * Math.cos(phi);
          y = bottomCenterY + radius * Math.sin(phi);
          angleDeg = 90 + (phi * 180) / Math.PI;
        }
        // 3. Ascending on the left rail (Retur - clockwise)
        else if (distance < 2 * straightLength + arcLength) {
          const s = distance - (straightLength + arcLength);
          x = centerX - radius;
          y = bottomCenterY - s;
          angleDeg = 270;
        }
        // 4. Top loop (clockwise semicircle: left -> right)
        else {
          const s = distance - (2 * straightLength + arcLength);
          const phi = s / radius;
          x = centerX - radius * Math.cos(phi);
          y = topCenterY - radius * Math.sin(phi);
          angleDeg = 270 + (phi * 180) / Math.PI;
        }

        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
        dot.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg)`;
      }
    }

    circuitAnimFrameId = requestAnimationFrame(animate);
  }

  requestAnimationFrame(() => {
    circuitAnimFrameId = requestAnimationFrame(animate);
  });
}

function stopCircuitTracker() {
  if (circuitAnimFrameId) {
    cancelAnimationFrame(circuitAnimFrameId);
    circuitAnimFrameId = null;
  }
  const dot = document.querySelector(".circuit-tracker-dot");
  if (dot) {
    dot.classList.remove("circuit-tracker-dot--active");
  }
}
