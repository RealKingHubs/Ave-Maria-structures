# Site Guide: Okonkwo Structures

This guide explains how the site is put together and how to update it without breaking anything.

## 1. Folder structure

Keep this layout exactly as is. Everything is linked by relative paths, so moving or renaming files will break things unless you update the links too.

```
okonkwo-structures/
│
├── index.html
│
├── css/
│   └── styles.css
│
└── js/
    ├── main.js
    ├── cart.js
    ├── catalog.js
    ├── materials-data.js
    ├── projects.js
    ├── projects-data.js
    └── whatsapp-chat.js
```

- `index.html` stays at the top level.
- `css/` and `js/` sit next to it, not inside each other.
- All the `.js` files stay together in `js/`, since they import each other using paths like `./projects-data.js`.

## 2. How to view the site

Do not open `index.html` by double-clicking it. The scripts use JavaScript modules (`type="module"`), which browsers block when a page is opened directly from disk (a `file://` address).

Instead, serve it locally:

```
python3 -m http.server
```

Run that command from inside the `okonkwo-structures` folder, then visit `http://localhost:8000` in your browser.

If you don't have Python, any static file server works, for example the "Live Server" extension in VS Code.

When you upload the site to real hosting (Netlify, GitHub Pages, a shared host, etc.), this restriction doesn't apply. Just upload the whole folder as is.

## 3. How the scripts link together

`index.html` loads exactly one script tag, right before `</body>`:

```html
<script type="module" src="js/main.js"></script>
```

Everything else connects through `import` statements inside the JS files. The chain looks like this:

```
index.html
   └── js/main.js
          ├── js/catalog.js
          │      └── js/materials-data.js
          ├── js/projects.js
          │      └── js/projects-data.js
          ├── js/whatsapp-chat.js
          └── js/cart.js
```

You never add more `<script>` tags to `index.html` for new JS files. If a new file needs to run, you `import` it into `main.js` (or into whichever file already runs) and call its function from there.

Each JS file that renders content onto the page finds its target element using `document.getElementById(...)`, matching an `id` that already exists in `index.html`. For example:

```js
// in projects.js
document.getElementById("projects-grid")
```
```html
<!-- in index.html -->
<div id="projects-grid"></div>
```

That id match is the link. If you rename an id in one place, rename it in the other too.

## 4. Managing the Materials Store

### 4a. Add a new item to an existing category (cement, rods, or sand)

Open `js/materials-data.js` and add one object to the matching array. No other file needs to change.

```js
export const CEMENT = [
  { id: "cem-dangote", name: "Dangote 3X", unit: "bag", price: 9200 },
  { id: "cem-bua", name: "BUA Cement", unit: "bag", price: 9000 },
  // new item:
  { id: "cem-unicem", name: "UNICEM", unit: "bag", price: 8900 }
];
```

