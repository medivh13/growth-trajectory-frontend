import { httpClient } from '../../../shared/api'

type LoginPayload = {
  email: string
  password: string
}

type LoginResponse = {
  message: string
  data: {
    token: string
    role?: 'paud_admin' | 'super_admin' | string
    paud_id?: number | null
  }
}

export async function login(payload: LoginPayload) {
  const response = await httpClient.post<LoginResponse>('/auth/login', payload)

  return response.data
}
