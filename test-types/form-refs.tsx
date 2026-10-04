import { createRef } from 'react';
import {
  Checkbox,
  FileInput,
  FormField,
  Input,
  InputGroup,
  MultiSelect,
  Radio,
  SearchableSelect,
  Select,
  Textarea,
  type ControlSize,
} from '@duralux/ui';

// Formularios 2.3: cada control reenvía el ref a su elemento nativo con el tipo correcto.
const inputRef = createRef<HTMLInputElement>();
const textareaRef = createRef<HTMLTextAreaElement>();
const selectRef = createRef<HTMLSelectElement>();
const divRef = createRef<HTMLDivElement>();
const size: ControlSize = 'sm';

export function FormRefs() {
  return (
    <>
      <Input ref={inputRef} controlSize={size} size={20} aria-label="Nombre" />
      <Textarea ref={textareaRef} controlSize="lg" aria-label="Notas" />
      <Select ref={selectRef} controlSize="md" options={['a']} aria-label="Estado" />
      <Checkbox ref={inputRef} label="Acepto" />
      <Radio ref={inputRef} label="Mensual" name="plan" />
      <FileInput ref={inputRef} controlSize="sm" label="Adjunto" />
      <InputGroup ref={divRef} controlSize="sm" prepend="$"><input aria-label="Monto" /></InputGroup>
      <FormField ref={divRef} label="País"><SearchableSelect ref={inputRef} options={['Chile']} /></FormField>
      <MultiSelect<{ id: number; name: string }>
        ref={inputRef}
        options={[{ id: 1, name: 'VIP' }]}
        getOptionValue={(option) => option.id}
        getOptionLabel={(option) => option.name}
        aria-label="Etiquetas"
      />
    </>
  );
}

// @ts-expect-error: textarea no acepta un ref de input.
void (<Textarea ref={inputRef} />);
// @ts-expect-error: controlSize solo admite sm / md / lg.
void (<Input controlSize="xl" />);
