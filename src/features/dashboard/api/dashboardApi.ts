import { httpClient } from '../../../shared/api'

export type DashboardSummary = {
  total_children: number
  normal: number
  wasted: number
  stunted: number
  normal_percentage: number
  wasted_percentage: number
  stunted_percentage: number
}

type DashboardSummaryResponse = {
  message?: string
  data?: Partial<DashboardSummary> | null
}

type GetDashboardSummaryParams = {
  start_date: string
  end_date: string
  paud_id?: number | null
}

export const emptyDashboardSummary: DashboardSummary = {
  total_children: 0,
  normal: 0,
  wasted: 0,
  stunted: 0,
  normal_percentage: 0,
  wasted_percentage: 0,
  stunted_percentage: 0,
}

export async function getDashboardSummary(params: GetDashboardSummaryParams) {
  const response = await httpClient.get<DashboardSummaryResponse>(
    '/growth-trajectory/dashboard-summary',
    { params },
  )

  return normalizeDashboardSummary(response.data?.data)
}

function normalizeDashboardSummary(
  summary?: Partial<DashboardSummary> | null,
): DashboardSummary {
  return {
    total_children: Number(summary?.total_children ?? 0),
    normal: Number(summary?.normal ?? 0),
    wasted: Number(summary?.wasted ?? 0),
    stunted: Number(summary?.stunted ?? 0),
    normal_percentage: Number(summary?.normal_percentage ?? 0),
    wasted_percentage: Number(summary?.wasted_percentage ?? 0),
    stunted_percentage: Number(summary?.stunted_percentage ?? 0),
  }
}
