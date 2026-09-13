import { searchRoutes } from "../services/api.js";
import { capitalizeStationName } from "../utils/helpers.js";
import { showResultsLoader } from "../utils/ui.js";
import { renderLineCircuit } from "./circuit.js";

let isToggleInitialized = false;

function initResultsToggle() {
  if (isToggleInitialized) return;
  const resultsContainer = document.querySelector(".results");
  const resultsToggle = document.querySelector(".results__toggle");
  const resultsWrapper = document.querySelector(".results__wrapper");

  if (resultsContainer && resultsToggle && resultsWrapper) {
    resultsToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isCurrentlyCollapsed =
        resultsContainer.classList.contains("results--collapsed");

      if (isCurrentlyCollapsed) {
        // Expanding
        resultsContainer.classList.remove("results--collapsed");
        resultsWrapper.style.maxHeight = `${resultsWrapper.scrollHeight}px`;
        resultsWrapper.style.opacity = "1";

        const onTransitionEnd = () => {
          if (!resultsContainer.classList.contains("results--collapsed")) {
            resultsWrapper.style.maxHeight = "none";
          }
          resultsWrapper.removeEventListener("transitionend", onTransitionEnd);
        };
        resultsWrapper.addEventListener("transitionend", onTransitionEnd);
      } else {
        // Collapsing
        resultsWrapper.style.maxHeight = `${resultsWrapper.scrollHeight}px`;
        // Force reflow
        void resultsWrapper.offsetHeight;
        resultsContainer.classList.add("results--collapsed");
        resultsWrapper.style.maxHeight = "0px";
        resultsWrapper.style.opacity = "0";
      }
    });
    isToggleInitialized = true;
  }
}

/**
 * Handle live search between departure and destination stations using v1/search endpoint
 */
export async function handleSearch() {
  const startInput = document.querySelector("#start-station");
  const endInput = document.querySelector("#end-station");
  const resultsContainer = document.querySelector(".results");
  const resultsHeader = document.querySelector(".results__header");
  const resultsTitle = document.querySelector(".results__title");
  const resultsIcon = document.querySelector(".results__icon");
  const resultsToggle = document.querySelector(".results__toggle");
  const resultsCount = document.querySelector(".results__count");
  const resultsWrapper = document.querySelector(".results__wrapper");

  if (!resultsWrapper || !resultsHeader || !resultsTitle) return;

  initResultsToggle();

  const startStation = startInput ? startInput.value.trim() : "";
  const endStation = endInput ? endInput.value.trim() : "";

  // 1. Both stations must be selected
  if (!startStation || !endStation) {
    resultsHeader.classList.remove("hidden");
    if (resultsToggle) resultsToggle.classList.add("hidden");
    resultsTitle.textContent = "Selectează stațiile de plecare și sosire";
    if (resultsIcon) resultsIcon.style.display = "none";
    resultsWrapper.replaceChildren();
    return;
  }

  const isSameStation = startStation.toLowerCase() === endStation.toLowerCase();
  if (isSameStation) {
    resultsHeader.classList.remove("hidden");
    if (resultsToggle) resultsToggle.classList.add("hidden");
    resultsTitle.textContent = "Punctul de plecare și sosire coincid";
    if (resultsIcon) resultsIcon.style.display = "none";
    resultsWrapper.replaceChildren();
    return;
  }

  // Show header section and loader upon search trigger
  resultsHeader.classList.remove("hidden");
  if (resultsToggle) resultsToggle.classList.add("hidden");
  if (resultsContainer) resultsContainer.classList.remove("results--collapsed");
  resultsWrapper.style.maxHeight = "none";
  resultsWrapper.style.opacity = "1";
  showResultsLoader(resultsWrapper);

  const { total, routes } = await searchRoutes(startStation, endStation);

  resultsWrapper.replaceChildren();

  // No lines found
  if (total === 0 || routes.length === 0) {
    resultsTitle.textContent = "Nicio linie validă";
    if (resultsIcon) resultsIcon.style.display = "none";
    if (resultsToggle) resultsToggle.classList.add("hidden");
    return;
  }

  // Valid lines found!
  resultsTitle.textContent = "Linii valide";
  if (resultsIcon) resultsIcon.style.display = "block";

  if (resultsToggle && resultsCount) {
    resultsCount.textContent = `${total} ${total === 1 ? "rezultat" : "rezultate"}`;
    resultsToggle.classList.remove("hidden");
  }

  renderResultCards(routes, resultsWrapper);
}

/**
 * Render cards for found routes
 * @param {Array<{number: string, start?: string, stop?: string}>} results
 * @param {HTMLElement} resultsWrapper
 */
function renderResultCards(results, resultsWrapper) {
  resultsWrapper.style.maxHeight = "none";
  resultsWrapper.style.opacity = "1";

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

    const hasStations =
      item.stations !== undefined &&
      item.stations !== null &&
      item.stations !== "";

    const totalStationsContent = hasStations
      ? `${item.stations === 1 ? "O stație" : item.stations + " " + "stații"}`
      : "";

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

    if (hasStations) {
      const totalStations = document.createElement("span");
      totalStations.classList.add("total-stations");
      totalStations.textContent = totalStationsContent;
      card.append(totalStations);
    }

    lineEndWrapper.append(lineEndIcon, lineEnd);
    lineDetails.append(lineStart, lineEndWrapper);
    card.append(badge, lineDetails);

    // Open circuit on card click
    card.addEventListener("click", () => {
      const linesInput = document.querySelector("#lines-input");
      if (linesInput) {
        linesInput.value = `Linia ${lineNo}`;
        renderLineCircuit(lineNo);
      }
    });

    resultsWrapper.append(card);
  });
}
