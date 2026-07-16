import { SAND_TYPES, TRIP_SIZES } from "./materials-data.js";
import { clearCart } from "./cart.js";

const WHATSAPP_NUMBER = "2348135124464";
const TYPING_DELAY_MS = 650;

const state = {
  location: "",
  materials: "",
  sandType: "",
  tripSize: "",
  name: "",
  projectType: ""
};

let elements = null;
let hasOpenedBefore = false;

/* ----------------------------------------------------------
   DOM helpers
   ---------------------------------------------------------- */
function scrollToBottom() {
  elements.messages.scrollTop = elements.messages.scrollHeight;
}

function appendUserMessage(text) {
  const row = document.createElement("div");
  row.className = "wa-row justify-end";
  row.innerHTML = `<div class="wa-bubble wa-bubble-user">${escapeHtml(text)}</div>`;
  elements.messages.appendChild(row);
  scrollToBottom();
}

function appendBotMessage(text, quickReplies = []) {
  return new Promise((resolve) => {
    const typingRow = document.createElement("div");
    typingRow.className = "wa-row";
    typingRow.innerHTML = `<div class="wa-typing"><span></span><span></span><span></span></div>`;
    elements.messages.appendChild(typingRow);
    scrollToBottom();

    setTimeout(() => {
      typingRow.remove();

      const row = document.createElement("div");
      row.className = "wa-row flex-col items-start";

      const bubble = document.createElement("div");
      bubble.className = "wa-bubble wa-bubble-bot";
      bubble.textContent = text;
      row.appendChild(bubble);

      if (quickReplies.length > 0) {
        const repliesWrap = document.createElement("div");
        repliesWrap.className = "wa-quick-replies";
        quickReplies.forEach((reply) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "wa-quick-reply-btn";
          btn.textContent = reply.label;
          btn.addEventListener("click", () => {
            appendUserMessage(reply.label);
            repliesWrap.remove();
            reply.action();
          });
          repliesWrap.appendChild(btn);
        });
        row.appendChild(repliesWrap);
      }

      elements.messages.appendChild(row);
      scrollToBottom();
      resolve();
    }, TYPING_DELAY_MS);
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function clearInputZone() {
  elements.inputZone.innerHTML = "";
}

/* ----------------------------------------------------------
   Input zone builders
   ---------------------------------------------------------- */
function showTextInput({ placeholder, onSubmit }) {
  clearInputZone();

  const form = document.createElement("form");
  form.className = "flex gap-2";
  form.innerHTML = `
    <input type="text" class="wa-text-input" placeholder="${placeholder}" required>
    <button type="submit" class="wa-send-btn" style="width:auto; margin-top:0;">Send</button>
  `;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector("input");
    const value = input.value.trim();
    if (!value) return;

    clearInputZone();
    onSubmit(value);
  });

  elements.inputZone.appendChild(form);
  form.querySelector("input").focus({ preventScroll: true });
}

function showTextArea({ placeholder, prefillValue, onSubmit }) {
  clearInputZone();

  const form = document.createElement("form");
  form.innerHTML = `
    <textarea class="wa-text-input" rows="3" placeholder="${placeholder}" required>${escapeHtml(prefillValue || "")}</textarea>
    <button type="submit" class="wa-send-btn">Send</button>
  `;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = form.querySelector("textarea").value.trim();
    if (!value) return;

    clearInputZone();
    onSubmit(value);
  });

  elements.inputZone.appendChild(form);
}

function showSandDropdowns({ onSubmit }) {
  clearInputZone();

  const form = document.createElement("form");
  form.className = "space-y-3";

  const typeOptions = SAND_TYPES.map((t) => `<option value="${t.name}">${t.name}</option>`).join("");
  const tripOptions = TRIP_SIZES.map((t) => `<option value="${t.name}">${t.name}</option>`).join("");

  form.innerHTML = `
    <div>
      <label class="wa-field-label">Sand type</label>
      <select class="wa-select-input" name="sandType">${typeOptions}</select>
    </div>
    <div>
      <label class="wa-field-label">Trip size</label>
      <select class="wa-select-input" name="tripSize">${tripOptions}</select>
    </div>
    <button type="submit" class="wa-send-btn">Confirm selection</button>
  `;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const sandType = form.querySelector('[name="sandType"]').value;
    const tripSize = form.querySelector('[name="tripSize"]').value;
    clearInputZone();
    onSubmit({ sandType, tripSize });
  });

  elements.inputZone.appendChild(form);
}

function showGenerateButton(flowType) {
  clearInputZone();

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "wa-send-btn";
  btn.textContent = "Generate Order & Send on WhatsApp";
  btn.addEventListener("click", () => sendToWhatsApp(flowType));

  elements.inputZone.appendChild(btn);
}

/* ----------------------------------------------------------
   Flows
   ---------------------------------------------------------- */
async function startWelcomeFlow() {
  elements.messages.innerHTML = "";
  clearInputZone();
  resetState();

  await appendBotMessage(
    "Hello! I am Hillary's digital assistant. How can we help you build today?",
    [
      { label: "Order Cement / Rods", action: () => startCementFlow() },
      { label: "Book Sand (Tipper Delivery)", action: () => startSandFlow() },
      { label: "Request Construction Consultation", action: () => startConsultationFlow() }
    ]
  );
}

