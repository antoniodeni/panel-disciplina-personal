const {
  DEFAULT_ACCOUNTS,
  DEFAULT_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  calculateSummary,
  calculateWeeklyReport,
  calculateMonthlyReport,
  currentMonth,
  formatDate,
  formatEuro,
  makeId,
  todayIso,
  validateTransaction
} = globalThis.DineroFinance;

const STORAGE_KEY = 'dinero-claro-v1';
const initialState = {
  transactions: [],
  accounts: DEFAULT_ACCOUNTS,
  categories: DEFAULT_CATEGORIES,
  startingBalanceMinor: 0
};

function createInitialState() {
  return {
    ...initialState,
    transactions: [],
    accounts: [...DEFAULT_ACCOUNTS],
    categories: [...DEFAULT_CATEGORIES]
  };
}

let state = loadState();
let selectedMonth = currentMonth();
let transactionFilter = 'all';

const elements = {
  monthFilter: document.querySelector('#month-filter'),
  previousMonth: document.querySelector('#previous-month'),
  currentMonth: document.querySelector('#current-month'),
  nextMonth: document.querySelector('#next-month'),
  periodLabel: document.querySelector('#period-label'),
  available: document.querySelector('#available-value'),
  income: document.querySelector('#income-value'),
  expense: document.querySelector('#expense-value'),
  balance: document.querySelector('#balance-value'),
  balanceCard: document.querySelector('#balance-card'),
  balanceHelp: document.querySelector('#balance-help'),
  incomeCount: document.querySelector('#income-count'),
  expenseCount: document.querySelector('#expense-count'),
  decisionTitle: document.querySelector('#decision-title'),
  decisionCopy: document.querySelector('#decision-copy'),
  form: document.querySelector('#movement-form'),
  formTitle: document.querySelector('#form-title'),
  editingId: document.querySelector('#editing-id'),
  amount: document.querySelector('#amount'),
  date: document.querySelector('#date'),
  category: document.querySelector('#category'),
  account: document.querySelector('#account'),
  description: document.querySelector('#description'),
  formError: document.querySelector('#form-error'),
  cancelEdit: document.querySelector('#cancel-edit'),
  list: document.querySelector('#transactions-list'),
  count: document.querySelector('#transaction-count'),
  toast: document.querySelector('#toast'),
  weeklyLabel: document.querySelector('#weekly-label'),
  weeklyExpense: document.querySelector('#weekly-expense'),
  weeklyBalance: document.querySelector('#weekly-balance'),
  weeklyCopy: document.querySelector('#weekly-copy'),
  weeklyTop: document.querySelector('#weekly-top'),
  monthlyLabel: document.querySelector('#monthly-label'),
  monthlyExpense: document.querySelector('#monthly-expense'),
  monthlyBalance: document.querySelector('#monthly-balance'),
  monthlyCopy: document.querySelector('#monthly-copy'),
  monthlyTop: document.querySelector('#monthly-top'),
  transactionsPanel: document.querySelector('#transactions-panel'),
  importData: document.querySelector('#import-data'),
  importFile: document.querySelector('#import-file'),
  movementFilters: [...document.querySelectorAll('[data-filter]')],
  summaryCards: [...document.querySelectorAll('[data-summary-filter]')]
};

elements.monthFilter.value = selectedMonth;
elements.date.value = todayIso();
elements.balanceCard.querySelector('.summary-label').textContent = 'Balance del mes';
populateCategorySelect(getSelectedKind());
populateSelect(elements.account, state.accounts.length ? state.accounts : DEFAULT_ACCOUNTS);

document.querySelectorAll('input[name="kind"]').forEach((input) => {
  input.addEventListener('change', () => populateCategorySelect(input.value));
});

elements.monthFilter.addEventListener('change', () => {
  selectedMonth = elements.monthFilter.value || currentMonth();
  render();
});
elements.previousMonth.addEventListener('click', () => changeSelectedMonth(-1));
elements.currentMonth.addEventListener('click', () => {
  selectedMonth = currentMonth();
  elements.monthFilter.value = selectedMonth;
  render();
});
elements.nextMonth.addEventListener('click', () => changeSelectedMonth(1));

