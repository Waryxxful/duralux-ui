/**
 * Junta dist/index.d.ts:
 * - Tipos reales de contract/tokens/api/shell (vite-plugin-dts desde .ts/.tsx)
 * - Props tipadas de componentes UI (contrato que consumen SA/call_reviews;
 *   la impl .jsx sigue sin anotaciones propias — estas firmas documentan la API
 *   pública y permiten inferencia de callbacks bajo `strict`).
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

const dts = `import type React from 'react';
import type { SemanticVariant, StatusVariant } from './tokens';
import type { AppManifestEntry } from './contract';

// ── Componentes UI (API pública tipada; impl .jsx) ────────────────────────────

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SemanticVariant; size?: 'sm' | 'md' | 'lg'; outline?: boolean;
  loading?: boolean; startIcon?: string; endIcon?: string; icon?: string;
  href?: string; as?: React.ElementType;
}
export declare function Button(props: ButtonProps): React.ReactElement;

export interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: SemanticVariant; size?: 'sm' | 'md' | 'lg'; outline?: boolean;
  loading?: boolean; disabled?: boolean;
  icon?: string; startIcon?: string; endIcon?: string;
}
export declare function LinkButton(props: LinkButtonProps): React.ReactElement;

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string; label: string; variant?: Exclude<SemanticVariant, 'link'>;
  size?: 'sm' | 'md' | 'lg'; outline?: boolean;
}
export declare function IconButton(props: IconButtonProps): React.ReactElement;

export interface IconProps extends React.HTMLAttributes<HTMLElement> {
  name: string; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number; 'aria-label'?: string;
}
export declare function Icon(props: IconProps): React.ReactElement;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Exclude<SemanticVariant, 'link'>; soft?: boolean; pill?: boolean;
}
export declare function Badge(props: BadgeProps): React.ReactElement;

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode; footer?: React.ReactNode;
  noPadding?: boolean; stretch?: boolean; bodyClassName?: string; elementRef?: React.Ref<HTMLDivElement>;
}
export declare function Card(props: CardProps): React.ReactElement;

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string; size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: Exclude<SemanticVariant, 'link' | 'light'>;
  rounded?: boolean | string; src?: string | null; alt?: string; bg?: string | null;
}
export declare function Avatar(props: AvatarProps): React.ReactElement;

export interface Breadcrumb {
  label: string; href?: string; onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}
export interface PageHeaderProps {
  title: React.ReactNode; subtitle?: React.ReactNode; breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode; className?: string; children?: React.ReactNode;
}
export declare function PageHeader(props: PageHeaderProps): React.ReactElement;

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Exclude<SemanticVariant, 'link'>; icon?: string;
  onDismiss?: () => void; dismissible?: boolean;
}
export declare function Alert(props: AlertProps): React.ReactElement;

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
export interface ModalProps {
  open?: boolean; onClose?: () => void; title?: React.ReactNode; children?: React.ReactNode;
  footer?: React.ReactNode; size?: ModalSize; scrollable?: boolean;
  closeOnEscape?: boolean; closeOnBackdrop?: boolean; showCloseButton?: boolean;
}
export declare function Modal(props: ModalProps): React.ReactElement | null;

export interface EmptyStateProps { icon?: string; title?: string; message?: string; action?: React.ReactNode; className?: string; }
export declare function EmptyState(props: EmptyStateProps): React.ReactElement;

export interface ErrorStateProps { title?: string; message?: string; onRetry?: () => void; className?: string; }
export declare function ErrorState(props: ErrorStateProps): React.ReactElement;

export interface LoadingStateProps { message?: string; className?: string; }
export declare function LoadingState(props: LoadingStateProps): React.ReactElement;

export interface ProgressProps {
  value: number; max?: number; variant?: Exclude<SemanticVariant, 'link'>;
  striped?: boolean; animated?: boolean;
  /** Accessible name (aria-label). Defaults to "{value} de {max}". Not rendered as visible text. */
  label?: string;
  showValue?: boolean;
  height?: number; className?: string;
}
export declare function Progress(props: ProgressProps): React.ReactElement;

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string; error?: boolean; indeterminate?: boolean;
}
export declare function Checkbox(props: CheckboxProps): React.ReactElement;

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string; error?: boolean;
}
export declare function Radio(props: RadioProps): React.ReactElement;

export interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string; error?: boolean | string; helpText?: string;
}
export declare function FileInput(props: FileInputProps): React.ReactElement;

export interface InputGroupProps {
  prepend?: React.ReactNode; append?: React.ReactNode; className?: string; children: React.ReactNode;
}
export declare function InputGroup(props: InputGroupProps): React.ReactElement;

export interface FormFieldProps {
  label: string; htmlFor?: string; required?: boolean; error?: string;
  helpText?: string; hint?: string; className?: string;
  children: React.ReactNode | ((id: string) => React.ReactNode);
}
export declare function FormField(props: FormFieldProps): React.ReactElement;

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean; startAddon?: React.ReactNode; endAddon?: React.ReactNode;
}
export declare function Input(props: InputProps): React.ReactElement;

export interface SelectOption { value: string | number; label: string; disabled?: boolean; }
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean; invalid?: boolean;
  options?: Array<string | SelectOption>; placeholder?: string;
}
export declare function Select(props: SelectProps): React.ReactElement;

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { error?: boolean; }
export declare function Textarea(props: TextareaProps): React.ReactElement;

