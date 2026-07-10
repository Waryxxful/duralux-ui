/**
 * Junta las declaraciones reales (generadas por vite-plugin-dts desde los
 * .ts/.tsx: contract, tokens, ShellHeader/ShellNav/etc.) en dist/index.d.ts,
 * y declara los ~26 componentes .jsx legacy (nunca tipados) como `any` —
 * mismo nivel de laxitud que tenían antes de este merge, sin fingir un
 * contrato que nadie mantiene. Nada de esto se hardcodea a mano: los tipos
 * reales vienen de vite-plugin-dts; solo la lista de nombres legacy vive acá.
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

const LEGACY_JSX_EXPORTS = [
  'Avatar', 'Badge', 'Button', 'LinkButton', 'IconButton', 'Icon', 'Alert', 'Modal',
  'Card', 'StatsCard', 'MiniStatCard', 'ColoredStatCard', 'Timeline', 'ProgressRing',
  'Progress', 'Tabs', 'EmptyState', 'ErrorState', 'LoadingState', 'FormField', 'Input',
  'Select', 'Textarea', 'Checkbox', 'Radio', 'FileInput', 'InputGroup', 'DataTable',
  'Table', 'Pagination', 'ResponsiveTable', 'ApexChart', 'ChartCard', 'AreaChartWidget',
  'BarChartWidget', 'LineChartWidget', 'PieChartWidget', 'ChatSidebar', 'ChatBubble',
  'ChatTypingIndicator', 'ChatInputBar', 'ChatWindow', 'MessageBubble', 'AppLayout',
  'AuthLayout', 'Header', 'Sidebar', 'PageHeader',
];

const dts = `import type React from 'react';

// ── Componentes .jsx legacy (nunca tipados) — passthrough sin contrato ─────────
${LEGACY_JSX_EXPORTS.map(name => `export declare function ${name}(props: any): React.ReactElement;`).join('\n')}

// Column/Table props tipados (usados por SA y satélites; impl .jsx sigue siendo any)
export interface Column<T = unknown> {
  key: string;
  header: React.ReactNode;
  render: (row: T, index: number) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  width?: string | number;
}
export interface TableProps<T = unknown> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string | number;
  emptyMessage?: React.ReactNode;
  loading?: boolean;
  className?: string;
  striped?: boolean;
  hover?: boolean;
}
export interface ResponsiveTableProps<T = unknown> extends TableProps<T> {
  wrapperClassName?: string;
}

// ── Piezas reales (generadas por vite-plugin-dts desde el .ts/.tsx fuente) ─────
export * from './contract';
export * from './tokens';
export * from './api/client';
export * from './components/shell/ShellHeader';
export * from './components/shell/ShellNav';
export * from './components/shell/ThemeScope';
export * from './components/shell/ConfirmDialog';
export * from './components/shell/GranCrmExtras';
`;

await writeFile(join(distDir, 'index.d.ts'), dts, 'utf8');
console.log('dist/index.d.ts written (legacy: any-typed passthrough, resto: real types)');
