const filterButtons = document.querySelectorAll("[data-filter]");
const cards = document.querySelectorAll(".artifact-card");
const disabledLinks = document.querySelectorAll(".disabled-link");
const summaries = document.querySelectorAll(".project-summary");
const projectGrid = document.querySelector(".project-grid");
const cardList = [...cards];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let isFiltering = false;

const cardMatchesFilter = (card, filter) => {
  const tags = card.dataset.tags || "";
  return filter === "all" || tags.split(" ").includes(filter);
};

const applyFilter = (filter) => {
  cardList.forEach((card) => {
    card.classList.toggle("is-hidden", !cardMatchesFilter(card, filter));
  });
};

const waitForAnimations = async (animations) => {
  await Promise.allSettled(animations.map((animation) => animation.finished));
};

filterButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    if (isFiltering || button.classList.contains("is-active")) {
      return;
    }

    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    if (prefersReducedMotion) {
      applyFilter(filter);
      return;
    }

    const visibleCards = cardList.filter((card) => !card.classList.contains("is-hidden"));
    const targetCards = cardList.filter((card) => cardMatchesFilter(card, filter));
    const anchorCard = visibleCards[0] || targetCards[0];

    if (!anchorCard) {
      applyFilter(filter);
      return;
    }

    isFiltering = true;
    projectGrid?.classList.add("is-filtering");

    const anchorRect = anchorCard.getBoundingClientRect();
    const collapseAnimations = visibleCards.map((card) => {
      const rect = card.getBoundingClientRect();
      const dx = anchorRect.left - rect.left;
      const dy = anchorRect.top - rect.top;

      return card.animate(
        [
          { opacity: 1, transform: "translate(0, 0) scale(1)" },
          { opacity: card === anchorCard ? 0.72 : 0.28, transform: `translate(${dx}px, ${dy}px) scale(0.94)` },
        ],
        { duration: 300, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" },
      );
    });

    await waitForAnimations(collapseAnimations);
    collapseAnimations.forEach((animation) => animation.cancel());

    applyFilter(filter);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const nextVisibleCards = cardList.filter((card) => !card.classList.contains("is-hidden"));
    const expandAnimations = nextVisibleCards.map((card) => {
      const rect = card.getBoundingClientRect();
      const dx = anchorRect.left - rect.left;
      const dy = anchorRect.top - rect.top;
      const isSingleResult = nextVisibleCards.length === 1;

      return card.animate(
        [
          {
            opacity: isSingleResult ? 0.24 : 0.5,
            transform: isSingleResult ? "scale(0.96)" : `translate(${dx}px, ${dy}px) scale(0.94)`,
          },
          { opacity: 1, transform: "translate(0, 0) scale(1)" },
        ],
        { duration: 420, easing: "cubic-bezier(.16,1,.3,1)" },
      );
    });

    await waitForAnimations(expandAnimations);
    projectGrid?.classList.remove("is-filtering");
    isFiltering = false;
  });
});

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
