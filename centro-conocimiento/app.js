const api = globalThis.CentroConocimiento;
const storageInfo = detectStorage();
let state = loadState();
let query = '';
let editId = '';
let toastTimer;

const el = {
  notesCount: document.querySelector('#notes-count'),
  projectsCount: document.querySelector('#projects-count'),
  pinnedCount: document.querySelector('#pinned-count'),
  proceduresCount: document.querySelector('#procedures-count'),
  formTitle: document.querySelector('#form-title'),
  cancelEdit: document.querySelector('#cancel-edit'),
  form: document.querySelector('#note-form'),
  editingId: document.querySelector('#editing-id'),
  title: document.querySelector('#note-title'),
  type: document.querySelector('#note-type'),
  area: document.querySelector('#note-area'),
  content: document.querySelector('#note-content'),
  nextAction: document.querySelector('#note-next-action'),
  status: document.querySelector('#note-status'),
  reviewDate: document.querySelector('#note-review-date'),
  tags: document.querySelector('#note-tags'),
  pinned: document.querySelector('#note-pinned'),
  error: document.querySelector('#form-error'),
  save: document.querySelector('#save-note'),
  storageStatus: document.querySelector('#storage-status'),
  search: document.querySelector('#note-search'),
  typeFilter: document.querySelector('#type-filter'),
  areaFilter: document.querySelector('#area-filter'),
  list: document.querySelector('#note-list'),
  visibleCount: document.querySelector('#visible-count'),
  importFile: document.querySelector('#import-file'),
  toast: document.querySelector('#toast')
};

populateSelect(el.type, api.NOTE_TYPES);
populateSelect(el.area, api.NOTE_AREAS);
populateSelect(el.status, api.NOTE_STATUSES);
populateSelect(el.typeFilter, [{ id: 'all', label: 'Todos' }, ...api.NOTE_TYPES]);
populateSelect(el.areaFilter, [{ id: 'all', label: 'Todas' }, ...api.NOTE_AREAS]);
el.type.value = 'idea';
el.area.value = 'apps';
el.status.value = 'none';
el.storageStatus.textContent = storageInfo.mode === 'local' ? 'Guardado autom\u00e1tico en este navegador.' : storageInfo.mode === 'session' ? 'Aviso: el navegador solo guarda mientras esta pesta\u00f1a est\u00e9 abierta.' : 'Aviso: el navegador bloquea el guardado persistente. Exporta una copia antes de cerrar.';

el.form.addEventListener('submit', saveNote);
el.cancelEdit.addEventListener('click', resetForm);
el.search.addEventListener('input', () => { query = el.search.value; renderList(); });
el.typeFilter.addEventListener('change', renderList);
el.areaFilter.addEventListener('change', renderList);
document.querySelector('#export-data').addEventListener('click', exportData);
document.querySelector('#import-data').addEventListener('click', () => el.importFile.click());
el.importFile.addEventListener('change', importData);
render();

function detectStorage() {
  for (const [mode, getter] of [['local', () => window.localStorage], ['session', () => window.sessionStorage]]) {
    try { const storage = getter(); const key = '__knowledge_storage_test__'; storage.setItem(key, '1'); storage.removeItem(key); return { mode, storage }; } catch { /* El navegador lo bloquea. */ }
  }
  return { mode: 'memory', storage: null };
}

function loadState() { try { return api.normalizeState(JSON.parse(storageInfo.storage?.getItem(api.STORAGE_KEY) || 'null')); } catch { return api.createInitialState(); } }
function saveState() { if (!storageInfo.storage) return true; try { storageInfo.storage.setItem(api.STORAGE_KEY, JSON.stringify(state)); return true; } catch { return false; } }
function populateSelect(select, options) { select.replaceChildren(...options.map((option) => { const item = document.createElement('option'); item.value = option.id; item.textContent = option.label; return item; })); }

function render() { renderStats(); renderList(); }
function renderStats() {
  el.notesCount.textContent = state.notes.length;
  el.projectsCount.textContent = state.notes.filter((note) => note.type === 'project' && note.status !== 'done').length;
  el.pinnedCount.textContent = state.notes.filter((note) => note.pinned).length;
  el.proceduresCount.textContent = state.notes.filter((note) => note.type === 'procedure').length;
}

function renderList() {
  let notes = api.searchNotes(state.notes, query);
  if (el.typeFilter.value !== 'all') notes = notes.filter((note) => note.type === el.typeFilter.value);
  if (el.areaFilter.value !== 'all') notes = notes.filter((note) => note.area === el.areaFilter.value);
  notes = notes.sort((a, b) => Number(b.pinned) - Number(a.pinned) || String(b.updatedAt).localeCompare(String(a.updatedAt)));
  el.visibleCount.textContent = notes.length;
  el.list.innerHTML = notes.length ? notes.map(renderNote).join('') : `<div class="empty-list"><strong>${query ? 'No hay coincidencias' : 'A\u00fan no hay notas'}</strong><p>${query ? 'Prueba otra palabra o etiqueta.' : 'Crea la primera nota desde el panel de registro.'}</p></div>`;
  el.list.querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', () => editNote(button.dataset.edit)));
  el.list.querySelectorAll('[data-pin]').forEach((button) => button.addEventListener('click', () => togglePin(button.dataset.pin)));
  el.list.querySelectorAll('[data-delete]').forEach((button) => button.addEventListener('click', () => deleteNote(button.dataset.delete)));
}

