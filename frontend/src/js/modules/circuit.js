import { fetchRouteDetails } from "../services/api.js";
import { capitalizeStationName } from "../utils/helpers.js";

let circuitAnimFrameId = null;

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
