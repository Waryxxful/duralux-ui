let apexChartModulePromise

/**
 * Carga diferida de react-apexcharts (peer opcional, solo navegador). La promesa
 * se reutiliza entre gráficos; si falla (peer ausente o red), se descarta para
 * que un reintento vuelva a pedir el módulo.
 */
export function loadApexChartComponent() {
  apexChartModulePromise ??= import('react-apexcharts').then(({ default: component }) => component)
  apexChartModulePromise.catch(() => { apexChartModulePromise = undefined })
  return apexChartModulePromise
}
