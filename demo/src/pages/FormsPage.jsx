import { Input, Select, Textarea, FormField, Checkbox, Radio, FileInput, InputGroup } from '@duralux/ui'
import { ShowcaseSection } from '../ShowcaseSection'

export function FormsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Forms</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Input · Select · Textarea · FormField · Checkbox · Radio · FileInput · InputGroup</p>

      <ShowcaseSection
        title="Input"
        description="Props: icon, prefix, invalid, className + todos los props nativos de input"
        preview={
          <div style={{ maxWidth: 400 }} className="d-flex flex-column gap-3">
            <FormField label="Email" htmlFor="em1">
              <Input id="em1" type="email" placeholder="tu@email.com" icon="feather-mail" />
            </FormField>
            <FormField label="Búsqueda" htmlFor="s1">
              <Input id="s1" type="text" placeholder="Buscar..." icon="feather-search" />
            </FormField>
            <FormField label="Con error" htmlFor="e1" error="Este campo es requerido">
              <Input id="e1" placeholder="Campo requerido" invalid />
            </FormField>
            <FormField label="Con hint" htmlFor="h1" hint="El nombre debe tener al menos 3 caracteres">
              <Input id="h1" placeholder="Nombre completo" />
            </FormField>
          </div>
        }
        code={`<FormField label="Email" htmlFor="email">
  <Input id="email" type="email" icon="feather-mail" placeholder="tu@email.com" />
</FormField>

// Con error
<FormField label="Campo" error="Este campo es requerido">
  <Input invalid placeholder="..." />
</FormField>

// Con hint
<FormField label="Nombre" hint="Mínimo 3 caracteres">
  <Input placeholder="Nombre completo" />
</FormField>`}
      />

      <ShowcaseSection
        title="Select"
        description="Props: options ([string] | [{value, label}]), invalid, className + props nativos"
        preview={
          <div style={{ maxWidth: 400 }} className="d-flex flex-column gap-3">
            <FormField label="País" htmlFor="pais">
              <Select id="pais" options={['Chile', 'Argentina', 'Colombia', 'México', 'Perú']} />
            </FormField>
            <FormField label="Estado" htmlFor="estado">
              <Select id="estado" options={[
                { value: 'activo', label: 'Activo' },
                { value: 'inactivo', label: 'Inactivo' },
                { value: 'eliminado', label: 'Eliminado' },
              ]} />
            </FormField>
          </div>
        }
        code={`// Con strings
<FormField label="País">
  <Select options={['Chile', 'Argentina', 'México']} />
</FormField>

// Con objetos {value, label}
<FormField label="Estado">
  <Select options={[
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
  ]} />
</FormField>`}
      />

      <ShowcaseSection
        title="Textarea"
        description="Props: icon, invalid, rows + props nativos"
        preview={
          <div style={{ maxWidth: 400 }}>
            <FormField label="Notas" htmlFor="notas">
              <Textarea id="notas" rows={4} placeholder="Escribe tus notas aquí..." />
            </FormField>
          </div>
        }
        code={`<FormField label="Notas" htmlFor="notas">
  <Textarea id="notas" rows={4} placeholder="Escribe aquí..." />
</FormField>`}
      />

      <ShowcaseSection
        title="Checkbox"
        description="Props: label, error, indeterminate + todos los props nativos de input (excepto type)"
        preview={
          <div className="d-flex flex-column gap-2">
            <Checkbox label="Aceptar términos y condiciones" />
            <Checkbox label="Con error" error />
            <Checkbox label="Indeterminado" indeterminate />
            <Checkbox label="Deshabilitado" disabled />
          </div>
        }
        code={`<Checkbox label="Aceptar términos y condiciones" />
<Checkbox label="Con error" error />
<Checkbox label="Indeterminado" indeterminate />
<Checkbox label="Deshabilitado" disabled />`}
      />

      <ShowcaseSection
        title="Radio"
        description="Props: label, error + todos los props nativos de input (excepto type)"
        preview={
          <div className="d-flex flex-column gap-2">
            <Radio label="Opción A" name="demo-radio" defaultChecked />
            <Radio label="Opción B" name="demo-radio" />
            <Radio label="Con error" name="demo-radio-err" error />
            <Radio label="Deshabilitado" name="demo-radio-dis" disabled />
          </div>
        }
        code={`<Radio label="Opción A" name="grupo" defaultChecked />
<Radio label="Opción B" name="grupo" />
<Radio label="Con error" name="grupo" error />`}
      />

      <ShowcaseSection
        title="FileInput"
        description="Props: label, error (boolean | string), helpText + props nativos de input"
        preview={
          <div style={{ maxWidth: 400 }} className="d-flex flex-column gap-3">
            <FileInput label="Subir documento" helpText="Formatos aceptados: PDF, DOCX (máx. 5 MB)" />
            <FileInput label="Con error como texto" error="El archivo supera el tamaño máximo permitido" />
            <FileInput label="Con error booleano" error />
          </div>
        }
        code={`<FileInput label="Subir documento" helpText="Máx. 5 MB" />

// Error como string (muestra mensaje)
<FileInput label="Archivo" error="El archivo es demasiado grande" />

// Error booleano (solo marca is-invalid)
<FileInput label="Archivo" error />`}
      />

      <ShowcaseSection
        title="InputGroup"
        description="Props: prepend, append, className, children"
        preview={
          <div style={{ maxWidth: 400 }} className="d-flex flex-column gap-3">
            <InputGroup prepend="@">
              <input className="form-control" placeholder="usuario" />
            </InputGroup>
            <InputGroup append=".cl">
              <input className="form-control" placeholder="dominio" />
            </InputGroup>
            <InputGroup prepend="$" append="CLP">
              <input className="form-control" type="number" placeholder="0" />
            </InputGroup>
          </div>
        }
        code={`<InputGroup prepend="@">
  <input className="form-control" placeholder="usuario" />
</InputGroup>

<InputGroup append=".cl">
  <input className="form-control" placeholder="dominio" />
</InputGroup>

<InputGroup prepend="$" append="CLP">
  <input className="form-control" type="number" placeholder="0" />
</InputGroup>`}
      />

      <ShowcaseSection
        title="Formulario completo de ejemplo"
        preview={
          <div style={{ maxWidth: 500 }} className="row g-3">
            <div className="col-md-6">
              <FormField label="Nombre *" htmlFor="fn" required>
                <Input id="fn" placeholder="Nombre" />
              </FormField>
            </div>
            <div className="col-md-6">
              <FormField label="Apellido *" htmlFor="ln" required>
                <Input id="ln" placeholder="Apellido" />
              </FormField>
            </div>
            <div className="col-12">
              <FormField label="Email *" htmlFor="fem" required>
                <Input id="fem" type="email" icon="feather-mail" placeholder="tu@email.com" />
              </FormField>
            </div>
            <div className="col-md-6">
              <FormField label="País" htmlFor="fpais">
                <Select id="fpais" options={['Chile', 'Argentina', 'Colombia']} />
              </FormField>
            </div>
            <div className="col-md-6">
              <FormField label="Teléfono" htmlFor="ftel">
                <Input id="ftel" type="tel" icon="feather-phone" placeholder="+56 9 XXXX XXXX" />
              </FormField>
            </div>
            <div className="col-12">
              <FormField label="Notas" htmlFor="fnotas">
                <Textarea id="fnotas" rows={3} placeholder="Comentarios adicionales..." />
              </FormField>
            </div>
          </div>
        }
        code={`<div className="row g-3">
  <div className="col-md-6">
    <FormField label="Nombre *" required>
      <Input placeholder="Nombre" />
    </FormField>
  </div>
  <div className="col-md-6">
    <FormField label="Email *" required>
      <Input type="email" icon="feather-mail" />
    </FormField>
  </div>
  <div className="col-12">
    <FormField label="País">
      <Select options={['Chile', 'Argentina']} />
    </FormField>
  </div>
</div>`}
      />
    </div>
  )
}