Every item needs a unique `id`, a `name`, a `unit` (what it's priced per), and a `price` in Naira.

### 4b. Add a whole new category (e.g. Blocks, Roofing Sheets, Paint)

This needs three changes, following the pattern the existing categories already use.

**Step 1: Add the data**, in `js/materials-data.js`:

```js
export const BLOCKS = [
  { id: "block-6in", name: "6-Inch Blocks", unit: "block", price: 550 },
  { id: "block-9in", name: "9-Inch Blocks", unit: "block", price: 750 }
];
```

**Step 2: Add a tab button and an empty panel**, in `index.html`, inside the Materials Store section:

```html
<div class="flex gap-1 ..." id="catalog-tabs" role="tablist">
  <button class="catalog-tab" data-tab="cement" ...>01 / Cement</button>
  <button class="catalog-tab" data-tab="rods" ...>02 / Iron Rods</button>
  <button class="catalog-tab" data-tab="sand" ...>03 / Tipper Sand</button>
  <button class="catalog-tab" data-tab="blocks" ...>04 / Blocks</button>
</div>
```

```html
<div class="catalog-panel hidden" id="panel-blocks">
  <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" id="blocks-grid"></div>
</div>
```

The value in `data-tab="blocks"` must exactly match the panel id `panel-blocks`. That's how the tab-click code knows which panel to reveal.

**Step 3: Render it**, in `js/catalog.js`. Import the new data at the top of the file:

```js
import {
  CEMENT,
  IRON_RODS,
  SAND_TYPES,
  TRIP_SIZES,
  DELIVERY_FEE,
  BLOCKS,
  formatNaira
} from "./materials-data.js";
```

Add a render function, copying the shape of `renderCement()`:

```js
function renderBlocks() {
  const grid = document.getElementById("blocks-grid");
  if (!grid) return;
  BLOCKS.forEach((item) => grid.appendChild(buildMaterialCard(item)));
}
```

Call it inside `initCatalog()`, next to the others:

```js
export function initCatalog({ onSendOrder }) {
  renderCement();
  renderRods();
  renderBlocks();   // new line
  renderSandSelectors();
  updateSandEstimate();
  initSandAddButton();
  initTabs();
  initOrderBar(onSendOrder);
}
```

Tab switching, quantity steppers, and "Add to order" all work automatically for the new category, since they read from the item objects rather than being hardcoded to cement or rods.

If the new category needs something more custom than quantity + price, like the sand calculator's dropdowns, build a dedicated panel for it the way `panel-sand` is built, instead of reusing `buildMaterialCard`.

## 5. Managing the Projects Portfolio

### 5a. Add, edit, or remove a project

Open `js/projects-data.js`. Each project is one object in the `PROJECTS` array:

```js
{
  id: "ilupeju-duplex",
  title: "Ilupeju Family Duplex",
  category: "residential",       // must be "residential", "commercial", or "renovation"
  location: "Ilupeju, Lagos",
  year: 2025,
  status: "Completed",           // or "In progress"
  image: "https://images.unsplash.com/photo-...",
  alt: "Finished modern duplex with a glass front entrance",
  description: "A 4-bedroom duplex delivered from foundation to finishing in fourteen months."
}
```

To add a project, copy an existing object, give it a new `id`, and fill in the details. To remove one, delete its object from the array. No HTML or other JS changes are needed, the grid and the filter tabs both read from this array automatically.

### 5b. Using real photos of his buildings

Change the `image` value to point at the real photo:

- **Hosted photo (recommended):** upload the photo to your hosting alongside the site, in a folder such as `images/`, then reference it with a relative path:
  ```js
  image: "images/ilupeju-duplex-front.jpg",
  ```
- **External URL:** paste a direct link to the photo if it's hosted somewhere else.

Also update `alt` with a plain description of that specific photo. This is what screen readers announce and what shows if the image fails to load.

### 5c. Adding a new filter category

The filter tabs are tied to whatever `category` values exist in `PROJECTS`. To add a new one (say, "institutional"):

1. Use that value in the relevant project objects: `category: "institutional"`.
2. Add a matching tab button in `index.html`, next to the existing ones:
   ```html
   <button class="project-tab" data-filter="institutional" role="tab" aria-selected="false">Institutional</button>
   ```

No JS changes needed, `projects.js` filters by whatever `data-filter` value is clicked.

## 6. Quick reference: what to edit for common changes

| I want to...                              | Edit this file                          |
|--------------------------------------------|------------------------------------------|
| Change a material's price                  | `js/materials-data.js`                   |
| Add a cement brand / rod size / sand type  | `js/materials-data.js`                   |
| Add a whole new materials category         | `js/materials-data.js` + `index.html` + `js/catalog.js` |
| Add/edit/remove a project                  | `js/projects-data.js`                    |
| Swap a project photo                       | `js/projects-data.js` (`image` field)    |
| Change the WhatsApp number                 | `js/whatsapp-chat.js` (`WHATSAPP_NUMBER`)|
| Change site colors or fonts                | `<script>tailwind.config = {...}</script>` in `index.html`, and `css/styles.css` |
| Change the engineer's bio, name, or stats  | `index.html`, the About section          |
| Change delivery fee for sand               | `js/materials-data.js` (`DELIVERY_FEE`)  |

## 7. Before publishing, double check

- [ ] Real WhatsApp number set in `js/whatsapp-chat.js`
- [ ] Material prices in `js/materials-data.js` match current rates
- [ ] Project photos in `js/projects-data.js` are the real buildings, not placeholders
- [ ] Engineer's name, photo, and credentials in the About section are correct
- [ ] Phone number and email in the footer and Contact section are correct