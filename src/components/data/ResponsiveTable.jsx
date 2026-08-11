import { Table } from './Table';

/**
 * @deprecated Use `Table`. It now owns the responsive wrapper; this alias is
 * kept so existing consumers do not gain a second nested `.table-responsive`.
 */
export function ResponsiveTable(props) {
  return <Table {...props} />;
}
