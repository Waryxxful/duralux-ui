import type { CommandPaletteItem } from '../../public/types';
import { log } from '../../utils/log';

export const DEFAULT_RECENTS_KEY = 'grancrm-command-palette-recents';

/** Minúsculas y sin tildes: «Configuración» encuentra «configuracion». */
export function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function isWordStart(text: string, index: number): boolean {
  if (index === 0) return true;
  return /[\s\-_/.·:]/.test(text.charAt(index - 1));
}

/**
 * Puntaje difuso de `token` (ya normalizado) en `text` (ya normalizado); null si no coincide.
 * Orden: coincidencia al inicio > al inicio de una palabra > subcadena > subsecuencia
 * (letras en orden, con bonos por letras seguidas y por inicios de palabra).
 */
export function fuzzyScore(token: string, text: string): number | null {
  if (!token) return 0;
  if (!text) return null;
  const index = text.indexOf(token);
  if (index === 0) return 1000 - text.length;
  if (index > 0) {
    let wordIndex = -1;
    for (let i = text.indexOf(token); i !== -1; i = text.indexOf(token, i + 1)) {
      if (isWordStart(text, i)) {
        wordIndex = i;
        break;
      }
    }
    if (wordIndex > 0) return 800 - wordIndex;
    return 600 - index;
  }
  let score = 0;
  let position = 0;
  let previous = -2;
  for (const char of token) {
    const found = text.indexOf(char, position);
    if (found === -1) return null;
    score += 10;
    if (found === previous + 1) score += 15;
    if (isWordStart(text, found)) score += 20;
    score -= Math.min(found - position, 10);
    previous = found;
    position = found + 1;
  }
  return Math.min(score, 500);
}

/** Puntaje del ítem: cada palabra de la búsqueda debe coincidir con nombre, sinónimos, grupo o descripción. */
export function scoreCommand(item: CommandPaletteItem, query: string): number | null {
  const tokens = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return 0;
  const label = normalizeSearch(item.label);
  const keywords = (item.keywords ?? []).map(normalizeSearch);
  const secondary = [item.group, item.description].filter((value): value is string => Boolean(value)).map(normalizeSearch);
  let total = 0;
  for (const token of tokens) {
    const candidates = [
      fuzzyScore(token, label),
      ...keywords.map(keyword => {
        const score = fuzzyScore(token, keyword);
        return score === null ? null : score * 0.8;
      }),
      ...secondary.map(text => {
        const score = fuzzyScore(token, text);
        return score === null ? null : score * 0.5;
      }),
    ].filter((score): score is number => score !== null);
    if (candidates.length === 0) return null;
    total += Math.max(...candidates);
  }
  return total;
}

/** Comandos que coinciden, de mayor a menor puntaje (empate: orden original). */
export function filterCommands(
  items: ReadonlyArray<CommandPaletteItem>,
  query: string,
  max = 50,
): CommandPaletteItem[] {
  if (!normalizeSearch(query)) return items.slice(0, max);
  return items
    .map((item, index) => ({ item, index, score: scoreCommand(item, query) }))
    .filter((entry): entry is { item: CommandPaletteItem; index: number; score: number } => entry.score !== null)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, max)
    .map(entry => entry.item);
}

export interface CommandSection {
  id: string;
  label: string | null;
  items: CommandPaletteItem[];
}

/**
 * Secciones de la lista. Sin búsqueda: «Recientes» primero y luego cada grupo (sin repetir
 * los recientes). Con búsqueda: una sola lista por relevancia.
 */
export function buildSections(
  items: ReadonlyArray<CommandPaletteItem>,
  query: string,
  recentIds: ReadonlyArray<string>,
  max = 50,
): CommandSection[] {
  if (normalizeSearch(query)) {
    const results = filterCommands(items, query, max);
    return results.length ? [{ id: 'results', label: 'Resultados', items: results }] : [];
  }
  const byId = new Map(items.map(item => [item.id, item]));
  const recents = recentIds
    .map(id => byId.get(id))
    .filter((item): item is CommandPaletteItem => Boolean(item && !item.disabled));
  const recentSet = new Set(recents.map(item => item.id));
  const sections: CommandSection[] = [];
  if (recents.length) sections.push({ id: 'recents', label: 'Recientes', items: recents });
  const groups = new Map<string, CommandPaletteItem[]>();
  for (const item of items) {
    if (recentSet.has(item.id)) continue;
    const group = item.group?.trim() || 'Comandos';
    const list = groups.get(group) ?? [];
    list.push(item);
    groups.set(group, list);
  }
  groups.forEach((list, label) => sections.push({ id: `group-${label}`, label, items: list }));
  return sections;
}

/** Recientes guardados (ids). Almacenamiento bloqueado o dato corrupto → lista vacía. */
export function readRecents(key: string | null): string[] {
  if (!key) return [];
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === 'string');
  } catch (error) {
    log.warn('CommandPalette: no se pudieron leer los recientes; se ignoran.', error);
    return [];
  }
}

/** Agrega `id` al inicio (sin duplicar, máximo `max`) y lo guarda. Devuelve la lista nueva. */
export function pushRecent(key: string | null, current: ReadonlyArray<string>, id: string, max = 5): string[] {
  const next = [id, ...current.filter(value => value !== id)].slice(0, Math.max(0, max));
  if (!key) return next;
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(next));
  } catch (error) {
    log.warn('CommandPalette: no se pudieron guardar los recientes (almacenamiento bloqueado).', error);
  }
  return next;
}
