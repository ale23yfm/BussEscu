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

      showDropdownLoader(suggestionsList);
      const accessible = await fetchAccessibleStations(departureStation);

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
      inputElement.value = formattedStation;
      hideSuggestions(listElement);
    });

    listElement.appendChild(li);
  });

  listElement.classList.remove("hidden");
}