async function startCementFlow(prefillMaterials) {
  await appendBotMessage("Great! What is your delivery location?");
  showTextInput({
    placeholder: "e.g. Nkwo, Umachi",
    onSubmit: async (value) => {
      state.location = value;
      appendUserMessage(value);
      await appendBotMessage("What materials do you need?");
      showTextArea({
        placeholder: "e.g. 50 bags Dangote cement, 20 lengths 12mm rod",
        prefillValue: prefillMaterials,
        onSubmit: async (materials) => {
          state.materials = materials;
          appendUserMessage(materials);
          await appendBotMessage("Perfect, I have everything I need. Tap below to send this to Hillary.");
          showGenerateButton("cement");
        }
      });
    }
  });
}

async function startSandFlow() {
  await appendBotMessage("Let's get your sand trip sorted. Choose your sand type and trip size below.");
  showSandDropdowns({
    onSubmit: async ({ sandType, tripSize }) => {
      state.sandType = sandType;
      state.tripSize = tripSize;
      appendUserMessage(`${sandType} - ${tripSize}`);
      await appendBotMessage("Great choice! What is your delivery location?");
      showTextInput({
        placeholder: "e.g. Ajah, Lagos",
        onSubmit: async (value) => {
          state.location = value;
          appendUserMessage(value);
          await appendBotMessage("Perfect, I have everything I need. Tap below to send this to Hillary.");
          showGenerateButton("sand");
        }
      });
    }
  });
}

async function startConsultationFlow() {
  await appendBotMessage("Nice! Let's set up a consultation. What is your full name?");
  showTextInput({
    placeholder: "Your full name",
    onSubmit: async (name) => {
      state.name = name;
      appendUserMessage(name);
      await appendBotMessage("What type of project is this? For example, a new building or a renovation.");
      showTextInput({
        placeholder: "e.g. New 3-bedroom bungalow",
        onSubmit: async (projectType) => {
          state.projectType = projectType;
          appendUserMessage(projectType);
          await appendBotMessage("And what location is the project at?");
          showTextInput({
            placeholder: "e.g. Ibeju-Lekki, Lagos",
            onSubmit: async (location) => {
              state.location = location;
              appendUserMessage(location);
              await appendBotMessage("Perfect, I have everything I need. Tap below to send this to Hillary.");
              showGenerateButton("consultation");
            }
          });
        }
      });
    }
  });
}

function resetState() {
  state.location = "";
  state.materials = "";
  state.sandType = "";
  state.tripSize = "";
  state.name = "";
  state.projectType = "";
}

/* ----------------------------------------------------------
   Message compilation + WhatsApp handoff
   ---------------------------------------------------------- */
function compileMessage(flowType) {
  if (flowType === "cement") {
    return [
      "Hello, I would like to place a materials order.",
      "",
      `Delivery location: ${state.location}`,
      `Materials needed: ${state.materials}`
    ].join("\n");
  }

  if (flowType === "sand") {
    return [
      "Hello, I would like to book a sand delivery.",
      "",
      `Sand type: ${state.sandType}`,
      `Trip size: ${state.tripSize}`,
      `Delivery location: ${state.location}`
    ].join("\n");
  }

  return [
    "Hello, I would like to request a construction consultation.",
    "",
    `Name: ${state.name}`,
    `Project type: ${state.projectType}`,
    `Project location: ${state.location}`
  ].join("\n");
}

function sendToWhatsApp(flowType) {
  const message = compileMessage(flowType);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  clearInputZone();
  appendBotMessage("Sending your request now. A member of the team will reply on WhatsApp shortly.");

  if (flowType === "cement") clearCart();

  window.open(url, "_blank", "noopener,noreferrer");
}

/* ----------------------------------------------------------
   Panel open / close
   ---------------------------------------------------------- */
function openPanel() {
  elements.panel.classList.remove("hidden");
  elements.tooltip.classList.add("hidden");

  if (!hasOpenedBefore) {
    hasOpenedBefore = true;
    startWelcomeFlow();
  }
}

function closePanel() {
  elements.panel.classList.add("hidden");
}

/* ----------------------------------------------------------
   Public API
   ---------------------------------------------------------- */
export function initWhatsAppChat() {
  elements = {
    badge: document.getElementById("wa-badge"),
    tooltip: document.getElementById("wa-tooltip"),
    panel: document.getElementById("wa-panel"),
    closeBtn: document.getElementById("wa-close"),
    closeBtnDesktop: document.getElementById("wa-close-desktop"),
    messages: document.getElementById("wa-messages"),
    inputZone: document.getElementById("wa-input-zone")
  };

  elements.badge.addEventListener("click", openPanel);
  elements.closeBtn.addEventListener("click", closePanel);
  elements.closeBtnDesktop.addEventListener("click", closePanel);

  return {
    open: openPanel,
    openWithCementOrder: (materialsText) => {
      elements.panel.classList.remove("hidden");
      elements.tooltip.classList.add("hidden");
      hasOpenedBefore = true;
      resetState();
      elements.messages.innerHTML = "";
      clearInputZone();
      appendBotMessage("Looks like you already built an order below. Let's get it delivered.").then(() => {
        startCementFlow(materialsText);
      });
    }
  };
}
