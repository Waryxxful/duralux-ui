import React from 'react';
import { Table } from './Table';
import { cx } from '../../utils/cx';

export function ResponsiveTable({ wrapperClassName, ...props }) {
  return (
    <div className={cx('table-responsive', wrapperClassName)}>
      <Table {...props} />
    </div>
  );
}
