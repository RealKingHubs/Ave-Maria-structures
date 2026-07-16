import { formatNaira } from "./materials-data.js";

const items = new Map();
const listeners = [];

function notify() {
  listeners.forEach((fn) => fn(getItems()));
}

export function onCartChange(fn) {
  listeners.push(fn);
}

export function addItem({ id, label, unit, qty, unitPrice }) {
  if (qty <= 0) return;

  const existing = items.get(id);
  if (existing) {
    existing.qty += qty;
    notify();
    return;
  }

  items.set(id, { id, label, unit, qty, unitPrice });
  notify();
}

export function removeItem(id) {
  items.delete(id);
  notify();
}

export function clearCart() {
  items.clear();
  notify();
}

export function getItems() {
  return Array.from(items.values());
}

export function getCount() {
  return getItems().reduce((sum, item) => sum + item.qty, 0);
}

export function getTotal() {
  return getItems().reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
}

export function formatCartAsText() {
  if (items.size === 0) return "";

  const lines = getItems().map((item) => {
    const lineTotal = formatNaira(item.qty * item.unitPrice);
    return `- ${item.label}: ${item.qty} x ${item.unit} (${lineTotal})`;
  });

  return lines.join("\n") + `\nEstimated total: ${formatNaira(getTotal())}`;
}
