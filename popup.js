const INITIAL_CANDIDATE_COUNT = 5;
const STORAGE_KEY = "priceCompareGridInputs";
const INPUT_KEYS = ["quantity", "boxes", "price", "shipping", "link"];
const OUTPUT_KEYS = ["total", "unit"];
const DISPLAY_KEYS = ["quantity", "boxes", "price", "shipping", "total", "unit", "link"];
const translations = {
  ja: { title: "価格比較グリッド", transpose: "横向き表示", restore: "縦向き表示", clear: "クリア", addCandidate: "候補を追加", candidate: "候補", quantity: "1箱の入り数（個）", boxes: "購入箱数（箱）", price: "商品価格（円）", shipping: "送料（円）", total: "支払総額（円）", unit: "1個あたり単価（円）", link: "リンク", formula: "計算式", aria: "操作" },
  en: { title: "Price Comparison Grid", transpose: "Wide view", restore: "Tall view", clear: "Clear", addCandidate: "Add option", candidate: "Option", quantity: "Items per box", boxes: "Boxes", price: "Item price", shipping: "Shipping", total: "Total paid", unit: "Price per item", link: "Link", formula: "Formula", aria: "Actions" },
  zh: { title: "价格比较表", transpose: "横向显示", restore: "纵向显示", clear: "清除", addCandidate: "添加选项", candidate: "选项", quantity: "每箱数量", boxes: "购买箱数", price: "商品价格", shipping: "运费", total: "支付总额", unit: "每件单价", link: "链接", formula: "计算公式", aria: "操作" },
  hi: { title: "मूल्य तुलना", transpose: "चौड़ा दृश्य", restore: "लंबा दृश्य", clear: "साफ़ करें", addCandidate: "विकल्प जोड़ें", candidate: "विकल्प", quantity: "प्रति बॉक्स वस्तुएँ", boxes: "बॉक्स", price: "वस्तु मूल्य", shipping: "शिपिंग", total: "कुल भुगतान", unit: "प्रति वस्तु मूल्य", link: "लिंक", formula: "सूत्र", aria: "क्रियाएँ" },
  es: { title: "Comparador de precios", transpose: "Vista ancha", restore: "Vista alta", clear: "Borrar", addCandidate: "Añadir opción", candidate: "Opción", quantity: "Artículos por caja", boxes: "Cajas", price: "Precio", shipping: "Envío", total: "Total pagado", unit: "Precio por artículo", link: "Enlace", formula: "Fórmula", aria: "Acciones" },
  fr: { title: "Comparateur de prix", transpose: "Vue large", restore: "Vue haute", clear: "Effacer", addCandidate: "Ajouter une option", candidate: "Option", quantity: "Articles par boîte", boxes: "Boîtes", price: "Prix", shipping: "Livraison", total: "Total payé", unit: "Prix par article", link: "Lien", formula: "Formule", aria: "Actions" },
  ar: { title: "مقارنة الأسعار", transpose: "عرض عريض", restore: "عرض طويل", clear: "مسح", addCandidate: "إضافة خيار", candidate: "خيار", quantity: "العناصر في الصندوق", boxes: "الصناديق", price: "سعر المنتج", shipping: "الشحن", total: "الإجمالي المدفوع", unit: "السعر لكل عنصر", link: "الرابط", formula: "الصيغة", aria: "الإجراءات" },
  bn: { title: "মূল্য তুলনা", transpose: "প্রশস্ত দৃশ্য", restore: "লম্বা দৃশ্য", clear: "পরিষ্কার", addCandidate: "বিকল্প যোগ করুন", candidate: "বিকল্প", quantity: "প্রতি বাক্সে পণ্য", boxes: "বাক্স", price: "পণ্যের দাম", shipping: "শিপিং", total: "মোট প্রদান", unit: "প্রতি পণ্যের দাম", link: "লিংক", formula: "সূত্র", aria: "কার্যক্রম" },
  pt: { title: "Comparador de preços", transpose: "Vista ampla", restore: "Vista alta", clear: "Limpar", addCandidate: "Adicionar opção", candidate: "Opção", quantity: "Itens por caixa", boxes: "Caixas", price: "Preço", shipping: "Frete", total: "Total pago", unit: "Preço por item", link: "Link", formula: "Fórmula", aria: "Ações" },
  ru: { title: "Сравнение цен", transpose: "Широкий вид", restore: "Высокий вид", clear: "Очистить", addCandidate: "Добавить вариант", candidate: "Вариант", quantity: "Товаров в коробке", boxes: "Коробки", price: "Цена товара", shipping: "Доставка", total: "Итого", unit: "Цена за товар", link: "Ссылка", formula: "Формула", aria: "Действия" },
  ko: { title: "가격 비교표", transpose: "가로 보기", restore: "세로 보기", clear: "지우기", addCandidate: "후보 추가", candidate: "후보", quantity: "상자당 수량", boxes: "구매 상자 수", price: "상품 가격", shipping: "배송비", total: "총 결제액", unit: "개당 가격", link: "링크", formula: "계산식", aria: "작업" }
};

