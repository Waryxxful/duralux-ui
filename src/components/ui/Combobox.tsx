import { useEffect, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'cmdk';
import { Popover, PopoverAnchor, PopoverContent } from './Popover';
import { Icon } from './Icon';

/**
 * Combobox = `Popover` (ya en el paquete) + `cmdk` para filtrado/navegación
 * por teclado. A diferencia de la primera versión (botón que abría un
 * popover con un buscador adentro — el `combobox-demo` viejo de shadcn/ui),
 * la caja visible ES el input: se puede escribir directo para filtrar,
 * igual que el Combobox actual de shadcn (ui.shadcn.com/docs/components/
 * base|radix/combobox). `CommandInput` va dentro de `PopoverAnchor` (no
 * `PopoverTrigger`) porque el trigger de Radix togglea con click/Enter —
 * acá el popover abre con foco/tipeo y cierra con Escape/click afuera/
 * selección, ya manejado por `open`/`onOpenChange` controlados a mano.
 *
 * `onFocusOutside` en `PopoverContent` está deliberadamente anulado: el
 * input que mantiene el foco vive en `PopoverAnchor` (fuera del portal
 * donde Radix monta el contenido), así que el dismissable layer de Radix
 * lo trata como "foco afuera" y cierra el popover en el mismo tick en que
 * abre. Sin este preventDefault, el click-afuera y Escape siguen cerrando
 * normalmente (esos van por `onPointerDownOutside`/`onEscapeKeyDown`).
 */
export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Buscar…',
  emptyText = 'Sin resultados.',
  className,
  ...inputProps
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? '';
  const [search, setSearch] = useState(selectedLabel);

  // Al cerrar (selección, Escape, click afuera) la caja vuelve a mostrar
  // la opción elegida, no lo último tipeado — mismo comportamiento que la
  // demo de shadcn.
  useEffect(() => {
    if (!open) setSearch(selectedLabel);
  }, [open, selectedLabel]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Command>
        <PopoverAnchor asChild>
          <div className="position-relative">
            <CommandInput
              role="combobox"
              aria-expanded={open}
              autoComplete="off"
              className={['form-control pe-4', className].filter(Boolean).join(' ')}
              placeholder={placeholder}
              value={search}
              onValueChange={(next) => {
                setSearch(next);
                if (!open) setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              {...inputProps}
            />
            <Icon
              name="chevron-down"
              size="sm"
              className="position-absolute top-50 end-0 translate-middle-y me-2 text-muted pe-none"
            />
          </div>
        </PopoverAnchor>
        <PopoverContent
          align="start"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onFocusOutside={(event) => event.preventDefault()}
          style={{ minWidth: 'var(--radix-popper-anchor-width)' }}
        >
          <CommandList style={{ maxHeight: 260, overflowY: 'auto' }}>
            <CommandEmpty className="text-muted small px-2 py-1">{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  className="dropdown-item d-flex align-items-center justify-content-between gap-2"
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                  {option.value === value && <Icon name="check" size="sm" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </PopoverContent>
      </Command>
    </Popover>
  );
}
