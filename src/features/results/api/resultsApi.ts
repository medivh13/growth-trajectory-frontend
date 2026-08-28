import { httpClient } from '../../../shared/api'

export type GrowthResult = {
  ChildID: number
  MeasurementID: number
  FullName: string
  Gender: 'female' | 'male' | string
  MeasurementDate: string
  WeightKg: number
  HeightCm: number
  HeadCircumferenceCm?: number | null
  Notes?: string | null
  BMI: number
  HcfaZ?: number | null
  WfaStatus: string
  LhfaStatus: string
  WfhStatus: string
  BmiStatus: string
  HcfaStatus?: string | null
}

type GetGrowthResultsParams = {
  start_date: string
  end_date: string
  paud_id?: number | null
}

type GrowthResultsResponse = {
  message?: string
  data?: GrowthResult[] | null
}

export async function getGrowthResults(params: GetGrowthResultsParams) {
  const response = await httpClient.get<GrowthResultsResponse>(
    '/growth-trajectory/results',
    { params },
  )

  return Array.isArray(response.data?.data) ? response.data.data : []
}
