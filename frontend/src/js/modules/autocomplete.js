import {
  fetchStationSuggestions,
  fetchAccessibleStations,
} from "../services/api.js";
import { capitalizeStationName } from "../utils/helpers.js";
import {
  showDropdownLoader,
  hideSuggestions,
  renderHintMessage,
} from "../utils/ui.js";
import { updateCircuitHighlights } from "./circuit.js";

let lastDepartureStation = "";
let cachedAccessibleStations = [];

/**
 * Get accessible stations from cache or API
 * @param {string} departureStation
 * @returns {Promise<Array<string>>}
 */
async function getAccessibleStations(departureStation) {
  const cleanDeparture = departureStation.trim().toLowerCase();

  if (
    cleanDeparture === lastDepartureStation &&
    cachedAccessibleStations.length > 0
  ) {
    return cachedAccessibleStations;
  }

  const stations = await fetchAccessibleStations(departureStation);
  lastDepartureStation = cleanDeparture;
  cachedAccessibleStations = stations || [];
  return cachedAccessibleStations;
}

/**
 * Invalidate accessible stations cache
 */
export function invalidateAccessibleCache() {
  lastDepartureStation = "";
  cachedAccessibleStations = [];
}

/**
 * Initialize autocomplete logic for station input dropdowns
 * @param {HTMLElement} wrapperElement
 */
export function setupAutocomplete(wrapperElement) {
  const input = wrapperElement.querySelector(".search-input");
  const suggestionsList = wrapperElement.querySelector(
    ".dropdown-wrapper__list",
  );

  if (!input || !suggestionsList) return;

  const isEndStation = input.id === "end-station";
  let debounceTimer = null;

  async function handleFetch() {
    const query = input.value.trim();
    const startInput = document.querySelector("#start-station");
    const departureStation = startInput ? startInput.value.trim() : "";

    if (isEndStation) {
      if (!departureStation) {
        renderHintMessage(
          "Selectează mai întâi punctul de plecare",
          suggestionsList,
        );
        return;
      }

      const cleanDep = departureStation.trim().toLowerCase();
      const hasCached =
        cleanDep === lastDepartureStation &&
        cachedAccessibleStations.length > 0;

      if (!hasCached) {
        showDropdownLoader(suggestionsList);
      }

      const accessible = await getAccessibleStations(departureStation);

      // Text filtering
      const filtered = query
        ? accessible.filter((station) =>
            station.toLowerCase().includes(query.toLowerCase()),
          )
        : accessible;

      if (filtered.length === 0) {
        renderHintMessage("Nicio legătură directă", suggestionsList);
      } else {
        renderSuggestions(filtered, suggestionsList, input);
      }
      return;
    }

    if (query.length < 3) {
      hideSuggestions(suggestionsList);
      return;
    }

    showDropdownLoader(suggestionsList);
    const filtered = await fetchStationSuggestions(query);
    if (filtered.length === 0) {
      hideSuggestions(suggestionsList);
    } else {
      renderSuggestions(filtered, suggestionsList, input);
    }
  }

  input.addEventListener("input", () => {
    if (!isEndStation) {
      invalidateAccessibleCache();
    }
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(handleFetch, 300);
  });

  input.addEventListener("focus", () => {
    handleFetch();
  });

  input.addEventListener("blur", () => {
    if (input.value) {
      input.value = capitalizeStationName(input.value);
    }
    updateCircuitHighlights();
  });
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
    const filtered = await fetchStationSuggestions(query);
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
export function renderSuggestions(stations, listElement, inputElement) {
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
      if (inputElement.id === "start-station" && inputElement.value !== formattedStation) {
        invalidateAccessibleCache();
      }
      inputElement.value = formattedStation;
      hideSuggestions(listElement);
      updateCircuitHighlights();
    });

    listElement.appendChild(li);
  });

  listElement.classList.remove("hidden");
}
