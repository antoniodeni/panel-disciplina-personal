const STORAGE_KEY = 'centro-conocimiento-v1';

const NOTE_TYPES = [
  { id: 'project', label: 'Proyecto' },
  { id: 'procedure', label: 'Procedimiento' },
  { id: 'prompt', label: 'Prompt' },
  { id: 'decision', label: 'Decisi\u00f3n' },
  { id: 'learning', label: 'Aprendizaje' },
  { id: 'idea', label: 'Idea' }
];

const NOTE_STATUSES = [
  { id: 'none', label: 'Sin estado' },
  { id: 'active', label: 'En marcha' },
  { id: 'waiting', label: 'En espera' },
  { id: 'done', label: 'Hecho' }
];

const NOTE_AREAS = [
  { id: 'agencia-ia', label: 'Agencia IA' },
  { id: 'impresion-3d', label: 'Impresi\u00f3n 3D' },
  { id: 'apps', label: 'Apps' },
  { id: 'linea-constructiva', label: 'L\u00ednea Constructiva' },
  { id: 'dinero', label: 'Dinero' },
  { id: 'personal', label: 'Personal' },
  { id: 'otro', label: 'Otro' }
];

function makeId() { return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function createInitialState() { return { schemaVersion: 2, notes: [] }; }

function normalizeState(value) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    schemaVersion: 2,
    notes: (Array.isArray(source.notes) ? source.notes : []).filter((note) => note && typeof note === 'object').map((note) => ({
      id: String(note.id || makeId()),
      title: String(note.title || '').trim().slice(0, 160),
      content: String(note.content || '').trim().slice(0, 10000),
      type: NOTE_TYPES.some((item) => item.id === note.type) ? note.type : 'idea',
      area: NOTE_AREAS.some((item) => item.id === note.area) ? note.area : 'otro',
      tags: Array.isArray(note.tags) ? note.tags.map((tag) => String(tag).trim().slice(0, 40)).filter(Boolean).slice(0, 12) : [],
      pinned: Boolean(note.pinned),
      nextAction: String(note.nextAction || '').trim().slice(0, 240),
      status: NOTE_STATUSES.some((item) => item.id === note.status) ? note.status : 'none',
      reviewDate: /^\d{4}-\d{2}-\d{2}$/.test(String(note.reviewDate || '')) ? String(note.reviewDate) : '',
      createdAt: note.createdAt || new Date().toISOString(),
      updatedAt: note.updatedAt || note.createdAt || new Date().toISOString()
    })).filter((note) => note.title || note.content)
  };
}

function validateNote(input) {
  const title = String(input.title || '').trim();
  const content = String(input.content || '').trim();
  const nextAction = String(input.nextAction || '').trim();
  if (!title) return { ok: false, error: 'Escribe un t\u00edtulo para la nota.' };
  if (!content) return { ok: false, error: 'Escribe el contenido de la nota.' };
  if (title.length > 160) return { ok: false, error: 'El t\u00edtulo no puede superar 160 caracteres.' };
  if (content.length > 10000) return { ok: false, error: 'El contenido no puede superar 10.000 caracteres.' };
  if (nextAction.length > 240) return { ok: false, error: 'La pr\u00f3xima acci\u00f3n no puede superar 240 caracteres.' };
  const tags = String(input.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 12);
  return {
    ok: true,
    value: {
      title,
      content,
      type: NOTE_TYPES.some((item) => item.id === input.type) ? input.type : 'idea',
      area: NOTE_AREAS.some((item) => item.id === input.area) ? input.area : 'otro',
      tags,
      pinned: Boolean(input.pinned),
      nextAction,
      status: NOTE_STATUSES.some((item) => item.id === input.status) ? input.status : 'none',
      reviewDate: /^\d{4}-\d{2}-\d{2}$/.test(String(input.reviewDate || '')) ? String(input.reviewDate) : ''
    }
  };
}

function searchNotes(notes, query) {
  const normalized = String(query || '').trim().toLocaleLowerCase('es');
  if (!normalized) return [...notes];
  return notes.filter((note) => [note.title, note.content, note.nextAction, note.tags.join(' ')].some((value) => String(value).toLocaleLowerCase('es').includes(normalized)));
}

globalThis.CentroConocimiento = { STORAGE_KEY, NOTE_TYPES, NOTE_AREAS, NOTE_STATUSES, makeId, createInitialState, normalizeState, validateNote, searchNotes };

