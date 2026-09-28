const COLUMN_COUNT = 5;
const STORAGE_KEY = "priceCompareGridInputs";

const rows = {
  quantity: Array(COLUMN_COUNT).fill(""),
  boxes: Array(COLUMN_COUNT).fill(""),
  price: Array(COLUMN_COUNT).fill(""),
  shipping: Array(COLUMN_COUNT).fill(""),
  link: Array(COLUMN_COUNT).fill("")
};

const inputs = Array.from(document.querySelectorAll("input[data-row][data-col]"));
const normalTable = document.getElementById("normalTable");
const transposedTable = document.getElementById("transposedTable");

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

function parseNonNegativeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function formatUnitPrice(value) {
  return value.toLocaleString("ja-JP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatTotalPrice(value) {
  return value.toLocaleString("ja-JP", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

function setOutputText(outputName, col, value) {
  const outputs = document.querySelectorAll(`[data-output="${outputName}"][data-col="${col}"]`);
  for (const output of outputs) {
    output.textContent = value;
  }
}

function updateCalculatedRows() {
  const unitPrices = Array(COLUMN_COUNT).fill(null);

  for (let i = 0; i < COLUMN_COUNT; i += 1) {
    const quantity = parsePositiveNumber(rows.quantity[i]);
    const boxes = parsePositiveNumber(rows.boxes[i]);
    const price = parseNonNegativeNumber(rows.price[i]);
    const shipping = parseNonNegativeNumber(rows.shipping[i]);

    if (price !== null && shipping !== null) {
      const totalPrice = price + shipping;
      setOutputText("total", i, formatTotalPrice(totalPrice));

      if (quantity && boxes) {
        unitPrices[i] = totalPrice / (quantity * boxes);
        setOutputText("unit", i, formatUnitPrice(unitPrices[i]));
      } else {
        setOutputText("unit", i, "");
      }
    } else {
      setOutputText("total", i, "");
      setOutputText("unit", i, "");
    }
  }

  const validUnitPrices = unitPrices.filter((value) => value !== null);
  const minUnitPrice = validUnitPrices.length > 0 ? Math.min(...validUnitPrices) : null;

  for (let i = 0; i < COLUMN_COUNT; i += 1) {
    const isCheapest = minUnitPrice !== null && unitPrices[i] === minUnitPrice;
    setOutputText("cheapest", i, isCheapest ? "★" : "");
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

function registerTransposeButtonHandler() {
  const transposeButton = document.getElementById("transposeButton");
  let isTransposed = false;

  transposeButton.addEventListener("click", () => {
    isTransposed = !isTransposed;
    normalTable.classList.toggle("hidden", isTransposed);
    transposedTable.classList.toggle("hidden", !isTransposed);
    transposeButton.textContent = isTransposed ? "元に戻す" : "行列を入れ替える";
  });
}

async function initialize() {
  await loadState();
  renderInputs();
  updateCalculatedRows();
  registerInputHandlers();
  registerClearButtonHandler();
  registerTransposeButtonHandler();
}

void initialize();
