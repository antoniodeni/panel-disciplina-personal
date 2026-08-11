const STORAGE_KEY = 'hub-trabajo-personal-v1';
const MONEY_STORAGE_KEY = 'dinero-claro-v1';
const KNOWLEDGE_STORAGE_KEY = 'centro-conocimiento-v1';
const defaults = { schemaVersion: 1, focus: '', nextAction: '', updatedAt: '' };
const focus = document.querySelector('#focus');
const nextAction = document.querySelector('#next-action');
const saveState = document.querySelector('#save-state');
const toast = document.querySelector('#toast');
const quickCaptureForm = document.querySelector('#quick-capture-form');
const quickCapture = document.querySelector('#quick-capture');
let saveTimer;
let toastTimer;

function loadState() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
  catch { return { ...defaults }; }
}

function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, focus: focus.value.trim(), nextAction: nextAction.value.trim(), updatedAt: new Date().toISOString() }));
      saveState.textContent = 'Guardado local';
    } catch { saveState.textContent = 'No se pudo guardar'; }
  }, 180);
  saveState.textContent = 'Guardando...';
}

function formatToday() { return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()); }
function showToast(message) { clearTimeout(toastTimer); toast.textContent = message; toast.classList.add('visible'); toastTimer = setTimeout(() => toast.classList.remove('visible'), 2000); }
function readLocal(key, fallback) {
  try { return { ...fallback, ...JSON.parse(localStorage.getItem(key) || '{}') }; }
  catch { return fallback; }
}
function formatEuro(minor) { return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format((Number(minor) || 0) / 100); }
function currentMonth() { return new Date().toISOString().slice(0, 7); }
function moneyOverview() {
  const source = readLocal(MONEY_STORAGE_KEY, { transactions: [] });
  const transactions = Array.isArray(source.transactions) ? source.transactions : [];
  const visible = transactions.filter((item) => String(item.date || '').slice(0, 7) === currentMonth());
  const income = visible.filter((item) => item.kind === 'income').reduce((sum, item) => sum + (Number(item.amountMinor) || 0), 0);
  const expense = visible.filter((item) => item.kind === 'expense').reduce((sum, item) => sum + (Number(item.amountMinor) || 0), 0);
  return { count: visible.length, income, expense, balance: income - expense };
}
function knowledgeOverview() {
  const source = readLocal(KNOWLEDGE_STORAGE_KEY, { notes: [] });
  const notes = Array.isArray(source.notes) ? source.notes : [];
  const active = notes.filter((note) => note.status === 'active').length;
  const pinned = notes.filter((note) => note.pinned).length;
  return { count: notes.length, active, pinned };
}
function renderOverview() {
  const money = moneyOverview();
  const knowledge = knowledgeOverview();
  const balance = document.querySelector('#money-balance');
  balance.textContent = formatEuro(money.balance);
  balance.classList.toggle('negative', money.balance < 0);
  document.querySelector('#money-detail').textContent = money.count
    ? `${money.count} movimientos · ${formatEuro(money.income)} ingresados · ${formatEuro(money.expense)} gastados`
    : 'Aún sin movimientos este mes';
  document.querySelector('#knowledge-count').textContent = String(knowledge.count);
  document.querySelector('#knowledge-detail').textContent = knowledge.count
    ? `${knowledge.active} en marcha · ${knowledge.pinned} fijadas`
    : 'Aún sin notas guardadas';
  document.querySelector('#overview-updated').textContent = 'Datos de este dispositivo';
}
function saveQuickCapture(event) {
  event.preventDefault();
  const title = quickCapture.value.trim();
  if (!title) return;
  const source = readLocal(KNOWLEDGE_STORAGE_KEY, { schemaVersion: 2, notes: [] });
  const notes = Array.isArray(source.notes) ? source.notes : [];
  const now = new Date().toISOString();
  notes.unshift({
    id: globalThis.crypto?.randomUUID?.() || `hub-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    content: 'Idea capturada desde el Hub de Trabajo Personal.',
    type: 'idea',
    area: 'otro',
    tags: [],
    pinned: false,
    nextAction: '',
    status: 'none',
    reviewDate: '',
    createdAt: now,
    updatedAt: now
  });
  try {
    localStorage.setItem(KNOWLEDGE_STORAGE_KEY, JSON.stringify({ ...source, schemaVersion: 2, notes }));
    quickCaptureForm.reset();
    renderOverview();
    showToast('Idea guardada en Centro de Conocimiento');
  } catch { showToast('No se pudo guardar la idea'); }
}

const state = loadState();
focus.value = state.focus;
nextAction.value = state.nextAction;
document.querySelector('#today').textContent = formatToday();
focus.addEventListener('input', persist);
nextAction.addEventListener('input', persist);
quickCaptureForm.addEventListener('submit', saveQuickCapture);
window.addEventListener('focus', renderOverview);
window.addEventListener('storage', renderOverview);
renderOverview();

