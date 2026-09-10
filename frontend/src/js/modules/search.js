import { searchRoutes } from "../services/api.js";
import { capitalizeStationName } from "../utils/helpers.js";
import { showResultsLoader } from "../utils/ui.js";
import { renderLineCircuit } from "./circuit.js";

/**
 * Handle live search between departure and destination stations using v1/search endpoint
 */
export async function handleSearch() {
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

  const results = await searchRoutes(startStation, endStation);

  resultsWrapper.replaceChildren();

  // No lines found
  if (results.length === 0) {
    resultsTitle.textContent = "Nicio linie validă";
    if (resultsIcon) resultsIcon.style.display = "none";
    return;
  }

  // Valid lines found!
  resultsTitle.textContent = "Linii valide";
  if (resultsIcon) resultsIcon.style.display = "block";

  renderResultCards(results, resultsWrapper);
}

/**
 * Render cards for found routes
 * @param {Array<{number: string, start?: string, stop?: string}>} results
 * @param {HTMLElement} resultsWrapper
 */
function renderResultCards(results, resultsWrapper) {
  results.forEach((item) => {
    const lineNo = typeof item === "object" ? item.number : item;
    const rawStart =
      typeof item === "object" && item.start && item.start.trim()
        ? item.start
        : "";
    const rawStop =
      typeof item === "object" && item.stop && item.stop.trim()
        ? item.stop
        : "";

    const lineStartText = rawStart
      ? capitalizeStationName(rawStart)
      : "Nespecificat";
    const lineEndText = rawStop
      ? capitalizeStationName(rawStop)
      : "Nespecificat";

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
    lineStart.textContent = lineStartText;

    const lineEndWrapper = document.createElement("div");
    lineEndWrapper.classList.add("line-end-wrapper");

    const lineEndIcon = document.createElement("span");
    lineEndIcon.classList.add("line-end-icon");

    const lineEnd = document.createElement("span");
    lineEnd.classList.add("line-end");
    lineEnd.textContent = lineEndText;

    lineEndWrapper.append(lineEndIcon, lineEnd);
    lineDetails.append(lineStart, lineEndWrapper);
    card.append(badge, lineDetails);

    // Open circuit on card click
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
