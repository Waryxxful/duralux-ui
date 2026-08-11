// @ts-expect-error Chart engines and chart components are intentionally absent from root.
import { ApexChart } from '@duralux/ui';

void ApexChart;

// @ts-expect-error ChartCard is exported only by the chart entrypoints.
import { ChartCard } from '@duralux/ui';

void ChartCard;