const RTL_LOCALES = ["ar"];
const FULL_WIDTH_PAREN_LOCALES = ["ja", "zh"];

let locale = "ja";
let isTransposed = true;
let rows = createEmptyRows();
const normalTable = document.getElementById("normalTable");
const transposedTable = document.getElementById("transposedTable");
const transposeButton = document.getElementById("transposeButton");
const hasSessionStorageApi = typeof chrome !== "undefined" && chrome.storage && chrome.storage.session;

function createEmptyRows() {
  return Object.fromEntries(INPUT_KEYS.map((key) => [key, Array(INITIAL_CANDIDATE_COUNT).fill("")]));
}

async function loadState() {
  if (!hasSessionStorageApi) return;

  const { [STORAGE_KEY]: saved } = await chrome.storage.session.get(STORAGE_KEY);
  if (!saved || typeof saved !== "object") return;

  for (const key of INPUT_KEYS) {
    if (Array.isArray(saved[key])) {
      rows[key] = saved[key].map((value) => `${value ?? ""}`);
    }
  }

  const count = getCandidateCount();
  for (const key of INPUT_KEYS) {
    while (rows[key].length < count) rows[key].push("");
  }
}

async function persistState() {
  if (!hasSessionStorageApi) return;
  await chrome.storage.session.set({ [STORAGE_KEY]: rows });
}

async function clearState() {
  if (!hasSessionStorageApi) return;
  await chrome.storage.session.remove(STORAGE_KEY);
}

function getCandidateCount() {
  return Math.max(...INPUT_KEYS.map((key) => rows[key].length), INITIAL_CANDIDATE_COUNT);
}

function getText(key) {
  return translations[locale][key] ?? translations.en[key];
}

function selectLocale() {
  const language = (navigator.languages?.[0] || navigator.language || "ja").toLowerCase();
  const prefix = language.split("-")[0];
  locale = translations[prefix] ? prefix : "en";
}

function applyTranslations() {
  document.documentElement.lang = locale;
  document.documentElement.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
  document.title = getText("title");
  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = getText(element.dataset.i18n);
  }
  document.querySelector(".actions").setAttribute("aria-label", getText("aria"));
  normalTable.setAttribute("aria-label", getText("title"));
  transposedTable.setAttribute("aria-label", getText("title"));
  renderFormula();
}

// CJK text uses full-width parentheses; other scripts use ASCII ones.
function renderFormula() {
  const [open, close] = FULL_WIDTH_PAREN_LOCALES.includes(locale) ? ["（", "）"] : [" (", ") "];
  const term = (key) => `<span>${escapeHtml(getText(key))}</span>`;
  const formula = document.querySelector(".formula");
  formula.setAttribute("aria-label", getText("formula"));
  formula.innerHTML =
    `${term("total")} =${open}${term("price")} × ${term("boxes")}${close}+ ${term("shipping")}<br />` +
    `${term("unit")} = ${term("total")} ÷${open}${term("quantity")} × ${term("boxes")}${close}`.trimEnd();
}

