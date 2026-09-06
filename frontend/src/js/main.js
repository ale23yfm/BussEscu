const endpoint = CONFIG.API_BASE_URL;

let apiStationsCache = [];
let linesDataCache = [];

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

  // Preload lines data from api (single cached request)
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
    themeToggleButton.setAttribute("data-tooltip", "Temă luminoasă");
  } else {
    themeToggleButton.innerHTML = '<i class="ri-moon-line"></i>';
    themeToggleButton.setAttribute("data-tooltip", "Temă întunecată");
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
 * Init autocomplete logic for station input dropdowns
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
 * Show a hint message inside the dropdown
 * @param {string} message
 * @param {HTMLElement} listElement
 */
function renderHintMessage(message, listElement) {
  listElement.replaceChildren();

  const li = document.createElement("li");
  li.className = "dropdown-wrapper__item dropdown-wrapper__item--hint";
  li.style.textAlign = "center";
  li.style.padding = "1.2rem";
  li.style.color = "var(--results-heading-color)";
  li.style.opacity = "0.75";
  li.style.pointerEvents = "none";
  li.textContent = message;

  listElement.appendChild(li);
  listElement.classList.remove("hidden");
}

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

/**
 * Fetch station suggestions with single cached request
 * @param {string} query
 * @param {HTMLElement} listElement
 * @param {HTMLInputElement} inputElement
 */
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
 * Render suggestions in dropdown list
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

/**
 * Handle live search between departure and destination stations using v1/search endpoint
 */
async function handleSearch() {
  const startInput = document.querySelector("#start-station");
  const endInput = document.querySelector("#end-station");
  const resultsHeading = document.querySelector(".results__heading");
  const resultsTitle = document.querySelector(".results__title");
  const resultsIcon = document.querySelector(".results__icon");
  const resultsWrapper = document.querySelector(".results__wrapper");

  if (!resultsWrapper || !resultsHeading || !resultsTitle) return;

  const startStation = startInput ? startInput.value.trim() : "";
  const endStation = endInput ? endInput.value.trim() : "";

  // 1. Both stations must be selected
  if (!startStation || !endStation) {
    resultsHeading.classList.remove("hidden");
    resultsTitle.textContent = "Selectează stațiile de plecare și sosire";
    if (resultsIcon) resultsIcon.style.display = "none";
    resultsWrapper.replaceChildren();
    return;
  }

  const isSameStation = startStation.toLowerCase() === endStation.toLowerCase();
  if (isSameStation) {
    resultsHeading.classList.remove("hidden");
    resultsTitle.textContent = "Punctul de plecare și sosire coincid";
    if (resultsIcon) resultsIcon.style.display = "none";
    resultsWrapper.replaceChildren();
    return;
  }

  // Show heading section and loader upon search trigger
  resultsHeading.classList.remove("hidden");
  showResultsLoader(resultsWrapper);

  let lines = [];

  try {
    const response = await fetch(
      `${endpoint}/v1/search/?from=${encodeURIComponent(startStation.toLowerCase())}&to=${encodeURIComponent(endStation.toLowerCase())}`,
    );

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        lines = data.map((item) =>
          typeof item === "object" && item.number
            ? String(item.number).toUpperCase()
            : String(item).toUpperCase(),
        );
      }
    } else {
      throw new Error(`Endpoint returned status ${response.status}`);
    }
  } catch (error) {
    console.warn("Search endpoint error:", error);
  }

  resultsWrapper.replaceChildren();

  // No lines found
  if (lines.length === 0) {
    resultsTitle.textContent = "Nicio linie validă";
    if (resultsIcon) resultsIcon.style.display = "none";
    return;
  }

  // Valid lines found!
  resultsTitle.textContent = "Linii valide";
  if (resultsIcon) resultsIcon.style.display = "block";

  const formattedStart = capitalizeStationName(startStation);
  const formattedEnd = capitalizeStationName(endStation);

  lines.forEach((lineNo) => {
    const card = document.createElement("div");
    card.classList.add("results__wrapper__card");
    card.setAttribute(
      "data-tooltip",
      `Apasă pentru a vedea traseul liniei ${lineNo}`,
    );

    const badge = document.createElement("span");
    badge.className = "badge line-number";
    badge.textContent = lineNo;

    const lineDetails = document.createElement("div");
    lineDetails.classList.add("line-details");

    const lineStart = document.createElement("span");
    lineStart.classList.add("line-start");
    lineStart.textContent = formattedStart;

    const lineEndWrapper = document.createElement("div");
    lineEndWrapper.classList.add("line-end-wrapper");

    const lineEndIcon = document.createElement("span");
    lineEndIcon.classList.add("line-end-icon");

    const lineEnd = document.createElement("span");
    lineEnd.classList.add("line-end");
    lineEnd.textContent = formattedEnd;

    lineEndWrapper.append(lineEndIcon, lineEnd);
    lineDetails.append(lineStart, lineEndWrapper);
    card.append(badge, lineDetails);

    // Clicking card selects line in circuit viewer below
    card.addEventListener("click", () => {
      const linesInput = document.querySelector("#lines-input");
      if (linesInput) {
        linesInput.value = `Linia ${lineNo}`;
        renderLineCircuit(lineNo);
        linesInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    resultsWrapper.append(card);
  });
}

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

  let debounceTimer = null;

  async function filterAndRenderLines(query = "") {
    if (linesDataCache.length === 0) {
      showDropdownLoader(suggestionsList);
    }
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
    filterAndRenderLines(linesInput.value.trim());
  });

  linesInput.addEventListener("click", () => {
    filterAndRenderLines(linesInput.value.trim());
  });

  linesInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      filterAndRenderLines(e.target.value.trim());
    }, 150);
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
