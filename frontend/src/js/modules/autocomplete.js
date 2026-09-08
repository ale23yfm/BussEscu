import { fetchStationSuggestions } from "../services/api.js";
import { capitalizeStationName } from "../utils/helpers.js";
import { showDropdownLoader, hideSuggestions } from "../utils/ui.js";

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

  let debounceTimer = null;

  input.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    clearTimeout(debounceTimer);

    if (query.length < 3) {
      hideSuggestions(suggestionsList);
      return;
    }

    // Call fetchSuggestions after a delay (300ms)
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
