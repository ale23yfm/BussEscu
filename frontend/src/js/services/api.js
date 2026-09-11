import { CONFIG } from "../../environment/config.js";

const endpoint = CONFIG.API_BASE_URL;

let apiStationsCache = [];
let linesDataCache = [];

/**
 * Fetch station list and filter by query (single cached request)
 * @param {string} query
 * @returns {Promise<Array<string>>}
 */
export async function fetchStationSuggestions(query) {
  try {
    if (apiStationsCache.length === 0) {
      const response = await fetch(`${endpoint}/v1/stations/`);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data = await response.json();
      apiStationsCache = data.map((station) => station.name);
    }

    return apiStationsCache.filter((stationName) =>
      stationName.toLowerCase().includes(query.toLowerCase()),
    );
  } catch (error) {
    console.error("Error fetching stations: ", error);
    return [];
  }
}

/**
 * Search valid bus lines between departure and destination stations
 * @param {string} startStation
 * @param {string} endStation
 * @returns {Promise<Array<string>>}
 */
export async function searchRoutes(startStation, endStation) {
  try {
    const response = await fetch(
      `${endpoint}/v1/search/?from=${encodeURIComponent(startStation.toLowerCase())}&to=${encodeURIComponent(endStation.toLowerCase())}`,
    );

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data.map((item) => {
          if (typeof item === "object" && item !== null) {
            return {
              number: String(item.number || "").toUpperCase(),
              start: item.start || "",
              stop: item.stop || "",
            };
          }

          return {
            number: String(item).toUpperCase(),
            start: "",
            stop: "",
          };
        });
      }
    } else {
      throw new Error(`Endpoint returned status ${response.status}`);
    }
  } catch (error) {
    console.warn("Search endpoint error:", error);
  }
  return [];
}

/**
 * Load lines data from backend endpoint (single cached request)
 * @returns {Promise<Array<string>>}
 */
export async function loadLinesData() {
  if (linesDataCache.length > 0) return linesDataCache;

  try {
    const response = await fetch(`${endpoint}/v1/lines/`);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const data = await response.json();

    const lines = (data.lines || []).map((item) =>
      String(item.number).trim().toUpperCase(),
    );

    linesDataCache = lines.sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
    );

    return linesDataCache;
  } catch (error) {
    console.error("Error loading lines data:", error);
    return [];
  }
}

/**
 * Fetch detailed route stations (tur & retur) for a specific line
 * @param {string} cleanLineNo
 * @returns {Promise<{turStations: Array<string>, returStations: Array<string>}>}
 */
export async function fetchRouteDetails(cleanLineNo) {
  const response = await fetch(`${endpoint}/v1/route/?line=${cleanLineNo}`);
  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}`);
  }
  const data = await response.json();

  const turData = (data.routes || []).find(
    (route) => route.direction && route.direction.toLowerCase() === "tur",
  );
  const returData = (data.routes || []).find(
    (route) => route.direction && route.direction.toLowerCase() === "retur",
  );

  return {
    turStations: turData ? turData.stations : [],
    returStations: returData ? returData.stations : [],
  };
}

/**
 * Fetch accessible direct destination stations from a departure station
 * @param {string} departureStation
 * @returns {Promise<Array<string>>}
 */

export async function fetchAccessibleStations(departureStation) {
  if (!departureStation) return [];

  try {
    const response = await fetch(
      `${endpoint}/v1/accessible/?station=${encodeURIComponent(departureStation.toLowerCase())}`,
    );

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (error) {
    console.warn("Error fetching accessible stations:", error);
  }
  return [];
}
