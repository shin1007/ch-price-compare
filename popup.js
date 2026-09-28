const COLUMN_COUNT = 5;
const STORAGE_KEY = "priceCompareGridInputs";

const rows = {
  quantity: Array(COLUMN_COUNT).fill(""),
  boxes: Array(COLUMN_COUNT).fill(""),
  price: Array(COLUMN_COUNT).fill("")
};

const inputs = Array.from(document.querySelectorAll("input[data-row][data-col]"));
const cheapestOutputs = Array.from(document.querySelectorAll('[data-output="cheapest"]'));
const unitOutputs = Array.from(document.querySelectorAll('[data-output="unit"]'));

const hasSessionStorageApi =
  typeof chrome !== "undefined" && chrome.storage && chrome.storage.session;

async function loadState() {
  if (!hasSessionStorageApi) {
    return;
  }

  const result = await chrome.storage.session.get(STORAGE_KEY);
  const saved = result[STORAGE_KEY];

  if (!saved || typeof saved !== "object") {
    return;
  }

  for (const key of Object.keys(rows)) {
    if (!Array.isArray(saved[key])) {
      continue;
    }

    rows[key] = saved[key].slice(0, COLUMN_COUNT).map((value) => `${value ?? ""}`);
  }
}

function renderInputs() {
  for (const input of inputs) {
    const row = input.dataset.row;
    const col = Number(input.dataset.col);
    input.value = rows[row][col] ?? "";
  }
}

function parsePositiveNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function formatUnitPrice(value) {
  return value.toLocaleString("ja-JP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function updateCalculatedRows() {
  const unitPrices = Array(COLUMN_COUNT).fill(null);

  for (let i = 0; i < COLUMN_COUNT; i += 1) {
    const quantity = parsePositiveNumber(rows.quantity[i]);
    const boxes = parsePositiveNumber(rows.boxes[i]);
    const price = parsePositiveNumber(rows.price[i]);

    if (quantity && boxes && price) {
      unitPrices[i] = price / (quantity * boxes);
      unitOutputs[i].textContent = formatUnitPrice(unitPrices[i]);
    } else {
      unitOutputs[i].textContent = "";
    }
  }

  const validUnitPrices = unitPrices.filter((value) => value !== null);
  const minUnitPrice = validUnitPrices.length > 0 ? Math.min(...validUnitPrices) : null;

  for (let i = 0; i < COLUMN_COUNT; i += 1) {
    const isCheapest = minUnitPrice !== null && unitPrices[i] === minUnitPrice;
    cheapestOutputs[i].textContent = isCheapest ? "★" : "";
  }
}

async function persistState() {
  if (!hasSessionStorageApi) {
    return;
  }

  await chrome.storage.session.set({ [STORAGE_KEY]: rows });
}

function registerInputHandlers() {
  for (const input of inputs) {
    input.addEventListener("input", async (event) => {
      const target = event.currentTarget;
      const row = target.dataset.row;
      const col = Number(target.dataset.col);

      rows[row][col] = target.value;
      updateCalculatedRows();
      await persistState();
    });
  }
}

function registerClearButtonHandler() {
  const clearButton = document.getElementById("clearButton");

  clearButton.addEventListener("click", async () => {
    for (const key of Object.keys(rows)) {
      rows[key] = Array(COLUMN_COUNT).fill("");
    }

    renderInputs();
    updateCalculatedRows();

    if (hasSessionStorageApi) {
      await chrome.storage.session.remove(STORAGE_KEY);
    }
  });
}

async function initialize() {
  await loadState();
  renderInputs();
  updateCalculatedRows();
  registerInputHandlers();
  registerClearButtonHandler();
}

void initialize();
