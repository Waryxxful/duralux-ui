import React from 'react';
import { cx } from '../../utils/cx';

export type GranCrmTheme = 'inherit' | 'light' | 'dark';

export interface ThemeScopeProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: GranCrmTheme;
}

/** Optional theme boundary. Components remain usable without this wrapper. */
export function ThemeScope({ theme = 'inherit', className, ...rest }: ThemeScopeProps) {
  return (
    <div
      className={cx('gcu-theme', className)}
      data-gcu-theme={theme === 'inherit' ? undefined : theme}
      {...rest}
    />
  );
}
