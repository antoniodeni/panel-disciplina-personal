const DEFAULT_EXPENSE_CATEGORIES = [
  'AlimentaciÃ³n',
  'Vivienda',
  'Transporte',
  'Salud',
  'Ocio',
  'Compras',
  'Servicios',
  'Suscripciones',
  'EducaciÃ³n',
  'Deudas',
  'Otros gastos'
];

const DEFAULT_INCOME_CATEGORIES = [
  'NÃ³mina',
  'PrestaciÃ³n',
  'Freelance',
  'Ventas',
  'Transferencia recibida',
  'DevoluciÃ³n',
  'Otros ingresos'
];

const DEFAULT_CATEGORIES = [...new Set([...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES])];

const DEFAULT_ACCOUNTS = ['Cuenta personal'];

function todayIso(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function currentMonth(date = new Date()) {
  return todayIso(date).slice(0, 7);
}

function parseAmountToMinor(value) {
  const normalized = String(value).trim().replace(',', '.');
  if (!normalized || !/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, decimals = ''] = normalized.split('.');
  return Number(whole) * 100 + Number(decimals.padEnd(2, '0'));
}

function formatEuro(minor) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format((minor || 0) / 100);
}

function formatDate(isoDate) {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(`${isoDate}T12:00:00`));
}

function validateTransaction(input, categories = DEFAULT_CATEGORIES, accounts = DEFAULT_ACCOUNTS) {
  const amountMinor = parseAmountToMinor(input.amount);
  const date = String(input.date || todayIso());
  if (!amountMinor || amountMinor <= 0) return { ok: false, error: 'Escribe un importe positivo con hasta dos decimales.' };
  if (!['income', 'expense'].includes(input.kind)) return { ok: false, error: 'Elige si es un gasto o un ingreso.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, error: 'Selecciona una fecha vÃ¡lida.' };
  if (!categories.includes(input.category)) return { ok: false, error: 'Selecciona una categorÃ­a vÃ¡lida.' };
  if (!accounts.includes(input.account)) return { ok: false, error: 'Selecciona una cuenta vÃ¡lida.' };
  return {
    ok: true,
    value: {
      kind: input.kind,
      amountMinor,
      date,
      category: input.category,
      account: input.account,
      description: String(input.description || '').trim().slice(0, 80)
    }
  };
}

function amountMinorOf(transaction) {
  const amountMinor = Number(transaction.amountMinor);
  return Number.isFinite(amountMinor) ? amountMinor : 0;
}

function inMonth(transaction, month) {
  return String(transaction.date || '').slice(0, 7) === String(month);
}

function calculateSummary(transactions, month, startingBalanceMinor = 0, recurring = { incomeMinor: 0, expenseMinor: 0 }) {
  const periodTransactions = transactions.filter((transaction) => inMonth(transaction, month));
  const allIncome = transactions.filter((transaction) => transaction.kind === 'income').reduce((total, transaction) => total + amountMinorOf(transaction), 0);
  const allExpense = transactions.filter((transaction) => transaction.kind === 'expense').reduce((total, transaction) => total + amountMinorOf(transaction), 0);
  const incomeMinor = periodTransactions.filter((transaction) => transaction.kind === 'income').reduce((total, transaction) => total + amountMinorOf(transaction), 0);
  const expenseMinor = periodTransactions.filter((transaction) => transaction.kind === 'expense').reduce((total, transaction) => total + amountMinorOf(transaction), 0);
  return {
    availableMinor: startingBalanceMinor + allIncome - allExpense,
    incomeMinor,
    expenseMinor,
    forecastMinor: startingBalanceMinor + allIncome - allExpense + recurring.incomeMinor - recurring.expenseMinor,
    incomeCount: periodTransactions.filter((transaction) => transaction.kind === 'income').length,
    expenseCount: periodTransactions.filter((transaction) => transaction.kind === 'expense').length,
    periodTransactions
  };
}

function summarizePeriod(transactions, predicate) {
  const periodTransactions = transactions.filter(predicate);
  const expenses = periodTransactions.filter((transaction) => transaction.kind === 'expense');
  const incomes = periodTransactions.filter((transaction) => transaction.kind === 'income');
  const categoryTotals = expenses.reduce((totals, transaction) => {
    totals[transaction.category] = (totals[transaction.category] || 0) + amountMinorOf(transaction);
    return totals;
  }, {});
  const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  return {
    periodTransactions,
    expenseMinor: expenses.reduce((total, transaction) => total + amountMinorOf(transaction), 0),
    incomeMinor: incomes.reduce((total, transaction) => total + amountMinorOf(transaction), 0),
    expenseCount: expenses.length,
    incomeCount: incomes.length,
    topCategory: topCategoryEntry?.[0] || '',
    topCategoryMinor: topCategoryEntry?.[1] || 0
  };
}

function getWeekBounds(referenceDate = new Date()) {
  const date = new Date(referenceDate);
  date.setHours(12, 0, 0, 0);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(date);
  start.setDate(date.getDate() + mondayOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: todayIso(start), end: todayIso(end) };
}

function calculateWeeklyReport(transactions, referenceDate = new Date()) {
  const bounds = getWeekBounds(referenceDate);
  const report = summarizePeriod(transactions, (transaction) => transaction.date >= bounds.start && transaction.date <= bounds.end);
  return { ...report, ...bounds };
}

function calculateMonthlyReport(transactions, month) {
  return { ...summarizePeriod(transactions, (transaction) => inMonth(transaction, month)), month };
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

globalThis.DineroFinance = {
  DEFAULT_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_ACCOUNTS,
  todayIso,
  currentMonth,
  parseAmountToMinor,
  formatEuro,
  formatDate,
  validateTransaction,
  inMonth,
  calculateSummary,
  calculateWeeklyReport,
  calculateMonthlyReport,
  makeId
};

