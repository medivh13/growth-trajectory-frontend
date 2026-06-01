import axios from 'axios'

import { useAuthStore } from '../../features/auth/store/authStore'

const apiURL = import.meta.env.VITE_API_URL

if (!apiURL) {
  throw new Error('VITE_API_URL is required')
}

export const httpClient = axios.create({
  baseURL: apiURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
})

httpClient.interceptors.request.use((config) => {
  const token =
    useAuthStore.getState().accessToken ?? localStorage.getItem('access_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession()
    }

    return Promise.reject(error)
  },
)
