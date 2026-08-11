import { useState, type Key } from 'react';
import {
  DataTable,
  InputGroup,
  MultiSelect,
  SearchableSelect,
  Dropdown,
  DropdownMenu,
  ChatSidebar,
  ChatWindow,
  Header,
  Modal,
  Tabs,
  type DataTableColumn,
  type DataTableProps,
  type ChatContact,
  type ChatWindowContact,
  type MultiSelectProps,
  type SearchableSelectOption,
  type SearchableSelectProps,
  type SelectOptionInput,
  type SelectOptionLabelResolver,
  type SelectOptionRenderer,
  type SelectOptionTextRenderer,
  type SelectOptionValueResolver,
  SESSION_EXPIRED_EVENT,
} from '@duralux/ui';
import {
  AreaChartWidget,
  BarChartWidget,
  ChartCard,
  LineChartWidget,
  PieChartWidget,
  type ChartDatum,
  type ChartSeries,
} from '@duralux/ui/charts/recharts';
import { ApexChart, type ApexChartOptions } from '@duralux/ui/charts/apex';
import { ChartCard as BareChartCard } from '@duralux/ui/charts';

interface AccountRow {
  id: number;
  name: string;
  active: boolean;
}

const rows: AccountRow[] = [
  { id: 1, name: 'Ada', active: true },
];

const columns = [
  {
    key: 'name',
    label: 'Name',
    render: (row, value, rowIndex) => `${row.id}:${value.toUpperCase()}:${rowIndex}`,
  },
  {
    key: 'active',
    label: 'Active',
    render: (_row, value) => value ? 'Yes' : 'No',
  },
] satisfies ReadonlyArray<DataTableColumn<AccountRow>>;

const badColumns = [
  {
    // @ts-expect-error DataTable keys must exist on the row type.
    key: 'nmae',
    label: 'Typo',
  },
] satisfies ReadonlyArray<DataTableColumn<AccountRow>>;

interface ExternalRow {
  slug: string;
  sequence: number;
  metadata: { source: string };
}

interface AccountContact extends ChatContact {
  accountId: number;
}

interface AccountConversation extends ChatWindowContact {
  accountId: number;
}

const externalRows: ExternalRow[] = [
  { slug: 'ada', sequence: 1, metadata: { source: 'crm' } },
];

const contacts: AccountContact[] = [
  { id: 'ada', name: 'Ada', accountId: 1 },
];

const conversation: AccountConversation = {
  name: 'Ada',
  accountId: 1,
};

const externalColumns = [
  { key: 'slug', label: 'Slug' },
  { key: 'metadata', label: 'Metadata', render: (_row, value) => value.source },
] satisfies ReadonlyArray<DataTableColumn<ExternalRow>>;

// @ts-expect-error Rows without a key-valued id require rowKey.
const missingRowKeyProps: DataTableProps<ExternalRow> = {
  columns: externalColumns,
  data: externalRows,
};

const objectRowKeyProps: DataTableProps<ExternalRow> = {
  columns: externalColumns,
  data: externalRows,
  // @ts-expect-error Object-valued properties cannot identify rows.
  rowKey: 'metadata',
};

const stringRowKeyProps: DataTableProps<ExternalRow> = {
  columns: externalColumns,
  data: externalRows,
  rowKey: 'slug',
};

const numberRowKeyProps: DataTableProps<ExternalRow> = {
  columns: externalColumns,
  data: externalRows,
  rowKey: 'sequence',
};

const tabs = [
  { key: 'summary', label: 'Summary', content: <p>Summary</p> },
  { key: 'history', label: 'History', content: <p>History</p> },
  { key: 'disabled', label: 'Disabled', disabled: true },
] as const;

interface AccountOption {
  id: number;
  name: string;
}

const selectOption: SearchableSelectOption = { value: 'ada', label: 'Ada' };
const valueResolver: SelectOptionValueResolver<AccountOption> = (option) => option.id;
const labelResolver: SelectOptionLabelResolver<AccountOption> = (option) => option.name;
const renderer: SelectOptionRenderer<AccountOption> = (option) => <strong>{option.name}</strong>;
const textRenderer: SelectOptionTextRenderer<AccountOption> = (option) => option.name;
const mixedSelectOptions: ReadonlyArray<SelectOptionInput> = [selectOption, 1];

const typedSearchableProps: SearchableSelectProps<AccountOption> = {
  options: [{ id: 1, name: 'Ada' }],
  getOptionValue: valueResolver,
  getOptionLabel: labelResolver,
  renderOption: renderer,
  renderValue: textRenderer,
  onChange: (_value, option) => option?.id,
};
const typedMultiProps: MultiSelectProps<AccountOption> = {
  options: [{ id: 1, name: 'Ada' }],
  getOptionValue: valueResolver,
  getOptionLabel: labelResolver,
  renderOption: renderer,
  renderValue: renderer,
  onChange: (_values, options) => options.map((option) => option.name),
};
const sessionExpiredEvent: string = SESSION_EXPIRED_EVENT;
const badCustomOptions: SearchableSelectProps<AccountOption> = {
  // @ts-expect-error A custom option domain cannot silently receive primitives.
  options: [1],
};

