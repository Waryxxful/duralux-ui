import { forwardRef } from 'react';
import { Icon } from '../ui/Icon';
import { Dropdown, DropdownMenu } from '../ui/Dropdown';
import { cx } from '../../utils/cx';
import { log } from '../../utils/log';
import { useThemeOptional } from '../../theme/ThemeContext';
import type { ThemeToggleMode, ThemeToggleProps, ThemeToggleResolved } from '../../public/types';
import { useControllableOpen, useDesktopHover } from './internal/useDesktopHover';

const MODES: ReadonlyArray<{ mode: ThemeToggleMode; label: string; icon: string }> = [
  { mode: 'light', label: 'Claro', icon: 'sun' },
  { mode: 'dark', label: 'Oscuro', icon: 'moon' },
  { mode: 'navy', label: 'Azul marino', icon: 'droplet' },
  { mode: 'system', label: 'Sistema', icon: 'monitor' },
];

const RESOLVED_LABEL: Record<ThemeToggleResolved, string> = {
  light: 'claro',
  dark: 'oscuro',
  navy: 'azul marino',
};

/** El aviso «sin ThemeProvider» se emite una sola vez, no en cada render. */
const warnedWithoutProvider = { value: false };

function modeMeta(mode: ThemeToggleMode) {
  return MODES.find(option => option.mode === mode) ?? MODES[0];
}

/**
 * ThemeToggle — elige el tema: claro, oscuro, azul marino o el del sistema.
 *
 * - Lee y cambia el `ThemeProvider` (o `mode` / `resolved` / `onModeChange` si se pasan).
 * - El disparador refleja el modo y, en «Sistema», el tema que se aplicó
 *   («Tema: Sistema (ahora oscuro)»). El modo actual se marca con `aria-pressed` y un check.
 * - Con `dark` + `onToggleDark` muestra el botón sol / luna de dos estados que usa `ShellHeader`.
 * - Fuera de un `ThemeProvider` y sin props no se muestra (avisa en consola).
 * - El ref apunta al contenedor.
 */
export const ThemeToggle = /* @__PURE__ */ forwardRef<HTMLDivElement, ThemeToggleProps>(function ThemeToggle({
  mode: modeProp,
  resolved: resolvedProp,
  onModeChange,
  dark,
  onToggleDark,
  align = 'end',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  desktopHover: desktopHoverProp,
  className,
}, ref) {
  const theme = useThemeOptional();
  const [open, setOpen] = useControllableOpen(openProp, defaultOpen, onOpenChange);
  // El menú de temas no se abre al pasar el puntero salvo que se pida: es una elección deliberada.
  const desktopHover = useDesktopHover(desktopHoverProp ?? false);

  if (dark !== undefined && onToggleDark) {
    return (
      <div ref={ref} className={cx('nxl-h-item dark-light-theme', className)}>
        {!dark && (
          <button
            type="button"
            onClick={onToggleDark}
            className="nxl-head-link me-0 dark-button gcu-header-icon-button"
            aria-label="Activar modo oscuro"
          >
            <Icon name="moon" />
          </button>
        )}
        {dark && (
          <button
            type="button"
            onClick={onToggleDark}
            className="nxl-head-link me-0 light-button gcu-header-icon-button"
            aria-label="Activar modo claro"
          >
            <Icon name="sun" />
          </button>
        )}
      </div>
    );
  }

  const mode = modeProp ?? theme?.mode;
  const setMode = onModeChange ?? theme?.setMode;
  if (!mode || !setMode) {
    if (!warnedWithoutProvider.value) {
      warnedWithoutProvider.value = true;
      log.warn('ThemeToggle: sin ThemeProvider ni `mode` + `onModeChange`; no se muestra.');
    }
    return null;
  }
  const resolved: ThemeToggleResolved = resolvedProp ?? theme?.resolved ?? (mode === 'system' ? 'light' : mode);
  const current = modeMeta(mode);
  const triggerLabel = mode === 'system'
    ? `Tema: Sistema (ahora ${RESOLVED_LABEL[resolved]})`
    : `Tema: ${current.label}`;
  const inertProps = open ? {} : { inert: '' };

  return (
    <Dropdown
      ref={ref}
      align={align}
      className={cx('dropdown nxl-h-item gcu-theme-toggle', className)}
      desktopHover={desktopHover}
      open={open}
      onOpenChange={setOpen}
      trigger={(triggerProps, state) => (
        <button
          {...triggerProps}
          className={`nxl-head-link me-0 gcu-header-icon-button${state.open ? ' show is-active' : ''}`}
          aria-label={triggerLabel}
          data-mode={mode}
          data-resolved={resolved}
        >
          <Icon name={current.icon} />
        </button>
      )}
    >
      <DropdownMenu className="nxl-h-dropdown gcu-theme-toggle__menu" {...inertProps}>
        <p className="gcu-theme-toggle__heading">Tema</p>
        {MODES.map(option => {
          const selected = option.mode === mode;
          return (
            <button
              key={option.mode}
              type="button"
              className="dropdown-item gcu-theme-toggle__item"
              aria-pressed={selected}
              tabIndex={open ? undefined : -1}
              onClick={() => {
                if (!selected) log.info(`Tema: ${mode} → ${option.mode}`);
                setMode(option.mode);
              }}
            >
              <Icon name={option.icon} size="sm" />
              <span className="gcu-theme-toggle__label">
                {option.label}
                {option.mode === 'system' && (
                  <span className="gcu-theme-toggle__hint">Ahora: {RESOLVED_LABEL[resolved]}</span>
                )}
              </span>
              {selected && <Icon name="check" size="sm" className="gcu-theme-toggle__check" />}
            </button>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
});
