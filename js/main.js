import { initCatalog } from "./catalog.js";
import { initWhatsAppChat } from "./whatsapp-chat.js";
import { formatCartAsText, getCount } from "./cart.js";
import { initProjects } from "./projects.js";

document.addEventListener("DOMContentLoaded", () => {
  initProjects();
});

/* ----------------------------------------------------------
   Sticky header shadow on scroll
   ---------------------------------------------------------- */
function initStickyHeader() {
  const header = document.getElementById("site-header");
  if (!header) return;

  const applyState = () => {
    if (window.scrollY > 12) {
      header.classList.add("scrolled");
      return;
    }
    header.classList.remove("scrolled");
  };

  applyState();
  window.addEventListener("scroll", applyState, { passive: true });
}

/* ----------------------------------------------------------
   Mobile menu toggle
   ---------------------------------------------------------- */
function initMobileMenu() {
  const toggle = document.getElementById("mobile-menu-toggle");
  const menu = document.getElementById("mobile-menu");
  const burgerIcon = document.getElementById("icon-burger");
  const closeIcon = document.getElementById("icon-close");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = !menu.classList.contains("hidden");

    menu.classList.toggle("hidden");
    burgerIcon.classList.toggle("hidden");
    closeIcon.classList.toggle("hidden");
    toggle.setAttribute("aria-expanded", String(!isOpen));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.add("hidden");
      burgerIcon.classList.remove("hidden");
      closeIcon.classList.add("hidden");
    });
  });
}

/* ----------------------------------------------------------
   Wire "Get Quote" buttons + order bar to the chat widget
   ---------------------------------------------------------- */
function initQuoteTriggers(chat) {
  const triggerIds = ["get-quote-btn", "get-quote-btn-mobile", "get-quote-btn-cta"];

  triggerIds.forEach((id) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener("click", () => chat.open());
  });
}

function initOrderHandoff(chat) {
  return () => {
    if (getCount() === 0) return;
    chat.openWithCementOrder(formatCartAsText());
  };
}

/* ----------------------------------------------------------
   Init
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initStickyHeader();
  initMobileMenu();

  const chat = initWhatsAppChat();
  initQuoteTriggers(chat);
  initCatalog({ onSendOrder: initOrderHandoff(chat) });
});
