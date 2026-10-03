import React from 'react';
import { ThemeBoundaryProvider } from '../../theme/ThemeBoundaryContext';
import { useThemeBoundaryMode } from '../../theme/themeBoundary';
import { cx } from '../../utils/cx';

export type GranCrmTheme = 'inherit' | 'light' | 'dark' | 'navy';

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
