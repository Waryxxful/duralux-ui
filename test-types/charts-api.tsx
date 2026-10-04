// Contrato de tipos públicos de los gráficos (DX-023): tipos con nombre que amplían, no estrechan.
import { createRef } from 'react';
import {
  AreaChartWidget,
  ChartCard,
  LineChartWidget,
  PieChartWidget,
  type ChartDatum,
  type ChartThemeMode,
} from '@duralux/ui/charts/recharts';
import {
  ApexChart,
  type ApexChartOptions,
  type ApexChartSeries,
  type ApexOptionValue,
} from '@duralux/ui/charts/apex';

// Superconjunto que una app (call_reviews) escribía a mano porque el tipo publicado no lo cubría.
interface AxisLabels {
  show?: boolean;
  style?: { colors?: string | string[]; fontSize?: string };
  formatter?: (value: number) => string;
}
interface AppChartOptions {
  chart?: {
    type?: string;
    stacked?: boolean;
    sparkline?: { enabled?: boolean };
    toolbar?: { show?: boolean };
    zoom?: { enabled?: boolean };
    animations?: { enabled?: boolean; speed?: number };
  };
  grid?: { borderColor?: string; strokeDashArray?: number; padding?: { top?: number } };
  xaxis?: { categories?: string[]; labels?: AxisLabels; tickPlacement?: string };
  yaxis?: { min?: number; max?: number; labels?: AxisLabels };
  tooltip?: { enabled?: boolean; shared?: boolean; y?: { formatter?: (value: number) => string } };
  stroke?: { curve?: string; width?: number | number[] };
  legend?: { show?: boolean; position?: string };
  dataLabels?: { enabled?: boolean };
  plotOptions?: { bar?: { horizontal?: boolean; borderRadius?: number } };
}
declare const appOptions: AppChartOptions;
// Las apps convertían con `as`: sigue compilando.
const castOptions = appOptions as ApexChartOptions;

// Literales de opciones: ahora sin cast.
const directOptions = {
  chart: { type: 'area', stacked: true, toolbar: { show: false }, sparkline: { enabled: false }, animations: { enabled: true, speed: 300 } },
  stroke: { curve: 'smooth', width: [2, 3], dashArray: [0, 4] },
  fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
  xaxis: {
    categories: ['Ene', 'Feb'],
    title: { text: 'Mes', style: { fontSize: '11px', fontWeight: 600, color: '#123456' }, offsetY: 0 },
    labels: { style: { fontSize: '11px', colors: '#123456' }, rotate: 0, hideOverlappingLabels: true, formatter: (value: string) => value.toUpperCase() },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { labels: { formatter: (value: number) => value.toFixed(0) } },
  tooltip: { enabled: true, shared: true, y: { formatter: (value: number) => `${value} %` } },
  legend: { show: false, markers: { size: 6 } },
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: '82%', labels: { show: true, total: { show: true, formatter: () => '12' } } } } },
  labels: ['A', 'B'],
  annotations: { yaxis: [{ y: 80, borderColor: '#999' }] },
} satisfies ApexChartOptions;

// `null` es un hueco nativo de Apex; también puntos { x, y } y números sueltos (donut).
const gapSeries: ApexChartSeries = [{ name: 'Score', data: [80, null, 75] }, { name: 'Puntos', data: [{ x: 'Ene', y: 1 }] }];
const donutSeries: ApexChartSeries = [10, 20];
const freeValue: ApexOptionValue = { nested: [1, 'dos', null, () => 'tres'] };

// Filas con valores anidados (registros, listas, fechas) siguen siendo ChartDatum.
const rows = [{ name: 'Ene', ventas: 10, meta: { fuente: 'crm', tags: ['a'] }, fecha: new Date(0), activo: true }] satisfies ChartDatum[];

const navy: ChartThemeMode = 'navy';
const figureRef = createRef<HTMLElement>();
const cardRef = createRef<HTMLElement>();

export function ChartsApi() {
  return (
    <ChartCard ref={cardRef} title="Ventas" headingLevel={2} noPadding className="x" style={{ minHeight: 1 }}>
      <LineChartWidget ref={figureRef} theme={navy} ariaLabel="Ventas" data={rows} series={[{ key: 'ventas', dashed: true }]} />
      <AreaChartWidget data={rows} series={[{ key: 'ventas' }]} />
      <PieChartWidget data={[{ name: 'A', value: 1 }]} />
      <ApexChart ref={figureRef} options={castOptions} series={gapSeries} ariaLabel="Score" ssrFallback={<p>Tabla</p>} />
      <ApexChart options={directOptions} series={donutSeries} type="donut" />
      {/* @ts-expect-error headingLevel solo acepta 2–6. */}
      <ChartCard title="Mal" headingLevel={1} />
    </ChartCard>
  );
}

void freeValue;
