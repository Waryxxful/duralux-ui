import { useState, type Key } from 'react';
import {
  DataTable,
  Dropdown,
  DropdownMenu,
  Modal,
  Tabs,
  type DataTableColumn,
  type DataTableProps,
} from '@duralux/ui';

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

const externalRows: ExternalRow[] = [
  { slug: 'ada', sequence: 1, metadata: { source: 'crm' } },
];

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
] as const;

export function PublicApiFixture() {
  const [activeTab, setActiveTab] = useState<'summary' | 'history'>('summary');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <DataTable<AccountRow>
        columns={columns}
        data={rows}
        pageSize={25}
        selectable
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
    </>
  );
}

void [badColumns, missingRowKeyProps, objectRowKeyProps];
