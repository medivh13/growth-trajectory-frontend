import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: 'paud_admin' | 'super_admin' | string
  paudId?: number | null
}

type AuthState = {
  accessToken: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  setSession: (session: { accessToken: string; user?: AuthUser | null }) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      setSession: ({ accessToken, user }) =>
        set({ accessToken, user: user ?? null, isAuthenticated: true }),
      clearSession: () => {
        localStorage.removeItem('access_token')
        set({ accessToken: null, user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'health-monitoring-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
