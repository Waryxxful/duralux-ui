import { useState } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'cmdk';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';
import { Icon } from './Icon';

/**
 * Combobox = `Popover` (ya en el paquete) + `cmdk` para el filtrado —
 * mismo patrón que el combobox-demo de shadcn/ui, pero cmdk es headless
 * (sin Tailwind) igual que Radix, así que se viste 100% con clases
 * Bootstrap/Duralux ya existentes: `.form-select` para el trigger,
 * `.dropdown-item` para cada opción. El único CSS nuevo
 * (`themes/components/combobox.scss`) resuelve el estado `data-selected`
 * de la navegación por teclado de cmdk, que `.dropdown-item` no cubre
 * (solo tiene `:hover`/`:focus`).
 */
export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value'> {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar…',
  searchPlaceholder = 'Buscar…',
  emptyText = 'Sin resultados.',
  className,
  ...triggerProps
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={['form-select text-start', className].filter(Boolean).join(' ')}
          {...triggerProps}
        >
          {selected ? selected.label : placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        style={{ minWidth: 'var(--radix-popper-anchor-width)' }}
      >
        <Command>
          <CommandInput className="form-control form-control-sm mb-2" placeholder={searchPlaceholder} />
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
        </Command>
      </PopoverContent>
    </Popover>
  );
}
