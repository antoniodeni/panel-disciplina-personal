const STORAGE_KEY = 'hub-trabajo-personal-v1';
const defaults = { schemaVersion: 1, focus: '', nextAction: '', updatedAt: '' };
const focus = document.querySelector('#focus');
const nextAction = document.querySelector('#next-action');
const saveState = document.querySelector('#save-state');
const toast = document.querySelector('#toast');
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

const state = loadState();
focus.value = state.focus;
nextAction.value = state.nextAction;
document.querySelector('#today').textContent = formatToday();
focus.addEventListener('input', persist);
nextAction.addEventListener('input', persist);
document.querySelectorAll('a.button').forEach((link) => link.addEventListener('click', () => showToast(`Abriendo ${link.closest('.app-card').querySelector('h3').textContent}`)));

