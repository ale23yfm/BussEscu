import { loadLinesData } from "../services/api.js";
import { renderLineCircuit } from "./circuit.js";
import { showDropdownLoader, hideSuggestions } from "../utils/ui.js";

/**
 * Setup autocomplete & search for lines selector dropdown
 * @param {HTMLElement} wrapperElement
 */
export function setupLinesAutocomplete(wrapperElement) {
  const linesInput = wrapperElement.querySelector("#lines-input");
  const suggestionsList = wrapperElement.querySelector(
    ".dropdown-wrapper__list",
  );

  if (!linesInput || !suggestionsList) return;

  let debounceTimer = null;

  async function filterAndRenderLines(query = "") {
    showDropdownLoader(suggestionsList);
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
export function renderLineSuggestions(lines, listElement, inputElement) {
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
