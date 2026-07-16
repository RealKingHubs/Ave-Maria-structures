import {
  CEMENT,
  IRON_RODS,
  SAND_TYPES,
  TRIP_SIZES,
  DELIVERY_FEE,
  formatNaira
} from "./materials-data.js";
import { addItem, onCartChange, getCount, getTotal, clearCart } from "./cart.js";

/* ----------------------------------------------------------
   Cement & Iron Rod cards (shared shape: unit + stepper)
   ---------------------------------------------------------- */
function buildMaterialCard(item) {
  const card = document.createElement("div");
  card.className = "material-card";

  card.innerHTML = `
    <h3 class="font-display font-semibold text-base mb-1">${item.name}</h3>
    <p class="font-mono text-xs text-slate-400 mb-4">per ${item.unit}</p>
    <p class="font-mono text-xl font-semibold text-amber mb-5">${formatNaira(item.price)}</p>

    <div class="mt-auto flex items-center justify-between gap-3">
      <div class="qty-stepper">
        <button type="button" data-action="dec" aria-label="Decrease quantity">&minus;</button>
        <input type="text" inputmode="numeric" value="0" readonly>
        <button type="button" data-action="inc" aria-label="Increase quantity">&plus;</button>
      </div>
      <button type="button" class="add-btn font-mono text-xs uppercase tracking-wider text-amber border border-amber px-3 py-2 hover:bg-amber hover:text-charcoal-deep transition-colors">
        Add
      </button>
    </div>
  `;

  const qtyInput = card.querySelector("input");
  const decBtn = card.querySelector('[data-action="dec"]');
  const incBtn = card.querySelector('[data-action="inc"]');
  const addBtn = card.querySelector(".add-btn");

  decBtn.addEventListener("click", () => {
    const next = Math.max(0, Number(qtyInput.value) - 1);
    qtyInput.value = String(next);
  });

  incBtn.addEventListener("click", () => {
    qtyInput.value = String(Number(qtyInput.value) + 1);
  });

  addBtn.addEventListener("click", () => {
    const qty = Number(qtyInput.value);
    if (qty <= 0) return;

    addItem({ id: item.id, label: item.name, unit: item.unit, qty, unitPrice: item.price });
    qtyInput.value = "0";
    flashAdded(addBtn);
  });

  return card;
}

function flashAdded(button) {
  const original = button.textContent;
  button.textContent = "Added";
  button.classList.add("bg-amber", "text-charcoal-deep");
  setTimeout(() => {
    button.textContent = original;
    button.classList.remove("bg-amber", "text-charcoal-deep");
  }, 1100);
}

function renderCement() {
  const grid = document.getElementById("cement-grid");
  if (!grid) return;
  CEMENT.forEach((item) => grid.appendChild(buildMaterialCard(item)));
}

function renderRods() {
  const grid = document.getElementById("rods-grid");
  if (!grid) return;
  IRON_RODS.forEach((item) => grid.appendChild(buildMaterialCard(item)));
}

/* ----------------------------------------------------------
   Sand & Tipper calculator
   ---------------------------------------------------------- */
const sandState = { type: null, trip: null };

function renderSandSelectors() {
  const typeWrap = document.getElementById("sand-type-selector");
  const tripWrap = document.getElementById("sand-trip-selector");
  if (!typeWrap || !tripWrap) return;

  SAND_TYPES.forEach((type, index) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "sand-chip";
    chip.textContent = type.name;
    chip.dataset.id = type.id;

    chip.addEventListener("click", () => {
      sandState.type = type;
      selectChip(typeWrap, chip);
      updateSandEstimate();
    });

    typeWrap.appendChild(chip);
    if (index === 0) chip.click();
  });

  TRIP_SIZES.forEach((trip, index) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "sand-chip";
    chip.textContent = trip.name;
    chip.dataset.id = trip.id;

    chip.addEventListener("click", () => {
      sandState.trip = trip;
      selectChip(tripWrap, chip);
      updateSandEstimate();
    });

    tripWrap.appendChild(chip);
    if (index === 1) chip.click();
  });
}

function selectChip(container, activeChip) {
  container.querySelectorAll(".sand-chip").forEach((chip) => chip.classList.remove("active"));
  activeChip.classList.add("active");
}

function updateSandEstimate() {
  const typeEl = document.getElementById("sand-est-type");
  const tripEl = document.getElementById("sand-est-trip");
  const deliveryEl = document.getElementById("sand-est-delivery");
  const totalEl = document.getElementById("sand-est-total");
  if (!typeEl || !sandState.type || !sandState.trip) return;

  const subtotal = sandState.type.pricePerTon * sandState.trip.tons;
  const total = subtotal + DELIVERY_FEE;

  typeEl.textContent = sandState.type.name;
  tripEl.textContent = sandState.trip.name;
  deliveryEl.textContent = formatNaira(DELIVERY_FEE);
  totalEl.textContent = formatNaira(total);
}

function initSandAddButton() {
  const addBtn = document.getElementById("sand-add-btn");
  if (!addBtn) return;

  addBtn.addEventListener("click", () => {
    if (!sandState.type || !sandState.trip) return;

    const label = `${sandState.type.name} (${sandState.trip.name})`;
    const unitPrice = sandState.type.pricePerTon * sandState.trip.tons + DELIVERY_FEE;

    addItem({
      id: `sand-${sandState.type.id}-${sandState.trip.id}-${Date.now()}`,
      label,
      unit: "trip",
      qty: 1,
      unitPrice
    });

    flashAdded(addBtn);
  });
}

/* ----------------------------------------------------------
   Catalog tabs
   ---------------------------------------------------------- */
function initTabs() {
  const tabs = document.querySelectorAll(".catalog-tab");
  const panels = document.querySelectorAll(".catalog-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;

      tabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      panels.forEach((panel) => panel.classList.add("hidden"));
      document.getElementById(`panel-${target}`)?.classList.remove("hidden");
    });
  });
}

/* ----------------------------------------------------------
   Order bar (sticky cart summary)
   ---------------------------------------------------------- */
function initOrderBar(onSend) {
  const bar = document.getElementById("order-bar");
  const countEl = document.getElementById("order-bar-count");
  const totalEl = document.getElementById("order-bar-total");
  const clearBtn = document.getElementById("order-bar-clear");
  const sendBtn = document.getElementById("order-bar-send");
  if (!bar) return;

  onCartChange(() => {
    const count = getCount();

    if (count === 0) {
      bar.classList.add("hidden");
      return;
    }

    bar.classList.remove("hidden");
    countEl.textContent = `${count} item${count === 1 ? "" : "s"}`;
    totalEl.textContent = formatNaira(getTotal());
  });

  clearBtn.addEventListener("click", clearCart);
  sendBtn.addEventListener("click", () => onSend());
}

export function initCatalog({ onSendOrder }) {
  renderCement();
  renderRods();
  renderSandSelectors();
  updateSandEstimate();
  initSandAddButton();
  initTabs();
  initOrderBar(onSendOrder);
}
