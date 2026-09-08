export const CONFIG = {
  API_BASE_URL: "https://bussescu.onrender.com",
  // API_BASE_URL: "http://localhost:10000",
};

// Fallback for non-module scripts if needed
if (typeof window !== "undefined") {
  window.CONFIG = CONFIG;
}
