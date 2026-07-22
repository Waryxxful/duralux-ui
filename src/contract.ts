// Fuente de verdad del contrato shell↔satélite.
// Los consumidores importan desde '@duralux/ui' (github:Waryxxful/duralux-ui).
// NO copiar este archivo a mano en satélites.
export interface GranCrmSession {
  user_id: number;
  email: string;
  nombre: string;
  rol: 'agente' | 'supervisor' | 'admin_cuenta' | 'admin_ti';
  tenant_id: string;
  apps: number[];
  // route_prefix (sin slash inicial) de la app de inicio elegida y la ultima
  // visitada. El shell los usa para redirigir tras el login.
  app_default_prefix?: string | null;
  ultima_app_prefix?: string | null;
  // true cuando el usuario aun no eligio app de inicio y tiene >1 app.
  needs_default_selection?: boolean;
  // SA client switcher
  view_as_sa?: boolean;
  cuenta_nombre?: string | null;
  cuentas?: { slug: string; nombre: string }[];
}

// Ítem de menú lateral declarado por cada app (en su dios.json) y renderizado
// por el shell. `inner` es la ruta del gateway de la app (ej "/callreviews/calls/").
// `roles` es opcional: si está, el ítem solo se muestra a esos roles GranCRM.
// `children` es opcional: un item con hijos se renderiza como submenú colapsable
// (patrón Duralux nxl-hasmenu) y no necesita `inner` propio.
export interface AppNavItem {
  label: string;
  icon: string;
  inner?: string;
  roles?: string[];
  children?: AppNavItem[];
}

export interface AppManifestEntry {
  id: number;
  nombre: string;
  slug: string | null;
  icono: string;
  categoria: string;
  estado: 'activo' | 'montaje' | 'caido';
  modo: 'external_link' | 'iframe' | 'spa_remote';
  url_publica: string;
  route_prefix: string;
  // menú lateral propio de la app (vacío si no declara ninguno)
  nav?: AppNavItem[];
  // solo si modo === 'spa_remote'
  remote_entry_url?: string;
  remote_scope?: string;
  contract_version?: string;
}

export interface AppManifest {
  apps: AppManifestEntry[];
}

// Ruta a la que navega el shell al abrir una app: subpath interno del shell
// (spa_remote/iframe) o la url_publica directa (external_link).
export function appHref(app: AppManifestEntry): string {
  if (app.modo === 'spa_remote' || app.modo === 'iframe') {
    return app.route_prefix || `/app/${app.slug}`;
  }
  return app.url_publica;
}

// Apps cuyo route_prefix queda anidado bajo el de otra app del mismo manifest
// (ej. wsp_demo en "/wsp/demo/" bajo wsp_platform en "/wsp/") no deben listarse
// como entrada propia en el Hub/menú del shell — ya se navegan desde dentro de
// la app padre. El shell SÍ necesita el array completo para el routing (más
// específico gana en react-router aunque el padre exista), así que este
// filtro es solo para superficies de listado (Hub, menú, buscador), nunca
// para el array que resuelve rutas.
export function topLevelApps(apps: AppManifestEntry[]): AppManifestEntry[] {
  const norm = (p: string) => '/' + p.replace(/^\/+|\/+$/g, '') + '/';
  return apps.filter(app => {
    const rp = norm(app.route_prefix);
    return !apps.some(other => other !== app && rp !== norm(other.route_prefix) && rp.startsWith(norm(other.route_prefix)));
  });
}

export interface EventBus {
  emit(event: 'logout' | 'sessionExpired' | 'navigate', payload?: unknown): void;
  on(event: string, cb: (payload: unknown) => void): () => void;
}

export interface GranCrmRemoteProps {
  contractVersion: '1';
  basename: string;
  apiBase: string;
  session: GranCrmSession;
  bus: EventBus;
}

export interface Notificacion {
  id: number;
  mensaje: string;
  url: string;
  leida: boolean;
  creada_en: string;
  aplicacion_nombre: string | null;
}
