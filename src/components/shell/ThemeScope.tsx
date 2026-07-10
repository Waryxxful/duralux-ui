import React from 'react';

export type GranCrmTheme = 'inherit' | 'light' | 'dark';

export interface ThemeScopeProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: GranCrmTheme;
}

/** Optional theme boundary. Components remain usable without this wrapper. */
export function ThemeScope({ theme = 'inherit', className, ...rest }: ThemeScopeProps) {
  return (
    <div
      className={['gcu-theme', className].filter(Boolean).join(' ')}
      data-gcu-theme={theme === 'inherit' ? undefined : theme}
      {...rest}
    />
  );
}