elements.form.addEventListener('submit', handleSubmit);
elements.cancelEdit.addEventListener('click', resetForm);
document.querySelector('#focus-form').addEventListener('click', () => {
  document.querySelector('#movement-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  elements.amount.focus();
});
document.querySelector('#focus-movements').addEventListener('click', () => {
  elements.transactionsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
elements.movementFilters.forEach((button) => {
  button.addEventListener('click', () => {
    selectTransactionFilter(button.dataset.filter);
  });
});
elements.summaryCards.forEach((card) => {
  const open = () => {
    selectTransactionFilter(card.dataset.summaryFilter);
    elements.transactionsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  card.addEventListener('click', open);
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open();
    }
  });
});
document.querySelector('#export-data').addEventListener('click', exportData);
elements.importData.addEventListener('click', () => elements.importFile.click());
elements.importFile.addEventListener('change', importData);
document.querySelector('#reset-data').addEventListener('click', resetData);

render();
globalThis.__dineroAppReady = true;

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!stored) return createInitialState();
    const categories = Array.isArray(stored.categories) && stored.categories.length ? stored.categories : DEFAULT_CATEGORIES;
    return {
      ...initialState,
      ...stored,
      accounts: DEFAULT_ACCOUNTS,
      categories,
      transactions: Array.isArray(stored.transactions) ? stored.transactions.map((transaction) => ({ ...transaction, account: DEFAULT_ACCOUNTS[0] })) : []
    };
  } catch {
    return createInitialState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

function populateSelect(select, options) {
  select.replaceChildren(...options.map((option) => {
    const element = document.createElement('option');
    element.value = option;
    element.textContent = option;
    return element;
  }));
}

function populateCategorySelect(kind, preferredValue = '') {
  const defaults = kind === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
  const customCategories = state.categories.filter((category) => !DEFAULT_CATEGORIES.includes(category));
  const options = [...new Set([...defaults, ...customCategories])];
  populateSelect(elements.category, options);
  if (preferredValue && options.includes(preferredValue)) elements.category.value = preferredValue;
}

function getSelectedKind() {
  return document.querySelector('input[name="kind"]:checked').value;
}

function selectTransactionFilter(filter) {
  transactionFilter = filter;
  elements.movementFilters.forEach((filterButton) => {
    const isActive = filterButton.dataset.filter === filter;
    filterButton.classList.toggle('active', isActive);
    filterButton.setAttribute('aria-pressed', String(isActive));
  });
  renderTransactions(calculateSummary(state.transactions, selectedMonth).periodTransactions);
}

function handleSubmit(event) {
  event.preventDefault();
  elements.formError.textContent = '';
  const kind = getSelectedKind();
  const defaultCategory = kind === 'income' ? DEFAULT_INCOME_CATEGORIES[0] : DEFAULT_EXPENSE_CATEGORIES[0];
  const result = validateTransaction({
    kind,
    amount: elements.amount.value,
    date: elements.date.value || todayIso(),
    category: elements.category.value || defaultCategory,
    account: elements.account.value || DEFAULT_ACCOUNTS[0],
    description: elements.description.value
  }, state.categories, state.accounts);
  if (!result.ok) {
    elements.formError.textContent = result.error;
    return;
  }

  const editingId = elements.editingId.value;
  let message = 'Movimiento guardado';
  if (editingId) {
    state.transactions = state.transactions.map((transaction) => transaction.id === editingId ? { ...transaction, ...result.value, updatedAt: new Date().toISOString() } : transaction);
    message = 'Movimiento actualizado';
  } else {
    state.transactions.push({ id: makeId(), ...result.value, createdAt: new Date().toISOString() });
  }
  const persisted = saveState();
  showToast(persisted ? message : `${message}, pero no se pudo guardar en este navegador`);
  resetForm();
  render();
}

function render() {
  elements.monthFilter.value = selectedMonth;
  const summary = calculateSummary(state.transactions, selectedMonth, state.startingBalanceMinor);
  const weeklyReport = calculateWeeklyReport(state.transactions);
  const monthlyReport = calculateMonthlyReport(state.transactions, selectedMonth);
  const monthLabel = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(new Date(`${selectedMonth}-15T12:00:00`));
  elements.periodLabel.textContent = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
  elements.available.textContent = formatEuro(summary.availableMinor);
  elements.income.textContent = formatEuro(summary.incomeMinor);
  elements.expense.textContent = formatEuro(summary.expenseMinor);
  const balanceMinor = summary.incomeMinor - summary.expenseMinor;
  elements.balance.textContent = formatEuro(balanceMinor);
  elements.balanceCard.classList.remove('balance-positive', 'balance-negative', 'balance-neutral');
  const balanceClass = balanceMinor > 0 ? 'balance-positive' : balanceMinor < 0 ? 'balance-negative' : 'balance-neutral';
  elements.balanceCard.classList.add(balanceClass);
  elements.balanceHelp.textContent = balanceMinor > 0 ? 'Hay más ingresos que gastos.' : balanceMinor < 0 ? 'Hay más gastos que ingresos.' : 'Ingresos y gastos están igualados.';
  elements.incomeCount.textContent = `${summary.incomeCount} ${summary.incomeCount === 1 ? 'movimiento' : 'movimientos'}`;
  elements.expenseCount.textContent = `${summary.expenseCount} ${summary.expenseCount === 1 ? 'movimiento' : 'movimientos'}`;
  renderDecision(summary);
  renderReports(weeklyReport, monthlyReport, monthLabel);
  renderTransactions(summary.periodTransactions);
}

function changeSelectedMonth(offset) {
  const [year, month] = selectedMonth.split('-').map(Number);
  const next = new Date(year, month - 1 + offset, 15);
  selectedMonth = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
  elements.monthFilter.value = selectedMonth;
  render();
}

function renderReports(weeklyReport, monthlyReport, monthLabel) {
  elements.weeklyLabel.textContent = `${formatDate(weeklyReport.start)} - ${formatDate(weeklyReport.end)}`;
  elements.weeklyExpense.textContent = formatEuro(weeklyReport.expenseMinor);
  elements.weeklyBalance.textContent = formatEuro(weeklyReport.incomeMinor - weeklyReport.expenseMinor);
  elements.weeklyCopy.textContent = weeklyReport.expenseCount ? `${weeklyReport.expenseCount} ${weeklyReport.expenseCount === 1 ? 'gasto registrado' : 'gastos registrados'} esta semana.` : 'Sin gastos registrados esta semana.';
  elements.weeklyTop.textContent = weeklyReport.topCategory ? `${weeklyReport.topCategory} · ${formatEuro(weeklyReport.topCategoryMinor)}` : 'Sin datos';
  elements.monthlyLabel.textContent = monthLabel;
  elements.monthlyExpense.textContent = formatEuro(monthlyReport.expenseMinor);
  elements.monthlyBalance.textContent = formatEuro(monthlyReport.incomeMinor - monthlyReport.expenseMinor);
  elements.monthlyCopy.textContent = monthlyReport.expenseCount ? `${monthlyReport.expenseCount} ${monthlyReport.expenseCount === 1 ? 'gasto registrado' : 'gastos registrados'} este mes.` : 'Sin gastos registrados este mes.';
  elements.monthlyTop.textContent = monthlyReport.topCategory ? `${monthlyReport.topCategory} · ${formatEuro(monthlyReport.topCategoryMinor)}` : 'Sin datos';
}

function renderDecision(summary) {
  const hasData = state.transactions.length > 0;
  if (!hasData) {
    elements.decisionTitle.textContent = 'Empieza por registrar un movimiento';
    elements.decisionCopy.textContent = 'Con un primer ingreso o gasto tendremos una lectura real de tu mes.';
    return;
  }
  if (summary.expenseMinor > summary.incomeMinor && summary.incomeMinor > 0) {
    elements.decisionTitle.textContent = 'Tus gastos superan tus ingresos este mes';
    elements.decisionCopy.textContent = 'Revisa los movimientos y decide qué gasto puedes ajustar antes de cerrar el mes.';
    return;
  }
  if (summary.availableMinor < 0) {
    elements.decisionTitle.textContent = 'El disponible está en negativo';
    elements.decisionCopy.textContent = 'Comprueba los últimos gastos y registra cualquier ingreso pendiente.';
    return;
  }
  elements.decisionTitle.textContent = 'Sigue registrando lo importante';
  elements.decisionCopy.textContent = 'Con varios movimientos podremos detectar patrones y preparar presupuestos.';
}

function renderTransactions(transactions) {
  const filtered = transactionFilter === 'all' ? transactions : transactions.filter((transaction) => transaction.kind === transactionFilter);
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  elements.count.textContent = String(sorted.length);
  if (!sorted.length) {
    elements.list.innerHTML = '<div class="empty-state"><strong>Aún no hay movimientos</strong><p>Registra tu primer ingreso o gasto para empezar a ver el estado del mes.</p><button class="button button-secondary" data-action="focus-form" type="button">Añadir el primero</button></div>';
    elements.list.querySelector('[data-action="focus-form"]').addEventListener('click', () => elements.amount.focus());
    return;
  }
  elements.list.replaceChildren(...sorted.map(transactionRow));
}

function transactionRow(transaction) {
  const row = document.createElement('article');
  row.className = 'transaction-row';
  const sign = transaction.kind === 'income' ? '+' : '-';
  row.innerHTML = `
    <div class="transaction-mark ${transaction.kind}" aria-hidden="true">${transaction.kind === 'income' ? '↑' : '↓'}</div>
    <div class="transaction-main">
      <strong>${escapeHtml(transaction.description || transaction.category)}</strong>
      <span>${escapeHtml(transaction.category)} · ${escapeHtml(transaction.account)} · ${formatDate(transaction.date)}</span>
    </div>
    <strong class="transaction-amount ${transaction.kind}">${sign}${formatEuro(transaction.amountMinor)}</strong>
    <div class="transaction-actions">
      <button class="text-button" data-action="edit" data-id="${transaction.id}" type="button">Editar</button>
      <button class="text-button text-button-danger" data-action="delete" data-id="${transaction.id}" type="button">Borrar</button>
    </div>`;
  row.querySelector('[data-action="edit"]').addEventListener('click', () => startEdit(transaction.id));
  row.querySelector('[data-action="delete"]').addEventListener('click', () => deleteTransaction(transaction.id));
  return row;
}

function startEdit(id) {
  const transaction = state.transactions.find((item) => item.id === id);
  if (!transaction) return;
  elements.editingId.value = id;
  elements.formTitle.textContent = 'Editar movimiento';
  elements.amount.value = (transaction.amountMinor / 100).toFixed(2).replace('.', ',');
  elements.date.value = transaction.date;
  document.querySelector(`input[name="kind"][value="${transaction.kind}"]`).checked = true;
  populateCategorySelect(transaction.kind, transaction.category);
  elements.account.value = DEFAULT_ACCOUNTS[0];
  elements.description.value = transaction.description;
  elements.cancelEdit.classList.remove('hidden');
  document.querySelector('#movement-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  elements.amount.focus();
}

function resetForm() {
  elements.form.reset();
  elements.editingId.value = '';
  elements.formTitle.textContent = 'Añadir movimiento';
  elements.cancelEdit.classList.add('hidden');
  elements.date.value = todayIso();
  populateCategorySelect('expense');
  elements.formError.textContent = '';
}

function deleteTransaction(id) {
  const transaction = state.transactions.find((item) => item.id === id);
  if (!transaction || !window.confirm('¿Borrar este movimiento?')) return;
  state.transactions = state.transactions.filter((item) => item.id !== id);
  saveState();
  showToast('Movimiento borrado');
  render();
}

function exportData() {
  const blob = new Blob([JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dinero-claro-${todayIso()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast('Copia exportada');
}

async function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const imported = parsed.data || parsed;
    if (!Array.isArray(imported.transactions)) throw new Error('invalid backup');

    const categories = Array.isArray(imported.categories) && imported.categories.length
      ? imported.categories
      : DEFAULT_CATEGORIES;
    const transactions = imported.transactions.map((transaction) => {
      const amount = Number(transaction.amountMinor);
      if (!Number.isFinite(amount) || amount <= 0) throw new Error('invalid amount');
      const result = validateTransaction({
        kind: transaction.kind,
        amount: (amount / 100).toFixed(2),
        date: transaction.date,
        category: transaction.category,
        account: DEFAULT_ACCOUNTS[0],
        description: transaction.description
      }, categories, DEFAULT_ACCOUNTS);
      if (!result.ok) throw new Error(result.error);
      return {
        id: String(transaction.id || makeId()),
        ...result.value,
        createdAt: transaction.createdAt || new Date().toISOString(),
        updatedAt: transaction.updatedAt || new Date().toISOString()
      };
    });

    if (!window.confirm('La importación sustituirá los movimientos actuales. ¿Continuar?')) return;
    state = {
      ...createInitialState(),
      categories,
      transactions
    };
    selectedMonth = currentMonth();
    elements.monthFilter.value = selectedMonth;
    if (!saveState()) throw new Error('save failed');
    resetForm();
    render();
    showToast('Copia importada correctamente');
  } catch {
    showToast('No se pudo importar la copia');
  } finally {
    event.target.value = '';
  }
}

function resetData() {
  if (!state.transactions.length || window.confirm('Se borrarán todos los movimientos guardados en este navegador. ¿Continuar?')) {
    state = createInitialState();
    saveState();
    resetForm();
    showToast('Datos locales borrados');
    render();
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('visible');
  window.setTimeout(() => elements.toast.classList.remove('visible'), 2200);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

