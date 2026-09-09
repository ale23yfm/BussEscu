/**
 * Capitalizes the first letter of each word while keeping stop words lowercase unless first.
 * @param {string} str - Input text or station name
 * @returns {string} - Formatted title-case string
 */
export function capitalizeStationName(str) {
  if (!str || typeof str !== "string") return "";

  // Romanian prepositions/conjunctions to keep lowercase
  const stopWords = new Set([
    "de",
    "pe",
    "din",
    "in",
    "în",
    "la",
    "cu",
    "sub",
    "spre",
    "peste",
    "după",
    "dupa",
    "și",
    "si",
    "al",
    "a",
    "ai",
    "ale",
  ]);

  return str
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      const lowerWord = word.toLowerCase();

      if (index > 0 && stopWords.has(lowerWord)) {
        return lowerWord;
      }

      // Handle hyphenated words (e.g. "C-tin" or "Sân-Mărghita")
      if (word.includes("-")) {
        return word
          .split("-")
          .map((part, pIdx) => {
            const lowerPart = part.toLowerCase();
            if (pIdx > 0 && stopWords.has(lowerPart)) {
              return lowerPart;
            }
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
          })
          .join("-");
      }

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