function escapeHtml(value) {
  return `${value}`.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function parseNumber(value, { allowZero }) {
  if (`${value ?? ""}`.trim() === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed > 0 || (allowZero && parsed === 0) ? parsed : null;
}

function formatPrice(value, minimumFractionDigits) {
  // Latin digits keep results consistent with the number inputs in every locale.
  return value.toLocaleString(`${locale}-u-nu-latn`, { minimumFractionDigits, maximumFractionDigits: 2 });
}

function inputCell(key, col) {
  const isLink = key === "link";
  const isCount = key === "quantity" || key === "boxes";
  const typeAttributes = isLink
    ? `type="url" inputmode="url"`
    : `type="number" min="0" step="${isCount ? "1" : "0.01"}" inputmode="${isCount ? "numeric" : "decimal"}"`;
  const value = escapeHtml(rows[key][col] ?? "");
  return `<td data-candidate-col="${col}"><input data-row="${key}" data-col="${col}" ${typeAttributes} value="${value}" /></td>`;
}

function outputCell(key, col) {
  if (key === "unit") {
    return `<td data-candidate-col="${col}"><span data-output="cheapest" data-col="${col}"></span><span data-output="unit" data-col="${col}"></span></td>`;
  }
  return `<td data-output="${key}" data-col="${col}" data-candidate-col="${col}"></td>`;
}

function bodyCell(key, col) {
  return OUTPUT_KEYS.includes(key) ? outputCell(key, col) : inputCell(key, col);
}

function candidateLabel(col) {
  return `${getText("candidate")} ${col + 1}`;
}

function renderNormalTable(columns) {
  const header = columns.map((col) => `<th scope="col" data-candidate-col="${col}">${candidateLabel(col)}</th>`).join("");
  const body = DISPLAY_KEYS.map((key) =>
    `<tr><th scope="row" data-calc-key="${key}">${getText(key)}</th>${columns.map((col) => bodyCell(key, col)).join("")}</tr>`
  ).join("");
  return `<thead><tr><th scope="col">${getText("candidate")}</th>${header}</tr></thead><tbody>${body}</tbody>`;
}

function renderTransposedTable(columns) {
  const header = DISPLAY_KEYS.map((key) => `<th scope="col" data-calc-key="${key}">${getText(key)}</th>`).join("");
  const body = columns.map((col) =>
    `<tr data-candidate-col="${col}"><th scope="row">${candidateLabel(col)}</th>${DISPLAY_KEYS.map((key) => bodyCell(key, col)).join("")}</tr>`
  ).join("");
  return `<thead><tr><th scope="col">${getText("candidate")}</th>${header}</tr></thead><tbody>${body}</tbody>`;
}

// Only the visible table is rendered so each input exists once in the DOM.
function renderTables() {
  const columns = Array.from({ length: getCandidateCount() }, (_, col) => col);
  normalTable.innerHTML = isTransposed ? "" : renderNormalTable(columns);
  transposedTable.innerHTML = isTransposed ? renderTransposedTable(columns) : "";
  normalTable.classList.toggle("hidden", isTransposed);
  transposedTable.classList.toggle("hidden", !isTransposed);
  transposeButton.textContent = getText(isTransposed ? "transpose" : "restore");
  updateCalculatedRows();
}

function setOutput(key, col, text) {
  const output = document.querySelector(`[data-output="${key}"][data-col="${col}"]`);
  if (output) output.textContent = text;
}

function calculateCandidate(col) {
  const values = ["quantity", "boxes", "price", "shipping"].map((key) => rows[key][col]);
  if (values.every((value) => `${value ?? ""}`.trim() === "")) return null;

  const quantity = parseNumber(rows.quantity[col], { allowZero: false }) ?? 1;
  const boxes = parseNumber(rows.boxes[col], { allowZero: false }) ?? 1;
  const price = parseNumber(rows.price[col], { allowZero: true }) ?? 0;
  const shipping = parseNumber(rows.shipping[col], { allowZero: true }) ?? 0;
  const total = price * boxes + shipping;
  return { total, unit: total / (quantity * boxes) };
}

function updateCalculatedRows() {
  const count = getCandidateCount();
  const results = Array.from({ length: count }, (_, col) => calculateCandidate(col));
  const unitPrices = results.filter(Boolean).map((result) => result.unit);
  const minUnitPrice = unitPrices.length > 0 ? Math.min(...unitPrices) : null;

  results.forEach((result, col) => {
    const isCheapest = result !== null && result.unit === minUnitPrice;
    setOutput("total", col, result ? formatPrice(result.total, 0) : "");
    setOutput("unit", col, result ? formatPrice(result.unit, 2) : "");
    setOutput("cheapest", col, isCheapest ? "★" : "");
    for (const cell of document.querySelectorAll(`[data-candidate-col="${col}"]`)) {
      cell.classList.toggle("cheapest", isCheapest);
    }
  });
}

function registerEventHandlers() {
  document.addEventListener("input", async (event) => {
    const target = event.target.closest("input[data-row][data-col]");
    if (!target) return;
    rows[target.dataset.row][Number(target.dataset.col)] = target.value;
    updateCalculatedRows();
    await persistState();
  });

  document.getElementById("clearButton").addEventListener("click", async () => {
    rows = createEmptyRows();
    renderTables();
    await clearState();
  });

  transposeButton.addEventListener("click", () => {
    isTransposed = !isTransposed;
    renderTables();
  });

  document.getElementById("addCandidateButton").addEventListener("click", async () => {
    for (const key of INPUT_KEYS) rows[key].push("");
    renderTables();
    await persistState();
  });
}

async function initialize() {
  selectLocale();
  await loadState();
  applyTranslations();
  renderTables();
  registerEventHandlers();
}

void initialize();
