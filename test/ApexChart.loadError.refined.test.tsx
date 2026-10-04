import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'

// El peer opcional no está instalado: la carga diferida falla.
vi.mock('react-apexcharts', () => {
  throw new Error('No se encontró react-apexcharts')
})

import { ApexChart } from '../src/charts/apex'

test('si el motor no carga, muestra el error con su causa y lo registra', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  render(<ApexChart ariaLabel="Ventas" series={[{ name: 'Ventas', data: [1] }]} />)

  const alert = await screen.findByRole('alert', {}, { timeout: 5000 })
  expect(alert).toHaveTextContent('No se pudo cargar el gráfico')
  expect(screen.getByRole('figure', { name: 'Ventas' })).toBeInTheDocument()
  expect(error).toHaveBeenCalledWith('[duralux]', expect.stringContaining('ApexChart'), expect.anything())
  error.mockRestore()
})
