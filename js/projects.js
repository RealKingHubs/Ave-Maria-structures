import { PROJECTS } from "./projects-data.js";


let lightboxEls = null;

/* ----------------------------------------------------------
   Project card
   ---------------------------------------------------------- */
function buildProjectCard(project) {
  const card = document.createElement("article");
  card.className = "spec-card bg-white overflow-hidden flex flex-col";

  card.innerHTML = `
    <button type="button" class="project-image-btn block w-full aspect-[4/3] overflow-hidden" aria-label="View larger photo of ${project.title}">
      <img src="${project.image}" alt="${project.alt}" loading="lazy" class="w-full h-full object-cover">
    </button>
    <div class="p-5 flex flex-col grow">
      <div class="flex items-center justify-between mb-2">
        <span class="font-mono text-[11px] uppercase tracking-widest text-amber-deep">${project.category}</span>
        <span class="font-mono text-[11px] uppercase tracking-widest text-slate-400">${project.status}</span>
      </div>
      <h3 class="font-display font-semibold text-base mb-1">${project.title}</h3>
      <p class="font-mono text-xs text-slate-400 mb-3">${project.location} &middot; ${project.year}</p>
      <p class="text-sm text-slate-600 leading-relaxed grow">${project.description}</p>
    </div>
  `;

  card.querySelector(".project-image-btn").addEventListener("click", () => openLightbox(project));

  return card;
}

function renderProjects(filter) {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;

  grid.innerHTML = "";

  const items = filter === "all" ? PROJECTS : PROJECTS.filter((p) => p.category === filter);
  items.forEach((project) => grid.appendChild(buildProjectCard(project)));
}

/* ----------------------------------------------------------
   Filter tabs
   ---------------------------------------------------------- */
function initProjectTabs() {
  const tabs = document.querySelectorAll(".project-tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      renderProjects(tab.dataset.filter);
    });
  });
}

/* ----------------------------------------------------------
   Lightbox
   ---------------------------------------------------------- */
function openLightbox(project) {
  if (!lightboxEls) return;

  lightboxEls.image.src = project.image;
  lightboxEls.image.alt = project.alt;
  lightboxEls.title.textContent = project.title;
  lightboxEls.meta.textContent = `${project.location} \u00b7 ${project.year} \u00b7 ${project.status}`;

  lightboxEls.overlay.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
}

function closeLightbox() {
  if (!lightboxEls) return;

  lightboxEls.overlay.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
}

function initLightbox() {
  const overlay = document.getElementById("project-lightbox");
  if (!overlay) return;

  lightboxEls = {
    overlay,
    image: document.getElementById("lightbox-image"),
    title: document.getElementById("lightbox-title"),
    meta: document.getElementById("lightbox-meta")
  };

  document.getElementById("lightbox-close").addEventListener("click", closeLightbox);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (overlay.classList.contains("hidden")) return;
    closeLightbox();
  });
}

export function initProjects() {
  renderProjects("all");
  initProjectTabs();
  initLightbox();
}