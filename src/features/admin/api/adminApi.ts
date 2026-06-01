import { httpClient } from '../../../shared/api'

export type Paud = {
  id: number
  name: string
  address?: string
  city?: string
  province?: string
}

export type WhoReferenceTableInfo = {
  table_name: string
  indicator: string
  sex: string
  range: string
  key_column: string
}

export type WhoReferenceRow = Record<string, number | string | null>

type ApiResponse<T> = {
  message?: string
  data?: T
}

export async function getPauds() {
  const response = await httpClient.get<ApiResponse<Paud[]>>('/admin/pauds')
  return Array.isArray(response.data.data) ? response.data.data : []
}

export async function getWhoReferenceTables() {
  const response = await httpClient.get<ApiResponse<WhoReferenceTableInfo[]>>(
    '/admin/who-reference/tables',
  )
  return Array.isArray(response.data.data) ? response.data.data : []
}

export async function getWhoReferenceRows(params: {
  tableName: string
  search?: string
  limit?: number
  offset?: number
}) {
  const response = await httpClient.get<ApiResponse<WhoReferenceRow[]>>(
    `/admin/who-reference/${params.tableName}`,
    {
      params: {
        search: params.search || undefined,
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
      },
    },
  )
  return Array.isArray(response.data.data) ? response.data.data : []
}

export async function updateWhoReferenceRow(params: {
  tableName: string
  id: string
  values: Record<string, number>
  reason: string
}) {
  const response = await httpClient.put<ApiResponse<WhoReferenceRow>>(
    `/admin/who-reference/${params.tableName}/${params.id}`,
    {
      values: params.values,
      reason: params.reason,
    },
  )
  return response.data.data
}

export async function enqueueRecalculation(paudId?: number | null) {
  const response = await httpClient.post<ApiResponse<{ run_id: number }>>(
    '/admin/measurement-results/recalculate',
    { paud_id: paudId ?? undefined },
  )
  return response.data.data
}