function renderNote(note) {
  const type = api.NOTE_TYPES.find((item) => item.id === note.type)?.label || 'Idea';
  const area = api.NOTE_AREAS.find((item) => item.id === note.area)?.label || 'Otro';
  const tags = note.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
  const status = api.NOTE_STATUSES.find((item) => item.id === note.status)?.label || 'Sin estado';
  const context = note.nextAction || note.reviewDate || note.status !== 'none' ? `<div class="note-context">${note.nextAction ? `<strong>Pr&oacute;xima acci&oacute;n:</strong> ${escapeHtml(note.nextAction)}` : ''}${note.status !== 'none' ? `<span class="status-badge status-${escapeHtml(note.status)}">${escapeHtml(status)}</span>` : ''}${note.reviewDate ? `<small>Revisar: ${escapeHtml(formatDisplayDate(note.reviewDate))}</small>` : ''}</div>` : '';
  return `<article class="note-card ${note.pinned ? 'pinned' : ''}"><div class="note-card-head"><div><span class="eyebrow">${escapeHtml(type)} \u00b7 ${escapeHtml(area)}</span><h3>${escapeHtml(note.title)}</h3></div><span class="pin-mark">${note.pinned ? 'Fijada' : ''}</span></div><p class="note-preview">${escapeHtml(note.content)}</p>${context}<div class="note-card-foot"><div class="tags">${tags}</div><small>${escapeHtml(formatDate(note.updatedAt))}</small></div><div class="note-actions"><button class="button button-small" data-edit="${escapeHtml(note.id)}" type="button">Editar</button><button class="button button-small" data-pin="${escapeHtml(note.id)}" type="button">${note.pinned ? 'Desfijar' : 'Fijar'}</button><button class="button button-small danger-quiet" data-delete="${escapeHtml(note.id)}" type="button">Borrar</button></div></article>`;
}

function saveNote(event) {
  event.preventDefault();
  const result = api.validateNote({ title: el.title.value, content: el.content.value, type: el.type.value, area: el.area.value, tags: el.tags.value, pinned: el.pinned.checked, nextAction: el.nextAction.value, status: el.status.value, reviewDate: el.reviewDate.value });
  if (!result.ok) { el.error.textContent = result.error; return; }
  const now = new Date().toISOString();
  if (editId) state.notes = state.notes.map((note) => note.id === editId ? { ...note, ...result.value, updatedAt: now } : note);
  else state.notes.push({ id: api.makeId(), ...result.value, createdAt: now, updatedAt: now });
  if (!saveState()) { el.error.textContent = 'No se pudo guardar en este navegador.'; return; }
  const message = editId ? 'Nota actualizada' : 'Nota guardada';
  resetForm();
  render();
  showToast(message);
}

function editNote(id) {
  const note = state.notes.find((item) => item.id === id);
  if (!note) return;
  editId = id;
  el.editingId.value = id;
  el.formTitle.textContent = 'Editar nota';
  el.cancelEdit.classList.remove('hidden');
  el.title.value = note.title;
  el.type.value = note.type;
  el.area.value = note.area;
  el.content.value = note.content;
  el.nextAction.value = note.nextAction;
  el.status.value = note.status;
  el.reviewDate.value = note.reviewDate;
  el.tags.value = note.tags.join(', ');
  el.pinned.checked = note.pinned;
  el.title.focus();
  el.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetForm() {
  editId = '';
  el.editingId.value = '';
  el.form.reset();
  el.formTitle.textContent = 'Nueva nota';
  el.cancelEdit.classList.add('hidden');
  el.type.value = 'idea';
  el.area.value = 'apps';
  el.status.value = 'none';
  el.error.textContent = '';
}

function togglePin(id) {
  const previousState = state;
  state = { ...state, notes: state.notes.map((note) => note.id === id ? { ...note, pinned: !note.pinned, updatedAt: new Date().toISOString() } : note) };
  if (!saveState()) { state = previousState; showToast('No se pudo guardar el cambio'); return; }
  render();
  showToast('Nota actualizada');
}

function deleteNote(id) {
  if (!window.confirm('\u00bfBorrar esta nota?')) return;
  const previousState = state;
  state = { ...state, notes: state.notes.filter((note) => note.id !== id) };
  if (!saveState()) { state = previousState; showToast('No se pudo borrar la nota'); return; }
  if (editId === id) resetForm();
  render();
  showToast('Nota borrada');
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `centro-conocimiento-${new Date().toISOString().slice(0, 10)}.json`;
  link.hidden = true;
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(link.href);
    link.remove();
  }, 1000);
  showToast('Copia exportada');
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      if (!window.confirm('\u00bfSustituir las notas actuales por esta copia?')) return;
      const importedState = api.normalizeState(JSON.parse(reader.result));
      const previousState = state;
      state = importedState;
      resetForm();
      if (!saveState()) { state = previousState; showToast('No se pudo guardar la copia'); return; }
      render();
      showToast('Copia importada');
    } catch { showToast('El archivo no es v\u00e1lido'); }
    finally { el.importFile.value = ''; }
  };
  reader.readAsText(file);
}

function formatDate(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Sin fecha' : new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(date); }
function formatDisplayDate(value) { const date = new Date(`${value}T12:00:00`); return Number.isNaN(date.getTime()) ? 'Sin fecha' : new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(date); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function showToast(message) { clearTimeout(toastTimer); el.toast.textContent = message; el.toast.classList.add('visible'); toastTimer = setTimeout(() => el.toast.classList.remove('visible'), 2200); }