export function PublicApiFixture() {
  const [activeTab, setActiveTab] = useState<'summary' | 'history' | 'disabled'>('summary');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <DataTable<AccountRow>
        columns={columns}
        data={rows}
        pageSize={25}
        selectable
        responsive={false}
        loading={false}
        emptyMessage="No hay cuentas"
        getRowLabel={(row) => `${row.name} (${row.id})`}
        onSelectionChange={(ids) => {
          const selectedIds: Key[] = ids;
          selectedIds.map(String);
        }}
        actions={[{ label: 'Open', icon: 'feather-eye', onClick: (row) => row.id }]}
      />
      <DataTable<ExternalRow> {...stringRowKeyProps} />
      <DataTable<ExternalRow> {...numberRowKeyProps} />

      <Tabs tabs={tabs} defaultActiveKey="summary" />
      <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      <ChatSidebar
        contacts={contacts}
        onSelect={(contact) => contact.accountId}
        onSearch={(query) => query.trim()}
      />
      <ChatWindow
        contact={conversation}
        legacyChildren={false}
        onPhone={(contact) => contact.accountId}
        onVideo={(contact) => contact.accountId}
        onMenu={(contact) => contact.accountId}
      />
      <Header
        notifications={[{ id: 1, title: 'Nuevo aviso' }]}
        onMarkAllRead={() => undefined}
        onNotificationClick={(_event, notification) => notification.id}
      />

      <SearchableSelect
        aria-label="Cuenta"
        name="account"
        options={[{ value: 'ada', label: 'Ada' }]}
        defaultValue="ada"
      />
      <MultiSelect
        aria-label="Etiquetas"
        name="tags"
        options={[{ value: 'crm', label: 'CRM' }]}
        defaultValue={['crm']}
      />
      <SearchableSelect<AccountOption>
        aria-label="Cuenta tipada"
        options={[{ id: 1, name: 'Ada' }]}
        getOptionValue={valueResolver}
        getOptionLabel={labelResolver}
        renderOption={renderer}
        renderValue={textRenderer}
      />
      <MultiSelect<SelectOptionInput>
        aria-label="Mixto tipado"
        options={mixedSelectOptions}
        getOptionValue={(option) => typeof option === 'number' || typeof option === 'string' ? option : option.value}
        getOptionLabel={(option) => typeof option === 'number' || typeof option === 'string' ? option : option.label}
      />
      <InputGroup prepend="$"><input aria-label="Monto" /></InputGroup>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        closeOnEscape
        closeOnBackdrop={false}
        showCloseButton
      >
        Modal content
      </Modal>

      <Dropdown
        align="end"
        trigger={(triggerProps, { open }) => (
          <button {...triggerProps} data-open={open}>Actions</button>
        )}
      >
        <DropdownMenu as="ul">
          <li><button type="button" className="dropdown-item">Open</button></li>
        </DropdownMenu>
      </Dropdown>

      <ChartCard
        title="Ventas"
        actions={[{ id: 'csv', label: 'CSV', onClick: () => undefined }]}
        loading={false}
        empty={false}
        fallback={<p>Fallback</p>}
        onRetry={() => undefined}
      >
        <LineChartWidget
          ariaLabel="Ventas mensuales"
          theme="dark"
          data={[{ name: 'Ene', ventas: 10 } satisfies ChartDatum]}
          series={[{ key: 'ventas', label: 'Ventas' } satisfies ChartSeries]}
          accessibleTable
          loading={false}
          error={undefined}
        />
      </ChartCard>
      <BareChartCard title="Solo card">
        <p>Contenido</p>
      </BareChartCard>
      <AreaChartWidget data={[{ name: 'Ene', ventas: 10 }]} series={[{ key: 'ventas' }]} />
      <BarChartWidget data={[{ name: 'Ene', ventas: 10 }]} series={[{ key: 'ventas' }]} />
      <PieChartWidget data={[{ name: 'Orgánico', value: 12 }]} />
      <ApexChart
        options={{ xaxis: { categories: ['Ene'] } } satisfies ApexChartOptions}
        series={[{ name: 'Ventas', data: [10] }]}
        ariaLabel="Ventas"
        theme="light"
        accessibleTable
        fallback={<p>Tabla</p>}
        onRetry={() => undefined}
      />
    </>
  );
}

void [badColumns, missingRowKeyProps, objectRowKeyProps, badCustomOptions, typedMultiProps, sessionExpiredEvent];
