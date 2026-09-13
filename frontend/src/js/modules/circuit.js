import { fetchRouteDetails } from "../services/api.js";
import { capitalizeStationName } from "../utils/helpers.js";

let circuitAnimFrameId = null;
let currentRouteStations = { turStations: [], returStations: [] };

/**
 * Dynamically render route stations circuit for Tur and Retur
 * @param {string} lineNumber
 */
export async function renderLineCircuit(lineNumber) {
  const linesWrapper = document.querySelector(".lines-wrapper");
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
    const { turStations, returStations } = await fetchRouteDetails(cleanLineNo);

    if (turStations.length === 0 && returStations.length === 0) {
      stopCircuitTracker();
      linesWrapper.classList.add("hidden");
      return;
    }

    returWrapper.replaceChildren();
    turWrapper.replaceChildren();
    linesWrapper.classList.remove("hidden");

    const startInput = document.querySelector("#start-station");
    const endInput = document.querySelector("#end-station");
    const departureStation = startInput
      ? startInput.value.trim().toLowerCase()
      : "";
    const arrivalStation = endInput
      ? endInput.value.trim().toLowerCase()
      : "";

    [...returStations].reverse().forEach((station) => {
      const cleanStation = String(station || "").trim().toLowerCase();
      const article = document.createElement("article");
      article.className = "linie-retur";
      article.setAttribute("data-station", cleanStation);

      if (departureStation && cleanStation === departureStation) {
        article.classList.add("station--departure");
      } else if (arrivalStation && cleanStation === arrivalStation) {
        article.classList.add("station--arrival");
      }

      const stationText = document.createElement("span");
      stationText.className = "station-name";
      stationText.textContent = capitalizeStationName(station);
      article.appendChild(stationText);

      returWrapper.appendChild(article);
    });

    turStations.forEach((station) => {
      const cleanStation = String(station || "").trim().toLowerCase();
      const article = document.createElement("article");
      article.className = "linie-tur";
      article.setAttribute("data-station", cleanStation);

      if (departureStation && cleanStation === departureStation) {
        article.classList.add("station--departure");
      } else if (arrivalStation && cleanStation === arrivalStation) {
        article.classList.add("station--arrival");
      }

      const stationText = document.createElement("span");
      stationText.className = "station-name";
      stationText.textContent = capitalizeStationName(station);
      article.appendChild(stationText);

      turWrapper.appendChild(article);
    });

    currentRouteStations = { turStations, returStations };
    startCircuitTracker();
    updateCircuitRangeIndicator();
  } catch (error) {
    console.error(`Error downloading route line:`, error);
    stopCircuitTracker();
    linesWrapper.classList.add("hidden");
  }
}

/**
 * Animated tracker dot running infinitely clockwise along the separator border
 */
