/**
 * Show a hint message inside the dropdown
 * @param {string} message
 * @param {HTMLElement} listElement
 */
export function renderHintMessage(message, listElement) {
  listElement.replaceChildren();

  const li = document.createElement("li");
  li.className = "dropdown-wrapper__item dropdown-wrapper__item--hint";
  li.style.textAlign = "center";
  li.style.padding = "1.2rem";
  li.style.color = "var(--results-heading-color)";
  li.style.opacity = "0.75";
  li.style.pointerEvents = "none";
  li.textContent = message;

  listElement.appendChild(li);
  listElement.classList.remove("hidden");
}

/**
 * Show loading spinner inside dropdown list
 * @param {HTMLElement} listElement
 */
export function showDropdownLoader(listElement) {
  listElement.replaceChildren();

  const item = document.createElement("li");
  item.className = "dropdown-wrapper__item dropdown-wrapper__item--loader";
  item.style.textAlign = "center";
  item.style.padding = "1.2rem";

  const loader = document.createElement("span");
  loader.className = "loader loader--small";

  item.appendChild(loader);
  listElement.appendChild(item);
  listElement.classList.remove("hidden");
}

/**
 * Show loading spinner inside route results wrapper
 * @param {HTMLElement} resultsWrapper
 */
export function showResultsLoader(resultsWrapper) {
  resultsWrapper.replaceChildren();

  const container = document.createElement("div");
  container.className = "results-loader-container";
  container.style.display = "flex";
  container.style.justifyContent = "center";
  container.style.padding = "2.4rem";

  const loader = document.createElement("span");
  loader.className = "loader";

  container.appendChild(loader);
  resultsWrapper.appendChild(container);
}

/**
 * Empty & hide search results dropdown handler
 * @param {HTMLElement} listElement
 */
export function hideSuggestions(listElement) {
  if (!listElement) return;
  listElement.classList.add("hidden");
  listElement.replaceChildren();
}
