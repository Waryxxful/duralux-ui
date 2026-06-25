import React from 'react';
import { Table } from './Table';

export function ResponsiveTable({ wrapperClassName, ...props }) {
  return (
    <div className={['table-responsive', wrapperClassName].filter(Boolean).join(' ')}>
      <Table {...props} />
    </div>
  );
}