export function startCircuitTracker() {
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
  const speed = 120; // Speed in px/s

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

/**
 * Stop tracker dot animation
 */
export function stopCircuitTracker() {
  if (circuitAnimFrameId) {
    cancelAnimationFrame(circuitAnimFrameId);
    circuitAnimFrameId = null;
  }
  const dot = document.querySelector(".circuit-tracker-dot");
  if (dot) {
    dot.classList.remove("circuit-tracker-dot--active");
  }
}

/**
 * Calculate station distance on the circuit
 * @param {string} depName
 * @param {string} arrName
 * @param {Array<string>} turStations
 * @param {Array<string>} returStations
 * @returns {number}
 */
function calculateStationCount(depName, arrName, turStations = [], returStations = []) {
  if (!depName || !arrName) return 0;
  const cleanDep = depName.trim().toLowerCase();
  const cleanArr = arrName.trim().toLowerCase();
  if (cleanDep === cleanArr) return 0;

  const cleanTur = turStations.map((s) => String(s || "").trim().toLowerCase());
  const cleanRetur = returStations.map((s) => String(s || "").trim().toLowerCase());

  const turDep = cleanTur.indexOf(cleanDep);
  const turArr = cleanTur.indexOf(cleanArr);
  const returDep = cleanRetur.indexOf(cleanDep);
  const returArr = cleanRetur.indexOf(cleanArr);

  const possibleDistances = [];

  // Case 1: Both on Tur in forward direction
  if (turDep !== -1 && turArr !== -1 && turArr >= turDep) {
    possibleDistances.push(turArr - turDep);
  }
  // Case 2: Both on Retur in forward direction
  if (returDep !== -1 && returArr !== -1 && returArr >= returDep) {
    possibleDistances.push(returArr - returDep);
  }
  // Case 3: Dep on Tur, Arr on Retur
  if (turDep !== -1 && returArr !== -1) {
    possibleDistances.push(cleanTur.length - 1 - turDep + (returArr + 1));
  }
  // Case 4: Dep on Retur, Arr on Tur
  if (returDep !== -1 && turArr !== -1) {
    possibleDistances.push(cleanRetur.length - 1 - returDep + (turArr + 1));
  }
  // Fallback: absolute difference on same branch
  if (possibleDistances.length === 0) {
    if (turDep !== -1 && turArr !== -1) {
      possibleDistances.push(Math.abs(turArr - turDep));
    } else if (returDep !== -1 && returArr !== -1) {
      possibleDistances.push(Math.abs(returArr - returDep));
    }
  }

  return possibleDistances.length > 0 ? Math.min(...possibleDistances) : 0;
}

/**
 * Update the dynamic vertical station range indicator between departure and arrival stations
 */
export function updateCircuitRangeIndicator() {
  const separator = document.querySelector(".separator");
  if (!separator) return;

  const indicator = separator.querySelector(".circuit-range-indicator");
  if (!indicator) return;

  const startInput = document.querySelector("#start-station");
  const endInput = document.querySelector("#end-station");
  const depName = startInput ? startInput.value.trim().toLowerCase() : "";
  const arrName = endInput ? endInput.value.trim().toLowerCase() : "";

  if (!depName || !arrName) {
    indicator.classList.add("hidden");
    return;
  }

  const turWrapper = document.querySelector(".tur-wrapper");
  const returWrapper = document.querySelector(".retur-wrapper");

  let depEl = null;
  let arrEl = null;

  const depTur = turWrapper ? turWrapper.querySelector(".station--departure") : null;
  const arrTur = turWrapper ? turWrapper.querySelector(".station--arrival") : null;
  const depRetur = returWrapper ? returWrapper.querySelector(".station--departure") : null;
  const arrRetur = returWrapper ? returWrapper.querySelector(".station--arrival") : null;

  if (depTur && arrTur) {
    depEl = depTur;
    arrEl = arrTur;
  } else if (depRetur && arrRetur) {
    depEl = depRetur;
    arrEl = arrRetur;
  } else {
    depEl = document.querySelector(".station--departure");
    arrEl = document.querySelector(".station--arrival");
  }

  if (!depEl || !arrEl) {
    indicator.classList.add("hidden");
    return;
  }

  const separatorRect = separator.getBoundingClientRect();
  if (separatorRect.height === 0) {
    indicator.classList.add("hidden");
    return;
  }

  const depRect = depEl.getBoundingClientRect();
  const arrRect = arrEl.getBoundingClientRect();

  const depCenterY = depRect.top + depRect.height / 2 - separatorRect.top;
  const arrCenterY = arrRect.top + arrRect.height / 2 - separatorRect.top;

  const topY = Math.min(depCenterY, arrCenterY);
  const bottomY = Math.max(depCenterY, arrCenterY);
  const height = Math.max(bottomY - topY, 8);

  const count = calculateStationCount(
    depName,
    arrName,
    currentRouteStations.turStations,
    currentRouteStations.returStations
  );

  const countEl = indicator.querySelector(".circuit-range-indicator__count");

  indicator.style.top = `${topY}px`;
  indicator.style.height = `${height}px`;

  if (countEl) countEl.textContent = count;

  indicator.classList.remove("hidden");
}

/**
 * Update station highlighting on currently rendered circuit
 */
export function updateCircuitHighlights() {
  const startInput = document.querySelector("#start-station");
  const endInput = document.querySelector("#end-station");
  const departureStation = startInput
    ? startInput.value.trim().toLowerCase()
    : "";
  const arrivalStation = endInput
    ? endInput.value.trim().toLowerCase()
    : "";

  document.querySelectorAll(".linie-tur, .linie-retur").forEach((article) => {
    const cleanStation = article.getAttribute("data-station") || "";
    article.classList.remove("station--departure", "station--arrival");

    if (departureStation && cleanStation === departureStation) {
      article.classList.add("station--departure");
    } else if (arrivalStation && cleanStation === arrivalStation) {
      article.classList.add("station--arrival");
    }
  });

  updateCircuitRangeIndicator();
}

window.addEventListener("resize", () => {
  const linesWrapper = document.querySelector(".lines-wrapper");
  if (linesWrapper && !linesWrapper.classList.contains("hidden")) {
    updateCircuitRangeIndicator();
  }
});
