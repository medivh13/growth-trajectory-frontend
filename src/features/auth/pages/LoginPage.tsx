import { useMemo, useState, type FormEvent } from 'react'
import { AxiosError, isAxiosError } from 'axios'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { login } from '../api/authApi'
import { useAuthStore } from '../store/authStore'

type LocationState = {
  from?: {
    pathname?: string
  }
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setSession = useAuthStore((state) => state.setSession)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = useMemo(() => {
    const state = location.state as LocationState | null

    return state?.from?.pathname ?? '/dashboard'
  }, [location.state])

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await login({ email, password })
      const token = response.data.token
      const tokenUser = decodeJwtUser(token)

      localStorage.setItem('access_token', token)
      setSession({
        accessToken: token,
        user: {
          id: String(tokenUser?.admin_id ?? ''),
          name: tokenUser?.email ?? email,
          email: tokenUser?.email ?? email,
          role: response.data.role ?? tokenUser?.role ?? 'paud_admin',
          paudId: response.data.paud_id ?? tokenUser?.paud_id ?? null,
        },
      })
      navigate(redirectTo, { replace: true })
    } catch (caughtError) {
      const message =
        isAxiosError(caughtError)
          ? getLoginErrorMessage(caughtError)
          : 'Unable to sign in. Please try again.'

      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-slate-900 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.34),transparent_34%),linear-gradient(145deg,rgba(15,23,42,0.82),rgba(2,6,23,0.96))]" />
          <div className="relative flex h-full flex-col justify-between p-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
                ARUNA Curve
              </p>
              <h1 className="mt-8 max-w-xl text-5xl font-semibold leading-tight tracking-tight">
                Child Growth & Development Trajectory
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-6 text-slate-300">
                Adaptive Risk Understanding for Nurturing Assessment
              </p>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-3">
              {['Growth', 'Risk', 'Follow-up'].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur"
                >
                  <p className="text-sm font-medium text-white">{item}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-300">
                    Secure operational access
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
                ARUNA Curve
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight">
                Child Growth & Development Trajectory
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Adaptive Risk Understanding for Nurturing Assessment
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
              <div>
                <p className="text-sm font-medium text-emerald-200">
                  Welcome back
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Log in
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Use your account credentials to access the ARUNA Curve
                  dashboard.
                </p>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-200"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 block w-full rounded-md border border-white/10 bg-white px-3 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20"
                    placeholder="name@clinic.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-200"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-2 block w-full rounded-md border border-white/10 bg-white px-3 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20"
                    placeholder="Enter your password"
                  />
                </div>

                {error ? (
                  <p className="rounded-md border border-red-300/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/30 transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-emerald-400/30 disabled:cursor-not-allowed disabled:bg-slate-500"
                >
                  <span aria-hidden="true">{isSubmitting ? '...' : '->'}</span>
                  {isSubmitting ? 'Signing in' : 'Sign in'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

type JwtPayload = {
  admin_id?: number
  email?: string
  role?: string
  paud_id?: number
}

function decodeJwtUser(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) {
      return null
    }
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

function getLoginErrorMessage(error: AxiosError) {
  if (error.response?.status === 400 || error.response?.status === 401) {
    return 'Invalid email or password.'
  }

  if (error.response?.status) {
    return 'Login failed. Please check your credentials and try again.'
  }

  return 'Unable to reach the server. Please try again shortly.'
}
