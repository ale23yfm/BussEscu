const isDevelopment =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.startsWith("192.168.") ||
    window.location.hostname.startsWith("10.") ||
    window.location.hostname.endsWith(".local"));

const localBackendHost =
  typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? `http://${window.location.hostname}:10000`
    : "http://localhost:10000";

export const CONFIG = {
  API_BASE_URL: isDevelopment
    ? localBackendHost // Local development
    : "https://bussescu.onrender.com", // Production (Render)
};

// Fallback for non-module scripts if needed
if (typeof window !== "undefined") {
  window.CONFIG = CONFIG;
}