export interface Column<T = unknown> {
  key: string; header: React.ReactNode;
  render: (row: T, index: number) => React.ReactNode;
  headerClassName?: string; cellClassName?: string; width?: string | number;
}
export interface TableProps<T = unknown> {
  columns: Column<T>[]; rows: T[];
  rowKey: (row: T, index: number) => string | number;
  emptyMessage?: React.ReactNode; loading?: boolean;
  className?: string; striped?: boolean; hover?: boolean;
}
export declare function Table<T = unknown>(props: TableProps<T>): React.ReactElement;

export interface PaginationProps {
  page: number; totalPages: number; onPageChange: (page: number) => void;
  sibling?: number; className?: string; 'aria-label'?: string;
}
export declare function Pagination(props: PaginationProps): React.ReactElement | null;

export interface ResponsiveTableProps<T = unknown> extends TableProps<T> { wrapperClassName?: string; }
export declare function ResponsiveTable<T = unknown>(props: ResponsiveTableProps<T>): React.ReactElement;

export type BubbleVariant = 'incoming' | 'outgoing' | 'system';
export interface MessageBubbleProps {
  variant: BubbleVariant; children: React.ReactNode; header?: React.ReactNode;
  meta?: React.ReactNode; highlighted?: boolean; 'data-raw'?: string;
  bubbleRef?: React.Ref<HTMLDivElement>; className?: string;
}
export declare function MessageBubble(props: MessageBubbleProps): React.ReactElement;

export type TabKey = string | number;
export interface TabItem<K extends TabKey = TabKey> {
  key: K; label: React.ReactNode; content?: React.ReactNode; icon?: string;
}
export interface TabsProps<K extends TabKey = TabKey> {
  tabs?: ReadonlyArray<TabItem<K>>; className?: string; tabClassName?: string;
  activeKey?: K; defaultActiveKey?: K; onChange?: (key: K) => void;
}
export declare function Tabs<K extends TabKey = TabKey>(props: TabsProps<K>): React.ReactElement;

export type DataTableKey<T extends object> = Extract<keyof T, string>;
export type DataTableColumn<
  T extends object = Record<string, unknown>,
  K extends DataTableKey<T> = DataTableKey<T>,
> = K extends DataTableKey<T> ? {
  key: K; label: React.ReactNode; sortable?: boolean;
  render?: (row: T, value: T[K], rowIndex: number) => React.ReactNode;
} : never;
export interface DataTableAction<T extends object = Record<string, unknown>> {
  label: string; icon: string; onClick: (row: T) => void;
}
export type DataTableIdentityKey<T extends object> = {
  [K in DataTableKey<T>]-?: [T[K]] extends [React.Key] ? K : never;
}[DataTableKey<T>];
export type DataTableProps<T extends object = Record<string, unknown>> = {
  columns: ReadonlyArray<DataTableColumn<T>>; data: ReadonlyArray<T>;
  actions?: ReadonlyArray<DataTableAction<T>>; pageSize?: number;
  selectable?: boolean; onSelectionChange?: (selectedIds: React.Key[]) => void;
} & ('id' extends DataTableIdentityKey<T>
  ? { rowKey?: DataTableIdentityKey<T> }
  : { rowKey: DataTableIdentityKey<T> });
export declare function DataTable<T extends object = Record<string, unknown>>(props: DataTableProps<T>): React.ReactElement;

// Componentes de charts/chat/layout genéricos (pocos consumidores tipados estrictos)
export declare function StatsCard(props: any): React.ReactElement;
export declare function MiniStatCard(props: any): React.ReactElement;
export declare function ColoredStatCard(props: any): React.ReactElement;
export declare function Timeline(props: any): React.ReactElement;
export declare function ProgressRing(props: any): React.ReactElement;
export declare function ApexChart(props: any): React.ReactElement;
export declare function ChartCard(props: any): React.ReactElement;
export declare function AreaChartWidget(props: any): React.ReactElement;
export declare function BarChartWidget(props: any): React.ReactElement;
export declare function LineChartWidget(props: any): React.ReactElement;
export declare function PieChartWidget(props: any): React.ReactElement;
export declare function ChatSidebar(props: any): React.ReactElement;
export declare function ChatBubble(props: any): React.ReactElement;
export declare function ChatTypingIndicator(props: any): React.ReactElement;
export declare function ChatInputBar(props: any): React.ReactElement;
export declare function ChatWindow(props: any): React.ReactElement;
export declare function AppLayout(props: any): React.ReactElement;
export declare function AuthLayout(props: any): React.ReactElement;
export declare function Header(props: any): React.ReactElement;
export declare function Sidebar(props: any): React.ReactElement;

// ── Piezas reales (generadas por vite-plugin-dts desde .ts/.tsx fuente) ───────
export * from './contract';
export * from './tokens';
export * from './api/client';
export * from './components/shell/ShellHeader';
export * from './components/shell/ShellNav';
export * from './components/shell/ThemeScope';
export * from './components/shell/ConfirmDialog';
export * from './components/shell/GranCrmExtras';
export * from './components/ui/ConnectionCard';
export * from './components/ui/ActivityFeed';
export * from './components/ui/Toast';
export * from './components/ui/Dropdown';
export * from './theme/ThemeProvider';
`;

await writeFile(join(distDir, 'index.d.ts'), dts, 'utf8');
console.log('dist/index.d.ts written (UI props typed + real shell/contract exports)');
