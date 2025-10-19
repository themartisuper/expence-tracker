// ===== Localisation =====
const languageSelector = document.getElementById("language-selector");

async function loadLanguage(lang) {
  try {
    const response = await fetch(`./locales/${lang}.json`);
    if (!response.ok) throw new Error(`Cannot load language file: ${lang}`);
    const translations = await response.json();
    applyTranslations(translations);
    localStorage.setItem("lang", lang);
  } catch (err) {
    console.error(err);
  }
}

function applyTranslations(translations) {
  // Текстовые элементы
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[key]) el.textContent = translations[key];
  });

  // Placeholder'ы
  document.querySelectorAll("[data-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-placeholder");
    if (translations[key]) el.placeholder = translations[key];
  });
}

// Загружаем язык при старте
const savedLang = localStorage.getItem("lang") || "en";
loadLanguage(savedLang);
languageSelector.value = savedLang;

// Смена языка вручную
languageSelector.addEventListener("change", (e) => {
  const newLang = e.target.value;
  loadLanguage(newLang);
});
// ===== End localisation =====





const balanceEl = document.getElementById("balance");
const incomeAmountEl = document.getElementById("income-amount");
const expenseAmountEl = document.getElementById("expense-amount");
const transactionListEl = document.getElementById("transaction-list");
const transactionFormEl = document.getElementById("transaction-form");
const descriptionEl = document.getElementById("description");
const amountEl = document.getElementById("amount");
const clearBtnEl = document.getElementById("clear-btn");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// === Events ===
transactionFormEl.addEventListener("submit", addTransaction);
clearBtnEl.addEventListener("click", clearAllTransactions);
transactionListEl.addEventListener("click", handleDeleteClick);

// === Add Transaction ===
function addTransaction(e) {
  e.preventDefault();

  const description = descriptionEl.value.trim();
  const amount = Number(amountEl.value);

  if (!description || isNaN(amount) || amount === 0) {
    alert("Please enter a valid description and non-zero amount.");
    return;
  }

  transactions.push({
    id: Date.now(),
    description,
    amount,
  });

  saveTransactions();
  updateUI();

  transactionFormEl.reset();
}

// === Render Transactions ===
function updateTransactionList() {
  transactionListEl.innerHTML = "";
  const sortedTransactions = [...transactions].reverse();

  sortedTransactions.forEach((transaction) => {
    const li = document.createElement("li");
    li.classList.add(
      "transaction",
      transaction.amount > 0 ? "income" : "expense"
    );

    li.innerHTML = `
      <span>${transaction.description}</span>
      <span>
        ${formatCurrency(transaction.amount)}
        <button class="delete-btn" data-id="${transaction.id}">×</button>
      </span>
    `;

    transactionListEl.appendChild(li);
  });
}

// === Handle Delete ===
function handleDeleteClick(e) {
  if (!e.target.classList.contains("delete-btn")) return;
  const id = +e.target.dataset.id;
  removeTransaction(id);
}

// === Remove Transaction ===
function removeTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  saveTransactions();
  updateUI();
}

// === Update Summary ===
function updateSummary() {
  const balance = transactions.reduce((acc, t) => acc + t.amount, 0);
  const income = transactions
    .filter((t) => t.amount > 0)
    .reduce((a, t) => a + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((a, t) => a + t.amount, 0);

  balanceEl.textContent = formatCurrency(balance);
  incomeAmountEl.textContent = formatCurrency(income);
  expenseAmountEl.textContent = formatCurrency(expenses);

  balanceEl.style.color = balance >= 0 ? "#059669" : "#dc2626";
}

// === Helpers ===
function formatCurrency(number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(number);
}

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function clearAllTransactions() {
  if (!confirm("Clear all transactions?")) return;
  transactions = [];
  localStorage.removeItem("transactions");
  updateUI();
}

function updateUI() {
  updateTransactionList();
  updateSummary();
}

// === Init ===
updateUI();