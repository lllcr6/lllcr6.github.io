const filterButtons = document.querySelectorAll("[data-filter]");
const cards = document.querySelectorAll(".artifact-card");
const disabledLinks = document.querySelectorAll(".disabled-link");
const summaries = document.querySelectorAll(".project-summary");
const themeToggle = document.querySelector("[data-theme-toggle]");
const projectGrid = document.querySelector(".project-grid");
const cardList = [...cards];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const themeStorageKey = "chenrui-theme";

const setTheme = (theme, shouldPersist = true) => {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;

  if (themeToggle) {
    const isDark = nextTheme === "dark";
    const label = themeToggle.querySelector(".theme-toggle-text");
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    if (label) {
      label.textContent = isDark ? "Light" : "Dark";
    }
  }

  if (!shouldPersist) {
    return;
  }

  try {
    localStorage.setItem(themeStorageKey, nextTheme);
  } catch {
    // The visual toggle should still work when storage is unavailable.
  }
};

setTheme(document.documentElement.dataset.theme, false);

themeToggle?.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
});

const cardMatchesFilter = (card, filter) => {
  const tags = card.dataset.tags || "";
  return filter === "all" || tags.split(" ").includes(filter);
};

const applyFilter = (filter) => {
  cardList.forEach((card) => {
    card.classList.toggle("is-hidden", !cardMatchesFilter(card, filter));
  });
};

const projectCount = document.querySelector(".project-count");
const previousProjects = document.querySelector("[data-project-prev]");
const nextProjects = document.querySelector("[data-project-next]");

const updateProjectNavigation = () => {
  const maxScroll = projectGrid.scrollWidth - projectGrid.clientWidth;
  document.querySelector(".project-navigation").hidden = maxScroll <= 2;
  previousProjects.disabled = projectGrid.scrollLeft <= 2;
  nextProjects.disabled = projectGrid.scrollLeft >= maxScroll - 2;
  projectCount.textContent = "Scroll to explore";
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => {
      item.classList.toggle("is-active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
    applyFilter(button.dataset.filter);
    projectGrid.scrollLeft = 0;
    updateProjectNavigation();
  });
  button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
});

const moveProjects = (direction) => {
  const card = cardList.find((item) => !item.classList.contains("is-hidden"));
  if (!card) return;
  const gap = parseFloat(getComputedStyle(projectGrid).columnGap) || 0;
  projectGrid.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: prefersReducedMotion ? "auto" : "smooth" });
};
previousProjects.addEventListener("click", () => moveProjects(-1));
nextProjects.addEventListener("click", () => moveProjects(1));
projectGrid.addEventListener("scroll", updateProjectNavigation, { passive: true });
window.addEventListener("resize", updateProjectNavigation);
updateProjectNavigation();

disabledLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
  });
});

summaries.forEach((summary) => {
  if (summary.scrollHeight <= summary.clientHeight + 2) {
    return;
  }

  const hint = document.createElement("span");
  hint.className = "summary-scroll-hint";
  hint.textContent = "Scroll for more";
  summary.after(hint);

  summary.addEventListener("scroll", () => {
    const isAtBottom = summary.scrollTop + summary.clientHeight >= summary.scrollHeight - 4;
    hint.classList.toggle("is-hidden", isAtBottom);
  });
});
