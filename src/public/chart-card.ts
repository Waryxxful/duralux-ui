import type * as React from 'react'
import { ChartCard as ChartCardRuntime } from '../components/charts/ChartCard'
import type { ChartCardProps } from './chart-types'

export const ChartCard: React.FC<ChartCardProps> = ChartCardRuntime as unknown as React.FC<ChartCardProps>

export type { ChartCardAction, ChartCardProps } from './chart-types'
