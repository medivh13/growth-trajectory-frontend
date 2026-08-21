import { httpClient } from '../../../shared/api'

export type CreateChildWithMeasurementPayload = {
  full_name: string
  gender: 'female' | 'male'
  date_of_birth: string
  measurement_date: string
  weight_kg: number
  height_cm: number
}

export async function createChildWithMeasurement(
  payload: CreateChildWithMeasurementPayload,
) {
  const response = await httpClient.post(
    '/growth-trajectory/children-with-measurement',
    payload,
  )

  return response.data
}

export type ChildListItem = {
  id: number
  full_name: string
  gender: 'female' | 'male' | string
  date_of_birth: string
}

type ChildrenResponse = {
  message?: string
  data?: ChildListItem[] | null
}

export async function getChildren(params?: { paud_id?: number | null }) {
  const response = await httpClient.get<ChildrenResponse>(
    '/growth-trajectory/children',
    { params: { paud_id: params?.paud_id ?? undefined } },
  )

  return Array.isArray(response.data?.data) ? response.data.data : []
}

export async function deleteChild(
  childID: number,
  params?: { paud_id?: number | null },
) {
  const response = await httpClient.delete(
    `/growth-trajectory/children/${childID}`,
    { params: { paud_id: params?.paud_id ?? undefined } },
  )

  return response.data
}

export type CreateMeasurementPayload = {
  child_id: number
  measurement_date: string
  weight_kg: number
  height_cm: number
  paud_id?: number | null
}

export type MeasurementHistory = {
  measurement_id: number
  measurement_date: string
  weight_kg: number
  height_cm: number
  notes?: string | null
  bmi: number
  wfa_status: string
  lhfa_status: string
  wfh_status: string
}

export type ChildMeasurementHistory = {
  child: ChildListItem | null
  measurements: MeasurementHistory[]
}

type MeasurementHistoryResponse = {
  message?: string
  data?:
    | {
        child?: ChildListItem | null
        measurements?: MeasurementHistory[] | null
      }
    | MeasurementHistory[]
    | null
}

export async function createMeasurement(payload: CreateMeasurementPayload) {
  const { paud_id: paudID, ...body } = payload
  const response = await httpClient.post(
    '/growth-trajectory/measurements',
    body,
    { params: { paud_id: paudID ?? undefined } },
  )

  return response.data
}

export async function deleteMeasurement(
  measurementID: number,
  params?: { paud_id?: number | null },
) {
  const response = await httpClient.delete(
    `/growth-trajectory/measurements/${measurementID}`,
    { params: { paud_id: params?.paud_id ?? undefined } },
  )

  return response.data
}

export async function updateMeasurementNote(payload: {
  measurement_id: number
  notes: string
  paud_id?: number | null
}) {
  const response = await httpClient.patch(
    `/growth-trajectory/measurements/${payload.measurement_id}/note`,
    { notes: payload.notes },
    { params: { paud_id: payload.paud_id ?? undefined } },
  )

  return response.data
}

export async function getChildMeasurementHistory(
  childID: number,
  params?: { paud_id?: number | null },
) {
  const response = await httpClient.get<MeasurementHistoryResponse>(
    `/growth-trajectory/children/${childID}/measurements`,
    { params: { paud_id: params?.paud_id ?? undefined } },
  )

  const data = response.data?.data

  if (Array.isArray(data)) {
    return {
      child: null,
      measurements: data,
    } satisfies ChildMeasurementHistory
  }

  return {
    child: data?.child ?? null,
    measurements: Array.isArray(data?.measurements) ? data.measurements : [],
  } satisfies ChildMeasurementHistory
}
