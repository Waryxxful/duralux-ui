import React from 'react';
import { ThemeBoundaryProvider, useThemeBoundaryMode } from '../../theme/ThemeBoundaryContext';
import { cx } from '../../utils/cx';

export type GranCrmTheme = 'inherit' | 'light' | 'dark';

export interface ThemeScopeProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: GranCrmTheme;
}

/**
 * Theme boundary for package primitives. It also carries the resolved mode to
 * portal-based descendants (Modal and Toast), which cannot inherit DOM CSS.
 */
export function ThemeScope({ theme = 'inherit', className, ...rest }: ThemeScopeProps) {
  const inheritedMode = useThemeBoundaryMode();
  const resolvedMode = theme === 'inherit' ? inheritedMode : theme;

  return (
    <ThemeBoundaryProvider mode={resolvedMode}>
      <div
        className={cx('gcu-theme', className)}
        data-gcu-theme={theme === 'inherit' ? undefined : theme}
        {...rest}
      />
    </ThemeBoundaryProvider>
  );
}
