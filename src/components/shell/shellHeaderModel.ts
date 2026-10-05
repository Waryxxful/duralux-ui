import type { AppManifestEntry } from '../../contract';

/** «hace 5 min», «hace 2 h»… Fechas inválidas no muestran NaN. */
export function tiempoRelativo(iso: string, now: number = Date.now()): string {
  const timestamp = new Date(iso).getTime();
  if (!Number.isFinite(timestamp)) return 'fecha desconocida';
  const segundos = Math.max(0, (now - timestamp) / 1000);
  if (segundos < 60) return 'hace un momento';
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  return `hace ${Math.floor(horas / 24)} d`;
}

/** Agrupa las apps por categoría conservando el orden del manifest; sin categoría → «Otros». */
export function groupAppsByCategory(apps: ReadonlyArray<AppManifestEntry>): Map<string, AppManifestEntry[]> {
  return apps.reduce<Map<string, AppManifestEntry[]>>((groups, app) => {
    const category = app.categoria?.trim() || 'Otros';
    const categoryApps = groups.get(category) ?? [];
    categoryApps.push(app);
    groups.set(category, categoryApps);
    return groups;
  }, new Map());
}

/** Destino de «Ver todas las notificaciones»: la app de notificaciones si existe en el manifest. */
export function resolveNotificationsHref(
  apps: ReadonlyArray<AppManifestEntry>,
  appHref?: (app: AppManifestEntry) => string,
): string {
  const notificationsApp = apps.find((app) => app.route_prefix.replace(/\/$/, '') === '/notificaciones');
  return notificationsApp && appHref ? appHref(notificationsApp) : '/notificaciones';
}
