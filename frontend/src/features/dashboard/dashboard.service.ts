import { apiClient } from '../../api/client'
import type { DashboardFilters, DashboardSummary } from './types'

function toInstant(date: string, endOfDay: boolean): string {
  const time = endOfDay ? '23:59:59.999' : '00:00:00.000'
  return new Date(`${date}T${time}`).toISOString()
}

export const dashboardService = {
  async getSummary(filters: DashboardFilters, signal?: AbortSignal): Promise<DashboardSummary> {
    const params = {
      from: filters.from ? toInstant(filters.from, false) : undefined,
      to: filters.to ? toInstant(filters.to, true) : undefined,
    }
    const { data } = await apiClient.get<DashboardSummary>('/dashboard/summary', { params, signal })
    return data
  },
}
